export type CategoryGroup = 'disservizi' | 'sicurezza' | 'risolto';

export type CategoryKey =
  | 'buca' | 'albero' | 'lampione' | 'rifiuti'
  | 'furtoAuto' | 'furtoCasa' | 'vandalismo'
  | 'risolto';

export interface CategoryDef {
  color: string;
  label: string;
  group: CategoryGroup;
  iconName: IconName;
}

export interface UserDef {
  initials: string;
  name: string;
  hue: number;
  anon?: boolean;
}

export type UserKey = 'marco' | 'sofia' | 'luca' | 'giulia' | 'andrea' | 'chiara' | 'paolo' | 'anon';

export interface Pin {
  id: number;
  cat: CategoryKey;
  xp: number;
  yp: number;
  // optional real coords for Google Maps
  lat?: number;
  lng?: number;
}

export type PhotoKind = 'asphalt' | 'night' | 'street' | 'tree' | 'park' | 'dark' | 'door' | 'fixed';

export interface Report {
  id: number;
  cat: CategoryKey;
  title: string;
  where: string;
  time: string;
  confirms: number;
  recent6h: number;
  resolutionVotes: number;
  photo: PhotoKind;
  photoUrl?: string | null;
  by: UserKey;
  // identita' reale (segnalazioni da Supabase): etichetta autore gia' resa
  // "Nome C." (null/anon se anonima) e coordinate reali per la mappa.
  authorLabel?: string | null;
  authorId?: string | null;
  anon?: boolean;
  lat?: number;
  lng?: number;
  note?: string;
  createdAt?: string;
  // user-side flags (locali per dispositivo)
  followed?: boolean;
  flagged?: boolean;
}

export interface Badge {
  id: string;
  label: string;
  min: number;
  weight: number;
}

export type ZoneRole = 'casa' | 'lavoro' | 'segui';

export interface Zone {
  id: string;
  name: string;
  city: string;
  role: ZoneRole;
  verified: boolean;
  comuneActive?: boolean;
}

export interface Profile {
  id: string;
  nome: string;
  cognome: string;
  birth_date: string; // ISO date (YYYY-MM-DD)
  created_at?: string;
  updated_at?: string;
}

export type SortKey = 'rilevanti' | 'recenti' | 'vicine' | 'reazioni';
export type FilterKey = 'tutto' | 'sicurezza' | 'disservizi' | 'risolti';
export type PinStyle = 'coda' | 'rotondo' | 'minimal';

export type IconName =
  | 'pothole' | 'tree' | 'lamp' | 'car' | 'house' | 'spray' | 'check' | 'trash'
  | 'chevron' | 'arrow' | 'pinSmall' | 'plus' | 'locate' | 'layers' | 'filter'
  | 'search' | 'hand' | 'bell' | 'arrowUp' | 'share' | 'more' | 'camera'
  | 'image' | 'close' | 'lock' | 'info' | 'clock' | 'sparkle' | 'settings'
  | 'cone' | 'shield' | 'flag' | 'trend' | 'bookmark';

export type IconDir = 'left' | 'right' | 'up' | 'down';

export type NotifTab = 'mine' | 'zona';

export interface Notification {
  id: number;
  iconName: IconName;
  iconColor: string;
  bg: string;
  prefix?: string;
  text: string;
  sub: string;
  time: string;
  group: 'oggi' | 'settimana';
  tab: NotifTab;          // per filtrare le tab (Tutte = tutte)
  unread: boolean;        // evidenziazione gialla (per-notifica, si spegne all'apertura)
  acknowledged: boolean;  // badge (si azzera entrando nella schermata)
  action?: string;        // etichetta CTA opzionale
  routerLink?: unknown[];
}

export interface ResolutionVoteKind {
  kind: 'visto' | 'peggiorata' | 'risolta';
  label: string;
}
