// src/components/LoginModal.js
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';

const { width } = Dimensions.get('window');

export default function LoginModal({ visible, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? API_ENDPOINTS.LOGIN : API_ENDPOINTS.REGISTER;
      const bodyData = isLogin 
        ? { emailOrUsername: email, password }
        : { name, username: name.split(' ')[0], email, password };

      const response = await apiClient.post(endpoint, bodyData);
      const data = response.data;

      // Succès — stocker le vrai JWT
      await login(data.token);
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
      Alert.alert('✅ Succès', isLogin ? 'Connexion réussie !' : 'Inscription réussie !');
    } catch (error) {
      console.error(error);
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Identifiants incorrects ou erreur serveur.';
      if (error.response) {
        Alert.alert('❌ Erreur', errorMessage);
      } else {
        Alert.alert('❌ Erreur réseau', 'Impossible de contacter le serveur.');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setPassword('');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1}
          style={styles.modalCard}
          onPress={() => {}} 
        >
          {/* Bouton fermer */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Ionicons name={isLogin ? "lock-closed" : "person-add"} size={40} color="#C1272D" />
            <Text style={styles.title}>{isLogin ? 'Connexion requise' : 'Créer un compte'}</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Connectez-vous pour accéder à cette section' : 'Inscrivez-vous pour profiter de toutes les fonctionnalités'}
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Nom (Uniquement pour Register) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Nom complet"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Mot de passe */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Bouton validation */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>{isLogin ? 'Se connecter' : 'S\'inscrire'}</Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
              <Text style={styles.toggleText}>
                {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
              </Text>
            </TouchableOpacity>
            

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: width - 60,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1A1A1A',
  },
  loginButton: {
    backgroundColor: '#C1272D',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#C1272D',
    fontSize: 14,
    fontWeight: '600',
  },
  demoText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 10,
    marginTop: 16,
  },
});