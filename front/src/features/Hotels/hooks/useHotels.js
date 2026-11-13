import { useState, useEffect, useCallback } from 'react';
import hotelService from '../../../api/services/hotelService';
import favoriteService from '../../../api/services/favoriteService';
import { setSelectedMapItem } from '../../../utils/mapStore';

export const useHotels = (navigation) => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStars, setSelectedStars] = useState('all');
  
  const [showCityModal, setShowCityModal] = useState(false);
  const [showStarsModal, setShowStarsModal] = useState(false);
  


  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const hotelsData = await hotelService.getAllHotels();

      let favoritesData = [];
      try {
        favoritesData = await favoriteService.getUserFavorites();
      } catch (err) {
        console.warn('Favoris non disponibles:', err.message);
      }

      setHotels(hotelsData);
      setFavorites(favoritesData);

      console.log(`✅ ${hotelsData.length} hôtels`);
    } catch (err) {
      console.error('❌ Erreur hotels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterHotels = useCallback(() => {
    let filtered = [...hotels];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(hotel =>
        hotel.name?.toLowerCase().includes(query) ||
        hotel.city?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCity !== 'all') {
      filtered = filtered.filter(hotel => hotel.city === selectedCity);
    }
    
    if (selectedStars !== 'all') {
      const stars = parseInt(selectedStars, 10);
      filtered = filtered.filter(hotel => hotel.stars === stars);
    }
    
    setFilteredHotels(filtered);
  }, [searchQuery, selectedCity, selectedStars, hotels]);

  useEffect(() => {
    filterHotels();
  }, [filterHotels]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const isFavorite = (hotelId) => {
    return favorites.some(f => f.itemId === hotelId && f.type === 'HOTEL');
  };

  const toggleFavorite = async (hotelId) => {
    try {
      const isCurrentlyFavorite = isFavorite(hotelId);
      
      if (isCurrentlyFavorite) {
        setFavorites(favorites.filter(f => !(f.itemId === hotelId && f.type === 'HOTEL')));
      } else {
        setFavorites([...favorites, { itemId: hotelId, type: 'HOTEL' }]);
      }
      
      await favoriteService.toggleFavorite(hotelId, 'HOTEL');
      
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
    setSelectedStars('all');
  };

  const navigateToMap = (hotel) => {
    setSelectedMapItem({ ...hotel, itemType: 'hotel' });
    
    try {
      navigation.navigate('Map');
    } catch (error) {
      navigation.getParent()?.navigate('Map');
    }
  };

  const cities = ['all', ...new Set(hotels.map(h => h.city).filter(Boolean))];
  const starsOptions = ['all', '1', '2', '3', '4', '5'];
  
  const getCityLabel = () => selectedCity === 'all' ? 'Ville' : selectedCity;
  const getStarsLabel = () => selectedStars === 'all' ? 'Étoiles' : `${selectedStars} ★`;
  const hasActiveFilters = searchQuery.trim() || selectedCity !== 'all' || selectedStars !== 'all';

  return {
    filteredHotels,
    loading,
    error,
    refreshing,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    selectedStars,
    setSelectedStars,
    showCityModal,
    setShowCityModal,
    showStarsModal,
    setShowStarsModal,
    onRefresh,
    loadData,
    toggleFavorite,
    isFavorite,
    clearFilters,
    navigateToMap,
    cities,
    starsOptions,
    getCityLabel,
    getStarsLabel,
    hasActiveFilters,
  };
};
