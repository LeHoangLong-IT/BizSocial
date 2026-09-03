import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  name: string;
  roleId: number;
  roleName?: string;
  departmentId?: number;
  teamId?: number;
}

export interface Permission {
  moduleId: number;
  moduleName?: string;
  action: string;
}

interface AuthState {
  user: User | null;
  permissions: Permission[];
  token: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  login: (user: User, permissions: Permission[], token: string) => void;
  logout: () => void;
  canReadModule: (moduleName: string) => boolean;
  canDoAction: (moduleName: string, action: string) => boolean;
  hasPermission: (moduleId: number, action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      token: null,
      _hasHydrated: false,
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      login: (user, permissions, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('permissions', JSON.stringify(permissions));
        }
        set({ user, permissions, token, _hasHydrated: true });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
          localStorage.removeItem('bizsocial-auth-storage');
        }
        set({ user: null, permissions: [], token: null, _hasHydrated: true });
      },
      canReadModule: (moduleName: string) => {
        const { user, permissions } = get();
        if (!user) return false;
        // Super Admin và Manager có toàn quyền xem tất cả modules
        if (user.roleName === 'Super Admin' || user.roleName === 'Manager') {
          return true;
        }
        return permissions.some(
          (p) =>
            p.moduleName?.toLowerCase() === moduleName.toLowerCase() &&
            p.action.toUpperCase() === 'READ'
        );
      },
      canDoAction: (moduleName: string, action: string) => {
        const { user, permissions } = get();
        if (!user) return false;
        if (user.roleName === 'Super Admin') return true;
        return permissions.some(
          (p) =>
            p.moduleName?.toLowerCase() === moduleName.toLowerCase() &&
            p.action.toUpperCase() === action.toUpperCase()
        );
      },
      hasPermission: (moduleId: number, action: string) => {
        const { user, permissions } = get();
        if (!user) return false;
        if (user.roleName === 'Super Admin') return true;
        return permissions.some(
          (p) => p.moduleId === moduleId && p.action.toUpperCase() === action.toUpperCase()
        );
      },
    }),
    {
      name: 'bizsocial-auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as any))),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
