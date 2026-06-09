import api from '@/lib/api';
import { UserRole } from '@/types';

export interface UserManagementRecord {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  getAll: async (): Promise<UserManagementRecord[]> => {
    const response = await api.get<UserManagementRecord[]>('/users');
    return response.data;
  },

  toggleActive: async (id: number): Promise<UserManagementRecord> => {
    const response = await api.put<UserManagementRecord>(`/users/${id}/toggle-active`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
export default userService;
