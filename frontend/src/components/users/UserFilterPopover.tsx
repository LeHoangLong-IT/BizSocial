"use client";

import React from 'react';
import { Button, DatePicker, Select } from 'antd';
import { ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface OptionItem {
  id: number;
  name: string;
}

interface UserFilterPopoverProps {
  filterRole: string;
  setFilterRole: (val: string) => void;
  filterDepartment: string;
  setFilterDepartment: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  dateRange: any;
  setDateRange: (val: any) => void;
  activeFilterCount: number;
  resetFilters: () => void;
  closeFilters: () => void;
  roles: OptionItem[];
  departments: OptionItem[];
}

export const UserFilterPopover: React.FC<UserFilterPopoverProps> = ({
  filterRole,
  setFilterRole,
  filterDepartment,
  setFilterDepartment,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
  activeFilterCount,
  resetFilters,
  closeFilters,
  roles,
  departments,
}) => {
  const roleOptions = [
    { value: 'all', label: 'Tất cả vai trò' },
    ...roles.map((r) => ({ value: r.id.toString(), label: r.name })),
  ];

  const departmentOptions = [
    { value: 'all', label: 'Tất cả phòng ban' },
    ...departments.map((d) => ({ value: d.id.toString(), label: d.name })),
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'Active', label: 'Đang hoạt động (Active)' },
    { value: 'Inactive', label: 'Đã vô hiệu hóa (Inactive)' },
  ];

  return (
    <div className="w-72 sm:w-80 p-2.5 flex flex-col gap-3">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
        <span className="font-semibold text-slate-800 dark:text-white text-sm">Bộ lọc nâng cao</span>
        {activeFilterCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<ClearOutlined />}
            onClick={resetFilters}
            className="text-xs p-0 text-gray-400 dark:text-slate-400 hover:text-red-500"
          >
            Đặt lại ({activeFilterCount})
          </Button>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">Khoảng thời gian (Ngày tạo)</label>
        <RangePicker
          className="w-full text-xs rounded-md"
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">Vai trò (Role)</label>
        <Select
          className="w-full"
          value={filterRole}
          onChange={setFilterRole}
          getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
          options={roleOptions}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">Phòng ban (Department)</label>
        <Select
          className="w-full"
          value={filterDepartment}
          onChange={setFilterDepartment}
          getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
          options={departmentOptions}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1 block">Trạng thái (Status)</label>
        <Select
          className="w-full"
          value={filterStatus}
          onChange={setFilterStatus}
          getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
          options={statusOptions}
        />
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-2">
        <Button size="small" onClick={closeFilters}>Đóng</Button>
        <Button size="small" type="primary" className="!bg-slate-800 dark:!bg-indigo-600" onClick={closeFilters}>Áp dụng</Button>
      </div>
    </div>
  );
};
