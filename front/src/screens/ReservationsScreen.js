// src/screens/ReservationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoadingView, EmptyView } from '../components/StateViews';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { API_ENDPOINTS, API_BASE_URL } from '../api/config';
import { useTheme } from '../context/ThemeContext';

export default function ReservationsScreen({ navigation }) {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const fetchReservations = async () => {
    try {
      if (!token) return;
      const response = await apiClient.get(API_ENDPOINTS.RESERVATIONS);
      console.log('📦 Reservations fetched:', response.data.map(r => ({ id: r.id, name: r.establishmentName, img: r.imageUrl?.substring(0, 30) + '...' })));
      setReservations(response.data);
    } catch (err) {
      console.log('Error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    const unsubscribe = navigation.addListener('focus', () => { fetchReservations(); });
    return unsubscribe;
  }, [navigation]);

  const renderReservationCard = ({ item }) => {
    const statusColor = item.status === 'CONFIRMED' ? '#2E7D32' : (item.status === 'COMPLETED' ? '#666' : '#F57C00');
    
    // Déterminer l'icône et la couleur selon le type
    let typeIcon = 'business';
    let typeColor = colors.primary;
    const type = (item.establishmentType || '').toLowerCase();

    if (type === 'hotel') {
      typeIcon = 'bed';
      typeColor = '#3498db';
    } else if (type === 'restaurant') {
      typeIcon = 'restaurant';
      typeColor = '#e67e22';
    } else if (type === 'match' || type === 'activity') {
      typeIcon = 'football';
      typeColor = '#C1272D';
    }

    // Debug: log exact URL
    if (item.imageUrl) {
      console.log(`🖼️ Image for ${item.establishmentName}: "${item.imageUrl.substring(0, 50)}..."`);
    } else {
      console.warn(`❌ No image for ${item.establishmentName}`);
    }

    const getFullImageUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardMain}>
          <View style={styles.imageWrapper}>
            {item.imageUrl ? (
              <Image 
                source={{ uri: getFullImageUrl(item.imageUrl) }} 
                style={styles.cardImage}
                resizeMode="cover"
                onError={(e) => console.log(`❌ Failed to load image for ${item.establishmentName}:`, e.nativeEvent.error)}
              />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: typeColor + '20' }]}>
                <Ionicons name={typeIcon} size={30} color={typeColor} />
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Ionicons name={typeIcon} size={12} color="#FFF" />
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {item.establishmentName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.subtext} />
              <Text style={[styles.detailText, { color: colors.subtext }]}>
                {new Date(item.reservationDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Ionicons name="people-outline" size={14} color={colors.subtext} />
              <Text style={[styles.detailText, { color: colors.subtext }]}>
                {item.numberOfPeople || 1} {t('booking.guests') || 'personnes'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) return <LoadingView message={t('common.loading')} color={colors.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ImageBackground source={require('../../assets/images/background.png')} style={styles.backgroundImage} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('reservations.myReservations')}</Text>
          </View>
          <FlatList
            data={reservations}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderReservationCard}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReservations} colors={[colors.primary]} />}
            ListEmptyComponent={<EmptyView icon="calendar-outline" title={t('reservations.noReservations')} color={colors.primary} />}
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  header: { 
    padding: 20, 
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  listContent: { padding: 16, gap: 16 },
  card: { 
    borderRadius: 20, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  cardMain: {
    flexDirection: 'row',
    padding: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  cardImage: { 
    width: 90, 
    height: 90, 
    borderRadius: 15,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: { 
    flex: 1,
    fontSize: 17, 
    fontWeight: '700',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { 
    fontSize: 11, 
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  detailText: { 
    fontSize: 13,
    fontWeight: '500',
  },
});