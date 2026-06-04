export const environment = {
  production: false,
  supabase: {
    // Stesso progetto Supabase anche in dev (per l'MVP). Publishable key
    // (sb_publishable_...): pubblica per natura, protetta dalle RLS.
    url: 'https://pbhulkwydgdeuvdcnnol.supabase.co',
    anonKey: 'sb_publishable_hur8fx6_8mstumRoKAn0eQ_CNqZMBoS',
  },
  googleMaps: {
    // In dev, lascia vuoto per usare il fallback SVG locale (nessuna chiamata HTTP).
    apiKey: '',
    defaultCenter: { lat: 41.8893, lng: 12.4677 }, // Roma
    defaultZoom: 15,
  },
};
