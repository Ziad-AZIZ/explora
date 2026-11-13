import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Linking, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { getFlagUrl } from '../utils/fifaCodeToIso';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const MatchsScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const [matchs, setMatchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phaseFilter, setPhaseFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(route.params?.tab === 'LIVE' ? 'LIVE' : 'CALENDAR');

  useEffect(() => {
    fetchMatchs();
  }, []);

  const fetchMatchs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.MATCHS);
      const validMatchs = response.data.filter(m => {
        const dateStr = m.dateHeure || m.kickoffUtc;
        if (!dateStr) return false;
        return new Date(dateStr).getFullYear() >= 2026;
      });
      setMatchs(validMatchs);
    } catch (error) {
      console.error('Error fetching matchs', error);
      Alert.alert('Erreur', 'Impossible de charger les matchs.');
    } finally {
      setLoading(false);
    }
  };

  const getPhaseName = (phase) => {
    const map = {
      "Group Stage": "Groupes",
      "R32": "16es",
      "R16": "8es",
      "QF": "Quarts",
      "SF": "Demis",
      "Final": "Finale",
      "3rd Place": "3ème"
    };
    return map[phase] || phase;
  };

  const groups = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const phases = ['All', 'Group Stage', 'R32', 'R16', 'QF', 'SF', 'Final'];

  // LOGIQUE DE FILTRAGE
  const filteredMatchs = matchs.filter(m => {
    // 1. Filtre par onglet (Live vs Calendrier)
    if (activeTab === 'LIVE') {
       if (m.statut !== 'live' && m.statut !== 'IN_PLAY') return false;
    }

    // 2. Filtre par Phase
    if (phaseFilter !== 'All' && (m.phase || m.round) !== phaseFilter) return false;

    // 3. Filtre par Groupe
    if (groupFilter !== 'All' && m.groupe !== groupFilter) return false;

    // 4. Recherche par équipe
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const h = (m.equipeDomicileNom || '').toLowerCase();
      const a = (m.equipeExterieurNom || '').toLowerCase();
      if (!h.includes(q) && !a.includes(q)) return false;
    }

    return true;
  });

  const renderMatch = ({ item }) => {
    const dateObj = new Date(item.dateHeure || item.kickoffUtc);
    const dateStr = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const homeLogo = item.equipeDomicileLogo || getFlagUrl(item.equipeDomicileNom);
    const awayLogo = item.equipeExterieurLogo || getFlagUrl(item.equipeExterieurNom);

    return (
      <View style={styles.card}>
        <View style={styles.phaseContainer}>
          <Text style={styles.phaseText}>
            {getPhaseName(item.phase || item.round)} {item.groupe ? `· Groupe ${item.groupe}` : ''}
          </Text>
        </View>

        <View style={styles.teamsContainer}>
          <TouchableOpacity 
            style={styles.team} 
            onPress={() => item.equipeDomicileId && navigation.navigate('EquipeDetail', { id: item.equipeDomicileId })}
          >
            <Image source={{ uri: homeLogo }} style={styles.flag} />
            <Text style={styles.teamName} numberOfLines={1}>{item.equipeDomicileNom || 'TBD'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.scoreContainer} onPress={() => navigation.navigate('MatchDetail', { id: item.id })}>
            {item.statut === 'finished' || item.statut === 'FT' ? (
              <Text style={styles.scoreText}>{item.scoreDomicile} - {item.scoreExterieur}</Text>
            ) : item.statut === 'live' || item.statut === 'IN_PLAY' ? (
               <Text style={[styles.scoreText, {color: '#d32f2f'}]}>{item.scoreDomicile ?? 0} - {item.scoreExterieur ?? 0}</Text>
            ) : (
              <Text style={styles.vsText}>VS</Text>
            )}
            <Text style={[
              styles.statusBadge, 
              (item.statut === 'live' || item.statut === 'IN_PLAY') && styles.statusLive
            ]}>
              {item.statut === 'live' || item.statut === 'IN_PLAY' ? 'DIRECT 🔴' : (item.statut === 'NS' || item.statut === 'scheduled' ? 'À VENIR' : 'TERMINÉ')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.team} 
            onPress={() => item.equipeExterieurId && navigation.navigate('EquipeDetail', { id: item.equipeExterieurId })}
          >
            <Image source={{ uri: awayLogo }} style={styles.flag} />
            <Text style={styles.teamName} numberOfLines={1}>{item.equipeExterieurNom || 'TBD'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>📅 {dateStr}  ⏰ {timeStr}  🏟 {item.stadeVille}</Text>
        </View>

        {(item.statut === 'scheduled' || item.statut === 'NS') && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.ticketBtn]} 
              onPress={() => Linking.openURL("https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/tickets")}
            >
              <Text style={styles.ticketBtnText}>🎟 RÉSERVER SUR FIFA</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.calendarBtn]} 
              onPress={async () => {
                try {
                  const matchName = `${item.equipeDomicileNom} vs ${item.equipeExterieurNom}`;
                  const bookingData = {
                    establishmentType: "MATCH",
                    establishmentName: matchName,
                    clientName: user?.name || "Supporter FIFA",
                    email: user?.email || "supporter@fifa.com",
                    phone: "0600000000",
                    reservationDate: new Date(item.dateHeure || item.kickoffUtc || new Date()).toISOString(),
                    numberOfPeople: 1,
                    status: "CONFIRMED",
                    imageUrl: homeLogo
                  };
                  
                  await apiClient.post(API_ENDPOINTS.RESERVATIONS, bookingData);
                  Alert.alert('Succès', 'Le match a été ajouté au calendrier.');
                } catch (e) {
                  Alert.alert('Erreur', "Impossible d'ajouter le match.");
                }
              }}
            >
              <Text style={styles.calendarBtnText}>📅 AJOUTER AU CALENDRIER</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={activeTab === 'CALENDAR' ? styles.navTabActive : styles.navTab} onPress={() => setActiveTab('CALENDAR')}>
          <Text style={activeTab === 'CALENDAR' ? styles.navTabTextActive : styles.navTabText}>Calendrier</Text>
        </TouchableOpacity>
        <TouchableOpacity style={activeTab === 'LIVE' ? styles.navTabActive : styles.navTab} onPress={() => setActiveTab('LIVE')}>
          <Text style={activeTab === 'LIVE' ? styles.navTabTextActive : styles.navTabText}>Live 🔴</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('GroupesMain')}>
          <Text style={styles.navTabText}>Groupes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('EquipesMain')}>
          <Text style={styles.navTabText}>Équipes</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une équipe..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={phases}
          keyExtractor={(item) => `phase-${item}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterBtn, phaseFilter === item && styles.filterBtnActive]}
              onPress={() => { setPhaseFilter(item); setGroupFilter('All'); }}
            >
              <Text style={[styles.filterText, phaseFilter === item && styles.filterTextActive]}>
                {item === 'All' ? 'Toutes Phases' : getPhaseName(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
        {phaseFilter === 'Group Stage' && (
          <FlatList 
            horizontal
            style={{ marginTop: 10 }}
            showsHorizontalScrollIndicator={false}
            data={groups}
            keyExtractor={(item) => `group-${item}`}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.groupBtn, groupFilter === item && styles.groupBtnActive]}
                onPress={() => setGroupFilter(item)}
              >
                <Text style={[styles.groupText, groupFilter === item && styles.groupTextActive]}>
                  {item === 'All' ? 'Tous Groupes' : `Grp ${item}`}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#006233" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredMatchs}
          renderItem={renderMatch}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'LIVE' ? "Aucun match en direct pour le moment." : "Aucun match ne correspond à vos critères."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  topNav: { flexDirection: 'row', backgroundColor: '#fff', elevation: 4, paddingTop: 10 },
  navTab: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  navTabActive: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: '#006233' },
  navTabText: { color: '#777', fontWeight: 'bold', fontSize: 13 },
  navTabTextActive: { color: '#006233', fontWeight: 'bold', fontSize: 13 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 45,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  filtersWrapper: { paddingHorizontal: 16, marginBottom: 15 },
  filterBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#006233' },
  filterText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  filterTextActive: { color: '#fff' },

  groupBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#ddd' },
  groupBtnActive: { backgroundColor: '#006233', borderColor: '#006233' },
  groupText: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  groupTextActive: { color: '#fff' },

  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, elevation: 3, overflow: 'hidden' },
  phaseContainer: { backgroundColor: '#f1f3f5', paddingVertical: 6, alignItems: 'center' },
  phaseText: { color: '#495057', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase' },
  teamsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  team: { flex: 1.2, alignItems: 'center' },
  flag: { width: 45, height: 30, borderRadius: 4, marginBottom: 8, borderWidth: 0.5, borderColor: '#ddd' },
  teamName: { fontWeight: 'bold', fontSize: 13, textAlign: 'center', color: '#212529' },
  scoreContainer: { flex: 1, alignItems: 'center' },
  scoreText: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 4 },
  vsText: { fontSize: 18, fontWeight: 'bold', color: '#adb5bd', marginBottom: 4 },
  statusBadge: { fontSize: 9, backgroundColor: '#e9ecef', color: '#495057', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, fontWeight: 'bold'},
  statusLive: { backgroundColor: '#fff5f5', color: '#c92a2a' },
  infoContainer: { borderTopWidth: 1, borderTopColor: '#f1f3f5', padding: 10, backgroundColor: '#fcfcfc', alignItems: 'center' },
  infoText: { fontSize: 11, color: '#868e96' },
  actionButtonsContainer: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  actionBtn: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  ticketBtn: { backgroundColor: '#006233' },
  ticketBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  calendarBtn: { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#e0e0e0' },
  calendarBtnText: { color: '#333', fontWeight: 'bold', fontSize: 13 },
  emptyContainer: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14, fontStyle: 'italic' }
});

export default MatchsScreen;
