import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function Private({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated, logout } = useAuth();
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Link to="/">Главная</Link>
        {!isAuthenticated && <Link to="/login">Вход</Link>}
        {!isAuthenticated && <Link to="/register">Регистрация</Link>}
        {isAuthenticated && <Link to="/settings">Настройки</Link>}
        {isAuthenticated && (
          <button onClick={logout} style={{ cursor: 'pointer' }}>Выйти</button>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Private>
              <Dashboard />
            </Private>
          }
        />
        <Route
          path="/settings"
          element={
            <Private>
              <Settings />
            </Private>
          }
        />
      </Routes>
    </div>
  );
}


