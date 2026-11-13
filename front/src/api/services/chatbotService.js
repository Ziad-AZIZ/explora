/**
 * ✅ Chatbot Service FINAL - Maroc 2030
 */

import { CHATBOT_URL } from '../config';

const BASE_URL = CHATBOT_URL;
const CHATBOT_API_URL = `${BASE_URL}/chat`;

const HEADERS = {
  'Content-Type': 'application/json',
};

import i18n from '../../i18n';

class ChatbotService {

  /**
   * 📤 Envoyer message au chatbot
   */
  async sendMessage(message) {
    try {
      const language = i18n.language || 'fr';
      console.log(`🤖 Message envoyé [${language}]:`, message);
      console.log('🌐 URL:', CHATBOT_API_URL);

      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message, // ✅ CORRECT
          language: language
        }),

      });

      console.log('📡 Status:', response.status);

      if (!response.ok) {
        const text = await response.text(); // debug utile
        console.error('❌ Réponse serveur:', text);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('✅ Réponse API:', data);

      return {
        success: true,
        message: data.response || data.answer || data.message || data.text || data.reply || (typeof data === 'string' ? data : JSON.stringify(data)),
        hotels: data.hotels || null,
        restaurants: data.restaurants || null,
      };

    } catch (error) {
      console.error('❌ Erreur Chatbot:', error);

      return {
        success: false,
        message: "Erreur de connexion au chatbot"
      };
    }
  }
}

// singleton
export default new ChatbotService();