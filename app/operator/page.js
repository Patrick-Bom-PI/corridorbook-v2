'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { useAuthGuard } from '@/components/useAuthGuard';
import { getMySlots, createSlot, getOperatorBookings } from '@/lib/api';
import { ModeIcon, MODE_META } from '@/components/ModeIcon';
import { supabase } from '@/lib/supabase';
import styles from './operator.module.css';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    + ' ' + new Date(dt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

export default function OperatorPage() {
  const { profile, loading: authLoading } = useAuthGuard({ operatorOnly: true });
  const [tab, setTab]           = useState('slots');
  const [slots, setSlots]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [demands, setDemands]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState('');

  const [form, setForm] = useState({
    mode: 'barge', origin: 'Rotterdam', destination: 'Antwerp',
    departure_at: '', arrival_at: '',
    capacity_kg: 50000, remaining_kg: 50000,
    price_per_tonne: 18, co2_per_tonne_km: 0.031,
    operator_name: '',
  });

  useEffect(() => {
    if (!authLoading && profile) {
      setForm(f => ({ ...f, operator_name: profile.company_name || '' }));
      loadAll();
    }
  }, [authLoading, profile]);

  async function loadAll() {
    setLoading(true);
    const [s, b] = await Promise.all([getMySlots(), getOperatorBookings()]);
    setSlots(s);
    setBookings(b);
    // Load demand signals
    const { data } = await supabase.from('searches')
      .select('origin, destination, requested_date, results_barge, results_rail, results_road')
      .or('results_barge.eq.0,results_rail.eq.0')
      .order('created_at', { ascending: false })
      .limit(20);
    setDemands(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSlot({
        ...form,
        capacity_kg:   parseInt(form.capacity_kg),
        remaining_kg:  parseInt(form.capacity_kg),
        price_per_tonne: parseFloat(form.price_per_tonne),
        co2_per_tonne_km: parseFloat(form.co2_per_tonne_km),
        source: 'operator',
      });
      showToast('Slot published successfully');
      setShowForm(false);
      loadAll();
    } catch (e) {
      showToast('Failed: ' + e.message, true);
    }
    setSubmitting(false);
  }

  function showToast(msg, err = false) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const totalCapacity = slots.reduce((s, sl) => s + (sl.capacity_kg || 0), 0);
  const totalBooked   = bookings.reduce((s, b) => s + (b.cargo_weight_kg || 0), 0);
  const revenue       = bookings.reduce((s, b) => s + (b.total_price || 0), 0);

  if (authLoading) return null;

  return (
    <>
      <Nav variant="operator" />
      <div className="page">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <div className="page-title">Operator Portal</div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Publish slot'}
          </button>
        </div>
        <div className="page-sub">Manage your capacity on the Rotterdam–Antwerp corridor</div>

        {/* Slot submission form */}
        {showForm && (
          <div className="card" style={{marginBottom:24}}>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:20}}>Publish new slot</h3>
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:16}}>
                <div className="form-group">
                  <label className="label">Mode</label>
                  <select className="select" value={form.mode} onChange={e => {
                    const co2 = e.target.value === 'barge' ? 0.031 : e.target.value === 'rail' ? 0.018 : 0.096;
                    setForm({...form, mode: e.target.value, co2_per_tonne_km: co2});
                  }}>
                    <option value="barge">Barge</option>
                    <option value="rail">Rail</option>
                    <option value="road">Road</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Departure</label>
                  <input className="input" type="datetime-local" value={form.departure_at} onChange={e => setForm({...form, departure_at: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">Arrival</label>
                  <input className="input" type="datetime-local" value={form.arrival_at} onChange={e => setForm({...form, arrival_at: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">Capacity (kg)</label>
                  <input className="input" type="number" value={form.capacity_kg} onChange={e => setForm({...form, capacity_kg: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">Price per tonne (€)</label>
                  <input className="input" type="number" step="0.01" value={form.price_per_tonne} onChange={e => setForm({...form, price_per_tonne: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="label">CO₂ per tonne-km</label>
                  <input className="input" type="number" step="0.001" value={form.co2_per_tonne_km} onChange={e => setForm({...form, co2_per_tonne_km: e.target.value})} required />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Publishing…' : 'Publish slot'}
              </button>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{marginBottom:24}}>
          <div className="stat-card">
            <div className="stat-label">Active slots</div>
            <div className="stat-value" style={{color:'var(--blue)'}}>{slots.filter(s => s.status === 'active').length}</div>
            <div className="stat-sub">published</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total bookings</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-sub">confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total revenue</div>
            <div className="stat-value">€{Math.round(revenue).toLocaleString()}</div>
            <div className="stat-sub">from bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Demand signals</div>
            <div className="stat-value" style={{color:'var(--amber)'}}>{demands.length}</div>
            <div className="stat-sub">zero-result searches</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['slots','bookings','demands'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'slots' ? 'My Slots' : t === 'bookings' ? 'Bookings' : 'Demand Signals'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:40}}><div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:28,height:28,borderWidth:3,margin:'0 auto'}}></div></div>
        ) : tab === 'slots' ? (
          slots.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📦</div><div className="empty-title">No slots yet</div><div className="empty-sub">Publish your first slot using the button above.</div></div>
          ) : (
            <div className={styles.slotList}>
              {slots.map(s => (
                <div key={s.id} className={styles.slotCard}>
                  <div className={styles.slotHead}>
                    <ModeIcon mode={s.mode} color={MODE_META[s.mode]?.color || '#6C757D'} size={16} />
                    <span className={styles.slotMode}>{s.mode}</span>
                    <span className={`status-badge ${s.status === 'active' ? 'status-confirmed' : 'status-cancelled'}`}>{s.status}</span>
                    <span style={{marginLeft:'auto',fontSize:12,color:'var(--grey-label)'}}>Dep: {fmt(s.departure_at)}</span>
                  </div>
                  <div className={styles.slotBody}>
                    <span>Remaining: <strong>{(s.remaining_kg || 0).toLocaleString()} kg</strong></span>
                    <span>€{s.price_per_tonne}/t</span>
                    <span>CO₂: {s.co2_per_tonne_km} kg/t-km</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'bookings' ? (
          bookings.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No bookings yet</div><div className="empty-sub">Bookings from forwarders will appear here.</div></div>
          ) : (
            <div className={styles.slotList}>
              {bookings.map(b => (
                <div key={b.id} className={styles.slotCard}>
                  <div className={styles.slotHead}>
                    <span className={styles.slotMode} style={{fontFamily:'var(--font-mono)',color:'var(--blue)'}}>{b.reference}</span>
                    <span className="status-badge status-confirmed">{b.status}</span>
                    <span style={{marginLeft:'auto',fontSize:12,color:'var(--grey-label)'}}>
                      {new Date(b.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                    </span>
                  </div>
                  <div className={styles.slotBody}>
                    <span>{b.origin} → {b.destination}</span>
                    <span>{(b.cargo_weight_kg||0).toLocaleString()} kg</span>
                    <span style={{fontWeight:700}}>€{(b.total_price||0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          demands.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📡</div><div className="empty-title">No demand signals yet</div><div className="empty-sub">Zero-result forwarder searches will appear here.</div></div>
          ) : (
            <div className={styles.slotList}>
              {demands.map((d, i) => (
                <div key={i} className={styles.slotCard}>
                  <div className={styles.slotHead}>
                    <span style={{fontSize:13,fontWeight:600}}>{d.origin} → {d.destination}</span>
                    <span style={{marginLeft:'auto',fontSize:12,color:'var(--grey-label)'}}>{d.requested_date}</span>
                  </div>
                  <div className={styles.slotBody}>
                    <span style={{color:'var(--amber)',fontWeight:600}}>
                      Barge: {d.results_barge} · Rail: {d.results_rail} · Road: {d.results_road} slots found
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {toast && <div className="toast success">{toast}</div>}
    </>
  );
}