import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ScrollView, Linking, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../api/config';
import { getFlagUrl } from '../utils/fifaCodeToIso';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const MatchDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [match, setMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('STATS'); 

  useEffect(() => {
    fetchMatchDetail();
    fetchPrediction();
  }, [id]);

  const fetchMatchDetail = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MATCH_BY_ID(id));
      setMatch(response.data);
    } catch (error) {
      console.error('Error fetching match detail', error);
      Alert.alert('Erreur', 'Impossible de charger les détails.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      setLoadingPrediction(true);
      const response = await apiClient.get(API_ENDPOINTS.MATCH_PREDICTION(id));
      if (response.status === 200 && response.data) {
        setPrediction(response.data);
      }
    } catch (error) {
      console.error('Prediction fetch error:', error);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const getPhaseName = (phase) => {
    const map = { "Group Stage": "Phase de groupes", "R32": "16es de finale", "R16": "8es de finale", "QF": "Quarts de finale", "SF": "Demi-finales", "Final": "Finale" };
    return map[phase] || phase;
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#006233" /></View>;
  if (!match) return null;

  const dateObj = new Date(match.dateHeure || match.kickoffUtc);
  const dateStr = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{getPhaseName(match.phase || match.round)} {match.groupe ? `- Grp ${match.groupe}` : ''}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <View style={styles.teamsContainer}>
            <TouchableOpacity style={styles.team} onPress={() => navigation.navigate('EquipeDetail', { id: match.equipeDomicileId })}>
              <Image source={{ uri: match.equipeDomicileLogo || getFlagUrl(match.equipeDomicileNom) }} style={styles.flagLarge} />
              <Text style={styles.teamName}>{match.equipeDomicileNom}</Text>
            </TouchableOpacity>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreText}>{match.statut === 'NS' || match.statut === 'scheduled' ? 'VS' : `${match.scoreDomicile} - ${match.scoreExterieur}`}</Text>
              <View style={[styles.statusBadge, (match.statut === 'live' || match.statut === 'IN_PLAY') && styles.statusLive]}>
                <Text style={[styles.statusText, (match.statut === 'live' || match.statut === 'IN_PLAY') && {color: '#C1272D'}]}>
                  {match.statut === 'live' ? 'EN DIRECT 🔴' : 'À VENIR'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.team} onPress={() => navigation.navigate('EquipeDetail', { id: match.equipeExterieurId })}>
              <Image source={{ uri: match.equipeExterieurLogo || getFlagUrl(match.equipeExterieurNom) }} style={styles.flagLarge} />
              <Text style={styles.teamName}>{match.equipeExterieurNom}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'STATS' && styles.activeTab]} onPress={() => setActiveTab('STATS')}><Text style={[styles.tabText, activeTab === 'STATS' && styles.activeTabText]}>Stats</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'LINEUP' && styles.activeTab]} onPress={() => setActiveTab('LINEUP')}><Text style={[styles.tabText, activeTab === 'LINEUP' && styles.activeTabText]}>Compos</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'IA' && styles.activeTab]} onPress={() => setActiveTab('IA')}><Text style={[styles.tabText, activeTab === 'IA' && styles.activeTabText]}>IA</Text></TouchableOpacity>
        </View>

        <View style={styles.contentCard}>
          {activeTab === 'STATS' && (
            <View style={styles.noDataContainer}>
              <Ionicons name="stats-chart-outline" size={40} color="#CCC" />
              <Text style={styles.noData}>Ces informations ne sont pas disponibles pour le moment.</Text>
            </View>
          )}

          {activeTab === 'LINEUP' && (
            <View style={styles.noDataContainer}>
              <Ionicons name="people-outline" size={40} color="#CCC" />
              <Text style={styles.noData}>Ces informations ne sont pas disponibles pour le moment.</Text>
            </View>
          )}

          {activeTab === 'IA' && (
            <View>
              <Text style={styles.contentTitle}>Analyse IA</Text>
              {prediction ? (
                <View style={styles.predictionContent}>
                  <View style={styles.predictionRow}>
                    <View style={styles.probItem}><Text style={styles.probLabel}>Dom.</Text><Text style={[styles.probValue, {color: '#006233'}]}>{prediction.pctDomicile}%</Text></View>
                    <View style={styles.probItem}><Text style={styles.probLabel}>Nul</Text><Text style={[styles.probValue, {color: '#999'}]}>{prediction.pctNul}%</Text></View>
                    <View style={styles.probItem}><Text style={styles.probLabel}>Ext.</Text><Text style={[styles.probValue, {color: '#C1272D'}]}>{prediction.pctExterieur}%</Text></View>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressSegment, { width: `${prediction.pctDomicile}%`, backgroundColor: '#006233' }]} />
                    <View style={[styles.progressSegment, { width: `${prediction.pctNul}%`, backgroundColor: '#999' }]} />
                    <View style={[styles.progressSegment, { width: `${prediction.pctExterieur}%`, backgroundColor: '#C1272D' }]} />
                  </View>
                </View>
              ) : <Text style={styles.noData}>Analyse non disponible.</Text>}
            </View>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}><Text style={styles.iconTxt}>📅</Text><Text style={styles.infoLabel}>Date</Text><Text style={styles.infoValue}>{dateStr}</Text></View>
          <View style={styles.infoBox}><Text style={styles.iconTxt}>⏰</Text><Text style={styles.infoLabel}>Heure locale</Text><Text style={styles.infoValue}>{timeStr}</Text></View>
          <View style={styles.infoBox}><Text style={styles.iconTxt}>🏟</Text><Text style={styles.infoLabel}>Stade</Text><Text style={styles.infoValue}>{match.stadeNom}</Text></View>
          <View style={styles.infoBox}><Text style={styles.iconTxt}>📍</Text><Text style={styles.infoLabel}>Ville</Text><Text style={styles.infoValue}>{match.stadeVille}</Text></View>
        </View>

        {(match.statut === 'NS' || match.statut === 'scheduled') && (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#006233'}]} onPress={() => Linking.openURL("https://fifa.com")}>
              <Text style={styles.actionBtnText}>🎟 RÉSERVER SUR FIFA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, {backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', marginTop: 10}]} 
              onPress={async () => {
                try {
                  const bookingData = {
                    establishmentType: "MATCH",
                    establishmentName: `${match.equipeDomicileNom} vs ${match.equipeExterieurNom}`,
                    clientName: user?.name || "Supporter FIFA",
                    email: user?.email || "supporter@fifa.com",
                    phone: "0600000000",
                    reservationDate: match.dateHeure || match.kickoffUtc,
                    numberOfPeople: 1,
                    status: "CONFIRMED",
                    imageUrl: match.equipeDomicileLogo
                  };
                  await apiClient.post(API_ENDPOINTS.RESERVATIONS, bookingData);
                  Alert.alert('Succès', 'Le match a été ajouté à votre calendrier !');
                } catch (e) { 
                  console.error(e);
                  Alert.alert('Erreur', "Impossible d'ajouter au calendrier."); 
                }
              }}
            >
              <Text style={[styles.actionBtnText, {color: '#333'}]}>📅 AJOUTER AU CALENDRIER</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', elevation: 2 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  scoreCard: { backgroundColor: '#FFF', padding: 24, margin: 16, borderRadius: 15, elevation: 3 },
  teamsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  team: { alignItems: 'center', flex: 1.2 },
  flagLarge: { width: 70, height: 45, borderRadius: 6, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  teamName: { fontWeight: 'bold', fontSize: 14, color: '#333', textAlign: 'center' },
  scoreInfo: { alignItems: 'center', flex: 1 },
  scoreText: { fontSize: 26, fontWeight: '900', color: '#333', marginBottom: 8 },
  statusBadge: { backgroundColor: '#F1F3F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusLive: { backgroundColor: '#FFF5F5' },
  statusText: { fontSize: 9, fontWeight: 'bold', color: '#666' },

  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#EEE', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#FFF', elevation: 2 },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#888' },
  activeTabText: { color: '#006233' },

  contentCard: { backgroundColor: '#FFF', marginHorizontal: 16, padding: 25, borderRadius: 15, elevation: 2, marginBottom: 16 },
  contentTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  noDataContainer: { alignItems: 'center', paddingVertical: 20 },
  noData: { textAlign: 'center', color: '#999', marginTop: 12, fontSize: 14, fontStyle: 'italic', lineHeight: 20 },

  predictionContent: { gap: 12 },
  predictionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  probItem: { alignItems: 'center' },
  probLabel: { fontSize: 12, color: '#666' },
  probValue: { fontSize: 15, fontWeight: 'bold' },
  progressBar: { height: 10, backgroundColor: '#eee', borderRadius: 5, flexDirection: 'row', overflow: 'hidden' },
  progressSegment: { height: '100%' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, marginBottom: 16 },
  infoBox: { width: '45%', backgroundColor: '#FFF', margin: '2.5%', padding: 12, borderRadius: 10, alignItems: 'center', elevation: 1 },
  iconTxt: { fontSize: 22, marginBottom: 6 },
  infoLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#555', textAlign: 'center' },

  actionContainer: { paddingHorizontal: 16, marginBottom: 20 },
  actionBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', elevation: 3 },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 }
});

export default MatchDetailScreen;
