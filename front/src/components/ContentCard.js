// src/components/ContentCard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getTranslatedField } from '../utils/translationUtils';
import { GOOGLE_API_KEY, API_BASE_URL } from '../api/config';
import { useTheme } from '../context/ThemeContext';

export default function ContentCard({
  item,
  type = 'hotel',
  isFavorite = false,
  onToggleFavorite,
  onPress,
}) {
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);
  const navigation = useNavigation();
  const { colors: themeColors, isDarkMode } = useTheme();

  const typeColors = {
    hotel: '#4A90E2',
    restaurant: '#FF6B35',
    activity: '#10B981',
  };

  const icons = {
    hotel: 'bed',
    restaurant: 'restaurant',
    activity: 'flag',
  };

  const { t, i18n } = useTranslation();
  if (typeof t !== 'function') {
    console.warn('⚠️ useTranslation did not return a function for t in ContentCard');
  }

  const placeholderColor = typeColors[type] || '#4A90E2';
  const icon = icons[type] || 'image';

  const name = getTranslatedField(item, 'name', i18n.language) || getTranslatedField(item, 'title', i18n.language) || 'Sans nom';
  const city = getTranslatedField(item, 'city', i18n.language) || '';
  const price = item?.price || item?.priceRange || '';
  const rating = item?.rating || item?.averageRating || 0;
  
  useEffect(() => {
    const url = item?.imageUrl || item?.image_url || '';
    setCurrentImageUrl(url);
    setImageError(false);
  }, [item]);

  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (url.includes('example.com')) return false;
    // Si c'est une URL complète ou un chemin relatif valide
    return url.startsWith('http') || url.length > 3;
  };

  const getFullImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Utilise l'IP du gateway pour les images relatives
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const repairGoogleImage = async (originalUrl) => {
    if (isRepairing || !originalUrl.includes('google')) return;
    try {
      setIsRepairing(true);
      const match = originalUrl.match(/places\/([^\/]+)\//);
      const placeId = match ? match[1] : null;
      if (!placeId) {
        setImageError(true);
        return;
      }
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_API_KEY}`;
      const response = await fetch(detailsUrl);
      const data = await response.json();
      if (data.result && data.result.photos && data.result.photos.length > 0) {
        const photoRef = data.result.photos[0].photo_reference;
        const newUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
        setCurrentImageUrl(newUrl);
        setImageError(false);
      } else {
        setImageError(true);
      }
    } catch (err) {
      setImageError(true);
    } finally {
      setIsRepairing(false);
    }
  };

  const hasValidImage = isValidImageUrl(currentImageUrl) && !imageError;

  const handleFavoritePress = (e) => {
    if (onToggleFavorite) onToggleFavorite();
  };

  const handleCall = () => {
    const phoneNumber = item?.phone || item?.telephone;
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleBook = () => {
    navigation.navigate('Booking', { item, type });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeColors.card }]}
      onPress={() => { if (onPress) onPress(); }}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {isRepairing ? (
          <View style={[styles.loaderContainer, { backgroundColor: themeColors.background }]}>
            <ActivityIndicator size="small" color={themeColors.primary} />
          </View>
        ) : hasValidImage ? (
          <Image
            source={{ uri: getFullImageUrl(currentImageUrl) }}
            style={styles.image}
            onError={() => {
              if (currentImageUrl.includes('google')) {
                repairGoogleImage(currentImageUrl);
              } else {
                setImageError(true);
              }
            }}
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
            <Ionicons name={icon} size={32} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: themeColors.text }]} numberOfLines={2}>
            {name}
          </Text>
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={[styles.favoriteButton, { backgroundColor: isDarkMode ? '#333' : '#F7F7F7' }]}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? themeColors.primary : themeColors.subtext}
            />
          </TouchableOpacity>
        </View>

        {city ? (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={14} color={themeColors.primary} />
            <Text style={[styles.locationText, { color: themeColors.subtext }]} numberOfLines={1}>
              {city}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          {rating > 0 ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FFFFFF" />
              <Text style={styles.ratingText}>
                {typeof rating === 'number' ? rating.toFixed(1) : rating}
              </Text>
            </View>
          ) : <View />}

          {price ? (
            <Text style={[styles.price, { color: themeColors.primary }]} numberOfLines={1}>
              {price}
            </Text>
          ) : null}
        </View>

        <View style={styles.actionButtons}>
          {['hotel', 'restaurant'].includes(type) && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.bookBtn, { backgroundColor: themeColors.primary }]} 
              onPress={handleBook}
            >
              <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
              <Text style={styles.bookBtnText}>{t('hotels.bookNow')}</Text>
            </TouchableOpacity>
          )}

          {type === 'hotel' && (item?.phone || item?.telephone) && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.callBtn, { backgroundColor: isDarkMode ? '#333' : '#FFF0F0', borderColor: isDarkMode ? '#444' : '#FFD6D6' }]} 
              onPress={handleCall}
            >
              <Ionicons name="call-outline" size={16} color={themeColors.primary} />
              <Text style={[styles.callBtnText, { color: themeColors.primary }]}>{t('common.call') || 'Call'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 16,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    alignItems: 'center',
  },
  imageContainer: { width: 100, height: 100, borderRadius: 14, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  loaderContainer: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  placeholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, paddingLeft: 16, justifyContent: 'space-between', minHeight: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { flex: 1, fontSize: 16, fontWeight: '800', marginRight: 8, lineHeight: 22 },
  favoriteButton: { borderRadius: 20, padding: 8, zIndex: 10, justifyContent: 'center', alignItems: 'center' },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 13, marginLeft: 4, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFB800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  price: { fontSize: 15, fontWeight: '800' },
  actionButtons: { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
  bookBtn: { },
  bookBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  callBtn: { borderWidth: 1 },
  callBtnText: { fontSize: 13, fontWeight: 'bold' },
});