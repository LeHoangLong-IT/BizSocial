import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
  roleId: number;
  departmentId?: number;
  teamId?: number;
}

interface Permission {
  moduleId: number;
  action: string;
}

interface AuthState {
  user: User | null;
  permissions: Permission[];
  token: string | null;
  login: (user: User, permissions: Permission[], token: string) => void;
  logout: () => void;
  hasPermission: (moduleId: number, action: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  token: null,
  login: (user, permissions, token) => set({ user, permissions, token }),
  logout: () => set({ user: null, permissions: [], token: null }),
  hasPermission: (moduleId, action) => {
    const { permissions } = get();
    return permissions.some(
      (p) => p.moduleId === moduleId && p.action === action
    );
  },
}));
