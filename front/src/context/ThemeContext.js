import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { isAuthenticated, user } = useAuth();
  const [theme, setTheme] = useState('light');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('userTheme');
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme(systemColorScheme || 'light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('userTheme', newTheme);
      if (isAuthenticated) {
        await apiClient.put(API_ENDPOINTS.USER_UPDATE_THEME(), { theme: newTheme.toUpperCase() });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = {
    light: {
      background: '#F5F5F5',
      card: '#FFFFFF',
      text: '#1A1A1A',
      subtext: '#666666',
      primary: '#C1272D',
      secondary: '#8B1E23',
      border: '#EEEEEE',
      input: '#FFFFFF',
      tabBar: '#FFFFFF',
    },
    dark: {
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      subtext: '#AAAAAA',
      primary: '#E53935',
      secondary: '#B71C1C',
      border: '#333333',
      input: '#2C2C2C',
      tabBar: '#1E1E1E',
    }
  };

  const currentColors = colors[theme];

  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: currentColors.primary,
      background: currentColors.background,
      card: currentColors.card,
      text: currentColors.text,
      border: currentColors.border,
      notification: currentColors.primary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: 'bold',
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900',
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, colors: currentColors, navigationTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
