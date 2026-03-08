import client from './client';
import type {Category} from '../types';

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const {data} = await client.get<Category[]>('/categories');
    return data;
  },

  create: async (nombre: string): Promise<Category> => {
    const {data} = await client.post<Category>('/categories', {nombre});
    return data;
  },

  update: async (id: string, nombre: string): Promise<Category> => {
    const {data} = await client.put<Category>(`/categories/${id}`, {nombre});
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/categories/${id}`);
  },
};
