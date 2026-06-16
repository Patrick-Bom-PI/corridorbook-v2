'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import { useAuthGuard } from '@/components/useAuthGuard';
import { getMyBookings } from '@/lib/api';
import { ModeIcon, MODE_META } from '@/components/ModeIcon';
import styles from './forwarder.module.css';

const ROAD_CO2 = 0.096, DIST_KM = 90;


export default function ForwarderPortalPage() {
  const { profile, loading: authLoading } = useAuthGuard({ forwarderOnly: true });
  const [bookings, setBookings] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      getMyBookings().then(setBookings).catch(() => setBookings([]));
    }
  }, [authLoading]);

  const confirmed  = (bookings || []).filter(b => b.status === 'confirmed');
  const totalCO2   = (bookings || []).reduce((s, b) => {
    const wt = (b.cargo_weight_kg || 0) / 1000;
    return s + Math.max(0, (ROAD_CO2 - (b.co2_per_tonne_km || ROAD_CO2)) * wt * DIST_KM);
  }, 0);
  const totalSpend = (bookings || []).reduce((s, b) => s + (b.total_price || 0), 0);

  if (authLoading) return null;

  return (
    <>
      <Nav />
      <div className="page">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <div className="page-title">Forwarder Portal</div>
          <button className="btn btn-primary" onClick={() => router.push('/search')}>🔍 Search slots</button>
        </div>
        <div className="page-sub">Welcome back, {profile?.company_name}</div>

        <div className="stats-grid" style={{marginBottom:28}}>
          <div className="stat-card">
            <div className="stat-label">Active bookings</div>
            <div className="stat-value" style={{color:'var(--blue)'}}>{confirmed.length}</div>
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
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-title">Recent bookings</div>
            <button className="btn btn-secondary" style={{fontSize:12,height:32,padding:'0 12px'}} onClick={() => router.push('/tracking')}>View all</button>
          </div>
          <div className="section-body">
            {bookings === null ? (
              <div style={{textAlign:'center',padding:20}}><div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:24,height:24,borderWidth:2,margin:'0 auto'}}></div></div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <div className="empty-title">No bookings yet</div>
                <div className="empty-sub">Search available slots to make your first booking.</div>
                <button className="btn btn-primary" style={{marginTop:16}} onClick={() => router.push('/search')}>Search slots</button>
              </div>
            ) : (
              <div className={styles.list}>
                {bookings.slice(0, 5).map(b => {
                  const mc = MODE_META[b.mode] || MODE_META.barge;
                  return (
                    <div key={b.id} className={styles.row}>
                      <ModeIcon mode={b.mode} color={mc.color} size={18} />
                      <div className={styles.rowInfo}>
                        <div style={{fontWeight:700,fontSize:14}}>{b.origin} → {b.destination}</div>
                        <div style={{fontSize:12,color:'var(--grey-label)'}}>
                          {new Date(b.departure_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})} · {b.operator_name}
                        </div>
                      </div>
                      <div className={styles.rowRef}>{b.reference}</div>
                      <div style={{fontWeight:700,fontSize:15}}>€{(b.total_price||0).toLocaleString()}</div>
                      <span className="status-badge status-confirmed">{b.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}