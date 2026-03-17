export const COLORS = {
  primary: '#8E2DE2',
  primaryDark: '#4A00E0',
  accent: '#B4F000',
  background: '#F4F1FF',
  text: '#1C1C1E',
  textSecondary: '#6B6B80',
  white: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E8E5F0',
  error: '#FF3B30',
  success: '#34C759',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
  skeleton: '#E8E5F0',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  extraLarge: 24,
  title: 28,
  padding: 16,
  radius: 16,
  radiusLarge: 20,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};

import { Platform } from 'react-native';

// Определяем URL в зависимости от платформы
export const API_URL = 
  Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000/api'  // Android emulator
    : Platform.OS === 'ios'
    ? 'http://localhost:3000/api' // iOS simulator
    : 'http://localhost:3000/api'; // Web/other
