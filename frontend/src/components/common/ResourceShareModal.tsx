"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, Button, Table, Tag, App, Spin, Tooltip, Empty } from 'antd';
import {
  SafetyOutlined,
  ShareAltOutlined,
  UserOutlined,
  TeamOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  LockOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CrownOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  StarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { useAuthStore } from '@/store/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ResourceShareModalProps {
  open: boolean;
  onClose: () => void;
  resourceType: string;
  resourceId: string;
  resourceTitle?: string;
}

// Cấu hình danh sách cấp độ quyền hạn với màu sắc và mô tả chi tiết
const ACCESS_LEVEL_CARDS = [
  {
    key: 'CAN_VIEW',
    title: 'Chỉ được xem',
    badge: 'Read Only',
    desc: 'Xem nội dung, thống kê bài đăng/ticket. Không thể sửa.',
    icon: <EyeOutlined className="text-lg text-blue-500" />,
    borderColor: 'peer-checked:border-blue-500 peer-checked:bg-blue-50/50 dark:peer-checked:bg-blue-950/30',
    tagColor: 'blue',
  },
  {
    key: 'CAN_EDIT',
    title: 'Được chỉnh sửa',
    badge: 'Can Edit',
    desc: 'Tạo bản nháp, cập nhật thông tin và chỉnh sửa nội dung.',
    icon: <EditOutlined className="text-lg text-emerald-500" />,
    borderColor: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-50/50 dark:peer-checked:bg-emerald-950/30',
    tagColor: 'emerald',
  },
  {
    key: 'CAN_APPROVE',
    title: 'Duyệt bài & Ticket',
    badge: 'Approval',
    desc: 'Có quyền Phê duyệt bài đăng Social & Chuyển ticket CRM.',
    icon: <CheckCircleOutlined className="text-lg text-amber-500" />,
    borderColor: 'peer-checked:border-amber-500 peer-checked:bg-amber-50/50 dark:peer-checked:bg-amber-950/30',
    tagColor: 'amber',
  },
  {
    key: 'FULL_CONTROL',
    title: 'Toàn quyền quản lý',
    badge: 'Full Access',
    desc: 'Toàn quyền chỉnh sửa, xóa và ủy quyền tiếp cho người khác.',
    icon: <CrownOutlined className="text-lg text-purple-500" />,
    borderColor: 'peer-checked:border-purple-500 peer-checked:bg-purple-50/50 dark:peer-checked:bg-purple-950/30',
    tagColor: 'purple',
  },
];

