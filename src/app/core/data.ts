import type {
  Badge, CategoryDef, CategoryKey, Notification, Pin, Report, UserDef, UserKey, Zone,
} from './models';

const C = {
  amber: '#F5A524',
  red:   '#E5484D',
  green: '#3FB984',
};

export const CATS: Record<CategoryKey, CategoryDef> = {
  buca:       { color: C.amber, label: 'Buca',          group: 'disservizi', iconName: 'pothole' },
  albero:     { color: C.amber, label: 'Albero',        group: 'disservizi', iconName: 'tree' },
  lampione:   { color: C.amber, label: 'Lampione',      group: 'disservizi', iconName: 'lamp' },
  rifiuti:    { color: C.amber, label: 'Rifiuti',       group: 'disservizi', iconName: 'trash' },
  furtoAuto:  { color: C.red,   label: 'Furto auto',    group: 'sicurezza',  iconName: 'car' },
  furtoCasa:  { color: C.red,   label: 'Furto in casa', group: 'sicurezza',  iconName: 'house' },
  vandalismo: { color: C.red,   label: 'Vandalismo',    group: 'sicurezza',  iconName: 'spray' },
  risolto:    { color: C.green, label: 'Risolto',       group: 'risolto',    iconName: 'check' },
};

export const USERS: Record<UserKey, UserDef> = {
  marco:  { initials: 'MT', name: 'Marco T.',  hue:  30 },
  sofia:  { initials: 'SR', name: 'Sofia R.',  hue: 155 },
  luca:   { initials: 'LB', name: 'Luca B.',   hue: 220 },
  giulia: { initials: 'GM', name: 'Giulia M.', hue: 320 },
  andrea: { initials: 'AV', name: 'Andrea V.', hue:  60 },
  chiara: { initials: 'CP', name: 'Chiara P.', hue: 280 },
  paolo:  { initials: 'PD', name: 'Paolo D.',  hue: 200 },
  anon:   { initials: '··', name: 'Anonimo',   hue:   0, anon: true },
};

// Pin positioned as % of the SVG fallback map. We also derive lat/lng so that
// when Google Maps is available we plot real markers around Trastevere.
const CENTER_LAT = 41.8893;
const CENTER_LNG = 12.4677;
const SPAN_LAT = 0.012;
const SPAN_LNG = 0.018;

function withLatLng(xp: number, yp: number): { lat: number; lng: number } {
  // xp=0.5/yp=0.5 maps to CENTER. yp inverted because screen y is north-down.
  return {
    lat: CENTER_LAT + (0.5 - yp) * SPAN_LAT,
    lng: CENTER_LNG + (xp - 0.5) * SPAN_LNG,
  };
}

export const PINS: Pin[] = [
  { id: 1, cat: 'buca',       xp: 0.368, yp: 0.337, ...withLatLng(0.368, 0.337) },
  { id: 4, cat: 'albero',     xp: 0.661, yp: 0.221, ...withLatLng(0.661, 0.221) },
  { id: 6, cat: 'lampione',   xp: 0.219, yp: 0.462, ...withLatLng(0.219, 0.462) },
  { id: 2, cat: 'furtoAuto',  xp: 0.520, yp: 0.423, ...withLatLng(0.520, 0.423) },
  { id: 5, cat: 'vandalismo', xp: 0.787, yp: 0.375, ...withLatLng(0.787, 0.375) },
  { id: 7, cat: 'furtoCasa',  xp: 0.387, yp: 0.173, ...withLatLng(0.387, 0.173) },
  { id: 3, cat: 'risolto',    xp: 0.587, yp: 0.567, ...withLatLng(0.587, 0.567) },
  { id: 8, cat: 'risolto',    xp: 0.160, yp: 0.615, ...withLatLng(0.160, 0.615) },
  { id: 9, cat: 'rifiuti',    xp: 0.880, yp: 0.567, ...withLatLng(0.880, 0.567) },
];

