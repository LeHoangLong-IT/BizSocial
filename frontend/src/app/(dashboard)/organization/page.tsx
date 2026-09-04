"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Tabs,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  App,
  Spin,
  Row,
  Col,
  Avatar,
  Badge,
  Tooltip,
  Empty,
  Segmented,
} from 'antd';
import {
  TeamOutlined,
  ApartmentOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CrownOutlined,
  BranchesOutlined,
  BankOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  DownOutlined,
  RightOutlined,
  MailOutlined,
  PhoneOutlined,
  AppstoreOutlined,
  EyeOutlined,
  HistoryOutlined,
  SearchOutlined,
  FilterOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const { Title } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RoleInfo {
  name: string;
}

interface TransferLogItem {
  id: number;
  userId: number;
  user?: { id: number; name: string; email: string; role?: { id: number; name: string } };
  fromDeptId: number | null;
  fromDeptName: string | null;
  toDeptId: number | null;
  toDeptName: string | null;
  fromTeamId: number | null;
  fromTeamName: string | null;
  toTeamId: number | null;
  toTeamName: string | null;
  reason: string | null;
  changedById: number | null;
  changedByName: string | null;
  createdAt: string;
}

interface MemberItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  teamId?: number | null;
  departmentId?: number | null;
  role?: RoleInfo;
}

interface TeamItem {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
  leaderId?: number | null;
  leader?: MemberItem | null;
  users?: MemberItem[];
  _count?: { users: number };
}

interface DepartmentItem {
  id: number;
  name: string;
  description?: string;
  managerId?: number | null;
  manager?: MemberItem | null;
  teams: TeamItem[];
  users: MemberItem[];
  _count?: { teams: number; users: number };
}

interface OrgStats {
  totalDepartments: number;
  totalTeams: number;
  totalUsers: number;
  assignedUsers: number;
  unassignedUsers: number;
  totalLeaders: number;
}

const DEPT_COLORS: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  Finance: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconBg: 'bg-emerald-500' },
  Sales: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-500' },
  HR: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', iconBg: 'bg-purple-500' },
  IT: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', iconBg: 'bg-indigo-500' },
  Social: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', iconBg: 'bg-sky-500' },
};

