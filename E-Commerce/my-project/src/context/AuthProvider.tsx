import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';
import type { AuthUser } from '../types';

function parseStoredUser(): AuthUser | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<AuthUser> & {
      user?: Partial<AuthUser>;
      data?: { user?: Partial<AuthUser>; token?: string };
      token?: string;
    };

    const nestedUser = parsed.user ?? parsed.data?.user;
    const token = parsed.token ?? parsed.data?.token ?? nestedUser?.token;
    const email = parsed.email ?? nestedUser?.email;
    const role = parsed.role ?? nestedUser?.role;

    if (!email || !role) return null;

    return {
      id: parsed.id ?? nestedUser?.id,
      email,
      role,
      token,
      name: parsed.name ?? nestedUser?.name,
    };
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return parseStoredUser();
  });

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/users/login', { email, password });
    const payload = res.data?.data ?? res.data;
    const apiUser = payload?.user ?? payload;
    const normalizedUser: AuthUser = {
      id: apiUser?.id,
      email: apiUser?.email ?? email,
      role: apiUser?.role ?? 'USER',
      token: payload?.token ?? apiUser?.token ?? apiUser?.accessToken ?? apiUser?.access_token,
      name: apiUser?.name,
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
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
