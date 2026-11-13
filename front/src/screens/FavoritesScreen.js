// src/screens/FavoritesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ContentCard from '../components/ContentCard';
import favoriteService from '../api/services/favoriteService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function FavoritesScreen({ navigation }) {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const { colors, isDarkMode } = useTheme();

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getUserFavoritesWithDetails();
      setFavorites({ ...data, totalCount: (data.hotels?.length || 0) + (data.restaurants?.length || 0) });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (itemId, type) => {
    try {
      // On retire le favori via le service
      await favoriteService.toggleFavorite(itemId, type.toUpperCase());
      // On recharge la liste pour mettre à jour l'affichage
      await loadFavorites();
    } catch (err) {
      console.error('Erreur suppression favori:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ImageBackground source={require('../../assets/images/background.png')} style={styles.backgroundImage} resizeMode="cover">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.tabsContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
              <TabItem label={t('common.all')} active={selectedTab === 'all'} onPress={() => setSelectedTab('all')} colors={colors} />
              <TabItem label={t('services.hotels')} active={selectedTab === 'hotels'} onPress={() => setSelectedTab('hotels')} colors={colors} />
              <TabItem label={t('services.restaurants')} active={selectedTab === 'restaurants'} onPress={() => setSelectedTab('restaurants')} colors={colors} />
            </ScrollView>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
          >
            {(selectedTab === 'all' || selectedTab === 'hotels') && favorites?.hotels?.map(hotel => (
              <ContentCard key={hotel.id} item={hotel} type="hotel" isFavorite={true} onToggleFavorite={() => handleToggleFavorite(hotel.id, 'hotel')} onPress={() => navigation.navigate('MainTabs', { screen: 'Map', params: { hotel } })} />
            ))}
            {(selectedTab === 'all' || selectedTab === 'restaurants') && favorites?.restaurants?.map(restaurant => (
              <ContentCard key={restaurant.id} item={restaurant} type="restaurant" isFavorite={true} onToggleFavorite={() => handleToggleFavorite(restaurant.id, 'restaurant')} onPress={() => navigation.navigate('MainTabs', { screen: 'Map', params: { restaurant } })} />
            ))}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function TabItem({ label, active, onPress, colors }) {
  return (
    <TouchableOpacity style={[styles.tab, active ? { backgroundColor: colors.primary } : { backgroundColor: colors.background }]} onPress={onPress}>
      <Text style={[styles.tabText, active ? { color: '#FFF' } : { color: colors.subtext }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabsContainer: { borderBottomWidth: 1, paddingVertical: 8 },
  tabsContent: { paddingHorizontal: 12, alignItems: 'center' },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, marginRight: 8 },
  tabText: { fontSize: 12, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 12 },
});