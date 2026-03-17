import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';
import { eventsApi, ticketsApi } from '../api';
import { RootStackParamList } from '../types';
import { useFavoritesStore } from '../store/favoritesStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type RouteProps = RouteProp<RootStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { eventId } = route.params;
  const queryClient = useQueryClient();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getOne(eventId),
    select: (res) => res.data,
  });

  const handleBuyTicket = () => {
    navigation.navigate('PurchaseTicket' as never, { eventId } as never);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно';
    return `${price} ₽`;
  };

  if (isLoading || !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: event.images[0] || 'https://placehold.co/800x400/8E2DE2/white?text=Event',
            }}
            style={styles.image}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          />
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(event.id)}
          >
            <Ionicons 
              name={isFavorite(event.id) ? "heart" : "heart-outline"} 
              size={26} 
              color={isFavorite(event.id) ? COLORS.error : COLORS.white} 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: event.category?.color || COLORS.primary },
            ]}
          >
            <Text style={styles.categoryBadgeText}>
              {event.category?.name}
            </Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          {/* Info cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="calendar" size={24} color={COLORS.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Дата</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="time" size={24} color={COLORS.primary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Время</Text>
              <Text style={styles.infoValue}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.addressCard}>
            <Ionicons name="location" size={24} color={COLORS.primary} style={styles.infoIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Адрес</Text>
              <Text style={styles.addressText}>{event.address}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionBlock}>
            <Text style={styles.descriptionTitle}>Описание</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buy Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Стоимость</Text>
          <Text style={styles.priceValue}>{formatPrice(event.price)}</Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyTicket}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.buyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buyButtonText}>Купить билет</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SIZES.padding,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: COLORS.background,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.white,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 14,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  addressText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginTop: 4,
  },
  descriptionBlock: {
    marginBottom: 100,
  },
  descriptionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...SHADOWS.medium,
  },
  priceBlock: {
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  buyButton: {
    flex: 1,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  buyButtonText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
