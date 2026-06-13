import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { usersApi } from '../api/users';
import { RootStackParamList, Category } from '../types';
import { COLORS, SIZES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import DatePickerField from '../components/DatePickerField';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'events' | 'admins' | 'users' | 'analytics';

type UserRow = {
  id: string;
  name: string;
  surname: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  role: string;
  createdAt: string;
};

type UsersPage = {
  data: UserRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

type Analytics = {
  byEvent: {
    eventId: string;
    title: string;
    ticketCount: number;
  }[];
  purchasesByDay: { day: string; purchases: number }[];
};

export default function AdminPanelScreen() {
  const navigation = useNavigation<Nav>();
  const { login, logout, isAuthenticated } = useAuthStore();
  const [phase, setPhase] = useState<'loading' | 'login' | 'app'>('loading');
  const [tab, setTab] = useState<TabKey>('events');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const checkSession = useCallback(async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      setPhase('login');
      return;
    }
    try {
      const { data } = await usersApi.getMe();
      if (data.role === 'ADMIN') {
        setPhase('app');
      } else {
        setPhase('login');
      }
    } catch {
      setPhase('login');
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleAdminLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }
    setAuthBusy(true);
    try {
      await login(email.trim(), password);
      const { data } = await usersApi.getMe();
      if (data.role !== 'ADMIN') {
        await logout();
        Alert.alert('Нет доступа', 'Войдите под учётной записью администратора.');
        return;
      }
      setPhase('app');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Не удалось войти';
      Alert.alert('Ошибка', String(msg));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogoutAdmin = async () => {
    await logout();
    setPhase('login');
    setEmail('');
    setPassword('');
  };

  const goToApp = () => {
    if (isAuthenticated) {
      navigation.navigate('Main');
    } else {
      navigation.navigate('Login');
    }
  };

  if (phase === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (phase === 'login') {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.loginContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backLink} onPress={goToApp}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          <Text style={[styles.backLinkText, { marginLeft: 6 }]}>К приложению</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Админ-панель</Text>
        <Text style={styles.subtitle}>Вход только для администраторов</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor={COLORS.gray}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.primaryBtn, authBusy && styles.btnDisabled]}
          onPress={handleAdminLogin}
          disabled={authBusy}
        >
          {authBusy ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Войти</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backLink} onPress={goToApp}>
          <Ionicons name="home-outline" size={22} color={COLORS.primary} />
          <Text style={[styles.backLinkText, { marginLeft: 6 }]}>В приложение</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogoutAdmin}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabs}>
        {(
          [
            ['events', 'События'],
            ['admins', 'Админы'],
            ['users', 'Юзеры'],
            ['analytics', 'Стат.'],
          ] as const
        ).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {tab === 'events' ? <AdminEventsForm /> : null}
        {tab === 'admins' ? <AdminCreateAdminForm /> : null}
        {tab === 'users' ? <AdminUsersList /> : null}
        {tab === 'analytics' ? <AdminAnalytics /> : null}
      </ScrollView>
    </View>
  );
}

function AdminEventsForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [price, setPrice] = useState('0');
  const [address, setAddress] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then((r) => {
        setCategories(r.data);
        if (r.data[0]) setCategoryId(r.data[0].id);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить категории'));
  }, []);

  const submit = async () => {
    if (!title.trim() || !description.trim() || !date || !address.trim()) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }
    setBusy(true);
    try {
      await api.post('/events', {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        price: Number(price) || 0,
        address: address.trim(),
        categoryId,
        isPopular,
      });
      Alert.alert('Готово', 'Мероприятие создано');
      setTitle('');
      setDescription('');
      setDate('');
      setAddress('');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string | string[] } } })?.response
          ?.data?.message;
      Alert.alert(
        'Ошибка',
        Array.isArray(msg) ? msg.join(', ') : String(msg || 'Не удалось создать'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Новое мероприятие</Text>
      <Text style={styles.label}>Название</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      <Text style={styles.label}>Описание</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.label}>Дата</Text>
      <DatePickerField value={date} onChange={setDate} />
      <Text style={styles.label}>Время</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} />
      <Text style={styles.label}>Цена</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Адрес</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />
      <Text style={styles.label}>Категория</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text style={categoryId === c.id ? styles.chipTextActive : styles.chipText}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.row}>
        <Text style={styles.label}>Популярное</Text>
        <Switch value={isPopular} onValueChange={setIsPopular} />
      </View>
      <TouchableOpacity
        style={[styles.primaryBtn, busy && styles.btnDisabled]}
        onPress={submit}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.primaryBtnText}>Создать</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function AdminCreateAdminForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/admin/admins', { name, email, password });
      Alert.alert('Готово', 'Администратор добавлен или обновлён');
      setName('');
      setEmail('');
      setPassword('');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      Alert.alert('Ошибка', String(msg || 'Не удалось'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Новый администратор</Text>
      <Text style={styles.hint}>
        Если email уже есть у пользователя — ему выдаются права ADMIN и новый пароль.
      </Text>
      <Text style={styles.label}>Имя</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Пароль (мин. 6)</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.primaryBtn, busy && styles.btnDisabled]}
        onPress={submit}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.primaryBtnText}>Сохранить</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function AdminUsersList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [data, setData] = useState<UsersPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), limit: '12' });
      if (debounced) q.set('search', debounced);
      const r = await api.get<UsersPage>(`/admin/users?${q}`);
      setData(r.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Пользователи</Text>
      <TextInput
        style={styles.input}
        placeholder="Поиск по имени или email"
        placeholderTextColor={COLORS.gray}
        value={search}
        onChangeText={(t) => {
          setSearch(t);
          setPage(1);
        }}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 16 }} color={COLORS.primary} />
      ) : data ? (
        <>
          {data.data.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <Text style={styles.userName}>
                {u.name} {u.surname || ''}
              </Text>
              <Text style={styles.userMeta}>{u.email}</Text>
              <Text style={styles.userMeta}>
                {u.role} · {new Date(u.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          ))}
          <View style={styles.pager}>
            <TouchableOpacity
              disabled={page <= 1}
              onPress={() => setPage((p) => p - 1)}
              style={[styles.pagerBtn, page <= 1 && styles.btnDisabled]}
            >
              <Text style={styles.pagerBtnText}>Назад</Text>
            </TouchableOpacity>
            <Text style={[styles.pagerInfo, { marginHorizontal: 16 }]}>
              {page} / {data.meta.totalPages || 1}
            </Text>
            <TouchableOpacity
              disabled={page >= data.meta.totalPages}
              onPress={() => setPage((p) => p + 1)}
              style={[
                styles.pagerBtn,
                page >= data.meta.totalPages && styles.btnDisabled,
              ]}
            >
              <Text style={styles.pagerBtnText}>Вперёд</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.hint}>Не удалось загрузить</Text>
      )}
    </View>
  );
}

function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    api
      .get<Analytics>('/admin/analytics/attendance')
      .then((r) => setData(r.data))
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Статистика</Text>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const maxTickets = Math.max(1, ...data.byEvent.map((e) => e.ticketCount));
  const top = [...data.byEvent].sort((a, b) => b.ticketCount - a.ticketCount).slice(0, 8);
  const maxDay = Math.max(1, ...data.purchasesByDay.map((d) => d.purchases));

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Билеты по мероприятиям (топ-8)</Text>
      {top.map((e) => (
        <View key={e.eventId} style={styles.chartRow}>
          <Text style={styles.chartLabel} numberOfLines={2}>
            {e.title}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.max(2, Math.round((e.ticketCount / maxTickets) * 100))}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.chartValue}>{e.ticketCount}</Text>
        </View>
      ))}
      <Text style={[styles.cardTitle, { marginTop: SIZES.padding * 2 }]}>
        Покупки по дням (90 дн.)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.dayChart}>
          {data.purchasesByDay.map((d) => (
            <View key={d.day} style={styles.dayCol}>
              <View
                style={[
                  styles.dayBar,
                  { height: Math.max(4, (d.purchases / maxDay) * 80) },
                ]}
              />
              <Text style={styles.dayLabel} numberOfLines={1}>
                {d.day.slice(5)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loginContent: { padding: SIZES.padding * 2, paddingTop: Platform.OS === 'web' ? 48 : 24 },
  scroll: { flex: 1 },
  scrollContent: { padding: SIZES.padding, paddingBottom: 48 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: Platform.OS === 'web' ? 16 : 8,
    paddingBottom: 8,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backLink: { flexDirection: 'row', alignItems: 'center' },
  backLinkText: { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.font },
  logoutText: { color: COLORS.error, fontWeight: '600' },
  title: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: { color: COLORS.textSecondary, marginBottom: 24 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  textarea: { minHeight: 88, textAlignVertical: 'top' },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.medium },
  btnDisabled: { opacity: 0.6 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  hint: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chips: { marginBottom: 12, maxHeight: 44 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 8,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text, fontSize: 13 },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
  userRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userName: { fontWeight: '600', color: COLORS.text },
  userMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  pager: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  pagerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  pagerBtnText: { fontWeight: '600', color: COLORS.primary },
  pagerInfo: { color: COLORS.textSecondary },
  chartRow: { marginBottom: 14 },
  chartLabel: { fontSize: 12, color: COLORS.text, marginBottom: 4 },
  barTrack: {
    height: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  chartValue: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  dayChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
  dayCol: { alignItems: 'center', width: 36, marginRight: 6 },
  dayBar: { width: 20, backgroundColor: COLORS.primaryDark, borderRadius: 4 },
  dayLabel: { fontSize: 9, color: COLORS.textSecondary, marginTop: 4, maxWidth: 36 },
});
