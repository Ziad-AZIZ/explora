// src/api/client.js
// Client Axios pour communiquer avec le backend Spring Boot

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from './config';

// Créer une instance Axios configurée
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================
// INTERCEPTEUR DE REQUÊTE (avant l'envoi)
// ============================================
apiClient.interceptors.request.use(
  async (config) => {
    // Log de la requête (utile pour debug)
    console.log('📤 API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    
    // Ajouter le token JWT si disponible
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTEUR DE RÉPONSE (après réception)
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    // Log de la réponse (utile pour debug)
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    
    return response;
  },
  async (error) => {
    // Gestion des erreurs
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      console.log('❌ API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      });
      
      // Messages d'erreur personnalisés selon le code HTTP
      switch (error.response.status) {
        case 400:
          console.log('🔴 Bad Request - Vérifiez les données envoyées');
          break;
        case 401:
          console.log('🔴 Unauthorized - Token invalide ou expiré');
          // Nettoyer le token expiré/invalide
          await AsyncStorage.removeItem('userToken');
          break;
        case 403:
          console.log('🔴 Forbidden - Accès refusé');
          break;
        case 404:
          console.log('🔴 Not Found - Ressource introuvable');
          break;
        case 500:
          console.log('🔴 Server Error - Erreur serveur');
          break;
        default:
          console.log(`🔴 Error ${error.response.status}`);
      }
    } else if (error.request) {
      // La requête a été envoyée mais pas de réponse reçue
      console.log('❌ No Response from Server:', {
        message: 'Le serveur ne répond pas',
        baseURL: API_BASE_URL,
      });
    } else {
      // Erreur lors de la configuration de la requête
      console.log('❌ Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// HELPER FUNCTION - Test de connexion
// ============================================
export const testConnection = async () => {
  try {
    const response = await apiClient.get('/api/hotels');
    console.log('✅ Backend Connection Success!');
    console.log('📊 Data received:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend Connection Failed!');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Vérifiez que le backend est lancé');
    console.error('   2. Vérifiez l\'URL dans config.js');
    console.error('   3. Pour émulateur Android: utilisez 10.0.2.2');
    console.error('   4. Pour téléphone physique: utilisez l\'IP de votre PC');
    return { success: false, error: error.message };
  }
};

export default apiClient;