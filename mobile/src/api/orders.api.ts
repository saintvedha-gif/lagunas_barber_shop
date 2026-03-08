import client from './client';
import type {Order, OrderStatus} from '../types';

export const ordersApi = {
  list: async (): Promise<Order[]> => {
    const {data} = await client.get<Order[]>('/orders');
    return data;
  },

  get: async (id: string): Promise<Order> => {
    const {data} = await client.get<Order>(`/orders/${id}`);
    return data;
  },

  updateStatus: async (id: string, estado: OrderStatus): Promise<Order> => {
    const {data} = await client.patch<Order>(`/orders/${id}`, {estado});
    return data;
  },
};