export function ResourceShareModal({
  open,
  onClose,
  resourceType: initialType,
  resourceId: initialId,
  resourceTitle: initialTitle,
}: ResourceShareModalProps) {
  const { message } = App.useApp();
  const { token } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [sharesList, setSharesList] = useState<any[]>([]);
  const [sharedType, setSharedType] = useState<'USER' | 'TEAM'>('USER');

  // State tài nguyên hiện tại (Cho phép thay đổi trực tiếp ngay trong Modal)
  const [activeResource, setActiveResource] = useState<{
    type: string;
    id: string;
    title: string;
  }>({
    type: initialType || 'SOCIAL_POST',
    id: initialId || '1',
    title: initialTitle || 'Chiến dịch TikTok Viral Summer 2026 (Bài đăng ID #1)',
  });

  // Danh sách các tài nguyên mẫu có sẵn để chuyển đổi nhanh
  const SAMPLE_RESOURCES = [
    {
      type: 'SOCIAL_POST',
      id: '1',
      title: 'Chiến dịch TikTok Viral Summer 2026 (Bài đăng ID #1)',
      badge: 'SOCIAL_POST',
    },
    {
      type: 'SOCIAL_POST',
      id: '2',
      title: 'Bài viết ra mắt tính năng AI Content Generator (Bài đăng ID #2)',
      badge: 'SOCIAL_POST',
    },
    {
      type: 'CRM_TICKET',
      id: '102',
      title: 'Ticket #102: Khách hàng yêu cầu hỗ trợ đơn hàng Shopee',
      badge: 'CRM_TICKET',
    },
    {
      type: 'JOB_POST',
      id: '5',
      title: 'Tin tuyển dụng: 5 Chuyên viên TikTok Content Creator',
      badge: 'JOB_POST',
    },
  ];

  // Đồng bộ props vào activeResource khi modal mở hoặc props thay đổi
  useEffect(() => {
    if (open) {
      setActiveResource({
        type: initialType || 'SOCIAL_POST',
        id: initialId || '1',
        title: initialTitle || 'Chiến dịch TikTok Viral Summer 2026 (Bài đăng ID #1)',
      });
    }
  }, [open, initialType, initialId, initialTitle]);

  // Watch form fields để render Live Preview Banner
  const selectedSharedWithId = Form.useWatch('sharedWithId', form);
  const selectedAccessLevel = Form.useWatch('accessLevel', form);
  const selectedExpireAt = Form.useWatch('expireAt', form);

  // Load danh sách đã được ủy quyền / chia sẻ theo activeResource
  const fetchShares = async () => {
    if (!activeResource.type || !activeResource.id) return;
    setFetching(true);
    try {
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `${API_BASE}/access-share/resource/${activeResource.type}/${activeResource.id}`,
        { headers: authHeader }
      );
      setSharesList(res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách ủy quyền DAC:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchShares();
    }
  }, [open, activeResource.type, activeResource.id]);

  const handleShare = async (values: any) => {
    setLoading(true);
    try {
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(
        `${API_BASE}/access-share`,
        {
          resourceType: activeResource.type,
          resourceId: activeResource.id,
          sharedWithId: values.sharedWithId,
          sharedType: values.sharedType,
          accessLevel: values.accessLevel,
          expireAt: values.expireAt ? values.expireAt.toISOString() : null,
        },
        { headers: authHeader }
      );

      message.success('Đã cấp quyền chia sẻ DAC thành công!');
      form.resetFields();
      form.setFieldsValue({ sharedType, accessLevel: 'CAN_VIEW' });
      fetchShares();
    } catch (err: any) {
      console.error('Lỗi chia sẻ tài nguyên:', err);
      message.error(err.response?.data?.message || 'Không thể chia sẻ tài nguyên!');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (id: number) => {
    try {
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE}/access-share/${id}`, { headers: authHeader });
      message.success('Đã thu hồi quyền chia sẻ!');
      fetchShares();
    } catch (err: any) {
      message.error('Không thể thu hồi quyền chia sẻ!');
    }
  };

  // Helper set nhanh thời hạn
  const setQuickExpiration = (days: number | null) => {
    if (days === null) {
      form.setFieldValue('expireAt', null);
    } else {
      form.setFieldValue('expireAt', dayjs().add(days, 'day'));
    }
  };

  // Helper lấy tên hiển thị của target đã chọn
  const getSelectedTargetName = () => {
    if (!selectedSharedWithId) return null;
    if (sharedType === 'USER') {
      const users: Record<number, string> = {
        1: 'Super Admin (Quản trị hệ thống)',
        2: 'Trưởng Phòng IT (Lê Hoàng Long)',
        3: 'Leader Social (Nguyễn Văn Minh)',
        4: 'Chuyên Viên Content (Trần Thị Hoa)',
      };
      return users[selectedSharedWithId] || `Nhân sự #${selectedSharedWithId}`;
    } else {
      const teams: Record<number, string> = {
        1: 'Team Social & Content (Phòng Truyền Thông)',
        2: 'Team TikTok Studio (Sáng Tạo Video)',
        3: 'Team Facebook Reels Performance',
      };
      return teams[selectedSharedWithId] || `Tập thể Team #${selectedSharedWithId}`;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={660}
      centered
      forceRender
      title={
        <div className="flex items-center gap-3 text-slate-900 dark:text-white pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7367f0] to-[#a855f7] text-white flex items-center justify-center text-xl shadow-lg shadow-purple-500/30 shrink-0">
            <SafetyOutlined />
          </div>
          <div>
            <div className="text-base font-extrabold leading-tight text-slate-900 dark:text-white flex items-center gap-2">
              Phân Quyền Động
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                DAC
              </span>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Chia Sẻ & Ủy Quyền Tài Nguyên
            </div>
          </div>
        </div>
      }
      className="rounded-3xl overflow-hidden"
    >
      <div className="py-3 space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Banner thông tin tài nguyên tích hợp Dropdown Thay Đổi Linh Hoạt */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs shrink-0">
                <LockOutlined />
              </div>
              <span className="text-[11px] uppercase font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
                Tài Nguyên Ủy Quyền:
              </span>
            </div>
            <Tag color="purple" className="rounded-lg font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 shrink-0 border-0">
              {activeResource.type}
            </Tag>
          </div>

          <Select
            size="middle"
            value={`${activeResource.type}:${activeResource.id}`}
            onChange={(val) => {
              const selected = SAMPLE_RESOURCES.find((r) => `${r.type}:${r.id}` === val);
              if (selected) {
                setActiveResource({
                  type: selected.type,
                  id: selected.id,
                  title: selected.title,
                });
                message.info(`Đã chuyển sang tài nguyên: ${selected.title}`);
              }
            }}
            className="w-full font-bold text-xs"
            options={SAMPLE_RESOURCES.map((r) => ({
              value: `${r.type}:${r.id}`,
              label: `📌 [${r.badge}] ${r.title}`,
            }))}
          />
        </div>

        {/* Form thực hiện chia sẻ */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleShare}
          initialValues={{
            sharedType: 'USER',
            accessLevel: 'CAN_VIEW',
          }}
          className="space-y-4 p-5  rounded-2xl"
        >
          {/* Segmented Switcher Chọn Cá Nhân hay Team */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <span>PHẠM VI ĐỐI TƯỢNG ỦY QUYỀN</span>
              <Tooltip title="Chọn cấp cho một cá nhân cụ thể hoặc ủy quyền đồng loạt cho toàn thể thành viên trong một Team">
                <InfoCircleOutlined className="text-slate-400 hover:text-indigo-500 cursor-pointer" />
              </Tooltip>
            </label>
            <Form.Item name="sharedType" noStyle>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setSharedType('USER');
                    form.setFieldValue('sharedType', 'USER');
                    form.setFieldValue('sharedWithId', undefined);
                  }}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${sharedType === 'USER'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md shadow-slate-200/50 dark:shadow-none border border-indigo-100 dark:border-indigo-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <UserOutlined className="text-sm" />
                  <span>User</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSharedType('TEAM');
                    form.setFieldValue('sharedType', 'TEAM');
                    form.setFieldValue('sharedWithId', undefined);
                  }}
                  className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${sharedType === 'TEAM'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-md shadow-slate-200/50 dark:shadow-none border border-purple-100 dark:border-purple-900/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  <TeamOutlined className="text-sm" />
                  <span>Team</span>
                </button>
              </div>
            </Form.Item>
          </div>

          {/* 1. Chọn Người / Team được chia sẻ */}
          <Form.Item
            name="sharedWithId"
            label={
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {sharedType === 'USER' ? <UserOutlined className="text-indigo-500" /> : <TeamOutlined className="text-purple-500" />}
                {sharedType === 'USER' ? 'Tên Nhân Sự Được Cấp Quyền' : 'Tập Thể Đội Nhóm (Team) Được Ủy Quyền'}
              </span>
            }
            rules={[{ required: true, message: 'Vui lòng chọn đối tượng được nhận quyền!' }]}
            className="mb-1"
          >
            <Select
              placeholder={sharedType === 'USER' ? '🔍 Tìm kiếm theo tên hoặc vị trí nhân sự...' : '🔍 Tìm kiếm đội nhóm kinh doanh / phòng ban...'}
              size="large"
              className="rounded-xl"
              options={
                sharedType === 'USER'
                  ? [
                    { value: 1, label: '👤 Super Admin (Quản trị hệ thống)' },
                    { value: 2, label: '👤 Trưởng Phòng IT (Lê Hoàng Long)' },
                    { value: 3, label: '👤 Leader Social (Nguyễn Văn Minh)' },
                    { value: 4, label: '👤 Chuyên Viên Content (Trần Thị Hoa)' },
                  ]
                  : [
                    { value: 1, label: '👥 Team Social & Content (Phòng Truyền Thông)' },
                    { value: 2, label: '👥 Team TikTok Studio (Sáng Tạo Video)' },
                    { value: 3, label: '👥 Team Facebook Reels Performance' },
                  ]
              }
            />
          </Form.Item>

          {/* 2. Chọn Cấp Độ Quyền Hạn (2 Block 1 Hàng - Gọn Gàng Không Chú Thích) */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
              <CrownOutlined className="text-amber-500" />
              <span>Cấp Độ Quyền Hạn Thao Tác</span>
            </label>

            <Form.Item name="accessLevel" noStyle>
              <div className="grid grid-cols-2 gap-2.5">
                {ACCESS_LEVEL_CARDS.map((card) => {
                  const isChecked = selectedAccessLevel === card.key;
                  return (
                    <div
                      key={card.key}
                      onClick={() => form.setFieldValue('accessLevel', card.key)}
                      className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${isChecked
                        ? 'border-[#7367f0] bg-indigo-50/50 dark:bg-indigo-950/50 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                        }`}
                    >
                      <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0">
                        {card.icon}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                          {card.title}
                        </span>
                        {isChecked && (
                          <CheckCircleOutlined className="text-[#7367f0] text-sm shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Form.Item>
          </div>

          {/* 3. Chọn Thời Hạn Ủy Quyền */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CalendarOutlined className="text-blue-500" />
                <span>Thời Hạn Hết Hạn Ủy Quyền</span>
              </label>

              {/* Quick Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuickExpiration(1)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  +1 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiration(7)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  +7 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiration(30)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  +30 Ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickExpiration(null)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Vĩnh viễn
                </button>
              </div>
            </div>

            <Form.Item name="expireAt" className="mb-0">
              <DatePicker
                showTime
                size="large"
                className="w-full rounded-xl"
                placeholder="Chọn ngày & giờ kết thúc ủy quyền (Bỏ trống nếu cấp vĩnh viễn)"
              />
            </Form.Item>
          </div>

          {/* Dynamic Live Summary Banner */}
          {selectedSharedWithId && (
            <div className="p-3.5 rounded-xl bg-slate-900 text-white dark:bg-indigo-950/80 dark:border dark:border-indigo-800/80 text-xs flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <StarOutlined className="text-amber-400 text-base shrink-0 animate-pulse" />
                <div>
                  <span className="text-slate-400 text-[11px] block">XÁC NHẬN HÀNH ĐỘNG ỦY QUYỀN:</span>
                  <span className="font-bold text-white">
                    Ủy quyền cho <u className="text-indigo-300 decoration-indigo-400 underline-offset-2">{getSelectedTargetName()}</u> với quyền{' '}
                    <span className="text-amber-300 font-extrabold">
                      {ACCESS_LEVEL_CARDS.find(c => c.key === selectedAccessLevel)?.title}
                    </span>
                    {selectedExpireAt ? (
                      <> đến <span className="text-emerald-300 font-mono">{dayjs(selectedExpireAt).format('DD/MM/YYYY HH:mm')}</span></>
                    ) : (
                      <span className="text-slate-300 font-bold"> (Vĩnh viễn)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nút Submit Tràn Chiều Rộng Sang Trọng */}
          <div className="pt-1">
            <Button
              type="primary"
              icon={<ShareAltOutlined />}
              loading={loading}
              htmlType="submit"
              size="large"
              className="w-full rounded-2xl font-extrabold bg-gradient-to-r from-[#7367f0] to-[#8c82f2] hover:from-[#655bd3] hover:to-[#796ee6] border-0 shadow-lg shadow-indigo-500/25 text-white h-11 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              Xác Nhận Cấp Quyền Chia Sẻ DAC
            </Button>
          </div>
        </Form>

        {/* Danh sách đã được chia sẻ */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 m-0 flex items-center gap-2">
              <SafetyCertificateOutlined className="text-indigo-500 text-sm" />
              <span>DANH SÁCH ĐANG ĐƯỢC ỦY QUYỀN</span>
            </h4>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold">
              {sharesList.length} đối tượng
            </span>
          </div>

          {fetching ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <Spin description="Đang tải dữ liệu chia sẻ..." />
            </div>
          ) : sharesList.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-xs text-slate-400 font-medium">
                    Chưa có ủy quyền DAC nào được thiết lập cho tài nguyên này
                  </span>
                }
              />
            </div>
          ) : (
            <Table
              dataSource={sharesList}
              rowKey="id"
              pagination={false}
              size="small"
              className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs"
              columns={[
                {
                  title: 'ĐỐI TƯỢNG',
                  dataIndex: 'sharedWithId',
                  key: 'sharedWithId',
                  render: (val, record) => (
                    <div className="flex items-center gap-2">
                      {record.sharedType === 'TEAM' ? (
                        <Tag color="purple" icon={<TeamOutlined />} className="font-bold text-xs rounded-lg px-2.5 py-0.5 border-0">
                          Team #{val}
                        </Tag>
                      ) : (
                        <Tag color="blue" icon={<UserOutlined />} className="font-bold text-xs rounded-lg px-2.5 py-0.5 border-0">
                          User #{val}
                        </Tag>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'CẤP QUYỀN',
                  dataIndex: 'accessLevel',
                  key: 'accessLevel',
                  render: (level) => {
                    const card = ACCESS_LEVEL_CARDS.find((c) => c.key === level);
                    return (
                      <Tag color={card?.tagColor || 'default'} className="font-extrabold text-[11px] rounded-lg px-2.5 py-0.5 border-0">
                        {card ? `${card.title}` : level}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'THỜI HẠN',
                  dataIndex: 'expireAt',
                  key: 'expireAt',
                  render: (date) => (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <ClockCircleOutlined className="text-slate-400 text-[10px]" />
                      {date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Vĩnh viễn'}
                    </span>
                  ),
                },
                {
                  title: 'THAO TÁC',
                  key: 'action',
                  align: 'right',
                  render: (_, record) => (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      className="font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      onClick={() => handleRemoveShare(record.id)}
                    >
                      Thu hồi
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
