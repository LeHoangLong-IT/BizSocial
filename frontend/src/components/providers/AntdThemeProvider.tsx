"use client";

import React, { useEffect } from 'react';
import { ConfigProvider, App as AntdApp, theme } from 'antd';
import { useThemeStore } from '@/store/themeStore';
import '@/lib/axios';

export const AntdThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDarkMode
          ? {
              colorPrimary: '#6366f1',
              colorBgContainer: '#1e293b',
              colorBgElevated: '#0f172a',
              colorBgLayout: '#090d16',
              colorBorder: '#334155',
              colorBorderSecondary: '#1e293b',
              colorText: '#f8fafc',
              colorTextHeading: '#ffffff',
              colorTextSecondary: '#94a3b8',
              colorTextPlaceholder: '#64748b',
              borderRadius: 8,
              fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
            }
          : {
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
