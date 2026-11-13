// src/api/services/restaurantService.js
// Service pour gérer les restaurants

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

const restaurantService = {
  
  // Récupérer tous les restaurants
  getAllRestaurants: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESTAURANTS);
      return response.data;
    } catch (error) {
      console.log('Error fetching all restaurants:', error.message);
      throw error;
    }
  },
  
  // Récupérer un restaurant par ID
  getRestaurantById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESTAURANT_BY_ID(id));
      return response.data;
    } catch (error) {
      console.log(`Error fetching restaurant ${id}:`, error.message);
      throw error;
    }
  },
  
  // Récupérer les restaurants d'une ville
  getRestaurantsByCity: async (city) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESTAURANTS_BY_CITY(city));
      return response.data;
    } catch (error) {
      console.log(`Error fetching restaurants for city ${city}:`, error.message);
      throw error;
    }
  },
  
  // Récupérer les restaurants disponibles
  getAvailableRestaurants: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESTAURANTS_AVAILABLE);
      return response.data;
    } catch (error) {
      console.log('Error fetching available restaurants:', error.message);
      throw error;
    }
  },
  
  // Récupérer les restaurants par cuisine
  getRestaurantsByCuisine: async (cuisine) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESTAURANTS_BY_CUISINE(cuisine));
      return response.data;
    } catch (error) {
      console.log(`Error fetching restaurants for cuisine ${cuisine}:`, error.message);
      throw error;
    }
  },
  
  // Récupérer les restaurants par gamme de prix
  getRestaurantsByPriceRange: async (priceRange) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.RESTAURANTS_BY_PRICE_RANGE(priceRange));
      return response.data;
    } catch (error) {
      console.error(`Error fetching restaurants for price range ${priceRange}:`, error);
      throw error;
    }
  },
  
  // Créer un nouveau restaurant
  createRestaurant: async (restaurantData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RESTAURANTS, restaurantData);
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  },
  
  // Mettre à jour un restaurant
  updateRestaurant: async (id, restaurantData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.RESTAURANT_BY_ID(id), restaurantData);
      return response.data;
    } catch (error) {
      console.error(`Error updating restaurant ${id}:`, error);
      throw error;
    }
  },
  
  // Supprimer un restaurant
  deleteRestaurant: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.RESTAURANT_BY_ID(id));
      return true;
    } catch (error) {
      console.error(`Error deleting restaurant ${id}:`, error);
      throw error;
    }
  },
  
};

export default restaurantService;