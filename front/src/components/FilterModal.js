import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterModal({ 
  visible, 
  onClose, 
  title, 
  options, 
  selected, 
  onSelect, 
  getLabel 
}) {
  return (
    <Modal 
      visible={visible} 
      transparent={true} 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalList}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.modalItem,
                  selected === option && styles.modalItemActive
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <View style={styles.modalItemContent}>
                  <Text style={[
                    styles.modalItemText,
                    selected === option && styles.modalItemTextActive
                  ]}>
                    {getLabel(option)}
                  </Text>
                </View>
                {selected === option && (
                  <View style={styles.checkmarkContainer}>
                    <Ionicons name="checkmark-circle" size={22} color="#C1272D" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '65%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    maxHeight: 400,
    paddingVertical: 8,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  modalItemActive: {
    backgroundColor: '#FFF5F5',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  modalItemTextActive: {
    fontWeight: '700',
    color: '#C1272D',
  },
  checkmarkContainer: {
    marginLeft: 12,
  },
});
