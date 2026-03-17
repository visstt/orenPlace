import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../utils/constants';
import { Event } from '../../types';

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  compact?: boolean;
}

export default function EventCard({
  event,
  onPress,
  onFavoritePress,
  isFavorite = false,
  compact = false,
}: EventCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно';
    return `${price} ₽`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image
          source={{
            uri: event.images?.[0] || 'https://placehold.co/200x200/8E2DE2/white?text=Event',
          }}
          style={styles.compactImage}
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={styles.compactDate}>📅 {formatDate(event.date)}</Text>
          <Text style={styles.compactPrice}>{formatPrice(event.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: event.images?.[0] || 'https://placehold.co/400x200/8E2DE2/white?text=Event',
        }}
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: event.category?.color || COLORS.primary },
            ]}
          >
            <Text style={styles.categoryText}>{event.category?.name}</Text>
          </View>
          {onFavoritePress && (
            <TouchableOpacity
              onPress={onFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 22 }}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.date}>📅 {formatDate(event.date)}</Text>
          <Text style={styles.price}>{formatPrice(event.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  price: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  compactImage: {
    width: 100,
    height: 100,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  compactDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  compactPrice: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
