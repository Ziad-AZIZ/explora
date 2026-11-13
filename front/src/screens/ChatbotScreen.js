// src/screens/ChatbotScreen.js
// 🤖 Écran Chatbot Standalone - Design Moderne 2025

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// ✅ IMPORT DU SERVICE CHATBOT
import chatbotService from '../api/services/chatbotService';


const handleSend = async () => {
  const response = await chatbotService.sendMessage(userMessage);

  if (response.success) {
    console.log("🤖 Bot:", response.message);
  } else {
    console.log("❌ Erreur:", response.message);
  }
};
export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Bonjour ! 👋 Je suis votre assistant virtuel pour la Coupe du Monde 2030 au Maroc. Posez-moi toutes vos questions !',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  // Scroll automatique
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // ✅ FONCTION PRINCIPALE - Envoyer un message
  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      console.log('🤖 Envoi au chatbot:', inputText.trim());
      
      const response = await chatbotService.sendMessage(inputText.trim());
      
      console.log('✅ Réponse reçue:', response.message);

      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: response.success 
          ? response.message 
          : "⚠️ Erreur du chatbot",
        hotels: response.hotels,
        restaurants: response.restaurants,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

    } catch (error) {
      console.error('❌ Erreur chatbot:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je rencontre une difficulté technique. Veuillez réessayer. 🔧",
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  // 💡 Suggestions rapides
  const quickSuggestions = [
    { id: '1', emoji: '🏨', text: 'Hôtels à Casablanca' },
    { id: '2', emoji: '🍽️', text: 'Restaurants recommandés' },
    { id: '3', emoji: '⚽', text: 'Calendrier des matchs' },
    { id: '4', emoji: '🏙️', text: 'Villes hôtes' },
  ];

  const handleSuggestionPress = (suggestion) => {
    setInputText(suggestion.text);
  };

  // 🎨 Animation du typing indicator
  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animate = (dot, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: -6,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animate(dot1, 0);
      animate(dot2, 150);
      animate(dot3, 300);
    }, []);

    return (
      <View style={styles.typingContainer}>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarEmoji}>🤖</Text>
        </View>
        <View style={styles.typingBubble}>
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
          <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
        </View>
      </View>
    );
  };

  // 🗨️ Rendu d'un message
  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={styles.botAvatarEmoji}>🤖</Text>
          </View>
        )}
        
        <View style={styles.messageBubbleWrapper}>
          {isUser ? (
            <LinearGradient
              colors={['#C1272D', '#A01F24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.messageBubble, styles.userBubble]}
            >
              <Text style={styles.userMessageText}>{item.text}</Text>
            </LinearGradient>
          ) : (
            <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
              <View style={[
                styles.messageBubble, 
                styles.botBubble,
                item.isError && styles.errorBubble
              ]}>
                <Text style={[
                  styles.botMessageText,
                  item.isError && styles.errorText
                ]}>
                  {item.text}
                </Text>
              </View>

              {/* Render Hotels if present */}
              {item.hotels && item.hotels.length > 0 && (
                <View style={styles.entityList}>
                  {item.hotels.map((h, index) => (
                    <View key={`hotel-${index}`} style={styles.entityCard}>
                      <Text style={styles.entityTitle} numberOfLines={1}>🏨 {h.name}</Text>
                      <Text style={styles.entitySubtitle} numberOfLines={1}>{h.city} • ⭐ {h.stars}</Text>
                      {h.price && <Text style={styles.entityPrice}>{h.price} DH/nuit</Text>}
                    </View>
                  ))}
                </View>
              )}

              {/* Render Restaurants if present */}
              {item.restaurants && item.restaurants.length > 0 && (
                <View style={styles.entityList}>
                  {item.restaurants.map((r, index) => (
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
          
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarEmoji}>👤</Text>
          </View>
        )}
      </View>
    );
  };

  return (
  <SafeAreaView style={styles.container}>
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps='handled'
    >
      {/* 🎨 Header Moderne */}
      <LinearGradient
        colors={['#C1272D', '#A01F24', '#8B1E23']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerAvatarContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.headerAvatar}
              >
                <Text style={styles.headerAvatarEmoji}>🤖</Text>
              </LinearGradient>
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Assistant Maroc 2030</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping ? '✍️ En train d\'écrire...' : '✅ Disponible'}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* 🗨️ Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 💡 Suggestions rapides */}
      {messages.length <= 1 && !isTyping && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>💡 Suggestions</Text>
          <View style={styles.suggestionsRow}>
            {quickSuggestions.map(suggestion => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ⌨️ Input moderne */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Tapez votre message..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity
            style={styles.sendButtonContainer}
            onPress={sendMessage}
            disabled={inputText.trim() === '' || isTyping}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                inputText.trim() === '' || isTyping
                  ? ['#E0E0E0', '#CCCCCC']
                  : ['#006233', '#004422']
              }
              style={styles.sendButton}
            >
              <Ionicons
                name={isTyping ? 'hourglass' : 'send'}
                size={20}
                color="#FFFFFF"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  
  // 🎨 Header
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerAvatarEmoji: {
    fontSize: 22,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 🗨️ Messages
  messagesList: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },

  // Avatars
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botAvatarEmoji: {
    fontSize: 18,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  userAvatarEmoji: {
    fontSize: 18,
  },

  // Bubbles
  messageBubbleWrapper: {
    maxWidth: '70%',
  },
  messageBubble: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
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

  // Textes
  userMessageText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#FFFFFF',
  },
  botMessageText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#1A1A1A',
  },
  errorText: {
    color: '#C1272D',
  },

  // Timestamp
  timestamp: {
    fontSize: 11,
    marginTop: 5,
  },
  userTimestamp: {
    color: '#999',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#999',
  },

  // ⌨️ Typing indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 5,
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

  // 💡 Suggestions
  suggestionsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
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
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EAED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionEmoji: {
    fontSize: 16,
    marginRight: 7,
  },
  suggestionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },

  // ⌨️ Input
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
  sendButtonContainer: {
    marginLeft: 10,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityList: {
    marginTop: 8,
    gap: 8,
    width: '100%',
  },
  entityCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EAED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 200,
  },
  entityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  entitySubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  entityPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C1272D',
  },
});
