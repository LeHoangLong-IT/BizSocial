import React from 'react';
import { Modal, Input } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  BankOutlined,
  SolutionOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
  searchFilter: string;
  setSearchFilter: (val: string) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  open,
  onClose,
  searchFilter,
  setSearchFilter,
}) => {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const shortcuts = [
    { label: 'Quản lý User', path: '/users', icon: <UserOutlined className="text-blue-600" /> },
    { label: 'Cơ cấu Tổ chức', path: '/organization', icon: <BankOutlined className="text-emerald-600" /> },
    { label: 'Quản lý Phân quyền', path: '/roles', icon: <SolutionOutlined className="text-purple-600" /> },
    { label: 'Dashboard', path: '/', icon: <DashboardOutlined className="text-amber-600" /> },
  ];

  return (
    <Modal
      title="Tìm kiếm nhanh hệ thống"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width={480}
    >
      <div className="space-y-4 pt-2">
        <Input
          prefix={<SearchOutlined className="text-slate-400 mr-1" />}
          placeholder="Nhập tên chức năng, phòng ban, vai trò..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          allowClear
          size="large"
          className="rounded-xl"
          autoFocus
        />

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
            Lối tắt nhanh
          </span>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {shortcuts.map((sc) => (
              <button
                key={sc.path}
                type="button"
                onClick={() => handleNavigate(sc.path)}
                className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 rounded-xl text-left transition-colors flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                {sc.icon} {sc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
