export function ModeIcon({ mode, color, size = 20 }) {
  if (mode === 'barge') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M3 17h18l-2 3H5l-2-3z"/><path d="M5 17V11h14v6"/>
      <rect x="7" y="5" width="4" height="6" rx="0.5"/><rect x="13" y="5" width="4" height="6" rx="0.5"/>
    </svg>
  );
  if (mode === 'rail') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="12" rx="2"/>
      <path d="M2 10h20"/><path d="M7 4v6"/><path d="M17 4v6"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M1 3h13v13H1z"/><path d="M14 7h3.5L21 11.5V16h-7V7z"/>
      <circle cx="5" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>
    </svg>
  );
}

export const MODE_META = {
  barge: { bg: '#E3F2FD', color: '#1565C0', label: 'Inland Waterway' },
  rail:  { bg: '#EDE7F6', color: '#4527A0', label: 'Freight Train'   },
  road:  { bg: '#FBE9E7', color: '#BF360C', label: 'HGV Transport'   },
};