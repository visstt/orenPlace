import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';
import { eventsApi, categoriesApi } from '../api';
import { Event, Category, RootStackParamList } from '../types';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { toggleFavorite, isFavorite, loadFavorites } = useFavoritesStore();

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ['events', selectedCategory, searchQuery],
    queryFn: () =>
      eventsApi.getAll({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
      }),
    select: (res) => res.data,
  });

  const { data: popularEvents } = useQuery({
    queryKey: ['events', 'popular'],
    queryFn: () => eventsApi.getPopular(),
    select: (res) => res.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    select: (res) => res.data,
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchEvents();
    setRefreshing(false);
  }, []);

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

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipActive,
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item.id ? null : item.id)
      }
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item.id && styles.categoryChipTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderPopularItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.popularCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.images[0] || 'https://placehold.co/300x200/8E2DE2/white?text=Event' }}
        style={styles.popularImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.popularOverlay}
      >
        <Text style={styles.popularTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.popularDate}>{formatDate(item.date)}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.images[0] || 'https://placehold.co/400x200/8E2DE2/white?text=Event' }}
        style={styles.eventImage}
      />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[styles.eventCategoryBadge, { backgroundColor: item.category?.color || COLORS.primary }]}>
            <Text style={styles.eventCategoryText}>{item.category?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite(item.id) ? COLORS.error : COLORS.gray} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.eventFooter}>
          <View style={styles.eventDateContainer}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.eventDate}> {formatDate(item.date)}</Text>
          </View>
          <Text style={styles.eventPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Куда сходить{'\n'}в Оренбурге</Text>
          <Text style={styles.headerSubtitle}>
            Найдите лучшие мероприятия города
          </Text>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Поиск мероприятий..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular */}
        {popularEvents && popularEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flame" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}> Популярное</Text>
            </View>
            <FlatList
              data={popularEvents}
              renderItem={renderPopularItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularList}
            />
          </View>
        )}

        {/* Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={22} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Все мероприятия</Text>
          </View>
          {eventsLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            eventsData?.data?.map((event: Event) => (
              <View key={event.id}>
                {renderEventItem({ item: event })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.text,
    paddingVertical: 10,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  popularList: {
    paddingRight: 16,
  },
  popularCard: {
    width: width * 0.65,
    height: 180,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    marginRight: 12,
    ...SHADOWS.medium,
  },
  popularImage: {
    width: '100%',
    height: '100%',
  },
  popularOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  popularTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  popularDate: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 14,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventCategoryBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  eventCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  eventTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  eventPrice: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
