// src/screens/CityDetailScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import img5 from '../../assets/images/casa.png';
import casa1 from '../../assets/images/casa1.jpeg';
import casa2 from '../../assets/images/casa2.jpeg';
import casa3 from '../../assets/images/casa3.jpeg';

import img3 from '../../assets/images/rabat.png';
import rabat1 from '../../assets/images/rabat1.png';
import rabat2 from '../../assets/images/rabat2.png';
import rabat3 from '../../assets/images/rabat3.png';

import img1 from '../../assets/images/marrakech.png';
import kech1 from '../../assets/images/marrakech1.png';
import kech2 from '../../assets/images/marrakech2.png';
import kech3 from '../../assets/images/marrakech3.png';

import img2 from '../../assets/images/agadir.png';
import agadir1 from '../../assets/images/agadir1.png';
import agadir2 from '../../assets/images/agadir2.png';
import agadir3 from '../../assets/images/agadir3.png';

import img4 from '../../assets/images/tanger.png';
import tanger1 from '../../assets/images/tanger1.png';
import tanger2 from '../../assets/images/tanger2.png';
import tanger3 from '../../assets/images/tanger3.png';

import img6 from '../../assets/images/fes.png';
import fes1 from '../../assets/images/fes1.png';
import fes2 from '../../assets/images/fes2.png';
import fes3 from '../../assets/images/fes3.png';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ✅ NOUVEAUX IMPORTS BACKEND
import hotelService from '../api/services/hotelService';
import restaurantService from '../api/services/restaurantService';

import favoriteService from '../api/services/favoriteService';
import ContentCard from '../components/ContentCard';

const { width, height } = Dimensions.get('window');

// Données des villes avec images et descriptions (GARDÉES)
const cityData = {
  Casablanca: {
    images: [img5, casa1, casa2, casa3],
    description: 'Capitale économique du Maroc, Casablanca est une métropole moderne qui marie traditions et modernité. La majestueuse Mosquée Hassan II, construite au bord de l\'océan, est l\'un des monuments les plus emblématiques du pays.',
    highlights: [
      'Mosquée Hassan II - Chef-d\'œuvre architectural',
      'Corniche d\'Ain Diab - Promenade en bord de mer',
      'Morocco Mall - Plus grand centre commercial d\'Afrique',
      'Quartier des Habous - Architecture traditionnelle',
    ],
    stadium: 'Grand Stade de Casablanca',
    capacity: '115,000 places',
    facts: 'Plus grande ville du Maroc avec 3,7 millions d\'habitants',
  },
  Rabat: {
    images: [img3, rabat1, rabat2, rabat3],
    description: 'Capitale politique et administrative du Maroc, Rabat est une ville élégante qui offre un mélange harmonieux d\'histoire et de modernité. Classée au patrimoine mondial de l\'UNESCO.',
    highlights: [
      'Kasbah des Oudayas - Forteresse historique',
      'Tour Hassan - Monument emblématique',
      'Chellah - Site archéologique fascinant',
      'Médina de Rabat - Charme authentique',
    ],
    stadium: 'Complexe Sportif Moulay Abdellah',
    capacity: '46,000 places',
    facts: 'Capitale du Maroc depuis 1912',
  },
  Marrakech: {
    images: [img1, kech1, kech2, kech3],
    description: 'La Perle du Sud, Marrakech enchante par ses couleurs ocres, ses souks animés et ses jardins luxuriants. La place Jemaa el-Fna est le cœur battant de cette ville impériale inscrite au patrimoine de l\'UNESCO.',
    highlights: [
      'Place Jemaa el-Fna - Cœur de la médina',
      'Jardin Majorelle - Oasis de tranquillité',
      'Palais de la Bahia - Architecture somptueuse',
      'Souks de Marrakech - Shopping traditionnel',
    ],
    stadium: 'Grand Stade de Marrakech',
    capacity: '46,000 places',
    facts: 'Fondée en 1062 par les Almoravides',
  },
  Agadir: {
    images: [img2, agadir1, agadir2, agadir3],
    description: 'Station balnéaire moderne sur la côte atlantique, Agadir séduit par ses plages de sable fin, son climat ensoleillé toute l\'année et sa marina animée. C\'est la destination idéale pour combiner football et détente.',
    highlights: [
      'Plage d\'Agadir - 10 km de sable fin',
      'Kasbah d\'Agadir Oufella - Vue panoramique',
      'Parc Souss-Massa - Réserve naturelle',
      'Marina d\'Agadir - Ambiance moderne',
    ],
    stadium: 'Stade Adrar',
    capacity: '46,000 places',
    facts: '300 jours de soleil par an',
  },
  Tanger: {
    images: [img4, tanger1, tanger2, tanger3],
    description: 'Porte de l\'Afrique sur le détroit de Gibraltar, Tanger est une ville cosmopolite qui a inspiré de nombreux artistes. Entre Méditerranée et Atlantique, elle offre une atmosphère unique.',
    highlights: [
      'Cap Spartel - Point de rencontre des océans',
      'Grottes d\'Hercule - Site mythologique',
      'Médina de Tanger - Charme historique',
      'Kasbah Museum - Art et histoire',
    ],
    stadium: 'Stade Ibn Batouta',
    capacity: '46,000 places',
    facts: 'À seulement 14 km de l\'Europe',
  },
  Fès: {
    images: [img6, fes1, fes2, fes3],
    description: 'Capitale spirituelle et culturelle du Maroc, Fès abrite la plus ancienne université du monde. Sa médina médiévale, classée au patrimoine mondial, est un labyrinthe fascinant de ruelles et de souks.',
    highlights: [
      'Médina de Fès el-Bali - UNESCO',
      'Université Al Quaraouiyine - Fondée en 859',
      'Tanneries Chouara - Artisanat traditionnel',
      'Palais Royal - Architecture majestueuse',
    ],
    stadium: 'Stade de Fès',
    capacity: '46,000 places',
    facts: 'Plus grande médina médiévale du monde',
  },
};

