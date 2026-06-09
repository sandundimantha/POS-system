import api from '@/lib/api';
import { Customer } from '@/types';

export interface CustomerPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/customers');
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  search: async (query: string): Promise<Customer[]> => {
    const response = await api.get<Customer[]>(`/customers/search`, {
      params: { query },
    });
    return response.data;
  },

  create: async (payload: CustomerPayload): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', payload);
    return response.data;
  },

  update: async (id: number, payload: CustomerPayload): Promise<Customer> => {
    const response = await api.put<Customer>(`/customers/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
export default customerService;
