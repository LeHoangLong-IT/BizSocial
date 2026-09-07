'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Checkbox,
  Button,
  Tag,
  Tabs,
  Input,
  Space,
  Tooltip,
  Typography,
  Badge,
  Spin,
  App,
  Row,
  Col,
  Statistic,
  Drawer,
  Avatar,
  List,
  Modal,
  Alert,
  Select,
  Form,
  Popconfirm,
  Popover,
} from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  SaveOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  TeamOutlined,
  SolutionOutlined,
  IdcardOutlined,
  BookOutlined,
  ApartmentOutlined,
  ShareAltOutlined,
  CustomerServiceOutlined,
  UserSwitchOutlined,
  LockOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  GlobalOutlined,
  UsergroupAddOutlined,
  AuditOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ResourceShareModal } from '@/components/common/ResourceShareModal';

const { Title, Text, Paragraph } = Typography;

// Định nghĩa 4 cấp độ Scope
const SCOPE_OPTIONS = [
  { value: 'PERSONAL', label: 'Cá nhân', color: 'blue' },
  { value: 'TEAM', label: 'Team', color: 'purple' },
  { value: 'DEPARTMENT', label: 'Phòng ban', color: 'amber' },
  { value: 'GLOBAL', label: 'Toàn công ty', color: 'emerald' },
];

// Định nghĩa hành động chuẩn
const ACTIONS = [
  { key: 'CREATE', label: 'Thêm', short: 'C', color: 'emerald', bg: 'dark-badge-emerald' },
  { key: 'READ', label: 'Xem', short: 'R', color: 'blue', bg: 'dark-badge-blue' },
  { key: 'UPDATE', label: 'Sửa', short: 'U', color: 'amber', bg: 'dark-badge-amber' },
  { key: 'DELETE', label: 'Xóa', short: 'D', color: 'rose', bg: 'dark-badge-rose' },
  { key: 'APPROVE', label: 'Duyệt', short: 'A', color: 'purple', bg: 'dark-badge-purple' },
];

// Mapping icon cho từng module
const MODULE_CONFIG: Record<string, { title: string; desc: string; icon: React.ReactNode; color: string }> = {
  Social: {
    title: 'Quản lý Bài đăng & MXH',
    desc: 'Content Calendar, Editor bài viết, A/B Testing và Thống kê Like/Share/Comment',
    icon: <ShareAltOutlined className="text-blue-500" />,
    color: 'blue',
  },
  CRM: {
    title: 'Social CRM & Unified Inbox',
    desc: 'Hộp thư hợp nhất đa kênh, chuyển đổi Comment/Chat thành Lead & Ticket ERP',
    icon: <CustomerServiceOutlined className="text-emerald-500" />,
    color: 'emerald',
  },
  Recruiting: {
    title: 'Tuyển dụng qua Mạng xã hội',
    desc: 'Đăng tin tuyển dụng từ HR-ERP, thu thập Mini-form ứng tuyển và đồng bộ CV',
    icon: <IdcardOutlined className="text-purple-500" />,
    color: 'purple',
  },
  Training: {
    title: 'Đào tạo Thực tập sinh (Sandbox)',
    desc: 'Thư viện tài liệu quy chuẩn, Sân chơi nộp bài Mock Post & Gamification',
    icon: <BookOutlined className="text-amber-500" />,
    color: 'amber',
  },
  User: {
    title: 'Quản lý Người dùng & Tài khoản',
    desc: 'Hồ sơ nhân sự, phân bổ quyền hạn, thùng rác khôi phục và reset mật khẩu',
    icon: <UserOutlined className="text-indigo-500" />,
    color: 'indigo',
  },
  Role: {
    title: 'Ma trận Phân quyền & Vai trò',
    desc: 'Thiết lập ma trận phân quyền 5 Roles x 5 Actions động cho toàn doanh nghiệp',
    icon: <SafetyCertificateOutlined className="text-red-500" />,
    color: 'red',
  },
  Department: {
    title: 'Cơ cấu Tổ chức & Phòng ban',
    desc: 'Quản lý cây phòng ban, đội nhóm (Teams) và phân cấp vị trí nhân viên',
    icon: <ApartmentOutlined className="text-cyan-500" />,
    color: 'cyan',
  },
};

const DEFAULT_ROLE_DESCRIPTIONS: Record<string, string> = {
  Manager: 'Giám đốc/Quản lý toàn bộ các phân hệ, xem Dashboard ROI, phê duyệt chiến dịch truyền thông và giám sát các phòng ban.',
  Leader: 'Trưởng nhóm lập kế hoạch Lịch nội dung (Content Calendar), phân công nhiệm vụ, duyệt bài đăng MXH và chấm điểm thực tập sinh.',
  Employee: 'Nhân viên chính thức tạo bản nháp bài đăng, trực tin nhắn/bình luận đa kênh (Unified Inbox) và tạo Lead/Ticket ERP.',
  Intern: 'Thực tập sinh thực hành độc quyền trong Sandbox, viết bài tập Mock Post nộp cho Leader chấm điểm.',
};

