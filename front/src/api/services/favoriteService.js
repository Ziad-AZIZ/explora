import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

const favoriteService = {

  getUserFavorites: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FAVORITES_BY_USER());
      return response.data;
    } catch (error) {
      console.error(`Error fetching favorites:`, error.message);
      throw error;
    }
  },

  getUserFavoritesWithDetails: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FAVORITES_WITH_DETAILS());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkIfFavorite: async (itemId, type) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FAVORITES_CHECK, {
        params: { itemId, type }
      });
      return response.data.isFavorite;
    } catch (error) {
      return false;
    }
  },

  addFavorite: async (itemId, type) => {
    try {
      const body = {
        itemId: parseInt(itemId, 10),
        type: String(type)
      };
      
      const response = await apiClient.post(API_ENDPOINTS.FAVORITES, body);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        console.warn('Déjà en favori');
        return null;
      }
      throw error;
    }
  },

  removeFavorite: async (itemId, type) => {
    try {
      await apiClient.delete(API_ENDPOINTS.FAVORITES, {
        data: {
          itemId: parseInt(itemId, 10),
          type: String(type)
        }
      });
      return true;
    } catch (error) {
      throw error;
    }
  },

  toggleFavorite: async (itemId, type) => {
    try {
      const isFavorite = await favoriteService.checkIfFavorite(itemId, type);
      if (isFavorite) {
        await favoriteService.removeFavorite(itemId, type);
        return { action: 'removed', isFavorite: false };
      } else {
        await favoriteService.addFavorite(itemId, type);
        return { action: 'added', isFavorite: true };
      }
    } catch (error) {
      throw error;
    }
  },

  getUserFavoritesByType: async (type) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FAVORITES_BY_TYPE(type));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default favoriteService;