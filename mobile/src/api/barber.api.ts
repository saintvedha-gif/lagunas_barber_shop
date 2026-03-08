import client from './client';
import type {BarberService} from '../types';

export const barberApi = {
  list: async (): Promise<BarberService[]> => {
    const {data} = await client.get<BarberService[]>('/barber');
    return data;
  },

  create: async (form: FormData): Promise<BarberService> => {
    const {data} = await client.post<BarberService>('/barber', form, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return data;
  },

  update: async (id: string, form: FormData): Promise<BarberService> => {
    const {data} = await client.put<BarberService>(`/barber/${id}`, form, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/barber/${id}`);
  },
};
