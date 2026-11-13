import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../../../context/ThemeContext';

export default function CalendarView({ events, onDatePress }) {
  const { colors, isDarkMode } = useTheme();

  const getEventColor = (type) => {
    const colorMap = {
      match: '#C1272D',
      hotel: '#3498db',
      restaurant: '#e67e22',
    };
    return colorMap[type] || '#ccc';
  };

  const markedDates = {};
  
  events.forEach(event => {
    if (!markedDates[event.date]) {
      markedDates[event.date] = {
        customStyles: {
          container: {
            backgroundColor: getEventColor(event.type),
            borderRadius: 100,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center'
          },
          text: {
            color: '#FFFFFF',
            fontWeight: 'bold'
          }
        }
      };
    }
  });

  return (
    <View style={[styles.calendarContainer, { backgroundColor: colors.card }]}>
      <Calendar
        markingType={'custom'}
        markedDates={markedDates}
        onDayPress={(day) => {
          if (onDatePress && markedDates[day.dateString]) {
            onDatePress(day.dateString);
          }
        }}
        theme={{
          backgroundColor: colors.card,
          calendarBackground: colors.card,
          textSectionTitleColor: colors.subtext,
          selectedDayBackgroundColor: isDarkMode ? '#444' : '#f0f0f0',
          selectedDayTextColor: colors.text,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: isDarkMode ? '#444' : '#d9e1e8',
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  }
});