export default function CityDetailScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { city } = route.params;
  const data = cityData[city.name];
  
  // ✅ NOUVEAUX STATES POUR LES DONNÉES BACKEND
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  

  
  // Animations (GARDÉES)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation d'entrée (GARDÉE)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // ✅ NOUVEAU : Charger les données backend
    loadCityData();
  }, [city.name]);

  // ✅ NOUVELLE FONCTION : Charger toutes les données de la ville
  const loadCityData = async () => {
    try {
      setLoading(true);
      
      // Charger en parallèle
      const [hotelsData, restaurantsData, favoritesData] = await Promise.all([
        hotelService.getHotelsByCity(city.name).catch(() => []),
        restaurantService.getRestaurantsByCity(city.name).catch(() => []),
        favoriteService.getUserFavorites().catch(() => [])
      ]);
      
      setHotels(hotelsData);
      setRestaurants(restaurantsData);
      setFavorites(favoritesData);
      
      console.log(`✅ ${city.name}:`, {
        hotels: hotelsData.length,
        restaurants: restaurantsData.length,
      });
    } catch (err) {
      console.error(`❌ Erreur chargement ${city.name}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVELLE FONCTION : Toggle favori
  const toggleFavorite = async (itemId, type) => {
    try {
      const result = await favoriteService.toggleFavorite(itemId, type);
      
      if (result.action === 'added') {
        setFavorites([...favorites, { itemId, type }]);
      } else {
        setFavorites(favorites.filter(f => !(f.itemId === itemId && f.type === type)));
      }
    } catch (err) {
      console.error('❌ Erreur toggle favori:', err);
    }
  };

  // ✅ NOUVELLE FONCTION : Vérifier si en favori
  const isFavorite = (itemId, type) => {
    return favorites.some(f => f.itemId === itemId && f.type === type);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image avec gradient overlay (GARDÉ) */}
        <View style={styles.headerImageContainer}>
          <Image
            source={data.images[0]}
            style={styles.headerImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          
          {/* Bouton retour (GARDÉ) */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Titre de la ville (GARDÉ) */}
          <Animated.View
            style={[
              styles.cityTitleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.cityEmoji}>{city.emoji}</Text>
            <Text style={styles.cityTitle}>
              {t(`cities.${city.name.toLowerCase()}`)}
            </Text>
            <Text style={styles.citySubtitle}>{data.stadium}</Text>
          </Animated.View>
        </View>

        {/* Section Description (GARDÉE) */}
        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.descriptionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.decorativeLine} />
              <Text style={styles.sectionTitle}>
                {t('cityDetail.discover')} {t(`cities.${city.name.toLowerCase()}`)}
              </Text>
              <View style={styles.decorativeLine} />
            </View>
            <Text style={styles.descriptionText}>
              {t(`cityDetail.${city.name.toLowerCase()}Desc`)}
            </Text>
          </View>

          {/* Stade Info Card (GARDÉ) */}
          <View style={styles.stadiumCard}>
            <LinearGradient
              colors={['#C1272D', '#8B1E23']}
              style={styles.stadiumGradient}
            >
              <Text style={styles.stadiumIcon}>🏟️</Text>
              <Text style={styles.stadiumName}>{data.stadium}</Text>
              <View style={styles.stadiumDivider} />
              <Text style={styles.stadiumCapacity}>{data.capacity}</Text>
              <Text style={styles.stadiumFacts}>{data.facts}</Text>
            </LinearGradient>
          </View>

          {/* Section Highlights (GARDÉE) */}
          <View style={styles.highlightsSection}>
            <Text style={styles.highlightsTitle}>{t('cityDetail.dontMiss')}</Text>
            {data.highlights.map((highlight, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.highlightItem,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.highlightBullet}>
                  <Text style={styles.bulletStar}>✦</Text>
                </View>
                <Text style={styles.highlightText}>{highlight}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Galerie d'images (GARDÉE) */}
          <View style={styles.gallerySection}>
            <Text style={styles.galleryTitle}>{t('cityDetail.gallery')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.gallery}
            >
              {data.images.map((image, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.galleryImageContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Image
                    source={image}
                    style={styles.galleryImage}
                  />
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          {/* ✅ NOUVEAU : Section Hôtels depuis le backend */}
          {!loading && hotels.length > 0 && (
            <View style={styles.backendSection}>
              <View style={styles.backendHeader}>
                <Text style={styles.backendTitle}>🏨 Hôtels à {city.name}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Hotels')}>
                  <Text style={styles.seeAllText}>Voir tout ›</Text>
                </TouchableOpacity>
              </View>
              {hotels.slice(0, 3).map((hotel, index) => (
                <ContentCard
                  key={hotel.id || hotel._id || `hotel-${index}`}
                  item={hotel}
                  type="hotel"
                  isFavorite={isFavorite(hotel.id, 'HOTEL')}
                  onToggleFavorite={() => toggleFavorite(hotel.id, 'HOTEL')}
                  onPress={() => navigation.navigate('HotelDetail', { hotel })}
                />
              ))}
            </View>
          )}

          {/* ✅ NOUVEAU : Section Restaurants depuis le backend */}
          {!loading && restaurants.length > 0 && (
            <View style={styles.backendSection}>
              <View style={styles.backendHeader}>
                <Text style={styles.backendTitle}>🍽️ Restaurants à {city.name}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Restaurants')}>
                  <Text style={styles.seeAllText}>Voir tout ›</Text>
                </TouchableOpacity>
              </View>
              {restaurants.slice(0, 3).map((restaurant, index) => (
                <ContentCard
                  key={restaurant.id || restaurant._id || `rest-${index}`}
                  item={restaurant}
                  type="restaurant"
                  isFavorite={isFavorite(restaurant.id, 'RESTAURANT')}
                  onToggleFavorite={() => toggleFavorite(restaurant.id, 'RESTAURANT')}
                  onPress={() => navigation.navigate('RestaurantDetail', { restaurant })}
                />
              ))}
            </View>
          )}



          {/* ✅ NOUVEAU : Loading state */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C1272D" />
              <Text style={styles.loadingText}>Chargement des offres...</Text>
            </View>
          )}

          {/* CTA Buttons (GARDÉS) */}
          <View style={styles.ctaSection}>
  <TouchableOpacity 
    style={styles.ctaButton} 
    activeOpacity={0.8}
    onPress={() => {
      console.log('Navigation vers Hotels');
      navigation.navigate('Hotels');
    }}
  >
    <LinearGradient
      colors={['#006233', '#004422']}
      style={styles.ctaGradient}
    >
      <Text style={styles.ctaIcon}>🏨</Text>
      <Text style={styles.ctaText}>{t('cityDetail.viewHotels')}</Text>
    </LinearGradient>
  </TouchableOpacity>

            <TouchableOpacity 
    style={styles.ctaButton} 
    activeOpacity={0.8}
    onPress={() => {
      console.log('Navigation vers Restaurants');
      navigation.navigate('Restaurants');
    }}
  >
    <LinearGradient
      colors={['#C1272D', '#8B1E23']}
      style={styles.ctaGradient}
    >
      <Text style={styles.ctaIcon}>🍽️</Text>
      <Text style={styles.ctaText}>{t('cityDetail.restaurants')}</Text>
    </LinearGradient>
  </TouchableOpacity>
</View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Image (GARDÉ)
  headerImageContainer: {
    width: width,
    height: height * 0.5,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButtonText: {
    fontSize: 28,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  cityTitleContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  cityEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  cityTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  citySubtitle: {
    fontSize: 16,
    color: '#F5F5DC',
    letterSpacing: 1,
  },
  
  // Content Section (GARDÉ)
  contentSection: {
    padding: 20,
  },
  descriptionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#C1272D',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  decorativeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#D4AF37',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginHorizontal: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
  },
  
  // Stadium Card (GARDÉ)
  stadiumCard: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  stadiumGradient: {
    padding: 25,
    alignItems: 'center',
  },
  stadiumIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  stadiumName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  stadiumDivider: {
    width: 60,
    height: 3,
    backgroundColor: '#D4AF37',
    marginVertical: 10,
  },
  stadiumCapacity: {
    fontSize: 18,
    color: '#F5F5DC',
    marginBottom: 8,
  },
  stadiumFacts: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  
  // Highlights (GARDÉ)
  highlightsSection: {
    marginBottom: 25,
  },
  highlightsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
  },
  highlightBullet: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C1272D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bulletStar: {
    color: '#D4AF37',
    fontSize: 14,
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  
  // Gallery (GARDÉ)
  gallerySection: {
    marginBottom: 25,
  },
  galleryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  gallery: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  galleryImageContainer: {
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  galleryImage: {
    width: 250,
    height: 180,
    borderRadius: 15,
  },
  
  // ✅ NOUVEAUX STYLES : Sections backend
  backendSection: {
    marginBottom: 25,
  },
  backendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  backendTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: 14,
    color: '#C1272D',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  
  // CTA Buttons (GARDÉS)
  ctaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  ctaButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});