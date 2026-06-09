import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Helper to load initial state safely in SSR environment
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pos_token');
      const userStr = localStorage.getItem('pos_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          return { token, user, isAuthenticated: true };
        } catch {
          // Clear corrupt data
          localStorage.removeItem('pos_token');
          localStorage.removeItem('pos_user');
        }
      }
    }
    return { token: null, user: null, isAuthenticated: false };
  };

  return {
    ...getInitialState(),
    setAuth: (token, user) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pos_token', token);
        localStorage.setItem('pos_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pos_token');
        localStorage.removeItem('pos_user');
      }
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
