import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { getFlagUrl } from '../utils/fifaCodeToIso';

const GroupesScreen = ({ navigation }) => {
  const [classements, setClassements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassements();
  }, []);

  const fetchClassements = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GROUPES);
      // La nouvelle API retourne directement un tableau avec "nom" et "classements"
      const groupArray = response.data.map(groupData => ({
        title: `GROUPE ${groupData.nom || groupData.groupe}`,
        data: (groupData.classements || []).sort((a, b) => a.position - b.position),
      }));

      setClassements(groupArray);
    } catch (error) {
      console.error('Error fetching classements', error);
      Alert.alert('Erreur', 'Impossible de charger les classements.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.cellHeader, { flex: 0.5 }]}>#</Text>
      <Text style={[styles.cellHeader, { flex: 2.5, textAlign: 'left' }]}>Équipe</Text>
      <Text style={[styles.cellHeader, { flex: 1 }]}>Pts</Text>
      <Text style={[styles.cellHeader, { flex: 0.8 }]}>J</Text>
      <Text style={[styles.cellHeader, { flex: 0.8 }]}>V</Text>
      <Text style={[styles.cellHeader, { flex: 0.8 }]}>N</Text>
      <Text style={[styles.cellHeader, { flex: 0.8 }]}>D</Text>
      <Text style={[styles.cellHeader, { flex: 1 }]}>Diff</Text>
    </View>
  );

  const renderGroup = ({ item }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{item.title}</Text>
      </View>
      {renderHeader()}
      {item.data.map((team, index) => {
        const isQualified = index < 2;
        return (
          <View key={team.equipeId || team.id || index} style={[styles.tableRow, isQualified && styles.rowQualified]}>
            <Text style={[styles.cell, { flex: 0.5 }]}>{index + 1}</Text>
            <TouchableOpacity 
              style={[styles.cell, { flex: 2.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }]}
              onPress={() => navigation.navigate('EquipeDetail', { id: team.equipeId })}
            >
              <Image source={{ uri: team.equipeLogo || getFlagUrl(team.equipeNom || team.equipeCode) }} style={styles.flagSmall} />
              <Text style={styles.teamName} numberOfLines={1}>{team.equipeNom || team.equipeCode}</Text>
            </TouchableOpacity>
            <Text style={[styles.cell, styles.cellBold, { flex: 1 }]}>{team.points}</Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>{team.matchsJoues}</Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>{team.victoires}</Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>{team.nuls}</Text>
            <Text style={[styles.cell, { flex: 0.8 }]}>{team.defaites}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{team.difference > 0 ? `+${team.difference}` : team.difference}</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('MatchsMain')}><Text style={styles.navTabText}>Calendrier</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('MatchsMain', { tab: 'LIVE' })}><Text style={styles.navTabText}>Live 🔴</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navTabActive}><Text style={styles.navTabTextActive}>Groupes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('EquipesMain')}><Text style={styles.navTabText}>Équipes</Text></TouchableOpacity>
      </View>

      <Text style={styles.title}>Classements des Groupes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#C1272D" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={classements}
          renderItem={renderGroup}
          keyExtractor={(item) => item.title}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topNav: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2, paddingTop: 10 },
  navTab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  navTabActive: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: '#C1272D' },
  navTabText: { color: '#666', fontWeight: 'bold' },
  navTabTextActive: { color: '#C1272D', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', margin: 16, color: '#333' },
  groupCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, elevation: 3, overflow: 'hidden' },
  groupHeader: { backgroundColor: '#2d4e2f', padding: 12 },
  groupTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9f9f9', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  cellHeader: { fontWeight: 'bold', fontSize: 12, color: '#666', textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  rowQualified: { backgroundColor: '#e8f5e9' },
  cell: { fontSize: 13, color: '#333', textAlign: 'center' },
  cellBold: { fontWeight: 'bold' },
  flagSmall: { width: 24, height: 16, borderRadius: 2, marginRight: 6 },
  teamName: { fontWeight: '600', fontSize: 13, color: '#333' }
});

export default GroupesScreen;
