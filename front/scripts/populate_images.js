const axios = require('axios');

// Votre clé API Google Maps (récupérée de MapScreen.js)
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const BASE_URL = 'http://localhost:8080/api/restaurants';

// Cette fonction parcourt vos restaurants et récupère leur vraie photo via Google Places API
async function updateRestaurants() {
  try {
    const { data: restaurants } = await axios.get(BASE_URL);
    console.log(`📡 Récupération de ${restaurants.length} restaurants...`);
    
    let updated = 0;
    
    // Parcourt tous les restaurants (vous pouvez changer la limite au besoin)
    for (let i = 0; i < restaurants.length; i++) {
        const r = restaurants[i];
        
        // Si le restaurant a déjà une image valide Google, on passe au suivant
        if (r.imageUrl && r.imageUrl.includes('google')) continue;
        
        try {
            // Recherche du restaurant sur Google Places via texte
            const query = encodeURIComponent(`${r.name} ${r.city || ''} restaurant Morocco`);
            const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;
            const searchRes = await axios.get(searchUrl);
            
            // Si on trouve le lieu
            if (searchRes.data.results && searchRes.data.results.length > 0) {
                const place = searchRes.data.results[0];
                
                // Si on trouve des photos pour ce lieu
                if (place.photos && place.photos.length > 0) {
                    const photoRef = place.photos[0].photo_reference;
                    // Construction du lien direct de la photo
                    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
                    
                    r.imageUrl = photoUrl;
                    
                    // Mise à jour de la Database Spring Boot
                    await axios.put(`${BASE_URL}/${r.id}`, r);
                    updated++;
                    console.log(`✅ Mis à jour: ${r.name}`);
                } else {
                    console.log(`⚠️ Aucune photo trouvée pour: ${r.name}`);
                }
            }
        } catch (err) {
            console.error(`❌ Erreur globale pour ${r.name}:`, err.message);
        }
        
        // Petite pause pour ne pas surcharger les limites de requêtes de Google (Rate Limiting)
        await new Promise(res => setTimeout(res, 500));
    }
    
    console.log(`🎉 Terminé ! ${updated} restaurants ont reçu leur vraie image depuis Google.`);
  } catch (err) {
      console.error('Erreur Critique (Le serveur 8080 est-il allumé ?):', err.message);
  }
}

// Lancement direct
updateRestaurants();
