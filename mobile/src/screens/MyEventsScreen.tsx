import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';
import { ticketsApi } from '../api';
import { Ticket } from '../types';

export default function MyEventsScreen() {
  const { data: todayTickets, isLoading: todayLoading } = useQuery({
    queryKey: ['tickets', 'today'],
    queryFn: () => ticketsApi.getToday(),
    select: (res) => res.data,
  });

  const { data: upcomingTickets, isLoading: upcomingLoading } = useQuery({
    queryKey: ['tickets', 'upcoming'],
    queryFn: () => ticketsApi.getUpcoming(),
    select: (res) => res.data,
  });

  const { data: allTickets, isLoading: allLoading } = useQuery({
    queryKey: ['tickets', 'all'],
    queryFn: () => ticketsApi.getMy(),
    select: (res) => res.data,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketLeft}>
        <View
          style={[
            styles.ticketColorBar,
            { backgroundColor: item.event?.category?.color || COLORS.primary },
          ]}
        />
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketTitle} numberOfLines={2}>
            {item.event?.title}
          </Text>
          <View style={styles.ticketRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.ticketDate}>
              {formatDate(item.event?.date)}
            </Text>
          </View>
          <View style={styles.ticketRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.ticketTime}>{item.event?.time}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.ticketAddress} numberOfLines={1}>
              {item.event?.address}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.ticketRight}>
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.qrCode}>{item.qrCode}</Text>
      </View>
    </View>
  );

  const isLoading = todayLoading || upcomingLoading || allLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const hasTickets = (allTickets?.length || 0) > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Мои события</Text>
          <Ionicons name="ticket" size={24} color={COLORS.primary} style={styles.titleIcon} />
        </View>
        <Text style={styles.subtitle}>
          {hasTickets
            ? `${allTickets?.length} билетов`
            : 'У вас пока нет билетов'}
        </Text>
      </View>

      {!hasTickets ? (
        <View style={styles.emptyState}>
          <Ionicons name="ticket-outline" size={80} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>Нет билетов</Text>
          <Text style={styles.emptyText}>
            Купите билет на мероприятие,{'\n'}и он появится здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...(todayTickets?.length ? [{ type: 'header', title: 'Сегодня', icon: 'today' }] : []),
            ...(todayTickets || []).map((t: Ticket) => ({ ...t, type: 'ticket' })),
            ...(upcomingTickets?.length ? [{ type: 'header', title: 'В ближайшие дни', icon: 'calendar' }] : []),
            ...(upcomingTickets || []).map((t: Ticket) => ({ ...t, type: 'ticket' })),
          ] as any[]}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.sectionHeader}>
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                </View>
              );
            }
            return renderTicket({ item: item as Ticket });
          }}
          keyExtractor={(item, index) =>
            item.type === 'header' ? `header-${index}` : item.id
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    marginTop: 2,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  ticketLeft: {
    flex: 1,
    flexDirection: 'row',
  },
  ticketColorBar: {
    width: 5,
  },
  ticketInfo: {
    flex: 1,
    padding: 14,
  },
  ticketTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  ticketTime: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  ticketAddress: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    flex: 1,
  },
  ticketRight: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    borderStyle: 'dashed',
  },
  qrPlaceholder: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    fontSize: 8,
    color: COLORS.gray,
    marginTop: 4,
  },
});
