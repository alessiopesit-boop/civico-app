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
  by: UserKey;
  // user-side flags
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

export interface Notification {
  id: number;
  reportId?: number;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  group: 'oggi' | 'settimana';
  action?: { label: string };
}

export interface ResolutionVoteKind {
  kind: 'visto' | 'peggiorata' | 'risolta';
  label: string;
}
