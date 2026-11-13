// src/screens/BookingScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function BookingScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { item, type } = route.params;
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: new Date(),
    guests: type === 'restaurant' ? 2 : 1,
    numberOfNights: type === 'hotel' ? 1 : 0,
    specialRequests: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre téléphone');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // ✅ FORMAT EXACT attendu par le backend
      // userId n'est PAS envoyé — le backend l'extrait du JWT
      const bookingData = {
        establishmentType: type.toUpperCase(),
        establishmentName: item.name,
        clientName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        reservationDate: formData.date.toISOString(),
        numberOfPeople: parseInt(formData.guests),
        status: "PENDING",
        imageUrl: (item.imageUrl || item.image_url || item.image)?.substring(0, 1000),
      };

      console.log('📤 Données envoyées au backend:', bookingData);

      // apiClient auto-attache le JWT via l'intercepteur
      const response = await apiClient.post(
        API_ENDPOINTS.RESERVATIONS,
        bookingData
      );

      console.log('✅ Réservation créée:', response.data);

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          '✅ Réservation confirmée !',
          `Votre réservation a été enregistrée avec succès.\n\nCode: ${response.data?.id || 'N/A'}`,
          [
            {
              text: 'Voir mes réservations',
              onPress: () => navigation.navigate('Réservations'),
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Erreur réservation:', error.response?.data || error.message);

      const errorMessage = error.response?.data?.message
        || error.response?.data?.error
        || 'Une erreur est survenue lors de la réservation. Vérifiez que le backend de votre collègue est démarré.';

      Alert.alert('❌ Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    if (type === 'hotel') {
      return (
        <>
          <Text style={styles.label}>Nombre de personnes</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('guests', Math.max(1, formData.guests - 1))}
            >
              <Ionicons name="remove" size={20} color="#1a237e" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{formData.guests}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('guests', formData.guests + 1)}
            >
              <Ionicons name="add" size={20} color="#1a237e" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nombre de nuits</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('numberOfNights', Math.max(1, formData.numberOfNights - 1))}
            >
              <Ionicons name="remove" size={20} color="#1a237e" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{formData.numberOfNights}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('numberOfNights', formData.numberOfNights + 1)}
            >
              <Ionicons name="add" size={20} color="#1a237e" />
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (type === 'restaurant') {
      return (
        <>
          <Text style={styles.label}>Nombre de personnes</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('guests', Math.max(1, formData.guests - 1))}
            >
              <Ionicons name="remove" size={20} color="#1a237e" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{formData.guests}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('guests', formData.guests + 1)}
            >
              <Ionicons name="add" size={20} color="#1a237e" />
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (type === 'activity') {
      return (
        <>
          <Text style={styles.label}>Nombre de participants</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('guests', Math.max(1, formData.guests - 1))}
            >
              <Ionicons name="remove" size={20} color="#1a237e" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{formData.guests}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleInputChange('guests', formData.guests + 1)}
            >
              <Ionicons name="add" size={20} color="#1a237e" />
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  const calculateTotal = () => {
    if (item.price) {
      if (type === 'hotel') {
        return item.price * formData.numberOfNights;
      }
      return item.price * formData.guests;
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a237e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Item Info */}
        <View style={styles.itemCard}>
          <Image
            source={{ uri: item.imageUrl || item.image_url || item.image }}
            style={styles.itemImage}
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemLocation}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.itemLocationText}>{item.city}</Text>
            </View>
            {item.price > 0 && (
              <Text style={styles.itemPrice}>
                {item.price} MAD
                {type === 'hotel' && '/nuit'}
              </Text>
            )}
          </View>
        </View>

        {/* Booking Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>{t('booking.personalInfo')}</Text>

          <Text style={styles.label}>{t('booking.fullName')} *</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre nom"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="votre.email@example.com"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Téléphone *</Text>
          <TextInput
            style={styles.input}
            placeholder="+212 6XX XXX XXX"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>{t('booking.bookingDetails')}</Text>

          <Text style={styles.label}>
            Date {type === 'hotel' ? "d'arrivée" : type === 'restaurant' ? 'de réservation' : 'de visite'}
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.dateButtonText}>
              {formData.date.toLocaleDateString('fr-FR')}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {renderTypeSpecificFields()}

          <Text style={styles.label}>Demandes spéciales (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ajoutez vos demandes ou commentaires..."
            value={formData.specialRequests}
            onChangeText={(text) => handleInputChange('specialRequests', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Price Summary */}
          {item.price > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Résumé</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {item.price} MAD × {type === 'hotel' ? formData.numberOfNights + ' nuit(s)' : formData.guests + ' pers.'}
                </Text>
                <Text style={styles.summaryValue}>{calculateTotal()} MAD</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{calculateTotal()} MAD</Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? t('common.loading') : t('booking.confirmBooking')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            En confirmant, vous acceptez nos conditions générales de vente
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 120,
    height: 120,
  },
  itemInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemLocationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 30,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  submitButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
  },
});