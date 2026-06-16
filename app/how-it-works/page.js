import Nav from '@/components/Nav';
export const metadata = { title: 'How it works — CorridorBook' };

const IconBarge = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17h18l-2 3H5l-2-3z"/><path d="M5 17V11h14v6"/><rect x="7" y="5" width="4" height="6" rx="0.5"/><rect x="13" y="5" width="4" height="6" rx="0.5"/></svg>;
const IconRail  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="12" rx="2"/><path d="M2 10h20"/><path d="M7 4v6"/><path d="M12 4v6"/><path d="M17 4v6"/><path d="M5 22l2-6"/><path d="M19 22l-2-6"/><path d="M4 22h16"/></svg>;
const IconRoad  = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 3h13v13H1z"/><path d="M14 7h3.5L21 11.5V16h-7V7z"/><circle cx="5" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>;

export default function HowItWorksPage() {
  const steps = [
    { n:'1', label:'Enter your route', desc:'Type origin and destination port or inland terminal. CorridorBook covers the Rotterdam–Antwerp corridor with live capacity from multiple operators.' },
    { n:'2', label:'Set cargo details', desc:'Select container type (20ft, 40ft GP/HC), quantity, and departure date. Cargo weight is auto-calculated from your container selection.' },
    { n:'3', label:'Compare live prices', desc:'See barge, rail and road prices side-by-side with transit time and CO₂ savings. Pick a departure slot from available operators.' },
    { n:'4', label:'Confirm & track', desc:'A 20-minute hold is placed immediately. Confirm your booking and track your shipment from the My Shipments dashboard.' },
  ];
  const modes = [
    { icon: <IconBarge/>, name:'Barge / Inland Waterway', tag:'Most sustainable', tagBg:'#E3F2FD', tagColor:'#1565C0', iconBg:'#E3F2FD', iconColor:'#1565C0',
      desc:'The backbone of Physical Internet logistics. Push barge convoys move containers along Rhine, Meuse and Scheldt with minimal emissions and high capacity per trip.',
      specs:[['CO₂ savings vs road','up to −68%','#2E7D32'],['Typical RTM→ANR','€290–€380',''],['Transit time','14–24h',''],['Operators','Contargo, Rhenus, HGK','']],
    },
    { icon: <IconRail/>, name:'Rail Freight', tag:'Fastest alternative', tagBg:'#EDE7F6', tagColor:'#5E35B1', iconBg:'#EDE7F6', iconColor:'#5E35B1',
      desc:'Block trains run direct schedules between major port terminals and inland hubs. Best for time-sensitive cargo that cannot wait for barge frequency.',
      specs:[['CO₂ savings vs road','up to −54%','#2E7D32'],['Typical RTM→ANR','€330–€420',''],['Transit time','8–14h',''],['Operators','DB Cargo, Lineas, Rail Cargo','']],
    },
    { icon: <IconRoad/>, name:'Road / HGV', tag:'Baseline', tagBg:'#F1F3F5', tagColor:'#495057', iconBg:'#F1F3F5', iconColor:'#495057',
      desc:'Standard HGV transport by road. Shown as the CO₂ and cost baseline for comparison. Fastest for urgent point-to-point delivery when no multimodal window exists.',
      specs:[['CO₂ baseline','reference',''],['Typical RTM→ANR','€380–€550',''],['Transit time','3–6h',''],['Operators','Jan de Rijk, Rhenus Road, DHL','']],
    },
  ];
  return (
    <>
      <Nav />
      <div style={{background:'#0B1828',padding:'60px 20px 48px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:"url('https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1400&q=85')",backgroundSize:'cover',backgroundPosition:'center 55%',opacity:0.15}}></div>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:'rgba(77,163,255,0.8)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Platform guide</div>
          <h1 style={{fontSize:36,fontWeight:800,color:'#fff',letterSpacing:'-1px',lineHeight:1.15,marginBottom:16}}>Freight booked in<br/><span style={{color:'#4DA3FF'}}>under 90 seconds.</span></h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.6)',maxWidth:540,margin:'0 auto',lineHeight:1.7}}>CorridorBook connects shippers directly to barge, rail and road operators across the Rotterdam–Antwerp hinterland corridor — no calls, no quotes, no waiting.</p>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'48px 20px 80px'}}>
        {/* Steps */}
        <div style={{marginBottom:56}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--grey-label)',marginBottom:8}}>The process</div>
          <h2 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',marginBottom:6}}>From search to confirmed slot</h2>
          <p style={{fontSize:14,color:'var(--grey-label)',marginBottom:32}}>Four steps. No phone calls. No quote requests.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {steps.map(s => (
              <div key={s.n} style={{background:'#fff',border:'1px solid var(--grey-border)',borderRadius:12,padding:20,boxShadow:'var(--shadow)'}}>
                <div style={{width:36,height:36,background:'var(--blue)',color:'#fff',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,marginBottom:14}}>{s.n}</div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:12,color:'var(--grey-label)',lineHeight:1.6}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Modes */}
        <div style={{marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--grey-label)',marginBottom:8}}>Transport modes</div>
          <h2 style={{fontSize:24,fontWeight:800,letterSpacing:'-0.5px',marginBottom:6}}>Three modes, one platform</h2>
          <p style={{fontSize:14,color:'var(--grey-label)',marginBottom:32}}>Compare barge, rail and road on a single screen — no separate operator portals needed.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {modes.map(m => (
              <div key={m.name} style={{background:'#fff',border:'1px solid var(--grey-border)',borderRadius:12,padding:24,boxShadow:'var(--shadow)'}}>
                <div style={{width:48,height:48,background:m.iconBg,color:m.iconColor,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>{m.icon}</div>
                <div style={{fontWeight:800,fontSize:15,marginBottom:6}}>{m.name}</div>
                <span style={{display:'inline-flex',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:m.tagBg,color:m.tagColor,marginBottom:10}}>{m.tag}</span>
                <p style={{fontSize:12,color:'var(--grey-label)',lineHeight:1.6,marginBottom:14}}>{m.desc}</p>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {m.specs.map(([l,v,vc]) => (
                    <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                      <span style={{color:'var(--grey-label)'}}>{l}</span>
                      <span style={{fontWeight:600,color:vc||'var(--text)'}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{background:'#0B1828',borderRadius:16,padding:'36px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24}}>
          <div>
            <h3 style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:8}}>Ready to book your first slot?</h3>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.6)'}}>Live capacity available now on the Rotterdam–Antwerp corridor.</p>
          </div>
          <a href="/search" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#1565C0',color:'#fff',fontWeight:700,fontSize:14,padding:'12px 24px',borderRadius:8,textDecoration:'none',whiteSpace:'nowrap'}}>Search slots →</a>
        </div>
      </div>
    </>
  );
}