"use client";

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Avatar,
  Tag,
  Tabs,
  Form,
  Input,
  Button,
  Row,
  Col,
  App,
  Space,
  Divider,
  Badge,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  SaveOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  BankOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';

const { Title, Text, Paragraph } = Typography;

export default function UserProfilePage() {
  const { message } = App.useApp();
  const { user, permissions } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const userAvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80";

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Cập nhật thông tin hồ sơ cá nhân thành công!');
    }, 600);
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }
    setPassLoading(true);
    setTimeout(() => {
      setPassLoading(false);
      passwordForm.resetFields();
      message.success('Đổi mật khẩu tài khoản thành công!');
    }, 600);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <div className="relative">
            <Avatar
              size={96}
              src={userAvatarUrl}
              icon={<UserOutlined />}
              className="border-4 border-white/90 shadow-md object-cover shrink-0"
            />
            <span className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full absolute bottom-1 right-1" title="Đang hoạt động" />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight m-0 text-white">
                {user?.name || 'Jamie Anderson'}
              </h1>
              <Tag color="cyan" className="rounded-full px-3 py-0.5 font-bold text-xs border-0 bg-white/20 text-white backdrop-blur-md">
                {user?.roleName || 'Quản trị viên'}
              </Tag>
            </div>

            <p className="text-blue-100 text-sm m-0 flex items-center justify-center sm:justify-start gap-2">
              <MailOutlined className="text-blue-200" /> {user?.email || 'admin@bizsocial.com'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-blue-100">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                <BankOutlined /> Phòng Ban: {user?.departmentId ? `ID #${user.departmentId}` : 'Ban Giám Đốc'}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                <CheckCircleOutlined className="text-emerald-300" /> Trạng thái: Hoạt động
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <Row gutter={[16, 16]}>
        {/* Left Column: Summary Card */}
        <Col xs={24} lg={8}>
          <Card className="rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                <IdcardOutlined className="text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm m-0">Tổng Quan Tài Khoản</h3>
                <span className="text-xs text-slate-400">Thông tin chi tiết vai trò hệ thống</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400">Mã Người Dùng:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">#USR-{user?.id || 1001}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400">Vai Trò Hệ Thống:</span>
                <Tag color="blue" className="rounded-md font-semibold text-xs border-0 m-0">
                  {user?.roleName || 'Quản trị viên'}
                </Tag>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400">Quyền Hạn Sở Hữu:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{permissions.length || 28} Quyền hạn</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-400">Phiên Đăng Nhập:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Đang hoạt động
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Bảo Mật 2 Lớp (2FA):</span>
                <Tag color="orange" className="rounded-md font-semibold text-xs m-0">Khuyên dùng bật</Tag>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column: Tabs Form */}
        <Col xs={24} lg={16}>
          <Card className="rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800">
            <Tabs
              defaultActiveKey="edit"
              items={[
                {
                  key: 'edit',
                  label: (
                    <span className="flex items-center gap-2 font-semibold">
                      <UserOutlined /> Chỉnh Sửa Hồ Sơ
                    </span>
                  ),
                  children: (
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleUpdateProfile}
                      initialValues={{
                        name: user?.name || 'Jamie Anderson',
                        email: user?.email || 'admin@bizsocial.com',
                        phone: '0988 123 456',
                      }}
                      className="pt-2 space-y-3"
                    >
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="name"
                            label={<span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Họ và Tên</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                          >
                            <Input prefix={<UserOutlined className="text-slate-400 mr-1" />} size="large" className="rounded-xl" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="email"
                            label={<span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Địa chỉ Email</span>}
                          >
                            <Input prefix={<MailOutlined className="text-slate-400 mr-1" />} size="large" disabled className="rounded-xl bg-slate-50 dark:bg-slate-900" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="phone"
                            label={<span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Số Điện Thoại</span>}
                          >
                            <Input prefix={<PhoneOutlined className="text-slate-400 mr-1" />} size="large" className="rounded-xl" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={<span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Phân Vai Hệ Thống</span>}
                          >
                            <Input value={user?.roleName || 'Quản trị viên'} disabled size="large" className="rounded-xl bg-slate-50 dark:bg-slate-900" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          loading={loading}
                          htmlType="submit"
                          size="large"
                          className="rounded-xl px-6 font-semibold"
                        >
                          Lưu Thay Đổi
                        </Button>
                      </div>
                    </Form>
                  ),
                },
                {
                  key: 'password',
                  label: (
                    <span className="flex items-center gap-2 font-semibold">
                      <KeyOutlined /> Đổi Mật Khẩu
                    </span>
                  ),
                  children: (
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleChangePassword}
                      className="pt-2 space-y-3 max-w-xl"
                    >
                      <Form.Item
                        name="currentPassword"
                        label={<span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Mật Khẩu Hiện Tại</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                      >
                        <Input.Password prefix={<LockOutlined className="text-slate-400 mr-1" />} size="large" className="rounded-xl" />
                      </Form.Item>

                      <Form.Item
                        name="newPassword"
                        label={<span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Mật Khẩu Mới</span>}
                        rules={[{ required: true, min: 6, message: 'Mật khẩu mới phải từ 6 ký tự trở lên!' }]}
                      >
                        <Input.Password prefix={<KeyOutlined className="text-slate-400 mr-1" />} size="large" className="rounded-xl" />
                      </Form.Item>

                      <Form.Item
                        name="confirmPassword"
                        label={<span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Xác Nhận Mật Khẩu Mới</span>}
                        rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
                      >
                        <Input.Password prefix={<KeyOutlined className="text-slate-400 mr-1" />} size="large" className="rounded-xl" />
                      </Form.Item>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="primary"
                          danger
                          icon={<SaveOutlined />}
                          loading={passLoading}
                          htmlType="submit"
                          size="large"
                          className="rounded-xl px-6 font-semibold"
                        >
                          Cập Nhật Mật Khẩu
                        </Button>
                      </div>
                    </Form>
                  ),
                },
                {
                  key: 'permissions',
                  label: (
                    <span className="flex items-center gap-2 font-semibold">
                      <SafetyCertificateOutlined /> Quyền Hạn Sở Hữu
                    </span>
                  ),
                  children: (
                    <div className="pt-2 space-y-4">
                      <div className="p-4 bg-blue-50/60 dark:bg-slate-900/60 rounded-xl border border-blue-100 dark:border-slate-800 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
                        <div>
                          <span className="font-bold block text-sm">Vai Trò: {user?.roleName || 'Quản trị viên'}</span>
                          <span className="text-slate-500 dark:text-slate-400">Bạn đang sở hữu phân quyền quản trị cao nhất hệ thống ERP</span>
                        </div>
                        <Badge count={`${permissions.length || 28} Modules`} style={{ backgroundColor: '#2563eb' }} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {['User', 'Role', 'Department', 'CRM', 'Social', 'Recruiting', 'Training'].map((mod) => (
                          <div key={mod} className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Module {mod}</span>
                            <div className="flex items-center gap-1">
                              {['C', 'R', 'U', 'D', 'A'].map((act) => (
                                <span key={act} className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
