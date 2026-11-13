import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export default function CityArchCard({ city, onPress }) {
  const cardWidth = 140;
  const cardHeight = 240;
  const archHeight = 75;

  return (
    <TouchableOpacity 
      style={[styles.archCard, { width: cardWidth, height: cardHeight }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Svg height={cardHeight} width={cardWidth} style={styles.archSvg}>
        <Defs>
          <SvgLinearGradient id={`cityGrad${city.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={city.color1} stopOpacity="1" />
            <Stop offset="100%" stopColor={city.color2} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        
        <Path
          d={`
            M 0 ${archHeight}
            L ${cardWidth/2 - 45} ${archHeight}
            Q ${cardWidth/2 - 30} ${archHeight - 20}, ${cardWidth/2 - 15} ${archHeight - 35}
            Q ${cardWidth/2} ${archHeight - 50}, ${cardWidth/2 + 15} ${archHeight - 35}
            Q ${cardWidth/2 + 30} ${archHeight - 20}, ${cardWidth/2 + 45} ${archHeight}
            L ${cardWidth} ${archHeight}
            L ${cardWidth} ${cardHeight}
            L 0 ${cardHeight}
            Z
          `}
          fill={`url(#cityGrad${city.id})`}
        />

        <Path 
          d={`M ${cardWidth * 0.2} 125 L ${cardWidth * 0.35} 125 L ${cardWidth * 0.275} 140 Z`}
          fill="rgba(255, 255, 255, 0.08)" 
        />
        <Path 
          d={`M ${cardWidth * 0.65} 125 L ${cardWidth * 0.8} 125 L ${cardWidth * 0.725} 140 Z`}
          fill="rgba(255, 255, 255, 0.08)" 
        />
        <Rect 
          x={cardWidth * 0.15}
          y="175" 
          width="18" 
          height="18" 
          fill="transparent" 
          stroke="rgba(255, 255, 255, 0.1)" 
          strokeWidth="1.5"
          transform={`rotate(45 ${cardWidth * 0.15 + 9} ${175 + 9})`}
        />
        <Rect 
          x={cardWidth * 0.75}
          y="175" 
          width="18" 
          height="18" 
          fill="transparent" 
          stroke="rgba(255, 255, 255, 0.1)" 
          strokeWidth="1.5"
          transform={`rotate(45 ${cardWidth * 0.75 + 9} ${175 + 9})`}
        />
      </Svg>

      <View style={styles.archCardContent}>
        <Svg height="65" width="25" viewBox="0 0 100 100" style={styles.cityStar}>
          <Path
            d="M50 10 L61 40 L92 40 L67 58 L78 88 L50 70 L22 88 L33 58 L8 40 L39 40 Z"
            fill="#006233"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </Svg>

        <View style={styles.dotsRow}>
          <View style={styles.whiteDot} />
          <View style={styles.whiteDot} />
          <View style={styles.whiteDot} />
          <View style={styles.whiteDot} />
        </View>

        <View style={styles.cityTextContainer}>
          <Text style={styles.cityTitle}>{city.name}</Text>
          <Text style={styles.citySubtitle}>{city.subtitle}</Text>
          <Text style={styles.cityDetail}>{city.detail}</Text>
        </View>

        <View style={styles.arrowCircle}>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  archCard: {
    marginRight: 15,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  archSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  archCardContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 25,
    paddingBottom: 18,
    paddingHorizontal: 12,
  },
  cityStar: {
    marginBottom: 3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
  },
  whiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  cityTextContainer: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  cityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  citySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 3,
    textAlign: 'center',
  },
  cityDetail: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