// Mô tả chi tiết 5 Roles gốc
const ROLE_DETAILS: Record<string, { icon: React.ReactNode; level: string; badgeClass: string; responsibilities: string[] }> = {
  'Super Admin': {
    icon: <CrownOutlined className="text-amber-500 text-xl" />,
    level: 'Quản Trị Viên',
    badgeClass: 'dark-badge-amber',
    responsibilities: [
      'Toàn quyền kiểm soát hệ sinh thái BizSocial ERP',
      'Cấu hình kết nối API MXH (Facebook, Zalo OA, LinkedIn)',
      'Quản lý hạ tầng, webhook và bảo mật hệ thống',
      'Quyền hạn được khóa cứng (không thể bị vô hiệu hóa)',
    ],
  },
  Manager: {
    icon: <SolutionOutlined className="text-blue-500 text-xl" />,
    level: 'Cấp 1 - Giám đốc',
    badgeClass: 'dark-badge-sky',
    responsibilities: [
      'Mặc định toàn quyền truy cập tất cả các module',
      'Xem Dashboard tổng quan ROI, ngân sách và chỉ số hiệu suất',
      'Phê duyệt các chiến dịch truyền thông lớn của doanh nghiệp',
      'Giám sát hoạt động của các Leader và phòng ban',
    ],
  },
  Leader: {
    icon: <TeamOutlined className="text-emerald-500 text-xl" />,
    level: 'Cấp 2 - Trưởng nhóm',
    badgeClass: 'dark-badge-emerald',
    responsibilities: [
      'Lên kế hoạch Lịch nội dung (Content Calendar) hàng tuần/tháng',
      'Phân công nhiệm vụ soạn bài cho Nhân viên và Intern',
      'Nắm quyền APPROVE (Duyệt bài đăng thật ra mạng xã hội)',
      'Chấm điểm bài tập Mock Post của Thực tập sinh trong Sandbox',
    ],
  },
  Employee: {
    icon: <UserSwitchOutlined className="text-indigo-500 text-xl" />,
    level: 'Cấp 3 - Nhân viên Chính thức',
    badgeClass: 'dark-badge-indigo',
    responsibilities: [
      'Tạo bản nháp (Drafts) bài viết, hình ảnh, video',
      'Trực tiếp tương tác thật với khách hàng (Unified Inbox)',
      'Chuyển đổi Comment/Tin nhắn tiềm năng thành Lead & Ticket đẩy về ERP',
      'Được lên lịch bài viết khi được Leader cấp quyền',
    ],
  },
  Intern: {
    icon: <UserOutlined className="text-amber-600 text-xl" />,
    level: 'Cấp 4 - Thực tập sinh',
    badgeClass: 'dark-badge-orange',
    responsibilities: [
      'Hoạt động độc quyền trong Sandbox (Module Đào tạo)',
      'Viết bài tập Mock Post nộp cho Leader chấm điểm',
      'Bị chặn tương tác thật với khách hàng và cấm đăng bài thật',
      'Tích lũy KPI để được tự động mở khóa quyền viết bài thật',
    ],
  },
};

interface RoleItem {
  id: number;
  name: string;
  description: string | null;
  usersCount: number;
  isProtected?: boolean;
}

interface ModuleItem {
  id: number;
  name: string;
  description: string | null;
}

interface PermissionItem {
  id: number;
  roleId: number;
  moduleId: number;
  action: string;
  scope?: string;
}

