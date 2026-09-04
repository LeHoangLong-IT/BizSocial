import React from 'react';
import { App, Tooltip, Badge, Dropdown, Button } from 'antd';
import { MoonOutlined, SearchOutlined, BellOutlined } from '@ant-design/icons';
import { UserDropdownContent } from './UserDropdownContent';

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
        {/* Nút Moon */}
        <button
          type="button"
          onClick={() => message.info('Chế độ Tối (Dark mode) đang được phát triển!')}
          className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="Chuyển chế độ tối"
        >
          <MoonOutlined className="text-sm" />
        </button>

        {/* Nút Search */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
          aria-label="Tìm kiếm"
        >
          <SearchOutlined className="text-sm" />
        </button>

        {/* Nút Thông báo */}
        <Badge dot offset={[-2, 4]} color="#ef4444">
          <button
            type="button"
            onClick={() => message.info('Bạn có 3 thông báo mới')}
            className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
            aria-label="Thông báo"
          >
            <BellOutlined className="text-sm" />
          </button>
        </Badge>

        {/* Avatar người dùng */}
        <Dropdown popupRender={() => dropdownMenu} placement="bottomRight" trigger={['click']}>
          <div className="w-9 h-9 rounded-full border-2 border-emerald-600/40 p-0.5 bg-white cursor-pointer active:scale-95 transition-transform shrink-0">
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
      <Tooltip title="Chế độ Tối">
        <Button
          type="text"
          shape="circle"
          icon={<MoonOutlined className="text-slate-600" />}
          onClick={() => message.info('Chế độ Tối (Dark mode) đang được phát triển!')}
          className="hover:bg-slate-100 w-9 h-9 flex items-center justify-center cursor-pointer"
        />
      </Tooltip>

      {/* Nút Tìm kiếm */}
      <Tooltip title="Tìm kiếm nhanh">
        <Button
          type="text"
          shape="circle"
          icon={<SearchOutlined className="text-slate-600" />}
          onClick={onOpenSearch}
          className="hover:bg-slate-100 w-9 h-9 flex items-center justify-center cursor-pointer"
        />
      </Tooltip>

      {/* Nút Thông báo với Badge dot đỏ */}
      <Tooltip title="Thông báo">
        <Badge dot offset={[-3, 4]} color="#ef4444">
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined className="text-slate-600 text-base" />}
            onClick={() => message.info('Bạn có 3 thông báo mới')}
            className="hover:bg-slate-100 w-9 h-9 flex items-center justify-center cursor-pointer"
          />
        </Badge>
      </Tooltip>

      {/* Avatar người dùng */}
      <Dropdown popupRender={() => dropdownMenu} placement="bottomRight" trigger={['click']}>
        <div className="w-9 h-9 rounded-full border-2 border-emerald-500/60 hover:border-emerald-600 p-0.5 bg-white cursor-pointer ml-1 active:scale-95 transition-all shrink-0 hover:shadow-xs hover:ring-2 hover:ring-emerald-500/20">
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
