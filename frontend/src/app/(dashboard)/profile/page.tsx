"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Divider,
  Badge,
  Spin,
  Progress,
  Table,
  Tooltip,
  Space,
  Switch,
  Modal,
  Drawer,
} from 'antd';
import { useNotificationStore } from '@/store/notificationStore';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  SaveOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CrownOutlined,
  BankOutlined,
  CalendarOutlined,
  TeamOutlined,
  ProjectOutlined,
  LinkOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  PlusOutlined,
  EditOutlined,
  RightOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  DisconnectOutlined,
  SettingOutlined,
  MoreOutlined,
  TrophyOutlined,
  FireOutlined,
  StarOutlined,
  BellOutlined,
  FolderOpenOutlined,
  RiseOutlined,
  HistoryOutlined,
  SafetyOutlined,
  AuditOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  NotificationOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  GlobalOutlined as EarthIcon,
  CameraOutlined,
  ScissorOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { ImageCropModal } from '@/components/common/ImageCropModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Bộ Hình ảnh Logo Mạng xã hội Thực tế HD chuẩn 100% từ CDN
const FacebookOfficialIcon = () => (
  <img
    src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
    alt="Facebook Logo"
    className="w-6 h-6 object-contain inline-block shrink-0"
  />
);

const TikTokOfficialIcon = () => (
  <img
    src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
    alt="TikTok Logo"
    className="w-6 h-6 object-contain inline-block shrink-0 rounded-md"
  />
);

const YoutubeOfficialIcon = () => (
  <img
    src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
    alt="YouTube Logo"
    className="w-6 h-6 object-contain inline-block shrink-0"
  />
);

const InstagramOfficialIcon = () => (
  <img
    src="https://cdn-icons-png.flaticon.com/512/1409/1409946.png"
    alt="Instagram Logo"
    className="w-6 h-6 object-contain inline-block shrink-0"
  />
);

