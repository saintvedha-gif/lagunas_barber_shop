import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi} from '../api/auth.api';
import type {Admin} from '../types';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Acciones
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  admin: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const adminStr = await AsyncStorage.getItem('auth_admin');
      if (token && adminStr) {
        set({token, admin: JSON.parse(adminStr), isInitialized: true});
      } else {
        set({isInitialized: true});
      }
    } catch {
      set({isInitialized: true});
    }
  },

  login: async (email, password) => {
    set({isLoading: true});
    try {
      const response = await authApi.login(email, password);
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('auth_admin', JSON.stringify(response.admin));
      set({token: response.token, admin: response.admin, isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_admin');
    set({token: null, admin: null});
  },
}));
