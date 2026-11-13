// src/api/services/hotelService.js
// Service pour les appels API liés aux hôtels

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

const hotelService = {
  /**
   * Récupère tous les hôtels
   */
  getAllHotels: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOTELS);
      return response.data;
    } catch (error) {
      console.log('Error fetching all hotels:', error.message);
      throw error;
    }
  },

  /**
   * Récupère un hôtel par son ID
   */
  getHotelById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOTEL_BY_ID(id));
      return response.data;
    } catch (error) {
      console.log(`Error fetching hotel ${id}:`, error.message);
      throw error;
    }
  },

  /**
   * Récupère les hôtels d'une ville spécifique
   */
  getHotelsByCity: async (city) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOTELS_BY_CITY(city));
      return response.data;
    } catch (error) {
      console.log(`Error fetching hotels for city ${city}:`, error.message);
      throw error;
    }
  },

  /**
   * Récupère uniquement les hôtels disponibles
   */
  getAvailableHotels: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HOTELS_AVAILABLE);
      return response.data;
    } catch (error) {
      console.error('Error fetching available hotels:', error);
      throw error;
    }
  },
  
  // Créer un nouvel hôtel
  createHotel: async (hotelData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.HOTELS, hotelData);
      return response.data;
    } catch (error) {
      console.error('Error creating hotel:', error);
      throw error;
    }
  },
  
  // Mettre à jour un hôtel
  updateHotel: async (id, hotelData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.HOTEL_BY_ID(id), hotelData);
      return response.data;
    } catch (error) {
      console.error(`Error updating hotel ${id}:`, error);
      throw error;
    }
  },
  
  // Supprimer un hôtel
  deleteHotel: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.HOTEL_BY_ID(id));
      return true;
    } catch (error) {
      console.error(`Error deleting hotel ${id}:`, error);
      throw error;
    }
  },
  
};

export default hotelService;