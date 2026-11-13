const mysql = require('mysql2/promise');
const axios = require('axios');

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

async function getHotelPhoto(hotelName, city) {
  try {
    // 1. Cherche l'hôtel avec la NOUVELLE API
    const searchRes = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: `${hotelName} ${city} Morocco`,
        maxResultCount: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.photos',
        },
      }
    );

    const place = searchRes.data.places?.[0];
    if (!place?.photos?.[0]) return null;

    // 2. Récupère l'URL de la photo
    const photoName = place.photos[0].name;
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&key=${GOOGLE_API_KEY}`;

  } catch (err) {
    console.error(`Erreur pour ${hotelName}:`, err.response?.data || err.message);
    return null;
  }
}

async function updateAllHotels() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123*',
    database: 'maroc2030db',
  });

  const [hotels] = await db.execute(
    'SELECT id, name, city FROM hotels WHERE image_url IS NULL'
  );

  console.log(`📋 ${hotels.length} hôtels à mettre à jour...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    const imageUrl = await getHotelPhoto(hotel.name, hotel.city);

    if (imageUrl) {
      await db.execute(
        'UPDATE hotels SET image_url = ? WHERE id = ?',
        [imageUrl, hotel.id]
      );
      success++;
      console.log(`✅ ${i + 1}/${hotels.length} - ${hotel.name}`);
    } else {
      failed++;
      console.log(`⚠️  ${i + 1}/${hotels.length} - Pas de photo: ${hotel.name}`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n🎉 Terminé ! ✅ ${success} photos | ⚠️ ${failed} sans photo`);
  await db.end();
}

updateAllHotels();
