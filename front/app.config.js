// Configuration Expo — remplace app.json pour lire les secrets depuis l'environnement.
// Voir .env.example
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export default {
  expo: {
    name: 'Maroc2030',
    slug: 'maroc2030',
    version: '1.0.0',
    orientation: 'portrait',
    ios: {
      supportsRTL: true,
      config: { googleMapsApiKey: GOOGLE_MAPS_API_KEY },
    },
    android: {
      supportsRTL: true,
      config: { googleMaps: { apiKey: GOOGLE_MAPS_API_KEY } },
    },
    extra: { supportsRTL: true },
  },
};
