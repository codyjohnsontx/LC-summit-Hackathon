import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextValue {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('userId');
    }
    return null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userId) {
      window.localStorage.setItem('userId', userId);
    } else {
      window.localStorage.removeItem('userId');
    }
  }, [userId]);

  return (
    <AuthContext.Provider value={{ userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
