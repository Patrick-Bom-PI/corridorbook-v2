import Nav from '@/components/Nav';
export const metadata = { title: 'About — CorridorBook' };

export default function AboutPage() {
  const team = [
    { name:'Ray Campbell',      role:'Strategy & Research' },
    { name:'Quynh Hoang',       role:'UX & Design' },
    { name:'Kunchirat Jitkul',  role:'Logistics Analysis' },
    { name:'Jason Wangsa',      role:'Business Development' },
    { name:'Patrick Bom',       role:'Technology & Prototype' },
  ];

  const principles = [
    { icon:'🌐', title:'Interoperability', color:'#1565C0', bg:'#E3F2FD',
      desc:'Any operator, any mode, any terminal on one platform. Shippers don\'t need separate accounts with Contargo, DB Cargo, and Jan de Rijk — one search finds all of them.' },
    { icon:'📦', title:'Standardisation', color:'#5E35B1', bg:'#EDE7F6',
      desc:'Slots, prices, and CO₂ are expressed in standardised units. A tonne-kilometre at CorridorBook means the same thing regardless of which operator fulfils the booking.' },
    { icon:'📡', title:'Shared infrastructure', color:'#2E7D32', bg:'#E8F5E9',
      desc:'Demand signals from forwarder searches are visible to operators. When a route shows unmet demand, operators can publish capacity to fill it — closing the loop between supply and demand.' },
  ];

  return (
    <>
      <Nav />
      {/* Hero */}
      <div style={{background:'#0B1828',padding:'60px 20px 48px',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:"url('https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1400&q=85')",backgroundSize:'cover',backgroundPosition:'center 55%',opacity:0.12}}></div>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:12,fontWeight:700,color:'rgba(77,163,255,0.8)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Our mission</div>
          <h1 style={{fontSize:36,fontWeight:800,color:'#fff',letterSpacing:'-1px',lineHeight:1.15,marginBottom:16}}>Logistics that works like<br/><span style={{color:'#4DA3FF'}}>the internet.</span></h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,0.6)',maxWidth:560,margin:'0 auto',lineHeight:1.7}}>CorridorBook is a Physical Internet platform. We apply the principles of digital packet routing — openness, interoperability, standardisation — to physical freight in the Rotterdam–Antwerp hinterland corridor.</p>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'48px 20px 80px'}}>
        {/* Why section */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,marginBottom:56,alignItems:'start'}}>
          <div>
            <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.5px',marginBottom:16}}>Why we built CorridorBook</h2>
            {[
              'The Rotterdam–Antwerp corridor is one of the busiest freight corridors in the world. Yet barge and rail — the most sustainable and often cheapest modes — run at 40–60% capacity utilisation. The problem isn\'t infrastructure. It\'s information.',
              'Shippers default to road because they know exactly what it costs and when it arrives. Barge and rail require phone calls, email quotes, and days of waiting. By the time the answer comes, the truck has already left.',
              'CorridorBook solves this. We connect shippers and operators on a single platform where capacity is visible, prices are live, and bookings take less than 90 seconds.',
            ].map((p, i) => <p key={i} style={{fontSize:14,color:'var(--grey-label)',lineHeight:1.75,marginBottom:12}}>{p}</p>)}
          </div>
          <div style={{background:'#F8F9FA',border:'1px solid var(--grey-border)',borderRadius:12,padding:24}}>
            <div style={{fontSize:40,color:'var(--grey-border)',lineHeight:1,marginBottom:8}}>"</div>
            <blockquote style={{fontSize:14,lineHeight:1.75,color:'var(--text)',fontStyle:'italic',marginBottom:16}}>
              The Physical Internet is not a metaphor. It is a blueprint for how logistics must work if we want a sustainable, resilient supply chain.
            </blockquote>
            <cite style={{fontSize:12,color:'var(--grey-label)',fontStyle:'normal'}}>— Inspired by Benoit Montreuil, Physical Internet Initiative (2011)</cite>
          </div>
        </div>

        {/* PI Principles */}
        <div style={{marginBottom:56}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--grey-label)',marginBottom:8}}>Foundation</div>
          <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.5px',marginBottom:24}}>Built on Physical Internet principles</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {principles.map(p => (
              <div key={p.title} style={{background:'#fff',border:'1px solid var(--grey-border)',borderRadius:12,padding:20,boxShadow:'var(--shadow)'}}>
                <div style={{width:40,height:40,background:p.bg,color:p.color,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:12}}>{p.icon}</div>
                <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{p.title}</div>
                <p style={{fontSize:12,color:'var(--grey-label)',lineHeight:1.65}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{marginBottom:48}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:'var(--grey-label)',marginBottom:8}}>The team</div>
          <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.5px',marginBottom:24}}>Built at Breda University of Applied Sciences</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
            {team.map(m => (
              <div key={m.name} style={{background:'#fff',border:'1px solid var(--grey-border)',borderRadius:10,padding:16,textAlign:'center',boxShadow:'var(--shadow)'}}>
                <div style={{width:44,height:44,background:'var(--blue)',color:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,margin:'0 auto 10px'}}>
                  {m.name.split(' ').map(n=>n[0]).join('').substring(0,2)}
                </div>
                <div style={{fontWeight:700,fontSize:12,marginBottom:3}}>{m.name}</div>
                <div style={{fontSize:11,color:'var(--grey-label)'}}>{m.role}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,color:'var(--grey-muted)',marginTop:16,textAlign:'center'}}>Innovation & Prototyping bootcamp, 2025–2026 · This is an academic prototype. Not yet commercially operational.</p>
        </div>

        {/* CTA */}
        <div style={{background:'#0B1828',borderRadius:16,padding:'36px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24}}>
          <div>
            <h3 style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:8}}>Ready to try CorridorBook?</h3>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.6)'}}>Live capacity available now on the Rotterdam–Antwerp corridor.</p>
          </div>
          <a href="/" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#1565C0',color:'#fff',fontWeight:700,fontSize:14,padding:'12px 24px',borderRadius:8,textDecoration:'none',whiteSpace:'nowrap'}}>Get started →</a>
        </div>
      </div>
    </>
  );
}