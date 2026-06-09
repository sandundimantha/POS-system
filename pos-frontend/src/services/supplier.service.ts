import api from '@/lib/api';
import { Supplier } from '@/types';

export interface SupplierPayload {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get<Supplier[]>('/suppliers');
    return response.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  create: async (payload: SupplierPayload): Promise<Supplier> => {
    const response = await api.post<Supplier>('/suppliers', payload);
    return response.data;
  },

  update: async (id: number, payload: SupplierPayload): Promise<Supplier> => {
    const response = await api.put<Supplier>(`/suppliers/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
export default supplierService;
