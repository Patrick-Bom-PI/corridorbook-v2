'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Nav from '@/components/Nav';
import { useAuthGuard } from '@/components/useAuthGuard';
import { getSlots, scoreSlots, logSearch } from '@/lib/api';
import styles from './results.module.css';

const ROAD_CO2 = 0.096;
const DIST_KM  = 90;

function fmt(dt) {
  return new Date(dt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(dt) {
  return new Date(dt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ModeCard({ slots: modeSlots, weightKg, recommended, onSelect, selected }) {
  const [open, setOpen] = React.useState(true);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const slot = modeSlots && modeSlots[activeIdx] ? modeSlots[activeIdx] : modeSlots && modeSlots[0];

  if (!modeSlots || modeSlots.length === 0) return (
    <div className={`${styles.card} ${styles.cardEmpty}`}>
      <div className={styles.emptyMode}>No slots available</div>
    </div>
  );

  const totalPrice  = Math.round(slot.price_per_tonne * weightKg / 1000);
  const dep         = new Date(slot.departure_at);
  const arr         = new Date(slot.arrival_at);
  const transitH    = Math.round((arr - dep) / 3.6e6);
  const weightT     = weightKg / 1000;
  const savedKg     = Math.round((ROAD_CO2 - slot.co2_per_tonne_km) * weightT * DIST_KM);
  const savedPct    = Math.round((1 - slot.co2_per_tonne_km / ROAD_CO2) * 100);
  const isRoad      = slot.mode === 'road';

  const modeColours = {
    barge: { bg: '#E3F2FD', color: '#1565C0', label: 'Inland Waterway' },
    rail:  { bg: '#EDE7F6', color: '#4527A0', label: 'Freight Train' },
    road:  { bg: '#FBE9E7', color: '#BF360C', label: 'HGV Transport' },
  };
  const mc = modeColours[slot.mode] || modeColours.road;

  const ModeIcon = () => {
    if (slot.mode === 'barge') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={mc.color} strokeWidth="1.8"><path d="M3 17h18l-2 3H5l-2-3z"/><path d="M5 17V11h14v6"/><rect x="7" y="5" width="4" height="6" rx="0.5"/><rect x="13" y="5" width="4" height="6" rx="0.5"/></svg>;
    if (slot.mode === 'rail')  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={mc.color} strokeWidth="1.8"><rect x="2" y="4" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M7 4v6"/><path d="M17 4v6"/></svg>;
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={mc.color} strokeWidth="1.8"><path d="M1 3h13v13H1z"/><path d="M14 7h3.5L21 11.5V16h-7V7z"/><circle cx="5" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>;
  };

  return (
    <div className={`${styles.card} ${selected ? styles.cardSelected : ''}`} onClick={() => onSelect(slot)}>
      {recommended && (
        <div className={styles.recBadge}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#F57F17" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          RECOMMENDED
        </div>
      )}
      <div className={styles.cardHead}>
        <div className={styles.modeIcon} style={{background: mc.bg + '60', borderRadius: 8, padding: 6}}>
          <ModeIcon />
        </div>
        <div>
          <div className={styles.modeName}>{slot.mode.charAt(0).toUpperCase() + slot.mode.slice(1)}</div>
          <span className={styles.modeBadge} style={{ background: mc.bg, color: mc.color }}>{mc.label}</span>
        </div>
        {!isRoad && savedKg > 0 && (
          <div className="co2-pill" style={{ marginLeft: 'auto' }}>
            saves {savedKg}kg CO₂
          </div>
        )}
        {isRoad && <div className={styles.baseline} style={{ marginLeft: 'auto' }}>CO₂ baseline</div>}
      </div>

      <div className={styles.timeline}>
        <div className={styles.timeVal}>{fmt(slot.departure_at)}</div>
        <div className={styles.timeBar}>
          <div className={styles.timeBarFill} style={{ background: mc.color }}></div>
          <div className={styles.timeDur}>{transitH}h transit</div>
        </div>
        <div className={styles.timeVal}>{fmt(slot.arrival_at)}</div>
      </div>

      <div className={styles.route}>
        <span><strong>RTM</strong> {slot.origin}</span>
        <span><strong>ANR</strong> {slot.destination}</span>
      </div>

      <div className={styles.opTag}>{slot.operator_name}</div>

      {/* Departure accordion */}
      {modeSlots.length > 1 && (
        <div className={styles.slotSelector} style={{marginBottom:16}}>
          <div className={styles.slotHeader} onClick={e => { e.stopPropagation(); setOpen(o => !o); }}>
            <div className={styles.slotHeaderLeft}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              CHOOSE DEPARTURE
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {open && (
            <div className={styles.slotRows}>
              {modeSlots.map((sl, si) => {
                const slPrice = Math.round(sl.price_per_tonne * weightKg / 1000);
                const slDep   = new Date(sl.departure_at).toLocaleTimeString('nl-NL', {hour:'2-digit',minute:'2-digit'});
                return (
                  <div key={sl.id} className={`${styles.slotRow} ${si === activeIdx ? styles.slotRowActive : ''}`}
                    onClick={e => { e.stopPropagation(); setActiveIdx(si); onSelect(sl); }}>
                    <div className={`${styles.slotRadio} ${si === activeIdx ? styles.slotRadioActive : ''}`}></div>
                    <div className={styles.slotTime}>{slDep}</div>
                    <div style={{flex:1}}>
                      <div className={styles.slotOp}>{sl.operator_name}</div>
                    </div>
                    <div className={`${styles.slotPrice} ${si === activeIdx ? styles.slotPriceActive : ''}`}>€{slPrice.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className={styles.cardFoot}>
        <div className={styles.price}>€{totalPrice.toLocaleString()}</div>
        <button
          className={`btn ${selected ? 'btn-secondary' : 'btn-primary'}`}
          onClick={e => { e.stopPropagation(); onSelect(slot); }}
        >
          {selected ? '✓ Selected' : 'Select & Book'}
        </button>
      </div>
    </div>
  );
}

function ResultsInner() {
  const { profile, loading: authLoading } = useAuthGuard({ forwarderOnly: true });
  const searchParams = useSearchParams();
  const router = useRouter();

  const origin   = searchParams.get('origin') || 'Rotterdam Maasvlakte';
  const dest     = searchParams.get('dest')   || 'Antwerp Deurganck';
  const date     = searchParams.get('date')   || new Date().toISOString().split('T')[0];
  const weightKg = parseInt(searchParams.get('weight') || '24000');
  const ctype    = searchParams.get('ctype')  || '40HC';
  const qty      = searchParams.get('qty')    || '1';

  const [slots, setSlots]       = useState(null); // null = loading
  const [sortMode, setSortMode] = useState('default');
  const [selected, setSelected] = useState(null);
  const [error, setError]       = useState('');

  const loadSlots = useCallback(async () => {
    try {
      const raw = await getSlots({
        origin:    origin.split(' ')[0],
        destination: dest.split(' ')[0],
        date,
        cargo_weight_kg: weightKg,
      });
      const scored = scoreSlots(raw, { sortMode, cargo_weight_kg: weightKg });
      setSlots(scored);

      // Log the search with per-mode result counts
      logSearch({
        origin:        origin.split(' ')[0],
        destination:   dest.split(' ')[0],
        date,
        cargo_weight_kg: weightKg,
        results_barge: raw.filter(s => s.mode === 'barge').length,
        results_rail:  raw.filter(s => s.mode === 'rail').length,
        results_road:  raw.filter(s => s.mode === 'road').length,
      });
    } catch (e) {
      setError('Could not load slots: ' + e.message);
      setSlots([]);
    }
  }, [origin, dest, date, weightKg, sortMode]);

  useEffect(() => {
    if (!authLoading) loadSlots();
  }, [authLoading, loadSlots]);

  function getCardSlot(mode) {
    if (!slots) return undefined;
    return slots.find(s => s.mode === mode) || null;
  }

  function getBestSlot() {
    if (!slots || !slots.length) return null;
    return slots.filter(s => s.mode !== 'road')[0] || slots[0];
  }

  function handleSelect(slot) {
    setSelected(slot);
    const totalPrice = Math.round(slot.price_per_tonne * weightKg / 1000);
    const params = new URLSearchParams({
      mode:     slot.mode,
      slotId:   slot.id,
      origin,
      dest,
      date,
      weight:   String(weightKg),
      price:    String(totalPrice),
      operator: slot.operator_name,
      dep:      slot.departure_at,
      arr:      slot.arrival_at,
      co2:      String(slot.co2_per_tonne_km),
      ppt:      String(slot.price_per_tonne),
      opId:     slot.operator_id || '',
      ctype, qty,
    });
    router.push('/confirmation?' + params.toString());
  }

  const SORT_TABS = [
    { key: 'default', label: 'Best balance' },
    { key: 'cheap',   label: 'Cheapest' },
    { key: 'fast',    label: 'Fastest' },
    { key: 'eco',     label: 'Lowest CO₂' },
  ];

  const bestSlot = getBestSlot();

  if (authLoading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:32,height:32,borderWidth:3}}></div>
    </div>
  );

  return (
    <>
      <header className="results-header">
        <a href="/search" className="results-brand">Corridor<span>Book</span></a>
        <div className="results-header-right">
          <a href="/tracking" style={{fontSize:13,color:'var(--grey-label)',fontWeight:500,textDecoration:'none'}}>My Shipments</a>
          <div className="step-pill"><div className="step-dot"></div>Step 1 of 2 · Select transport mode</div>
        </div>
      </header>
      <div className={styles.page}>
        {/* Search bar */}
        <div className={styles.searchBar}>
          <div className={styles.searchPills}>
            <span className={styles.pill}>{origin.split(' ')[0]} → {dest.split(' ')[0]}</span>
            <span className={styles.pill}>{fmtDate(date + 'T12:00:00')}</span>
            <span className={styles.pill}>{weightKg.toLocaleString()} kg · {qty}× {ctype}</span>
          </div>
          <button className="btn btn-secondary" style={{fontSize:12,height:32,padding:'0 12px'}} onClick={() => router.push('/search')}>
            Edit search
          </button>
        </div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          {slots === null ? (
            <span>Loading live slots…</span>
          ) : slots.length === 0 ? (
            <span className={styles.noSlots}>No slots found for this date. Try another date.</span>
          ) : (
            <span><strong style={{color:'#2E7D32'}}>● </strong>{slots.length} live slot{slots.length !== 1 ? 's' : ''} available · sorted by {SORT_TABS.find(t => t.key === sortMode)?.label.toLowerCase()}</span>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Sort tabs */}
        <div className={styles.sortTabs}>
          {SORT_TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.sortTab} ${sortMode === t.key ? styles.sortTabActive : ''}`}
              onClick={() => setSortMode(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Mode cards — ordered by current sort winner */}
        <div className={styles.cards}>
          {((() => {
            if (!slots || slots.length === 0) return ['barge','rail','road'];
            // Pick best slot per mode
            const byMode = {};
            ['barge','rail','road'].forEach(m => {
              const ms = slots.filter(s => s.mode === m);
              byMode[m] = ms.length > 0 ? ms[0] : null;
            });
            // Order modes by their best slot score (winner first)
            const order = ['barge','rail','road'].filter(m => byMode[m])
              .sort((a,b) => (byMode[b]?.score||0) - (byMode[a]?.score||0));
            // Add missing modes at end
            ['barge','rail','road'].forEach(m => { if (!order.includes(m)) order.push(m); });
            // Winner is highest scoring non-road, or highest overall
            const winner = order.find(m => m !== 'road') || order[0];
            return order.map(mode => {
              const modeSlots = slots ? slots.filter(s => s.mode === mode) : [];
              const topSlot   = modeSlots[0];
              return (
                <ModeCard
                  key={mode}
                  slots={modeSlots}
                  weightKg={weightKg}
                  recommended={mode === winner && mode !== 'road'}
                  selected={selected?.mode === mode}
                  onSelect={handleSelect}
                />
              );
            });
          })())}
        </div>
      </div>
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:32,height:32,borderWidth:3}}></div></div>}>
      <ResultsInner />
    </Suspense>
  );
}