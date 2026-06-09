import api from '@/lib/api';
import { DailySalesReport, TopProductReport } from '@/types';

export const reportService = {
  getDailySales: async (date?: string): Promise<DailySalesReport> => {
    const response = await api.get<DailySalesReport>('/reports/daily', {
      params: date ? { date } : {},
    });
    return response.data;
  },

  getMonthlyRevenue: async (year: number, month: number): Promise<number> => {
    const response = await api.get<number>('/reports/monthly', {
      params: { year, month },
    });
    return response.data;
  },

  getTopProducts: async (from: string, to: string, limit = 10): Promise<TopProductReport[]> => {
    const response = await api.get<TopProductReport[]>('/reports/top-products', {
      params: { from, to, limit },
    });
    return response.data;
  },
};
export default reportService;
