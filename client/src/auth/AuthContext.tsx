import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../lib/api';

type User = { id: string; email: string; avatar: string | null } | null;

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  updateProfile: (data: { email?: string; avatar?: string | null }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Простая загрузка профиля
      fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.json())))
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.token);
  };

  const register = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Register failed');
    const data = await res.json();
    setToken(data.token);
  };

  const logout = () => setToken(null);

  const updateProfile = async (data: { email?: string; avatar?: string | null }) => {
    if (!token) throw new Error('not authenticated');
    const res = await fetch(`${API_BASE}/api/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
    const json = await res.json();
    if (json.token) setToken(json.token);
    // перезагрузить профиль
    const me = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (me.ok) setUser(await me.json());
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (!token) throw new Error('not authenticated');
    const res = await fetch(`${API_BASE}/api/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Change password failed');
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!token, login, register, updateProfile, changePassword, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


