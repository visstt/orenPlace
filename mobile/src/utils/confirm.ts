import { Alert, Platform } from 'react-native';

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmLabel = 'OK',
): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      void onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Отмена', style: 'cancel' },
    {
      text: confirmLabel,
      style: 'destructive',
      onPress: () => void onConfirm(),
    },
  ]);
}
