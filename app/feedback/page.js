'use client';
import { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { useAuthGuard } from '@/components/useAuthGuard';
import { getFeedback } from '@/lib/api';
import styles from './feedback.module.css';

export default function FeedbackPage() {
  const { loading: authLoading } = useAuthGuard();
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!authLoading) getFeedback().then(setFeedback).catch(() => setFeedback([]));
  }, [authLoading]);

  const counts = { 'yes-current': 0, 'yes-lower': 0, 'not-yet': 0 };
  (feedback || []).forEach(f => { if (counts[f.answer] !== undefined) counts[f.answer]++; });
  const total    = (feedback || []).length;
  const wouldPay = counts['yes-current'] + counts['yes-lower'];
  const pct      = total > 0 ? Math.round(wouldPay / total * 100) : 0;

  const LABELS = {
    'yes-current': { text: 'Yes, at current pricing', cls: styles.answerGreen },
    'yes-lower':   { text: 'Yes, at a lower price',   cls: styles.answerBlue  },
    'not-yet':     { text: 'Not yet — missing features', cls: styles.answerAmber },
  };

  if (authLoading || feedback === null) return (
    <><Nav /><div style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="spinner" style={{borderTopColor:'#1565C0',borderColor:'#E3F2FD',width:32,height:32,borderWidth:3}}></div>
    </div></>
  );

  return (
    <>
      <Nav />
      <div className="page">
        <div className="page-title">Feedback Dashboard</div>
        <div className="page-sub">Commercial validation — "Would you pay for CorridorBook?" responses</div>

        <div className="stats-grid" style={{marginBottom:24}}>
          <div className="stat-card"><div className="stat-label">Total responses</div><div className="stat-value">{total}</div><div className="stat-sub">Since launch</div></div>
          <div className="stat-card"><div className="stat-label">Would pay</div><div className="stat-value" style={{color:'var(--green)'}}>{pct}%</div><div className="stat-sub">At any price point</div></div>
          <div className="stat-card"><div className="stat-label">At current pricing</div><div className="stat-value" style={{color:'var(--blue)'}}>{counts['yes-current']}</div><div className="stat-sub">Yes, as-is</div></div>
          <div className="stat-card"><div className="stat-label">Need more features</div><div className="stat-value" style={{color:'var(--amber)'}}>{counts['not-yet']}</div><div className="stat-sub">Not yet ready</div></div>
        </div>

        <div className="section" style={{marginBottom:20}}>
          <div className="section-header"><div className="section-title">Response breakdown</div></div>
          <div className="section-body">
            {[
              { key:'yes-current', label:'Yes, at current pricing', color:'#2E7D32' },
              { key:'yes-lower',   label:'Yes, at a lower price',   color:'#1565C0' },
              { key:'not-yet',     label:'Not yet — missing features', color:'#E65100' },
            ].map(row => (
              <div key={row.key} className={styles.barRow}>
                <div className={styles.barLabel}>{row.label}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{background:row.color, width: total > 0 ? `${Math.round(counts[row.key]/total*100)}%` : '0%'}}></div>
                </div>
                <div className={styles.barCount}>{counts[row.key]}</div>
              </div>
            ))}

            {total >= 2 && (
              <div className={styles.insightBox}>
                <div className={styles.insightTitle}>💡 Insight</div>
                <div className={styles.insightText}>
                  {pct >= 75 ? `Strong commercial signal — ${pct}% of users would pay. This validates the platform concept.`
                   : pct >= 40 ? `${pct}% would pay, but ${Math.round(counts['yes-lower']/total*100)}% want a lower price point. Consider exploring a freemium tier.`
                   : counts['not-yet'] > wouldPay ? 'Most users need more features before paying. Ask which features are missing to prioritise the next sprint.'
                   : 'Early data — keep collecting. Target at least 5 responses for a meaningful signal.'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header"><div className="section-title">Response log</div></div>
          <div className="section-body">
            {total === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-title">No responses yet</div>
                <div className="empty-sub">Feedback is collected after a booking is confirmed.</div>
              </div>
            ) : (
              <div className={styles.responseList}>
                {[...(feedback || [])].reverse().map((f, i) => {
                  const d = new Date(f.created_at);
                  const lbl = LABELS[f.answer] || LABELS['not-yet'];
                  return (
                    <div key={i} className={styles.responseItem}>
                      <span className={styles.responseNum}>#{total - i}</span>
                      <span className={styles.responseRef}>{f.booking_ref || 'no ref'}</span>
                      <span className={`${styles.responseAnswer} ${lbl.cls}`}>{lbl.text}</span>
                      <span className={styles.responseTime}>
                        {d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} {d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}
                      </span>
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