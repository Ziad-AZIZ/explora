// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

// Helper : decoder le payload d'un JWT (sans librairie externe)
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger le token au démarrage
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (!storedToken) return;

      // Vérifier l'expiration du token
      const payload = decodeToken(storedToken);
      if (!payload || payload.exp * 1000 < Date.now()) {
        // Token absent ou expiré → nettoyage
        await AsyncStorage.removeItem('userToken');
        return;
      }

      // Token valide → restaurer la session
      setToken(storedToken);
      setUser({
        id: payload.id,
        email: payload.sub,
        name: payload.name || payload.sub,
      });
    } catch (error) {
      console.error('Erreur chargement auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (authToken) => {
    try {
      await AsyncStorage.setItem('userToken', authToken);
      setToken(authToken);
      const payload = decodeToken(authToken);
      setUser(payload ? {
        id: payload.id,
        email: payload.sub,
        name: payload.name || payload.sub,
      } : null);
      return true;
    } catch (error) {
      console.error('Erreur login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  // isAuthenticated est maintenant un BOOLEAN, pas une fonction
  const isAuthenticated = !!token;

  const getToken = () => token;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};