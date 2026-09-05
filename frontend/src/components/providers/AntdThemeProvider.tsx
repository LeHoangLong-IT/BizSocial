"use client";

import React, { useEffect } from 'react';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import { useThemeStore } from '@/store/themeStore';

export const AntdThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    // Đồng bộ class .dark trên html element khi mount
    const saved = localStorage.getItem('bizsocial-theme-storage');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.state?.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error('Lỗi đọc theme store:', e);
      }
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};
