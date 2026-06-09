import api from '@/lib/api';
import { Order, PaymentMode } from '@/types';

export interface CartItemPayload {
  productId: number;
  quantity: number;
}

export interface CheckoutPayload {
  items: CartItemPayload[];
  paymentMode: PaymentMode;
  customerId?: number;
  discount: number;
}

export const orderService = {
  checkout: async (payload: CheckoutPayload): Promise<Order> => {
    const response = await api.post<Order>('/orders/checkout', payload);
    return response.data;
  },

  getAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  getByInvoice: async (invoiceNumber: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/invoice/${invoiceNumber}`);
    return response.data;
  },

  getByDateRange: async (from: string, to: string): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/range', {
      params: { from, to },
    });
    return response.data;
  },
};
export default orderService;
