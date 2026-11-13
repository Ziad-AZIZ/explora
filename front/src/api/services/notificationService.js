import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

const notificationService = {
  // Récupérer toutes les notifications d'un utilisateur
  getUserNotifications: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS_USER());
      return response.data;
    } catch (error) {
      console.error(`Error fetching notifications:`, error);
      throw error;
    }
  },

  // Supprimer toutes les notifications d'un utilisateur
  deleteAllUserNotifications: async () => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE_ALL());
      return response.data;
    } catch (error) {
      console.error(`Error deleting all notifications:`, error);
      throw error;
    }
  },

  // Supprimer une notification spécifique
  deleteUserNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS_DELETE_ONE(notificationId));
      return response.data;
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  },

  // Marquer comme lue
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.NOTIFICATIONS_MARK_READ(notificationId));
      return response.data;
    } catch (error) {
      console.error(`Error marking notification as read:`, error);
      throw error;
    }
  },
};

export default notificationService;