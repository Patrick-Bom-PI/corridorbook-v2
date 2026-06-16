import { supabase } from './supabase';

// ── Slots ─────────────────────────────────────────────────────
export async function getSlots({ origin, destination, date, cargo_weight_kg }) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .ilike('origin', `%${origin}%`)
    .ilike('destination', `%${destination}%`)
    .gte('departure_at', startOfDay.toISOString())
    .lte('departure_at', endOfDay.toISOString())
    .gte('remaining_kg', cargo_weight_kg)
    .eq('status', 'active');

  if (error) throw error;
  return data || [];
}

export async function getMySlots() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('operator_id', user.id)
    .order('departure_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createSlot(slotData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');
  const { data, error } = await supabase
    .from('slots')
    .insert({ ...slotData, operator_id: user.id, status: 'active' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Bookings ──────────────────────────────────────────────────
export async function confirmBooking({ slot, cargo_weight_kg }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');

  const ref = 'CB-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  const totalPrice = Math.round(slot.price_per_tonne * cargo_weight_kg / 1000);

  const { data, error } = await supabase.from('bookings').insert({
    reference:        ref,
    forwarder_id:     user.id,
    slot_id:          slot.id,
    operator_id:      slot.operator_id,
    operator_name:    slot.operator_name,
    mode:             slot.mode,
    origin:           slot.origin,
    destination:      slot.destination,
    departure_at:     slot.departure_at,
    arrival_at:       slot.arrival_at,
    cargo_weight_kg:  cargo_weight_kg,
    price_per_tonne:  slot.price_per_tonne,
    total_price:      totalPrice,
    co2_per_tonne_km: slot.co2_per_tonne_km,
    status:           'confirmed',
  }).select().single();

  if (error) throw error;

  // Decrement slot capacity
  const { data: slotRow } = await supabase
    .from('slots').select('remaining_kg').eq('id', slot.id).single();
  if (slotRow && slotRow.remaining_kg >= cargo_weight_kg) {
    await supabase.from('slots')
      .update({ remaining_kg: slotRow.remaining_kg - cargo_weight_kg })
      .eq('id', slot.id);
  }

  return data;
}

export async function getMyBookings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('forwarder_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getOperatorBookings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('operator_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Scoring algorithm ─────────────────────────────────────────
export function scoreSlots(slots, { sortMode = 'default', cargo_weight_kg = 24000 } = {}) {
  if (!slots.length) return [];

  const ROAD_CO2 = 0.096;

  const withMetrics = slots.map(s => {
    const dep = new Date(s.departure_at);
    const arr = new Date(s.arrival_at);
    const transitH = (arr - dep) / 3600000;
    const totalPrice = Math.round(s.price_per_tonne * cargo_weight_kg / 1000);
    const distKm = 90;
    const weightT = cargo_weight_kg / 1000;
    const co2Saved = Math.round((ROAD_CO2 - s.co2_per_tonne_km) * weightT * distKm);
    return { ...s, transitH, totalPrice, co2Saved };
  });

  // Normalise 0-1 (lower price = higher score, lower co2 = higher score, lower transit = higher score)
  const prices   = withMetrics.map(s => s.totalPrice);
  const co2s     = withMetrics.map(s => s.co2_per_tonne_km);
  const transits = withMetrics.map(s => s.transitH);
  const norm = (val, arr) => {
    const min = Math.min(...arr), max = Math.max(...arr);
    return max === min ? 1 : 1 - (val - min) / (max - min);
  };

  const weights = sortMode === 'cheap'
    ? { price: 0.7, co2: 0.2, speed: 0.1 }
    : sortMode === 'fast'
    ? { price: 0.25, co2: 0.15, speed: 0.6 }
    : sortMode === 'eco'
    ? { price: 0.2, co2: 0.7, speed: 0.1 }
    : { price: 0.4, co2: 0.4, speed: 0.2 };

  const scored = withMetrics.map(s => ({
    ...s,
    score: weights.price * norm(s.totalPrice, prices)
         + weights.co2   * norm(s.co2_per_tonne_km, co2s)
         + weights.speed * norm(s.transitH, transits),
  }));

  return scored.sort((a, b) => b.score - a.score);
}

// ── Feedback ──────────────────────────────────────────────────
export async function submitFeedback({ answer, booking_ref }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');
  const { data, error } = await supabase.from('feedback').insert({
    answer,
    booking_ref: booking_ref || null,
    forwarder_id: user.id,
  }).select();
  if (error) {
    console.error('[CB] submitFeedback error:', error);
    throw error;
  }
  return data;
}

export async function getFeedback() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ── Search logging ────────────────────────────────────────────
export async function logSearch({ origin, destination, date, cargo_weight_kg, results_barge, results_rail, results_road }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('searches').insert({
    forwarder_id:   user.id,
    origin,
    destination,
    requested_date: date,
    cargo_weight_kg,
    results_barge:  results_barge || 0,
    results_rail:   results_rail  || 0,
    results_road:   results_road  || 0,
  }).then(() => {});
}

// ── Platform stats ───────────────────────────────────────────
export async function getStats() {
  const [slotsRes, bookingsRes] = await Promise.all([
    supabase.from('slots').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('bookings').select('id', { count: 'exact' }),
  ]);
  return {
    activeSlots:   slotsRes.count   || 0,
    totalBookings: bookingsRes.count || 0,
  };
}

// ── Auth helpers ──────────────────────────────────────────────
export async function registerUser({ email, password, company_name, user_type, modality }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    await supabase.from('profiles').insert({
      id:           data.user.id,
      company_name,
      user_type,
      modality:     modality || null,
    });
  }
  return data;
}