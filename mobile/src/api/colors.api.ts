import client from './client';
import type {Color} from '../types';

export const colorsApi = {
  list: async (): Promise<Color[]> => {
    const {data} = await client.get<Color[]>('/colors');
    return data;
  },

  create: async (nombre: string, hex: string): Promise<Color> => {
    const {data} = await client.post<Color>('/colors', {nombre, hex});
    return data;
  },

  update: async (id: string, nombre: string, hex: string): Promise<Color> => {
    const {data} = await client.put<Color>(`/colors/${id}`, {nombre, hex});
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/colors/${id}`);
  },
};
