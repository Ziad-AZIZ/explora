const openHotelOnMap = (hotel) => {
  // Préparer les données minimales requises
  setSelectedMapItem({
    id: hotel.id,
    name: hotel.name,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    city: hotel.city,
    type: 'hotel',
  });
  
  // Naviguer vers la carte
  navigation.navigate('Map');
};
 
// Dans votre JSX :
<TouchableOpacity 
  style={styles.mapButton} 
  onPress={() => openHotelOnMap(hotel)}
>
  <Ionicons name="map" size={20} color="#FFF" />
  <Text style={styles.mapButtonText}>Voir sur la carte</Text>
</TouchableOpacity>
 