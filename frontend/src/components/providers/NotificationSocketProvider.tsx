'use client';

import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { App } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotificationStore, NotificationItem } from '@/store/notificationStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const NotificationSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { notification } = App.useApp();

  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // Audio autoplay policy ignored
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) return;

    const socket: Socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[WebSocket] Real-time notification socket connected successfully');
    });

    socket.on('new_notification', (data: NotificationItem) => {
      console.log('[WebSocket] Real-time notification received:', data);

      // 1. Play crystal clear ERP chime sound
      playChimeSound();

      // 2. Prepend into Zustand Store & Increment unread badge
      useNotificationStore.setState((state) => ({
        notifications: [data, ...state.notifications.filter((n) => n.id !== data.id)],
      }));

      // 3. Display Toast Notification Pop-up at top right
      notification.info({
        message: (
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <BellOutlined className="text-indigo-600 animate-bounce text-base" />
            <span>{data.title}</span>
          </div>
        ),
        description: data.desc,
        placement: 'topRight',
        duration: 5,
        className: 'border border-indigo-100 dark:border-indigo-900 rounded-2xl shadow-xl',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
};
