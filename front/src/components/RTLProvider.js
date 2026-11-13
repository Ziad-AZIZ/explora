import React, { useEffect } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function RTLProvider({ children }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // Stocker l'état RTL globalement pour accès dans toute l'app
    global.isRTL = isRTL;
    
    if (isRTL) {
      console.log('✅ RTL activé pour l\'arabe');
    } else {
      console.log('✅ LTR activé pour ' + i18n.language);
    }
  }, [isRTL, i18n.language]);

  return (
    <View 
      style={[
        styles.container,
        { 
          direction: isRTL ? 'rtl' : 'ltr',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});