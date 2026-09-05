import React from 'react';
import { App, Tooltip, Badge, Dropdown, Button } from 'antd';
import { MoonOutlined, SunOutlined, SearchOutlined, BellOutlined } from '@ant-design/icons';
import { UserDropdownContent } from './UserDropdownContent';
import { useThemeStore } from '@/store/themeStore';

interface HeaderActionsProps {
  user: any;
  userAvatarUrl: string;
  onOpenSearch: () => void;
  onLogout: () => void;
  variant?: 'desktop' | 'mobile';
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  user,
  userAvatarUrl,
  onOpenSearch,
  onLogout,
  variant = 'desktop',
}) => {
  const { message } = App.useApp();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleToggleTheme = () => {
    toggleTheme();
    message.success(isDarkMode ? 'Đã chuyển sang Chế độ Sáng (Light Mode)' : 'Đã chuyển sang Chế độ Tối (Dark Mode)');
  };

  const dropdownMenu = (
    <UserDropdownContent
      user={user}
      userAvatarUrl={userAvatarUrl}
      onLogout={onLogout}
    />
  );

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-2">
        {/* Nút Toggle Theme */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="w-9 h-9 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-amber-400 hover:text-slate-900 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="Chuyển chế độ giao diện"
        >
          {isDarkMode ? <SunOutlined className="text-sm text-amber-400" /> : <MoonOutlined className="text-sm" />}
        </button>

        {/* Nút Search */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-9 h-9 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="Tìm kiếm"
        >
          <SearchOutlined className="text-sm" />
        </button>

        {/* Nút Thông báo */}
        <Badge dot offset={[-2, 4]} color="#ef4444">
          <button
            type="button"
            onClick={() => message.info('Bạn có 3 thông báo mới')}
            className="w-9 h-9 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 active:scale-95 transition-all shadow-2xs cursor-pointer"
            aria-label="Thông báo"
          >
            <BellOutlined className="text-sm" />
          </button>
        </Badge>

        {/* Avatar người dùng */}
        <Dropdown popupRender={() => dropdownMenu} placement="bottomRight" trigger={['click']}>
          <div className="w-9 h-9 rounded-full border-2 border-emerald-600/40 p-0.5 bg-white dark:bg-slate-900 cursor-pointer active:scale-95 transition-transform shrink-0">
            <img
              src={userAvatarUrl}
              alt={user?.name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </Dropdown>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Nút Chế độ tối */}
      <Tooltip title={isDarkMode ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}>
        <Button
          type="text"
          shape="circle"
          icon={isDarkMode ? <SunOutlined className="text-amber-400 text-base" /> : <MoonOutlined className="text-slate-600 text-base" />}
          onClick={handleToggleTheme}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 w-9 h-9 flex items-center justify-center cursor-pointer transition-colors"
        />
      </Tooltip>

      {/* Nút Tìm kiếm */}
      <Tooltip title="Tìm kiếm nhanh">
        <Button
          type="text"
          shape="circle"
          icon={<SearchOutlined className="text-slate-600 dark:text-slate-300" />}
          onClick={onOpenSearch}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 w-9 h-9 flex items-center justify-center cursor-pointer"
        />
      </Tooltip>

      {/* Nút Thông báo với Badge dot đỏ */}
      <Tooltip title="Thông báo">
        <Badge dot offset={[-3, 4]} color="#ef4444">
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined className="text-slate-600 dark:text-slate-300 text-base" />}
            onClick={() => message.info('Bạn có 3 thông báo mới')}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 w-9 h-9 flex items-center justify-center cursor-pointer"
          />
        </Badge>
      </Tooltip>

      {/* Avatar người dùng */}
      <Dropdown popupRender={() => dropdownMenu} placement="bottomRight" trigger={['click']}>
        <div className="w-9 h-9 rounded-full border-2 border-emerald-500/60 hover:border-emerald-600 p-0.5 bg-white dark:bg-slate-900 cursor-pointer ml-1 active:scale-95 transition-all shrink-0 hover:shadow-xs hover:ring-2 hover:ring-emerald-500/20">
          <img
            src={userAvatarUrl}
            alt={user?.name || 'User'}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </Dropdown>
    </div>
  );
};
