'use client';
import { useState, useEffect, useCallback } from 'react';

let toastFn = null;

export function showToast(message, type = 'success') {
  if (toastFn) toastFn(message, type);
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (message, type) => {
      const id = Date.now();
      setToasts(t => [...t, { id, message, type }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
    };
    return () => { toastFn = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{position:'fixed',bottom:32,left:'50%',transform:'translateX(-50%)',zIndex:9999,display:'flex',flexDirection:'column',gap:8,alignItems:'center'}}>
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}