// src/api/services/userService.js
// Service pour gérer les utilisateurs et le mode sombre/clair

import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

const userService = {
  
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Récupérer le profil actuel (utilisant JWT)
  getMe: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_ME);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },
  
  // Récupérer un utilisateur par email
  getUserByEmail: async (email) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_BY_EMAIL(email));
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      throw error;
    }
  },
  
  // Créer un nouvel utilisateur
  createUser: async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USERS, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  // Mettre à jour l'utilisateur actuel
  updateMe: async (userData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_ME, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating current user:`, error);
      throw error;
    }
  },
  
  // Mettre à jour un utilisateur spécifique
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_BY_ID(id), userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },
  
  // Changer le thème (mode sombre/clair) de l'utilisateur actuel
  updateTheme: async (theme) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.USER_UPDATE_THEME(),
        { theme } // 'LIGHT' ou 'DARK'
      );
      console.log(`✅ Theme changed to ${theme} for current user`);
      return response.data;
    } catch (error) {
      console.error(`Error updating theme:`, error);
      throw error;
    }
  },
  
  // Supprimer l'utilisateur actuel
  deleteMe: async () => {
    try {
      await apiClient.delete(API_ENDPOINTS.USER_ME);
      return true;
    } catch (error) {
      console.error(`Error deleting current user:`, error);
      throw error;
    }
  },

  // Supprimer un utilisateur spécifique
  deleteUser: async (id) => {
    try {
      await apiClient.delete(API_ENDPOINTS.USER_BY_ID(id));
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },
  
};

export default userService;