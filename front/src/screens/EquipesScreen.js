import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import { getFlagUrl } from '../utils/fifaCodeToIso';

const numColumns = 3;

const EquipesScreen = ({ navigation }) => {
  const [equipes, setEquipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EQUIPES);
      setEquipes(response.data);
    } catch (error) {
      console.error('Error fetching equipes', error);
      Alert.alert('Erreur', 'Impossible de charger les équipes.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipes = filter === 'All' ? equipes : equipes.filter(e => e.groupe === filter);

  const renderEquipe = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('EquipeDetail', { id: item.id })}
    >
      <Image source={{ uri: getFlagUrl(item.nom || item.code) }} style={styles.flag} />
      <Text style={styles.equipeName} numberOfLines={1}>{item.nom}</Text>
      <Text style={styles.groupeText}>Grp {item.groupe}</Text>
    </TouchableOpacity>
  );

  const groupesArray = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('MatchsMain')}><Text style={styles.navTabText}>Calendrier</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('MatchsMain', { tab: 'LIVE' })}><Text style={styles.navTabText}>Live 🔴</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navTab} onPress={() => navigation.replace('GroupesMain')}><Text style={styles.navTabText}>Groupes</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navTabActive}><Text style={styles.navTabTextActive}>Équipes</Text></TouchableOpacity>
      </View>

      <Text style={styles.title}>Équipes Qualifiées</Text>
      
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <FlatList 
          horizontal
          showsHorizontalScrollIndicator={false}
          data={groupesArray}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterBtn, filter === item && styles.filterBtnActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item === 'All' ? 'Tous' : `Grp ${item}`}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C1272D" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredEquipes}
          renderItem={renderEquipe}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          numColumns={numColumns}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
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
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10 },
  filterBtnActive: { backgroundColor: '#C1272D' },
  filterText: { color: '#555', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 6,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    height: 120,
    justifyContent: 'center'
  },
  flag: { width: 60, height: 40, borderRadius: 4, marginBottom: 8 },
  equipeName: { fontWeight: 'bold', fontSize: 13, color: '#333', textAlign: 'center' },
  groupeText: { fontSize: 11, color: '#999', marginTop: 4 }
});

export default EquipesScreen;
