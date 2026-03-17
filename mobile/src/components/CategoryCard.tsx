import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../utils/constants';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  const getIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      music: '🎵',
      'theater-masks': '🎭',
      palette: '🎨',
      futbol: '⚽',
      film: '🎬',
      star: '⭐',
      'paint-brush': '🖌',
      child: '👶',
      calendar: '📅',
    };
    return icons[iconName] || '📅';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBlock, { backgroundColor: category.color }]}>
        <Text style={styles.icon}>{getIcon(category.icon)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>
          {category.eventsCount || 0} мероприятий
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  iconBlock: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  count: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.gray,
  },
});
