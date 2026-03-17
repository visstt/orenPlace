import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';
import { ticketsApi, eventsApi } from '../api';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type RouteProps = RouteProp<RootStackParamList, 'PurchaseTicket'>;

export default function PurchaseTicketScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { eventId } = route.params;
  const queryClient = useQueryClient();

  console.log('PurchaseTicketScreen render, eventId:', eventId);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getOne(eventId),
    select: (res) => res.data,
  });

  const buyTicketMutation = useMutation({
    mutationFn: () => {
      console.log('Покупка билета для события:', eventId);
      return ticketsApi.buy(eventId);
    },
    onSuccess: (data) => {
      console.log('Билет успешно куплен:', data);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      setIsProcessing(false);
      Alert.alert(
        'Успешно! 🎉',
        'Билет успешно приобретен! Вы можете найти его в разделе "Мои события".',
        [
          {
            text: 'Перейти к билетам',
            onPress: () => navigation.navigate('MyEvents' as never),
          },
        ]
      );
    },
    onError: (error: any) => {
      console.error('Ошибка покупки билета:', error);
      console.error('Детали ошибки:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Не удалось купить билет';
      Alert.alert('Ошибка', errorMessage);
      setIsProcessing(false);
    },
  });

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePayment = () => {
    console.log('=== handlePayment вызвана ===');
    console.log('cardNumber:', cardNumber);
    console.log('expiryDate:', expiryDate);
    console.log('cvv:', cvv);
    console.log('cardHolder:', cardHolder);
    
    if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
      console.log('Ошибка: не все поля заполнены');
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      console.log('Ошибка: неверная длина карты');
      Alert.alert('Ошибка', 'Неверный номер карты');
      return;
    }

    console.log('Начало обработки платежа...');
    setIsProcessing(true);

    // Имитация обработки платежа (2 секунды)
    setTimeout(() => {
      console.log('Вызов API покупки билета...');
      buyTicketMutation.mutate();
    }, 2000);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Бесплатно';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Оплата билета</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventDetails}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>
              {new Date(event.date).toLocaleDateString('ru-RU')}
            </Text>
          </View>
          <View style={styles.eventDetails}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>{event.time}</Text>
          </View>
          <View style={styles.eventDetails}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.eventDetailText}>{event.address}</Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Стоимость билета</Text>
          <Text style={styles.priceValue}>{formatPrice(event.price)}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Данные карты</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Номер карты</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Срок действия</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="MM/ГГ"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                />
              </View>
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Имя владельца карты</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="IVAN IVANOV"
                autoCapitalize="characters"
                value={cardHolder}
                onChangeText={setCardHolder}
              />
            </View>
          </View>
        </View>

        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <Text style={styles.securityText}>
            Ваши данные защищены и не передаются третьим лицам
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={() => {
            console.log('Кнопка оплаты нажата!');
            handlePayment();
          }}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.payButtonText}>Оплатить {formatPrice(event.price)}</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
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
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  eventInfo: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  priceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 24,
    ...SHADOWS.light,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  form: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    ...SHADOWS.light,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 100,
    ...SHADOWS.light,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.light,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginRight: 8,
  },
});
