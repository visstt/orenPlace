import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Ошибка', 'Имя и Email обязательны');
      return;
    }

    setLoading(true);
    try {
      await updateUser(formData);
      Alert.alert('✅ Успешно', 'Профиль обновлен');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Ошибка',
        error.response?.data?.message || 'Не удалось обновить профиль',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Имя *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="Введите имя"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Фамилия</Text>
          <TextInput
            style={styles.input}
            value={formData.surname}
            onChangeText={(v) => updateField('surname', v)}
            placeholder="Введите фамилию"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="email@example.com"
            placeholderTextColor={COLORS.gray}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Телефон</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(v) => updateField('phone', v)}
            placeholder="+7 (___) ___-__-__"
            placeholderTextColor={COLORS.gray}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Город</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(v) => updateField('city', v)}
            placeholder="Оренбург"
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Сохранить</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: SIZES.padding * 1.5,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: SIZES.medium,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    marginTop: 12,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});
