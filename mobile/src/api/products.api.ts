import client from './client';
import type {Product} from '../types';

export const productsApi = {
  list: async (): Promise<Product[]> => {
    const {data} = await client.get<Product[]>('/products');
    return data;
  },

  get: async (id: string): Promise<Product> => {
    const {data} = await client.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (form: FormData): Promise<Product> => {
    const {data} = await client.post<Product>('/products', form, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return data;
  },

  update: async (id: string, form: FormData): Promise<Product> => {
    const {data} = await client.put<Product>(`/products/${id}`, form, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/products/${id}`);
  },
};
