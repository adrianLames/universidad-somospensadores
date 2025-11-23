// Configuración de Google Maps
export const GOOGLE_MAPS_CONFIG = {
  // API Key de Google Maps - Reemplaza con tu propia clave
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,

  // Coordenadas de la Universidad del Valle - Sede Santander de Quilichao
  defaultLocation: {
    lat: 3.022922,
    lng: -76.482656,
    name: 'Universidad del Valle - Sede Santander de Quilichao'
  },

  // Opciones de zoom
  defaultZoom: 18,
  minZoom: 10,
  maxZoom: 20,

  // Estilos de mapa
  mapStyle: [
    {
      featureType: 'water',
      stylers: [
        { color: '#c9c9c9' }
      ]
    },
    {
      featureType: 'landscape',
      stylers: [
        { color: '#f3f3f3' }
      ]
    }
  ],

  // Estilos de marcadores
  markerStyles: {
    conClases: {
      fillColor: '#FF6B6B',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 2
    },
    disponible: {
      fillColor: '#4ECDC4',
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 2
    }
  }
};
