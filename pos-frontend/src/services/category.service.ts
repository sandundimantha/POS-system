import api from '@/lib/api';
import { Category } from '@/types';

export interface CategoryPayload {
  name: string;
  description?: string;
}

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (payload: CategoryPayload): Promise<Category> => {
    const response = await api.post<Category>('/categories', payload);
    return response.data;
  },

  update: async (id: number, payload: CategoryPayload): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
export default categoryService;
