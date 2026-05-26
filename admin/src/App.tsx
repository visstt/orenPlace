import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { Dashboard } from './Dashboard';
import { api, clearAuth, getToken } from './api';
import { useEffect, useState } from 'react';
import type { AuthUser } from './authStorage';
import { setStoredUser } from './authStorage';

export type { AuthUser };

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setReady(true);
      setAllowed(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const me = await api<AuthUser & { surname?: string | null }>(
          '/users/me',
        );
        if (cancelled) return;
        if (me.role !== 'ADMIN') {
          clearAuth();
          setStoredUser(null);
          setAllowed(false);
        } else {
          setStoredUser({
            id: me.id,
            name: me.name,
            email: me.email,
            role: me.role,
          });
          setAllowed(true);
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!ready) {
    return (
      <div className="login-wrap">
        <p style={{ color: 'var(--muted)' }}>Загрузка…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="login-wrap">
        <div className="card login-card">
          <h1>Нет доступа</h1>
          <p>Войдите под учётной записью администратора.</p>
          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate('/login', { replace: true })}
          >
            На страницу входа
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
