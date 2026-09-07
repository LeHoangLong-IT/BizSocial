import React from 'react';
import { App } from 'antd';
import { EditOutlined, SettingOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface UserDropdownContentProps {
  user: any;
  userAvatarUrl: string;
  onLogout: () => void;
}

export const UserDropdownContent: React.FC<UserDropdownContentProps> = ({
  user,
  userAvatarUrl,
  onLogout,
}) => {
  const { message } = App.useApp();
  const router = useRouter();

  return (
    <div className="w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/90 dark:border-slate-800 ring-1 ring-black/5 p-2 text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
      {/* User Header Banner */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100/90 dark:border-slate-700/80 mb-1">
        <div className="relative shrink-0">
          <img
            src={userAvatarUrl}
            alt={user?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover shadow-2xs border border-white dark:border-slate-700"
          />
          <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full absolute bottom-0 right-0" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-800 dark:text-white text-sm truncate leading-tight">
            {user?.name || 'Jamie Anderson'}
          </div>
          <div className="text-xs text-blue-600 dark:text-indigo-400 truncate mt-0.5 font-semibold">
            {user?.role?.name || 'Quản trị viên'}
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 -mx-2" />

      {/* Menu Item 1: Chỉnh sửa hồ sơ */}
      <button
        type="button"
        onClick={() => router.push('/profile')}
        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-blue-50/70 dark:hover:bg-indigo-950/50 rounded-xl transition-all text-left cursor-pointer group active:scale-[0.98]"
      >
        <EditOutlined className="text-sm text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-indigo-400 shrink-0 transition-colors" />
        <span>Chỉnh sửa hồ sơ</span>
      </button>

      {/* Menu Item 2: Cài đặt hệ thống */}
      <button
        type="button"
        onClick={() => message.info('Tính năng Cài đặt hệ thống đang được phát triển!')}
        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 hover:bg-blue-50/70 dark:hover:bg-indigo-950/50 rounded-xl transition-all text-left cursor-pointer group active:scale-[0.98]"
      >
        <SettingOutlined className="text-sm text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-indigo-400 shrink-0 transition-colors" />
        <span>Cài đặt hệ thống</span>
      </button>

      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 -mx-2" />

      {/* Menu Item 3: Khóa màn hình */}
      <button
        type="button"
        onClick={() => message.info('Đã bật chế độ Khóa màn hình tạm thời')}
        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/70 dark:hover:bg-amber-950/50 rounded-xl transition-all text-left cursor-pointer group active:scale-[0.98]"
      >
        <LockOutlined className="text-sm text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 shrink-0 transition-colors" />
        <span>Khóa màn hình</span>
      </button>

      {/* Menu Item 4: Đăng xuất */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-all text-left cursor-pointer group active:scale-[0.98]"
      >
        <LogoutOutlined className="text-sm text-rose-500 dark:text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-300 shrink-0 transition-colors" />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
};
