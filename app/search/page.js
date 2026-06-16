'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useAuthGuard } from '@/components/useAuthGuard';
import { getStats } from '@/lib/api';
import styles from './search.module.css';

const ORIGINS = ['Rotterdam Maasvlakte','Rotterdam Waalhaven','Rotterdam Botlek','Rotterdam ECT Delta'];
const DESTS   = ['Antwerp Deurganck','Antwerp Noord','Antwerp Liefkenshoek','Antwerp Berendrecht'];
const CTYPES  = [
  { value:'20GP', label:"20' General Purpose", kg:22000 },
  { value:'40GP', label:"40' General Purpose", kg:27000 },
  { value:'40HC', label:"40' High Cube",       kg:28800 },
  { value:'45HC', label:"45' High Cube",       kg:29500 },
];

export default function SearchPage() {
  const { loading } = useAuthGuard({ forwarderOnly: true });
  const router = useRouter();
  const [stats, setStats] = useState({ activeSlots: 510, totalBookings: 0 });

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [origin,  setOrigin]  = useState('Rotterdam Maasvlakte');
  const [dest,    setDest]    = useState('Antwerp Deurganck');
  const [date,    setDate]    = useState(defaultDate);
  const [ctype,   setCtype]   = useState('40HC');
  const [qty,     setQty]     = useState(1);
  const [weight,  setWeight]  = useState(28800);
  const [error,   setError]   = useState('');

  function handleCtype(val) {
    setCtype(val);
    const ct = CTYPES.find(c => c.value === val);
    if (ct) setWeight(ct.kg * qty);
  }

  function handleQty(val) {
    const n = Math.max(1, parseInt(val) || 1);
    setQty(n);
    const ct = CTYPES.find(c => c.value === ctype);
    if (ct) setWeight(ct.kg * n);
  }

  function handleSwap() {
    const tmp = origin;
    setOrigin(dest.replace('Antwerp', 'Rotterdam').replace('Deurganck','Maasvlakte').replace('Noord','Waalhaven').replace('Liefkenshoek','Botlek').replace('Berendrecht','ECT Delta'));
    setDest('Antwerp Deurganck');
  }

  function handleSearch(e) {
    e.preventDefault();
    if (!origin || !dest || !date) { setError('Please fill in all fields.'); return; }
    const params = new URLSearchParams({ origin, dest, date, weight: String(weight), ctype, qty: String(qty) });
    router.push('/results?' + params.toString());
  }

  if (loading) return <div className={styles.loading}><div className="spinner" style={{borderTopColor:'#4DA3FF',borderColor:'rgba(77,163,255,0.2)',width:32,height:32,borderWidth:3}}></div></div>;

  return (
    <>
      <Nav />
      <style>{'.nav { border-bottom: 1px solid rgba(255,255,255,0.1) !important; }'}</style>
      <div className={styles.page}>
        <div className={styles.inner}>
          {/* Left — hero text */}
          <div>
            <div className={styles.heroPill}>
              <div className={styles.heroPillDot}></div>
              <span className={styles.heroPillText}>Live Corridor Capacity</span>
            </div>
            <div className={styles.heroH1}>Every mode.<br/><span>Booked in</span><br/>seconds.</div>
            <p className={styles.heroDesc}>Compare barge, rail and road capacity on the Rotterdam–Antwerp corridor in real time. No quotes, no calls.</p>
            <div className={styles.heroStats}>
              <div className={styles.statItem}><div className={styles.statDot}></div><div className={styles.statText}><strong>{stats.activeSlots}+</strong> live slots</div></div>
              <div className={styles.statItem}><div className={styles.statDot}></div><div className={styles.statText}><strong>{stats.totalBookings}</strong> bookings confirmed</div></div>
              <div className={styles.statItem}><div className={styles.statDot}></div><div className={styles.statText}><strong>90s</strong> average booking time</div></div>
            </div>
          </div>

          {/* Right — search card */}
          <div>
            <div className={styles.card}>
              <div className={styles.cardBody}>
                <form onSubmit={handleSearch}>
                  {/* From / Swap / To */}
                  <div className={styles.fieldRow}>
                    <div className={styles.fieldBox}>
                      <div className={styles.fieldLabel}>From</div>
                      <select className="select" value={origin} onChange={e => setOrigin(e.target.value)}>
                        {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <button type="button" className={styles.swapBtn} onClick={handleSwap}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>
                    </button>
                    <div className={styles.fieldBox}>
                      <div className={styles.fieldLabel}>To</div>
                      <select className="select" value={dest} onChange={e => setDest(e.target.value)}>
                        {DESTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={styles.grid3}>
                    <div>
                      <div className={styles.fieldLabel}>Date</div>
                      <input className="input" type="date" value={date} min={defaultDate} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div>
                      <div className={styles.fieldLabel}>Container</div>
                      <select className="select" value={ctype} onChange={e => handleCtype(e.target.value)}>
                        {CTYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className={styles.fieldLabel}>Qty</div>
                      <input className="input" type="number" min="1" max="50" value={qty} onChange={e => handleQty(e.target.value)} />
                    </div>
                  </div>

                  <div className={styles.weightRow}>
                    <span className={styles.weightLabel}>Total cargo weight</span>
                    <span className={styles.weightValue}>{weight.toLocaleString()} kg</span>
                  </div>

                  {error && <div className="alert alert-error" style={{marginBottom:12}}>{error}</div>}

                  <button className={styles.searchBtn} type="submit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Search available slots
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}