import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export default function ServiceCard({ icon, title, onPress }) {
  const { colors, isDarkMode } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: isDarkMode ? '#333' : '#FFF5F5' }]}>
        <Text style={styles.serviceIcon}>{icon}</Text>
      </View>
      <Text style={[styles.serviceTitle, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  serviceCard: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIcon: {
    fontSize: 30,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
});
