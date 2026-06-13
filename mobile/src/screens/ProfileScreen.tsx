import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';
import { confirmAction } from '../utils/confirm';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    confirmAction(
      'Выход',
      'Вы уверены, что хотите выйти?',
      () => logout(),
      'Выйти',
    );
  };

  const menuItems = useMemo(() => {
    const items: Array<{
      icon: keyof typeof Ionicons.glyphMap;
      title: string;
      onPress: () => void;
      admin?: boolean;
    }> = [];

    if (user?.role === 'ADMIN') {
      items.push({
        icon: 'shield-checkmark-outline',
        title: 'Админ-панель',
        onPress: () => navigation.navigate('Admin'),
        admin: true,
      });
    }

    items.push(
      {
        icon: 'create-outline',
        title: 'Редактировать профиль',
        onPress: () => navigation.navigate('EditProfile'),
      },
      {
        icon: 'ticket-outline',
        title: 'Мои билеты',
        onPress: () => navigation.navigate('Main', { screen: 'MyEvents' }),
      },
      {
        icon: 'heart-outline',
        title: 'Избранное',
        onPress: () => navigation.navigate('Main', { screen: 'Favorites' }),
      },
      {
        icon: 'information-circle-outline',
        title: 'О приложении',
        onPress: () => navigation.navigate('About'),
      },
    );

    return items;
  }, [navigation, user?.role]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.userName}>
          {user?.name} {user?.surname || ''}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.city && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.userCity}> {user.city}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Menu */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.menuItem, item.admin && styles.menuItemAdmin]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={item.admin ? COLORS.primaryDark : COLORS.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuTitle, item.admin && styles.menuTitleAdmin]}>
              {item.title}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}> Выйти из аккаунта</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  userCity: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemAdmin: {
    backgroundColor: '#F4EEFF',
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  menuTitleAdmin: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  menuArrow: {
    fontSize: 22,
    color: COLORS.gray,
  },
  logoutButton: {
    marginTop: 20,
    marginHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: SIZES.medium,
    color: COLORS.error,
    fontWeight: '600',
  },
});
