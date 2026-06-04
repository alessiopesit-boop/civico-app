export const environment = {
  production: true,
  supabase: {
    // Project URL + publishable key (Settings > API Keys). La publishable key
    // (sb_publishable_...) sostituisce la vecchia anon key ed e' pubblica per
    // natura: finisce nel bundle, protetta dalle RLS. Vuoti => modalita' locale.
    url: 'https://pbhulkwydgdeuvdcnnol.supabase.co',
    anonKey: 'sb_publishable_hur8fx6_8mstumRoKAn0eQ_CNqZMBoS',
  },
  googleMaps: {
    // Inserire una API key Google Maps JavaScript valida.
    // Senza key l'app usa un fallback grafico (mappa stilizzata SVG).
    apiKey: '',
    defaultCenter: { lat: 41.8893, lng: 12.4677 }, // Roma
    defaultZoom: 15,
  },
};
