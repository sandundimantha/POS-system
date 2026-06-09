import api from '@/lib/api';
import { Product } from '@/types';

export interface ProductPayload {
  name: string;
  description?: string;
  sku: string;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  categoryId: number;
  supplierId?: number;
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getBySku: async (sku: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/sku/${sku}`);
    return response.data;
  },

  search: async (query: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/search`, {
      params: { query },
    });
    return response.data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/low-stock');
    return response.data;
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const response = await api.post<Product>('/products', payload);
    return response.data;
  },

  update: async (id: number, payload: ProductPayload): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  uploadImage: async (id: number, file: File): Promise<Product> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<Product>(`/products/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
export default productService;
