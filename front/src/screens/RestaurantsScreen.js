import React from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, RefreshControl, TextInput,
  ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ContentCard from '../components/ContentCard';
import FilterModal from '../components/FilterModal';
import { LoadingView, ErrorView, EmptyView } from '../components/StateViews';
import { useTranslation } from 'react-i18next';
import { useRestaurants } from '../features/Restaurants/hooks/useRestaurants';

const COLORS = {
  primary: '#244e27ff', // Vert foncé
  primaryLight: '#E8F5E9',
  accent: '#244e27ff',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  border: '#E8E8E8',
  errorBg: '#FFEBEE',
};

export default function RestaurantsScreen({ navigation }) {
  const { t } = useTranslation();
  const {
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
  } = useRestaurants(navigation);

  const renderRestaurantCard = ({ item }) => (
    <ContentCard
      item={item}
      type="restaurant"
      isFavorite={isFavorite(item.id)}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onPress={() => navigateToMap(item)}
    />
  );



  return (
    <SafeAreaView style={styles.container}>
      {/* Header moderne */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Restaurants</Text>
          <Text style={styles.headerSubtitle}>
            {filteredRestaurants.length} résultat{filteredRestaurants.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Barre de recherche moderne */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un restaurant..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filtres modernes */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCity !== 'all' && styles.filterChipActive
            ]}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="location" 
              size={16} 
              color={selectedCity !== 'all' ? '#FFFFFF' : COLORS.textSecondary} 
            />
            <Text style={[
              styles.filterChipText,
              selectedCity !== 'all' && styles.filterChipTextActive
            ]}>
              {getCityLabel()}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={14} 
              color={selectedCity !== 'all' ? '#FFFFFF' : COLORS.textLight} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCuisine !== 'all' && styles.filterChipActive
            ]}
            onPress={() => setShowCuisineModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="restaurant" 
              size={16} 
              color={selectedCuisine !== 'all' ? '#FFFFFF' : COLORS.textSecondary} 
            />
            <Text style={[
              styles.filterChipText,
              selectedCuisine !== 'all' && styles.filterChipTextActive
            ]}>
              {getCuisineLabel()}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={14} 
              color={selectedCuisine !== 'all' ? '#FFFFFF' : COLORS.textLight} 
            />
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.resetChip}
              onPress={clearFilters}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.resetChipText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Contenu principal */}
      {loading ? <LoadingView message="Chargement des restaurants..." color={COLORS.primary} /> : error ? <ErrorView error={error} onRetry={loadData} color={COLORS.primary} /> : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderRestaurantCard}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
              progressBackgroundColor="#FFFFFF"
            />
          }
          ListEmptyComponent={<EmptyView icon="restaurant-outline" title="Aucun restaurant trouvé" message="Revenez plus tard pour découvrir de nouveaux restaurants" hasFilters={hasActiveFilters} onClearFilters={clearFilters} color={COLORS.primary} />}
        />
      )}

      {/* Modales */}
      <FilterModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Sélectionner une ville"
        options={cities}
        selected={selectedCity}
        onSelect={setSelectedCity}
        getLabel={(city) => city === 'all' ? 'Toutes les villes' : city}
      />

      <FilterModal
        visible={showCuisineModal}
        onClose={() => setShowCuisineModal(false)}
        title="Type de cuisine"
        options={cuisines}
        selected={selectedCuisine}
        onSelect={setSelectedCuisine}
        getLabel={(cuisine) => cuisine === 'all' ? 'Toutes les cuisines' : cuisine}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0ff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#244e27ff',
    fontWeight: '500',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },

  // Filters
  filtersContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  filtersRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
  },
  resetChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // List
  listContent: {
    padding: 16,
    gap: 16,
  },
});