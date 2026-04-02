import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VoterPublic } from '@voting-chain/types';

interface AuthState {
  token: string | null;
  voter: VoterPublic | null;
  isAuthenticated: boolean;
  setAuth: (token: string, voter: VoterPublic) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      voter: null,
      isAuthenticated: false,
      setAuth: (token, voter) => {
        localStorage.setItem('auth_token', token);
        set({ token, voter, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, voter: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Made with Bob
