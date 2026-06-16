'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useAuthGuard } from '@/components/useAuthGuard';
import { confirmBooking } from '@/lib/api';
import { ModeIcon } from '@/components/ModeIcon';
import styles from './confirmation.module.css';

const HOLD_MINUTES = 20;

function fmt(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    + ' · ' + d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

function Timer({ startTime }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const left    = HOLD_MINUTES * 60 - elapsed;
      if (left <= 0) { setRemaining('Expired'); return; }
      const m = Math.floor(left / 60);
      const s = Math.floor(left % 60);
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return <span className={styles.timerVal}>{remaining}</span>;
}

function ConfirmationInner() {
  const { profile, loading: authLoading } = useAuthGuard({ forwarderOnly: true });
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode     = searchParams.get('mode') || 'barge';
  const slotId   = searchParams.get('slotId') || '';
  const origin   = searchParams.get('origin') || '';
  const dest     = searchParams.get('dest') || '';
  const date     = searchParams.get('date') || '';
  const weightKg = parseInt(searchParams.get('weight') || '24000');
  const price    = parseInt(searchParams.get('price') || '0');
  const operator = searchParams.get('operator') || '';
  const dep      = searchParams.get('dep') || '';
  const arr      = searchParams.get('arr') || '';
  const co2      = parseFloat(searchParams.get('co2') || '0');
  const ppt      = parseFloat(searchParams.get('ppt') || '0');
  const opId     = searchParams.get('opId') || null;
  const ctype    = searchParams.get('ctype') || '40HC';
  const qty      = searchParams.get('qty') || '1';

  const [startTime]  = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [ref, setRef]         = useState('');

  const ROAD_CO2 = 0.096;
  const DIST_KM  = 90;
  const weightT  = weightKg / 1000;
  const savedKg  = Math.round((ROAD_CO2 - co2) * weightT * DIST_KM);
  const savedPct = Math.round((1 - co2 / ROAD_CO2) * 100);

  const modeColours = {
    barge: { color: '#1565C0', bg: '#E3F2FD', label: 'Inland Waterway' },
    rail:  { color: '#4527A0', bg: '#EDE7F6', label: 'Freight Train'   },
    road:  { color: '#BF360C', bg: '#FBE9E7', label: 'HGV Transport'   },
  };
  const mc = modeColours[mode] || modeColours.barge;

  async function handleConfirm() {
    setError('');
    setLoading(true);
    try {
      const booking = await confirmBooking({
        slot: {
          id:               slotId,
          operator_id:      opId,
          operator_name:    operator,
          mode,
          origin:           origin.split(' ')[0],
          destination:      dest.split(' ')[0],
          departure_at:     dep,
          arrival_at:       arr,
          price_per_tonne:  ppt,
          co2_per_tonne_km: co2,
        },
        cargo_weight_kg: weightKg,
      });
      setRef(booking.reference);
      setConfirmed(true);
      // Redirect to booking reference page after 1.5s
      setTimeout(() => {
        const params = new URLSearchParams({
          ref: booking.reference, mode, origin, dest,
          dep, arr, operator, price: String(price),
          weight: String(weightKg), co2: String(co2),
          ctype, qty,
        });
        router.push('/booking?' + params.toString());
      }, 1500);
    } catch (e) {
      setError('Booking failed: ' + e.message);
    }
    setLoading(false);
  }

  if (authLoading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  if (confirmed) return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Booking confirmed</h1>
          <div className={styles.successRef}>{ref}</div>
          <p className={styles.successSub}>
            Your {mode} slot from {origin.split(' ')[0]} to {dest.split(' ')[0]} is confirmed.
            {savedKg > 0 && ` You saved ${savedKg}kg CO₂ vs road.`}
          </p>
          <div className={styles.successActions}>
            <button className="btn btn-primary" onClick={() => router.push('/tracking')}>View my shipments</button>
            <button className="btn btn-secondary" onClick={() => router.push('/search')}>Book another</button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => router.back()}>← Back to results</button>
          <div className={styles.step}>Step 2 of 2 · Confirm booking</div>
        </div>

        <div className={styles.grid}>
          {/* Left — booking summary */}
          <div className={styles.summary}>
            <div className={styles.card}>
              <div className={styles.modeHead}>
                <ModeIcon mode={mode} color={mc.color} size={28} />
                <div>
                  <div className={styles.modeName}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</div>
                  <span className={styles.modeBadge} style={{ background: mc.bg, color: mc.color }}>{mc.label}</span>
                </div>
              </div>

              <div className={styles.rows}>
                <div className={styles.row}><span className={styles.rowLabel}>Operator</span><span className={styles.rowVal}>{operator}</span></div>
                <div className={styles.row}><span className={styles.rowLabel}>Departure</span><span className={styles.rowVal}>{fmt(dep)}</span></div>
                <div className={styles.row}><span className={styles.rowLabel}>Arrival</span><span className={styles.rowVal}>{fmt(arr)}</span></div>
                <div className={styles.row}><span className={styles.rowLabel}>Origin</span><span className={styles.rowVal}>{origin}</span></div>
                <div className={styles.row}><span className={styles.rowLabel}>Destination</span><span className={styles.rowVal}>{dest}</span></div>
                <div className={styles.divider}></div>
                <div className={styles.row}><span className={styles.rowLabel}>Container</span><span className={styles.rowVal}>{qty}× {ctype}</span></div>
                <div className={styles.row}><span className={styles.rowLabel}>Cargo weight</span><span className={styles.rowVal}>{weightKg.toLocaleString()} kg</span></div>
                {savedKg > 0 && (
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>CO₂ saving</span>
                    <span className={styles.rowVal} style={{ color: '#2E7D32' }}>−{savedKg}kg ({savedPct}% vs road)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right — price + confirm */}
          <div className={styles.aside}>
            <div className={styles.card}>
              <div className={styles.timerBox}>
                <div className={styles.timerLabel}>Slot held for</div>
                <Timer startTime={startTime} />
                <div className={styles.timerSub}>minutes · complete your booking</div>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Total price</span>
                <span className={styles.price}>€{price.toLocaleString()}</span>
              </div>
              <div className={styles.priceSub}>Based on {weightKg.toLocaleString()} kg at €{ppt}/tonne</div>

              {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

              <button
                className="btn btn-primary"
                style={{ width: '100%', height: 52, fontSize: 16, marginTop: 16 }}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? <><span className="spinner"></span> Confirming…</> : `Confirm & pay · €${price.toLocaleString()}`}
              </button>

              <p className={styles.terms}>
                By confirming you agree to the CorridorBook booking terms. Rates are indicative until confirmed by the operator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:32,height:32,borderWidth:3}}></div></div>}>
      <ConfirmationInner />
    </Suspense>
  );
}