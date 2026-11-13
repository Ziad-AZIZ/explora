import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';

import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/config';

const citiesData = [
  { id: 1, name: 'Casablanca', subtitle: 'Grand Stade', detail: '115,000 places', color1: '#C1272D', color2: '#8B1E23' },
  { id: 2, name: 'Rabat', subtitle: 'Complexe Sportif', detail: '46,000 places', color1: '#C1272D', color2: '#8B1E23' },
  { id: 3, name: 'Marrakech', subtitle: 'Grand Stade', detail: '46,000 places', color1: '#C1272D', color2: '#8B1E23' },
  { id: 4, name: 'Agadir', subtitle: 'Stade Adrar', detail: '46,000 places', color1: '#C1272D', color2: '#8B1E23' },
  { id: 5, name: 'Tanger', subtitle: 'Ibn Batouta', detail: '46,000 places', color1: '#C1272D', color2: '#8B1E23' },
  { id: 6, name: 'Fès', subtitle: 'Stade de Fès', detail: '46,000 places', color1: '#C1272D', color2: '#8B1E23' },
];

export const useHome = (navigation) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, token } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [chatbotVisible, setChatbotVisible] = useState(false);

  // Charger les réservations pour alimenter le calendrier
  useFocusEffect(
    useCallback(() => {
      const fetchReservations = async () => {
        try {
          if (!isAuthenticated || !token) return;
          
          // Utilise apiClient (JWT auto-attaché) avec le endpoint relatif
          const response = await apiClient.get(API_ENDPOINTS.RESERVATIONS);
          console.log('📊 Reservations loaded for calendar:', response.data.length);
          
          const mapped = response.data.map(res => {
            let type = 'hotel';
            // Conversion en minuscules pour comparaison robuste
            const estType = (res.establishmentType || '').toLowerCase();
            const tarType = (res.targetType || '').toLowerCase();

            if (estType === 'restaurant' || tarType === 'restaurant') {
              type = 'restaurant';
            } else if (estType === 'match' || tarType === 'match' || estType === 'activity' || tarType === 'activity' || estType === 'matchs') {
              type = 'match';
            }
            
            // Log pour débugger l'image si nécessaire
            if (!res.imageUrl) {
              console.warn(`⚠️ No imageUrl for reservation ${res.id} (${res.establishmentName})`);
            }

            return {
              id: res.id,
              date: res.reservationDate?.split('T')[0] || new Date().toISOString().split('T')[0],
              type: type,
              title: res.establishmentName || 'Réservation',
              location: res.city || 'Maroc',
              imageUrl: res.imageUrl
            };
          });
          setEvents(mapped);
        } catch (err) {
          console.log('Erreur fetch events calendrier:', err.message);
        }
      };
      
      if (isAuthenticated) {
        fetchReservations();
      } else {
        setEvents([]); // Vider si déconnecté
      }
    }, [isAuthenticated, token])
  );

  const handleServiceClick = (destination) => {
    if (isAuthenticated) {
      navigation.navigate(destination);
    } else {
      setPendingNavigation(destination);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    if (pendingNavigation) {
      navigation.navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleChatbot = () => {
    setChatbotVisible(true);
  };

  const eventsForSelectedDate = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : [];

  return {
    t,
    cities: citiesData,
    events,
    selectedDate,
    setSelectedDate,
    eventsForSelectedDate,
    showLoginModal,
    setShowLoginModal,
    chatbotVisible,
    setChatbotVisible,
    handleServiceClick,
    handleLoginSuccess,
    handleChatbot,
  };
};
