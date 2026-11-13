// App.js
import 'react-native-gesture-handler';
import './src/i18n'; // Init i18n
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RTLProvider from './src/components/RTLProvider';
import { StatusBar } from 'react-native';

function AppContent() {
  const { navigationTheme, isDarkMode } = useTheme();

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RTLProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </RTLProvider>
    </SafeAreaProvider>
  );
}