'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { submitFeedback } from '@/lib/api';
import styles from './booking.module.css';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
    + ' · ' + new Date(dt).toLocaleTimeString('nl-NL', { hour:'2-digit', minute:'2-digit' });
}

const MODE_COLOURS = {
  barge: { bg:'#E3F2FD', color:'#1565C0', label:'Inland Waterway' },
  rail:  { bg:'#EDE7F6', color:'#4527A0', label:'Freight Train'   },
  road:  { bg:'#FBE9E7', color:'#BF360C', label:'HGV Transport'   },
};

const ModeIcon = ({ mode, color }) => {
  if (mode === 'barge') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M3 17h18l-2 3H5l-2-3z"/><path d="M5 17V11h14v6"/><rect x="7" y="5" width="4" height="6" rx="0.5"/><rect x="13" y="5" width="4" height="6" rx="0.5"/></svg>;
  if (mode === 'rail')  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><rect x="2" y="4" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M7 4v6"/><path d="M17 4v6"/></svg>;
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M1 3h13v13H1z"/><path d="M14 7h3.5L21 11.5V16h-7V7z"/><circle cx="5" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>;
};

function BookingInner() {
  const p       = useSearchParams();
  const router  = useRouter();
  const ref      = p.get('ref')      || '—';
  const mode     = p.get('mode')     || 'barge';
  const origin   = p.get('origin')   || '—';
  const dest     = p.get('dest')     || '—';
  const dep      = p.get('dep')      || '';
  const arr      = p.get('arr')      || '';
  const operator = p.get('operator') || '—';
  const price    = parseInt(p.get('price') || '0');
  const weight   = parseInt(p.get('weight') || '0');
  const co2      = parseFloat(p.get('co2') || '0');
  const ctype    = p.get('ctype')    || '40HC';
  const qty      = p.get('qty')      || '1';

  const ROAD_CO2 = 0.096, DIST_KM = 90;
  const savedKg  = Math.round((ROAD_CO2 - co2) * (weight / 1000) * DIST_KM);
  const savedPct = Math.round((1 - co2 / ROAD_CO2) * 100);
  const mc       = MODE_COLOURS[mode] || MODE_COLOURS.barge;

  const [feedback, setFeedback]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleFeedback(answer) {
    setSubmitting(true);
    setFeedback(answer);
    try { await submitFeedback({ answer, booking_ref: ref }); } catch(e) {}
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <>
      <Nav />
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.checkIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h1 className={styles.title}>Booking confirmed</h1>
            <div className={styles.refCode}>{ref}</div>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left — booking details */}
          <div>
            <div className={styles.card}>
              <div className={styles.modeHead}>
                <div className={styles.modeIconBox} style={{background: mc.bg}}>
                  <ModeIcon mode={mode} color={mc.color} />
                </div>
                <div>
                  <div className={styles.modeName}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</div>
                  <span className={styles.modeBadge} style={{background:mc.bg, color:mc.color}}>{mc.label}</span>
                </div>
                {savedKg > 0 && (
                  <div className="co2-pill" style={{marginLeft:'auto'}}>saves {savedKg}kg CO₂ ({savedPct}% vs road)</div>
                )}
              </div>

              <div className={styles.rows}>
                {[
                  ['Operator',    operator],
                  ['Departure',   fmt(dep)],
                  ['Arrival',     fmt(arr)],
                  ['Origin',      origin],
                  ['Destination', dest],
                ].map(([label, val]) => (
                  <div key={label} className={styles.row}>
                    <span className={styles.rowLabel}>{label}</span>
                    <span className={styles.rowVal}>{val}</span>
                  </div>
                ))}
                <div className={styles.divider}></div>
                {[
                  ['Container',    `${qty}× ${ctype}`],
                  ['Cargo weight', `${weight.toLocaleString()} kg`],
                  ['Total price',  `€${price.toLocaleString()}`],
                ].map(([label, val]) => (
                  <div key={label} className={styles.row}>
                    <span className={styles.rowLabel}>{label}</span>
                    <span className={styles.rowVal} style={label==='Total price'?{fontWeight:800,fontSize:18}:{}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — actions + feedback */}
          <div className={styles.aside}>
            <div className={styles.card}>
              <div className={styles.actions}>
                <button className="btn btn-primary" style={{width:'100%'}} onClick={() => router.push('/tracking')}>View my shipments</button>
                <button className="btn btn-secondary" style={{width:'100%'}} onClick={() => router.push('/search')}>Book another</button>
                <button className="btn btn-secondary" style={{width:'100%'}} onClick={() => window.print()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Feedback prompt */}
            <div className={styles.card}>
              <div className={styles.feedbackTitle}>Would you pay for CorridorBook?</div>
              <div className={styles.feedbackSub}>Takes 5 seconds — helps us validate the concept</div>
              {submitted ? (
                <div className="alert alert-success">Thanks for your feedback!</div>
              ) : (
                <div className={styles.feedbackBtns}>
                  {[
                    { key:'yes-current', label:'Yes, at current pricing', color:'var(--green)' },
                    { key:'yes-lower',   label:'Yes, at a lower price',   color:'var(--blue)'  },
                    { key:'not-yet',     label:'Not yet — missing features', color:'var(--amber)' },
                  ].map(opt => (
                    <button key={opt.key} className={styles.feedbackBtn} style={{borderColor:opt.color, color:opt.color}}
                      onClick={() => handleFeedback(opt.key)} disabled={submitting}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:32,height:32,borderWidth:3}}></div></div>}>
      <BookingInner />
    </Suspense>
  );
}