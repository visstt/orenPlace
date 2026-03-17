import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';

export default function AboutScreen() {
  const navigation = useNavigation();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

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
        <Text style={styles.headerTitle}>О приложении</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="calendar" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>Куда сходить в Оренбурге</Text>
          <Text style={styles.version}>Версия 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <Text style={styles.description}>
            Приложение для поиска и покупки билетов на мероприятия в Оренбурге. 
            Здесь вы найдете концерты, спектакли, выставки, спортивные события и многое другое.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Возможности</Text>
          <View style={styles.featureItem}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Поиск мероприятий по категориям</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Избранные события</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="ticket" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Покупка билетов онлайн</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Календарь событий</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контакты</Text>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('mailto:support@orenplace.ru')}
          >
            <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.contactText}>support@orenplace.ru</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openLink('tel:+73532000000')}
          >
            <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.contactText}>+7 (3532) 00-00-00</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 OrenPlace. Все права защищены.
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: SIZES.padding,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  appName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
});
