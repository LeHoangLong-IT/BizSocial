"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Avatar,
  Tag,
  Spin,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  ReloadOutlined,
  CrownOutlined,
  ApartmentOutlined,
  AuditOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardStats {
  summary: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    departmentsCount: number;
    teamsCount: number;
    rolesCount: number;
    attendanceRate: number;
  };
  departmentDistribution: { name: string; value: number; color: string }[];
  roleDistribution: { name: string; count: number }[];
  recentUsers: {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    team: string;
    createdAt: string;
  }[];
  recentLogs: {
    id: number;
    userId: number;
    fromDept: string;
    toDept: string;
    reason: string;
    changedByName: string;
    createdAt: string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token') || localStorage.getItem('token')
          : null;
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: authHeader,
      });
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Dashboard từ DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const userName = user?.name || user?.email?.split('@')[0] || 'Quản trị viên';
  const userRole = (user as any)?.role?.name || 'Super Admin';

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Spin size="large" />
        <Text className="text-slate-400 text-sm font-medium">
          Đang kết nối CSDL MySQL và tải dữ liệu Dashboard ERP...
        </Text>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    departmentsCount: 0,
    teamsCount: 0,
    rolesCount: 0,
    attendanceRate: 98.4,
  };

  // Executive Harmonious Color Palette (No Neon)
  const corporatePalette = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#0284c7', '#ec4899'];

  const deptData = stats?.departmentDistribution?.length
    ? stats.departmentDistribution.map((d, i) => ({
      ...d,
      color: corporatePalette[i % corporatePalette.length],
    }))
    : [
      { name: 'Khối Kỹ Thuật', value: 1, color: '#3b82f6' },
      { name: 'Khối Marketing', value: 1, color: '#10b981' },
    ];

  const roleData = stats?.roleDistribution || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">


      {/* 📊 4 KPI SUMMARY CARDS */}
      <Row gutter={[16, 16]}>
        {/* KPI 1: Total Users */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            onClick={() => router.push('/users')}
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1 group-hover:text-indigo-600 transition-colors">
                  TỔNG SỐ NHÂN SỰ
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">
                  {summary.totalUsers}
                </span>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Hoạt động: {summary.activeUsers} tài khoản</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xl shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600 transition-colors">
                <TeamOutlined />
              </div>
            </div>
          </Card>
        </Col>

        {/* KPI 2: Departments */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            onClick={() => router.push('/organization')}
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1 group-hover:text-indigo-600 transition-colors">
                  PHÒNG BAN & ĐỘI NHÓM
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">
                  {summary.departmentsCount}
                </span>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Trực thuộc {summary.teamsCount} Teams chuyên môn</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
                <ApartmentOutlined />
              </div>
            </div>
          </Card>
        </Col>

        {/* KPI 3: Roles & Permissions */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            onClick={() => router.push('/roles')}
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1 group-hover:text-amber-600 transition-colors">
                  VAI TRÒ & PHÂN QUYỀN
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">
                  {summary.rolesCount}
                </span>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>RBAC 5 Roles Matrix Active</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0 group-hover:bg-amber-50 dark:group-hover:bg-amber-950 transition-colors">
                <CrownOutlined />
              </div>
            </div>
          </Card>
        </Col>

        {/* KPI 4: Attendance Rate */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            variant="borderless"
            onClick={() => router.push('/profile')}
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            styles={{ body: { padding: '20px' } }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1 group-hover:text-sky-600 transition-colors">
                  TỶ LỆ ĐIỂM DANH HOẠT ĐỘNG
                </span>
                <span className="text-3xl font-black text-slate-900 dark:text-white block">
                  {summary.attendanceRate}%
                </span>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Hiệu suất hoạt động cao</span>
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl shrink-0 group-hover:bg-sky-50 dark:group-hover:bg-sky-950 transition-colors">
                <CheckCircleOutlined />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 📈 ROW 2: MAIN ANALYTICS CHARTS (16 / 10 GRID) */}
      <Row gutter={[16, 16]}>
        {/* Roles Distribution Bar Chart (Col 16) */}
        <Col xs={24} lg={16}>
          <Card
            variant="borderless"
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col"
            styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base m-0">
                  Phân Bổ Quyền Hạn Theo Vai Trò (RBAC Roles)
                </h3>
                <p className="text-slate-400 text-xs m-0 mt-1">
                  Thống kê số lượng nhân sự được phân bổ theo 5 cấp bậc quản trị trong CSDL
                </p>
              </div>
              <Button
                type="text"
                size="small"
                onClick={() => router.push('/roles')}
                className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Quản lý Vai trò <RightOutlined className="text-[10px]" />
              </Button>
            </div>

            <div className="h-64 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.06)', radius: 8 }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: '1px solid #1e293b',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <SafetyCertificateOutlined className="text-indigo-600" />
                <span>Cơ chế bảo mật 5 Permissions: CREATE, READ, UPDATE, DELETE, APPROVE</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {summary.rolesCount} Roles Hợp Lệ
              </span>
            </div>
          </Card>
        </Col>

        {/* Department Distribution Donut Chart (Col 8) */}
        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col"
            styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' } }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base m-0">
                  Cơ Cấu Phòng Ban
                </h3>
                <p className="text-slate-400 text-xs m-0 mt-1">
                  Tỷ lệ phân bổ nhân sự giữa các Khối phòng ban
                </p>
              </div>
              <Tag color="default" className="rounded-full px-3 font-semibold border-slate-200 text-slate-600">
                Tổ chức CSDL
              </Tag>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
              <div className="w-44 h-44 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">
                    {summary.totalUsers}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">Nhân Sự</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1">
                {deptData.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700 dark:text-slate-200 text-xs font-semibold truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-slate-900 dark:text-white font-extrabold text-xs shrink-0">
                      {item.value} nhân sự
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Xem sơ đồ tổ chức cây:</span>
              <Button
                type="link"
                onClick={() => router.push('/organization')}
                className="text-indigo-600 dark:text-indigo-400 font-bold text-xs p-0 cursor-pointer"
              >
                Sơ Đồ Tổ Chức (Org Chart) →
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 📋 ROW 3: RECENT AUDIT LOGS & NEW MEMBERS (12 / 12 EQUAL GRID) */}
      <Row gutter={[16, 16]}>
        {/* Audit Logs (Col 12) */}
        <Col xs={24} lg={12}>
          <Card
            variant="borderless"
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
            styles={{ body: { padding: '24px' } }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base m-0 flex items-center gap-2">
                  <AuditOutlined className="text-indigo-600" />
                  <span>Nhật Ký Điều Chuyển Công Tác Mới Nhất</span>
                </h3>
              </div>
              <Button
                type="text"
                size="small"
                onClick={() => router.push('/organization')}
                className="text-indigo-600 dark:text-indigo-400 font-bold text-xs cursor-pointer"
              >
                Xem chi tiết →
              </Button>
            </div>

            <div className="space-y-3">
              {!stats?.recentLogs || stats.recentLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Chưa có lịch sử điều chuyển công tác nào được ghi nhận.
                </div>
              ) : (
                stats.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          Nhân sự #{log.userId}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                          {log.fromDept} → {log.toDept}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0 mt-1.5 truncate">
                        Lý do: {log.reason}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 shrink-0">
                      bởi {log.changedByName}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>

        {/* New Registered Members (Col 12) */}
        <Col xs={24} lg={12}>
          <Card
            variant="borderless"
            className="shadow-2xs rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
            styles={{ body: { padding: '24px' } }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base m-0 flex items-center gap-2">
                  <UsergroupAddOutlined className="text-emerald-600" />
                  <span>Danh Sách Nhân Sự Mới Gia Nhập</span>
                </h3>
              </div>
              <Button
                type="text"
                size="small"
                onClick={() => router.push('/users')}
                className="text-indigo-600 dark:text-indigo-400 font-bold text-xs cursor-pointer"
              >
                Quản lý User →
              </Button>
            </div>

            <div className="space-y-3">
              {!stats?.recentUsers || stats.recentUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Chưa có nhân sự nào trong danh sách.
                </div>
              ) : (
                stats.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.name}`}
                        className="bg-slate-200 dark:bg-slate-700 shrink-0"
                      />
                      <div className="min-w-0 leading-tight">
                        <span className="font-bold text-xs block text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {u.email} • {u.department}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full px-3 py-1 font-bold text-[11px] shrink-0 m-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80">
                      {u.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
