import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '../i18n';

const { width } = Dimensions.get('window');

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', flag: '🇲🇦', nativeName: 'العربية' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
];

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = async (languageCode) => {
    await i18n.changeLanguage(languageCode);
    await saveLanguage(languageCode);
    
    const isArabic = languageCode === 'ar';
    global.isRTL = isArabic;
    
    console.log(`⚠️ RTL mode: ${isArabic ? 'enabled' : 'disabled'} (styles only)`);
    
    setModalVisible(false);
  };

  return (
    <>
      {/* Bouton de sélection de langue (cercle) */}
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.languageFlag}>{currentLanguage.flag}</Text>
      </TouchableOpacity>

      {/* Modal de sélection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('language.selectLanguage')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Liste des langues */}
            <View style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    i18n.language === language.code && styles.languageItemActive,
                  ]}
                  onPress={() => changeLanguage(language.code)}
                >
                  <View style={styles.languageItemContent}>
                    <Text style={styles.languageFlagLarge}>{language.flag}</Text>
                    <View style={styles.languageTextContainer}>
                      <Text style={styles.languageNativeName}>{language.nativeName}</Text>
                      <Text style={styles.languageName}>{language.name}</Text>
                    </View>
                  </View>
                  {i18n.language === language.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Bouton principal (cercle)
  languageButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  languageFlag: {
    fontSize: 24,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666666',
  },

  // Liste des langues
  languageList: {
    padding: 15,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
  },
  languageItemActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#006233',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlagLarge: {
    fontSize: 32,
    marginRight: 15,
  },
  languageTextContainer: {
    justifyContent: 'center',
  },
  languageNativeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  languageName: {
    fontSize: 13,
    color: '#666666',
  },
  checkmark: {
    fontSize: 24,
    color: '#006233',
    fontWeight: 'bold',
  },
});