export const SEED_REPORTS: Report[] = [
  { id: 1, cat: 'buca',       title: 'Buca profonda all\'incrocio',     where: 'Via Garibaldi, 42', time: '12 min fa', confirms: 47,  recent6h: 23, resolutionVotes: 0, photo: 'asphalt', by: 'marco' },
  { id: 2, cat: 'furtoAuto',  title: 'Tentato furto Fiat Panda',         where: 'P.za Mazzini',      time: '34 min fa', confirms: 23,  recent6h: 18, resolutionVotes: 0, photo: 'night',   by: 'anon' },
  { id: 3, cat: 'risolto',    title: 'Lampione riparato — finalmente', where: 'Via Roma, 12',   time: '2 ore fa',  confirms: 89,  recent6h: 12, resolutionVotes: 5, photo: 'street',  by: 'sofia' },
  { id: 4, cat: 'albero',     title: 'Ramo grosso pericolante',          where: 'Viale dei Pini',    time: '3 ore fa',  confirms: 31,  recent6h: 14, resolutionVotes: 1, photo: 'tree',    by: 'luca' },
  { id: 5, cat: 'vandalismo', title: 'Panchine parco rotte stanotte',    where: 'Parco Verdi',       time: '5 ore fa',  confirms: 56,  recent6h: 31, resolutionVotes: 0, photo: 'park',    by: 'anon' },
  { id: 6, cat: 'lampione',   title: 'Tre lampioni spenti da giovedì', where: 'Via dei Mille',  time: '8 ore fa',  confirms: 19,  recent6h:  4, resolutionVotes: 2, photo: 'dark',    by: 'andrea' },
  { id: 7, cat: 'furtoCasa',  title: 'Tentativo scasso piano terra',     where: 'Via San Marco',     time: 'ieri',      confirms: 71,  recent6h:  3, resolutionVotes: 0, photo: 'door',    by: 'anon' },
  { id: 8, cat: 'risolto',    title: 'Buca asfaltata in Piazza',         where: 'P.za del Popolo',   time: 'ieri',      confirms: 112, recent6h:  0, resolutionVotes: 8, photo: 'fixed',   by: 'giulia' },
  { id: 9, cat: 'rifiuti',    title: 'Sacchi accumulati da 4 giorni',    where: 'Via dei Banchi',    time: 'ieri',      confirms: 28,  recent6h:  6, resolutionVotes: 0, photo: 'asphalt', by: 'chiara' },
];

export const RESOLUTION_GOAL = 5;

export const BADGES: Badge[] = [
  { id: 'new',    label: 'Nuovo arrivato',      min:  0, weight: 0.8 },
  { id: 'active', label: 'Cittadino attivo',    min:  5, weight: 1.0 },
  { id: 'pillar', label: 'Pilastro della zona', min: 20, weight: 1.5 },
  { id: 'civic',  label: 'Coscienza civica',    min: 50, weight: 2.0 },
];

export const SEED_ZONES: Zone[] = [
  { id: 'trastevere',   name: 'Trastevere',    city: 'Roma',    role: 'casa',   verified: true,  comuneActive: true  },
  { id: 'sanlorenzo',   name: 'San Lorenzo',   city: 'Roma',    role: 'lavoro', verified: true,  comuneActive: true  },
  { id: 'torpignattara', name: 'Torpignattara', city: 'Roma',   role: 'segui',  verified: false, comuneActive: false },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: 1, reportId: 1, title: 'Nuova conferma',      body: '"Buca profonda all\'incrocio" ha raggiunto 47 conferme', time: '5 min fa',  unread: true,  group: 'oggi' },
  { id: 2, reportId: 4, title: 'Stato aggiornato',    body: 'Ramo grosso pericolante — in lavorazione',           time: '1 ora fa',  unread: true,  group: 'oggi' },
  { id: 3, reportId: 6, title: 'Conferma richiesta',  body: 'Tre lampioni spenti da giovedì',                     time: '3 ore fa',  unread: true,  group: 'oggi',     action: { label: 'Conferma' } },
  { id: 4, reportId: 3, title: 'Segnalazione risolta', body: 'Lampione riparato — ottimo lavoro insieme!',         time: 'ieri',       unread: false, group: 'settimana' },
  { id: 5,             title: 'Polso della zona',     body: 'Questa settimana: 18 segnalate, 7 risolte',               time: '2 giorni fa', unread: false, group: 'settimana' },
  { id: 6, reportId: 8, title: 'Risoluzione confermata', body: 'Buca in P.za del Popolo: 8 conferme, archiviata',        time: '3 giorni fa', unread: false, group: 'settimana' },
];
