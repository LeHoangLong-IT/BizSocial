import { create } from 'zustand';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'approval' | 'crm' | 'badge' | 'system' | 'meeting';
}

interface NotificationState {
  notifications: NotificationItem[];
  activeTab: 'unread' | 'read';
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  setActiveTab: (tab: 'unread' | 'read') => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id' | 'time' | 'read'>) => Promise<void>;
}

const getAuthHeader = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  activeTab: 'unread',
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_BASE}/notifications`, {
        headers: getAuthHeader(),
      });
      if (Array.isArray(res.data)) {
        set({ notifications: res.data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      set({ loading: false });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  markAsRead: async (id: string) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      ),
    }));

    try {
      await axios.patch(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: getAuthHeader(),
      });
    } catch (err) {
      console.error('Failed to toggle notification read status:', err);
      // Revert on error
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));

    try {
      await axios.post(`${API_BASE}/notifications/read-all`, {}, {
        headers: getAuthHeader(),
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      get().fetchNotifications();
    }
  },

  addNotification: async (item) => {
    try {
      const res = await axios.post(`${API_BASE}/notifications`, item, {
        headers: getAuthHeader(),
      });
      if (res.data) {
        set((state) => ({
          notifications: [res.data, ...state.notifications],
        }));
      }
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  },
}));
