import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import LanguageSelector from '../components/LanguageSelector';
import LoginModal from '../components/LoginModal';
import ChatbotModal from '../components/ChatbotModal';
import NotificationModal from '../components/NotificationModal';

import { useHome } from '../features/Home/hooks/useHome';
import { useTheme } from '../context/ThemeContext';
import CityArchCard from '../features/Home/components/CityArchCard';
import ServiceCard from '../features/Home/components/ServiceCard';
import CalendarView from '../features/Home/components/CalendarView';
import EventBubble from '../features/Home/components/EventBubble';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [notificationVisible, setNotificationVisible] = React.useState(false);
  const { colors, isDarkMode } = useTheme();

  const {
    t,
    cities,
    events,
    selectedDate,
    setSelectedDate,
    eventsForSelectedDate,
    showLoginModal,
    setShowLoginModal,
    chatbotVisible,
    setChatbotVisible,
    handleServiceClick,
    handleLoginSuccess,
    handleChatbot,
  } = useHome(navigation);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.logoCircle, { backgroundColor: colors.secondary }]}>
                <Text style={styles.logoText}>M30</Text>
              </View>
              <Text style={[styles.helloText, { color: colors.text }]}>{t('common.hello')}</Text>
            </View>
            <View style={styles.headerRight}>
              <LanguageSelector />
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: colors.card }]}
                onPress={() => setNotificationVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.iconText}>🔔</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Villes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.redBar, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.hostCities')}</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            >
              {cities.map((city) => (
                <CityArchCard
                  key={city.id}
                  city={city}
                  onPress={() => navigation.navigate('CityDetail', { city })}
                />
              ))}
            </ScrollView>
          </View>

          {/* Section Calendrier */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <View style={[styles.redBar, { backgroundColor: colors.primary }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('calendar.myCalendar')}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Réservations')}>
                <Text style={[styles.viewAll, { color: colors.subtext }]}>{t('calendar.viewAll')}  ›</Text>
              </TouchableOpacity>
            </View>

            {/* Légende */}
            <View style={styles.legendContainer}>
              <LegendItem color="#C1272D" label={t('calendar.legend.matches')} colors={colors} />
              <LegendItem color="#3498db" label={t('calendar.legend.hotels')} colors={colors} />
              <LegendItem color="#e67e22" label={t('calendar.legend.restaurants')} colors={colors} />
            </View>

            <CalendarView events={events} onDatePress={setSelectedDate} />

            {selectedDate && (
              <EventBubble
                date={selectedDate}
                events={eventsForSelectedDate}
                onClose={() => setSelectedDate(null)}
              />
            )}
          </View>

          {/* Section Services */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.redBar, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.services')}</Text>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesContainer}
            >
              <ServiceCard icon="🏨" title={t('services.hotels')} onPress={() => handleServiceClick('Hotels')} />
              <ServiceCard icon="🍽️" title={t('services.restaurants')} onPress={() => handleServiceClick('Restaurants')} />
              <ServiceCard icon="🗺️" title={t('services.map')} onPress={() => handleServiceClick('Map')} />
              <ServiceCard icon="⚽" title="Mondial" onPress={() => navigation.navigate('CDM 2030')} />
            </ScrollView>
          </View>

          {/* Section Discover */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <View style={[styles.redBar, { backgroundColor: colors.primary }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.discover')}</Text>
              </View>
            </View>

            <View style={[styles.discoverCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.discoverTitle, { color: colors.text }]}>🇲🇦 {t('home.welcome')}</Text>
              <Text style={[styles.discoverText, { color: colors.subtext }]}>
                {t('home.welcomeDesc')}
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* 🤖 BOUTON CHATBOT FLOTTANT */}
        <TouchableOpacity 
          style={[styles.chatbotButton, { backgroundColor: colors.primary }]}
          onPress={handleChatbot}
          activeOpacity={0.8}
        >
          <Text style={styles.chatbotIcon}>🤖</Text>
        </TouchableOpacity>

        {/* Modals */}
        <ChatbotModal visible={chatbotVisible} onClose={() => setChatbotVisible(false)} />
        <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />
        <NotificationModal visible={notificationVisible} onClose={() => setNotificationVisible(false)} />
      </ImageBackground>
    </View>
  );
}

function LegendItem({ color, label, colors }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: colors.subtext }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  scrollContainer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 80, paddingBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  helloText: { fontSize: 28, fontWeight: '400' },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  iconText: { fontSize: 22 },
  section: { marginTop: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  redBar: { width: 4, height: 24, marginRight: 10, borderRadius: 2 },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, marginBottom: 15 },
  viewAll: { fontSize: 14 },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginBottom: 15, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12 },
  cardsContainer: { paddingLeft: 20, paddingRight: 10 },
  servicesContainer: { paddingLeft: 20, paddingRight: 10 },
  discoverCard: { marginHorizontal: 20, padding: 20, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, marginBottom: 30 },
  discoverTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  discoverText: { fontSize: 14, lineHeight: 20 },
  chatbotButton: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  chatbotIcon: { fontSize: 28 },
});
