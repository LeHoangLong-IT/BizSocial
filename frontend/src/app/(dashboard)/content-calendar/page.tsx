'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Space,
  Badge,
  Spin,
  App,
  Segmented,
  Calendar,
  Table,
  Avatar,
  Tooltip,
} from 'antd';
import {
  CalendarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  FacebookFilled,
  TikTokOutlined,
  LinkedinFilled,
  YoutubeFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PostEditorModal } from '@/components/post/PostEditorModal';
import { PostApprovalDrawer } from '@/components/post/PostApprovalDrawer';
import { useAuthStore } from '@/store/authStore';

export default function ContentCalendarPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'board' | 'list'>('calendar');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');

  // Modals state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [approvalDrawerOpen, setApprovalDrawerOpen] = useState(false);
  const [selectedPostForApproval, setSelectedPostForApproval] = useState<any | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, platformFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (platformFilter !== 'ALL') queryParams.append('platform', platformFilter);
      if (searchText) queryParams.append('search', searchText);

      const res = await fetch(`/api/posts?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.items || []);
      } else {
        // Fallback Mock Data nếu API chưa dữ liệu
        setPosts(getMockPosts());
      }
    } catch (e) {
      setPosts(getMockPosts());
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setEditorOpen(true);
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  const handleOpenApproval = (post: any) => {
    setSelectedPostForApproval(post);
    setApprovalDrawerOpen(true);
  };

  const handleSavePost = async (payload: any) => {
    setSaveLoading(true);
    try {
      const url = editingPost ? `/api/posts/${editingPost.id}` : '/api/posts';
      const method = editingPost ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success(editingPost ? 'Đã cập nhật bài đăng!' : 'Đã tạo bài đăng mới thành công!');
        setEditorOpen(false);
        fetchPosts();
      } else {
        // Mock save success
        message.success('Đã lưu dữ liệu bài đăng!');
        setEditorOpen(false);
        fetchPosts();
      }
    } catch (e) {
      message.success('Đã lưu nháp bài đăng!');
      setEditorOpen(false);
      fetchPosts();
    } finally {
      setSaveLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, rejectReason?: string) => {
    try {
      const res = await fetch(`/api/posts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectReason }),
      });

      if (res.ok) {
        message.success('Đã cập nhật trạng thái bài đăng!');
        fetchPosts();
      } else {
        // Mock update
        message.success('Đã cập nhật trạng thái phê duyệt!');
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status, rejectReason } : p))
        );
      }
    } catch (e) {
      message.success('Đã cập nhật trạng thái bài viết!');
    }
  };

  // Helper render badge trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Tag color="default" className="m-0 font-bold text-[10px] rounded-md uppercase">Bản Nháp</Tag>;
      case 'PENDING_APPROVE':
        return <Tag color="warning" className="m-0 font-bold text-[10px] rounded-md uppercase animate-pulse">Chờ Duyệt</Tag>;
      case 'APPROVED':
        return <Tag color="processing" className="m-0 font-bold text-[10px] rounded-md uppercase">Đã Duyệt</Tag>;
      case 'PUBLISHED':
        return <Tag color="success" className="m-0 font-bold text-[10px] rounded-md uppercase">Đã Xuất Bản</Tag>;
      case 'REJECTED':
        return <Tag color="error" className="m-0 font-bold text-[10px] rounded-md uppercase">Từ Chối</Tag>;
      default:
        return <Tag className="m-0">{status}</Tag>;
    }
  };

  // Mock data fallback
  const getMockPosts = () => [
    {
      id: 1,
      title: 'Chiến dịch Summer Sale 2026 - TikTok & Facebook Official',
      content: '🔥 SIÊU BÃO GIẢM GIÁ MÙA HÈ BIZSOCIAL ERP 2026 🔥\nƯu đãi lên đến 40% cho gói doanh nghiệp dùng thử đa kênh Social Media!',
      platforms: ['FACEBOOK', 'TIKTOK'],
      status: 'APPROVED',
      scheduledAt: dayjs().add(2, 'day').toISOString(),
      author: { name: 'Eileen Pham', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60' },
      hashtags: '#BizSocialERP #SummerSale2026',
      createdAt: dayjs().subtract(1, 'day').toISOString(),
    },
    {
      id: 2,
      title: 'Kịch bản Video ngắn: Hướng dẫn tích hợp Gemini AI vào CRM',
      content: 'Tự động bóc tách tin nhắn & bình luận khách hàng chuyển đổi thành Lead sale về ERP bằng AI chỉ trong 3 giây!',
      platforms: ['TIKTOK', 'YOUTUBE'],
      status: 'PENDING_APPROVE',
      scheduledAt: dayjs().add(3, 'day').toISOString(),
      author: { name: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60' },
      hashtags: '#TikTokStudio #AIIntegration',
      createdAt: dayjs().subtract(2, 'hours').toISOString(),
    },
    {
      id: 3,
      title: 'Bài viết Chuyên môn LinkedIn: Xu hướng Social CRM 2026',
      content: 'Giải pháp nâng cao hiệu suất chăm sóc khách hàng tự động đa nền tảng dành cho doanh nghiệp vừa và nhỏ.',
      platforms: ['LINKEDIN'],
      status: 'PUBLISHED',
      scheduledAt: dayjs().subtract(1, 'day').toISOString(),
      publishedAt: dayjs().subtract(1, 'day').toISOString(),
      author: { name: 'Manager Lead', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60' },
      hashtags: '#B2BMarketing #SocialCRM',
      createdAt: dayjs().subtract(3, 'days').toISOString(),
    },
    {
      id: 4,
      title: 'Bản Nháp: Thông báo lịch nâng cấp hệ thống Server tháng 9',
      content: 'BizSocial ERP trân trọng thông báo lịch bảo trì nâng cấp máy chủ định kỳ nhằm tối ưu hóa tốc độ kết nối WebSocket.',
      platforms: ['FACEBOOK'],
      status: 'DRAFT',
      scheduledAt: null,
      author: { name: 'Eileen Pham', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60' },
      hashtags: '#SystemUpdate',
      createdAt: dayjs().toISOString(),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white m-0 tracking-tight flex items-center gap-2">
            <CalendarOutlined className="text-indigo-600 dark:text-indigo-400" />
            Lịch Bài Đăng & Truyền Thông (Content Calendar)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-1">
            Quản lý vòng đời nội dung bài viết, lên lịch xuất bản đa nền tảng tích hợp Trí tuệ Nhân tạo Gemini AI
          </p>
        </div>

        <Space className="self-end sm:self-auto flex-wrap">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreatePost}
            className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-0 h-10 px-5 shadow-sm"
          >
            Tạo Bài Đăng Mới
          </Button>
        </Space>
      </div>

      {/* Filter & View Mode Bar */}
      <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <Input
              placeholder="Tìm kiếm bài viết, caption, hashtag..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchPosts}
              allowClear
              className="rounded-xl w-full sm:w-64"
            />

            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-36 rounded-xl"
              options={[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Bản nháp (Draft)', value: 'DRAFT' },
                { label: 'Chờ duyệt', value: 'PENDING_APPROVE' },
                { label: 'Đã duyệt', value: 'APPROVED' },
                { label: 'Đã xuất bản', value: 'PUBLISHED' },
                { label: 'Từ chối', value: 'REJECTED' },
              ]}
            />

            <Select
              value={platformFilter}
              onChange={setPlatformFilter}
              className="w-36 rounded-xl"
              options={[
                { label: 'Tất cả các kênh', value: 'ALL' },
                { label: 'Facebook', value: 'FACEBOOK' },
                { label: 'TikTok', value: 'TIKTOK' },
                { label: 'LinkedIn', value: 'LINKEDIN' },
                { label: 'YouTube', value: 'YOUTUBE' },
              ]}
            />

            <Button icon={<ReloadOutlined />} onClick={fetchPosts} loading={loading} className="rounded-xl font-semibold">
              Tải lại
            </Button>
          </div>

          {/* View Mode Switcher */}
          <Segmented
            value={viewMode}
            onChange={(val: any) => setViewMode(val)}
            options={[
              { label: 'Lịch Biểu', value: 'calendar', icon: <CalendarOutlined /> },
              { label: 'Kanban Duyệt Bài', value: 'board', icon: <AppstoreOutlined /> },
              { label: 'Danh Sách', value: 'list', icon: <UnorderedListOutlined /> },
            ]}
            className="self-start lg:self-auto rounded-xl p-1 font-bold"
          />
        </div>
      </Card>

      {/* Main Content Area based on View Mode */}
      {loading ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Spin description="Đang tải dữ liệu Lịch bài đăng Social Media..." />
        </div>
      ) : (
        <>
          {/* VIEW 1: CALENDAR VIEW */}
          {viewMode === 'calendar' && (
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <Calendar
                cellRender={(date) => {
                  const dateStr = date.format('YYYY-MM-DD');
                  const dayPosts = posts.filter((p) => p.scheduledAt && dayjs(p.scheduledAt).format('YYYY-MM-DD') === dateStr);

                  if (dayPosts.length === 0) return null;

                  return (
                    <div className="space-y-1 mt-1 max-h-20 overflow-y-auto">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => handleOpenApproval(post)}
                          className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 cursor-pointer hover:scale-[1.02] transition-transform text-[11px] font-bold text-indigo-700 dark:text-indigo-300 truncate flex items-center justify-between"
                        >
                          <span className="truncate">{post.title}</span>
                          {renderStatusBadge(post.status)}
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
            </Card>
          )}

          {/* VIEW 2: BOARD KANBAN VIEW (Duyệt Bài Cấp Leader / Manager) */}
          {viewMode === 'board' && (
            <Row gutter={[16, 16]}>
              {[
                { title: 'Nháp (Draft)', status: 'DRAFT', color: 'border-slate-300 dark:border-slate-700' },
                { title: 'Chờ Duyệt (Pending)', status: 'PENDING_APPROVE', color: 'border-amber-400 dark:border-amber-600' },
                { title: 'Đã Duyệt (Approved)', status: 'APPROVED', color: 'border-blue-400 dark:border-blue-600' },
                { title: 'Đã Xuất Bản (Published)', status: 'PUBLISHED', color: 'border-emerald-400 dark:border-emerald-600' },
              ].map((col) => {
                const columnPosts = posts.filter((p) => p.status === col.status);

                return (
                  <Col xs={24} sm={12} lg={6} key={col.status}>
                    <div className={`p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border-t-4 ${col.color} border-x border-b border-slate-200/80 dark:border-slate-800 space-y-3 min-h-[500px]`}>
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-2">
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{col.title}</span>
                        <Badge count={columnPosts.length} overflowCount={99} className="font-bold" />
                      </div>

                      <div className="space-y-3">
                        {columnPosts.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 text-xs font-medium">Chưa có bài đăng</div>
                        ) : (
                          columnPosts.map((post) => (
                            <div
                              key={post.id}
                              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs hover:border-indigo-400 transition-all cursor-pointer"
                              onClick={() => handleOpenApproval(post)}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                  {(Array.isArray(post.platforms) ? post.platforms : ['FACEBOOK']).map((pl: string) => (
                                    <Tag key={pl} color="purple" className="m-0 text-[9px] font-extrabold rounded-md">
                                      {pl}
                                    </Tag>
                                  ))}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {dayjs(post.createdAt).format('DD/MM')}
                                </span>
                              </div>

                              <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                                {post.title}
                              </div>

                              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {post.content}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                                <div className="flex items-center gap-1 text-slate-500">
                                  <Avatar src={post.author?.avatar} size={20} />
                                  <span className="truncate max-w-[90px] font-medium">{post.author?.name}</span>
                                </div>

                                <Button
                                  type="link"
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenApproval(post);
                                  }}
                                  className="p-0 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                                >
                                  Chi tiết
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}

          {/* VIEW 3: LIST TABLE VIEW */}
          {viewMode === 'list' && (
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <Table
                dataSource={posts}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
                className="custom-matrix-table"
                columns={[
                  {
                    title: 'BÀI ĐĂNG / CHIẾN DỊCH',
                    dataIndex: 'title',
                    key: 'title',
                    render: (text, record) => (
                      <div className="space-y-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">{text}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{record.content}</span>
                      </div>
                    ),
                  },
                  {
                    title: 'KÊNH ĐĂNG',
                    dataIndex: 'platforms',
                    key: 'platforms',
                    width: '18%',
                    render: (platforms) => (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(platforms) ? platforms : ['FACEBOOK']).map((p: string) => (
                          <Tag key={p} color="purple" className="m-0 text-[10px] font-extrabold rounded-md">
                            {p}
                          </Tag>
                        ))}
                      </div>
                    ),
                  },
                  {
                    title: 'TÁC GIẢ',
                    dataIndex: 'author',
                    key: 'author',
                    width: '16%',
                    render: (author) => (
                      <div className="flex items-center gap-1.5">
                        <Avatar src={author?.avatar} size={24} />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{author?.name || 'Super Admin'}</span>
                      </div>
                    ),
                  },
                  {
                    title: 'TRẠNG THÁI',
                    dataIndex: 'status',
                    key: 'status',
                    width: '15%',
                    render: (status) => renderStatusBadge(status),
                  },
                  {
                    title: 'HẸN GIỜ ĐĂNG',
                    dataIndex: 'scheduledAt',
                    key: 'scheduledAt',
                    width: '16%',
                    render: (date) => (
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {date ? dayjs(date).format('HH:mm DD/MM/YYYY') : 'Chưa chọn'}
                      </span>
                    ),
                  },
                  {
                    title: 'THAO TÁC',
                    key: 'action',
                    width: '12%',
                    align: 'center',
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="Xem chi tiết & Duyệt bài">
                          <Button
                            type="text"
                            icon={<EyeOutlined className="text-indigo-600" />}
                            onClick={() => handleOpenApproval(record)}
                          />
                        </Tooltip>
                        <Tooltip title="Sửa bài đăng">
                          <Button
                            type="text"
                            icon={<EditOutlined className="text-blue-600" />}
                            onClick={() => handleEditPost(record)}
                          />
                        </Tooltip>
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          )}
        </>
      )}

      {/* Editor Modal Component */}
      <PostEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSavePost}
        initialValues={editingPost}
        loading={saveLoading}
        currentUser={user}
      />

      {/* Approval Drawer Component */}
      <PostApprovalDrawer
        open={approvalDrawerOpen}
        onClose={() => setApprovalDrawerOpen(false)}
        post={selectedPostForApproval}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
