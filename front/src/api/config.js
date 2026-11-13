// src/api/config.js
// Configuration de l'API — valeurs lues depuis .env (voir .env.example)

const GATEWAY_URL = process.env.EXPO_PUBLIC_GATEWAY_URL ?? "http://localhost:8000";

export const API_BASE_URL = GATEWAY_URL;
export const API_TIMEOUT = 15000;
export const CHATBOT_URL = process.env.EXPO_PUBLIC_CHATBOT_URL ?? "http://localhost:5001";
export const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const API_ENDPOINTS = {
  // 🔐 AUTHENTIFICATION
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/signup',

  // 👤 UTILISATEURS
  USERS: '/api/users',
  USER_BY_ID: (id) => `/api/users/${id}`,
  USER_BY_EMAIL: (email) => `/api/users/email/${email}`,
  USER_ME: '/api/users/me',
  USER_UPDATE_THEME: () => `/api/users/me/theme`,
  USER_UPDATE_THEME_ID: (id) => `/api/users/${id}/theme`,
  USER_UPDATE_NOTIFICATIONS: () => `/api/users/me/notifications`,
  USER_UPDATE_PASSWORD: () => `/api/users/me/password`,

  // 🏨 HOTELS
  HOTELS: '/api/hotels',
  HOTEL_BY_ID: (id) => `/api/hotels/${id}`,
  HOTELS_BY_CITY: (city) => `/api/hotels/city/${city}`,
  HOTELS_AVAILABLE: '/api/hotels/available',

  // 🍽️ RESTAURANTS
  RESTAURANTS: '/api/restaurants',
  RESTAURANT_BY_ID: (id) => `/api/restaurants/${id}`,
  RESTAURANTS_BY_CITY: (city) => `/api/restaurants/city/${city}`,
  RESTAURANTS_AVAILABLE: '/api/restaurants/available',
  RESTAURANTS_BY_CUISINE: (cuisine) => `/api/restaurants/cuisine/${cuisine}`,
  RESTAURANTS_BY_PRICE_RANGE: (priceRange) => `/api/restaurants/price/${priceRange}`,

  // 📅 RÉSERVATIONS
  RESERVATIONS: '/api/reservations',
  RESERVATIONS_BY_EMAIL: (email) => `/api/reservations/email/${email}`,
  RESERVATIONS_BY_USER: (userId) => `/api/reservations/user/${userId}`,
  RESERVATION_BY_ID: (id) => `/api/reservations/${id}`,
  RESERVATION_UPDATE_STATUS: (id) => `/api/reservations/${id}/status`,

  // ❤️ FAVORIS
  FAVORITES: '/api/favorites',
  FAVORITES_CHECK: '/api/favorites/check',
  FAVORITES_BY_USER: () => '/api/favorites/user/me',
  FAVORITES_WITH_DETAILS: () => '/api/favorites/user/me/details',
  FAVORITES_BY_TYPE: (type) => `/api/favorites/user/me/type/${type}`,
  TOGGLE_FAVORITE: '/api/favorites/toggle',

  // 🔍 SEARCH
  SEARCH: '/api/search',
  SEARCH_QUERY: (query) => `/api/search?q=${encodeURIComponent(query)}`,

  // 🔔 NOTIFICATIONS
  NOTIFICATIONS_USER: () => '/api/notifications/user/me',
  NOTIFICATIONS_DELETE_ONE: (id) => `/api/notifications/${id}`,
  NOTIFICATIONS_DELETE_ALL: () => '/api/notifications/user/me/all',
  NOTIFICATIONS_MARK_READ: (id) => `/api/notifications/${id}/read`,

  // ⚽ MATCHS (WC2026)
  MATCHS: '/api/wc2026/matchs',
  MATCH_BY_ID: (id) => `/api/wc2026/matchs/${id}`,
  MATCHS_BY_PHASE: (phase) => `/api/wc2026/matchs/phase/${phase}`,
  MATCHS_BY_GROUPE: (groupe) => `/api/wc2026/matchs/groupe/${groupe}`,
  MATCHS_LIVE: '/api/wc2026/matchs/live',
  EQUIPES: '/api/wc2026/equipes',
  EQUIPE_BY_ID: (id) => `/api/wc2026/equipes/${id}`,
  GROUPES: '/api/wc2026/classements',
  MATCH_PREDICTION: (id) => `/api/wc2026/predictions/match/${id}`,
};

export const WC2026_API_URL = GATEWAY_URL; // Pour compatibilité, mais on devrait utiliser API_ENDPOINTS
export const RESERVATIONS_API_URL = GATEWAY_URL;

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
