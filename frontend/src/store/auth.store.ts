import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isAuthenticated, getStoredUser, hasRole, hasAnyRole } from '@/queries';
import type { User } from '@/types';

interface AuthState { 
    user: User | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    setUser: (user: User | null) => void;
    updateAuthState: () => void;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,

            // Actions
            setUser: (user) => {
                const newState = { 
                    user, 
                    isAuthenticated: !!user 
                };
                set(newState);
            },

            updateAuthState: () => {
                const authenticated = isAuthenticated();
                const user = authenticated ? getStoredUser() : null;
                set({ user, isAuthenticated: authenticated });
            },

            hasRole: (role) => {
                const { user } = get();
                return hasRole(role, user || undefined);
            },

            hasAnyRole: (roles) => {
                const { user } = get();
                return hasAnyRole(roles, user || undefined);
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

interface DashboardState {
    filters: string[];
}

interface DashboardActions {
    addFilter: (filter: string) => void;
    removeFilter: (filter: string) => void;
    clearFilters: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>((set) => ({
    filters: [],
    addFilter: (filter) => set((state) => ({ filters: [...state.filters, filter] })),
    removeFilter: (filter) => set((state) => ({ filters: state.filters.filter((f) => f !== filter) })),
    clearFilters: () => set({ filters: [] }),
}));

// Initialize auth state on app start
useAuthStore.getState().updateAuthState(); 
