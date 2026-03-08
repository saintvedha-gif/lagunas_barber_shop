import client from './client';
import type {LoginResponse} from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const {data} = await client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  changePassword: async (
    actual: string,
    nueva: string,
  ): Promise<{message: string}> => {
    const {data} = await client.post('/auth/change-password', {
      passwordActual: actual,
      passwordNuevo: nueva,
    });
    return data;
  },
};
