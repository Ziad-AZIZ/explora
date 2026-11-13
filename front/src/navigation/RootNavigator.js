// src/navigation/RootNavigator.js

import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import LoginModal from '../components/LoginModal';

// Screens
import HomeScreen from '../screens/HomeScreen';
import HotelsScreen from '../screens/HotelsScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import MapScreen from '../screens/MapScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import CityDetailScreen from '../screens/CityDetailScreen';

// Note: Ensure BookingScreen is registered if needed
import BookingScreen from '../screens/BookingScreen';

// CDM 2030 Screens
import MatchsScreen from '../screens/MatchsScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import GroupesScreen from '../screens/GroupesScreen';
import EquipesScreen from '../screens/EquipesScreen';
import EquipeDetailScreen from '../screens/EquipeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ==================== HOME STACK ====================
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Hotels" 
        component={HotelsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Restaurants" 
        component={RestaurantsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Map" 
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Chatbot" 
        component={ChatbotScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CityDetail" 
        component={CityDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ==================== FAVORIS STACK ====================
function FavoritesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="FavoritesMain" 
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ==================== RÉSERVATIONS STACK ====================
function ReservationsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ReservationsMain" 
        component={ReservationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ==================== PROFIL STACK ====================
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ==================== MONDIAL STACK ====================
function MondialStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MatchsMain" 
        component={MatchsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MatchDetail" 
        component={MatchDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GroupesMain" 
        component={GroupesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EquipesMain" 
        component={EquipesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EquipeDetail" 
        component={EquipeDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// ==================== BOTTOM NAVIGATION ====================
function MainTabs() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Accueil') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Favoris') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Réservations') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Accueil" 
          component={HomeStack}
          options={{ tabBarLabel: t('tabs.home') }}
        />
        <Tab.Screen 
          name="Favoris" 
          component={FavoritesStack}
          options={{ tabBarLabel: t('tabs.favorites') }}
        />
        <Tab.Screen 
          name="Réservations" 
          component={ReservationsStack}
          options={{ tabBarLabel: t('tabs.reservations') }}
        />
        <Tab.Screen 
          name="Profil" 
          component={ProfileStack}
          options={{ tabBarLabel: t('tabs.profile') }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (!token) {
                e.preventDefault();
                setShowLoginModal(true);
              }
            }
          })}
        />
      </Tab.Navigator>

      <LoginModal 
        visible={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </>
  );
}

// ==================== ROOT EXPORT ====================
export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CDM 2030" 
        component={MondialStack} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}