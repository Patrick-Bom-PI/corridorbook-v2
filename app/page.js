'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { registerUser } from '@/lib/api';
import styles from './page.module.css';

// SVG icons matching original HTML exactly
const IconBarge = ({size=15, stroke='#4DA3FF'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
    <path d="M3 17h18l-2 3H5l-2-3z"/><path d="M5 17V11h14v6"/>
    <rect x="7" y="5" width="4" height="6" rx="0.5"/><rect x="13" y="5" width="4" height="6" rx="0.5"/>
  </svg>
);
const IconRail = ({size=15, stroke='#9C64F0'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
    <rect x="2" y="4" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M7 4v6"/><path d="M17 4v6"/>
  </svg>
);
const IconRoad = ({size=15, stroke='#637080'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
    <path d="M1 3h13v13H1z"/><path d="M14 7h3.5L21 11.5V16h-7V7z"/>
    <circle cx="5" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
  </svg>
);
const IconForwarder = ({stroke='#1565C0'}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconOperator = ({stroke='#6C757D'}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
    <path d="M3 17h18l-2 3H5l-2-3z"/><path d="M5 17V11h14v6"/>
    <rect x="7" y="5" width="4" height="6" rx="0.5"/><rect x="13" y="5" width="4" height="6" rx="0.5"/>
  </svg>
);

export default function Home() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const [role, setRole]           = useState('forwarder');
  const [tab, setTab]             = useState('login');
  const [regRole, setRegRole]     = useState('forwarder');
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError]       = useState('');
  const [loginLoading, setLoginLoading]   = useState(false);
  const [regCompany, setRegCompany]   = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regModality, setRegModality] = useState('barge');
  const [regError, setRegError]       = useState('');
  const [regSuccess, setRegSuccess]   = useState('');
  const [regLoading, setRegLoading]   = useState(false);

  useEffect(() => {
    if (!loading && session && profile)
      router.push(profile.user_type === 'operator' ? '/operator' : '/search');
  }, [session, profile, loading, router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(''); setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoginLoading(false);
    if (error) setLoginError('Invalid email or password.');
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegError(''); setRegSuccess('');
    if (!regCompany || !regEmail || !regPassword) { setRegError('Please fill in all fields.'); return; }
    setRegLoading(true);
    try {
      await registerUser({ email: regEmail, password: regPassword, company_name: regCompany, user_type: regRole, modality: regRole === 'operator' ? regModality : null });
      setRegSuccess('Account created! Check your email to confirm, then sign in.');
    } catch (err) { setRegError(err.message || 'Registration failed.'); }
    setRegLoading(false);
  }

  if (loading) return <div className={styles.loading}><div className="spinner" style={{borderTopColor:'#4DA3FF',borderColor:'rgba(77,163,255,0.2)',width:32,height:32,borderWidth:3}}></div></div>;

  return (
    <div className={styles.root}>
      {/* ── Left panel ── */}
      <div className={styles.left}>
        <div className={styles.leftBg}></div>
        <div className={styles.leftOverlay}></div>
        <a href="/" className={styles.brand}>Corridor<span>Book</span></a>

        {/* Role toggle */}
        <div className={styles.roleToggle}>
          <button className={`${styles.roleBtn} ${role==='forwarder'?styles.roleBtnActive:styles.roleBtnInactive}`} onClick={()=>setRole('forwarder')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Freight Forwarder
          </button>
          <button className={`${styles.roleBtn} ${role==='operator'?styles.roleBtnActive:styles.roleBtnInactive}`} onClick={()=>setRole('operator')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17h18l-2 3H5l-2-3z"/><path d="M5 17V11h14v6"/><rect x="7" y="5" width="4" height="6" rx="0.5"/><rect x="13" y="5" width="4" height="6" rx="0.5"/></svg>
            Transport Operator
          </button>
        </div>

        {role === 'forwarder' ? (
          <>
            <div className={styles.livePill}><div className={styles.liveDot}></div><span className={styles.liveLabel}>Live corridor capacity</span></div>
            <div className={styles.heroH1}>Every mode.<br/><span>Booked in<br/>seconds.</span></div>
            <p className={styles.heroDesc}>Compare barge, rail and road on the Rotterdam–Antwerp corridor in real time. No quotes, no calls — just instant booking.</p>
            <div className={styles.modeRows}>
              {[
                { name:'Barge', price:'€310', co2:'−68% CO₂', pct:72, color:'#1565C0', iconBg:'rgba(21,101,192,.25)', Icon:<IconBarge/> },
                { name:'Rail',  price:'€355', co2:'−54% CO₂', pct:55, color:'#5E35B1', iconBg:'rgba(94,53,177,.25)',  Icon:<IconRail/> },
                { name:'Road',  price:'€420', co2:'baseline',  pct:100, color:'#9E9E9E', iconBg:'rgba(255,255,255,.06)', Icon:<IconRoad/>, muted:true },
              ].map(m => (
                <div key={m.name} className={`${styles.modeRow} ${m.muted?styles.modeRowMuted:''}`}>
                  <div className={styles.modeIconBox} style={{background:m.iconBg}}>{m.Icon}</div>
                  <div className={styles.modeInfo}>
                    <div className={styles.modeNameText}>{m.name}</div>
                    <div className={styles.modeBarTrack}><div className={styles.modeBarFill} style={{width:`${m.pct}%`,background:m.color}}></div></div>
                  </div>
                  <div>
                    <div className={styles.modePrice}>{m.price}</div>
                    <div className={styles.modeCo2} style={{color:m.muted?'rgba(255,255,255,0.3)':'#4CAF50'}}>{m.co2}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.trustRow}>
              <div className={styles.trustItem}><span className={styles.trustNum}>510+</span><span className={styles.trustLabel}>Live slots</span></div>
              <div className={styles.trustDiv}></div>
              <div className={styles.trustItem}><span className={styles.trustNum}>90s</span><span className={styles.trustLabel}>To book</span></div>
              <div className={styles.trustDiv}></div>
              <div className={styles.trustItem}><span className={styles.trustNum}>RTM→ANR</span><span className={styles.trustLabel}>Corridor</span></div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.livePill}><div className={styles.liveDot}></div><span className={styles.liveLabel}>For transport operators</span></div>
            <div className={styles.heroH1}>Fill empty slots<br/>with <span>real<br/>demand.</span></div>
            <p className={styles.heroDesc}>Connect your TMS via REST API. Forwarders find and book your capacity in real time — no cold outreach, no empty runs.</p>
            <div className={styles.apiBlock}>
              <div className={styles.apiLabel}>POST /api/v1/slots</div>
              <div className={styles.apiCode}>
                <span style={{color:'rgba(77,163,255,0.6)'}}>"mode"</span>: <span style={{color:'#4ADE80'}}>"barge"</span>,<br/>
                <span style={{color:'rgba(77,163,255,0.6)'}}>"origin"</span>: <span style={{color:'#4ADE80'}}>"RTM"</span>,<br/>
                <span style={{color:'rgba(77,163,255,0.6)'}}>"capacity_kg"</span>: <span style={{color:'#FAC775'}}>800000</span>,<br/>
                <span style={{color:'rgba(77,163,255,0.6)'}}>"price_eur"</span>: <span style={{color:'#FAC775'}}>18</span>
              </div>
            </div>
            <div className={styles.opStats}>
              {[{num:'847',label:'bookings/month'},{num:'14',label:'operators live'},{num:'€0',label:'upfront cost'}].map(s=>(
                <div key={s.label} className={styles.opStat}><div className={styles.opStatNum}>{s.num}</div><div className={styles.opStatLabel}>{s.label}</div></div>
              ))}
            </div>
          </>
        )}
        <div className={styles.leftFooter}>© 2026 CorridorBook B.V. · Rotterdam, Netherlands</div>
      </div>

      {/* ── Right panel — auth ── */}
      <div className={styles.right}>
        <div className={styles.authBox}>
          <div className={styles.authTitle}>Welcome to CorridorBook</div>
          <div className={styles.authSub}>Sign in or create an account to continue</div>

          <div className={styles.authTabs}>
            <button className={`${styles.authTab} ${tab==='login'?styles.authTabActive:''}`} onClick={()=>setTab('login')}>Sign in</button>
            <button className={`${styles.authTab} ${tab==='register'?styles.authTabActive:''}`} onClick={()=>setTab('register')}>Create account</button>
          </div>

          {tab === 'login' && (
            <form onSubmit={handleLogin} className={styles.form}>
              <div className="form-group"><label className="label">Email</label><input className="input" type="email" placeholder="you@company.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required /></div>
              <div className="form-group"><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required /></div>
              {loginError && <div className="alert alert-error">{loginError}</div>}
              <button className="btn btn-primary" style={{width:'100%'}} type="submit" disabled={loginLoading}>
                {loginLoading ? <><span className="spinner"></span> Signing in…</> : 'Sign in'}
              </button>
              <p className={styles.switchText}>No account? <button type="button" className={styles.switchLink} onClick={()=>setTab('register')}>Create one</button></p>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className={styles.form}>
              {/* Role cards */}
              <div className={styles.roleLabel}>I am a…</div>
              <div className={styles.roleGrid}>
                <div className={`${styles.roleCard} ${regRole==='forwarder'?styles.roleCardSelected:''}`} onClick={()=>setRegRole('forwarder')}>
                  <IconForwarder stroke={regRole==='forwarder'?'#1565C0':'#6C757D'}/>
                  <div className={styles.roleCardName}>Freight Forwarder</div>
                </div>
                <div className={`${styles.roleCard} ${regRole==='operator'?styles.roleCardSelected:''}`} onClick={()=>setRegRole('operator')}>
                  <IconOperator stroke={regRole==='operator'?'#1565C0':'#6C757D'}/>
                  <div className={styles.roleCardName}>Transport Operator</div>
                </div>
              </div>
              <div className="form-group"><label className="label">Company name</label><input className="input" type="text" placeholder="Your company" value={regCompany} onChange={e=>setRegCompany(e.target.value)} required /></div>
              <div className="form-group"><label className="label">Email</label><input className="input" type="email" placeholder="you@company.com" value={regEmail} onChange={e=>setRegEmail(e.target.value)} required /></div>
              <div className="form-group"><label className="label">Password</label><input className="input" type="password" placeholder="Min 6 characters" value={regPassword} onChange={e=>setRegPassword(e.target.value)} required /></div>
              {regRole==='operator' && <div className="form-group"><label className="label">Modality</label><select className="select" value={regModality} onChange={e=>setRegModality(e.target.value)}><option value="barge">Barge</option><option value="rail">Rail</option><option value="road">Road</option></select></div>}
              {regError && <div className="alert alert-error">{regError}</div>}
              {regSuccess && <div className="alert alert-success">{regSuccess}</div>}
              <button className="btn btn-primary" style={{width:'100%'}} type="submit" disabled={regLoading}>
                {regLoading ? <><span className="spinner"></span> Creating…</> : 'Create account'}
              </button>
              <p className={styles.switchText}>Already have an account? <button type="button" className={styles.switchLink} onClick={()=>setTab('login')}>Sign in</button></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}