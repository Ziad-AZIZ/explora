import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ContentCard from '../components/ContentCard';
import FilterModal from '../components/FilterModal';
import { LoadingView, ErrorView, EmptyView } from '../components/StateViews';
import { useTranslation } from 'react-i18next';
import { useHotels } from '../features/Hotels/hooks/useHotels';

export default function HotelsScreen({ navigation }) {
  const { t } = useTranslation();
  const {
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
  } = useHotels(navigation);

  const renderHotelCard = ({ item }) => (
    <ContentCard
      item={item}
      type="hotel"
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
          <Text style={styles.headerTitle}>Hôtels</Text>
          <Text style={styles.headerSubtitle}>
            {filteredHotels.length} résultat{filteredHotels.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Barre de recherche moderne */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={20} color="#C1272D" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un hôtel..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
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
              color={selectedCity !== 'all' ? '#FFFFFF' : '#666'} 
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
              color={selectedCity !== 'all' ? '#FFFFFF' : '#999'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStars !== 'all' && styles.filterChipActive
            ]}
            onPress={() => setShowStarsModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="star" 
              size={16} 
              color={selectedStars !== 'all' ? '#FFFFFF' : '#666'} 
            />
            <Text style={[
              styles.filterChipText,
              selectedStars !== 'all' && styles.filterChipTextActive
            ]}>
              {getStarsLabel()}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={14} 
              color={selectedStars !== 'all' ? '#FFFFFF' : '#999'} 
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
      {loading ? <LoadingView message="Chargement des hôtels..." color="#C1272D" /> : error ? <ErrorView error={error} onRetry={loadData} color="#C1272D" /> : (
        <FlatList
          data={filteredHotels}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderHotelCard}
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
              colors={['#C1272D']}
              tintColor="#C1272D"
              progressBackgroundColor="#FFFFFF"
            />
          }
          ListEmptyComponent={<EmptyView icon="bed-outline" title="Aucun hôtel trouvé" message="Revenez plus tard pour découvrir de nouveaux hébergements" hasFilters={hasActiveFilters} onClearFilters={clearFilters} color="#C1272D" />}
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
        visible={showStarsModal}
        onClose={() => setShowStarsModal(false)}
        title="Nombre d'étoiles"
        options={starsOptions}
        selected={selectedStars}
        onSelect={setSelectedStars}
        getLabel={(stars) => stars === 'all' ? 'Toutes les étoiles' : `${stars} ★`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#FFFFFF',
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
    borderColor: '#E8E8E8',
  },
  filterChipActive: {
    backgroundColor: '#C1272D',
    borderColor: '#C1272D',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
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