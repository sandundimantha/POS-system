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

const mapBackendRoleToFrontend = (role: string): UserRole => {
  if (role && role.startsWith('ROLE_')) {
    return role.substring(5) as UserRole;
  }
  return role as UserRole;
};

export const userService = {
  getAll: async (): Promise<UserManagementRecord[]> => {
    const response = await api.get<any[]>('/users');
    return response.data.map((user) => ({
      ...user,
      role: mapBackendRoleToFrontend(user.role),
    }));
  },

  toggleActive: async (id: number): Promise<UserManagementRecord> => {
    const response = await api.put<any>(`/users/${id}/toggle-active`);
    const data = response.data;
    return {
      ...data,
      role: mapBackendRoleToFrontend(data.role),
    };
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
export default userService;
