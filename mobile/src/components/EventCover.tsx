import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { getCategoryIcon, getCoverGradient } from '../utils/eventCover';

interface EventCoverProps {
  title?: string;
  subtitle?: string;
  category?: Category | null;
  height?: number;
  compact?: boolean;
  hero?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function EventCover({
  title,
  subtitle,
  category,
  height = 180,
  compact = false,
  hero = false,
  style,
}: EventCoverProps) {
  const colors = getCoverGradient(category);
  const icon = getCategoryIcon(category?.icon);
  const iconSize = compact ? 32 : hero ? 88 : 64;

  return (
    <View style={[styles.root, { height }, compact && styles.compact, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />
      <View style={[styles.blob, styles.blobMid]} />

      {compact ? (
        <View style={styles.compactIconWrap}>
          <Ionicons name={icon} size={iconSize} color="rgba(255,255,255,0.45)" />
        </View>
      ) : (
        <Ionicons
          name={icon}
          size={iconSize}
          color="rgba(255,255,255,0.28)"
          style={styles.icon}
        />
      )}

      {!hero && category?.name && !compact && (
        <View style={styles.chip}>
          <Text style={styles.chipText}>{category.name}</Text>
        </View>
      )}

      {hero && title ? (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.heroOverlay}
        >
          {category?.name ? (
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{category.name}</Text>
            </View>
          ) : null}
          <Text style={styles.heroTitle} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </LinearGradient>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  compact: {
    width: 100,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  blobTop: {
    width: 140,
    height: 140,
    top: -40,
    right: -30,
  },
  blobBottom: {
    width: 100,
    height: 100,
    bottom: -20,
    left: -20,
  },
  blobMid: {
    width: 60,
    height: 60,
    top: '35%',
    left: '55%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  icon: {
    position: 'absolute',
    right: 20,
    bottom: 16,
  },
  compactIconWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  chipText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 40,
  },
  heroChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  heroChipText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: SIZES.small,
    marginTop: 4,
  },
});
