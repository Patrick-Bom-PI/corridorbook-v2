'use client';
import { useEffect, useRef } from 'react';

const PORT_COORDS = {
  'Rotterdam Maasvlakte': [51.951, 4.045],
  'Rotterdam Waalhaven':  [51.895, 4.396],
  'Rotterdam Europoort':  [51.932, 4.010],
  'Rotterdam Botlek':     [51.882, 4.190],
  'Rotterdam ECT Delta':  [51.951, 4.045],
  'Antwerp Deurganck':    [51.282, 4.272],
  'Antwerp Noord':        [51.302, 4.298],
  'Antwerp Liefkenshoek': [51.270, 4.210],
  'Antwerp Berendrecht':  [51.307, 4.278],
  'Antwerp Rijnkaai Rail':[51.217, 4.421],
  'Antwerp Barge Terminal':[51.260, 4.320],
  // Extended European ports
  'Hamburg Container Terminal': [53.530, 9.950],
  'Hamburg': [53.530, 9.950],
  'Duisburg Logport':   [51.430, 6.740],
  'Duisburg':           [51.430, 6.740],
  'Cologne':            [51.014, 6.943],
  'Frankfurt':          [50.107, 8.663],
  'Munich':             [48.137, 11.553],
  'Berlin':             [52.503, 13.450],
  'Felixstowe Port':    [51.954, 1.350],
  'Felixstowe':         [51.954, 1.350],
  'London Gateway':     [51.499, 0.480],
  'Tilbury':            [51.463, 0.352],
  'Le Havre':           [49.490, 0.107],
  'Dunkerque':          [51.041, 2.373],
  'Lille':              [50.474, 2.988],
  'Paris':              [48.924, 2.286],
  'Marseille':          [43.411, 4.975],
  'Lyon':               [45.748, 4.842],
  'Barcelona':          [41.334, 2.167],
  'Valencia':           [39.445, -0.318],
  'Madrid':             [40.389, -3.671],
  'Lisbon':             [38.693, -9.230],
  'Genoa':              [44.399, 8.923],
  'Milan':              [45.490, 9.289],
  'Venice':             [45.459, 12.230],
  'Trieste':            [45.650, 13.763],
  'Vienna':             [48.155, 16.479],
  'Prague':             [50.039, 14.613],
  'Warsaw':             [52.198, 20.614],
  'Gdansk':             [54.375, 18.670],
  'Gothenburg':         [57.706, 11.920],
  'Stockholm':          [59.045, 18.148],
  'Copenhagen':         [55.706, 12.597],
  'Oslo':               [59.898, 10.757],
  'Helsinki':           [60.208, 25.088],
  'Istanbul':           [40.996, 28.835],
  'Piraeus':            [37.945, 23.627],
  'Athens':             [37.945, 23.627],
  'Koper':              [45.551, 13.731],
  'Liege':              [50.630, 5.580],
  'Brussels':           [50.854, 4.346],
  'Ghent':              [51.100, 3.730],
  'Zeebrugge':          [51.344, 3.197],
  'Flushing':           [51.455, 3.576],
  'Vlissingen':         [51.455, 3.576],
  'Venlo':              [51.370, 6.172],
  'Eindhoven':          [51.441, 5.477],
  'Tilburg':            [51.559, 5.088],
  'Utrecht':            [52.092, 5.104],
  'Amsterdam':          [52.398, 4.793],
  'Dordrecht':          [51.804, 4.669],
  'Nijmegen':           [51.847, 5.855],
  'Terneuzen':          [51.333, 3.833],
  'Breda Logistics Park': [51.588, 4.776],
  'Moerdijk Terminal':    [51.700, 4.610],
  'Amsterdam Westpoort':  [52.398, 4.793],
  'Duisburg Logport':     [51.430, 6.740],
  'Liege Trilogiport':    [50.630, 5.580],
  'Brussels Barge Terminal':[50.854, 4.346],
  'Ghent Sea Terminal':   [51.100, 3.730],
};

