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
} from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const { Title, Text, Paragraph } = Typography;

// Định nghĩa hành động chuẩn
const ACTIONS = [
  { key: 'CREATE', label: 'Thêm', short: 'C', color: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  { key: 'READ', label: 'Xem', short: 'R', color: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-300' },
  { key: 'UPDATE', label: 'Sửa', short: 'U', color: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-300' },
  { key: 'DELETE', label: 'Xóa', short: 'D', color: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-300' },
  { key: 'APPROVE', label: 'Duyệt', short: 'A', color: 'purple', bg: 'bg-purple-50 text-purple-700 border-purple-300' },
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

// Mô tả chi tiết 5 Roles
const ROLE_DETAILS: Record<string, { icon: React.ReactNode; level: string; color: string; responsibilities: string[] }> = {
  'Super Admin': {
    icon: <CrownOutlined className="text-amber-500 text-xl" />,
    level: 'Cấp 1 - Tối cao',
    color: 'gold',
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
    color: 'blue',
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
    color: 'green',
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
    color: 'indigo',
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
    color: 'orange',
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
  // Lưu danh sách permission dưới dạng Set key: "roleId-moduleId-action"
  const [permissionSet, setPermissionSet] = useState<Set<string>>(new Set());
  const [originalPermissionSet, setOriginalPermissionSet] = useState<Set<string>>(new Set());

  // Drawer xem chi tiết vai trò
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedRoleDetail, setSelectedRoleDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

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

  // Lấy token đăng nhập
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

  // Tải dữ liệu ma trận từ Backend
  const fetchMatrixData = async () => {
    let currentToken = token;
    if (!currentToken && typeof window !== 'undefined') {
      currentToken = localStorage.getItem('access_token');
    }
    if (!currentToken) return;

    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/roles/matrix', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      const { roles: fetchedRoles, modules: fetchedModules, permissions: fetchedPermissions } = res.data;

      setRoles(fetchedRoles);
      setModules(fetchedModules);

      const pSet = new Set<string>();
      fetchedPermissions.forEach((p: PermissionItem) => {
        pSet.add(`${p.roleId}-${p.moduleId}-${p.action}`);
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
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể tải ma trận phân quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrixData();
  }, [token]);

  // Kiểm tra có thay đổi chưa lưu hay không
  const hasChanges = useMemo(() => {
    if (permissionSet.size !== originalPermissionSet.size) return true;
    for (const key of permissionSet) {
      if (!originalPermissionSet.has(key)) return true;
    }
    return false;
  }, [permissionSet, originalPermissionSet]);

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

    // Kiểm tra xem hiện tại role này đã có full quyền chưa
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

  // Lưu toàn bộ Ma trận lên Backend
  const handleSaveMatrix = async () => {
    setSaving(true);
    try {
      // Gửi batch update cho từng Role (trừ Super Admin)
      const rolesToUpdate = roles.filter((r) => r.name !== 'Super Admin');

      for (const role of rolesToUpdate) {
        const rolePermissions: { moduleId: number; action: string }[] = [];
        modules.forEach((m) => {
          ACTIONS.forEach((a) => {
            if (permissionSet.has(`${role.id}-${m.id}-${a.key}`)) {
              rolePermissions.push({ moduleId: m.id, action: a.key });
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
      message.success('Đã lưu thành công Ma trận Phân quyền mới!');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi khi lưu ma trận');
    } finally {
      setSaving(false);
    }
  };

  // Đặt lại các thay đổi chưa lưu
  const handleResetChanges = () => {
    setPermissionSet(new Set(originalPermissionSet));
    message.info('Đã hoàn tác các thay đổi chưa lưu');
  };

  // Mở Drawer xem chi tiết 1 Role
  const handleViewRoleDetail = async (roleId: number) => {
    setLoadingDetail(true);
    setDrawerVisible(true);
    try {
      const res = await axios.get(`http://localhost:3001/roles/${roleId}`, getAuthHeader());
      setSelectedRoleDetail(res.data);
    } catch (err: any) {
      message.error('Không thể tải chi tiết vai trò');
    } finally {
      setLoadingDetail(false);
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

  // Tạm ẩn Super Admin khỏi ma trận phân quyền
  const visibleRoles = useMemo(
    () => roles.filter((r) => r.name !== 'Super Admin'),
    [roles]
  );

  // Cấu hình các cột cho Bảng Ma trận
  const matrixColumns = [
    {
      title: (
        <div className="py-0.5 pl-4">
          <span className="font-bold text-slate-800 uppercase tracking-wide text-xs">
            Phân hệ / Module Nghiệp Vụ
          </span>
          <p className="text-[10px] text-slate-400 m-0 font-normal">
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
              <span className="text-base text-blue-600">{conf.icon}</span>
              <span className="font-semibold text-slate-900 text-xs">{conf.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 m-0 mt-1 leading-relaxed pl-6">
              {conf.desc}
            </p>
            <div className="pl-6 mt-1.5">
              <Tag className="text-[9px] font-mono leading-tight py-0.5 px-1.5 bg-slate-100 border-slate-200 text-slate-500 rounded" color="default">
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
        level: 'Vai trò',
        color: 'blue',
        responsibilities: [],
      };

      // Đếm số quyền role này đang có
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
          <div className="text-center py-1 px-0.5">
            <div className="flex items-center justify-center gap-1">
              <span>{roleDetail.icon}</span>
              <span className="font-bold text-slate-900 text-xs">{role.name}</span>
            </div>
            <div className="mt-0.5">
              <Tag color={roleDetail.color} className="text-[9px] font-medium border-0 m-0 px-1.5 py-0">
                {roleDetail.level}
              </Tag>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {role.usersCount} nhân sự • {permPercent}% quyền
            </div>

            {!isSuperAdmin && (
              <div className="mt-1">
                <Button
                  size="small"
                  type="link"
                  className="text-[10px] h-5 px-1 text-blue-600 hover:text-blue-800"
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
                        : 'bg-slate-50 text-slate-300 border-slate-200 hover:border-slate-300 hover:text-slate-400'
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
      {/* Header Actions - Same row on mobile & desktop */}
      <div className="flex flex-row justify-between items-center gap-2 mb-1 print:hidden">
        <Title level={3} className="!mb-0 font-bold text-slate-800 tracking-tight text-lg sm:text-2xl truncate">
          Quản lý Phân quyền
        </Title>

        <div className="flex items-center gap-1.5 shrink-0">
          {hasChanges && (
            <Button
              onClick={handleResetChanges}
              className="text-slate-700 font-medium text-xs h-8 px-2.5 shadow-none border-slate-200 hover:text-blue-600 rounded-lg"
            >
              Hoàn tác
            </Button>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={!hasChanges}
            onClick={handleSaveMatrix}
            className="bg-slate-900 hover:bg-slate-800 border-0 font-medium text-xs h-8 px-2.5 sm:px-3 rounded-lg shadow-xs flex items-center justify-center gap-1"
          >
            <span className="hidden sm:inline">Lưu ma trận</span>
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchMatrixData}
            className="text-slate-600 font-medium h-8 w-8 p-0 flex items-center justify-center shadow-none border-slate-200 hover:text-blue-600 rounded-lg"
          />
        </div>
      </div>

      {/* Tabs Chuyển Đổi */}
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
                Ma trận Phân quyền
              </span>
            ),
          },
          {
            key: 'roles',
            label: (
              <span className="flex items-center gap-1.5 font-medium px-1 text-xs sm:text-sm">
                <TeamOutlined />
                Tổng quan Vai trò
                <Badge count={visibleRoles.length} className="ml-1" style={{ backgroundColor: '#3b82f6' }} />
              </span>
            ),
          },
        ]}
      />

      {loading ? (
        <Card className="rounded-2xl shadow-xs border border-slate-100 p-12 text-center">
          <Spin size="large" description="Đang tải dữ liệu ma trận phân quyền..." />
        </Card>
      ) : activeTab === 'matrix' ? (
        /* TAB 1: MA TRẬN PHÂN QUYỀN */
        <Card className="rounded-2xl shadow-xs border border-slate-100 overflow-hidden" styles={{ body: { padding: 0 } }}>
          {/* Thanh công cụ ma trận */}
          <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white gap-3">
            {/* Chú thích màu sắc 5 hành động (Nằm trên 1 hàng không xuống dòng) */}
            <div className="flex items-center gap-2 text-xs bg-slate-50/80 p-2 rounded-xl border border-slate-100 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full sm:w-auto">
              {ACTIONS.map((a) => (
                <div key={a.key} className="flex items-center gap-1 shrink-0">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] border ${a.bg}`}>
                    {a.short}
                  </span>
                  <span className="text-slate-600 font-medium text-[11px]">
                    {a.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Ô tìm kiếm module */}
            <div className="w-full sm:w-72">
              <Input
                placeholder="Tìm kiếm phân hệ / module..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="rounded-xl h-9 text-xs"
              />
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

          {/* Mobile Responsive View: Module Cards (Không dùng Table bị gạt lùi) */}
          <div className="block sm:hidden p-3 space-y-3 bg-slate-50/40">
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
                  className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs"
                >
                  {/* Module Title & Icon */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 mb-2.5">
                    <span className="text-base shrink-0">{conf.icon}</span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-xs m-0 leading-tight truncate">
                        {conf.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 m-0 mt-0.5 truncate">
                        {conf.desc}
                      </p>
                    </div>
                  </div>

                  {/* Module Roles Permission Toggles */}
                  <div className="space-y-2">
                    {visibleRoles.map((role) => {
                      const isSuperAdmin = role.name === 'Super Admin';
                      const roleDetail = ROLE_DETAILS[role.name] || {
                        icon: <UserOutlined />,
                        color: 'blue',
                      };

                      return (
                        <div
                          key={role.id}
                          className="flex items-center justify-between bg-slate-50/70 p-2 rounded-lg border border-slate-100"
                        >
                          {/* Role Name */}
                          <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <span className="text-xs shrink-0">{roleDetail.icon}</span>
                            <span className="font-semibold text-[11px] text-slate-800 truncate">
                              {role.name}
                            </span>
                          </div>

                          {/* 5 Action Toggle Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
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
                                  className={`w-6 h-6 rounded font-bold text-[10px] flex items-center justify-center transition-all cursor-pointer border ${
                                    hasPermission
                                      ? `${act.bg} shadow-xs font-semibold scale-105`
                                      : 'bg-white text-slate-300 border-slate-200 hover:border-slate-300'
                                  }`}
                                  title={`${act.label} (${act.key})`}
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

          {/* Footer ghi chú */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center flex-wrap gap-2">
            <div className="text-slate-400 font-medium text-[11px]">
              Tổng số phân hệ: {modules.length} modules • 5 quyền hành động
            </div>
          </div>
        </Card>
      ) : (
        /* TAB 2: TỔNG QUAN VAI TRÒ (ROLE CARDS) */
        <div className="space-y-5">
          <Row gutter={[20, 20]}>
            {visibleRoles.map((role) => {
              const roleDetail = ROLE_DETAILS[role.name] || {
                icon: <UserOutlined />,
                level: 'Cấp bậc',
                color: 'blue',
                responsibilities: [],
              };

              // Đếm số quyền của role
              let rolePermCount = 0;
              modules.forEach((m) => {
                ACTIONS.forEach((a) => {
                  if (permissionSet.has(`${role.id}-${m.id}-${a.key}`)) {
                    rolePermCount++;
                  }
                });
              });
              const maxPermCount = modules.length * ACTIONS.length;
              const permPercent = Math.round((rolePermCount / (maxPermCount || 1)) * 100);

              return (
                <Col xs={24} md={12} xl={8} key={role.id}>
                  <Card
                    className="rounded-2xl shadow-xs border border-slate-100 hover:shadow-md transition-all h-full card-animate flex flex-col justify-between"
                    styles={{ body: { padding: '24px' } }}
                  >
                    <div>
                      {/* Header thẻ vai trò */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                            {roleDetail.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 m-0">
                              {role.name}
                            </h3>
                            <Tag color={roleDetail.color} className="text-[10px] font-medium border-0 mt-0.5">
                              {roleDetail.level}
                            </Tag>
                          </div>
                        </div>

                        <Badge
                          count={`${role.usersCount} users`}
                          style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600, border: '1px solid #e2e8f0' }}
                        />
                      </div>

                      {/* Tiến độ cấp quyền */}
                      <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="text-slate-500 font-medium">Độ phủ quyền hạn:</span>
                          <span className="font-bold text-slate-800">
                            {rolePermCount}/{maxPermCount} ({permPercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${permPercent > 80 ? 'bg-indigo-600' : permPercent > 50 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                            style={{ width: `${permPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Danh sách nhiệm vụ chính */}
                      <div>
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                          Nhiệm vụ trọng tâm:
                        </span>
                        <ul className="space-y-1.5 pl-4 text-xs text-slate-600 m-0">
                          {roleDetail.responsibilities.map((resp, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <Button
                        type="link"
                        size="small"
                        icon={<ArrowRightOutlined />}
                        className="text-xs font-semibold text-blue-600 p-0 hover:text-blue-800"
                        onClick={() => router.push(`/users`)}
                      >
                        Xem nhân sự ({role.usersCount})
                      </Button>

                      <Button
                        size="small"
                        className="rounded-lg text-xs font-medium"
                        onClick={() => handleViewRoleDetail(role.id)}
                      >
                        Chi tiết quyền
                      </Button>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

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
        .custom-matrix-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #0f172a !important;
          padding: 10px 8px !important;
          font-weight: 600 !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .custom-matrix-table .ant-table-tbody > tr > td {
          padding: 8px 8px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .custom-matrix-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
