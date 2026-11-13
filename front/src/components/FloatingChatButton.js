/**
 * FloatingChatButton - Bouton flottant moderne pour l'accueil
 * 
 * ═══════════════════════════════════════════════════════════════
 * 🎯 POUR L'AFFICHER SUR L'ACCUEIL:
 * ═══════════════════════════════════════════════════════════════
 * 
 * 1. Importe ce composant dans ton HomeScreen:
 *    import FloatingChatButton from './components/FloatingChatButton';
 * 
 * 2. Ajoute-le à la fin de ta vue (après tous les autres éléments):
 *    <FloatingChatButton />
 * 
 * 3. Le bouton apparaîtra automatiquement en bas à droite
 *    avec une animation de pulsation
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ChatbotModal from './ChatbotModal';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  // Animation de pulsation continue
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();

    // Animation d'entrée
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 12,
      tension: 60,
      delay: 500,
      useNativeDriver: true,
    }).start();

    Animated.spring(translateY, {
      toValue: 0,
      friction: 12,
      tension: 60,
      delay: 700,
      useNativeDriver: true,
    }).start();

    return () => {
      pulseAnim.stopAnimation();
      scaleAnim.stopAnimation();
      translateY.stopAnimation();
    };
  }, []);

  // Rotation du bouton quand ouvert
  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      friction: 12,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handlePress = () => {
    // Animation de feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 12,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(true);
      setUnreadCount(0);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Rotation interpolée
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Couleur du badge
  const badgeScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <>
      {/* Bouton principal flottant */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateY },
            ],
          },
        ]}
      >
        {/* Badge de notification */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.badge,
              { transform: [{ scale: badgeScale }] },
            ]}
          >
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </Animated.View>
        )}

        {/* Bouton avec gradient */}
        <TouchableOpacity
          style={styles.buttonTouchable}
          onPress={handlePress}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#C1272D', '#8B1E23', '#5D1218']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Ombre interne */}
            <View style={styles.buttonShadow} />
            
            {/* Icône du chatbot */}
            <View style={styles.iconContainer}>
              <Ionicons
                name="chatbubble-ellipses"
                size={26}
                color="#FFFFFF"
                style={styles.mainIcon}
              />
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <Ionicons
                  name="add"
                  size={20}
                  color="#FFFFFF"
                  style={styles.addIcon}
                />
              </Animated.View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Effet de halo */}
        <View style={styles.haloEffect} pointerEvents="none" />
      </Animated.View>

      {/* Modal du chatbot */}
      <ChatbotModal
        visible={isOpen}
        onClose={handleClose}
        onMessageSent={() => {
          setUnreadCount(prev => prev + 1);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 9999,
  },
  buttonTouchable: {
    borderRadius: 28,
    shadowColor: '#C1272D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  iconContainer: {
    position: 'relative',
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    position: 'absolute',
  },
  addIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00C853',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  haloEffect: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(193, 39, 45, 0.15)',
    top: -12,
    left: -12,
  },
});