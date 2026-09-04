"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import {
  Typography,
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Dropdown,
  Avatar,
  DatePicker,
  Tooltip,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Upload,
  Empty,
  Popover,
  Badge,
  Pagination,
  Drawer,
  App
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ReloadOutlined,
  UploadOutlined,
  PictureOutlined,
  MailOutlined,
  PhoneOutlined,
  DownOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  ClearOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Interface definition
interface UserDataType {
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

type SortType = 'none' | 'a-z' | 'z-a' | 'newest' | 'oldest' | 'high' | 'low';

export default function UserManagementPage() {
  const { message, modal } = App.useApp();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<SortType>('none');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [loading, setLoading] = useState(false);

  // Advanced Filter states
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);

  // Grid pagination
  const [gridPage, setGridPage] = useState<number>(1);
  const [gridPageSize, setGridPageSize] = useState<number>(8);

  // Responsive mobile view mode locking
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeViewMode = isMobile ? 'grid' : viewMode;

  const { token } = useAuthStore();

  const handleOpenModal = (mode: 'add' | 'edit', record?: UserDataType) => {
    setModalMode(mode);
    if (mode === 'edit' && record) {
      setEditingUserId(record.id);
      form.setFieldsValue({
        name: record.name,
        email: record.email,
        phone: record.phone,
        role: record.roleId,
        department: record.departmentId,
        password: '',
        confirmPassword: '',
      });
    } else {
      setEditingUserId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const mappedData = res.data.map((u: any) => ({
        key: u.id.toString(),
        id: u.id,
        name: u.name || 'No Name',
        email: u.email,
        phone: u.phone || '',
        role: u.role?.name || 'N/A',
        roleId: u.roleId?.toString(),
        department: u.department?.name || 'N/A',
        departmentId: u.departmentId?.toString(),
        createdOn: new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        createdAtRaw: new Date(u.createdAt).getTime(),
        status: u.deletedAt ? 'Inactive' : 'Active',
        avatarSeed: u.name || 'User',
      }));
      setUsers(mappedData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Soft Delete Handler
  const handleSoftDelete = (id: number, name: string) => {
    modal.confirm({
      title: 'Vô hiệu hóa tài khoản',
      icon: <ExclamationCircleOutlined className="text-amber-500 text-xl" />,
      content: (
        <div className="py-2 text-slate-600">
          Bạn có chắc chắn muốn vô hiệu hóa tài khoản <strong>{name}</strong>?
          <p className="text-xs text-gray-400 mt-1">Tài khoản sẽ chuyển sang trạng thái Ngừng hoạt động (Inactive) và không thể đăng nhập vào hệ thống.</p>
        </div>
      ),
      okText: 'Vô hiệu hóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3001/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Đã vô hiệu hóa tài khoản thành công!');
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi vô hiệu hóa');
        }
      }
    });
  };

