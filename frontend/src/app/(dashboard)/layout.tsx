"use client";

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Spin, Drawer, Button, App } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  DropboxOutlined,
  TagOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { AppLogo } from '@/components/layout/AppLogo';
import { HeaderActions } from '@/components/layout/HeaderActions';
import { QuickSearchModal } from '@/components/layout/QuickSearchModal';
import { NotificationSocketProvider } from '@/components/providers/NotificationSocketProvider';

import { isTokenExpired, handleLogoutAndRedirect } from '@/lib/axios';

const { Header, Sider, Content } = Layout;

// Ánh xạ giữa Route URL và tên Module nghiệp vụ tương ứng
const ROUTE_MODULE_MAP: Record<string, string> = {
  '/users': 'User',
  '/roles': 'Role',
  '/organization': 'Department',
  '/crm': 'CRM',
  '/social': 'Social',
  '/recruiting': 'Recruiting',
  '/training': 'Training',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { message } = App.useApp();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, canReadModule } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Phục hồi session tức thì từ localStorage khi F5 / Refresh trang
  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user');
        const storedPerms = localStorage.getItem('permissions');

        if ((token || refreshToken) && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const parsedPerms = storedPerms ? JSON.parse(storedPerms) : [];
          useAuthStore.getState().login(parsedUser, parsedPerms, token || '', refreshToken || undefined);
        }
      } catch (e) {
        console.error('Lỗi phục hồi session:', e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

    if (!user && !token && !refreshToken) {
      router.push('/login');
      return;
    }

    // Nếu cả 2 token (access & refresh) đều hết hạn -> Tự động Đăng xuất & chuyển về /login
    if (isTokenExpired(token) && isTokenExpired(refreshToken)) {
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
      handleLogoutAndRedirect();
      return;
    }

    if (user) {
      const requiredModule = ROUTE_MODULE_MAP[pathname];
      if (requiredModule && !canReadModule(requiredModule)) {
        message.error('Bạn không có quyền thao tác với chức năng này!');
        router.replace('/');
      }
    }
  }, [user, mounted, pathname, router, canReadModule]);

  if (!mounted || (!user && typeof window !== 'undefined' && !!localStorage.getItem('access_token'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const requiredModule = ROUTE_MODULE_MAP[pathname];
  const isUnauthorized = requiredModule && !canReadModule(requiredModule);
  if (isUnauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-3">
        <Spin size="large" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bạn không có quyền thao tác với chức năng này. Đang chuyển về Dashboard...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  // Xử lý điều hướng menu thống nhất giữa Sidebar và Drawer (Offcanvas)
  const handleMenuNavigate = (key: string) => {
    if (key.startsWith('/')) {
      router.push(key);
    } else {
      message.info(`Menu mẫu: ${key} (Sẵn sàng gắn route khi lên plan)`);
    }
  };

  // Menu Sidebar (Dùng chung 100% cho cả Desktop Sider và Mobile Offcanvas)
  const filteredMenuItems = [
    {
      key: 'main-group',
      label: 'MAIN',
      type: 'group' as const,
      children: [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
        },
        canReadModule('User')
          ? {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Quản lý User',
          }
          : null,
        canReadModule('Role')
          ? {
            key: '/roles',
            icon: <SafetyCertificateOutlined />,
            label: 'Quản lý Phân quyền',
          }
          : null,
        canReadModule('Department')
          ? {
            key: '/organization',
            icon: <TeamOutlined />,
            label: 'Cơ cấu Tổ chức',
          }
          : null,
      ].filter(Boolean),
    },
    {
      key: 'inventory-group',
      label: 'INVENTORY',
      type: 'group' as const,
      children: [
        { key: '/products', icon: <DropboxOutlined />, label: 'Products' },
        { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
        { key: '/brands', icon: <TagOutlined />, label: 'Brands' },
        { key: '/units', icon: <ShoppingCartOutlined />, label: 'Units' },
      ],
    },
  ];

  // Avatar ảnh người dùng chuẩn mẫu
  const userAvatarUrl = user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col md:flex-row md:p-4 md:gap-4 transition-colors duration-200">
      {/* =======================================================================
          MOBILE HEADER
          ======================================================================= */}
      <header className="md:hidden flex items-center justify-between px-4 h-15 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 shadow-2xs">
        {/* Bên trái: Logo + Nút Hamburger */}
        <div className="flex items-center gap-3">
          <AppLogo size="sm" showText={false} onClick={() => router.push('/')} />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all shadow-2xs cursor-pointer"
            aria-label="Mở menu điều hướng"
          >
            <MenuOutlined className="text-sm font-bold text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        {/* Bên phải: Group nút tác vụ Header */}
        <HeaderActions
          user={user}
          userAvatarUrl={userAvatarUrl}
          onOpenSearch={() => setSearchModalOpen(true)}
          onLogout={handleLogout}
          variant="mobile"
        />
      </header>

      {/* =======================================================================
          MOBILE DRAWER SIDEBAR
          ======================================================================= */}
      <Drawer
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        closable={false}
        styles={{
          wrapper: { width: '260px', maxWidth: '80vw' },
          body: { padding: 0 },
          section: { borderRadius: '0 16px 16px 0' }
        }}
      >
        {/* Header của Drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <AppLogo size="sm" showText={true} />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>

        {/* Danh sách Menu */}
        <div className="p-3 overflow-y-auto max-h-[calc(100vh-65px)] bg-white dark:bg-slate-900 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={filteredMenuItems as any}
            onClick={({ key }) => {
              handleMenuNavigate(key);
              setMobileMenuOpen(false);
            }}
            className="border-r-0 custom-sidebar-menu"
          />
        </div>
      </Drawer>

      {/* =======================================================================
          MODAL TÌM KIẾM NHANH
          ======================================================================= */}
      <QuickSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
      />

      {/* =======================================================================
          DESKTOP SIDEBAR
          ======================================================================= */}
      <Sider
        width={260}
        className="hidden md:block shadow-sm z-20 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800"
        style={{
          overflow: 'auto',
          height: 'calc(100vh - 32px)',
          position: 'sticky',
          top: '16px',
          borderRadius: '16px',
          background: 'transparent',
        }}
      >
        <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <AppLogo size="md" showText={true} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={filteredMenuItems as any}
          onClick={({ key }) => handleMenuNavigate(key)}
          className="border-r-0 pt-3 custom-sidebar-menu px-3 bg-transparent"
        />
      </Sider>

      {/* =======================================================================
          MAIN CONTENT AREA
          ======================================================================= */}
      <div className="flex-1 flex flex-col gap-3 md:gap-4 min-w-0">
        {/* Desktop Header Wrapper (Bỏ pt-4 dư thừa để đỉnh Header ngang bằng với Sidebar) */}
        <div className="hidden md:block sticky top-0 z-30 pb-2 bg-[#f8fafc] dark:bg-slate-950">
          <Header
            className="flex justify-between items-center px-6 shadow-2xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
            style={{
              height: '60px',
              borderRadius: '16px',
              padding: '0 20px',
              lineHeight: 'normal'
            }}
          >
            <div className="flex items-center">
              <Button
                className="flex items-center gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-full px-3.5 font-medium h-9 bg-slate-50/60 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">B</div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">BizSocial Corp</span>
                <span className="text-slate-400 text-xs font-mono">•••</span>
              </Button>
            </div>

            {/* Bên phải: Group nút tác vụ Header */}
            <HeaderActions
              user={user}
              userAvatarUrl={userAvatarUrl}
              onOpenSearch={() => setSearchModalOpen(true)}
              onLogout={handleLogout}
              variant="desktop"
            />
          </Header>
        </div>

        {/* Nội dung trang */}
        <Content className="overflow-y-auto overflow-x-hidden p-3 md:p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ minHeight: 'calc(100vh - 112px)' }}>
          <NotificationSocketProvider>
            {children}
          </NotificationSocketProvider>
        </Content>
      </div>

      <style jsx global>{`
        /* Sidebar Outer Container Background Reset */
        .ant-layout-sider {
          background: transparent !important;
        }

        /* Menu Base Background Reset */
        .custom-sidebar-menu {
          background: transparent !important;
          border-right: none !important;
        }

        /* Menu Category Titles (MAIN, INVENTORY) */
        .custom-sidebar-menu .ant-menu-item-group-title {
          color: #94a3b8 !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
          padding-left: 8px !important;
          margin-top: 14px !important;
          margin-bottom: 6px !important;
        }
        .dark .custom-sidebar-menu .ant-menu-item-group-title {
          color: #64748b !important;
        }

        /* Regular Unselected Menu Items */
        .custom-sidebar-menu .ant-menu-item {
          border-radius: 12px !important;
          margin-bottom: 4px !important;
          color: #475569 !important;
          font-weight: 600 !important;
          transition: all 0.15s ease !important;
        }
        .dark .custom-sidebar-menu .ant-menu-item {
          color: #cbd5e1 !important;
        }

        /* Hover Menu Items */
        .custom-sidebar-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .dark .custom-sidebar-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
          background-color: #1e293b !important;
          color: #ffffff !important;
        }

        /* Selected Menu Item - Light Mode */
        .custom-sidebar-menu .ant-menu-item-selected {
          background-color: #1e293b !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12) !important;
        }
        .custom-sidebar-menu .ant-menu-item-selected .ant-menu-title-content,
        .custom-sidebar-menu .ant-menu-item-selected .anticon {
          color: #ffffff !important;
        }

        /* Selected Menu Item - Dark Mode */
        .dark .custom-sidebar-menu .ant-menu-item-selected {
          background-color: #4f46e5 !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4) !important;
        }
        .dark .custom-sidebar-menu .ant-menu-item-selected .ant-menu-title-content,
        .dark .custom-sidebar-menu .ant-menu-item-selected .anticon {
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
