import { create } from 'zustand';
import type { Notification } from '@/types';

interface UIState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'> & { id?: string; timestamp?: Date }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = notification.id || Math.random().toString(36).substr(2, 9);
    const timestamp = notification.timestamp || new Date();
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id, timestamp },
      ],
    }));
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));