  // Restore Handler
  const handleRestore = (id: number, name: string) => {
    modal.confirm({
      title: 'Khôi phục tài khoản',
      icon: <UndoOutlined className="text-emerald-500 text-xl" />,
      content: (
        <div className="py-2 text-slate-600">
          Bạn có chắc chắn muốn khôi phục quyền truy cập cho tài khoản <strong>{name}</strong>?
        </div>
      ),
      okText: 'Khôi phục ngay',
      okButtonProps: { className: '!bg-emerald-600 hover:!bg-emerald-700 !border-0' },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.patch(`http://localhost:3001/users/${id}/restore`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Đã khôi phục tài khoản thành công!');
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Có lỗi xảy ra khi khôi phục');
        }
      }
    });
  };

  // Permanent Hard Delete Handler
  const handlePermanentDelete = (id: number, name: string) => {
    modal.confirm({
      title: 'CẢNH BÁO: XÓA VĨNH VIỄN TÀI KHOẢN',
      icon: <ExclamationCircleOutlined className="text-red-500 text-2xl" />,
      content: (
        <div className="py-2 text-slate-700">
          <p className="font-semibold text-red-600 mb-1">Hành động này KHÔNG THỂ KHÔI PHỤC!</p>
          Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong>{name} (ID: #{id})</strong> khỏi cơ sở dữ liệu?
        </div>
      ),
      okText: 'XÓA VĨNH VIỄN',
      okType: 'danger',
      cancelText: 'Hủy bỏ',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3001/users/${id}/permanent`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success('Đã xóa vĩnh viễn tài khoản khỏi cơ sở dữ liệu!');
          fetchUsers();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Không thể xóa vĩnh viễn tài khoản này');
        }
      }
    });
  };

  // Export Excel Handler (.xlsx)
  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      message.warning('Không có dữ liệu người dùng để xuất file!');
      return;
    }

    const excelRows = filteredUsers.map((u) => ({
      'Mã User': `#${u.id}`,
      'Họ và tên': u.name,
      'Email': u.email,
      'Số điện thoại': u.phone || '—',
      'Vai trò': u.role,
      'Phòng ban': u.department,
      'Ngày tạo': u.createdOn,
      'Trạng thái': u.status === 'Active' ? 'Hoạt động' : 'Đã khóa',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    // Căn chỉnh độ rộng cột tự động
    worksheet['!cols'] = [
      { wch: 10 }, // Mã User
      { wch: 22 }, // Họ và tên
      { wch: 28 }, // Email
      { wch: 16 }, // SĐT
      { wch: 16 }, // Vai trò
      { wch: 16 }, // Phòng ban
      { wch: 16 }, // Ngày tạo
      { wch: 16 }, // Trạng thái
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách Users');

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    XLSX.writeFile(workbook, `Danh_sach_User_BizSocial_${dateStr}.xlsx`);
    message.success('Đã xuất file Excel (.xlsx) thành công!');
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Modal Submit
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalMode === 'add' && values.password !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp!');
        return;
      }
      if (modalMode === 'edit' && values.password && values.password !== values.confirmPassword) {
        message.error('Mật khẩu xác nhận không khớp!');
        return;
      }

      const payload: any = {
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        roleId: parseInt(values.role),
        departmentId: parseInt(values.department) || null,
      };

      if (values.password) {
        payload.password = values.password;
      }

      if (modalMode === 'add') {
        await axios.post('http://localhost:3001/users', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Thêm mới người dùng thành công!');
      } else if (editingUserId) {
        await axios.patch(`http://localhost:3001/users/${editingUserId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Cập nhật người dùng thành công!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error.response?.data || error.message);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
    }
  };

  // Active filter count
  const activeFilterCount = (filterRole !== 'all' ? 1 : 0) +
    (filterDepartment !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (dateRange && dateRange[0] ? 1 : 0);

  const resetFilters = () => {
    setFilterRole('all');
    setFilterDepartment('all');
    setFilterStatus('all');
    setDateRange(null);
    setFilterOpen(false);
    setMobileFilterOpen(false);
  };

  const sortMenuItems = [
    {
      key: 'a-z',
      label: (
        <div className="flex items-center justify-between py-1 px-1 min-w-[130px]">
          <span>A - Z (Tên)</span>
          {sortBy === 'a-z' && <span className="text-teal-600 font-bold ml-2 text-xs">✓</span>}
        </div>
      ),
      onClick: () => setSortBy('a-z'),
    },
    {
      key: 'z-a',
      label: (
        <div className="flex items-center justify-between py-1 px-1 min-w-[130px]">
          <span>Z - A (Tên)</span>
          {sortBy === 'z-a' && <span className="text-teal-600 font-bold ml-2 text-xs">✓</span>}
        </div>
      ),
      onClick: () => setSortBy('z-a'),
    },
    {
      key: 'newest',
      label: (
        <div className="flex items-center justify-between py-1 px-1 min-w-[130px]">
          <span>Mới nhất</span>
          {sortBy === 'newest' && <span className="text-teal-600 font-bold ml-2 text-xs">✓</span>}
        </div>
      ),
      onClick: () => setSortBy('newest'),
    },
    {
      key: 'oldest',
      label: (
        <div className="flex items-center justify-between py-1 px-1 min-w-[130px]">
          <span>Cũ nhất</span>
          {sortBy === 'oldest' && <span className="text-teal-600 font-bold ml-2 text-xs">✓</span>}
        </div>
      ),
      onClick: () => setSortBy('oldest'),
    },
    {
      key: 'high',
      label: (
        <div className="flex items-center justify-between py-1 px-1 min-w-[130px]">
          <span>ID cao nhất</span>
          {sortBy === 'high' && <span className="text-teal-600 font-bold ml-2 text-xs">✓</span>}
        </div>
      ),
      onClick: () => setSortBy('high'),
    },
    {
      key: 'low',
      label: (
        <div className="flex items-center justify-between py-1 px-1 min-w-[130px]">
          <span>ID thấp nhất</span>
          {sortBy === 'low' && <span className="text-teal-600 font-bold ml-2 text-xs">✓</span>}
        </div>
      ),
      onClick: () => setSortBy('low'),
    },
  ];

  const filteredUsers = [...users]
    .filter((u) => {
      // Search box filter
      if (searchText) {
        const query = searchText.toLowerCase();
        const matches =
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query) ||
          u.department.toLowerCase().includes(query) ||
          u.id.toString().includes(query);
        if (!matches) return false;
      }

      // Advanced filters
      if (filterRole !== 'all' && u.roleId !== filterRole) {
        return false;
      }
      if (filterDepartment !== 'all' && u.departmentId !== filterDepartment) {
        return false;
      }
      if (filterStatus !== 'all' && u.status !== filterStatus) {
        return false;
      }

      // Date range filter
      if (dateRange && dateRange[0] && dateRange[1] && u.createdAtRaw) {
        const start = dateRange[0].startOf('day').valueOf();
        const end = dateRange[1].endOf('day').valueOf();
        if (u.createdAtRaw < start || u.createdAtRaw > end) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'a-z':
          return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
        case 'z-a':
          return b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' });
        case 'newest':
          return (b.createdAtRaw || b.id) - (a.createdAtRaw || a.id);
        case 'oldest':
          return (a.createdAtRaw || a.id) - (b.createdAtRaw || b.id);
        case 'high':
          return b.id - a.id;
        case 'low':
          return a.id - b.id;
        default:
          return 0;
      }
    });

  // Paginated users for Grid View
  const paginatedGridUsers = filteredUsers.slice(
    (gridPage - 1) * gridPageSize,
    gridPage * gridPageSize
  );

  const columns: ColumnsType<UserDataType> = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${record.avatarSeed}`} size={38} className="bg-gray-100" />
          <div className="flex flex-col">
            <Text strong className="text-gray-800 leading-tight">{text}</Text>
            <span className="text-xs text-gray-400 font-normal mt-0.5">ID: #{record.id}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text className="text-gray-500">{text}</Text>
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <Text className="text-gray-500">{text || '—'}</Text>
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (text) => <Text className="text-gray-500">{text}</Text>
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Text className="text-gray-500">{text}</Text>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: (text) => <Text className="text-gray-500">{text}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          className={`border-0 px-2 py-0.5 rounded-md font-medium ${status === 'Active'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-500'
            }`}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        const isInactive = record.status === 'Inactive';
        const actionItems: any[] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Cập nhật',
            onClick: () => handleOpenModal('edit', record)
          },
        ];

        if (isInactive) {
          actionItems.push(
            {
              key: 'restore',
              icon: <UndoOutlined className="text-emerald-600" />,
              label: <span className="text-emerald-600 font-medium">Khôi phục tài khoản</span>,
              onClick: () => handleRestore(record.id, record.name),
            },
            { type: 'divider' },
            {
              key: 'permanent_delete',
              icon: <DeleteOutlined />,
              label: 'Xóa vĩnh viễn',
              danger: true,
              onClick: () => handlePermanentDelete(record.id, record.name),
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
              onClick: () => handleSoftDelete(record.id, record.name),
            }
          );
        }

        return (
          <Dropdown
            menu={{ items: actionItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              shape="circle"
              icon={<MoreOutlined className="rotate-90 text-gray-400" />}
              className="border border-gray-200 hover:bg-gray-50"
            />
          </Dropdown>
        );
      },
    },
  ];

  // Filter Popover Content
  const filterPopoverContent = (
    <div className="w-72 sm:w-80 p-2.5 flex flex-col gap-3">
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <span className="font-semibold text-slate-800 text-sm">Bộ lọc nâng cao</span>
        {activeFilterCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<ClearOutlined />}
            onClick={resetFilters}
            className="text-xs p-0 text-gray-400 hover:text-red-500"
          >
            Đặt lại ({activeFilterCount})
          </Button>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Khoảng thời gian (Ngày tạo)</label>
        <RangePicker
          className="w-full text-xs rounded-md"
          format="DD/MM/YYYY"
          placeholder={['Từ ngày', 'Đến ngày']}
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Vai trò (Role)</label>
        <Select
          className="w-full"
          value={filterRole}
          onChange={setFilterRole}
          options={[
            { value: 'all', label: 'Tất cả vai trò' },
            { value: '1', label: 'Super Admin' },
            { value: '2', label: 'Manager' },
            { value: '3', label: 'Leader' },
            { value: '4', label: 'Employee' },
            { value: '5', label: 'Intern' },
          ]}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Phòng ban (Department)</label>
        <Select
          className="w-full"
          value={filterDepartment}
          onChange={setFilterDepartment}
          options={[
            { value: 'all', label: 'Tất cả phòng ban' },
            { value: '1', label: 'Finance' },
            { value: '2', label: 'Sales' },
            { value: '3', label: 'HR' },
            { value: '4', label: 'IT' },
          ]}
        />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Trạng thái (Status)</label>
        <Select
          className="w-full"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'Active', label: 'Đang hoạt động (Active)' },
            { value: 'Inactive', label: 'Đã vô hiệu hóa (Inactive)' },
          ]}
        />
      </div>

      <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
        <Button size="small" onClick={() => setFilterOpen(false)}>Đóng</Button>
        <Button size="small" type="primary" className="!bg-slate-800" onClick={() => setFilterOpen(false)}>Áp dụng</Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 print:p-0">
      {/* Header Section - Grid / Responsive Layout matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start sm:items-center mb-1 print:hidden">
        <div>
          <Title level={3} className="!mb-0 font-bold text-slate-800 tracking-tight text-xl sm:text-2xl">
            Quản lý User
          </Title>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end w-full sm:w-auto">
          {/* View Mode Switcher Segmented Button (Hidden on Mobile, Locked to Grid) */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg items-center gap-1 border border-slate-200/60 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${viewMode === 'table'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              title="Dạng danh sách"
            >
              <UnorderedListOutlined className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${viewMode === 'grid'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              title="Dạng lưới (Grid)"
            >
              <AppstoreOutlined className="text-sm" />
            </button>
          </div>

          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="text-slate-700 font-medium text-xs h-8 px-3 rounded-lg border-slate-200 hover:text-teal-600 shadow-none"
          >
            In
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'excel',
                  icon: <FileExcelOutlined className="text-emerald-600" />,
                  label: 'Xuất file Excel (.xlsx)',
                  onClick: handleExportExcel,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button
              className="text-slate-700 font-medium text-xs h-8 px-3 rounded-lg border-slate-200 shadow-none flex items-center gap-1"
            >
              <DownloadOutlined className="text-xs text-slate-500" />
              <span>Xuất file</span>
              <DownOutlined className="text-[9px] text-slate-400" />
            </Button>
          </Dropdown>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-slate-900 hover:bg-slate-800 border-0 font-medium text-xs h-8 px-3.5 rounded-lg shadow-xs"
            onClick={() => handleOpenModal('add')}
          >
            Thêm User
          </Button>
        </div>
      </div>

      {/* Bảng báo cáo in ấn chuyên dụng (Chỉ hiển thị khi in) */}
      <div className="hidden print:block w-full print-only-view">
        <div className="border-b-2 border-slate-900 pb-3 mb-5">
          <div className='text-center'>
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide m-0">
              DANH SÁCH NGƯỜI DÙNG HỆ THỐNG
            </h1>
            <p className="text-xs text-slate-500 m-0 mt-1 font-medium">
              BizSocial ERP — Quản trị người dùng & Phân quyền
            </p>
          </div>
          <div className="mt-5 text-xs text-slate-600 flex justify-between items-end">
            <p className="m-0 font-medium">
              Thời gian in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="m-0 text-slate-400 mt-0.5">
              Tổng số nhân sự: {filteredUsers.length} người
            </p>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-semibold">
              <th className="border border-slate-300 px-2.5 py-2 text-center w-12">STT</th>
              <th className="border border-slate-300 px-3 py-2 text-left w-48">Họ và tên</th>
              <th className="border border-slate-300 px-3 py-2 text-left">Email</th>
              <th className="border border-slate-300 px-2.5 py-2 text-center w-28">Số điện thoại</th>
              <th className="border border-slate-300 px-2.5 py-2 text-center w-28">Vai trò</th>
              <th className="border border-slate-300 px-2.5 py-2 text-center w-24">Phòng ban</th>
              <th className="border border-slate-300 px-2.5 py-2 text-center w-28">Ngày tạo</th>
              <th className="border border-slate-300 px-2 py-2 text-center w-24">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, idx) => (
              <tr key={u.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-500 font-normal">
                  {idx + 1}
                </td>
                <td className="border border-slate-300 px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                  {u.name} <span className="text-[10px] text-slate-400 font-normal">#{u.id}</span>
                </td>
                <td className="border border-slate-300 px-3 py-2 text-slate-700 font-normal whitespace-nowrap">
                  {u.email}
                </td>
                <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-700 font-normal whitespace-nowrap">
                  {u.phone || '—'}
                </td>
                <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-800 font-medium whitespace-nowrap">
                  {u.role}
                </td>
                <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-700 font-normal whitespace-nowrap">
                  {u.department}
                </td>
                <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-600 font-normal whitespace-nowrap">
                  {u.createdOn}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-medium whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] ${u.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 font-medium'
                      : 'bg-rose-100 text-rose-800 font-medium'
                      }`}
                  >
                    {u.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Chân trang in ấn */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-start text-xs text-slate-500">
          <div>
            <p className="m-0 font-medium text-slate-700">Ghi chú:</p>
            <p className="m-0 text-[11px] text-slate-400">Báo cáo được trích xuất tự động từ phân hệ quản trị BizSocial ERP.</p>
          </div>
          <div className="text-center min-w-[160px]">
            <p className="m-0 font-semibold text-slate-800">Người lập biểu</p>
            <p className="m-0 text-[11px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
            <div className="h-14"></div>
          </div>
        </div>
      </div>

      {/* Main Card Wrapper (Chỉ hiển thị khi xem trên Web) */}
      <Card variant="borderless" className="shadow-sm rounded-xl overflow-hidden border border-gray-100 web-only-view" styles={{ body: { padding: 0 } }}>

        {/* Filter & Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white gap-3 print:hidden">
          {/* Desktop Filter Layout */}
          <div className="hidden sm:flex flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined className="text-slate-400" />}
                className="w-64 rounded-lg text-xs"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
              />
              <RangePicker
                className="rounded-lg text-xs"
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Popover
                content={filterPopoverContent}
                trigger="click"
                open={filterOpen}
                onOpenChange={setFilterOpen}
                placement="bottomRight"
              >
                <Badge count={activeFilterCount} offset={[-4, 4]} size="small">
                  <Button
                    icon={<FilterOutlined />}
                    className={`rounded-lg text-xs font-medium h-8 ${activeFilterCount > 0 ? '!border-teal-600 !text-teal-700' : 'text-slate-600 border-slate-200'}`}
                  >
                    Bộ lọc
                  </Button>
                </Badge>
              </Popover>

              <Dropdown menu={{ items: sortMenuItems }} trigger={['click']} placement="bottomLeft">
                <Button
                  className="!bg-teal-700 hover:!bg-teal-800 !text-white !border-0 text-xs font-medium h-8 px-3 flex items-center gap-1.5 rounded-lg shadow-xs"
                >
                  <SortAscendingOutlined className="text-xs" />
                  <span>Sắp xếp</span>
                  <DownOutlined className="text-[9px] opacity-80" />
                </Button>
              </Dropdown>

              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchUsers}
                  loading={loading}
                  className="text-slate-500 rounded-lg h-8 w-8 p-0 flex items-center justify-center border-slate-200"
                />
              </Tooltip>
            </div>
          </div>

          {/* Mobile Optimized Filter Layout */}
          <div className="flex sm:hidden flex-col gap-2.5">
            {/* Row 1: Search Bar Full Width */}
            <Input
              placeholder="Tìm kiếm người dùng..."
              prefix={<SearchOutlined className="text-slate-400" />}
              className="w-full rounded-xl text-xs h-9 bg-slate-50/80 border-slate-200"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />

            {/* Row 2: Date Range Picker Full Width */}
            <RangePicker
              className="w-full rounded-xl text-xs h-9 bg-white border-slate-200"
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />

            {/* Row 3: Action Bar (Filter, Sort, Refresh) */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {/* Mobile Filter Button (Triggers Popover Dropdown like Desktop) */}
              <Popover
                content={filterPopoverContent}
                trigger="click"
                open={filterOpen}
                onOpenChange={setFilterOpen}
                placement="bottomLeft"
              >
                <button
                  type="button"
                  className={`w-full rounded-xl text-xs font-medium h-9 flex items-center justify-center gap-1.5 transition-all border ${
                    activeFilterCount > 0
                      ? 'border-teal-600 text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <FilterOutlined className="text-xs" />
                  <span>Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-teal-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </Popover>

              {/* Sort Dropdown */}
              <Dropdown menu={{ items: sortMenuItems }} trigger={['click']} placement="bottom">
                <button
                  type="button"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white border-0 text-xs font-medium h-9 flex items-center justify-center gap-1 rounded-xl shadow-xs transition-all"
                >
                  <SortAscendingOutlined className="text-xs" />
                  <span>Sắp xếp</span>
                  <DownOutlined className="text-[9px] opacity-80" />
                </button>
              </Dropdown>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={fetchUsers}
                disabled={loading}
                className="w-full text-slate-600 hover:text-slate-900 rounded-xl h-9 flex items-center justify-center border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium transition-all"
              >
                <ReloadOutlined className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                <span className="ml-1">Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* View content: Table or Grid */}
        {activeViewMode === 'table' ? (
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={filteredUsers}
              loading={loading}
              pagination={{
                pageSize: 8,
                showTotal: (total) => `Tổng cộng ${total} người dùng`,
                className: 'px-4 pb-4 print:hidden flex-wrap',
              }}
              rowClassName="hover:bg-gray-50 transition-colors cursor-pointer"
              className="custom-table"
            />
          </div>
        ) : (
          <div className="p-4 sm:p-5 min-h-[300px]">
            {filteredUsers.length === 0 ? (
              <Empty description="Không tìm thấy người dùng phù hợp" className="py-12" />
            ) : (
              <>
                {/* Employee Cards Grid (Matching Image 2 Reference) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {paginatedGridUsers.map((item) => {
                    const isInactive = item.status === 'Inactive';
                    const gridActionItems: any[] = [
                      {
                        key: 'edit',
                        label: 'Cập nhật',
                        icon: <EditOutlined />,
                        onClick: () => handleOpenModal('edit', item),
                      },
                    ];

                    if (isInactive) {
                      gridActionItems.push(
                        {
                          key: 'restore',
                          icon: <UndoOutlined className="text-emerald-600" />,
                          label: <span className="text-emerald-600 font-medium">Khôi phục tài khoản</span>,
                          onClick: () => handleRestore(item.id, item.name),
                        },
                        { type: 'divider' },
                        {
                          key: 'permanent_delete',
                          label: 'Xóa vĩnh viễn',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => handlePermanentDelete(item.id, item.name),
                        }
                      );
                    } else {
                      gridActionItems.push(
                        { type: 'divider' },
                        {
                          key: 'deactivate',
                          label: 'Vô hiệu hóa',
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: () => handleSoftDelete(item.id, item.name),
                        }
                      );
                    }

                    return (
                      <Card
                        key={item.id}
                        className="rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 relative bg-white overflow-hidden"
                        styles={{ body: { padding: '20px 18px' } }}
                      >
                        {/* Status Tag & Action Dropdown Top Row */}
                        <div className="flex justify-between items-center w-full mb-1">
                          <Tag
                            className={`border-0 px-2 py-0.5 rounded-md font-medium text-[11px] ${item.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-500'
                              }`}
                          >
                            {item.status}
                          </Tag>

                          <Dropdown
                            menu={{ items: gridActionItems }}
                            trigger={['click']}
                            placement="bottomRight"
                          >
                            <Button
                              type="text"
                              shape="circle"
                              size="small"
                              icon={<MoreOutlined className="rotate-90 text-slate-400" />}
                              className="hover:bg-slate-100"
                            />
                          </Dropdown>
                        </div>

                        {/* Centered Employee Card Details (Matching Screenshot 2) */}
                        <div className="flex flex-col items-center text-center">
                          <Avatar
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.avatarSeed}`}
                            size={76}
                            className="bg-slate-50 ring-4 ring-slate-50 shadow-xs mb-3 border border-slate-100"
                          />

                          <Text strong className="text-slate-800 text-base sm:text-lg font-bold leading-tight hover:text-teal-600 transition-colors">
                            {item.name}
                          </Text>

                          <span className="text-xs sm:text-sm font-normal text-slate-500 mt-0.5">
                            {item.role || 'Nhân viên'}
                          </span>

                          {item.department && item.department !== 'N/A' && (
                            <span className="inline-block mt-2 text-xs font-medium bg-teal-50/80 text-teal-700 border border-teal-100 px-3 py-0.5 rounded-md">
                              {item.department}
                            </span>
                          )}

                          {/* Divider Line */}
                          <div className="w-full border-t border-slate-100/90 my-3.5"></div>

                          {/* Contact Info: Email & Phone */}
                          <div className="w-full flex flex-col gap-1.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 truncate">
                              <MailOutlined className="text-slate-400 shrink-0 text-xs" />
                              <span className="truncate">{item.email}</span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                              <PhoneOutlined className="text-slate-400 shrink-0 text-xs" />
                              <span>{item.phone || 'Chưa có SĐT'}</span>
                            </div>
                          </div>

                          {/* Action Button at Bottom */}
                          <div className="w-full mt-4">
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleOpenModal('edit', item)}
                              className="w-full rounded-lg text-xs font-medium text-slate-700 border-slate-200 hover:text-teal-600 hover:border-teal-300 h-8"
                            >
                              Chỉnh sửa
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Grid Pagination */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">
                    Hiển thị {(gridPage - 1) * gridPageSize + 1} - {Math.min(gridPage * gridPageSize, filteredUsers.length)} trong tổng số {filteredUsers.length} người dùng
                  </div>
                  <Pagination
                    current={gridPage}
                    pageSize={gridPageSize}
                    total={filteredUsers.length}
                    onChange={(p, ps) => {
                      setGridPage(p);
                      setGridPageSize(ps);
                    }}
                    size="small"
                    showSizeChanger
                    pageSizeOptions={['8', '16', '24', '32']}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Modal Add/Edit User */}
      <Modal
        centered
        title={
          <div className="border-b border-gray-100 pb-3 -mx-6 px-6 mb-4">
            <Title level={4} className="!mb-0 font-semibold">{modalMode === 'add' ? 'Thêm mới Người dùng' : 'Cập nhật Người dùng'}</Title>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalOk} className="bg-[#1e293b] hover:bg-slate-700">
            Lưu thay đổi
          </Button>,
        ]}
        width={700}
        closeIcon={<div className="bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 mt-2">✕</div>}
        styles={{ body: { padding: 24 } }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>

          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Ảnh đại diện</div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
                <PictureOutlined className="text-2xl" />
              </div>
              <div>
                <Upload showUploadList={false}>
                  <Button icon={<UploadOutlined />} type="primary" className="bg-[#1e293b] hover:bg-slate-700 font-medium">
                    Tải ảnh lên
                  </Button>
                </Upload>
                <div className="text-xs text-gray-400 mt-2">Định dạng JPG hoặc PNG, dung lượng tối đa 5MB.</div>
              </div>
            </div>
          </div>

          <Form.Item
            name="name"
            label={<span className="font-medium">Họ và tên <span className="text-red-500">*</span></span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input size="large" placeholder="Nhập họ và tên" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label={<span className="font-medium">Vai trò <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select size="large" placeholder="Chọn vai trò">
                  <Select.Option value="1">Super Admin</Select.Option>
                  <Select.Option value="2">Manager</Select.Option>
                  <Select.Option value="3">Leader</Select.Option>
                  <Select.Option value="4">Employee</Select.Option>
                  <Select.Option value="5">Intern</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label={<span className="font-medium">Phòng ban <span className="text-red-500">*</span></span>}
                rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
              >
                <Select size="large" placeholder="Chọn phòng ban">
                  <Select.Option value="1">Finance</Select.Option>
                  <Select.Option value="2">Sales</Select.Option>
                  <Select.Option value="3">HR</Select.Option>
                  <Select.Option value="4">IT</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label={<span className="font-medium">Email <span className="text-red-500">*</span></span>}
                rules={[{ required: true, type: 'email', message: 'Email không đúng định dạng' }]}
              >
                <Input size="large" placeholder="email@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label={<span className="font-medium">Số điện thoại</span>}
              >
                <Input size="large" placeholder="0123456789" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label={
                  <span className="font-medium">
                    {modalMode === 'add' ? 'Mật khẩu' : 'Mật khẩu mới (Bỏ trống nếu không đổi)'}
                    {modalMode === 'add' && <span className="text-red-500"> *</span>}
                  </span>
                }
                rules={[{ required: modalMode === 'add', message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password size="large" placeholder="******" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label={
                  <span className="font-medium">
                    {modalMode === 'add' ? 'Xác nhận mật khẩu' : 'Xác nhận mật khẩu mới'}
                    {modalMode === 'add' && <span className="text-red-500"> *</span>}
                  </span>
                }
                rules={[{ required: modalMode === 'add', message: 'Vui lòng xác nhận mật khẩu' }]}
              >
                <Input.Password size="large" placeholder="******" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Custom Styles overrides for Table & Print mode */}
      <style jsx global>{`
        .custom-table .ant-table {
          background: transparent !important;
        }
        .custom-table .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #374151 !important;
          font-weight: 600 !important;
          padding: 14px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 14px 16px !important;
        }
        .custom-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          header, aside, nav, .ant-layout-sider, .ant-layout-header, .print\\:hidden, .web-only-view {
            display: none !important;
          }
          .print-only-view {
            display: block !important;
            width: 100% !important;
            padding: 12mm 6mm !important;
            box-sizing: border-box !important;
          }
          html, body, #__next, .ant-layout, .ant-layout-content, main {
            background: #ffffff !important;
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-only-view table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-only-view th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            border: 1px solid #94a3b8 !important;
          }
          .print-only-view td {
            font-size: 11px !important;
            border: 1px solid #cbd5e1 !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>
    </div>
  );
}
