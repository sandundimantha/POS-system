import api from '@/lib/api';
import { AuthResponse, UserRole } from '@/types';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export const authService = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', params);
    return response.data;
  },

  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', params);
    return response.data;
  },
};
export default authService;