// Component Widget Media Uploads Tương Tác với VNĐ, Hover Line & Circle Dot, Scroll Zoom (4-12 tháng)
const MediaUploadsWidget = () => {
  const FULL_YEAR_DATA = [
    { month: 'Thg 1', fullMonth: 'Tháng 1', value: 35000000, change: '+12%' },
    { month: 'Thg 2', fullMonth: 'Tháng 2', value: 42000000, change: '+18%' },
    { month: 'Thg 3', fullMonth: 'Tháng 3', value: 50000000, change: '+15%' },
    { month: 'Thg 4', fullMonth: 'Tháng 4', value: 70000000, change: '+20%' },
    { month: 'Thg 5', fullMonth: 'Tháng 5', value: 40000000, change: '-10%' },
    { month: 'Thg 6', fullMonth: 'Tháng 6', value: 45000000, change: '+24%' },
    { month: 'Thg 7', fullMonth: 'Tháng 7', value: 100000000, change: '+45%' },
    { month: 'Thg 8', fullMonth: 'Tháng 8', value: 55000000, change: '-12%' },
    { month: 'Thg 9', fullMonth: 'Tháng 9', value: 85000000, change: '+30%' },
    { month: 'Thg 10', fullMonth: 'Tháng 10', value: 65000000, change: '+8%' },
    { month: 'Thg 11', fullMonth: 'Tháng 11', value: 78000000, change: '+14%' },
    { month: 'Thg 12', fullMonth: 'Tháng 12', value: 92000000, change: '+22%' },
  ];

  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(2);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleData = FULL_YEAR_DATA.slice(0, visibleCount);

  useEffect(() => {
    const elem = containerRef.current;
    if (!elem) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setVisibleCount((prev) => Math.max(4, prev - 1));
      } else {
        setVisibleCount((prev) => Math.min(12, prev + 1));
      }
    };

    elem.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      elem.removeEventListener('wheel', onWheel);
    };
  }, []);

  const svgWidth = 1000;
  const svgHeight = 200;
  const topPad = 20;
  const bottomPad = 180;
  const maxValue = 100000000;

  const points = visibleData.map((d, i) => {
    const x = (i / Math.max(1, visibleData.length - 1)) * svgWidth;
    const y = bottomPad - (d.value / maxValue) * (bottomPad - topPad);
    return { x, y, data: d, index: i };
  });

  let linePathD = '';
  if (points.length > 0) {
    linePathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      linePathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
  }

  const areaPathD = linePathD ? `${linePathD} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z` : '';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, mouseX / rect.width));
    const closestIdx = Math.round(pct * (visibleData.length - 1));
    setHoveredIdx(closestIdx);
  };

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;

  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-white m-0">Tải lên Media</h3>
        </div>
        <Button type="text" shape="circle" icon={<MoreOutlined className="text-slate-400 text-lg" />} />
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIdx(null)}
        className="relative w-full cursor-crosshair select-none"
      >
        <div className="h-60 relative flex flex-col justify-between py-2">
          {/* Dashed Grid Lines & Y-Axis in VNĐ */}
          <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 font-mono pointer-events-none pb-6">
            {['100 Tr ₫', '80 Tr ₫', '60 Tr ₫', '40 Tr ₫', '20 Tr ₫', '0 ₫'].map((label) => (
              <div key={label} className="flex items-center gap-3 w-full">
                <span className="w-14 text-right shrink-0 font-sans font-medium text-slate-400 dark:text-slate-500">{label}</span>
                <div className="w-full border-b border-dashed border-slate-100 dark:border-slate-800" />
              </div>
            ))}
          </div>

          {/* SVG Smooth Curve Path & Interactive Overlay */}
          <div className="pl-16 pr-4 pt-3 pb-8 h-full w-full relative z-10">
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="mediaGradVN" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPathD} fill="url(#mediaGradVN)" />
              <path
                d={linePathD}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Hover Elements: Vertical Dashed Line, Circle Dot & Tooltip */}
            {activePoint && (
              <>
                {/* Vertical Dashed Line */}
                <div
                  className="absolute top-3 bottom-8 border-l-2 border-dashed border-blue-400 pointer-events-none z-20 transition-all duration-75"
                  style={{
                    left: `calc(64px + (100% - 80px) * ${activePoint.x / svgWidth})`,
                  }}
                />

                {/* Hover Dot Circle on Curve */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-white border-4 border-blue-500 shadow-md pointer-events-none z-30 transition-all duration-75 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(64px + (100% - 80px) * ${activePoint.x / svgWidth})`,
                    top: `calc(12px + (100% - 44px) * ${activePoint.y / svgHeight})`,
                  }}
                />

                {/* Floating Tooltip Card */}
                <div
                  className="absolute z-40 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3.5 shadow-xl pointer-events-none transition-all duration-75 min-w-[170px]"
                  style={{
                    left: `calc(64px + (100% - 80px) * ${activePoint.x / svgWidth})`,
                    top: `calc(12px + (100% - 44px) * ${activePoint.y / svgHeight})`,
                    transform:
                      activePoint.index >= visibleData.length - 2
                        ? 'translate(-108%, -50%)'
                        : 'translate(12%, -50%)',
                  }}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Doanh số {activePoint.data.fullMonth}, 2026
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                    <span>{activePoint.data.value.toLocaleString('vi-VN')} ₫</span>
                    <span className={`text-xs font-semibold ${activePoint.data.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {activePoint.data.change}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* X-Axis Month Labels */}
          <div className="flex justify-between pl-16 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {visibleData.map((m) => (
              <span key={m.month} className="text-center">
                {m.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function UserProfilePage() {
  const { message } = App.useApp();
  const { user, token, permissions, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // State Module Upload & Crop (Avatar & Banner Cover)
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar');
  const [selectedRawImage, setSelectedRawImage] = useState<string | null>(null);
  const [draftAvatar, setDraftAvatar] = useState<string | null>(null);
  const [draftBanner, setDraftBanner] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const bannerFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // State Tìm kiếm & Bộ lọc cho Tab Dự án Video
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('ALL');

  // State Cài đặt thông báo cá nhân
  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true,
    systemBanners: true,
    telegramBot: true,
    crmLeadAssign: true,
    postApprovalAlert: true,
  });

  const userAvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80";
  const displayAvatar = draftAvatar || dbUser?.avatar || user?.avatar || userAvatarUrl;
  const displayBanner = draftBanner || dbUser?.coverImage || user?.coverImage || null;

  const handleTriggerSelectAvatar = () => {
    setCropType('avatar');
    fileInputRef.current?.click();
  };

  const handleTriggerSelectBanner = () => {
    setCropType('banner');
    bannerFileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn tệp hình ảnh hợp lệ!');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropType(type);
        setSelectedRawImage(event.target.result as string);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (croppedBase64: string) => {
    if (cropType === 'avatar') {
      setDraftAvatar(croppedBase64);
      message.info('Đã cập nhật bản nháp Avatar mới!');
    } else {
      setDraftBanner(croppedBase64);
      message.info('Đã cập nhật bản nháp Ảnh bìa Banner mới!');
    }
  };

  // Hàm lấy Header Authorization linh hoạt (fallback localStorage nếu Zustand token chưa sẵn sàng)
  const getAuthHeader = () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
  };

  // Lấy dữ liệu chi tiết người dùng thực tế từ Database thông qua API
  const fetchUserProfile = async () => {
    if (!user?.id) return;
    setFetching(true);
    try {
      const res = await axios.get(`${API_BASE}/users/${user.id}`, { headers: getAuthHeader() });
      const data = res.data;
      setDbUser(data);
    } catch (err: any) {
      console.error('Lỗi tải thông tin user từ DB:', err);
      if (err.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn (Lỗi 401). Vui lòng đăng nhập lại!');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleOpenEditModal = () => {
    profileForm.setFieldsValue({
      name: dbUser?.name || user?.name || '',
      email: dbUser?.email || user?.email || '',
      phone: dbUser?.phone || '',
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user?.id]);

  const handleUpdateProfile = async (values: any) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const payload: any = {
        name: values.name,
        phone: values.phone,
      };

      if (draftAvatar) {
        payload.avatar = draftAvatar;
      }
      if (draftBanner) {
        payload.coverImage = draftBanner;
      }

      const res = await axios.patch(
        `${API_BASE}/users/${user.id}`,
        payload,
        { headers: getAuthHeader() }
      );

      const updatedUser = res.data?.user;
      if (updatedUser) {
        setDbUser(updatedUser);
        updateUser({
          name: updatedUser.name,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          coverImage: updatedUser.coverImage,
        });
      }
      setDraftAvatar(null);
      setDraftBanner(null);
      message.success('Cập nhật thông tin hồ sơ thành công!');
      fetchUserProfile();
    } catch (err: any) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      if (err.response?.status === 401) {
        message.error('Phiên làm việc đã hết hạn hoặc không có quyền (Lỗi 401). Vui lòng đăng nhập lại!');
      } else {
        message.error(err.response?.data?.message || 'Không thể cập nhật thông tin!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setPassLoading(true);
    setTimeout(() => {
      setPassLoading(false);
      passwordForm.resetFields();
      message.success('Đổi mật khẩu tài khoản thành công!');
    }, 600);
  };

  // Dữ liệu DB động
  const displayName = dbUser?.name || user?.name || 'Chưa cập nhật';
  const displayRole = dbUser?.role?.name || user?.roleName || 'Employee';
  const displayTeam = dbUser?.team?.name || dbUser?.department?.name || 'Chưa phân đội nhóm';
  const displayJoinDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
    : 'Chưa cập nhật';
  const displayPhone = dbUser?.phone || 'Chưa có SĐT';
  const displayEmail = dbUser?.email || user?.email || '';

  // Mock dữ liệu Dự án / Video đã & đang thực hiện của User
  const mockProjects = [
    {
      key: '1',
      name: 'Chiến dịch TikTok Viral Summer 2026',
      type: 'Video Content',
      leader: 'Eileen (Leader)',
      progress: 85,
      status: 'Đang sản xuất',
      date: '10/05/2026',
      views: '125K Views',
    },
    {
      key: '2',
      name: 'Series Facebook Reel Giới Thiệu Sản Phẩm ERP',
      type: 'Short Video',
      leader: 'Owen',
      progress: 100,
      status: 'Hoàn thành',
      date: '03/04/2026',
      views: '45K Views',
    },
    {
      key: '3',
      name: 'Bộ Banner & Clip Quảng Cáo Tuyển Dụng Intern',
      type: 'Graphic & Video',
      leader: 'Keith',
      progress: 60,
      status: 'Đang duyệt',
      date: '12/08/2026',
      views: '18K Views',
    },
    {
      key: '4',
      name: 'Chương Trình Đào Tạo Thực Tập Sinh Trực Page',
      type: 'Training Course',
      leader: 'Merline',
      progress: 40,
      status: 'Đang sản xuất',
      date: '19/08/2026',
      views: 'N/A',
    },
  ];

  // Dữ liệu Widget Projects
  const projectsWidgetData = [
    {
      key: '1',
      name: 'Acme software development',
      progress: 45,
      statusColor: '#3b82f6',
      people: [
        { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop' },
      ],
      extraPeople: '+3',
      dueDate: '24 Aug, 2024',
    },
    {
      key: '2',
      name: 'Strategic Partnership Deal',
      progress: 0,
      statusColor: '#cbd5e1',
      people: [
        { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop' },
      ],
      extraPeople: 'M',
      dueDate: '10 Sep, 2024',
    },
    {
      key: '3',
      name: 'Client Onboarding',
      progress: 18,
      statusColor: '#3b82f6',
      people: [
        { avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop' },
      ],
      extraPeople: '',
      dueDate: '19 Sep, 2024',
    },
    {
      key: '4',
      name: 'Widget Supply Agreement',
      progress: 100,
      statusColor: '#22c55e',
      people: [
        { avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop' },
      ],
      extraPeople: '+1',
      dueDate: '5 May, 2024',
    },
    {
      key: '5',
      name: 'Project X Redesign',
      progress: 65,
      statusColor: '#3b82f6',
      people: [
        { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop' },
        { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop' },
      ],
      extraPeople: '+2',
      dueDate: '1 Feb, 2025',
    },
  ];

  // Mock danh sách Teams mà user tham gia
  const mockTeamsList = [
    {
      id: '1',
      name: displayTeam,
      roleTag: displayRole,
      membersCount: 12,
      desc: 'Đội ngũ trực thuộc quản lý trực tiếp các hoạt động truyền thông và nội dung ERP.',
      color: 'blue',
    },
    {
      id: '2',
      name: 'Content Creator Team',
      roleTag: 'Creator',
      membersCount: 24,
      desc: 'Sáng tạo kịch bản, biên tập nội dung bài đăng Social Media và chăm sóc Fanpage.',
      color: 'purple',
    },
    {
      id: '3',
      name: 'Video & Short Film Studio',
      roleTag: 'Editor / Camera',
      membersCount: 8,
      desc: 'Quay chụp, dựng video ngắn TikTok/Reels/Shorts quảng bá thương hiệu.',
      color: 'emerald',
    },
    {
      id: '4',
      name: 'Social Ads & Performance',
      roleTag: 'Marketer',
      membersCount: 15,
      desc: 'Tối ưu hoá chiến dịch quảng cáo trả phí và phân tích chỉ số chuyển đổi CRM.',
      color: 'amber',
    },
  ];

  // Mock Social Connections mà Admin yêu cầu
  const mockSocialConnections = [
    {
      id: 'facebook',
      name: 'Facebook Fanpage',
      icon: <FacebookOfficialIcon />,
      required: true,
      connected: true,
      account: `@${displayName.toLowerCase().replace(/\s+/g, '')}.biz`,
      syncDate: 'Hôm qua',
    },
    {
      id: 'tiktok',
      name: 'TikTok Official Channel',
      icon: <TikTokOfficialIcon />,
      required: true,
      connected: true,
      account: `@${displayName.toLowerCase().replace(/\s+/g, '')}_tiktok`,
      syncDate: '3 ngày trước',
    },
    {
      id: 'youtube',
      name: 'YouTube Channel',
      icon: <YoutubeOfficialIcon />,
      required: true,
      connected: false,
      account: 'Chưa liên kết',
      syncDate: 'N/A',
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      icon: <InstagramOfficialIcon />,
      required: false,
      connected: true,
      account: '@intern_invo',
      syncDate: '1 tuần trước',
    },
  ];

  // Mock dữ liệu Activity Timeline (Nhật ký hoạt động)
  const mockActivityTimeline = [
    {
      id: '1',
      time: '10:30 Hôm nay',
      title: 'Xuất bản bài đăng Facebook Reels "Chiến dịch Summer 2026"',
      category: 'Social Content',
      icon: <CheckCircleFilled className="text-emerald-500 text-base" />,
      tagColor: 'green',
    },
    {
      id: '2',
      time: '09:15 Hôm nay',
      title: 'Phê duyệt 2 bài viết nháp về Đào Tạo cho Intern Eileen',
      category: 'Content Approval',
      icon: <ThunderboltOutlined className="text-amber-500 text-base" />,
      tagColor: 'gold',
    },
    {
      id: '3',
      time: '16:45 Hôm qua',
      title: 'Đồng bộ 3 Lead CRM từ Facebook Fanpage về hệ thống ERP',
      category: 'Social CRM',
      icon: <RiseOutlined className="text-indigo-500 text-base" />,
      tagColor: 'blue',
    },
    {
      id: '4',
      time: '14:20 04/09/2026',
      title: 'Cập nhật thông tin số điện thoại cá nhân vào Database',
      category: 'Profile Update',
      icon: <UserOutlined className="text-slate-400 text-base" />,
      tagColor: 'default',
    },
    {
      id: '5',
      time: '08:30 02/09/2026',
      title: 'Hoàn thành bài kiểm tra Quy trình Trực Page (Sandbox Exam Score: 95/100)',
      category: 'Sandbox Training',
      icon: <TrophyOutlined className="text-purple-500 text-base" />,
      tagColor: 'purple',
    },
  ];

  // Mock dữ liệu Huy hiệu & Gamification Badges (Clean Professional ERP)
  const mockBadges = [
    {
      id: '1',
      name: 'TikTok 1M+ Views',
      desc: 'Sở hữu video ngắn trên kênh TikTok Official đạt cột mốc 1.000.000 lượt xem thực tế.',
      icon: <StarOutlined className="text-cyan-500 text-2xl" />,
      tier: 'KIM CƯƠNG',
      tagColor: 'cyan',
      unlockedDate: '01/09/2026',
      iconBoxBg: 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800/60',
    },
    {
      id: '2',
      name: 'Chuyên Gia Duyệt Bài',
      desc: 'Phê duyệt hơn 100 bài nháp cho Intern đúng hạn với đánh giá chất lượng xuất sắc.',
      icon: <FireOutlined className="text-purple-500 text-2xl" />,
      tier: 'BẠCH KIM',
      tagColor: 'purple',
      unlockedDate: '25/08/2026',
      iconBoxBg: 'bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60',
    },
    {
      id: '3',
      name: 'Top Content Creator',
      desc: 'Sáng tạo hơn 50 bài viết chất lượng cao đạt chỉ số tương tác & chuyển đổi nổi bật.',
      icon: <TrophyOutlined className="text-amber-500 text-2xl" />,
      tier: 'VÀNG',
      tagColor: 'gold',
      unlockedDate: '18/08/2026',
      iconBoxBg: 'bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60',
    },
    {
      id: '4',
      name: 'Chiến Binh CRM ERP',
      desc: 'Chuyển đổi thành công 50+ Lead từ Comment/Inbox thành Ticket ERP chính thức.',
      icon: <RiseOutlined className="text-emerald-500 text-2xl" />,
      tier: 'VÀNG',
      tagColor: 'green',
      unlockedDate: '10/08/2026',
      iconBoxBg: 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60',
    },
  ];

  // Mock dữ liệu Ma Trận Phân Quyền Cá Nhân (My RBAC Matrix)
  const mockMyPermissions = [
    {
      module: 'Social Media (Quản lý Bài đăng)',
      actions: [
        { name: 'CREATE', label: 'Tạo bài nháp', granted: true, scope: 'PERSONAL' },
        { name: 'READ', label: 'Xem lịch bài đăng', granted: true, scope: 'TEAM' },
        { name: 'UPDATE', label: 'Chỉnh sửa bài', granted: true, scope: 'PERSONAL' },
        { name: 'DELETE', label: 'Xóa bài đăng', granted: false, scope: 'NONE' },
        { name: 'APPROVE', label: 'Duyệt bài nháp', granted: true, scope: 'TEAM' },
      ],
    },
    {
      module: 'Social CRM (Hộp thư & Lead ERP)',
      actions: [
        { name: 'CREATE', label: 'Tạo Lead mới', granted: true, scope: 'TEAM' },
        { name: 'READ', label: 'Xem Inbox / Comment', granted: true, scope: 'TEAM' },
        { name: 'UPDATE', label: 'Cập nhật Ticket', granted: true, scope: 'TEAM' },
        { name: 'DELETE', label: 'Xóa Lead', granted: false, scope: 'NONE' },
        { name: 'APPROVE', label: 'Duyệt Chuyển Lead ERP', granted: true, scope: 'DEPARTMENT' },
      ],
    },
    {
      module: 'Tuyển Dụng (Social Recruiting)',
      actions: [
        { name: 'CREATE', label: 'Đăng Job tuyển dụng', granted: true, scope: 'TEAM' },
        { name: 'READ', label: 'Xem CV ứng viên', granted: true, scope: 'DEPARTMENT' },
        { name: 'UPDATE', label: 'Cập nhật lịch phỏng vấn', granted: true, scope: 'TEAM' },
        { name: 'DELETE', label: 'Xóa hồ sơ', granted: false, scope: 'NONE' },
        { name: 'APPROVE', label: 'Duyệt tuyển dụng', granted: false, scope: 'NONE' },
      ],
    },
    {
      module: 'Đào Tạo & Sandbox (Training)',
      actions: [
        { name: 'CREATE', label: 'Tạo bài test Mock', granted: true, scope: 'TEAM' },
        { name: 'READ', label: 'Xem tài liệu đào tạo', granted: true, scope: 'GLOBAL' },
        { name: 'UPDATE', label: 'Chấm điểm bài test', granted: true, scope: 'TEAM' },
        { name: 'DELETE', label: 'Xóa đề thi', granted: false, scope: 'NONE' },
        { name: 'APPROVE', label: 'Duyệt Intern lên Nhân viên', granted: true, scope: 'TEAM' },
      ],
    },
  ];

  // Mock Kho Media Nháp Cá Nhân (Media Vault)
  const mockVaultItems = [
    { id: '1', name: 'Banner_TikTok_Summer_2026.png', size: '2.4 MB', type: 'Image', date: '05/09/2026' },
    { id: '2', name: 'Video_Review_ERP_Cut_v2.mp4', size: '48.5 MB', type: 'Video', date: '03/09/2026' },
    { id: '3', name: 'Kich_Ban_Reels_Tuyen_Dung.docx', size: '320 KB', type: 'Doc', date: '01/09/2026' },
    { id: '4', name: 'Asset_Logo_Brand_HD.png', size: '1.1 MB', type: 'Image', date: '28/08/2026' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER BANNER (Vuexy style chuẩn đẹp) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Banner Cover Image Gradient */}
        <div
          className="h-44 sm:h-56 w-full bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] relative bg-cover bg-center transition-all duration-300"
          style={displayBanner ? { backgroundImage: `url(${displayBanner})` } : {}}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute right-4 top-4 sm:right-5 sm:top-5 flex items-center gap-2">
            {/* Nút Bánh răng Cài đặt Hồ sơ dành riêng cho Mobile */}
            <Tooltip title="Chỉnh sửa hồ sơ">
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="md:hidden w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white/30 active:scale-90 transition-all shadow-xs cursor-pointer"
                aria-label="Chỉnh sửa hồ sơ"
              >
                <SettingOutlined className="text-base" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 sm:px-8 pb-5">
          {/* Avatar + Main Info Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Left: Avatar & User Metadata */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* CHỈ áp dụng margin âm cho Avatar để lấn lên Banner */}
              <div className="relative shrink-0 -mt-14 sm:-mt-16 group rounded-full p-1 bg-white dark:bg-slate-900 border-2 border-indigo-500/80 dark:border-indigo-400/80 shadow-xl transition-all">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleImageFileChange(e, 'avatar')}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  onChange={(e) => handleImageFileChange(e, 'banner')}
                  accept="image/*"
                  className="hidden"
                />
                <Avatar
                  size={120}
                  src={displayAvatar}
                  icon={<UserOutlined />}
                  className="object-cover rounded-full bg-white transition-all block"
                />
                <span className="w-4.5 h-4.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-1 right-1 shadow-md z-10" />
              </div>

              {/* Khối Text nằm hoàn toàn ở vùng trắng bên dưới */}
              <div className="pt-3 sm:pt-4 space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white m-0 tracking-tight leading-none">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/90 text-indigo-600 dark:text-indigo-400 border border-indigo-200/90 dark:border-indigo-800/80 uppercase tracking-wider shadow-2xs">
                    {displayRole}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <BankOutlined className="text-indigo-500 text-sm" />
                    <span>Phòng ban: <strong className="text-slate-800 dark:text-slate-200 font-bold">{displayTeam}</strong></span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <MailOutlined className="text-indigo-500 text-sm" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{displayEmail}</span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <CalendarOutlined className="text-indigo-500 text-sm" />
                    <span>Gia nhập: <strong className="text-slate-800 dark:text-slate-200 font-bold">{displayJoinDate}</strong></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="hidden md:flex items-center justify-end gap-2.5 pt-3 sm:pt-4 shrink-0">
              <Button
                icon={<FolderOpenOutlined />}
                onClick={() => setIsVaultModalOpen(true)}
                size="large"
                className="rounded-xl px-4 font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-xs"
              >
                Kho Media Nháp
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleOpenEditModal}
                size="large"
                className="rounded-xl px-6 font-bold bg-[#7367f0] hover:bg-[#655bd3] border-0 shadow-md shadow-indigo-500/20 text-white flex items-center gap-2"
              >
                Chỉnh Sửa Hồ Sơ
              </Button>
            </div>
          </div>

          {/* 2. TAB NAVIGATION BAR (Bo góc tím sang trọng) */}
          <Divider className="my-4 border-slate-100 dark:border-slate-800" />
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-1 pb-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'profile'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <UserOutlined className="text-sm" /> Tổng quan hồ sơ
            </button>

            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'teams'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <TeamOutlined className="text-sm" /> Teams ({mockTeamsList.length})
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'projects'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <ProjectOutlined className="text-sm" /> Dự Án & Videos ({mockProjects.length})
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'timeline'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <HistoryOutlined className="text-sm" /> Dòng Hoạt Động & KPIs
            </button>

            <button
              onClick={() => setActiveTab('gamification')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'gamification'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <TrophyOutlined className="text-sm" /> Huy Hiệu & Đào Tạo
            </button>

            <button
              onClick={() => setActiveTab('rbac')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'rbac'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <SafetyOutlined className="text-sm" /> Phân Quyền Cá Nhân
            </button>

            <button
              onClick={() => setActiveTab('connections')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'connections'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <LinkOutlined className="text-sm" /> Liên Kết Social (Required)
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${activeTab === 'notifications'
                ? 'bg-[#7367f0] text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold'
                }`}
            >
              <BellOutlined className="text-sm" /> Cài Đặt Thông Báo
            </button>
          </div>
        </div>
      </div>


      {/* TAB 1: PROFILE OVERVIEW */}
      {activeTab === 'profile' && (
        <Row gutter={[16, 16]}>
          {/* Cột Trái: ABOUT, CONTACTS & GAMIFICATION STANDALONE CARD */}
          <Col xs={24} lg={7} className="space-y-5">
            {/* CARD 1: THÔNG TIN USER */}
            <Card className="rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
              {fetching ? (
                <div className="py-12 text-center">
                  <Spin description="Đang tải thông tin từ Database..." />
                </div>
              ) : (
                <div className="space-y-6 p-1">
                  {/* ABOUT */}
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 m-0">
                      Tổng quan
                    </h4>

                    <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <UserOutlined className="text-slate-500 text-lg shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Họ và Tên:</span>{' '}
                          <span className="font-medium text-slate-500 dark:text-slate-400">{displayName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckOutlined className="text-slate-500 text-lg shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Trạng thái:</span>{' '}
                          <span className="font-medium text-slate-500 dark:text-slate-400">Hoạt động</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CrownOutlined className="text-slate-500 text-lg shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Phân quyền:</span>{' '}
                          <span className="font-medium text-slate-500 dark:text-slate-400">{displayRole}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <BankOutlined className="text-slate-500 text-lg shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Phòng ban:</span>{' '}
                          <span className="font-medium text-slate-500 dark:text-slate-400">{displayTeam}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CalendarOutlined className="text-slate-500 text-lg shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Ngày gia nhập:</span>{' '}
                          <span className="font-medium text-slate-500 dark:text-slate-400">{displayJoinDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTACTS */}
                  <div className='pt-3'>
                    <h3 className="text-[14px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 m-0">
                      Thông tin liên lạc
                    </h3>

                    <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <PhoneOutlined className="text-slate-500 text-lg shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Số điện thoại:</span>{' '}
                          <span className="font-medium text-slate-500 dark:text-slate-400">{displayPhone}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MailOutlined className="text-slate-500 text-lg shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Email:</span>{' '}
                          <span className="font-medium text-slate-500 dark:text-slate-400 break-all">{displayEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TEAMS */}
                  <div className='pt-3'>
                    <h4 className="text-[14px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 m-0">
                      Đội nhóm
                    </h4>

                    <div className="space-y-3 text-sm">
                      {mockTeamsList.map((t) => (
                        <div key={t.id} className="flex items-center">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{t.name}</span>
                          <span className="text-slate-400 font-normal text-xs ml-2">({t.membersCount} nhân sự)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
            <br />
            {/* CARD 2: STANDALONE CARD HUY HIỆU & ĐÀO TẠO (Clean Vuexy UI) */}
            <Card className="rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-800 dark:text-white m-0 flex items-center gap-2">
                  <TrophyOutlined className="text-amber-500 text-lg" /> Huy Hiệu & Đào Tạo
                </h3>
                <Button
                  type="link"
                  onClick={() => setActiveTab('gamification')}
                  className="p-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5"
                >
                  Chi tiết <RightOutlined className="text-[10px]" />
                </Button>
              </div>

              {/* Level Summary Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">Level 3</span>
                    <Tag color="gold" className="m-0 font-bold text-[10px] uppercase rounded-md">SENIOR</Tag>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">850 / 1,000 XP</span>
                </div>
                <Progress percent={85} showInfo={false} strokeColor="#7367f0" size="small" className="m-0" />
              </div>

              {/* Recent Badges Mini List */}
              <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                {mockBadges.slice(0, 2).map((b) => (
                  <div key={b.id} className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${b.iconBoxBg} shrink-0`}>
                      {b.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{b.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">Hạng {b.tier}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Cột Phải: MEDIA UPLOADS & PROJECTS WIDGETS (Thay thế Ảnh 3 bằng Ảnh 1 & Ảnh 2) */}
          <Col xs={24} lg={17} className="space-y-5">
            {/* WIDGET 1: MEDIA UPLOADS */}
            <MediaUploadsWidget />

            <br />
            {/* WIDGET 2: PROJECTS */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs" styles={{ body: { padding: 0 } }}>
              <div className="flex justify-between items-center p-5 pb-3">
                <h3 className="text-base font-bold text-slate-800 dark:text-white m-0">Projects</h3>
                <Button type="text" shape="circle" icon={<MoreOutlined className="text-slate-400 text-lg" />} />
              </div>

              <Table
                dataSource={projectsWidgetData}
                pagination={false}
                rowKey="key"
                className="projects-widget-table"
                columns={[
                  {
                    title: 'Project Name',
                    dataIndex: 'name',
                    key: 'name',
                    render: (text) => (
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                        {text}
                      </span>
                    ),
                  },
                  {
                    title: 'Progress',
                    dataIndex: 'progress',
                    key: 'progress',
                    width: 140,
                    render: (val, record) => (
                      <div className="w-28 sm:w-32">
                        <Progress
                          percent={val}
                          showInfo={false}
                          strokeColor={record.statusColor}
                          railColor="#f1f5f9"
                          size="small"
                          className="m-0"
                        />
                      </div>
                    ),
                  },
                  {
                    title: 'People',
                    dataIndex: 'people',
                    key: 'people',
                    render: (peopleArr, record) => (
                      <div className="flex items-center gap-1">
                        <Avatar.Group max={{ count: 2, style: { backgroundColor: '#3b82f6', color: '#fff', fontSize: '10px' } }}>
                          {peopleArr.map((p: any, idx: number) => (
                            <Avatar key={idx} src={p.avatar} size={26} />
                          ))}
                        </Avatar.Group>
                        {record.extraPeople && (
                          <span
                            className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${record.extraPeople === 'M'
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                              }`}
                          >
                            {record.extraPeople}
                          </span>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: 'Due Date',
                    dataIndex: 'dueDate',
                    key: 'dueDate',
                    render: (dateStr) => (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {dateStr}
                      </span>
                    ),
                  },
                  {
                    title: '',
                    key: 'action',
                    width: 40,
                    render: () => (
                      <Button type="text" shape="circle" icon={<MoreOutlined className="text-slate-400" />} />
                    ),
                  },
                ]}
              />

              <div className="py-3 text-center border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="link"
                  onClick={() => setActiveTab('projects')}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs p-0"
                >
                  All Projects
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* TAB 2: TEAMS (Đội nhóm) */}
      {activeTab === 'teams' && (
        <Row gutter={[16, 16]}>
          {mockTeamsList.map((t) => (
            <Col xs={24} sm={12} lg={6} key={t.id}>
              <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Avatar className="bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                      {t.name.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-2xs ${t.color === 'blue'
                          ? 'dark-badge-blue'
                          : t.color === 'purple'
                            ? 'dark-badge-purple'
                            : t.color === 'emerald'
                              ? 'dark-badge-emerald'
                              : 'dark-badge-amber'
                        }`}
                    >
                      {t.roleTag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
                      {t.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-0">
                      {t.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <TeamOutlined className="text-slate-400" /> {t.membersCount} Thành viên
                  </span>
                  <Button type="link" size="small" className="p-0 font-bold text-indigo-600 dark:text-indigo-400">
                    Chi tiết <RightOutlined className="text-[10px]" />
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* TAB 3: PROJECTS & VIDEOS */}
      {activeTab === 'projects' && (() => {
        const filteredProjects = mockProjects.filter((proj) => {
          const matchesSearch =
            proj.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
            proj.leader.toLowerCase().includes(projectSearch.toLowerCase()) ||
            proj.type.toLowerCase().includes(projectSearch.toLowerCase());
          const matchesStatus =
            projectStatusFilter === 'ALL' || proj.status === projectStatusFilter;
          return matchesSearch && matchesStatus;
        });

        return (
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0">
                  Dự Án & Video Đang Thực Hiện
                </h3>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto h-9 text-xs"
              >
                Tạo Video / Dự Án Mới
              </Button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <Input
                placeholder="Tìm tên dự án, video, leader..."
                prefix={<SearchOutlined className="text-slate-400" />}
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                allowClear
                className="rounded-xl border-slate-200 dark:border-slate-700 w-full sm:w-64 bg-white dark:bg-slate-900"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { label: `Tất cả (${mockProjects.length})`, value: 'ALL' },
                  { label: 'Đang sản xuất', value: 'Đang sản xuất' },
                  { label: 'Đang duyệt', value: 'Đang duyệt' },
                  { label: 'Hoàn thành', value: 'Hoàn thành' },
                ].map((tab) => {
                  const active = projectStatusFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setProjectStatusFilter(tab.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${active
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
                        }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <div className="text-slate-400 text-sm font-medium">Không tìm thấy dự án hoặc video phù hợp.</div>
                <Button
                  size="small"
                  onClick={() => {
                    setProjectSearch('');
                    setProjectStatusFilter('ALL');
                  }}
                  className="rounded-lg text-xs"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table
                    dataSource={filteredProjects}
                    pagination={false}
                    className="border-t border-slate-100 dark:border-slate-800"
                    columns={[
                      {
                        title: 'TÊN DỰ ÁN / VIDEO',
                        dataIndex: 'name',
                        key: 'name',
                        render: (text, record) => (
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                              <VideoCameraOutlined />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{text}</div>
                              <div className="text-xs text-slate-400">{record.type} • Ngày tạo: {record.date}</div>
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: 'LEADER PHỤ TRÁCH',
                        dataIndex: 'leader',
                        key: 'leader',
                        render: (text) => <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{text}</span>,
                      },
                      {
                        title: 'LƯỢT XEM / PERFORMANCE',
                        dataIndex: 'views',
                        key: 'views',
                        render: (text) => <Tag color="blue" className="font-bold text-xs rounded-md">{text}</Tag>,
                      },
                      {
                        title: 'TIẾN ĐỘ',
                        dataIndex: 'progress',
                        key: 'progress',
                        render: (val) => (
                          <div className="w-36">
                            <Progress percent={val} size="small" strokeColor="#4f46e5" />
                          </div>
                        ),
                      },
                      {
                        title: 'TRẠNG THÁI',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                          let color = 'gold';
                          if (status === 'Hoàn thành') color = 'green';
                          if (status === 'Đang duyệt') color = 'cyan';
                          return <Tag color={color} className="font-bold text-xs rounded-md">{status}</Tag>;
                        },
                      },
                    ]}
                  />
                </div>

                {/* Mobile Card List View (Visible on < md screens) */}
                <div className="md:hidden space-y-3.5 pt-1">
                  {filteredProjects.map((proj) => {
                    let statusColor = 'gold';
                    if (proj.status === 'Hoàn thành') statusColor = 'green';
                    if (proj.status === 'Đang duyệt') statusColor = 'cyan';

                    return (
                      <div
                        key={proj.key}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0 text-sm">
                                <VideoCameraOutlined />
                              </div>
                              <div className="min-w-0 leading-tight">
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                  {proj.type}
                                </div>
                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                  {proj.date}
                                </div>
                              </div>
                            </div>
                            <Tag color={statusColor} className="font-bold text-xs rounded-md m-0 shrink-0">
                              {proj.status}
                            </Tag>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 m-0 leading-snug pt-0.5">
                            {proj.name}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Leader</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{proj.leader}</span>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Performance</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{proj.views}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>Tiến độ sản xuất</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{proj.progress}%</span>
                          </div>
                          <Progress percent={proj.progress} showInfo={false} strokeColor="#4f46e5" size="small" className="m-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        );
      })()}

      {/* TAB 4: CONNECTIONS (Liên kết Social media Admin yêu cầu) */}
      {activeTab === 'connections' && (
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="mb-5 space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0">
              Tài Khoản Mạng Xã Hội
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0 font-medium">
              Quản lý các tài khoản mạng xã hội công việc đã kết nối vào hệ thống BizSocial ERP
            </p>
          </div>

          <Row gutter={[16, 16]}>
            {mockSocialConnections.map((soc) => (
              <Col xs={24} lg={12} key={soc.id}>
                <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shrink-0">
                      {soc.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug truncate">
                        {soc.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                        {soc.account}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0 flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    {soc.connected ? (
                      <div className="flex items-center sm:flex-col justify-between sm:items-end w-full sm:w-auto gap-1">
                        <span className="text-[11px] text-slate-400 font-medium sm:order-2">
                          Đồng bộ: {soc.syncDate}
                        </span>
                        <Tag color="success" icon={<CheckCircleOutlined />} className="m-0 font-bold text-xs rounded-lg px-2.5 py-1 sm:order-1">
                          Đã liên kết
                        </Tag>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5">
                        <Tag color={soc.required ? 'red' : 'warning'} className="m-0 font-extrabold text-xs rounded-lg px-2.5 py-1 uppercase">
                          {soc.required ? 'Bắt buộc' : 'Chưa liên kết'}
                        </Tag>
                        <Button
                          type="primary"
                          icon={<LinkOutlined />}
                          className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-xs h-8 sm:h-9 shrink-0"
                        >
                          Kết Nối Ngay
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* TAB 5: TIMELINE & KPIS (Dòng hoạt động & Chỉ số KPIs) */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Hoàn Thành Công Việc
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">88%</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                    <RiseOutlined />
                  </div>
                </div>
                <Progress percent={88} size="small" strokeColor="#6366f1" className="mt-3 m-0" />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Bài Xuất Bản Tháng
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">24 / 30</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
                    <CheckCircleOutlined />
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-500 mt-3">Đạt 80% chỉ tiêu xuất bản tháng</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Lead CRM Đã Xử Lý
                    </div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">18 Leads</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold">
                    <TeamOutlined />
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-500 mt-3">Tỷ lệ chốt Ticket ERP: 42%</div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      SLA Phản Hồi Inbox
                    </div>
                    <div className="text-2xl font-black text-amber-500 mt-1">5 Phút</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-500 flex items-center justify-center text-xl font-bold">
                    <ClockCircleOutlined />
                  </div>
                </div>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-3">Top 5% nhân viên phản hồi nhanh nhất</div>
              </Card>
            </Col>
          </Row>

          {/* Activity Timeline List */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="mb-5 space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                <HistoryOutlined className="text-indigo-600" /> Dòng Thời Gian Hoạt Động
              </h3>
            </div>

            <div className="relative space-y-4 py-2">
              {/* Trục kẻ dọc Timeline Line căn chuẩn tuyệt đối tâm icon */}
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700/80" />

              {mockActivityTimeline.map((item) => (
                <div key={item.id} className="relative pl-9 group">
                  {/* Icon Node nằm chính giữa đường line */}
                  <div className="absolute left-0 top-3.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500/50 dark:border-indigo-400/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs z-10">
                    {item.icon}
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100/60 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.title}
                      </div>
                      <Tag color={item.tagColor} className="m-0 font-bold text-[10px] rounded-md uppercase">
                        {item.category}
                      </Tag>
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                      <ClockCircleOutlined className="text-[11px]" /> {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: GAMIFICATION & BADGES (Huy hiệu & Đào tạo Sandbox Clean Vuexy UI) */}
      {activeTab === 'gamification' && (
        <div className="space-y-6">
          {/* Level & XP Banner (Balanced 12-Column Desktop Grid Card) */}
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 p-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-2">
              {/* Col 1: Level & Rank Info (5 cols) */}
              <div className="md:col-span-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-amber-500 flex items-center justify-center text-3xl font-extrabold shrink-0">
                  <TrophyOutlined />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">Level 3</span>
                    <Tag color="gold" className="font-bold text-[10px] uppercase rounded-md m-0">
                      SENIOR CONTENT SPECIALIST
                    </Tag>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Đã tích lũy <strong className="text-slate-800 dark:text-slate-200 font-bold">850 / 1,000 XP</strong> để thăng cấp Level 4
                  </div>
                </div>
              </div>

              {/* Col 2: Progress Bar (4 cols) */}
              <div className="md:col-span-4 space-y-1.5 px-0 md:px-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Tiến trình Level 3</span>
                  <span className="text-indigo-600 dark:text-indigo-400">85%</span>
                </div>
                <Progress
                  percent={85}
                  showInfo={false}
                  strokeColor="#7367f0"
                  railColor="#f1f5f9"
                  size="small"
                  className="m-0"
                />
              </div>

              {/* Col 3: Stat Badges (3 cols) */}
              <div className="md:col-span-3 grid grid-cols-2 gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 pl-0 md:pl-4">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Bài Test Passed</div>
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">12/12 (100%)</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Xếp Hạng</div>
                  <div className="text-xs font-extrabold text-amber-500 mt-0.5">Top 5% ERP</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Badges Grid Header & Cards */}
          <div className="pt-4">
            <div className="flex items-center justify-between flex-wrap gap-3 p-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                  <StarOutlined className="text-amber-500" /> Bộ Sưu Tập Huy Hiệu
                </h3>
              </div>
              <Tag color="gold" className="font-extrabold text-xs rounded-full px-3.5 py-1 m-0">
                4/4 Đã mở khóa
              </Tag>
            </div>

            <Row gutter={[16, 16]} className="pt-1">
              {mockBadges.map((badge) => (
                <Col xs={24} sm={12} lg={6} key={badge.id}>
                  <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-2xl ${badge.iconBoxBg} shrink-0`}>
                          {badge.icon}
                        </div>
                        <Tag color={badge.tagColor} className="font-extrabold text-[10px] uppercase rounded-md m-0">
                          {badge.tier}
                        </Tag>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0 leading-relaxed font-medium">
                          {badge.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
                      <Tag color="success" icon={<CheckCircleFilled />} className="m-0 font-bold text-[11px] rounded-md border-0 px-2 py-0.5">
                        {badge.unlockedDate}
                      </Tag>
                      <span className="text-[11px] text-slate-400 font-medium">Đã mở khóa</span>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}

      {/* TAB 7: RBAC MATRIX (Phân quyền cá nhân thực tế) */}
      {activeTab === 'rbac' && (
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="mb-5 space-y-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0 flex items-center gap-2">
                <SafetyOutlined className="text-indigo-600" /> Phân Quyền Cá Nhân
              </h3>
              <Tag color="purple" className="font-bold text-xs rounded-full px-3 py-0.5">
                {displayRole}
              </Tag>
            </div>
          </div>

          <div className="space-y-6">
            {mockMyPermissions.map((mod, idx) => (
              <div key={idx} className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center justify-between">
                  <span>{mod.module}</span>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {mod.actions.map((act, actIdx) => (
                    <div
                      key={actIdx}
                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${act.granted
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs tracking-wider text-slate-800 dark:text-slate-200">
                          {act.name}
                        </span>
                        {act.granted ? (
                          <CheckCircleFilled className="text-emerald-500 text-sm" />
                        ) : (
                          <CloseCircleFilled className="text-slate-300 dark:text-slate-600 text-sm" />
                        )}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {act.label}
                      </div>

                      <div>
                        {act.granted ? (
                          <Tag color="blue" className="m-0 font-bold text-[10px] uppercase rounded-md">
                            Scope: {act.scope}
                          </Tag>
                        ) : (
                          <Tag color="default" className="m-0 font-bold text-[10px] uppercase rounded-md">
                            Chặn quyền
                          </Tag>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 8: NOTIFICATION SETTINGS (Cài đặt thông báo) */}
      {activeTab === 'notifications' && (
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-3 flex items-center justify-between">
              <div className='pe-2'>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Thông Báo Qua Email Công Việc
                </div>
                <div className="text-xs text-slate-500">Nhận báo cáo tổng hợp kết quả chiến dịch và cập nhật tài khoản qua Email</div>
              </div>
              <Switch
                checked={notifSettings.emailAlerts}
                onChange={(checked) => setNotifSettings((prev) => ({ ...prev, emailAlerts: checked }))}
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className='pe-2'>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  System Banner Alert Trên Giao Diện
                </div>
                <div className="text-xs text-slate-500">Hiển thị thông báo Toast real-time ở góc màn hình làm việc</div>
              </div>
              <Switch
                checked={notifSettings.systemBanners}
                onChange={(checked) => setNotifSettings((prev) => ({ ...prev, systemBanners: checked }))}
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className='pe-2'>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Cảnh Báo Bài Đăng Chờ Duyệt (Dành Cho Leader/Manager)
                </div>
                <div className="text-xs text-slate-500">Thông báo ngay khi có bài nháp mới được gửi lên từ Intern/Employee</div>
              </div>
              <Switch
                checked={notifSettings.postApprovalAlert}
                onChange={(checked) => setNotifSettings((prev) => ({ ...prev, postApprovalAlert: checked }))}
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className='pe-2'>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Phân Công Lead CRM Mới
                </div>
                <div className="text-xs text-slate-500">Thông báo khẩn khi có khách hàng tiềm năng mới được giao phụ trách</div>
              </div>
              <Switch
                checked={notifSettings.crmLeadAssign}
                onChange={(checked) => setNotifSettings((prev) => ({ ...prev, crmLeadAssign: checked }))}
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className='pe-2'>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Tích Hợp Telegram Bot Alert
                </div>
                <div className="text-xs text-slate-500">Bắn tin nhắn thông báo tức thì qua Telegram Bot chính thức của công ty</div>
              </div>
              <Switch
                checked={notifSettings.telegramBot}
                onChange={(checked) => setNotifSettings((prev) => ({ ...prev, telegramBot: checked }))}
              />
            </div>
          </div>
        </Card>
      )}

      {/* MODAL: KHO MEDIA NHÁP CÁ NHÂN (Media Vault) */}
      <Modal
        title={
          <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FolderOpenOutlined className="text-indigo-600" /> Kho Media Nháp Cá Nhân (Personal Media Vault)
          </div>
        }
        open={isVaultModalOpen}
        onCancel={() => setIsVaultModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsVaultModalOpen(false)}>
            Đóng
          </Button>,
          <Button key="upload" type="primary" icon={<PlusOutlined />} className="bg-indigo-600">
            Tải Lên File Nháp Mới
          </Button>,
        ]}
        width={700}
        centered
      >
        <div className="py-2 space-y-3">
          <Table
            dataSource={mockVaultItems}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'TÊN FILE',
                dataIndex: 'name',
                key: 'name',
                render: (text) => <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{text}</span>,
              },
              {
                title: 'KÍCH THƯỚC',
                dataIndex: 'size',
                key: 'size',
                render: (val) => <span className="text-xs text-slate-500 font-mono">{val}</span>,
              },
              {
                title: 'LOẠI',
                dataIndex: 'type',
                key: 'type',
                render: (type) => <Tag color="blue" className="font-bold text-[10px] rounded-md">{type}</Tag>,
              },
              {
                title: 'NGÀY TẢI',
                dataIndex: 'date',
                key: 'date',
                render: (d) => <span className="text-xs text-slate-400">{d}</span>,
              },
            ]}
          />
        </div>
      </Modal>

      {/* Edit Profile & Security Modal */}
      <Modal
        destroyOnHidden={true}
        title={
          <div className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Chỉnh sửa thông tin tài khoản
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={650}
        centered
        forceRender
        styles={{ body: { padding: 20 } }}
      >
        <Tabs
          defaultActiveKey="edit-profile"
          items={[
            {
              key: 'edit-profile',
              forceRender: true,
              label: (
                <span className="flex items-center gap-2 font-semibold">
                  <UserOutlined /> Chỉnh Sửa Thông Tin
                </span>
              ),
              children: (
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={async (values) => {
                    await handleUpdateProfile(values);
                    setIsEditModalOpen(false);
                  }}
                  initialValues={{
                    name: displayName,
                    email: displayEmail,
                    phone: displayPhone,
                  }}
                  className="pt-3 space-y-3"
                >
                  {/* Khối Live Preview Thu Nhỏ (Mini Profile Header Replica) */}
                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs mb-4">
                    {/* Top Mini Cover Banner Area */}
                    <div
                      className="h-40 sm:h-44 w-full bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] relative bg-cover bg-center transition-all duration-300 flex items-start justify-end p-3"
                      style={displayBanner ? { backgroundImage: `url(${displayBanner})` } : {}}
                    >
                      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

                      {/* Nút Đổi ảnh bìa Banner */}
                      <Button
                        type="default"
                        size="small"
                        icon={<SyncOutlined />}
                        onClick={handleTriggerSelectBanner}
                        className="relative z-10 rounded-xl text-xs font-bold bg-white/90 dark:bg-slate-900/90 border-0 backdrop-blur-md text-slate-800 dark:text-white hover:bg-white shadow-sm"
                      >
                        Banner
                      </Button>

                      {draftBanner && (
                        <span className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm animate-pulse">
                          Banner nháp
                        </span>
                      )}
                    </div>

                    {/* Bottom Mini Avatar & Profile Info Bar */}
                    <div className="px-5 pb-4 pt-3 flex items-end justify-between gap-4">
                      <div className="flex items-end gap-4 relative">
                        {/* CHỈ áp dụng margin âm cho Avatar để lấn lên Banner */}
                        <div className="relative shrink-0 -mt-12 sm:-mt-14 group rounded-full p-1 bg-white dark:bg-slate-900 border-2 border-indigo-500/80 dark:border-indigo-400/80 shadow-md transition-all">
                          <Avatar
                            size={80}
                            src={displayAvatar}
                            icon={<UserOutlined />}
                            className="object-cover rounded-full bg-white block"
                          />
                          <button
                            type="button"
                            onClick={handleTriggerSelectAvatar}
                            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs cursor-pointer active:scale-90 z-10"
                            title="Đổi Avatar"
                          >
                            <SyncOutlined className="text-xs" />
                          </button>
                          {draftAvatar && (
                            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase shadow-xs animate-pulse z-10">
                              Nháp
                            </span>
                          )}
                        </div>

                        {/* Khối Text nằm hoàn toàn ở vùng trắng với Padding Top rõ ràng */}
                        <div className="pb-1 min-w-0 space-y-0.5">
                          <h3 className="text-[17px] font-black text-base text-slate-900 dark:text-white truncate leading-tight m-0">
                            {displayName}
                          </h3>
                          <div className="text-[11px] ms-0.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                            {displayRole}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

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
                        <Input value={displayRole} disabled size="large" className="rounded-xl bg-slate-50 dark:bg-slate-900" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="pt-2 flex justify-end gap-2">
                    <Button onClick={() => setIsEditModalOpen(false)}>Hủy bỏ</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={loading}
                      htmlType="submit"
                      className="rounded-xl px-6 font-semibold bg-indigo-600 hover:bg-indigo-700 border-0"
                    >
                      Lưu
                    </Button>
                  </div>
                </Form>
              ),
            },
            {
              key: 'security',
              forceRender: true,
              label: (
                <span className="flex items-center gap-2 font-semibold">
                  <KeyOutlined /> Đổi Mật Khẩu
                </span>
              ),
              children: (
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={async (values) => {
                    await handleChangePassword(values);
                    setIsEditModalOpen(false);
                  }}
                  className="pt-3 space-y-3"
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

                  <div className="pt-2 flex justify-end gap-2">
                    <Button onClick={() => setIsEditModalOpen(false)}>Hủy bỏ</Button>
                    <Button
                      type="primary"
                      danger
                      icon={<SaveOutlined />}
                      loading={passLoading}
                      htmlType="submit"
                      className="rounded-xl px-6 font-semibold"
                    >
                      Cập Nhật Mật Khẩu
                    </Button>
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </Modal>

      {/* Image Crop & Rotate Modal */}
      <ImageCropModal
        open={cropModalOpen}
        imageSrc={selectedRawImage}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        aspectRatio={cropType === 'banner' ? 3.2 : 1}
        title={cropType === 'banner' ? 'Chỉnh sửa & Cắt Ảnh Bìa (Banner)' : 'Chỉnh sửa & Cắt Ảnh Đại Diện (Avatar)'}
      />
    </div>
  );
}