export default function RolesMatrixPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('matrix');
  const [searchText, setSearchText] = useState<string>('');

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [permissionSet, setPermissionSet] = useState<Set<string>>(new Set());
  const [originalPermissionSet, setOriginalPermissionSet] = useState<Set<string>>(new Set());

  // Default Scope Configurator State: map roleId -> scope
  const [roleScopes, setRoleScopes] = useState<Record<number, string>>({});
  const [originalRoleScopes, setOriginalRoleScopes] = useState<Record<number, string>>({});

  // Drawer xem chi tiết vai trò
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Modal DAC Engine
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  const groupedPermissionsDetail = useMemo(() => {
    if (!selectedRoleDetail?.permissions) return {};
    const map: Record<string, any[]> = {};
    selectedRoleDetail.permissions.forEach((p: any) => {
      const modName = p.module?.name || 'Chung';
      if (!map[modName]) map[modName] = [];
      map[modName].push(p);
    });
    return map;
  }, [selectedRoleDetail]);

  // Modal Tạo / Sửa Custom Role
  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleForm] = Form.useForm();
  const [savingRole, setSavingRole] = useState<boolean>(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [fetchingAuditLogs, setFetchingAuditLogs] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const getAuthHeader = () => {
    let currentToken = token;
    if (!currentToken && typeof window !== 'undefined') {
      currentToken = localStorage.getItem('access_token');
    }
    return {
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
      },
    };
  };

  // Tải danh sách Audit Logs
  const fetchAuditLogs = async () => {
    setFetchingAuditLogs(true);
    try {
      const res = await axios.get('http://localhost:3001/audit-log', getAuthHeader());
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error('Lỗi tải audit log:', err);
    } finally {
      setFetchingAuditLogs(false);
    }
  };

  // Tải dữ liệu ma trận từ Backend
  const fetchMatrixData = async () => {
    let currentToken = token;
    if (!currentToken && typeof window !== 'undefined') {
      currentToken = localStorage.getItem('access_token');
    }
    if (!currentToken) return;

    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/roles/matrix', getAuthHeader());
      const { roles: fetchedRoles, modules: fetchedModules, permissions: fetchedPermissions } = res.data;

      setRoles(fetchedRoles);
      setModules(fetchedModules);

      const pSet = new Set<string>();
      const scopesMap: Record<number, string> = {};

      fetchedPermissions.forEach((p: PermissionItem) => {
        pSet.add(`${p.roleId}-${p.moduleId}-${p.action}`);
        if (p.roleId && p.scope) {
          scopesMap[p.roleId] = p.scope;
        }
      });

      // Mặc định gán Scope chuẩn cho các Role nếu chưa có
      fetchedRoles.forEach((r: RoleItem) => {
        if (!scopesMap[r.id]) {
          if (r.name === 'Super Admin' || r.name === 'Manager') scopesMap[r.id] = 'GLOBAL';
          else if (r.name === 'Leader') scopesMap[r.id] = 'TEAM';
          else scopesMap[r.id] = 'PERSONAL';
        }
      });

      // Super Admin luôn có tất cả quyền
      const superAdmin = fetchedRoles.find((r: RoleItem) => r.name === 'Super Admin');
      if (superAdmin) {
        fetchedModules.forEach((m: ModuleItem) => {
          ACTIONS.forEach((a) => {
            pSet.add(`${superAdmin.id}-${m.id}-${a.key}`);
          });
        });
      }

      setPermissionSet(pSet);
      setOriginalPermissionSet(new Set(pSet));
      setRoleScopes(scopesMap);
      setOriginalRoleScopes({ ...scopesMap });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải ma trận phân quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrixData();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  // Kiểm tra có thay đổi chưa lưu hay không
  const hasChanges = useMemo(() => {
    if (permissionSet.size !== originalPermissionSet.size) return true;
    for (const key of permissionSet) {
      if (!originalPermissionSet.has(key)) return true;
    }
    for (const roleId in roleScopes) {
      if (roleScopes[roleId] !== originalRoleScopes[roleId]) return true;
    }
    return false;
  }, [permissionSet, originalPermissionSet, roleScopes, originalRoleScopes]);

  // Bật/tắt 1 quyền trong State
  const handleTogglePermission = (roleId: number, roleName: string, moduleId: number, action: string) => {
    if (roleName === 'Super Admin') {
      message.warning('Super Admin luôn nắm giữ toàn quyền hệ thống, không thể bỏ chọn.');
      return;
    }

    const key = `${roleId}-${moduleId}-${action}`;
    setPermissionSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Chọn / Bỏ chọn toàn bộ quyền của 1 Role
  const handleToggleAllRolePermissions = (roleId: number, roleName: string) => {
    if (roleName === 'Super Admin') return;

    let totalPossible = modules.length * ACTIONS.length;
    let currentCount = 0;
    modules.forEach((m) => {
      ACTIONS.forEach((a) => {
        if (permissionSet.has(`${roleId}-${m.id}-${a.key}`)) {
          currentCount++;
        }
      });
    });

    const shouldSelectAll = currentCount < totalPossible;

    setPermissionSet((prev) => {
      const next = new Set(prev);
      modules.forEach((m) => {
        ACTIONS.forEach((a) => {
          const key = `${roleId}-${m.id}-${a.key}`;
          if (shouldSelectAll) {
            next.add(key);
          } else {
            next.delete(key);
          }
        });
      });
      return next;
    });

    message.info(
      shouldSelectAll
        ? `Đã chọn tất cả quyền cho vai trò ${roleName}`
        : `Đã xóa tất cả quyền của vai trò ${roleName}`
    );
  };

  // Lưu toàn bộ Ma trận & Scope lên Backend
  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      const rolesToUpdate = roles.filter((r) => r.name !== 'Super Admin');

      for (const role of rolesToUpdate) {
        const roleScope = roleScopes[role.id] || 'PERSONAL';
        const rolePermissions: { moduleId: number; action: string; scope: string }[] = [];

        modules.forEach((m) => {
          ACTIONS.forEach((a) => {
            if (permissionSet.has(`${role.id}-${m.id}-${a.key}`)) {
              rolePermissions.push({ moduleId: m.id, action: a.key, scope: roleScope });
            }
          });
        });

        await axios.post(
          'http://localhost:3001/roles/matrix/batch-update',
          {
            roleId: role.id,
            permissions: rolePermissions,
          },
          getAuthHeader()
        );
      }

      setOriginalPermissionSet(new Set(permissionSet));
      setOriginalRoleScopes({ ...roleScopes });
      message.success('Đã lưu thành công Ma trận Phân quyền & Scope mới!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi khi lưu ma trận');
    } finally {
      setSaving(false);
    }
  };

  // Đặt lại các thay đổi chưa lưu
  const handleResetChanges = () => {
    setPermissionSet(new Set(originalPermissionSet));
    setRoleScopes({ ...originalRoleScopes });
    message.info('Đã hoàn tác các thay đổi chưa lưu');
  };

  // Xử lý tạo mới / chỉnh sửa Custom Role
  const handleOpenRoleModal = (role?: RoleItem) => {
    if (role) {
      setEditingRole(role);
      roleForm.setFieldsValue({ name: role.name, description: role.description });
    } else {
      setEditingRole(null);
      roleForm.resetFields();
    }
    setRoleModalOpen(true);
  };

  const handleSaveRole = async (values: any) => {
    setSavingRole(true);
    try {
      if (editingRole) {
        await axios.patch(`http://localhost:3001/roles/${editingRole.id}`, values, getAuthHeader());
        message.success('Cập nhật vai trò thành công!');
      } else {
        await axios.post('http://localhost:3001/roles', values, getAuthHeader());
        message.success('Tạo vai trò tùy chỉnh mới thành công!');
      }
      setRoleModalOpen(false);
      fetchMatrixData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể lưu vai trò!');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/roles/${id}`, getAuthHeader());
      message.success('Đã xóa vai trò thành công!');
      fetchMatrixData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa vai trò!');
    }
  };

  // Filter modules
  const filteredModules = useMemo(() => {
    if (!searchText.trim()) return modules;
    const term = searchText.toLowerCase();
    return modules.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (MODULE_CONFIG[m.name]?.title || '').toLowerCase().includes(term) ||
        (MODULE_CONFIG[m.name]?.desc || '').toLowerCase().includes(term)
    );
  }, [modules, searchText]);

  const visibleRoles = useMemo(
    () => roles.filter((r) => r.name !== 'Super Admin' && r.name !== 'SUPER_ADMIN'),
    [roles]
  );

  // Cấu hình các cột cho Bảng Ma trận
  const matrixColumns = [
    {
      title: (
        <div className="py-0.5 pl-4">
          <span className="font-bold text-slate-800 dark:!text-slate-100 uppercase tracking-wide text-xs">
            Phân hệ / Module Nghiệp Vụ
          </span>
          <p className="text-[10px] text-slate-400 dark:!text-slate-400 m-0 font-normal">
            7 Modules cốt lõi của BizSocial ERP
          </p>
        </div>
      ),
      dataIndex: 'name',
      key: 'module',
      width: '28%',
      render: (moduleName: string) => {
        const conf = MODULE_CONFIG[moduleName] || {
          title: moduleName,
          desc: 'Phân hệ chức năng hệ thống',
          icon: <SafetyCertificateOutlined />,
          color: 'blue',
        };
        return (
          <div className="py-1 pl-4">
            <div className="flex items-center gap-2">
              <span className="text-base text-blue-600 dark:text-blue-400">{conf.icon}</span>
              <span className="font-semibold text-slate-900 dark:!text-white text-xs">{conf.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0 mt-1 leading-relaxed pl-6">
              {conf.desc}
            </p>
            <div className="pl-6 mt-1.5">
              <Tag className="text-[9px] font-mono leading-tight py-0.5 px-1.5 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded" color="default">
                Module: {moduleName}
              </Tag>
            </div>
          </div>
        );
      },
    },
    ...visibleRoles.map((role) => {
      const isSuperAdmin = role.name === 'Super Admin';
      const roleDetail = ROLE_DETAILS[role.name] || {
        icon: <UserOutlined />,
        level: 'Vai trò tùy chỉnh',
        badgeClass: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80',
        responsibilities: [],
      };

      let currentPermCount = 0;
      modules.forEach((m) => {
        ACTIONS.forEach((a) => {
          if (permissionSet.has(`${role.id}-${m.id}-${a.key}`)) {
            currentPermCount++;
          }
        });
      });
      const maxPermCount = modules.length * ACTIONS.length;
      const permPercent = Math.round((currentPermCount / (maxPermCount || 1)) * 100);

      return {
        title: (
          <div className="text-center py-1 px-0.5 space-y-1">
            <div className="flex items-center justify-center gap-1">
              <span>{roleDetail.icon}</span>
              <span className="font-bold text-slate-900 dark:!text-white text-xs">{role.name}</span>
            </div>

            {/* Scope Configurator Dropdown */}
            {!isSuperAdmin && (
              <div className="pt-0.5">
                <Tooltip title="Thiết lập Phạm vi Dữ liệu mặc định (Default Scope Configurator)">
                  <Select
                    size="small"
                    value={roleScopes[role.id] || 'PERSONAL'}
                    onChange={(val) => setRoleScopes((prev) => ({ ...prev, [role.id]: val }))}
                    className="w-full text-xs font-bold"
                    options={SCOPE_OPTIONS}
                  />
                </Tooltip>
              </div>
            )}

            <div className="text-[10px] text-slate-400 mt-0.5">
              {role.usersCount} nhân sự • {permPercent}% quyền
            </div>

            {!isSuperAdmin && (
              <div>
                <Button
                  size="small"
                  type="link"
                  className="text-[10px] h-5 px-1 text-blue-600 dark:text-indigo-400 hover:text-blue-800 dark:hover:text-indigo-300"
                  onClick={() => handleToggleAllRolePermissions(role.id, role.name)}
                >
                  Chọn tất cả
                </Button>
              </div>
            )}
          </div>
        ),
        dataIndex: 'id',
        key: `role_${role.id}`,
        width: '18%',
        render: (_: any, moduleRecord: ModuleItem) => {
          return (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {ACTIONS.map((act) => {
                const hasPermission = permissionSet.has(`${role.id}-${moduleRecord.id}-${act.key}`);
                return (
                  <Tooltip
                    key={act.key}
                    title={`${act.label} (${act.key}) — ${moduleRecord.name} cho ${role.name}`}
                  >
                    <button
                      type="button"
                      disabled={isSuperAdmin}
                      onClick={() => handleTogglePermission(role.id, role.name, moduleRecord.id, act.key)}
                      className={`w-6 h-6 rounded font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer border ${hasPermission
                        ? `${act.bg} shadow-xs font-semibold scale-105`
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-400 dark:hover:text-slate-400'
                        } ${isSuperAdmin ? 'cursor-not-allowed opacity-90' : ''}`}
                    >
                      {act.short}
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          );
        },
      };
    }),
  ];

  return (
    <div className="space-y-4">
      {/* Header Layout: Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 print:hidden">
        <div>
          <Title level={3} className="!mb-0 font-extrabold text-slate-900 dark:text-white tracking-tight text-xl sm:text-2xl whitespace-nowrap">
            Quản lý Phân quyền
          </Title>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none]">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenRoleModal()}
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs h-9 px-3 sm:px-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shrink-0 border-0"
          >
            <span>Tạo mới</span>
          </Button>

          <Button
            icon={<SafetyCertificateOutlined />}
            onClick={() => setShareModalOpen(true)}
            className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80 font-bold text-xs h-9 px-3 sm:px-3.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 shrink-0"
          >
            <span>Ủy quyền động</span>
          </Button>

          <Button
            icon={<HistoryOutlined />}
            onClick={() => {
              setIsAuditModalOpen(true);
              fetchAuditLogs();
            }}
            className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/80 font-bold text-xs h-9 px-3 sm:px-3.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/50 shrink-0"
          >
            <span className="hidden sm:inline">Lịch sử phân quyền</span>
          </Button>
        </div>
      </div>

      {/* Tabs Chuyển Đổi (Matrix, Roles, Audit Log) */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="custom-matrix-tabs"
        items={[
          {
            key: 'matrix',
            label: (
              <span className="flex items-center gap-1.5 font-medium px-1 text-xs sm:text-sm">
                <SafetyCertificateOutlined />
                Phân quyền
              </span>
            ),
          },
          {
            key: 'roles',
            label: (
              <span className="flex items-center gap-1.5 font-medium px-1 text-xs sm:text-sm">
                <TeamOutlined />
                Tổng quan Vai trò
                <Badge count={visibleRoles.length} className="ml-1" style={{ backgroundColor: '#7367f0' }} />
              </span>
            ),
          },
        ]}
      />

      {loading ? (
        <Card className="rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
          <Spin size="large" description="Đang tải dữ liệu ma trận phân quyền..." />
        </Card>
      ) : activeTab === 'matrix' ? (
        /* TAB 1: MA TRẬN PHÂN QUYỀN */
        <Card className="rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden" styles={{ body: { padding: 0 } }}>
          {/* Thanh công cụ ma trận */}
          <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white dark:bg-slate-900 gap-3">
            <div className="flex items-center gap-2 text-xs bg-slate-50/80 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-700/80 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full sm:w-auto">
              {ACTIONS.map((a) => (
                <div key={a.key} className="flex items-center gap-1 shrink-0">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] border ${a.bg}`}>
                    {a.short}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                    {a.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Input
                placeholder="Tìm kiếm phân hệ / module..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="rounded-xl h-9 text-xs flex-1 md:w-60"
              />

              {hasChanges && (
                <Button
                  icon={<UndoOutlined />}
                  onClick={handleResetChanges}
                  className="text-slate-700 dark:text-slate-200 font-medium text-xs h-9 px-2.5 sm:px-3 shadow-none border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:text-blue-600 rounded-xl shrink-0 flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Hoàn tác</span>
                </Button>
              )}

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                disabled={!hasChanges}
                onClick={handleSaveMatrix}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 border-0 font-bold text-xs h-9 px-2.5 sm:px-3.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <span className="hidden sm:inline">Lưu ma trận</span>
              </Button>
            </div>
          </div>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto w-full">
            <Table
              columns={matrixColumns}
              dataSource={filteredModules}
              rowKey="id"
              pagination={false}
              bordered
              className="custom-matrix-table min-w-[700px]"
            />
          </div>

          {/* Mobile View: Module Cards */}
          <div className="block sm:hidden p-3 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
            {filteredModules.map((moduleItem) => {
              const conf = MODULE_CONFIG[moduleItem.name] || {
                title: moduleItem.name,
                desc: 'Phân hệ chức năng hệ thống',
                icon: <SafetyCertificateOutlined />,
                color: 'blue',
              };

              return (
                <div
                  key={moduleItem.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-xs space-y-3"
                >
                  {/* Module Header */}
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm shrink-0">
                      {conf.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs m-0 leading-tight truncate">
                        {conf.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Module: {moduleItem.name}
                      </span>
                    </div>
                  </div>

                  {/* List Roles Permissions for this Module */}
                  <div className="space-y-2.5">
                    {visibleRoles.map((role) => {
                      const isSuperAdmin = role.name === 'Super Admin';
                      const roleDetail = ROLE_DETAILS[role.name] || {
                        icon: <UserOutlined />,
                        color: 'purple',
                      };

                      return (
                        <div
                          key={role.id}
                          className="bg-slate-50/80 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 space-y-2"
                        >
                          {/* Role Header & Scope */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs shrink-0">{roleDetail.icon}</span>
                              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate">
                                {role.name}
                              </span>
                            </div>

                            {!isSuperAdmin && (
                              <div className="w-36 shrink-0">
                                <Select
                                  size="small"
                                  value={roleScopes[role.id] || 'PERSONAL'}
                                  onChange={(val) => setRoleScopes((prev) => ({ ...prev, [role.id]: val }))}
                                  className="w-full text-xs font-bold"
                                  options={SCOPE_OPTIONS}
                                />
                              </div>
                            )}
                          </div>

                          {/* 5 Actions Toggle */}
                          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                            {ACTIONS.map((act) => {
                              const hasPermission = permissionSet.has(
                                `${role.id}-${moduleItem.id}-${act.key}`
                              );
                              return (
                                <button
                                  type="button"
                                  key={act.key}
                                  disabled={isSuperAdmin}
                                  onClick={() =>
                                    handleTogglePermission(
                                      role.id,
                                      role.name,
                                      moduleItem.id,
                                      act.key
                                    )
                                  }
                                  className={`flex-1 py-1 rounded-lg font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer border ${hasPermission
                                    ? `${act.bg} shadow-xs scale-105`
                                    : 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                  {act.short}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : activeTab === 'roles' ? (
        /* TAB 2: TỔNG QUAN VAI TRÒ */
        <div className="space-y-5">
          <Row gutter={[20, 20]}>
            {visibleRoles.map((role) => {
              const isProtected = role.isProtected;
              const roleDetail = ROLE_DETAILS[role.name] || {
                icon: <UserOutlined className="text-purple-500 text-xl" />,
                level: 'Vai trò tùy chỉnh',
                badgeClass: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80',
                responsibilities: ['Vai trò tùy chỉnh được tạo bởi Quản trị viên'],
              };

              return (
                <Col xs={24} md={12} xl={8} key={role.id}>
                  <Card
                    className="rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all h-full flex flex-col justify-between"
                    styles={{ body: { padding: '24px' } }}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            {roleDetail.icon}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white m-0 leading-tight">
                              {role.name}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${roleDetail.badgeClass}`}>
                              {roleDetail.level}
                            </span>
                          </div>
                        </div>

                        {!isProtected && (
                          <Space size="small">
                            <Button
                              type="text"
                              icon={<EditOutlined className="dark:text-slate-300" />}
                              size="small"
                              onClick={() => handleOpenRoleModal(role)}
                            />
                            <Popconfirm
                              title="Xóa vai trò tùy chỉnh"
                              description={`Bạn có chắc muốn xóa vai trò "${role.name}"?`}
                              onConfirm={() => handleDeleteRole(role.id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                            </Popconfirm>
                          </Space>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-medium">
                        {role.description || DEFAULT_ROLE_DESCRIPTIONS[role.name] || 'Vai trò tùy chỉnh được khởi tạo bởi Quản trị viên.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>{role.usersCount} nhân sự đang gán</span>
                      {isProtected && <span className="text-[9px] rounded font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Bảo vệ</span>}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ) : null}

      {/* Modal Lịch Sử Phân Quyền & Bảo Mật */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800">
            <AuditOutlined className="text-amber-500 text-base sm:text-lg" />
            <span className="truncate">Lịch Sử Thay Đổi Phân Quyền & Bảo Mật</span>
          </div>
        }
        open={isAuditModalOpen}
        onCancel={() => setIsAuditModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsAuditModalOpen(false)} className="rounded-xl font-bold bg-slate-900 dark:bg-indigo-600 border-0 h-9 px-5 w-full sm:w-auto">
            Đóng
          </Button>
        ]}
        width={850}
        centered
        className="custom-audit-modal"
      >
        <div className="py-1.5 sm:py-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Button icon={<ReloadOutlined />} onClick={fetchAuditLogs} loading={fetchingAuditLogs} size="small" className="rounded-lg text-xs self-end sm:self-auto dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
              Tải lại log
            </Button>
          </div>

          {fetchingAuditLogs ? (
            <div className="py-12 text-center"><Spin description="Đang tải dữ liệu nhật ký bảo mật..." /></div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table
                  dataSource={auditLogs}
                  rowKey="id"
                  pagination={{ pageSize: 8, showSizeChanger: false }}
                  size="small"
                  className="custom-matrix-table"
                  columns={[
                    {
                      title: 'THỜI GIAN',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      width: '22%',
                      render: (date) => (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {new Date(date).toLocaleString('vi-VN')}
                        </span>
                      ),
                    },
                    {
                      title: 'NGƯỜI THỰC HIỆN',
                      dataIndex: 'userName',
                      key: 'userName',
                      width: '20%',
                      render: (name) => <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{name || 'Super Admin'}</span>,
                    },
                    {
                      title: 'HÀNH ĐỘNG',
                      dataIndex: 'action',
                      key: 'action',
                      width: '20%',
                      render: (action) => {
                        let badgeClass = 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80';
                        if (action.includes('CREATE')) badgeClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
                        if (action.includes('DELETE')) badgeClass = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
                        if (action.includes('UPDATE') || action.includes('MATRIX')) badgeClass = 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80';
                        return <span className={`font-extrabold text-[10px] rounded-md px-2 py-0.5 border inline-block ${badgeClass}`}>{action}</span>;
                      },
                    },
                    {
                      title: 'CHI TIẾT THAO TÁC',
                      dataIndex: 'details',
                      key: 'details',
                      render: (text) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{text}</span>,
                    },
                  ]}
                />
              </div>

              {/* Mobile Timeline Cards View */}
              <div className="block sm:hidden space-y-2.5 max-h-[58vh] overflow-y-auto pr-0.5">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">Chưa có nhật ký ghi nhận</div>
                ) : (
                  auditLogs.map((log: any, idx: number) => {
                    let badgeClass = 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80';
                    if (log.action.includes('CREATE')) badgeClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
                    if (log.action.includes('DELETE')) badgeClass = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
                    if (log.action.includes('UPDATE') || log.action.includes('MATRIX')) badgeClass = 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80';

                    return (
                      <div
                        key={log.id || idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/80 pb-2">
                          <span className={`font-extrabold text-[10px] rounded-md px-2 py-0.5 border ${badgeClass}`}>
                            {log.action}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <div className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {log.details}
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <UserOutlined className="text-indigo-500 dark:text-indigo-400 text-xs" />
                          <span>Thực hiện bởi:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {log.userName || 'Super Admin'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal Tạo / Sửa Vai Trò Tùy Chỉnh */}
      <Modal
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        footer={null}
        centered
        forceRender
        title={<span className="font-extrabold text-base text-slate-900 dark:text-white pb-2 block border-b border-slate-100 dark:border-slate-800">{editingRole ? 'Chỉnh Sửa Vai Trò' : 'Tạo Vai Trò Tùy Chỉnh Mới'}</span>}
      >
        <Form form={roleForm} layout="vertical" onFinish={handleSaveRole} className="space-y-4 pt-3">
          <Form.Item
            name="name"
            label={<span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tên Vai Trò Mới</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
          >
            <Input size="large" className="rounded-xl" placeholder="Ví dụ: Chuyên Viên Kiểm Toán Content" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs font-bold text-slate-800 dark:text-slate-200">Mô Tả Nhiệm Vụ & Trách Nhiệm</span>}
          >
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Mô tả ngắn trách nhiệm và nhiệm vụ của vai trò..." />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={savingRole}
            size="large"
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white h-11 border-0"
          >
            {editingRole ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo Vai Trò'}
          </Button>
        </Form>
      </Modal>

      {/* Drawer Chi Tiết Phân Quyền Vai Trò (UX/UI Premium) */}
      <Drawer
        title={
          selectedRoleDetail ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center text-sm shadow-2xs shrink-0">
                <SafetyCertificateOutlined />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base m-0 leading-tight truncate">
                  Hồ sơ Phân quyền: {selectedRoleDetail.name}
                </h4>
                <span className="text-[11px] text-slate-400 font-normal block truncate">
                  Chi tiết vai trò & ma trận quyền hạn đã cấp
                </span>
              </div>
            </div>
          ) : (
            'Chi tiết vai trò'
          )
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{
          wrapper: { width: '100%', maxWidth: '580px' },
          header: { padding: '14px 20px', borderBottom: '1px solid #f1f5f9' },
          body: { padding: '20px' },
        }}
      >
        {loadingDetail ? (
          <div className="text-center py-16">
            <Spin size="large" description="Đang tải thông tin chi tiết vai trò..." />
          </div>
        ) : selectedRoleDetail ? (
          <div className="space-y-5">
            {/* Banner Tóm tắt Vai Trò */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/60 border border-blue-100/90 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Badge status="processing" color="#2563eb" />
                  <span className="font-bold text-slate-900 text-base">{selectedRoleDetail.name}</span>
                </div>
                <Tag color="blue" className="text-xs font-semibold m-0 border-0 bg-blue-100/80 text-blue-700 px-2 py-0.5">
                  Mã vai trò: #{selectedRoleDetail.id}
                </Tag>
              </div>
              <p className="text-xs text-slate-600 m-0 leading-relaxed">
                {selectedRoleDetail.description || 'Chưa có mô tả chi tiết cho vai trò này.'}
              </p>
            </div>

            {/* Khối 1: Danh sách nhân sự giữ vai trò */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0 flex items-center gap-1.5">
                  <TeamOutlined className="text-blue-600" />
                  <span>Nhân sự đang giữ vai trò này</span>
                </h4>
                <Badge
                  count={`${selectedRoleDetail.users?.length || 0} người`}
                  style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 600, fontSize: '10px' }}
                />
              </div>

              {(!selectedRoleDetail.users || selectedRoleDetail.users.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  Chưa có nhân sự nào được gán vai trò này.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                  {selectedRoleDetail.users.map((u: any) => (
                    <div key={u.id || u.email} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar size={32} icon={<UserOutlined />} className="bg-slate-800 text-white font-bold shrink-0" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 text-xs block truncate leading-tight">{u.name}</span>
                          <span className="text-[11px] text-slate-400 block truncate mt-0.5">{u.email}</span>
                        </div>
                      </div>
                      <Tag
                        color={u.status === 'Active' ? 'green' : 'red'}
                        className="text-[10px] m-0 font-medium px-2 py-0.5 rounded-full border-0 bg-emerald-50 text-emerald-700"
                      >
                        ● {u.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                      </Tag>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Khối 2: Ma trận quyền hạn theo Module */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 m-0 flex items-center gap-1.5">
                  <CrownOutlined className="text-amber-500" />
                  <span>Quyền hạn đã cấp theo Module</span>
                </h4>
                <Badge
                  count={`${selectedRoleDetail.permissions?.length || 0} quyền`}
                  style={{ backgroundColor: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff', fontWeight: 600, fontSize: '10px' }}
                />
              </div>

              {(!selectedRoleDetail.permissions || selectedRoleDetail.permissions.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  Vai trò này chưa được cấp bất kỳ quyền hạn nào.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {Object.entries(groupedPermissionsDetail).map(([modName, perms]) => (
                    <div key={modName} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <CheckCircleOutlined className="text-emerald-500 text-xs" />
                          {MODULE_CONFIG[modName]?.title || modName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {perms.length} thao tác
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {perms.map((p: any) => {
                          const actionConfig = ACTIONS.find((a) => a.key === p.action);
                          return (
                            <Tag
                              key={p.id}
                              className={`text-[11px] font-semibold py-0.5 px-2.5 rounded-lg border-0 m-0 flex items-center gap-1 ${actionConfig?.bg || 'bg-blue-50 text-blue-700'}`}
                            >
                              <span>{actionConfig?.label || p.action}</span>
                              <span className="text-[9px] opacity-75 font-mono">({p.action})</span>
                            </Tag>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Modal DAC Engine */}
      <ResourceShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        resourceType="SOCIAL_POST"
        resourceId="1"
        resourceTitle="Chiến dịch TikTok Viral Summer 2026 (Bài đăng ID #1)"
      />
    </div>
  );
}

