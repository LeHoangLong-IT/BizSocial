"use client";

import React from 'react';
import { Card, Avatar, Dropdown, Button, Pagination, Empty } from 'antd';
import {
  MoreOutlined,
  EditOutlined,
  UndoOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';

export interface UserDataType {
  key: string;
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleId: string;
  department: string;
  departmentId: string;
  createdOn: string;
  createdAtRaw?: number;
  status: 'Active' | 'Inactive';
  avatarSeed: string;
}

interface UserGridViewProps {
  users: UserDataType[];
  totalCount: number;
  gridPage: number;
  gridPageSize: number;
  setGridPage: (page: number) => void;
  setGridPageSize: (size: number) => void;
  onEdit: (record: UserDataType) => void;
  onRestore: (id: number, name: string) => void;
  onSoftDelete: (id: number, name: string) => void;
  onPermanentDelete: (id: number, name: string) => void;
}

export const UserGridView: React.FC<UserGridViewProps> = ({
  users,
  totalCount,
  gridPage,
  gridPageSize,
  setGridPage,
  setGridPageSize,
  onEdit,
  onRestore,
  onSoftDelete,
  onPermanentDelete,
}) => {
  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-100 dark:border-slate-800 flex justify-center items-center my-4">
        <Empty description={<span className="text-slate-500 dark:text-slate-400">Không tìm thấy người dùng nào phù hợp</span>} />
      </div>
    );
  }

  const paginatedUsers = users.slice(
    (gridPage - 1) * gridPageSize,
    gridPage * gridPageSize
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {paginatedUsers.map((u) => {
          const isInactive = u.status === 'Inactive';
          const actionItems: any[] = [
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: 'Cập nhật',
              onClick: () => onEdit(u),
            },
          ];

          if (isInactive) {
            actionItems.push(
              {
                key: 'restore',
                icon: <UndoOutlined className="text-emerald-600 dark:text-emerald-400" />,
                label: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Khôi phục tài khoản</span>,
                onClick: () => onRestore(u.id, u.name),
              },
              { type: 'divider' },
              {
                key: 'permanent_delete',
                icon: <DeleteOutlined />,
                label: 'Xóa vĩnh viễn',
                danger: true,
                onClick: () => onPermanentDelete(u.id, u.name),
              }
            );
          } else {
            actionItems.push(
              { type: 'divider' },
              {
                key: 'deactivate',
                icon: <DeleteOutlined />,
                label: 'Vô hiệu hóa (Xóa)',
                danger: true,
                onClick: () => onSoftDelete(u.id, u.name),
              }
            );
          }

          return (
            <div
              key={u.id}
              className={`relative rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col items-center text-center ${
                isInactive
                  ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
              }`}
            >
              {/* Action Dropdown at Top Right */}
              <div className="absolute top-3 right-3">
                <Dropdown menu={{ items: actionItems }} trigger={['click']} placement="bottomRight">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    icon={<MoreOutlined className="text-slate-400 dark:text-slate-500 text-lg" />}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                  />
                </Dropdown>
              </div>

              {/* Status indicator if inactive */}
              {isInactive && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-semibold rounded-md">
                    Đã khóa
                  </span>
                </div>
              )}

              {/* Avatar Centered */}
              <div className="mt-2 mb-3">
                <Avatar
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.avatarSeed}`}
                  size={68}
                  className="bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-xs"
                />
              </div>

              {/* Name Centered */}
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-0.5 truncate max-w-full px-2" title={u.name}>
                {u.name}
              </h3>

              {/* Role Centered */}
              <div className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-2.5">
                {u.role}
              </div>

              {/* Department Tag Centered */}
              <div className="mb-3">
                <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-lg border border-teal-100/60 dark:border-teal-900/50 inline-block">
                  {u.department}
                </span>
              </div>

              {/* Horizontal Divider Line */}
              <div className="w-full border-t border-slate-100 dark:border-slate-800 my-2.5" />

              {/* Contact Info Centered */}
              <div className="w-full flex flex-col items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate max-w-full px-2">
                  <MailOutlined className="text-slate-400 dark:text-slate-500 text-sm flex-shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <PhoneOutlined className="text-slate-400 dark:text-slate-500 text-sm flex-shrink-0" />
                  <span>{u.phone || '—'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Hiển thị {Math.min((gridPage - 1) * gridPageSize + 1, totalCount)} - {Math.min(gridPage * gridPageSize, totalCount)} trên tổng {totalCount} người dùng
        </span>
        <Pagination
          current={gridPage}
          pageSize={gridPageSize}
          total={totalCount}
          onChange={(page, size) => {
            setGridPage(page);
            if (size) setGridPageSize(size);
          }}
          size="small"
          showSizeChanger
          pageSizeOptions={['4', '8', '12', '16']}
        />
      </div>
    </div>
  );
};
