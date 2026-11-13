import { useState, useEffect, useCallback } from 'react';
import restaurantService from '../../../api/services/restaurantService';
import favoriteService from '../../../api/services/favoriteService';
import { setSelectedMapItem } from '../../../utils/mapStore';

export const useRestaurants = (navigation) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCuisineModal, setShowCuisineModal] = useState(false);
  


  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const restaurantsData = await restaurantService.getAllRestaurants();

      let favoritesData = [];
      try {
        favoritesData = await favoriteService.getUserFavorites();
      } catch (err) {
        console.warn('Favoris non disponibles:', err.message);
      }

      setRestaurants(restaurantsData);
      setFavorites(favoritesData);

      console.log(`✅ ${restaurantsData.length} restaurants`);
    } catch (err) {
      console.error('❌ Erreur restaurants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterRestaurants = useCallback(() => {
    let filtered = [...restaurants];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(restaurant =>
        restaurant.name?.toLowerCase().includes(query) ||
        restaurant.city?.toLowerCase().includes(query) ||
        restaurant.cuisine?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCity !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.city === selectedCity);
    }
    
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.cuisine === selectedCuisine);
    }
    
    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCity, selectedCuisine, restaurants]);

  useEffect(() => {
    filterRestaurants();
  }, [filterRestaurants]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const isFavorite = (restaurantId) => {
    return favorites.some(f => f.itemId === restaurantId && f.type === 'RESTAURANT');
  };

  const toggleFavorite = async (restaurantId) => {
    try {
      const isCurrentlyFavorite = isFavorite(restaurantId);
      
      if (isCurrentlyFavorite) {
        setFavorites(favorites.filter(f => !(f.itemId === restaurantId && f.type === 'RESTAURANT')));
      } else {
        setFavorites([...favorites, { itemId: restaurantId, type: 'RESTAURANT' }]);
      }
      
      await favoriteService.toggleFavorite(restaurantId, 'RESTAURANT');
      
      try {
        const updatedFavorites = await favoriteService.getUserFavorites();
        setFavorites(updatedFavorites);
      } catch (err) {
        console.warn('Sync favoris échouée:', err.message);
      }
      
    } catch (err) {
      console.warn('❌ Erreur favori contournée:', err.message);
      try {
        const currentFavorites = await favoriteService.getUserFavorites();
        setFavorites(currentFavorites);
      } catch (e) {
        console.warn('Rollback favoris échoué:', e.message);
      }
    }
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('all');
    setSelectedCuisine('all');
  };

  const navigateToMap = (restaurant) => {
    setSelectedMapItem({ ...restaurant, itemType: 'restaurant' });
    try {
      navigation.navigate('Map');
    } catch (error) {
      navigation.getParent()?.navigate('Map');
    }
  };

  const cities = ['all', ...new Set(restaurants.map(r => r.city).filter(Boolean))];
  const cuisines = ['all', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];
  
  const getCityLabel = () => selectedCity === 'all' ? 'Ville' : selectedCity;
  const getCuisineLabel = () => selectedCuisine === 'all' ? 'Cuisine' : selectedCuisine;
  
  const hasActiveFilters = searchQuery.trim() || selectedCity !== 'all' || selectedCuisine !== 'all';

  return {
    filteredRestaurants,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedCuisine,
    setSelectedCuisine,
    showCityModal,
    setShowCityModal,
    showCuisineModal,
    setShowCuisineModal,
    onRefresh,
    loadData,
    toggleFavorite,
    isFavorite,
    clearFilters,
    navigateToMap,
    cities,
    cuisines,
    getCityLabel,
    getCuisineLabel,
    hasActiveFilters,
  };
};
