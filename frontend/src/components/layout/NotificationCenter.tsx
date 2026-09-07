import React, { useState, useEffect } from 'react';
import { Badge, Button, Popover, Spin } from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  NotificationOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNotificationStore } from '@/store/notificationStore';

interface NotificationCenterProps {
  children: React.ReactNode;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    activeTab,
    loading,
    fetchNotifications,
    setActiveTab,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const currentList = notifications.filter((n) =>
    activeTab === 'unread' ? !n.read : n.read
  );

  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const renderContent = () => (
    <div
      onClick={(e) => e.stopPropagation()}
      className="sm:w-96 space-y-3 p-1"
    >
      {/* Header & Mark All As Read */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <BellOutlined className="text-indigo-600 text-base font-bold" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            Thông Báo Cá Nhân
          </span>
          {unreadCount > 0 && (
            <Badge count={unreadCount} overflowCount={99} className="ms-1" />
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer p-0 h-auto"
          >
            Đọc tất cả ✓
          </Button>
        )}
      </div>

      {/* Tabs Switcher: Chưa xem vs Đã xem */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab('unread');
          }}
          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'unread'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
        >
          <span>Chưa xem</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-extrabold">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab('read');
          }}
          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'read'
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
        >
          <span>Đã xem</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
            {readCount}
          </span>
        </button>
      </div>

      {/* Notification Items List */}
      <div className="max-h-[380px] overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
        {currentList.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-base">
              <BellOutlined />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {activeTab === 'unread'
                ? 'Tuyệt vời! Bạn không có thông báo chưa xem nào.'
                : 'Chưa có thông báo nào trong mục đã xem.'}
            </div>
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.id}
              onClick={(e) => handleToggleRead(item.id, e)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${!item.read
                ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-400'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
                  {item.type === 'approval' && <CheckCircleOutlined />}
                  {item.type === 'crm' && <ThunderboltOutlined />}
                  {item.type === 'badge' && <CrownOutlined />}
                  {item.type === 'system' && <NotificationOutlined />}
                  {item.type === 'meeting' && <CalendarOutlined />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1.5">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 m-0 leading-snug">
                      {item.title}
                    </h5>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0 mt-1 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{item.time}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">
                      {item.read ? 'Đánh dấu chưa đọc ↺' : 'Chuyển sang đã xem ✓'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={renderContent()}
      trigger="click"
      open={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      placement="bottomRight"
      align={{ overflow: { adjustX: true, adjustY: true } }}
      overlayClassName="notification-popover"
    >
      {children}
    </Popover>
  );
};



