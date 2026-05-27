import axios from 'axios';
import { API_URL } from './constants';

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Сервер не отвечает (таймаут). Проверьте интернет.';
      }
      return `Нет связи с сервером.\n\nПроверьте интернет и доступность:\n${API_URL}\n\nНа телефоне должен быть доступен HTTP (не HTTPS) к IP сервера.`;
    }

    const data = error.response.data as { message?: string | string[] };
    if (Array.isArray(data?.message)) {
      return data.message.join('\n');
    }
    if (typeof data?.message === 'string') {
      return data.message;
    }

    return `Ошибка сервера (${error.response.status})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Неизвестная ошибка';
}
