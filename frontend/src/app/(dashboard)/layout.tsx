"use client";

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Dropdown, Avatar, Button, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  LayoutOutlined,
  DropboxOutlined,
  TagOutlined,
  ShoppingCartOutlined,
  MoonOutlined,
  SearchOutlined,
  TranslationOutlined,
  BellOutlined,
  MessageOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const menuItems = [
    {
      key: 'main-group',
      label: <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Main</span>,
      type: 'group' as const,
      children: [
        {
          key: 'dashboard-sub',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
          children: [
            { key: '/', label: 'HRM Dashboard' },
            { key: '/inventory', label: 'Inventory Dashboard' },
            { key: '/crm', label: 'CRM Dashboard' },
          ]
        },
        {
          key: '/users',
          icon: <UserOutlined />,
          label: 'Quản lý User',
        },
        {
          key: '/roles',
          icon: <SafetyCertificateOutlined />,
          label: 'Ma trận Phân quyền',
        },
        {
          key: '/organization',
          icon: <TeamOutlined />,
          label: 'Cơ cấu Tổ chức',
        },
      ]
    },
    {
      key: 'inventory-group',
      label: <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mt-4 inline-block">Inventory</span>,
      type: 'group' as const,
      children: [
        { key: '/products', icon: <DropboxOutlined />, label: 'Products' },
        { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
        { key: '/brands', icon: <TagOutlined />, label: 'Brands' },
        { key: '/units', icon: <ShoppingCartOutlined />, label: 'Units' },
      ]
    }
  ];

  const userMenu = {
    items: [
      {
        key: '1',
        label: <Text strong>{user?.name || 'Admin'}</Text>,
        disabled: true,
      },
      { type: 'divider' as const },
      {
        key: '2',
        label: 'Đăng xuất',
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f1f5f9', padding: '16px', gap: '16px', flexDirection: 'row' }}>
      <Sider 
        width={260} 
        theme="light" 
        className="hidden md:block shadow-sm z-20"
        style={{ 
          overflow: 'auto', 
          height: 'calc(100vh - 32px)', 
          position: 'sticky', 
          top: '16px', 
          borderRadius: '16px',
          background: 'white'
        }}
      >
        <div className="flex h-16 items-center px-6 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <Text strong className="text-xl tracking-tight text-gray-800">
              BizSocial ERP
            </Text>
          </div>
        </div>
        <Menu
          mode="inline"
          defaultOpenKeys={['dashboard-sub']}
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          className="border-r-0 pt-4 custom-sidebar-menu px-3"
        />
      </Sider>

      <Layout style={{ background: 'transparent', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minWidth: 0 }}>
        <Header 
          className="flex justify-between items-center px-6 shadow-sm z-10 sticky top-4"
          style={{ 
            background: '#ffffff',
            height: '64px', 
            borderRadius: '16px',
            lineHeight: '64px',
            padding: '0 24px'
          }}
        >
          <div className="flex items-center">
            <Button 
              className="flex items-center gap-2 border-gray-200 text-gray-600 rounded-full px-4 font-medium h-9"
            >
              <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-white text-xs">F</div>
              Falcon LLP
              <span className="text-gray-400 text-xs">•••</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button type="text" shape="circle" icon={<MoonOutlined className="text-gray-500" />} />
            <Button type="text" shape="circle" icon={<SearchOutlined className="text-gray-500" />} />
            <Badge dot color="red" offset={[-4, 4]}>
              <Button type="text" shape="circle" icon={<BellOutlined className="text-gray-500" />} />
            </Badge>
            <Button type="text" shape="circle" icon={<MessageOutlined className="text-gray-500" />} />
            
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
                className="cursor-pointer border border-gray-200 ml-2" 
                size="default"
              />
            </Dropdown>
          </div>
        </Header>

        <Content className="overflow-auto py-2" style={{ minHeight: 'calc(100vh - 112px)' }}>
          {children}
        </Content>
      </Layout>

      <style jsx global>{`
        .custom-sidebar-menu.ant-menu-light .ant-menu-item-selected {
          background-color: #f0f7ff;
          color: #1677ff;
          font-weight: 600;
          border-radius: 8px;
        }
        .custom-sidebar-menu.ant-menu-light .ant-menu-item {
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .custom-sidebar-menu .ant-menu-submenu-title {
          border-radius: 8px;
        }
        .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          background-color: #1e293b !important;
          color: white !important;
        }
        .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title i,
        .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title svg {
          color: white !important;
        }
        .custom-sidebar-menu .ant-menu-submenu-title:hover {
          color: #1677ff !important;
        }
      `}</style>
    </Layout>
  );
}
