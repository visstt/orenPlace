import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, clearAuth } from './api';
import { setStoredUser } from './authStorage';

type Tab = 'events' | 'admins' | 'users' | 'analytics';

type Category = {
  id: string;
  name: string;
  color: string;
};

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

type UsersResponse = {
  data: UserRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

type Analytics = {
  byEvent: {
    eventId: string;
    title: string;
    eventDate: string;
    ticketCount: number;
  }[];
  purchasesByDay: { day: string; purchases: number }[];
};

const emptyEventForm = {
  title: '',
  description: '',
  date: '',
  time: '19:00',
  price: 0,
  address: '',
  categoryId: '',
  isPopular: false,
  images: '',
};

export function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('events');

  function logout() {
    clearAuth();
    setStoredUser(null);
    navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>OrenPlace — админ</h1>
        <button
          type="button"
          className={`nav-btn ${tab === 'events' ? 'active' : ''}`}
          onClick={() => setTab('events')}
        >
          Мероприятия
        </button>
        <button
          type="button"
          className={`nav-btn ${tab === 'admins' ? 'active' : ''}`}
          onClick={() => setTab('admins')}
        >
          Администраторы
        </button>
        <button
          type="button"
          className={`nav-btn ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          Пользователи
        </button>
        <button
          type="button"
          className={`nav-btn ${tab === 'analytics' ? 'active' : ''}`}
          onClick={() => setTab('analytics')}
        >
          Аналитика
        </button>
        <div className="sidebar-footer">
          <button type="button" className="logout" onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>
      <main className="main">
        {tab === 'events' ? <EventsSection /> : null}
        {tab === 'admins' ? <AdminsSection /> : null}
        {tab === 'users' ? <UsersSection /> : null}
        {tab === 'analytics' ? <AnalyticsSection /> : null}
      </main>
    </div>
  );
}

function EventsSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyEventForm);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Category[]>('/categories')
      .then((c) => {
        setCategories(c);
        setForm((f) => ({
          ...f,
          categoryId: f.categoryId || c[0]?.id || '',
        }));
      })
      .catch(() => setErr('Не удалось загрузить категории'));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      const images = form.images
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await api('/events', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          date: form.date,
          time: form.time,
          price: Number(form.price),
          address: form.address,
          categoryId: form.categoryId,
          isPopular: form.isPopular,
          images: images.length ? images : undefined,
        }),
      });
      setMsg('Мероприятие создано.');
      setForm((f) => ({ ...emptyEventForm, categoryId: f.categoryId }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Новое мероприятие</h2>
      {err ? <p className="error">{err}</p> : null}
      {msg ? <p style={{ color: 'var(--primary)' }}>{msg}</p> : null}
      <form onSubmit={submit} className="form-grid">
        <label>
          Название
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>
        <label>
          Описание
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>
        <label>
          Дата
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </label>
        <label>
          Время
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            required
          />
        </label>
        <label>
          Цена (₽)
          <input
            type="number"
            min={0}
            step={1}
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
            required
          />
        </label>
        <label>
          Адрес
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </label>
        <label>
          Категория
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
          />
          Популярное
        </label>
        <label>
          Изображения (URL через запятую)
          <input
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            placeholder="https://..."
          />
        </label>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Сохранение…' : 'Добавить мероприятие'}
        </button>
      </form>
    </div>
  );
}

function AdminsSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      await api('/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setMsg('Администратор добавлен или повышен.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Новый администратор</h2>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>
        Если пользователь с таким email уже есть, ему будут выданы права
        администратора и новый пароль.
      </p>
      {err ? <p className="error">{err}</p> : null}
      {msg ? <p style={{ color: 'var(--primary)' }}>{msg}</p> : null}
      <form onSubmit={submit} className="form-grid">
        <label>
          Имя
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Пароль (мин. 6 символов)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Сохранение…' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}

function UsersSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [data, setData] = useState<UsersResponse | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setErr('');
    try {
      const q = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (debounced) q.set('search', debounced);
      const res = await api<UsersResponse>(`/admin/users?${q}`);
      setData(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Ошибка');
    }
  }, [page, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="card">
      <h2>Пользователи</h2>
      <label style={{ maxWidth: 320, marginBottom: '1rem' }}>
        Поиск
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Имя или email"
        />
      </label>
      {err ? <p className="error">{err}</p> : null}
      {data ? (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Город</th>
                  <th>Роль</th>
                  <th>Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {u.name} {u.surname || ''}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.city || '—'}</td>
                    <td>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </button>
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              Стр. {data.meta.page} из {data.meta.totalPages || 1} (
              {data.meta.total} всего)
            </span>
            <button
              type="button"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function AnalyticsSection() {
  const [data, setData] = useState<Analytics | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api<Analytics>('/admin/analytics/attendance')
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : 'Ошибка'));
  }, []);

  if (err) {
    return (
      <div className="card">
        <h2>Аналитика</h2>
        <p className="error">{err}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        <h2>Аналитика</h2>
        <p style={{ color: 'var(--muted)' }}>Загрузка…</p>
      </div>
    );
  }

  const barData = data.byEvent.slice(0, 12).map((e) => ({
    name:
      e.title.length > 28 ? `${e.title.slice(0, 28)}…` : e.title,
    fullTitle: e.title,
    Билеты: e.ticketCount,
  }));

  return (
    <>
      <div className="card">
        <h2>Билеты по мероприятиям</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>
          Наведите на столбец для подсказки. Показаны топ-12 по числу проданных
          билетов.
        </p>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ left: 8, right: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-28}
                textAnchor="end"
                height={70}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(142, 45, 226, 0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as {
                    fullTitle: string;
                    Билеты: number;
                  };
                  return (
                    <div
                      style={{
                        background: '#fff',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow)',
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {row.fullTitle}
                      </div>
                      <div style={{ color: 'var(--muted)' }}>
                        Билетов: {row.Билеты}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend />
              <Bar dataKey="Билеты" fill="#8E2DE2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h2>Продажи билетов по дням</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>
          За последние 90 дней (по дате покупки).
        </p>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.purchasesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e5f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="purchases"
                name="Покупок"
                stroke="#4A00E0"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
