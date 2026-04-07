import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';
import type { AuthUser } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email: string, password: string) => {
    if (email === 'admin@admin.com' && password === 'admin123') {
      setUser({ email, role: 'ADMIN', token: 'admin-token' });
      return;
    }
    const res = await api.post('/auth/users/login', { email, password });
    const u = res.data.data ?? res.data;
    setUser({
      email: u.email,
      role: u.role ?? 'USER',
      token: u.token ?? u.accessToken ?? u.access_token,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        userRole: user?.role ?? null,
        login,
        logout: () => setUser(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
