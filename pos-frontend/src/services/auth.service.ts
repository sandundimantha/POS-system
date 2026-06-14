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

const mapBackendRoleToFrontend = (role: string): UserRole => {
  if (role && role.startsWith('ROLE_')) {
    return role.substring(5) as UserRole;
  }
  return role as UserRole;
};

const mapFrontendRoleToBackend = (role: UserRole): string => {
  return `ROLE_${role}`;
};

export const authService = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/login', params);
    const data = response.data;
    return {
      ...data,
      role: mapBackendRoleToFrontend(data.role),
    };
  },

  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/register', {
      ...params,
      role: mapFrontendRoleToBackend(params.role),
    });
    const data = response.data;
    return {
      ...data,
      role: mapBackendRoleToFrontend(data.role),
    };
  },
};
export default authService;
