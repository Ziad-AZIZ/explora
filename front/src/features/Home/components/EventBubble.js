import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function EventBubble({ date, events, onClose }) {
  const { t } = useTranslation();
  
  const colorMap = {
    match: '#C1272D',
    hotel: '#3498db',
    restaurant: '#e67e22',
  };
  
  const iconMap = {
    match: '⚽',
    hotel: '🏨',
    restaurant: '🍽️',
  };
  
  const typeNames = {
    match: t('calendar.eventTypes.match'),
    hotel: t('calendar.eventTypes.hotel'),
    restaurant: t('calendar.eventTypes.restaurant'),
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.bubbleOverlay}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <View style={styles.eventBubble}>
        <View style={styles.bubbleHeader}>
          <Text style={styles.bubbleDate}>📅 {date} {t('calendar.months.june')} 2025</Text>
          <TouchableOpacity onPress={onClose} style={styles.bubbleCloseButton}>
            <Text style={styles.bubbleCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.bubbleContent} showsVerticalScrollIndicator={false}>
          {events.map((event, index) => (
            <View 
              key={event.id} 
              style={[
                styles.bubbleEventItem,
                index < events.length - 1 && styles.bubbleEventItemBorder
              ]}
            >
              <View style={[styles.bubbleEventDot, { backgroundColor: colorMap[event.type] }]} />
              <View style={styles.bubbleEventInfo}>
                <View style={styles.bubbleEventHeader}>
                  <Text style={styles.bubbleEventIcon}>{iconMap[event.type]}</Text>
                  <Text style={styles.bubbleEventType}>{typeNames[event.type]}</Text>
                </View>
                <Text style={styles.bubbleEventTitle}>{event.title}</Text>
                <Text style={styles.bubbleEventLocation}>📍 {event.location}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bubbleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  eventBubble: {
    position: 'absolute',
    top: '20%',
    left: 20,
    right: 20,
    maxHeight: '60%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 101,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
  },
  bubbleDate: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  bubbleCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleCloseIcon: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
  },
  bubbleContent: {
    maxHeight: 300,
  },
  bubbleEventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  bubbleEventItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bubbleEventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  bubbleEventInfo: {
    flex: 1,
  },
  bubbleEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bubbleEventIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  bubbleEventType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999999',
    textTransform: 'uppercase',
  },
  bubbleEventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bubbleEventLocation: {
    fontSize: 13,
    color: '#666666',
  },
});
