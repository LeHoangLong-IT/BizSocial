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
  Form,
  Popover,
  Badge,
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
  DownOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import type { ColumnsType } from 'antd/es/table';

import { UserModal } from '@/components/users/UserModal';
import { UserFilterPopover } from '@/components/users/UserFilterPopover';
import { UserGridView, UserDataType } from '@/components/users/UserGridView';
import { UserPrintReport } from '@/components/users/UserPrintReport';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
  
  // Real DB Data states
  const [users, setUsers] = useState<UserDataType[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
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

  // Fetch Users, Roles, and Departments from real Backend DB
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mappedData: UserDataType[] = res.data.map((u: any) => ({
        key: u.id.toString(),
        id: u.id,
        name: u.name || 'No Name',
        email: u.email,
        phone: u.phone || '',
        role: u.role?.name || 'N/A',
        roleId: u.roleId?.toString() || '',
        department: u.department?.name || 'N/A',
        departmentId: u.departmentId?.toString() || '',
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

  const fetchRolesAndDepartments = async () => {
    if (!token) return;
    try {
      const [rolesRes, deptsRes] = await Promise.all([
        axios.get('http://localhost:3001/roles', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3001/organization/departments', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setRoles(rolesRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (error) {
      console.error('Error fetching metadata (roles/departments):', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRolesAndDepartments();
    }
  }, [token]);

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
    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 28 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
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

  const closeFilters = () => {
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

  const columns: ColumnsType<UserDataType> = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space size="middle">
          <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${record.avatarSeed}`} size={38} className="bg-gray-100 dark:bg-slate-800" />
          <div className="flex flex-col">
            <Text strong className="text-slate-900 dark:text-white leading-tight">{text}</Text>
            <span className="text-xs text-slate-400 font-normal mt-0.5">ID: #{record.id}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text className="text-slate-600 dark:text-slate-400">{text}</Text>
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <Text className="text-slate-600 dark:text-slate-400">{text || '—'}</Text>
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (text) => <Text className="text-slate-600 dark:text-slate-400 font-medium">{text}</Text>
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Text className="text-slate-600 dark:text-slate-400">{text}</Text>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: (text) => <Text className="text-slate-500 dark:text-slate-400">{text}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          className={`border px-2.5 py-0.5 rounded-full font-bold text-[11px] ${status === 'Active'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80'
            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/80'
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
              icon: <UndoOutlined className="text-emerald-600 dark:text-emerald-400" />,
              label: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Khôi phục tài khoản</span>,
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
              icon={<MoreOutlined className="rotate-90 text-slate-400 dark:text-slate-500" />}
              className="border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            />
          </Dropdown>
        );
      },
    },
  ];

  // Reusable Filter Popover Content
  const filterPopoverContent = (
    <UserFilterPopover
      filterRole={filterRole}
      setFilterRole={setFilterRole}
      filterDepartment={filterDepartment}
      setFilterDepartment={setFilterDepartment}
      filterStatus={filterStatus}
      setFilterStatus={setFilterStatus}
      dateRange={dateRange}
      setDateRange={setDateRange}
      activeFilterCount={activeFilterCount}
      resetFilters={resetFilters}
      closeFilters={closeFilters}
      roles={roles}
      departments={departments}
    />
  );

  return (
    <div className="flex flex-col gap-4 print:p-0">
      {/* Header Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start sm:items-center mb-1 print:hidden">
        <div>
          <Title level={3} className="!mb-0 font-bold text-slate-800 dark:text-white tracking-tight text-xl sm:text-2xl">
            Quản lý User
          </Title>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end w-full sm:w-auto">
          {/* View Mode Switcher */}
          <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg items-center gap-1 border border-slate-200/60 dark:border-slate-700 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
              title="Dạng danh sách"
            >
              <UnorderedListOutlined className="text-sm" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
              title="Dạng lưới (Grid)"
            >
              <AppstoreOutlined className="text-sm" />
            </button>
          </div>

          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="text-slate-700 dark:text-slate-200 font-medium text-xs h-8 px-3 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 shadow-none"
          >
            In
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'excel',
                  icon: <FileExcelOutlined className="text-emerald-600 dark:text-emerald-400" />,
                  label: 'Xuất file Excel (.xlsx)',
                  onClick: handleExportExcel,
                },
              ],
            }}
            trigger={['click']}
          >
            <Button
              className="text-slate-700 dark:text-slate-200 font-medium text-xs h-8 px-3 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-none flex items-center gap-1"
            >
              <DownloadOutlined className="text-xs text-slate-500 dark:text-slate-400" />
              <span>Xuất file</span>
              <DownOutlined className="text-[9px] text-slate-400" />
            </Button>
          </Dropdown>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 border-0 font-medium text-xs h-8 px-3.5 rounded-lg shadow-xs"
            onClick={() => handleOpenModal('add')}
          >
            Thêm User
          </Button>
        </div>
      </div>

      {/* Report Table View for Printing */}
      <UserPrintReport users={filteredUsers} />

      {/* Main Card Wrapper (Web View) */}
      <Card variant="borderless" className="shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 web-only-view" styles={{ body: { padding: 0 } }}>
        {/* Filter & Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 gap-3 print:hidden">
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
                style={{ width: 'fit-content', minWidth: '270px' }}
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
                    className={`rounded-lg text-xs font-medium h-8 ${activeFilterCount > 0 ? '!border-teal-600 !text-teal-700 dark:!text-teal-400' : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
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
                  className="text-slate-500 dark:text-slate-400 rounded-lg h-8 w-8 p-0 flex items-center justify-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </Tooltip>
            </div>
          </div>

          {/* Mobile Filter Layout */}
          <div className="flex sm:hidden flex-col gap-2.5">
            <Input
              placeholder="Tìm kiếm người dùng..."
              prefix={<SearchOutlined className="text-slate-400" />}
              className="w-full rounded-xl text-xs h-9 bg-slate-50/80 border-slate-200"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />

            <RangePicker
              className="w-full rounded-xl text-xs h-9 bg-white border-slate-200"
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />

            <div className="grid grid-cols-3 gap-2 w-full">
              <Popover
                content={filterPopoverContent}
                trigger="click"
                open={mobileFilterOpen}
                onOpenChange={setMobileFilterOpen}
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

              <Dropdown menu={{ items: sortMenuItems }} trigger={['click']} placement="bottom">
                <button
                  type="button"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white border-0 text-xs font-medium h-9 flex items-center justify-center gap-1 rounded-xl shadow-xs transition-all"
                >
                  <SortAscendingOutlined className="text-xs" />
                  <span>Sắp xếp</span>
                </button>
              </Dropdown>

              <button
                type="button"
                onClick={fetchUsers}
                className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium h-9 flex items-center justify-center gap-1 rounded-xl transition-all"
              >
                <ReloadOutlined className="text-xs" />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body: Table or Grid View */}
        {activeViewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '24', '50'],
              showTotal: (total, range) => (
                <span className="text-xs text-slate-500">
                  Hiển thị {range[0]}-{range[1]} trên {total} người dùng
                </span>
              ),
            }}
            rowKey="id"
            className="custom-table"
          />
        ) : (
          <div className="p-4">
            <UserGridView
              users={filteredUsers}
              totalCount={filteredUsers.length}
              gridPage={gridPage}
              gridPageSize={gridPageSize}
              setGridPage={setGridPage}
              setGridPageSize={setGridPageSize}
              onEdit={(rec) => handleOpenModal('edit', rec)}
              onRestore={handleRestore}
              onSoftDelete={handleSoftDelete}
              onPermanentDelete={handlePermanentDelete}
            />
          </div>
        )}
      </Card>

      {/* User Add / Edit Modal Component */}
      <UserModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        form={form}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleModalOk}
        roles={roles}
        departments={departments}
        loading={loading}
      />

      {/* Custom Styles */}
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
        .dark .custom-table .ant-table-thead > tr > th {
          background: #1e293b !important;
          color: #f8fafc !important;
          border-bottom: 1px solid #334155 !important;
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 14px 16px !important;
        }
        .dark .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #1e293b !important;
          color: #cbd5e1 !important;
        }
        .dark .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #1e293b !important;
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
