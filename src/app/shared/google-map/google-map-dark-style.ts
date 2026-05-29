/** Custom dark style tailored to Civico's palette.  */
export const CIVICO_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0B0D11' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B0D11' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: 'rgba(244,242,238,0.45)' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: 'rgba(244,242,238,0.65)' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1A2A1F' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A1D24' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#23272F' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2A2F39' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#161A20' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A1622' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: 'rgba(120,150,200,0.6)' }] },
];
