'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { message, Spin } from 'antd';

interface RouteGuardProps {
  moduleName: string;
  action?: string;
  children: React.ReactNode;
}

export default function RouteGuard({
  moduleName,
  action = 'READ',
  children,
}: RouteGuardProps) {
  const router = useRouter();
  const { user, canReadModule, canDoAction } = useAuthStore();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Nếu chưa có user (chờ Zustand load từ persist localStorage)
    if (!user) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('bizsocial-auth-storage') : null;
      if (!stored) {
        // Chưa đăng nhập, để DashboardLayout xử lý redirect /login
        return;
      }
      return;
    }

    // Kiểm tra quyền
    const hasPermission =
      action === 'READ'
        ? canReadModule(moduleName)
        : canDoAction(moduleName, action);

    if (!hasPermission) {
      setIsAllowed(false);
      message.error('Bạn không có quyền thao tác với chức năng này!');
      router.replace('/');
    } else {
      setIsAllowed(true);
    }
  }, [user, moduleName, action, router, canReadModule, canDoAction]);

  if (isAllowed === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (isAllowed === false) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <p>Đang chuyển hướng về Dashboard...</p>
      </div>
    );
  }

  return <>{children}</>;
}
