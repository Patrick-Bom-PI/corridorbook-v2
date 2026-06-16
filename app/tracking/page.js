'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useAuthGuard } from '@/components/useAuthGuard';
import { getMyBookings } from '@/lib/api';
import { ModeIcon, MODE_META } from '@/components/ModeIcon';
import styles from './tracking.module.css';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' · ' + new Date(dt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}



export default function TrackingPage() {
  const { profile, loading: authLoading } = useAuthGuard({ forwarderOnly: true });
  const [bookings, setBookings] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      getMyBookings().then(setBookings).catch(() => setBookings([]));
    }
  }, [authLoading]);

  const ROAD_CO2 = 0.096, DIST_KM = 90;

  const totalCO2 = (bookings || []).reduce((sum, b) => {
    const wt = (b.cargo_weight_kg || 0) / 1000;
    return sum + Math.max(0, (ROAD_CO2 - (b.co2_per_tonne_km || ROAD_CO2)) * wt * DIST_KM);
  }, 0);
  const totalSpend = (bookings || []).reduce((s, b) => s + (b.total_price || 0), 0);

  if (authLoading || bookings === null) return (
    <><Nav /><div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:32,height:32,borderWidth:3}}></div>
    </div></>
  );

  return (
    <>
      <Nav />
      <div className="page">
        <div className="page-title">My Shipments</div>
        <div className="page-sub">All confirmed bookings on your account</div>

        <div className="stats-grid" style={{marginBottom:28}}>
          <div className="stat-card">
            <div className="stat-label">Active bookings</div>
            <div className="stat-value" style={{color:'var(--blue)'}}>{bookings.filter(b => b.status === 'confirmed').length}</div>
            <div className="stat-sub">confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CO₂ saved</div>
            <div className="stat-value" style={{color:'var(--green)'}}>
              {totalCO2 >= 1000 ? (totalCO2/1000).toFixed(1)+'t' : Math.round(totalCO2)+'kg'}
            </div>
            <div className="stat-sub">vs road baseline</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total spend</div>
            <div className="stat-value">€{Math.round(totalSpend).toLocaleString('nl-NL')}</div>
            <div className="stat-sub">all bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total bookings</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-sub">all time</div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-title">No shipments yet</div>
              <div className="empty-sub">Your confirmed bookings will appear here.</div>
              <button className="btn btn-primary" style={{marginTop:20}} onClick={() => router.push('/search')}>
                Search slots
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {bookings.map(b => {
              const mc = MODE_META[b.mode] || MODE_META.barge;
              const wt = (b.cargo_weight_kg || 0) / 1000;
              const savedKg = Math.round((ROAD_CO2 - (b.co2_per_tonne_km || ROAD_CO2)) * wt * DIST_KM);
              return (
                <div key={b.id} className={styles.bookingCard}>
                  <div className={styles.bookingHead}>
                    <div className={styles.bookingMode}>
                      <ModeIcon mode={b.mode} color={mc.color} size={18} />
                      <span className={styles.modeName}>{b.mode.charAt(0).toUpperCase() + b.mode.slice(1)}</span>
                      <span className="mode-badge" style={{background: mc.bg, color: mc.color}}>{b.mode}</span>
                    </div>
                    <div className={styles.bookingRef}>{b.reference}</div>
                    <span className="status-badge status-confirmed">{b.status}</span>
                  </div>

                  <div className={styles.bookingBody}>
                    <div className={styles.bookingRoute}>
                      <span><strong>RTM</strong> {b.origin}</span>
                      <span className={styles.arrow}>→</span>
                      <span><strong>ANR</strong> {b.destination}</span>
                    </div>
                    <div className={styles.bookingMeta}>
                      <span>{fmt(b.departure_at)}</span>
                      <span>·</span>
                      <span>{b.operator_name}</span>
                      <span>·</span>
                      <span>{(b.cargo_weight_kg || 0).toLocaleString()} kg</span>
                    </div>
                  </div>

                  <div className={styles.bookingFoot}>
                    <div className={styles.bookingPrice}>€{(b.total_price || 0).toLocaleString()}</div>
                    {savedKg > 0 && (
                      <div className="co2-pill">saves {savedKg}kg CO₂</div>
                    )}
                    <div style={{fontSize:11,color:'var(--grey-label)',marginLeft:'auto'}}>
                      Booked {new Date(b.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short'})}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}