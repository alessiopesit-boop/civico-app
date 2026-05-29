export const environment = {
  production: false,
  googleMaps: {
    // In dev, lascia vuoto per usare il fallback SVG locale (nessuna chiamata HTTP).
    apiKey: '',
    defaultCenter: { lat: 41.8893, lng: 12.4677 }, // Roma
    defaultZoom: 15,
  },
};
