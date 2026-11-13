import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, NativeModules } from 'react-native';
// Import translations
import fr from './translations/fr.json';
import en from './translations/en.json';
import ar from './translations/ar.json';
import es from './translations/es.json';

const LANGUAGE_STORAGE_KEY = '@maroc2030_lang_v4';

// Function to get saved language
const getStoredLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage || 'en'; // Default to English
  } catch (error) {
    console.error('Error loading language:', error);
    return 'en';
  }
};

// Function to save language
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
      es: { translation: es },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    compatibilityJSON: 'v3', // Important for React Native
    interpolation: {
      escapeValue: false,
    },
  });

// Load saved language on init
getStoredLanguage().then((language) => {
  i18n.changeLanguage(language);
  
  const isArabic = language === 'ar';
  
  if (I18nManager.isRTL !== isArabic) {
    I18nManager.allowRTL(isArabic);
    I18nManager.forceRTL(isArabic);
    
    setTimeout(() => {
      try {
        if (NativeModules.DevSettings && NativeModules.DevSettings.reload) {
          NativeModules.DevSettings.reload();
        }
      } catch (e) {
        console.log("Reload needed for RTL sync");
      }
    }, 100);
  }
});

export default i18n;