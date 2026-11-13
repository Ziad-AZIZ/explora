import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#C1272D', // Default theme color, slightly red. Reused for loading mostly.
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666',
  errorBg: '#FFF5F5',
  emptyBg: '#F5F5F5',
};

export const LoadingView = ({ message = 'Chargement...', subtext = 'Veuillez patienter', color = COLORS.primary }) => (
  <View style={styles.centerContainer}>
    <View style={styles.stateCard}>
      <ActivityIndicator size="large" color={color} />
      <Text style={styles.stateTitle}>{message}</Text>
      <Text style={styles.stateSubtext}>{subtext}</Text>
    </View>
  </View>
);

export const ErrorView = ({ error, onRetry, title = 'Connexion interrompue', color = COLORS.primary }) => (
  <View style={styles.centerContainer}>
    <View style={styles.stateCard}>
      <View style={[styles.stateIconContainer, { backgroundColor: COLORS.errorBg }]}>
        <Ionicons name="wifi-outline" size={48} color={color} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateSubtext}>{error || 'Une erreur est survenue'}</Text>
      <TouchableOpacity 
        style={[styles.actionButton, { backgroundColor: color, shadowColor: color }]} 
        onPress={onRetry}
      >
        <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const EmptyView = ({ 
  icon = 'layers-outline', 
  title = 'Aucun élément trouvé', 
  message = 'Revenez plus tard pour découvrir de nouveaux éléments', 
  hasFilters = false, 
  onClearFilters, 
  color = COLORS.primary 
}) => (
  <View style={styles.centerContainer}>
    <View style={{alignItems: 'center'}}>
      <View style={[styles.emptyIconContainer, { backgroundColor: COLORS.emptyBg }]}>
        <Ionicons name={icon} size={80} color="#E0E0E0" />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={[styles.stateSubtext, {marginBottom: 24}]}>
        {hasFilters ? 'Essayez de modifier vos critères de recherche' : message}
      </Text>
      {hasFilters && onClearFilters && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: color, shadowColor: color }]} 
          onPress={onClearFilters}
        >
          <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Effacer les filtres</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stateCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stateTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
});
