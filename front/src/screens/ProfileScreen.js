import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { token, user: authUser, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  
  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [stats, setStats] = useState({
    reservations: 0,
    favoris: 0,
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        setProfileLoading(true);
        const response = await apiClient.get(API_ENDPOINTS.USER_ME);
        setUserData(response.data);
        setEditName(response.data.name);
        setEditPhone(response.data.phone || '');
      } catch (err) {
        console.error('Erreur fetch profil:', err);
        setUserData({
          name: authUser?.name,
          email: authUser?.email,
          notificationsEnabled: true,
        });
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const [resResponse, favResponse] = await Promise.all([
        apiClient.get(API_ENDPOINTS.RESERVATIONS).catch(() => ({ data: [] })),
        apiClient.get(API_ENDPOINTS.FAVORITES_BY_USER()).catch(() => ({ data: [] }))
      ]);
      const reservations = resResponse.data || [];
      const favoris = favResponse.data || [];
      setStats({ reservations: reservations.length, favoris: favoris.length });
    } catch (err) {
      console.log('Erreur fetch profil stats:', err.message);
    }
  };

  const handleToggleNotifications = async (value) => {
    setUserData(prev => ({ ...prev, notificationsEnabled: value }));
    try {
      await apiClient.put(API_ENDPOINTS.USER_UPDATE_NOTIFICATIONS(), { enabled: value });
    } catch (err) {
      setUserData(prev => ({ ...prev, notificationsEnabled: !value }));
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const response = await apiClient.put(API_ENDPOINTS.USER_ME, { name: editName, phone: editPhone });
      setUserData(response.data);
      setEditModalVisible(false);
      Alert.alert('Succès', 'Profil mis à jour !');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    setChangingPassword(true);
    try {
      await apiClient.put(API_ENDPOINTS.USER_UPDATE_PASSWORD(), { currentPassword, newPassword });
      setPasswordModalVisible(false);
      Alert.alert('Succès', 'Mot de passe mis à jour !');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Erreur.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Sûr ?', [{ text: 'Non' }, { text: 'Oui', onPress: logout }]);
  };

  if (profileLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ImageBackground source={require('../../assets/images/background.png')} style={styles.backgroundImage} resizeMode="cover">
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                  <Text style={styles.avatarText}>👤</Text>
                </View>
              </View>
              <Text style={styles.userName}>{userData?.name || t('common.user')}</Text>
              <Text style={styles.userEmail}>{userData?.email || authUser?.email}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
                <Text style={styles.editButtonText}>✏️ {t('profile.editProfile')}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.statsContainer}>
            <StatCard icon="🏨" number={stats.reservations.toString()} label={t('services.hotels')} colors={colors} />
            <StatCard icon="❤️" number={stats.favoris.toString()} label={t('favorites.title')} colors={colors} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.account')}</Text>
            <MenuItem icon="👤" title={t('profile.info')} subtitle={userData?.name} onPress={() => setEditModalVisible(true)} colors={colors} />
            <MenuItem icon="🔒" title={t('profile.security')} subtitle={t('profile.changePassword')} onPress={() => setPasswordModalVisible(true)} colors={colors} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.preferences')}</Text>
            <MenuItemSwitch icon="🔔" title={t('notifications.title')} value={userData?.notificationsEnabled ?? true} onValueChange={handleToggleNotifications} colors={colors} />
            <MenuItemSwitch icon="🌙" title={t('profile.darkMode')} value={isDarkMode} onValueChange={toggleTheme} colors={colors} />
          </View>

          <TouchableOpacity style={[styles.logoutButton, { borderColor: isDarkMode ? '#333' : '#FFE0E0', backgroundColor: colors.card }]} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 {t('auth.logout')}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </ImageBackground>

      {/* Modals remain the same but styled */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Modifier le profil</Text>
            
            <Text style={[styles.inputLabel, { color: colors.subtext }]}>Nom complet</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
              value={editName} 
              onChangeText={setEditName} 
              placeholder="Votre nom" 
            />
            
            <Text style={[styles.inputLabel, { color: colors.subtext }]}>Numéro de téléphone</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
              value={editPhone} 
              onChangeText={setEditPhone} 
              placeholder="06..." 
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.border }]} onPress={() => setEditModalVisible(false)}>
                <Text style={{ color: colors.text }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
                {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Changer le mot de passe</Text>
            
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              placeholder="Mot de passe actuel" 
              secureTextEntry
            />
            
            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
              value={newPassword} 
              onChangeText={setNewPassword} 
              placeholder="Nouveau mot de passe" 
              secureTextEntry
            />

            <TextInput 
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              placeholder="Confirmer" 
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.border }]} onPress={() => setPasswordModalVisible(false)}>
                <Text style={{ color: colors.text }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleUpdatePassword}>
                {changingPassword ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Mettre à jour</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function StatCard({ icon, number, label, colors }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statNumber, { color: colors.primary }]}>{number}</Text>
      <Text style={[styles.statLabel, { color: colors.subtext }]}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, title, subtitle, onPress, colors }) {
  return (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card }]} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: colors.background }]}><Text>{icon}</Text></View>
        <View><Text style={{ color: colors.text }}>{title}</Text><Text style={{ color: colors.subtext }}>{subtitle}</Text></View>
      </View>
    </TouchableOpacity>
  );
}

function MenuItemSwitch({ icon, title, value, onValueChange, colors }) {
  return (
    <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: colors.background }]}><Text>{icon}</Text></View>
        <Text style={{ color: colors.text }}>{title}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} thumbColor={value ? colors.primary : '#F4F4F4'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1 },
  scrollContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 40, alignItems: 'center' },
  profileSection: { alignItems: 'center' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  userEmail: { color: '#FFF' },
  editButton: { marginTop: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  editButtonText: { color: '#FFF' },
  statsContainer: { flexDirection: 'row', padding: 20, gap: 10 },
  statCard: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 10 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  menuItem: { flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  logoutButton: { margin: 20, padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  logoutText: { color: '#C1272D', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 25, borderRadius: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 5, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 15, marginTop: 25 },
  modalBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }
});