// Generate route path between two coords via realistic waypoints
function getRoutePath(from, to, mode) {
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;

  if (mode === 'barge') {
    // Via water — curves through the Scheldt/Rhine waterway
    return [
      from,
      [from[0] - 0.05, from[1] + 0.25],
      [midLat + 0.08, midLng - 0.08],
      [midLat - 0.05, midLng - 0.05],
      [to[0] + 0.08, to[1] - 0.02],
      to,
    ];
  }
  if (mode === 'rail') {
    // Via rail line — more direct
    return [
      from,
      [from[0] - 0.02, from[1] + 0.30],
      [midLat + 0.02, midLng + 0.05],
      [to[0] + 0.06, to[1] + 0.12],
      to,
    ];
  }
  // Road — via highway A4/E19
  return [
    from,
    [from[0] - 0.04, from[1] + 0.55],
    [midLat + 0.03, midLng + 0.45],
    [to[0] + 0.10, to[1] + 0.28],
    to,
  ];
}

function getCoords(name) {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  // Exact match
  if (PORT_COORDS[name]) return PORT_COORDS[name];
  // Key contains input (e.g. input="Rotterdam", key="Rotterdam Maasvlakte")
  const key1 = Object.keys(PORT_COORDS).find(k => k.toLowerCase().startsWith(n));
  if (key1) return PORT_COORDS[key1];
  // Input contains key (e.g. input="Rotterdam Maasvlakte", key="Rotterdam Maasvlakte")
  const key2 = Object.keys(PORT_COORDS).find(k => n.includes(k.toLowerCase()));
  if (key2) return PORT_COORDS[key2];
  // Partial match anywhere
  const key3 = Object.keys(PORT_COORDS).find(k => k.toLowerCase().includes(n) || n.includes(k.toLowerCase().split(' ')[0]));
  return key3 ? PORT_COORDS[key3] : null;
}

export default function RouteMap({ origin, dest, activeMode = 'barge' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet dynamically
    import('leaflet').then(L => {
      // Fix default icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      // Destroy existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layersRef.current = {};
      }

      const fromCoords = getCoords(origin) || [51.951, 4.045];
      const toCoords   = getCoords(dest)   || [51.282, 4.272];

      const midLat = (fromCoords[0] + toCoords[0]) / 2;
      const midLng = (fromCoords[1] + toCoords[1]) / 2;

      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView([midLat, midLng], 9);

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const MODES = {
        barge: { color: '#1565C0', weight: 4 },
        rail:  { color: '#5E35B1', weight: 4 },
        road:  { color: '#C25450', weight: 4 },
      };

      // Draw all three routes
      Object.entries(MODES).forEach(([mode, style]) => {
        const path = getRoutePath(fromCoords, toCoords, mode);
        const isActive = mode === activeMode;

        const poly = L.polyline(path, {
          color: style.color,
          weight: isActive ? 5 : 2.5,
          opacity: isActive ? 0.9 : 0.25,
          dashArray: isActive ? null : '6 5',
        }).addTo(map);

        // Dot markers at from/to
        const dot = (latlng) => L.marker(latlng, {
          icon: L.divIcon({
            className: '',
            html: `<div style="width:10px;height:10px;border-radius:50%;background:${style.color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);opacity:${isActive ? 1 : 0.3}"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          }),
        });

        layersRef.current[mode] = {
          poly,
          markers: [dot(fromCoords).addTo(map), dot(toCoords).addTo(map)],
        };

        if (isActive) poly.bringToFront();
      });

      // Fit to active route
      const activePath = getRoutePath(fromCoords, toCoords, activeMode);
      map.fitBounds(L.latLngBounds(activePath), { padding: [30, 30] });

      mapInstanceRef.current = map;
    });
  }, [origin, dest]);

  // Update active mode without rebuilding map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then(() => {
      const fromCoords = getCoords(origin) || [51.951, 4.045];
      const toCoords   = getCoords(dest)   || [51.282, 4.272];

      Object.entries(layersRef.current).forEach(([mode, layer]) => {
        const isActive = mode === activeMode;
        layer.poly.setStyle({
          weight: isActive ? 5 : 2.5,
          opacity: isActive ? 0.9 : 0.25,
          dashArray: isActive ? null : '6 5',
        });
        layer.markers.forEach(m => {
          const el = m.getElement();
          if (el) el.style.opacity = isActive ? '1' : '0.3';
        });
        if (isActive) layer.poly.bringToFront();
      });

      const activePath = getRoutePath(fromCoords, toCoords, activeMode);
      import('leaflet').then(L => {
        mapInstanceRef.current.fitBounds(L.latLngBounds(activePath), { padding: [30, 30] });
      });
    });
  }, [activeMode]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
    </>
  );
}