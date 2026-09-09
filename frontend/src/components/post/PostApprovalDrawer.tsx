'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Button,
  Tag,
  Space,
  Avatar,
  Input,
  Popconfirm,
  Badge,
  Descriptions,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UserOutlined,
  CalendarOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface PostApprovalDrawerProps {
  open: boolean;
  onClose: () => void;
  post: any;
  onUpdateStatus: (id: number, status: string, rejectReason?: string) => Promise<void>;
  loading?: boolean;
}

export const PostApprovalDrawer: React.FC<PostApprovalDrawerProps> = ({
  open,
  onClose,
  post,
  onUpdateStatus,
  loading = false,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!post) return null;

  const handleApprove = async () => {
    await onUpdateStatus(post.id, 'APPROVED');
    onClose();
  };

  const handlePublish = async () => {
    await onUpdateStatus(post.id, 'PUBLISHED');
    onClose();
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    await onUpdateStatus(post.id, 'REJECTED', rejectReason.trim());
    setRejectReason('');
    setShowRejectInput(false);
    onClose();
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Tag color="default">Bản Nháp</Tag>;
      case 'PENDING_APPROVE':
        return <Tag color="warning">Chờ Duyệt</Tag>;
      case 'APPROVED':
        return <Tag color="processing">Đã Duyệt</Tag>;
      case 'PUBLISHED':
        return <Tag color="success">Đã Xuất Bản</Tag>;
      case 'REJECTED':
        return <Tag color="error">Từ Chối</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      title={
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
            <SafetyCertificateOutlined className="text-indigo-600" />
            <span>Chi Tiết & Phê Duyệt Bài Đăng</span>
          </div>
          {getStatusTag(post.status)}
        </div>
      }
    >
      <div className="space-y-5">
        {/* Post Metadata Card */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={post.author?.avatar} icon={<UserOutlined />} size={36} />
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{post.author?.name || 'Tác giả'}</div>
                <div className="text-slate-400 text-[11px]">{post.author?.email}</div>
              </div>
            </div>
            <span className="text-slate-400 text-[11px] font-mono">
              {dayjs(post.createdAt).format('HH:mm DD/MM/YYYY')}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
            <div className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{post.title}</div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">Kênh phát hành:</span>
              {(Array.isArray(post.platforms) ? post.platforms : ['FACEBOOK']).map((p: string) => (
                <Tag key={p} color="purple" className="m-0 text-[10px] font-bold rounded-md">
                  {p}
                </Tag>
              ))}
            </div>

            {post.scheduledAt && (
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                <CalendarOutlined /> Hẹn giờ đăng: {dayjs(post.scheduledAt).format('HH:mm DD/MM/YYYY')}
              </div>
            )}
          </div>
        </div>

        {/* Post Main Body Content */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Nội Dung Caption
          </label>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
          {post.hashtags && (
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {post.hashtags}
            </div>
          )}
        </div>

        {/* Attached Media List */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Tài Nguyên Đính Kèm ({post.mediaUrls.length})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {post.mediaUrls.map((url: string, idx: number) => (
                <div key={idx} className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img src={url} alt="Media" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection History / Reason */}
        {post.rejectReason && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-xs text-red-700 dark:text-red-300 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ExclamationCircleOutlined /> Lý do từ chối duyệt trước đó:
            </div>
            <div>{post.rejectReason}</div>
          </div>
        )}

        {/* Action Controls Panel */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {showRejectInput ? (
            <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nhập lý do từ chối duyệt bài:
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Ví dụ: Cần sửa lại caption ngắn gọn hơn, đổi ảnh minh họa..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button size="small" onClick={() => setShowRejectInput(false)}>
                  Hủy
                </Button>
                <Button size="small" type="primary" danger onClick={handleRejectConfirm} loading={loading}>
                  Xác nhận Từ Chối
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setShowRejectInput(true)}
                className="rounded-xl font-bold w-full sm:w-auto"
              >
                Từ Chối Duyệt
              </Button>

              <Space className="w-full sm:w-auto justify-end">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={loading}
                  onClick={handleApprove}
                  className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 border-0"
                >
                  Phê Duyệt
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={loading}
                  onClick={handlePublish}
                  className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-0"
                >
                  Xuất Bản Ngay
                </Button>
              </Space>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