export default function OrganizationPage() {
  const { message } = App.useApp();
  const { token, canDoAction } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chart');
  const [treeViewMode, setTreeViewMode] = useState<'tree' | 'cards'>('tree');

  // Dữ liệu từ Backend
  const [stats, setStats] = useState<OrgStats>({
    totalDepartments: 0,
    totalTeams: 0,
    totalUsers: 0,
    assignedUsers: 0,
    unassignedUsers: 0,
    totalLeaders: 0,
  });
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [allUsers, setAllUsers] = useState<MemberItem[]>([]);

  // Trạng thái đóng/mở từng nhánh phòng ban trên sơ đồ cây
  const [expandedDepts, setExpandedDepts] = useState<Record<number, boolean>>({});

  // Modals
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);
  const [preselectedDeptId, setPreselectedDeptId] = useState<number | null>(null);

  // Modal Chi Tiết Phòng Ban & Đội Nhóm (UX gom nhóm riêng biệt)
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDeptDetail, setSelectedDeptDetail] = useState<DepartmentItem | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'teams' | 'members'>('teams');

  const handleOpenDetailModal = (dept: DepartmentItem, initialTab: 'teams' | 'members' = 'teams') => {
    setSelectedDeptDetail(dept);
    setDetailModalTab(initialTab);
    setDetailModalOpen(true);
  };

  // Drawer xem thành viên
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerMembers, setDrawerMembers] = useState<MemberItem[]>([]);

  // Modal điều chuyển nhân sự
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedUserForTransfer, setSelectedUserForTransfer] = useState<MemberItem | null>(null);

  // Bộ lọc & Tìm kiếm nhân sự / phòng ban
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDeptId, setFilterDeptId] = useState<number | 'ALL'>('ALL');
  const [filterLeaderStatus, setFilterLeaderStatus] = useState<'ALL' | 'NO_MANAGER' | 'NO_LEADER'>('ALL');

  // Modal Nhật ký Lịch sử Điều chuyển (Transfer Audit Log)
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [transferLogs, setTransferLogs] = useState<TransferLogItem[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const [deptForm] = Form.useForm();
  const [teamForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  const canCreate = canDoAction('Department', 'CREATE');
  const canUpdate = canDoAction('Department', 'UPDATE');
  const canDelete = canDoAction('Department', 'DELETE');

  const fetchTransferLogs = async () => {
    setLogLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/organization/transfer-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransferLogs(res.data || []);
    } catch (err: any) {
      console.error('Fetch transfer logs error:', err);
      message.error(err.response?.data?.message || 'Không thể tải nhật ký điều chuyển!');
    } finally {
      setLogLoading(false);
    }
  };

  const handleOpenLogModal = () => {
    setLogModalOpen(true);
    fetchTransferLogs();
  };

  // Lấy dữ liệu tổ chức từ Backend
  const fetchOrgData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/organization/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.stats || {});
      setDepartments(res.data.departments || []);
      setAllUsers(res.data.allUsers || []);

      // Mặc định mở rộng tất cả các phòng ban trên cây
      const initialExpanded: Record<number, boolean> = {};
      (res.data.departments || []).forEach((d: DepartmentItem) => {
        initialExpanded[d.id] = true;
      });
      setExpandedDepts(initialExpanded);
    } catch (err: any) {
      console.error('Fetch organization error:', err);
      message.error(err.response?.data?.message || 'Không thể tải dữ liệu Cơ cấu Tổ chức!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, [token]);

  useEffect(() => {
    if (selectedDeptDetail) {
      const updated = departments.find((d) => d.id === selectedDeptDetail.id);
      if (updated) setSelectedDeptDetail(updated);
    }
  }, [departments]);

  // Bộ lọc & Tìm kiếm nhân sự / phòng ban thời gian thực
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      // 1. Lọc theo Phòng ban cụ thể
      if (filterDeptId !== 'ALL' && dept.id !== filterDeptId) {
        return false;
      }

      // 2. Lọc theo trạng thái Lãnh đạo
      if (filterLeaderStatus === 'NO_MANAGER' && dept.managerId) {
        return false;
      }
      if (filterLeaderStatus === 'NO_LEADER' && !dept.teams.some((t) => !t.leaderId)) {
        return false;
      }

      // 3. Lọc theo Từ khóa tìm kiếm (Tên phòng, mô tả, Trưởng phòng, Đội nhóm, Thành viên)
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchDeptName = dept.name.toLowerCase().includes(kw);
        const matchDeptDesc = (dept.description || '').toLowerCase().includes(kw);
        const matchManager = (dept.manager?.name || '').toLowerCase().includes(kw) || (dept.manager?.email || '').toLowerCase().includes(kw);
        const matchTeam = dept.teams.some(
          (t) =>
            t.name.toLowerCase().includes(kw) ||
            (t.description || '').toLowerCase().includes(kw) ||
            (t.leader?.name || '').toLowerCase().includes(kw)
        );
        const matchMember = dept.users.some(
          (u) =>
            u.name.toLowerCase().includes(kw) ||
            u.email.toLowerCase().includes(kw) ||
            (u.phone || '').includes(kw)
        );

        if (!matchDeptName && !matchDeptDesc && !matchManager && !matchTeam && !matchMember) {
          return false;
        }
      }

      return true;
    });
  }, [departments, filterDeptId, filterLeaderStatus, searchKeyword]);

  // Toggle mở rộng nhánh phòng ban
  const toggleDeptExpand = (deptId: number) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [deptId]: !prev[deptId],
    }));
  };

  // Mở modal Thêm/Sửa Phòng ban
  const handleOpenDeptModal = (dept?: DepartmentItem) => {
    if (dept) {
      setEditingDept(dept);
      deptForm.setFieldsValue({
        name: dept.name,
        description: dept.description,
        managerId: dept.managerId,
      });
    } else {
      setEditingDept(null);
      deptForm.resetFields();
    }
    setDeptModalOpen(true);
  };

  // Submit Phòng ban
  const handleSubmitDept = async () => {
    try {
      const values = await deptForm.validateFields();
      if (editingDept) {
        await axios.put(
          `${API_BASE}/organization/departments/${editingDept.id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success(`Cập nhật phòng ban '${values.name}' thành công!`);
      } else {
        await axios.post(`${API_BASE}/organization/departments`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success(`Tạo phòng ban '${values.name}' thành công!`);
      }
      setDeptModalOpen(false);
      fetchOrgData();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Lưu phòng ban thất bại!');
    }
  };

  // Xóa Phòng ban
  const handleDeleteDept = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/organization/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Đã xóa phòng ban thành công!');
      fetchOrgData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa phòng ban thất bại!');
    }
  };

  // Mở modal Thêm/Sửa Team
  const handleOpenTeamModal = (team?: TeamItem, deptId?: number) => {
    if (team) {
      setEditingTeam(team);
      teamForm.setFieldsValue({
        name: team.name,
        departmentId: team.departmentId,
        description: team.description,
        leaderId: team.leaderId,
      });
    } else {
      setEditingTeam(null);
      teamForm.resetFields();
      if (deptId) {
        teamForm.setFieldsValue({ departmentId: deptId });
      }
    }
    setPreselectedDeptId(deptId || null);
    setTeamModalOpen(true);
  };

  // Submit Team
  const handleSubmitTeam = async () => {
    try {
      const values = await teamForm.validateFields();
      if (editingTeam) {
        await axios.put(`${API_BASE}/organization/teams/${editingTeam.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success(`Cập nhật đội nhóm '${values.name}' thành công!`);
      } else {
        await axios.post(`${API_BASE}/organization/teams`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success(`Tạo đội nhóm '${values.name}' thành công!`);
      }
      setTeamModalOpen(false);
      fetchOrgData();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Lưu đội nhóm thất bại!');
    }
  };

  // Xóa Team
  const handleDeleteTeam = async (id: number) => {
    try {
      await axios.delete(`${API_BASE}/organization/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Đã xóa đội nhóm thành công!');
      fetchOrgData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Xóa đội nhóm thất bại!');
    }
  };

  // Xem thành viên trong Drawer
  const handleViewMembers = (title: string, members: MemberItem[]) => {
    setDrawerTitle(title);
    setDrawerMembers(members);
    setMemberDrawerOpen(true);
  };

  // Mở modal điều chuyển nhân sự
  const handleOpenTransferModal = (user: MemberItem) => {
    setSelectedUserForTransfer(user);
    transferForm.setFieldsValue({
      departmentId: user.departmentId || undefined,
      teamId: user.teamId || undefined,
      reason: '',
    });
    setTransferModalOpen(true);
  };

  // Submit điều chuyển nhân sự
  const handleSubmitTransfer = async () => {
    if (!selectedUserForTransfer) return;
    try {
      const values = await transferForm.validateFields();
      await axios.post(
        `${API_BASE}/organization/transfer-member`,
        {
          userId: selectedUserForTransfer.id,
          departmentId: values.departmentId || null,
          teamId: values.teamId || null,
          reason: values.reason || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(`Đã điều chuyển nhân sự '${selectedUserForTransfer.name}' thành công!`);
      setTransferModalOpen(false);
      fetchOrgData();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.message || 'Điều chuyển nhân sự thất bại!');
    }
  };

  // Cột cho bảng Quản lý Phòng ban phẳng (Tab 2) - Tối ưu UX/UI không lồng bảng
  const departmentTableColumns = [
    {
      title: 'Tên Phòng Ban',
      dataIndex: 'name',
      key: 'name',
      width: '28%',
      render: (name: string, record: DepartmentItem) => {
        return (
          <div
            className="py-1 cursor-pointer group"
            onClick={() => handleOpenDetailModal(record, 'teams')}
          >
            <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors block">
              {name}
            </span>
            <p className="text-[11px] text-slate-400 m-0 line-clamp-1 mt-0.5 group-hover:text-slate-500">
              {record.description || 'Chưa có mô tả chức năng'}
            </p>
          </div>
        );
      },
    },
    {
      title: 'Trưởng Phòng (Manager)',
      key: 'manager',
      width: '24%',
      render: (_: any, record: DepartmentItem) => {
        if (!record.manager) {
          return <span className="text-xs text-slate-400 italic">Chưa bổ nhiệm</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar size="small" icon={<UserOutlined />} className="bg-blue-600 text-white" />
            <div>
              <span className="font-semibold text-xs text-slate-800 flex items-center gap-1">
                {record.manager.name}
                <CrownOutlined className="text-amber-500 text-[10px]" />
              </span>
              <span className="text-[10px] text-slate-400 block">{record.manager.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Đội Nhóm Trực Thuộc',
      key: 'teamsCount',
      width: '18%',
      render: (_: any, record: DepartmentItem) => (
        <Tooltip title="Nhấp để xem chi tiết các đội nhóm">
          <Badge
            count={`${record.teams.length} teams`}
            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => handleOpenDetailModal(record, 'teams')}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Quy Mô Nhân Sự',
      key: 'membersCount',
      width: '16%',
      render: (_: any, record: DepartmentItem) => (
        <Tooltip title="Nhấp để xem danh sách nhân sự phòng ban">
          <Badge
            count={`${record.users.length} nhân sự`}
            style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => handleOpenDetailModal(record, 'members')}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: '14%',
      align: 'right' as const,
      render: (_: any, record: DepartmentItem) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết phòng ban & đội nhóm">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetailModal(record, 'teams')}
              className="text-xs text-blue-600 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa phòng ban">
            <Button
              size="small"
              icon={<EditOutlined />}
              disabled={!canUpdate}
              onClick={() => handleOpenDeptModal(record)}
              className="text-xs text-slate-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa phòng ban này?"
            description="Lưu ý: Chỉ xóa được khi phòng ban không còn nhân viên nào!"
            onConfirm={() => handleDeleteDept(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            disabled={!canDelete}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={!canDelete || record.users.length > 0}
              className="text-xs"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Header Actions (Căn 1 hàng duy nhất trên Mobile & Desktop) */}
      <div className="flex justify-between items-center gap-2 mb-2">
        <Title level={3} className="!mb-0 font-bold text-gray-800 text-base sm:text-2xl truncate">
          Cơ cấu Tổ chức
        </Title>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {canCreate && (
            <Tooltip title="Thêm phòng ban">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenDeptModal()}
                className="bg-[#1e293b] hover:bg-slate-700 border-0 font-medium h-8 text-xs px-2.5 sm:px-3 flex items-center justify-center"
              >
                <span className="hidden sm:inline">Thêm phòng ban</span>
              </Button>
            </Tooltip>
          )}
          {canCreate && (
            <Tooltip title="Thêm đội nhóm">
              <Button
                icon={<BranchesOutlined />}
                onClick={() => handleOpenTeamModal()}
                className="text-gray-600 font-medium h-8 px-2.5 sm:px-3 text-xs shadow-none border-gray-200 hover:text-blue-600 flex items-center justify-center"
              >
                <span className="hidden sm:inline">Thêm đội nhóm</span>
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Nhật ký điều chuyển">
            <Button
              icon={<HistoryOutlined />}
              onClick={handleOpenLogModal}
              className="text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 font-medium h-8 px-2.5 sm:px-3 text-xs shadow-none flex items-center justify-center"
            >
              <span className="hidden sm:inline">Nhật ký điều chuyển</span>
            </Button>
          </Tooltip>
          <Tooltip title="Tải lại dữ liệu">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrgData}
              className="text-gray-600 font-medium h-8 px-2.5 text-xs shadow-none border-gray-200 hover:text-blue-600 flex items-center justify-center"
            />
          </Tooltip>
        </div>
      </div>

      {/* 4 Thẻ KPI Chỉ số Tổ chức */}
      <div className="w-full overflow-hidden">
        <Row gutter={[10, 10]}>
          <Col xs={12} sm={12} md={6}>
            <Card className="rounded-2xl shadow-xs border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium m-0 truncate">Phòng Ban</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 m-0 mt-0.5 sm:mt-1">{stats.totalDepartments}</h2>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                    <CheckCircleOutlined /> Standard
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base sm:text-xl shadow-2xs shrink-0">
                  <BankOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={12} md={6}>
            <Card className="rounded-2xl shadow-xs border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium m-0 truncate">Đội Nhóm (Teams)</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 m-0 mt-0.5 sm:mt-1">{stats.totalTeams}</h2>
                  <span className="text-[10px] sm:text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                    <BranchesOutlined /> Multi-skill
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base sm:text-xl shadow-2xs shrink-0">
                  <ApartmentOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={12} md={6}>
            <Card className="rounded-2xl shadow-xs border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium m-0 truncate">Nhân Sự Phân Bổ</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 m-0 mt-0.5 sm:mt-1">
                    {stats.assignedUsers}/{stats.totalUsers}
                  </h2>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                    {stats.totalUsers > 0 ? Math.round((stats.assignedUsers / stats.totalUsers) * 100) : 0}% độ phủ
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base sm:text-xl shadow-2xs shrink-0">
                  <TeamOutlined />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={12} sm={12} md={6}>
            <Card className="rounded-2xl shadow-xs border border-slate-100 p-3 sm:p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium m-0 truncate">Lãnh Đạo</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 m-0 mt-0.5 sm:mt-1">{stats.totalLeaders}</h2>
                  <span className="text-[10px] sm:text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5 sm:mt-1 truncate">
                    <CrownOutlined /> Leaders
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base sm:text-xl shadow-2xs shrink-0">
                  <CrownOutlined />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Thanh Công Cụ Tìm Kiếm & Bộ Lọc Nâng Cao (Search & Filter Toolbar) */}
      <Card className="rounded-2xl shadow-xs border border-slate-100 p-2.5 sm:p-3 bg-white" styles={{ body: { padding: '12px 16px' } }}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
          {/* Ô tìm kiếm rộng rãi, tỉ lệ chuẩn */}
          <div className="w-full md:w-[380px] lg:w-[440px] shrink-0">
            <Input
              prefix={<SearchOutlined className="text-slate-400 mr-1.5 text-sm" />}
              placeholder="Tìm kiếm nhân sự, email, phòng ban, đội nhóm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              className="rounded-xl h-9 text-xs sm:text-sm border-slate-200 hover:border-blue-400 focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Nhóm Bộ Lọc Phòng Ban & Lãnh Đạo */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto justify-end">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              <Select
                value={filterDeptId}
                onChange={(val) => setFilterDeptId(val)}
                className="w-full sm:w-48 h-9 text-xs"
                options={[
                  { value: 'ALL', label: 'Tất cả phòng ban' },
                  ...departments.map((d) => ({ value: d.id, label: d.name })),
                ]}
              />

              <Select
                value={filterLeaderStatus}
                onChange={(val) => setFilterLeaderStatus(val)}
                className="w-full sm:w-52 h-9 text-xs"
                options={[
                  { value: 'ALL', label: 'Mọi trạng thái lãnh đạo' },
                  { value: 'NO_MANAGER', label: '⚠️ Khuyết Trưởng phòng' },
                  { value: 'NO_LEADER', label: '⚠️ Team khuyết Leader' },
                ]}
              />
            </div>

            {(searchKeyword || filterDeptId !== 'ALL' || filterLeaderStatus !== 'ALL') && (
              <Button
                onClick={() => {
                  setSearchKeyword('');
                  setFilterDeptId('ALL');
                  setFilterLeaderStatus('ALL');
                }}
                className="h-9 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-slate-200 w-full sm:w-auto shrink-0 font-medium"
              >
                Xóa lọc
              </Button>
            )}
          </div>
        </div>
      </Card>
      <br />
      {/* Tabs Chuyển đổi giữa Sơ đồ cây & Bảng danh sách */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="custom-matrix-tabs"
        items={[
          {
            key: 'chart',
            label: (
              <span className="flex items-center gap-1.5 px-0.5 sm:px-1 text-xs sm:text-sm">
                <ApartmentOutlined /> Sơ đồ Cây (Org Chart)
              </span>
            ),
          },
          {
            key: 'table',
            label: (
              <span className="flex items-center gap-1.5 px-0.5 sm:px-1 text-xs sm:text-sm">
                <TeamOutlined /> Danh sách PB & Teams ({filteredDepartments.length})
              </span>
            ),
          },
        ]}
      />

      {loading ? (
        <Card className="rounded-2xl shadow-xs border border-slate-100 p-12 text-center">
          <Spin size="large" description="Đang tải dữ liệu cơ cấu tổ chức..." />
        </Card>
      ) : activeTab === 'chart' ? (
        /* TAB 1: SƠ ĐỒ CÂY PHÂN CẤP & KHỐI THẺ TỔ CHỨC */
        <Card className="rounded-b-2xl shadow-xs border border-slate-100 p-3 sm:p-6 bg-slate-50/40 overflow-hidden" styles={{ body: { padding: '16px' } }}>
          {/* Thanh công cụ chuyển đổi Chế độ Xem */}
          <div className="flex justify-between items-center gap-2 mb-3 sm:mb-6 pb-2.5 sm:pb-4 border-b border-slate-200/80">
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0 flex items-center gap-1.5 sm:gap-2 truncate">
                {treeViewMode === 'tree' ? (
                  <>
                    <ApartmentOutlined className="text-blue-600 shrink-0" />
                    <span className="hidden sm:inline">Sơ đồ Cây Phân Cấp Tự Co Dãn</span>
                    <span className="sm:hidden">Sơ đồ Cây</span>
                  </>
                ) : (
                  <>
                    <AppstoreOutlined className="text-indigo-600 shrink-0" />
                    <span className="hidden sm:inline">Khối Thẻ Phòng Ban & Đội Nhóm</span>
                    <span className="sm:hidden">Khối Thẻ</span>
                  </>
                )}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 m-0 mt-0.5 hidden sm:block">
                {treeViewMode === 'tree'
                  ? 'Tự động căn giữa hoàn hảo và co dãn đường nối theo số lượng phòng ban & đội nhóm thực tế'
                  : 'Bố cục mở rộng trực quan, tự động điều chỉnh và hiển thị đầy đủ mọi đội nhóm'}
              </p>
            </div>
            <Segmented
              value={treeViewMode}
              onChange={(val) => setTreeViewMode(val as 'tree' | 'cards')}
              size="small"
              className="shrink-0 text-xs"
              options={[
                { label: 'Sơ đồ Cây', value: 'tree', icon: <ApartmentOutlined /> },
                { label: 'Khối Thẻ', value: 'cards', icon: <AppstoreOutlined /> },
              ]}
            />
          </div>

          {treeViewMode === 'tree' ? (
            /* CHẾ ĐỘ 1: SƠ ĐỒ CÂY PHÂN CẤP TỰ ĐỘNG CĂN GIỮA (SMART ADAPTIVE TREE) */
            <div className="flex flex-col items-center overflow-x-auto pb-6 w-full touch-pan-x min-h-[400px]">
              {/* Thẻ hướng dẫn vuốt ngang trên Mobile */}
              <div className="sm:hidden flex items-center justify-center gap-1.5 mb-3 text-[11px] text-slate-500 bg-slate-100/90 py-1 px-3 rounded-full mx-auto w-fit font-medium border border-slate-200/80 shadow-2xs">
                <span>👈</span> Vuốt ngang để xem sơ đồ <span>👉</span>
              </div>

              {/* TẦNG 0: ĐỈNH CÂY - BAN GIÁM ĐỐC */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs w-72 sm:w-80 text-center relative hover:shadow-md transition-all shrink-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-500 flex items-center justify-center mx-auto mb-2 text-lg shadow-2xs">
                  <CrownOutlined />
                </div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base m-0">Ban Giám Đốc (BOD)</h3>
                <p className="text-xs text-slate-400 m-0 mt-0.5">Falcon LLP • BizSocial ERP Hub</p>
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-around text-xs">
                  <span className="text-slate-600 font-semibold">{departments.length} Khối / Phòng</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-semibold">{stats.totalUsers} Thành viên</span>
                </div>
              </div>

              {/* Dòng liên kết dọc từ BOD */}
              <div className="w-0.5 h-6 bg-slate-300"></div>

              {/* HÀNG CÁC PHÒNG BAN: TỰ ĐỘNG CĂN GIỮA VỚI ĐƯỜNG NỐI CHUẨN ORG-CHART */}
              {filteredDepartments.length === 0 ? (
                <div className="py-12 text-center w-full">
                  <Empty description="Không tìm thấy phòng ban hay nhân sự nào khớp với bộ lọc" />
                </div>
              ) : (
                <div className="org-tree-branches">
                  {filteredDepartments.map((dept) => {
                    const colorConf = DEPT_COLORS[dept.name] || {
                      bg: 'bg-slate-50',
                      border: 'border-slate-200',
                      text: 'text-slate-700',
                      iconBg: 'bg-slate-700',
                    };
                    const isExpanded = expandedDepts[dept.id] !== false;

                    return (
                      <div key={dept.id} className="org-branch">
                        {/* Đường nối dọc xuống Card phòng ban */}
                        <div className="org-branch-line-down"></div>

                        {/* Card Phòng Ban */}
                        <div
                          className={`bg-white border ${colorConf.border} rounded-2xl p-3.5 sm:p-4 shadow-xs w-[280px] xs:w-[310px] sm:w-[340px] max-w-[360px] relative hover:shadow-md transition-all text-left`}
                        >
                          {/* Header Phòng Ban */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${colorConf.bg} ${colorConf.text} border ${colorConf.border} flex items-center justify-center text-sm sm:text-base shadow-2xs shrink-0`}
                              >
                                <BankOutlined />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm m-0 truncate">{dept.name}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">PB #{dept.id}</span>
                              </div>
                            </div>

                            <Badge
                              count={`${dept.users.length} Nhân sự`}
                              style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600, fontSize: '10px' }}
                            />
                          </div>

                          {/* Mô tả */}
                          <p className="text-[11px] text-slate-500 m-0 mt-2 leading-relaxed line-clamp-2">
                            {dept.description || 'Phòng ban chức năng trực thuộc khối vận hành.'}
                          </p>

                          {/* Trưởng phòng phụ trách */}
                          <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar size={24} icon={<UserOutlined />} className="bg-blue-600 text-white shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-slate-800 truncate block">
                                  {dept.manager?.name || 'Chưa bổ nhiệm'}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {dept.manager ? 'Trưởng phòng' : 'Đang trống'}
                                </span>
                              </div>
                            </div>
                            {dept.manager && <CrownOutlined className="text-amber-500 text-xs shrink-0" />}
                          </div>

                          {/* Footer: Danh sách Team & Toggle */}
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <Button
                              type="link"
                              size="small"
                              className="text-xs p-0 text-slate-600 hover:text-blue-600"
                              onClick={() => handleViewMembers(`Nhân sự Phòng ${dept.name}`, dept.users)}
                            >
                              {dept.users.length} thành viên
                            </Button>

                            <Button
                              type="text"
                              size="small"
                              icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                              onClick={() => toggleDeptExpand(dept.id)}
                              className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                            >
                              {dept.teams.length} Teams
                            </Button>
                          </div>
                        </div>

                        {/* TẦNG 2: CÁC ĐỘI NHÓM TRỰC THUỘC (TỰ ĐIỀU CHỈNH THEO SỐ LƯỢNG TEAM) */}
                        {isExpanded && (
                          <div className="flex flex-col items-center w-[280px] xs:w-[310px] sm:w-[340px] max-w-[360px] mt-2">
                            {/* Đường nối dọc từ phòng ban xuống teams */}
                            <div className="w-0.5 h-3.5 bg-slate-300 mb-2"></div>

                            {dept.teams.length === 0 ? (
                              <div className="w-full text-center py-2.5 px-3 border border-dashed border-slate-200 rounded-xl bg-white text-[11px] text-slate-400">
                                Chưa có Team trực thuộc.{' '}
                                {canCreate && (
                                  <Button
                                    type="link"
                                    size="small"
                                    className="text-[11px] p-0 text-blue-600 font-medium"
                                    onClick={() => handleOpenTeamModal(undefined, dept.id)}
                                  >
                                    + Thêm team
                                  </Button>
                                )}
                              </div>
                            ) : dept.teams.length === 1 ? (
                              /* Khi có 1 team: Thẻ full-width cân đối */
                              <div className="w-full bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all text-left">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                                    <BranchesOutlined className="text-indigo-500 text-xs" />
                                    {dept.teams[0].name}
                                  </span>
                                  <Badge
                                    count={`${dept.teams[0].users?.length || 0}`}
                                    style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                                  />
                                </div>
                                <p className="text-[10px] text-slate-400 m-0 mt-1 line-clamp-1">{dept.teams[0].description || 'Đội nhóm chuyên môn'}</p>
                                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                  <span className="truncate max-w-[150px]">Leader: <strong className="text-slate-700">{dept.teams[0].leader?.name || 'Trống'}</strong></span>
                                  <Button
                                    type="link"
                                    size="small"
                                    className="text-[10px] p-0 text-blue-600 shrink-0"
                                    onClick={() => handleViewMembers(`Thành viên ${dept.teams[0].name}`, dept.teams[0].users || [])}
                                  >
                                    Xem
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              /* Khi có 2+ teams: Tự động dàn đều Lưới 2 Cột Mini gọn gàng, không bị kéo dài chiều dọc */
                              <div className="grid grid-cols-2 gap-2 w-full">
                                {dept.teams.map((team) => (
                                  <div
                                    key={team.id}
                                    className="bg-white border border-slate-200/80 rounded-xl p-2 sm:p-2.5 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between text-left"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-semibold text-[11px] sm:text-xs text-slate-800 flex items-center gap-1 truncate" title={team.name}>
                                          <BranchesOutlined className="text-indigo-500 text-xs shrink-0" />
                                          <span className="truncate">{team.name}</span>
                                        </span>
                                        <Badge
                                          count={team.users?.length || 0}
                                          style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '9px' }}
                                        />
                                      </div>
                                      <p className="text-[10px] text-slate-400 m-0 mt-1 line-clamp-1">{team.description || 'Đội nhóm chuyên môn'}</p>
                                    </div>

                                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                      <span className="truncate max-w-[80px] sm:max-w-[95px]" title={team.leader?.name}>
                                        {team.leader?.name || 'Trống'}
                                      </span>
                                      <Button
                                        type="link"
                                        size="small"
                                        className="text-[10px] p-0 text-blue-600 font-medium h-auto shrink-0"
                                        onClick={() => handleViewMembers(`Thành viên ${team.name}`, team.users || [])}
                                      >
                                        Xem
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : filteredDepartments.length === 0 ? (
            /* CHẾ ĐỘ 2: KHỐI THẺ TỔ CHỨC ĐA CỘT (MODERN CARD MATRIX) */
            <div className="py-12 text-center w-full bg-white rounded-2xl border border-dashed border-slate-200">
              <Empty description="Không tìm thấy phòng ban hay nhân sự nào khớp với bộ lọc" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredDepartments.map((dept) => {
                const colorConf = DEPT_COLORS[dept.name] || {
                  bg: 'bg-slate-50',
                  border: 'border-slate-200',
                  text: 'text-slate-700',
                  iconBg: 'bg-slate-700',
                };

                return (
                  <Card
                    key={dept.id}
                    className="rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-md transition-all overflow-hidden bg-white"
                    styles={{ body: { padding: '16px' } }}
                  >
                    {/* Header Phòng Ban */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${colorConf.bg} ${colorConf.text} border ${colorConf.border} flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0`}>
                          <BankOutlined />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base m-0 truncate">{dept.name}</h3>
                            <Tag color="blue" className="text-[10px] m-0 font-semibold px-1.5">{dept.teams.length} Teams</Tag>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-400 m-0 mt-0.5 line-clamp-1">{dept.description || 'Phòng ban chức năng'}</p>
                        </div>
                      </div>

                      <Space size={4} className="shrink-0">
                        {canCreate && (
                          <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenTeamModal(undefined, dept.id)}
                            className="text-xs text-blue-600 border-blue-200 h-7 px-2"
                          >
                            <span className="hidden sm:inline">Team</span>
                          </Button>
                        )}
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          disabled={!canUpdate}
                          onClick={() => handleOpenDeptModal(dept)}
                          className="text-xs text-slate-600 h-7 px-2"
                        />
                      </Space>
                    </div>

                    {/* Trưởng phòng & Nhân sự */}
                    <div className="my-3 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar size={28} icon={<UserOutlined />} className="bg-blue-600 text-white font-bold shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1 truncate">
                            {dept.manager?.name || 'Chưa bổ nhiệm'}
                            {dept.manager && <CrownOutlined className="text-amber-500 text-xs shrink-0" />}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                            {dept.manager?.email || 'Đang khuyết vị trí Trưởng phòng'}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="link"
                        size="small"
                        className="text-xs text-blue-600 p-0 font-semibold shrink-0"
                        onClick={() => handleViewMembers(`Nhân sự Phòng ${dept.name}`, dept.users)}
                      >
                        {dept.users.length} nhân sự →
                      </Button>
                    </div>

                    {/* Danh sách các Đội nhóm trực thuộc */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Đội nhóm trực thuộc ({dept.teams.length})
                        </span>
                      </div>

                      {dept.teams.length === 0 ? (
                        <div className="py-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          Chưa có đội nhóm nào.{' '}
                          {canCreate && (
                            <Button
                              type="link"
                              size="small"
                              className="text-xs p-0 text-blue-600 font-medium"
                              onClick={() => handleOpenTeamModal(undefined, dept.id)}
                            >
                              Tạo team ngay
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {dept.teams.map((team) => (
                            <div
                              key={team.id}
                              className="p-2.5 sm:p-3 rounded-xl border border-slate-200/80 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 truncate">
                                    <BranchesOutlined className="text-indigo-500 text-xs shrink-0" />
                                    <span className="truncate">{team.name}</span>
                                  </span>
                                  <Badge
                                    count={`${team.users?.length || 0}`}
                                    style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '9px' }}
                                  />
                                </div>
                                <p className="text-[10px] text-slate-400 m-0 mt-1 line-clamp-1">{team.description || 'Chưa có mô tả'}</p>
                              </div>

                              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 truncate max-w-[110px] sm:max-w-[130px]">
                                  <Avatar size={18} icon={<UserOutlined />} className="bg-amber-500 text-white shrink-0" />
                                  <span className="text-[10px] sm:text-[11px] text-slate-600 truncate">{team.leader?.name || 'Trống'}</span>
                                </div>

                                <Button
                                  type="link"
                                  size="small"
                                  className="text-[10px] sm:text-[11px] p-0 text-blue-600 shrink-0 font-medium"
                                  onClick={() => handleViewMembers(`Thành viên ${team.name}`, team.users || [])}
                                >
                                  Chi tiết
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      ) : (
        /* TAB 2: QUẢN LÝ PHÒNG BAN & ĐỘI NHÓM */
        <Card className="rounded-b-2xl shadow-xs border border-slate-100 p-3 sm:p-0 overflow-hidden bg-white">
          {/* View 1: Mobile Card List (block sm:hidden) */}
          <div className="block sm:hidden space-y-3">
            {filteredDepartments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Empty description="Không tìm thấy phòng ban nào" />
              </div>
            ) : (
              filteredDepartments.map((dept) => {
                const colorConf = DEPT_COLORS[dept.name] || {
                  bg: 'bg-slate-50',
                  border: 'border-slate-200',
                  text: 'text-slate-700',
                };

                return (
                  <div
                    key={dept.id}
                    className="p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-3"
                  >
                    {/* Header: Icon, Tên PB & Thao tác */}
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl ${colorConf.bg} ${colorConf.text} border ${colorConf.border} flex items-center justify-center text-base shadow-2xs shrink-0`}
                        >
                          <BankOutlined />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm m-0 truncate">{dept.name}</h4>
                          <p className="text-[11px] text-slate-400 m-0 line-clamp-1">{dept.description || 'Chưa có mô tả'}</p>
                        </div>
                      </div>

                      <Space size={4} className="shrink-0">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleOpenDetailModal(dept, 'teams')}
                          className="text-xs text-blue-600 border-blue-200 h-7 px-2"
                        />
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          disabled={!canUpdate}
                          onClick={() => handleOpenDeptModal(dept)}
                          className="text-xs text-slate-600 h-7 px-2"
                        />
                        <Popconfirm
                          title="Xóa phòng ban này?"
                          description="Lưu ý: Chỉ xóa khi phòng ban không còn nhân viên!"
                          onConfirm={() => handleDeleteDept(dept.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                          disabled={!canDelete}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={!canDelete || dept.users.length > 0}
                            className="text-xs h-7 px-2"
                          />
                        </Popconfirm>
                      </Space>
                    </div>

                    {/* Trưởng phòng (Manager) */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar size={26} icon={<UserOutlined />} className="bg-blue-600 text-white shrink-0 font-bold" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 text-xs flex items-center gap-1 truncate">
                            {dept.manager?.name || 'Chưa bổ nhiệm'}
                            {dept.manager && <CrownOutlined className="text-amber-500 text-xs shrink-0" />}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">{dept.manager?.email || 'Đang khuyết vị trí Trưởng phòng'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Teams & Members Badges */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <Badge
                        count={`${dept.teams.length} teams`}
                        style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600, cursor: 'pointer', fontSize: '11px' }}
                        onClick={() => handleOpenDetailModal(dept, 'teams')}
                      />

                      <Badge
                        count={`${dept.users.length} nhân sự`}
                        style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: '11px' }}
                        onClick={() => handleOpenDetailModal(dept, 'members')}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* View 2: Desktop Table View (hidden sm:block) */}
          <div className="hidden sm:block w-full overflow-x-auto">
            <Table
              columns={departmentTableColumns}
              dataSource={filteredDepartments}
              rowKey="id"
              pagination={false}
              className="custom-matrix-table min-w-[650px]"
            />
          </div>
        </Card>
      )}

      {/* Modal Chi Tiết Phòng Ban & Đội Nhóm Riêng Biệt (UX/UI Premium) */}
      <Modal
        title={null}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={840}
        centered
        destroyOnHidden
        styles={{
          content: { padding: '16px 18px' },
          body: { padding: 0 },
        }}
      >
        {selectedDeptDetail && (
          <div>
            {/* Header Hồ Sơ Phòng Ban */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b border-slate-100">
              <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${(DEPT_COLORS[selectedDeptDetail.name] || DEPT_COLORS.Social).bg
                    } ${(DEPT_COLORS[selectedDeptDetail.name] || DEPT_COLORS.Social).text
                    } border ${(DEPT_COLORS[selectedDeptDetail.name] || DEPT_COLORS.Social).border
                    } flex items-center justify-center text-xl sm:text-2xl shadow-xs shrink-0 mt-0.5 sm:mt-0`}
                >
                  <BankOutlined />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg m-0 truncate">{selectedDeptDetail.name}</h3>
                    <Tag color="blue" className="text-[10px] sm:text-xs font-semibold m-0 px-1.5">
                      Mã: PB#{selectedDeptDetail.id}
                    </Tag>
                  </div>
                  <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed max-w-full sm:max-w-xl line-clamp-2 sm:line-clamp-none">
                    {selectedDeptDetail.description || 'Chưa có mô tả chức năng cho phòng ban này.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                {canCreate && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenTeamModal(undefined, selectedDeptDetail.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-xs font-medium h-8 flex-1 sm:flex-none justify-center"
                  >
                    Thêm Team
                  </Button>
                )}
                <Button
                  icon={<EditOutlined />}
                  disabled={!canUpdate}
                  onClick={() => {
                    handleOpenDeptModal(selectedDeptDetail);
                  }}
                  className="text-xs text-slate-600 h-8 flex-1 sm:flex-none justify-center"
                >
                  Cập nhật
                </Button>
              </div>
            </div>

            {/* Dải Thống Kê Nhanh & Lãnh Đạo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 my-3 sm:my-4">
              <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                <Avatar size={34} icon={<UserOutlined />} className="bg-blue-600 text-white shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                    {selectedDeptDetail.manager?.name || 'Chưa bổ nhiệm'}
                    {selectedDeptDetail.manager && <CrownOutlined className="text-amber-500 text-xs" />}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {selectedDeptDetail.manager?.email || 'Đang khuyết Trưởng phòng'}
                  </span>
                </div>
              </div>

              <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium truncate">Đội Nhóm</span>
                  <span className="text-xs sm:text-base font-extrabold text-blue-600 truncate block">{selectedDeptDetail.teams.length} teams</span>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs sm:text-sm shrink-0">
                  <BranchesOutlined />
                </div>
              </div>

              <div className="col-span-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium truncate">Nhân Sự</span>
                  <span className="text-xs sm:text-base font-extrabold text-emerald-600 truncate block">{selectedDeptDetail.users.length} nhân sự</span>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs sm:text-sm shrink-0">
                  <TeamOutlined />
                </div>
              </div>
            </div>

            {/* Tabs Nội Dung: Đội nhóm & Nhân sự */}
            <Tabs
              activeKey={detailModalTab}
              onChange={(key) => setDetailModalTab(key as 'teams' | 'members')}
              items={[
                {
                  key: 'teams',
                  label: (
                    <span className="flex items-center gap-1.5 px-0.5 sm:px-2 text-xs sm:text-sm font-medium">
                      <BranchesOutlined />
                      <span className="sm:hidden">Đội nhóm ({selectedDeptDetail.teams.length})</span>
                      <span className="hidden sm:inline">Đội Nhóm Trực Thuộc ({selectedDeptDetail.teams.length})</span>
                    </span>
                  ),
                  children: (
                    <div className="mt-2">
                      {selectedDeptDetail.teams.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <BranchesOutlined className="text-3xl text-slate-300 mb-2" />
                          <p className="text-sm font-semibold text-slate-600 m-0">Phòng ban này chưa có đội nhóm nào</p>
                          <p className="text-xs text-slate-400 m-0 mt-1 mb-3">Tạo các đội nhóm chuyên môn để phân công công việc hiệu quả hơn</p>
                          {canCreate && (
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => handleOpenTeamModal(undefined, selectedDeptDetail.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Tạo Đội Nhóm Đầu Tiên
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
                          {selectedDeptDetail.teams.map((team) => (
                            <div
                              key={team.id}
                              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 truncate">
                                    <BranchesOutlined className="text-indigo-500 text-xs" />
                                    {team.name}
                                  </span>
                                  <Badge
                                    count={`${team.users?.length || 0} Nhân sự`}
                                    style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '10px' }}
                                  />
                                </div>
                                <p className="text-[11px] text-slate-400 m-0 mt-1 line-clamp-2 leading-relaxed">
                                  {team.description || 'Chưa có mô tả nhiệm vụ chuyên môn.'}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-1.5">
                                <div className="flex items-center gap-1.5 truncate max-w-[110px] xs:max-w-[140px]">
                                  <Avatar size={18} icon={<UserOutlined />} className="bg-amber-500 text-white shrink-0" />
                                  <span className="text-[11px] text-slate-600 truncate font-medium">
                                    {team.leader?.name || 'Chưa có Leader'}
                                  </span>
                                </div>

                                <Space size={4} className="shrink-0">
                                  <Tooltip title={`Xem ${team.users?.length || 0} thành viên`}>
                                    <Button
                                      size="small"
                                      icon={<EyeOutlined />}
                                      className="text-[11px] px-2 h-7 text-blue-600 border-blue-200 hover:border-blue-400"
                                      onClick={() => handleViewMembers(`Thành viên Team: ${team.name}`, team.users || [])}
                                    />
                                  </Tooltip>
                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    disabled={!canUpdate}
                                    onClick={() => handleOpenTeamModal(team, selectedDeptDetail.id)}
                                    className="text-[11px] h-7 px-1.5 text-slate-600"
                                  />
                                  <Popconfirm
                                    title="Xóa đội nhóm này?"
                                    onConfirm={() => handleDeleteTeam(team.id)}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                    disabled={!canDelete}
                                  >
                                    <Button size="small" danger icon={<DeleteOutlined />} disabled={!canDelete} className="text-[11px] h-7 px-1.5" />
                                  </Popconfirm>
                                </Space>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'members',
                  label: (
                    <span className="flex items-center gap-1.5 px-0.5 sm:px-2 text-xs sm:text-sm font-medium">
                      <TeamOutlined />
                      <span className="sm:hidden">Nhân sự ({selectedDeptDetail.users.length})</span>
                      <span className="hidden sm:inline">Nhân Sự Phòng Ban ({selectedDeptDetail.users.length})</span>
                    </span>
                  ),
                  children: (
                    <div className="mt-2 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                      {selectedDeptDetail.users.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <TeamOutlined className="text-3xl text-slate-300 mb-2" />
                          <p className="text-sm font-semibold text-slate-600 m-0">Phòng ban này hiện chưa có nhân sự nào</p>
                          <p className="text-xs text-slate-400 m-0 mt-1">Điều chuyển nhân sự từ trang Quản lý User vào phòng ban này</p>
                        </div>
                      ) : (
                        selectedDeptDetail.users.map((member) => {
                          const memberTeam = selectedDeptDetail.teams.find((t) => t.id === member.teamId);
                          return (
                            <div
                              key={member.id}
                              className="p-3 bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-blue-200 transition-all rounded-xl flex items-start gap-3 shadow-2xs"
                            >
                              {/* Cột 1: Avatar */}
                              <Avatar size={40} icon={<UserOutlined />} className="bg-slate-800 text-white font-bold shrink-0 mt-0.5" />

                              {/* Cột 2: Khối thông tin 3 hàng */}
                              <div className="min-w-0 flex-1 space-y-1">
                                {/* Hàng 1: Tên & Chức vụ + Team (trái) + Nút Chuyển giữ mỗi Icon (phải) */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">{member.name}</span>
                                    {member.role && (
                                      <Tag color="blue" className="text-[10px] m-0 font-medium border-0 bg-blue-50 text-blue-700 px-1.5 py-0 shrink-0">
                                        {member.role.name}
                                      </Tag>
                                    )}
                                    {memberTeam && (
                                      <Tag color="purple" className="text-[10px] m-0 font-medium border-0 bg-purple-50 text-purple-700 flex items-center gap-1 px-1.5 py-0 shrink-0">
                                        <BranchesOutlined /> {memberTeam.name}
                                      </Tag>
                                    )}
                                  </div>

                                  {canUpdate && (
                                    <Tooltip title="Điều chuyển nhân sự">
                                      <Button
                                        type="text"
                                        shape="circle"
                                        icon={<SwapOutlined className="text-blue-600 text-xs sm:text-sm" />}
                                        onClick={() => handleOpenTransferModal(member)}
                                        className="hover:bg-blue-50 shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-slate-200/70 hover:border-blue-300 text-blue-600 shadow-2xs"
                                      />
                                    </Tooltip>
                                  )}
                                </div>

                                {/* Hàng 2: Gmail */}
                                <div className="text-[11px] sm:text-xs text-slate-500 truncate flex items-center gap-1.5">
                                  <MailOutlined className="text-slate-400 text-[11px] shrink-0" />
                                  <span className="truncate">{member.email}</span>
                                </div>

                                {/* Hàng 3: SĐT */}
                                <div className="text-[11px] sm:text-xs text-slate-500 font-mono truncate flex items-center gap-1.5">
                                  <PhoneOutlined className="text-slate-400 text-[11px] shrink-0" />
                                  <span>{member.phone || 'Chưa cập nhật SĐT'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal Thêm / Chỉnh Sửa Phòng Ban */}
      <Modal
        title={editingDept ? `Chỉnh sửa: ${editingDept.name}` : 'Thêm Phòng Ban Mới'}
        open={deptModalOpen}
        onCancel={() => setDeptModalOpen(false)}
        onOk={handleSubmitDept}
        okText="Lưu phòng ban"
        cancelText="Hủy"
        centered
        zIndex={1050}
      >
        <Form form={deptForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên phòng ban"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
          >
            <Input placeholder="Ví dụ: Marketing, R&D, Logistics..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chức năng">
            <Input.TextArea rows={3} placeholder="Nhiệm vụ trọng tâm và chức năng vận hành của phòng ban..." />
          </Form.Item>

          <Form.Item name="managerId" label="Chỉ định Trưởng phòng (Manager)">
            <Select
              allowClear
              showSearch
              placeholder="Chọn nhân sự làm Trưởng phòng"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={allUsers.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.email}) — ${u.role?.name || 'Nhân sự'}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Thêm / Chỉnh Sửa Đội Nhóm (Team) */}
      <Modal
        title={editingTeam ? `Chỉnh sửa: ${editingTeam.name}` : 'Thêm Đội Nhóm (Team) Mới'}
        open={teamModalOpen}
        onCancel={() => setTeamModalOpen(false)}
        onOk={handleSubmitTeam}
        okText="Lưu đội nhóm"
        cancelText="Hủy"
        centered
        zIndex={1050}
      >
        <Form form={teamForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Tên đội nhóm (Team)"
            rules={[{ required: true, message: 'Vui lòng nhập tên đội nhóm' }]}
          >
            <Input placeholder="Ví dụ: Creative Content, Media Buying, QA Team..." />
          </Form.Item>

          <Form.Item
            name="departmentId"
            label="Phòng ban trực thuộc"
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
          >
            <Select
              placeholder="Chọn phòng ban cha"
              disabled={!!preselectedDeptId && !editingTeam}
              options={departments.map((d) => ({
                value: d.id,
                label: d.name,
              }))}
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả nhiệm vụ của Team">
            <Input.TextArea rows={2} placeholder="Mô tả công việc chuyên môn của đội nhóm..." />
          </Form.Item>

          <Form.Item name="leaderId" label="Chỉ định Trưởng nhóm (Team Leader)">
            <Select
              allowClear
              showSearch
              placeholder="Chọn nhân sự làm Leader"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={allUsers.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.email}) — ${u.role?.name || 'Nhân sự'}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Danh Sách Thành Viên (Thay thế Drawer theo chuẩn UX/UI Mobile & Desktop) */}
      <Modal
        title={
          <div className="flex items-center justify-between pr-6 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center text-base sm:text-lg shadow-2xs shrink-0">
                <TeamOutlined />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base m-0 leading-tight truncate">
                  {drawerTitle}
                </h4>
                <div className="mt-1 flex items-center">
                  <Badge
                    count={`${drawerMembers.length} thành viên`}
                    style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600, fontSize: '10px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        }
        open={memberDrawerOpen}
        onCancel={() => setMemberDrawerOpen(false)}
        footer={null}
        width={540}
        centered
        destroyOnHidden
        zIndex={1050}
        styles={{
          content: { padding: '16px' },
          header: { marginBottom: '12px' },
          body: { padding: 0 },
        }}
      >
        {drawerMembers.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <TeamOutlined className="text-3xl text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600 m-0">Chưa có thành viên nào trong danh sách này</p>
            <p className="text-xs text-slate-400 m-0 mt-1">Điều chuyển nhân sự từ trang Quản lý User vào đây</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {drawerMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-blue-200 transition-all rounded-xl flex items-start gap-3 shadow-2xs"
                >
                  {/* Cột 1: Avatar */}
                  <Avatar size={40} icon={<UserOutlined />} className="bg-slate-800 text-white font-bold shrink-0 mt-0.5" />

                  {/* Cột 2: Khối thông tin 3 hàng */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Hàng 1: Tên & Chức vụ (trái) + Nút Chuyển giữ mỗi Icon (phải) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">{member.name}</span>
                        {member.role && (
                          <Tag color="blue" className="text-[10px] m-0 font-medium border-0 bg-blue-50 text-blue-700 px-1.5 py-0 shrink-0">
                            {member.role.name}
                          </Tag>
                        )}
                      </div>

                      {canUpdate && (
                        <Tooltip title="Điều chuyển nhân sự">
                          <Button
                            type="text"
                            shape="circle"
                            icon={<SwapOutlined className="text-blue-600 text-xs sm:text-sm" />}
                            onClick={() => handleOpenTransferModal(member)}
                            className="hover:bg-blue-50 shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-slate-200/70 hover:border-blue-300 text-blue-600 shadow-2xs"
                          />
                        </Tooltip>
                      )}
                    </div>

                    {/* Hàng 2: Gmail */}
                    <div className="text-[11px] sm:text-xs text-slate-500 truncate flex items-center gap-1.5">
                      <MailOutlined className="text-slate-400 text-[11px] shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>

                    {/* Hàng 3: SĐT */}
                    <div className="text-[11px] sm:text-xs text-slate-500 font-mono truncate flex items-center gap-1.5">
                      <PhoneOutlined className="text-slate-400 text-[11px] shrink-0" />
                      <span>{member.phone || 'Chưa cập nhật SĐT'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </Modal>

      {/* Modal Điều Chuyển Nhân Sự */}
      <Modal
        title={`Điều chuyển nhân sự: ${selectedUserForTransfer?.name}`}
        open={transferModalOpen}
        onCancel={() => setTransferModalOpen(false)}
        onOk={handleSubmitTransfer}
        okText="Xác nhận điều chuyển"
        cancelText="Hủy"
        centered
        zIndex={1060}
      >
        <Form form={transferForm} layout="vertical" className="mt-4">
          <Form.Item name="departmentId" label="Chuyển sang Phòng ban">
            <Select
              allowClear
              placeholder="Chọn phòng ban mới"
              options={departments.map((d) => ({
                value: d.id,
                label: d.name,
              }))}
              onChange={() => transferForm.setFieldsValue({ teamId: undefined })}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.departmentId !== currentValues.departmentId}
          >
            {({ getFieldValue }) => {
              const currentDeptId = getFieldValue('departmentId');
              const selectedDept = departments.find((d) => d.id === currentDeptId);
              const availableTeams = selectedDept ? selectedDept.teams : [];

              return (
                <Form.Item name="teamId" label="Chuyển sang Đội nhóm (Team)">
                  <Select
                    allowClear
                    placeholder={selectedDept ? 'Chọn team trực thuộc' : 'Vui lòng chọn phòng ban trước'}
                    disabled={!selectedDept || availableTeams.length === 0}
                    options={availableTeams.map((t) => ({
                      value: t.id,
                      label: t.name,
                    }))}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item name="reason" label="Lý do điều chuyển (Lưu vết Nhật ký Audit Log)">
            <Input.TextArea
              rows={2}
              placeholder="Ví dụ: Luân chuyển chuyên môn, hỗ trợ dự án mới, tái cơ cấu nhân sự..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Nhật Ký Lịch Sử Điều Chuyển Nhân Sự (Transfer Audit Log) */}
      <Modal
        title={
          <div className="flex items-center justify-between gap-3 pr-6 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center text-base shadow-2xs shrink-0">
                <HistoryOutlined />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base m-0 leading-tight truncate">Nhật Ký Điều Chuyển</h4>
                <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">Audit Log luân chuyển nhân sự giữa các phòng ban & đội nhóm</span>
              </div>
            </div>
            <Badge
              count={`${transferLogs.length} bản ghi`}
              style={{ backgroundColor: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff', fontWeight: 600 }}
              className="shrink-0"
            />
          </div>
        }
        open={logModalOpen}
        onCancel={() => setLogModalOpen(false)}
        footer={null}
        width={1020}
        centered
        destroyOnHidden
        styles={{ body: { padding: '12px 16px' } }}
      >
        {logLoading ? (
          <div className="py-16 text-center">
            <Spin size="large" description="Đang tải lịch sử điều chuyển..." />
          </div>
        ) : transferLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <HistoryOutlined className="text-3xl text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600 m-0">Chưa có bản ghi điều chuyển nào</p>
            <p className="text-xs text-slate-400 m-0 mt-1">Khi bạn thực hiện điều chuyển nhân sự, lịch sử chi tiết sẽ lưu tại đây</p>
          </div>
        ) : (
          <div>
            {/* Desktop View: Table Layout (Hiển thị từ md trở lên) */}
            <div className="hidden md:block max-h-[520px] overflow-y-auto w-full">
              <div className="overflow-x-auto w-full">
                <Table
                  dataSource={transferLogs}
                  rowKey="id"
                  pagination={{ pageSize: 6, size: 'small', showTotal: (t) => `Tổng ${t} bản ghi` }}
                  className="min-w-[700px]"
                  columns={[
                    {
                      title: 'Thời Gian',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      width: 110,
                      render: (val: string) => {
                        const d = new Date(val);
                        return (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {d.toLocaleDateString('vi-VN')}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      },
                    },
                    {
                      title: 'Nhân Sự',
                      key: 'user',
                      width: 190,
                      render: (_, item: TransferLogItem) => (
                        <div className="flex items-center gap-2.5">
                          <Avatar size={34} icon={<UserOutlined />} className="bg-slate-800 text-white shrink-0 font-bold" />
                          <div className="truncate min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{item.user?.name || `User #${item.userId}`}</div>
                            <div className="text-[11px] text-slate-400 truncate">{item.user?.email}</div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'Lộ Trình Điều Chuyển',
                      key: 'transferPath',
                      width: 230,
                      render: (_, item: TransferLogItem) => (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400 font-bold text-[10px] w-6 shrink-0">Từ:</span>
                            <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 truncate max-w-[190px]">
                              {item.fromDeptName || 'Chưa thuộc phòng ban'}{item.fromTeamName ? ` • ${item.fromTeamName}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-blue-600 font-bold text-[10px] w-6 shrink-0">Đến:</span>
                            <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[190px]">
                              {item.toDeptName || 'Chưa thuộc phòng ban'}{item.toTeamName ? ` • ${item.toTeamName}` : ''}
                            </span>
                          </div>
                        </div>
                      ),
                    },
                    {
                      title: 'Lý Do Điều Chuyển',
                      dataIndex: 'reason',
                      key: 'reason',
                      width: 270,
                      render: (val: string | null) => (
                        val ? (
                          <div className="bg-slate-50 border border-slate-200/70 rounded-lg px-3 py-1.5 text-xs text-slate-700 leading-relaxed">
                            <span className="italic font-normal">"{val}"</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">— Không ghi chú —</span>
                        )
                      ),
                    },
                    {
                      title: 'Người Thực Hiện',
                      dataIndex: 'changedByName',
                      key: 'changedByName',
                      width: 160,
                      render: (val: string | null) => (
                        <div className="flex items-center gap-2">
                          <Avatar size={24} className="bg-purple-100 text-purple-700 text-xs font-bold shrink-0">
                            {(val || 'Q')[0].toUpperCase()}
                          </Avatar>
                          <span className="text-xs font-medium text-slate-700 truncate" title={val || 'Quản trị viên'}>
                            {val || 'Quản trị viên'}
                          </span>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>

            {/* Mobile View: Clean Card List Layout (Hiển thị dưới md) */}
            <div className="block md:hidden max-h-[500px] overflow-y-auto space-y-3 pr-1">
              {transferLogs.map((item) => {
                const d = new Date(item.createdAt);
                const dateStr = d.toLocaleDateString('vi-VN');
                const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={item.id} className="p-3.5 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5 transition-all">
                    {/* Top Row: Date & Performer */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <ClockCircleOutlined className="text-slate-400 text-xs" />
                        <span className="font-bold text-slate-700">{dateStr}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{timeStr}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-purple-100 shrink-0">
                        <UserOutlined className="text-[10px]" />
                        <span className="truncate max-w-[110px]">{item.changedByName || 'Quản trị viên'}</span>
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="flex items-center gap-2.5">
                      <Avatar size={36} icon={<UserOutlined />} className="bg-slate-800 text-white shrink-0 font-bold" />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {item.user?.name || `User #${item.userId}`}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.user?.email || 'Chưa có email'}
                        </div>
                      </div>
                    </div>

                    {/* Transfer Route Card (Bố cục Timeline sành điệu) */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 space-y-2 shadow-2xs">
                      {/* Từ phòng ban */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded shrink-0">TỪ</span>
                        <span className="font-medium text-slate-700 truncate min-w-0">
                          {item.fromDeptName || 'Chưa thuộc phòng ban'}{item.fromTeamName ? ` • ${item.fromTeamName}` : ''}
                        </span>
                      </div>

                      {/* Mũi tên và nhãn Điều chuyển sang */}
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold pl-1">
                        <ArrowDownOutlined className="text-blue-500 text-[11px] animate-bounce" />
                        <span className="text-[11px] tracking-tight">Điều chuyển sang</span>
                      </div>

                      {/* Đến phòng ban */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0">ĐẾN</span>
                        <span className="font-bold text-blue-900 truncate min-w-0">
                          {item.toDeptName || 'Chưa thuộc phòng ban'}{item.toTeamName ? ` • ${item.toTeamName}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Reason note if present */}
                    {item.reason && (
                      <div className="text-xs text-slate-600 bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 leading-relaxed">
                        <span className="font-semibold text-amber-800 mr-1">Lý do:</span>
                        <span className="italic">"{item.reason}"</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Global CSS Style */}
      <style jsx global>{`
        .custom-matrix-tabs .ant-tabs-nav {
          margin-bottom: 0 !important;
        }
        .custom-matrix-tabs .ant-tabs-tab {
          border-radius: 12px 12px 0 0 !important;
          border: 1px solid #e2e8f0 !important;
          border-bottom: none !important;
          background: #f8fafc !important;
          transition: all 0.3s;
        }
        .custom-matrix-tabs .ant-tabs-tab-active {
          background: #ffffff !important;
          border-color: #cbd5e1 !important;
        }

        /* CSS chuẩn cho Cây Sơ Đồ Tổ Chức (Hierarchical Org Tree) */
        .org-tree-branches {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          position: relative;
          padding-top: 16px;
          max-width: 100%;
        }

        .org-branch {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 6px;
        }
        @media (min-width: 640px) {
          .org-branch {
            padding: 0 16px;
          }
        }

        .org-branch::before,
        .org-branch::after {
          content: '';
          position: absolute;
          top: 0;
          height: 2px;
          background-color: #cbd5e1;
        }

        .org-branch::before {
          left: 0;
          width: 50%;
        }

        .org-branch::after {
          right: 0;
          width: 50%;
        }

        /* Nhánh đầu tiên: ẩn nửa bên trái */
        .org-branch:first-child::before {
          display: none !important;
        }

        /* Nhánh cuối cùng: ẩn nửa bên phải */
        .org-branch:last-child::after {
          display: none !important;
        }

        /* Nếu chỉ có 1 nhánh duy nhất: ẩn cả hai nửa */
        .org-branch:only-child::before,
        .org-branch:only-child::after {
          display: none !important;
        }

        /* Đường nối dọc từ đường ngang xuống Card phòng ban */
        .org-branch-line-down {
          width: 2px;
          height: 20px;
          background-color: #cbd5e1;
          margin-bottom: 2px;
        }
      `}</style>
    </div>
  );
}
