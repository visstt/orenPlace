import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/constants';

export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateISO(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date();
}

function formatDisplayDate(value: string): string {
  if (!value) return 'Выберите дату';
  const date = parseDateISO(value);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

export default function DatePickerField({
  value,
  onChange,
  style,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerDate = useMemo(
    () => (value ? parseDateISO(value) : new Date()),
    [value],
  );

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (selected) {
      onChange(formatDateISO(selected));
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.field, style]}>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            border: `1px solid ${COLORS.border}`,
            borderRadius: SIZES.radius,
            padding: 12,
            fontSize: SIZES.font,
            color: COLORS.text,
            backgroundColor: COLORS.card,
            boxSizing: 'border-box',
          }}
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.field}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {formatDisplayDate(value)}
        </Text>
        <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          locale="ru-RU"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 12,
    marginBottom: 12,
    backgroundColor: COLORS.card,
  },
  text: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.gray,
  },
});
