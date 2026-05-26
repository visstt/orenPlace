const TOKEN_KEY = 'accessToken';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
}

function parseErrorMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return 'Ошибка запроса';
  const m = (body as { message?: unknown }).message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join(', ');
  return 'Ошибка запроса';
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const t = getToken();
  if (t) headers.set('Authorization', `Bearer ${t}`);

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
    window.location.hash = '#/login';
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }
  }

  if (!res.ok) {
    throw new Error(parseErrorMessage(json));
  }

  return (json as T) ?? (undefined as T);
}
