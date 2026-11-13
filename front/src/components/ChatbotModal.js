// src/components/ChatbotModal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import chatbotService from '../api/services/chatbotService';

const { width, height } = Dimensions.get('window');

// --- Composant TypingIndicator extrait hors du composant principal ---
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
};

// --- Suggestions rapides ---
const QUICK_SUGGESTIONS = [
  { emoji: '🏨', text: 'Hôtels 5 étoiles', query: 'Recommande-moi des hôtels 5 étoiles à Marrakech' },
  { emoji: '🍽️', text: 'Restaurants', query: 'Quels sont les meilleurs restaurants à Casablanca ?' },
  { emoji: '⚽', text: 'Matchs', query: 'Calendrier des matchs au Maroc' },
  { emoji: '🗺️', text: 'Villes', query: 'Quelles villes accueillent la Coupe du Monde ?' },
];

const INITIAL_MESSAGE = {
  id: 1,
  text: "Bonjour ! 👋 Je suis votre assistant virtuel pour la Coupe du Monde 2030 au Maroc. Comment puis-je vous aider ?",
  sender: 'bot',
  timestamp: new Date(),
};

// --- Composant principal ---
export default function ChatbotModal({ visible, onClose }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation d'ouverture/fermeture
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Scroll automatique vers le bas
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async (text = inputText) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = { id: Date.now(), text: trimmed, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(trimmed);
      const botMessage = { 
        id: Date.now() + 1, 
        text: response.message,
        hotels: response.hotels,
        restaurants: response.restaurants,
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, je rencontre une difficulté technique. Veuillez réessayer dans un instant. 🔧",
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[
        styles.messageWrapper,
        message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper,
      ]}
    >
      {message.sender === 'bot' && (
        <View style={styles.messageAvatar}>
          <Text style={styles.messageAvatarText}>🤖</Text>
        </View>
      )}

      <View style={[
        styles.messageBubble,
        message.sender === 'user' ? styles.userBubble : styles.botBubble,
        message.isError && styles.errorBubble,
      ]}>
        {message.sender === 'bot' && !message.isError && (
          <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
            <LinearGradient colors={['#FFFFFF', '#F8F9FA']} style={styles.bubblePadding}>
              <Text style={styles.botText}>{message.text}</Text>
            </LinearGradient>
            
            {/* Render Hotels if present */}
            {message.hotels && message.hotels.length > 0 && (
              <View style={styles.entityList}>
                {message.hotels.map((h, index) => (
                  <View key={`hotel-${index}`} style={styles.entityCard}>
                    <Text style={styles.entityTitle} numberOfLines={1}>🏨 {h.name}</Text>
                    <Text style={styles.entitySubtitle} numberOfLines={1}>{h.city} • ⭐ {h.stars}</Text>
                    {h.price && <Text style={styles.entityPrice}>{h.price} DH/nuit</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Render Restaurants if present */}
            {message.restaurants && message.restaurants.length > 0 && (
              <View style={styles.entityList}>
                {message.restaurants.map((r, index) => (
                  <View key={`resto-${index}`} style={styles.entityCard}>
                    <Text style={styles.entityTitle} numberOfLines={1}>🍽️ {r.name}</Text>
                    <Text style={styles.entitySubtitle} numberOfLines={1}>{r.city} • {r.cuisine}</Text>
                    {r.price && <Text style={styles.entityPrice}>{r.price}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        {message.sender === 'user' && (
          <LinearGradient colors={['#C1272D', '#A01F24']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bubblePadding}>
            <Text style={styles.userText}>{message.text}</Text>
          </LinearGradient>
        )}
        {message.isError && (
          <View style={styles.bubblePadding}>
            <Text style={styles.errorText}>{message.text}</Text>
          </View>
        )}
        <Text style={[styles.timestamp, message.sender === 'user' ? styles.userTimestamp : styles.botTimestamp]}>
          {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {message.sender === 'user' && (
        <View style={styles.messageAvatar}>
          <Text style={styles.messageAvatarText}>👤</Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.keyboardView}>
              {/* Header */}
            <LinearGradient
              colors={['#C1272D', '#A01F24', '#8B1E23']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.botAvatarContainer}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                      style={styles.botAvatar}
                    >
                      <Text style={styles.botAvatarText}>🤖</Text>
                    </LinearGradient>
                    <View style={styles.onlineIndicator} />
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Assistant Maroc 2030</Text>
                    <Text style={styles.headerSubtitle}>
                      {isLoading ? "✍️ En train d'écrire..." : '✅ Disponible 24/7'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map(renderMessage)}
              {isLoading && <TypingIndicator />}
            </ScrollView>

            {/* Suggestions rapides (seulement au début) */}
            {messages.length === 1 && !isLoading && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>💡 Suggestions</Text>
                <View style={styles.suggestionsGrid}>
                  {QUICK_SUGGESTIONS.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionChip}
                      onPress={() => handleSend(suggestion.query)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#FFFFFF', '#F8F9FA']}
                        style={styles.suggestionChipGradient}
                      >
                        <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                        <Text style={styles.suggestionText}>{suggestion.text}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Tapez votre message..."
                  placeholderTextColor="#999"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => handleSend()}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => handleSend()}
                  disabled={!inputText.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={inputText.trim() && !isLoading ? ['#006233', '#004422'] : ['#E0E0E0', '#CCCCCC']}
                    style={styles.sendButtonGradient}
                  >
                    <Ionicons name={isLoading ? 'hourglass' : 'send'} size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            </View>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Overlay & structure
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',   // ← modal collé en bas
  },
  backdrop: {
    flex: 1,                       // ← remplit UNIQUEMENT l'espace au-dessus du modal
  },
  modalContainer: {
    height: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatarContainer: {
    position: 'relative',
  },
  botAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  botAvatarText: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  closeButton: {
    padding: 5,
  },

  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageAvatarText: {
    fontSize: 18,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  botBubble: {
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBubble: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  bubblePadding: {
    padding: 14,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  botText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A1A1A',
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#C1272D',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#999',
  },

  // Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    marginLeft: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C1272D',
    marginHorizontal: 3,
  },

  // Suggestions
  suggestionsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionChip: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  suggestionEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  // Input
  inputContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F7FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 10,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
    width: '100%',
  },
  entityCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
    minWidth: 200,
  },
  entityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  entitySubtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  entityPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C1272D',
  },
});
