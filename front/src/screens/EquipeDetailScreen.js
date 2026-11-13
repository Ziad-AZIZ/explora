import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../api/config';
import { getFlagUrl } from '../utils/fifaCodeToIso';

const { width } = Dimensions.get('window');

const EquipeDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipeDetail();
  }, [id]);

  const fetchEquipeDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.EQUIPE_BY_ID(id));
      setData(response.data);
    } catch (error) {
      console.error('Error fetching equipe detail', error);
      Alert.alert('Erreur', 'Impossible de charger les détails.');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, color = '#333' }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const getPhaseShort = (phase) => {
    const map = { "Group Stage": "GS", "R32": "R32", "R16": "R16", "QF": "QF", "SF": "SF", "Final": "F" };
    return map[phase] || phase;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#006233" />
      </View>
    );
  }

  if (!data || !data.infos) return null;

  const { infos, stats, classementGroupe, matchs } = data;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{infos.nom}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileSection}>
          <Image source={{ uri: infos.logo || getFlagUrl(infos.nom) }} style={styles.flagLarge} />
          <Text style={styles.teamName}>{infos.nom}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>{infos.confederation}</Text></View>
            <View style={[styles.badge, { backgroundColor: '#C1272D' }]}><Text style={styles.badgeText}>FIFA #{infos.classementFifa || '?'}</Text></View>
            <View style={[styles.badge, { backgroundColor: '#006233' }]}><Text style={styles.badgeText}>Groupe {infos.groupe}</Text></View>
          </View>
        </View>

        {/* Statistiques Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart" size={20} color="#006233" />
            <Text style={styles.sectionTitle}>Statistiques</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard label="MATCHS JOUÉS" value={stats?.matchsJoues || 0} />
            <StatCard label="VICTOIRES" value={stats?.victoires || 0} color="#2e7d32" />
            <StatCard label="NULS" value={stats?.nuls || 0} color="#f9a825" />
            <StatCard label="DÉFAITES" value={stats?.defaites || 0} color="#c62828" />
            <StatCard label="BUTS MARQUÉS" value={stats?.butsPour || 0} />
            <StatCard label="BUTS ENCAISSÉS" value={stats?.butsContre || 0} />
            <StatCard label="DIFF. BUTS" value={(stats?.difference > 0 ? '+' : '') + (stats?.difference || 0)} color={stats?.difference >= 0 ? '#2e7d32' : '#c62828'} />
            <StatCard label="POINTS" value={stats?.points || 0} color="#C1272D" />
          </View>
        </View>

        {/* Classement Groupe */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color="#006233" />
            <Text style={styles.sectionTitle}>Classement Groupe {infos.groupe}</Text>
          </View>
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHead, { flex: 0.5 }]}>#</Text>
              <Text style={[styles.tableHead, { flex: 2, textAlign: 'left' }]}>ÉQUIPE</Text>
              <Text style={styles.tableHead}>MJ</Text>
              <Text style={styles.tableHead}>DIFF</Text>
              <Text style={styles.tableHead}>PTS</Text>
            </View>
            {classementGroupe && classementGroupe.map((item, index) => (
              <View key={index} style={[styles.tableRow, item.equipeId === infos.id && styles.activeRow]}>
                <Text style={[styles.tableCell, { flex: 0.5, fontWeight: 'bold' }]}>{item.position}</Text>
                <View style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                  <Image source={{ uri: item.equipeLogo || getFlagUrl(item.equipeNom) }} style={styles.miniFlag} />
                  <Text style={[styles.tableCellText, item.equipeId === infos.id && { fontWeight: 'bold' }]} numberOfLines={1}>
                    {item.equipeNom}
                  </Text>
                </View>
                <Text style={styles.tableCell}>{item.matchsJoues}</Text>
                <Text style={styles.tableCell}>{item.difference}</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{item.points}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Matchs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="football" size={20} color="#006233" />
            <Text style={styles.sectionTitle}>Matchs ({matchs?.length || 0})</Text>
          </View>
          {matchs && matchs.map((m, idx) => {
            const dateObj = new Date(m.dateHeure);
            const isFinished = m.statut === 'finished' || m.statut === 'FT';
            return (
              <TouchableOpacity key={idx} style={styles.matchCard} onPress={() => navigation.navigate('MatchDetail', { id: m.id })}>
                <View style={styles.matchTop}>
                  <Text style={styles.matchPhase}>{getPhaseShort(m.phase)}</Text>
                  <Text style={styles.matchDate}>{dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.matchMain}>
                  <View style={styles.matchTeam}>
                    <Text style={[styles.mTeamName, m.equipeDomicileId === infos.id && styles.bold]}>{m.equipeDomicileNom}</Text>
                    <Image source={{ uri: m.equipeDomicileLogo || getFlagUrl(m.equipeDomicileNom) }} style={styles.mFlag} />
                  </View>
                  <View style={styles.mScore}>
                    <Text style={styles.mScoreTxt}>
                      {!isFinished ? 'VS' : `${m.scoreDomicile} - ${m.scoreExterieur}`}
                    </Text>
                  </View>
                  <View style={styles.matchTeam}>
                    <Image source={{ uri: m.equipeExterieurLogo || getFlagUrl(m.equipeExterieurNom) }} style={styles.mFlag} />
                    <Text style={[styles.mTeamName, m.equipeExterieurId === infos.id && styles.bold]}>{m.equipeExterieurNom}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#8B1E23',
    paddingTop: 50
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  profileSection: { padding: 24, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  flagLarge: { width: 110, height: 75, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#DDD' },
  teamName: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#F1F3F5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15 },
  badgeText: { color: '#666', fontSize: 11, fontWeight: 'bold' },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: '#333' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  statLabel: { fontSize: 10, color: '#999', fontWeight: '800' },

  tableCard: { backgroundColor: '#FFF', borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#EEE' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8F9FA', padding: 14 },
  tableHead: { flex: 1, color: '#999', fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  activeRow: { backgroundColor: '#FFF5F5' },
  tableCell: { flex: 1, color: '#333', fontSize: 13, textAlign: 'center' },
  tableCellText: { color: '#333', fontSize: 13, marginLeft: 10 },
  miniFlag: { width: 22, height: 15, borderRadius: 2 },

  matchCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#EEE', elevation: 1 },
  matchTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 10 },
  matchPhase: { fontSize: 11, fontWeight: 'bold', color: '#006233' },
  matchDate: { fontSize: 11, color: '#999' },
  matchMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matchTeam: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  mTeamName: { color: '#333', fontSize: 14, flex: 1 },
  bold: { fontWeight: 'bold' },
  mFlag: { width: 28, height: 18, borderRadius: 2 },
  mScore: { width: 70, alignItems: 'center' },
  mScoreTxt: { color: '#333', fontWeight: '900', fontSize: 18 }
});

export default EquipeDetailScreen;
