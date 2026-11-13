// src/screens/MapScreenV2_Backend.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Services
import hotelService from '../api/services/hotelService';
import restaurantService from '../api/services/restaurantService';

import { getSelectedMapItem, clearSelectedMapItem } from '../utils/mapStore';
import { useTranslation } from 'react-i18next';
import { getTranslatedField } from '../utils/translationUtils';

export default function MapScreen({ route }) {
  const { i18n } = useTranslation();
  const mapRef = useRef(null);
  
  // États
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [itineraryCoords, setItineraryCoords] = useState(null);
  
  // Filtres
  const [activeCategories, setActiveCategories] = useState({
    hotels: true,
    restaurants: true,
  });

  // Région initiale (Maroc - centre)
  const [region, setRegion] = useState({
    latitude: 33.5731,
    longitude: -7.5898,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================
  useEffect(() => {
    loadData();
    checkSelectedItem();
  }, [route?.params]);

  // Vérifie si un lieu a été sélectionné depuis un autre écran
  const checkSelectedItem = () => {
    let item = getSelectedMapItem();
    
    if (!item && route?.params) {
      item = route.params.hotel || route.params.restaurant || route.params.activity;
    }

    if (item) {
      console.log('📍 Lieu sélectionné détecté:', item.name);
      
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      // Centrer sur le lieu
      if (!isNaN(lat) && !isNaN(lng)) {
        setTimeout(() => {
          mapRef.current?.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }, 500);
      }
      
      // Afficher le lieu dans le bottom sheet
      let emoji = '🎯';
      if (item.type === 'hotel' || item.type === 'HOTEL') emoji = '🏨';
      else if (item.type === 'restaurant' || item.type === 'RESTAURANT') emoji = '🍽️';

      setSelectedPlace({ ...item, emoji });
      
      // Nettoyer après utilisation
      setTimeout(() => clearSelectedMapItem(), 1000);
    }
  };

  // Charger tous les lieux depuis le backend
  const loadData = async () => {
    try {
      setLoading(true);

      // Demander la permission de localisation
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (err) {
        console.warn('Localisation non disponible:', err);
      }

      // Charger tous les lieux
      let hotels = [];
      let restaurants = [];
      

      try {
        hotels = await hotelService.getAllHotels();
        console.log('✅ Hotels chargés:', hotels?.length || 0);
      } catch (err) {
        console.error('❌ Erreur hotels:', err);
      }

      try {
        restaurants = await restaurantService.getAllRestaurants();
        console.log('✅ Restaurants chargés:', restaurants?.length || 0);
      } catch (err) {
        console.error('❌ Erreur restaurants:', err);
      }

      

      // Normaliser les données
      const allPlaces = [
        ...normalizeData(hotels, 'hotel'),
        ...normalizeData(restaurants, 'restaurant'),
        
      ];

      setPlaces(allPlaces);
      setFilteredPlaces(allPlaces);
      
      console.log(`✅ Total: ${allPlaces.length} lieux chargés sur la carte`);
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les lieux');
    } finally {
      setLoading(false);
    }
  };

  // Coordonnées de fallback par ville
  const cityCoordinates = {
    'casablanca': { lat: 33.5731, lng: -7.5898 },
    'rabat': { lat: 34.0209, lng: -6.8416 },
    'marrakech': { lat: 31.6295, lng: -7.9811 },
    'tanger': { lat: 35.7595, lng: -5.8340 },
    'fes': { lat: 34.0331, lng: -5.0003 },
    'agadir': { lat: 30.4278, lng: -9.5981 },
    'essaouira': { lat: 31.5085, lng: -9.7595 },
    'chefchaouen': { lat: 35.1688, lng: -5.2636 },
  };

  const getFallbackCoords = (city, id) => {
    // Utiliser sin et cos pour un nuage de points naturel
    const hash1 = Math.sin(id * 12.9898) * 43758.5453;
    const hash2 = Math.cos(id * 78.233) * 43758.5453;
    
    // ASTUCE GEOGRAPHIQUE: L'océan est à l'Ouest du Maroc. 
    // Pour éviter de noyer les hôtels dans l'océan, on force la longitude à être 
    // strictement POSITIVE (+ vers l'Est, donc dans les terres fermes).
    const offsetLat = (hash1 - Math.floor(hash1) - 0.5) * 0.04; 
    const offsetLng = (hash2 - Math.floor(hash2)) * 0.05;
    
    let base = { lat: 33.5731, lng: -7.5898 }; // Casa par défaut
    if (city) {
      const foundCity = Object.keys(cityCoordinates).find(c => city.toLowerCase().includes(c));
      if (foundCity) {
        base = cityCoordinates[foundCity];
      }
    }
    return { latitude: base.lat + offsetLat, longitude: base.lng + offsetLng };
  };

  // Normaliser les données pour avoir une structure commune
  const normalizeData = (items, type) => {
    // Vérifier que items est bien un tableau
    if (!Array.isArray(items)) {
      console.warn(`⚠️ ${type}: données non-tableau reçues`, typeof items);
      return [];
    }

    return items
      .map(item => {
        let lat = parseFloat(item?.latitude);
        let lng = parseFloat(item?.longitude);
        
        // Appliquer des coordonnées fixes s'il en manque dans l'API
        if (isNaN(lat) || isNaN(lng)) {
          const fallback = getFallbackCoords(item?.city || item?.address, item?.id || Math.floor(Math.random() * 1000));
          lat = fallback.latitude;
          lng = fallback.longitude;
        }

        return {
          ...item,
          latitude: lat,
          longitude: lng,
          type,
          emoji: type === 'hotel' ? '🏨' : type === 'restaurant' ? '🍽️' : '🎯',
          color: type === 'hotel' ? '#C1272D' : type === 'restaurant' ? '#E67E22' : '#3498DB',
        };
      });
  };

  // ============================================
  // FILTRES ET RECHERCHE
  // ============================================
  useEffect(() => {
    filterPlaces();
  }, [searchQuery, activeCategories, places]);

  const filterPlaces = () => {
    let filtered = [...places];

    if (searchQuery) {
      // Priorité absolue à la recherche : 
      // Si on cherche un texte, on l'affiche même si la catégorie "Hôtel" est décochée !
      filtered = filtered.filter(place =>
        place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // S'il n'y a pas de recherche en cours, on applique les filtres normaux des boutons
      filtered = filtered.filter(place => {
        if (place.type === 'hotel') return activeCategories.hotels;
        if (place.type === 'restaurant') return activeCategories.restaurants;
        return true;
      });
    }

    setFilteredPlaces(filtered);
  };

  const toggleCategory = (category) => {
    setActiveCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const centerOnPlace = (place) => {
    setSelectedPlace(place);
    mapRef.current?.animateToRegion({
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  const centerOnUser = async () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    } else {
      Alert.alert('Localisation', 'Impossible de trouver votre position');
    }
  };

  // Décodeur de trajectoire pour Google Maps
  const decodePolyline = (t, e) => {
    for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5); u < t.length; ) {
      a = null, h = 0, i = 0;
      do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
      n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0;
      do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32);
      o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o, d.push([l / c, r / c]);
    }
    return d.map(x => ({ latitude: x[0], longitude: x[1] }));
  };

  // Calcul et Dessin de l'Itinéraire Interne via l'API GOOGLE MAPS
  const drawItinerary = async (place) => {
    if (!userLocation) {
      Alert.alert('Localisation requise', 'Activez la localisation pour calculer le trajet.');
      return;
    }
    
    try {
      const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${place.latitude},${place.longitude}&key=${GOOGLE_API_KEY}`;
      
      const resp = await fetch(url);
      const data = await resp.json();
      
      if (data.routes && data.routes.length > 0) {
        const polylineStr = data.routes[0].overview_polyline.points;
        const coords = decodePolyline(polylineStr);
        setItineraryCoords(coords);
        
        // Cadrer la carte
        mapRef.current?.fitToCoordinates([userLocation, place], {
          edgePadding: { top: 50, right: 50, bottom: 400, left: 50 },
          animated: true
        });
      } else {
        Alert.alert('Erreur', 'Trajet impossible à calculer via Google.');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de joindre Google Directions API.');
    }
  };

  // Lancer le VRAI GPS (Google Maps / Apple Maps)
  const openGPS = (place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    Linking.openURL(url);
  };

  // ============================================
  // RENDU
  // ============================================
  

  return (
    <View style={styles.container}>
      {/* CARTE */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        mapType={mapType}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
      >
        {/* Marqueurs des lieux */}
        {filteredPlaces.map((place) => (
          <Marker
            key={`${place.type}-${place.id}`}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={getTranslatedField(place, 'name', i18n.language) || getTranslatedField(place, 'title', i18n.language)}
            description={getTranslatedField(place, 'city', i18n.language)}
            pinColor={place.color}
            onPress={() => setSelectedPlace(place)}
          >
            <View style={[styles.markerContainer, { backgroundColor: place.color }]}>
              <Text style={styles.markerEmoji}>{place.emoji}</Text>
            </View>
          </Marker>
        ))}

        {/* TRACÉ DE L'ITINÉRAIRE */}
        {itineraryCoords && (
          <Polyline
            coordinates={itineraryCoords}
            strokeColor="#3498DB"
            strokeWidth={5}
          />
        )}
      </MapView>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un lieu..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setIsSearching(true);
          }}
          onFocus={() => setIsSearching(true)}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            setIsSearching(false);
          }}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* SUGGESTIONS DE RECHERCHE VISUELLES */}
      {isSearching && searchQuery.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredPlaces.length === 0 ? (
              <Text style={styles.noSuggestionText}>Aucun lieu trouvé</Text>
            ) : (
              filteredPlaces.slice(0, 6).map((place) => (
                <TouchableOpacity
                  key={`sugg-${place.type}-${place.id}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchQuery(getTranslatedField(place, 'name', i18n.language) || place.name);
                    setIsSearching(false);
                    centerOnPlace(place);
                  }}
                >
                  <Text style={styles.suggestionEmoji}>{place.emoji}</Text>
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionName} numberOfLines={1}>{getTranslatedField(place, 'name', i18n.language) || getTranslatedField(place, 'title', i18n.language)}</Text>
                    <Text style={styles.suggestionCity} numberOfLines={1}>
                      {getTranslatedField(place, 'city', i18n.language) || place.address || 'Maroc'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* PANNEAU FILTRES FIXES EN HAUT */}
      <View style={styles.filtersTopRow}>
        <TouchableOpacity
          style={[styles.categoryPill, activeCategories.hotels && styles.categoryPillActive]}
          onPress={() => toggleCategory('hotels')}
        >
          <Text style={styles.categoryPillEmoji}>🏨</Text>
          <Text style={[styles.categoryPillText, activeCategories.hotels && styles.categoryTextActive]}>Hôtels ({filteredPlaces.filter(p => p.type === 'hotel').length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryPill, activeCategories.restaurants && styles.categoryPillActive]}
          onPress={() => toggleCategory('restaurants')}
        >
          <Text style={styles.categoryPillEmoji}>🍽️</Text>
          <Text style={[styles.categoryPillText, activeCategories.restaurants && styles.categoryTextActive]}>Restaurants ({filteredPlaces.filter(p => p.type === 'restaurant').length})</Text>
        </TouchableOpacity>
      </View>

      {/* CONTROLES FLOTTANTS BAS GAUCHE */}
      <View style={[styles.bottomLeftControls, { bottom: selectedPlace ? 330 : 40 }]}>
        <TouchableOpacity style={styles.sideButton} onPress={centerOnUser}>
          <Ionicons name="navigate" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideButton} onPress={() => setMapType(prev => prev === 'standard' ? 'hybrid' : 'standard')}>
          <Ionicons name={mapType === 'standard' ? 'earth' : 'map'} size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET - LIEU SÉLECTIONNÉ */}
      {selectedPlace && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetTitle}>
              <Text style={styles.bottomSheetEmoji}>{selectedPlace.emoji}</Text>
              <View style={styles.bottomSheetTitleText}>
                <Text style={styles.bottomSheetName}>{getTranslatedField(selectedPlace, 'name', i18n.language) || getTranslatedField(selectedPlace, 'title', i18n.language) || 'Sans nom'}</Text>
                <Text style={styles.bottomSheetCity}>{getTranslatedField(selectedPlace, 'city', i18n.language) || selectedPlace.address || 'Ville inconnue'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => { setSelectedPlace(null); setItineraryCoords(null); }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bottomSheetContent}>
            {selectedPlace.description && selectedPlace.type?.toLowerCase() !== 'hotel' && (
              <Text style={styles.bottomSheetDescription}>
                {selectedPlace.description.replace(/<[^>]+>/g, '').trim()}
              </Text>
            )}

            {selectedPlace.address && (
              <View style={styles.bottomSheetInfo}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.bottomSheetInfoText}>{selectedPlace.address}</Text>
              </View>
            )}

            {selectedPlace.phone && (
              <View style={styles.bottomSheetInfo}>
                <Ionicons name="call" size={16} color="#666" />
                <Text style={styles.bottomSheetInfoText}>{selectedPlace.phone}</Text>
              </View>
            )}

            {selectedPlace.rating && (
              <View style={styles.bottomSheetInfo}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.bottomSheetInfoText}>{selectedPlace.rating} / 5</Text>
              </View>
            )}
          </ScrollView>

          {/* BOUTONS D'ACTIONS */}
          <View style={styles.actionButtonsRow}>
            {itineraryCoords ? (
              <TouchableOpacity
                style={[styles.directionsButton, { backgroundColor: '#E74C3C', flex: 1 }]}
                onPress={() => setItineraryCoords(null)}
              >
                <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                <Text style={styles.directionsButtonText}>Fermer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.directionsButton, { flex: 1 }]}
                onPress={() => drawItinerary(selectedPlace)}
              >
                <Ionicons name="map" size={18} color="#FFFFFF" />
                <Text style={styles.directionsButtonText}>Tracer</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.directionsButton, { backgroundColor: '#27AE60', flex: 1.5 }]}
              onPress={() => openGPS(selectedPlace)}
            >
              <Ionicons name="navigate" size={18} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>Démarrer GPS</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  
  // Marqueurs
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerEmoji: {
    fontSize: 18,
  },
  
  // Barre de recherche
  searchBar: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  
  // Suggestions de recherche
  suggestionsContainer: {
    position: 'absolute',
    top: 105,
    left: 15,
    right: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 250,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 100, // Au dessus des boutons
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  suggestionCity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noSuggestionText: {
    padding: 15,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Filtres fixes en haut
  filtersTopRow: {
    position: 'absolute',
    top: 110,
    left: 15,
    flexDirection: 'row',
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#C1272D',
  },
  categoryPillEmoji: {
    fontSize: 16,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  
  // Controles en bas à gauche
  bottomLeftControls: {
    position: 'absolute',
    left: 15,
    flexDirection: 'column',
    gap: 12,
    zIndex: 10,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 300,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  bottomSheetTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bottomSheetEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  bottomSheetTitleText: {
    flex: 1,
  },
  bottomSheetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  bottomSheetCity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bottomSheetContent: {
    maxHeight: 120,
  },
  bottomSheetDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomSheetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomSheetInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C1272D',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});