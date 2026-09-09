'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Radio,
  Tag,
  Row,
  Col,
  Spin,
  Space,
  Avatar,
  Tooltip,
} from 'antd';
import {
  RobotOutlined,
  FacebookFilled,
  TikTokOutlined,
  LinkedinFilled,
  YoutubeFilled,
  CalendarOutlined,
  SendOutlined,
  PictureOutlined,
  EyeOutlined,
  GlobalOutlined,
  LikeOutlined,
  CommentOutlined,
  ShareAltOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface PostEditorModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
  initialValues?: any;
  loading?: boolean;
  currentUser?: any;
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  open,
  onClose,
  onSave,
  initialValues,
  loading = false,
  currentUser,
}) => {
  const [form] = Form.useForm();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['FACEBOOK']);
  const [previewPlatform, setPreviewPlatform] = useState<'FACEBOOK' | 'TIKTOK'>('FACEBOOK');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  // Watched form values for Live Preview
  const watchTitle = Form.useWatch('title', form) || '';
  const watchContent = Form.useWatch('content', form) || '';
  const watchHashtags = Form.useWatch('hashtags', form) || '';
  const watchMediaUrls = Form.useWatch('mediaUrls', form) || [];

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          title: initialValues.title,
          content: initialValues.content,
          platforms: Array.isArray(initialValues.platforms) ? initialValues.platforms : ['FACEBOOK'],
          status: initialValues.status || 'DRAFT',
          scheduledAt: initialValues.scheduledAt ? dayjs(initialValues.scheduledAt) : null,
          mediaUrls: Array.isArray(initialValues.mediaUrls) ? initialValues.mediaUrls : [],
          hashtags: initialValues.hashtags || '',
        });
        setSelectedPlatforms(Array.isArray(initialValues.platforms) ? initialValues.platforms : ['FACEBOOK']);
      } else {
        form.resetFields();
        form.setFieldsValue({
          platforms: ['FACEBOOK'],
          status: 'DRAFT',
          mediaUrls: [],
        });
        setSelectedPlatforms(['FACEBOOK']);
      }
    }
  }, [open, initialValues, form]);

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/posts/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          platform: selectedPlatforms[0] || 'FACEBOOK',
        }),
      });

      // Fallback nếu API backend chưa ready
      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        data = {
          title: `Kịch bản truyền thông: ${aiTopic}`,
          content: `🚀 [BIZSOCIAL ERP CAMPAIGN] ${aiTopic}\n\n✨ Điểm nổi bật:\n- Tối ưu hóa quy trình làm việc chuẩn ERP 2026\n- Quản lý tập trung đa kênh Social Media\n- Tích hợp Trí tuệ Nhân tạo Gemini AI bóc tách dữ liệu\n\n📌 Hãy liên hệ ngay hôm nay để nhận ưu đãi dùng thử!`,
          hashtags: '#BizSocialERP #SocialMediaManagement #ERP2026',
        };
      }

      form.setFieldsValue({
        title: data.title,
        content: data.content,
        hashtags: data.hashtags,
      });
    } catch (e) {
      // Mock fallback
      form.setFieldsValue({
        title: `Kịch bản truyền thông: ${aiTopic}`,
        content: `🚀 [BIZSOCIAL ERP CAMPAIGN] ${aiTopic}\n\n✨ Điểm nổi bật:\n- Tối ưu hóa quy trình làm việc chuẩn ERP 2026\n- Quản lý tập trung đa kênh Social Media\n- Tích hợp Trí tuệ Nhân tạo Gemini AI bóc tách dữ liệu\n\n📌 Hãy liên hệ ngay hôm nay để nhận ưu đãi dùng thử!`,
        hashtags: '#BizSocialERP #SocialMediaManagement #ERP2026',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddMedia = () => {
    if (!mediaUrlInput.trim()) return;
    const current = form.getFieldValue('mediaUrls') || [];
    form.setFieldsValue({ mediaUrls: [...current, mediaUrlInput.trim()] });
    setMediaUrlInput('');
  };

  const handleRemoveMedia = (index: number) => {
    const current = form.getFieldValue('mediaUrls') || [];
    const updated = current.filter((_: any, i: number) => i !== index);
    form.setFieldsValue({ mediaUrls: updated });
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : null,
      platforms: values.platforms,
      mediaUrls: values.mediaUrls || [],
    };
    await onSave(payload);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1080}
      centered
      forceRender
      title={
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base pb-3 border-b border-slate-100 dark:border-slate-800">
          <CalendarOutlined className="text-indigo-600 text-lg" />
          <span>{initialValues ? 'Chỉnh Sửa Bài Đăng Social' : 'Biên Tập & Lên Lịch Bài Đăng Mới'}</span>
        </div>
      }
      className="custom-post-modal"
    >
      <Row gutter={[20, 20]} className="pt-2">
        {/* Left Column: Form Controls & AI Assistant */}
        <Col xs={24} lg={13} className="space-y-4">
          {/* AI Generator Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <RobotOutlined className="text-sm text-purple-500" />
                Gemini AI Assistant - Gợi Ý Content Tự Động
              </span>
              <Tag color="purple" className="m-0 text-[10px] font-extrabold rounded-md uppercase">
                AI Powered
              </Tag>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập chủ đề/từ khóa (Ví dụ: Tuyển dụng Content Creator, Ra mắt tính năng mới...)"
                size="small"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onPressEnter={handleAiGenerate}
                className="rounded-lg text-xs dark:bg-slate-900"
              />
              <Button
                type="primary"
                size="small"
                icon={<BulbOutlined />}
                loading={aiLoading}
                onClick={handleAiGenerate}
                className="rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-0 shrink-0"
              >
                Tạo Bài
              </Button>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-3">
            <Form.Item
              name="title"
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tiêu Đề Nội Dung / Chiến Dịch</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài đăng!' }]}
            >
              <Input placeholder="Ví dụ: Chiến dịch Summer Sale 2026 - Fanpage Official" className="rounded-xl" />
            </Form.Item>

            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="platforms"
                  label={<span className="text-xs font-bold text-slate-800 dark:text-slate-200">Kênh Đăng Bài (Đa Nền Tảng)</span>}
                  rules={[{ required: true, message: 'Chọn ít nhất 1 kênh đăng!' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn các kênh"
                    className="rounded-xl"
                    onChange={(vals) => setSelectedPlatforms(vals)}
                    options={[
                      { label: 'Facebook Fanpage', value: 'FACEBOOK' },
                      { label: 'TikTok Channel', value: 'TIKTOK' },
                      { label: 'LinkedIn Company', value: 'LINKEDIN' },
                      { label: 'YouTube Shorts', value: 'YOUTUBE' },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="scheduledAt"
                  label={<span className="text-xs font-bold text-slate-800 dark:text-slate-200">Hẹn Giờ Đăng Bài (Scheduled)</span>}
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="Chọn ngày & giờ"
                    className="w-full rounded-xl"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="content"
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-200">Nội Dung Caption Bài Đăng</span>}
              rules={[{ required: true, message: 'Vui lòng nhập nội dung bài đăng!' }]}
            >
              <Input.TextArea
                rows={5}
                placeholder="Nhập nội dung bài đăng chi tiết, đính kèm emoji linh hoạt..."
                className="rounded-xl font-sans"
              />
            </Form.Item>

            <Form.Item
              name="hashtags"
              label={<span className="text-xs font-bold text-slate-800 dark:text-slate-200">Hashtags Nhãn Hàng</span>}
            >
              <Input placeholder="Ví dụ: #BizSocialERP #Marketing2026 #Innovation" className="rounded-xl" />
            </Form.Item>

            {/* Media URLs Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Đính Kèm Ảnh / Video URL
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Dán đường dẫn ảnh/video (https://...)"
                  size="small"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  onPressEnter={handleAddMedia}
                  className="rounded-lg text-xs dark:bg-slate-900"
                />
                <Button size="small" icon={<PictureOutlined />} onClick={handleAddMedia} className="rounded-lg text-xs font-bold">
                  Thêm URL
                </Button>
              </div>

              {/* Render Media List */}
              <div className="flex flex-wrap gap-2 pt-1">
                {(form.getFieldValue('mediaUrls') || []).map((url: string, index: number) => (
                  <div key={index} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img src={url} alt="Media" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center cursor-pointer opacity-90 hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Form.Item name="status" initialValue="DRAFT" className="m-0">
                <Radio.Group size="small" buttonStyle="solid">
                  <Radio.Button value="DRAFT">Lưu Nháp (Draft)</Radio.Button>
                  <Radio.Button value="PENDING_APPROVE">Gửi Duyệt (Approve)</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Space>
                <Button onClick={onClose} className="rounded-xl font-bold">
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
                  className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 border-0 px-5"
                >
                  {initialValues ? 'Cập Nhật' : 'Lưu Bài Đăng'}
                </Button>
              </Space>
            </div>
          </Form>
        </Col>

        {/* Right Column: Live Mobile Social Preview Engine */}
        <Col xs={24} lg={11} className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <EyeOutlined className="text-indigo-500" /> Live Mobile Preview
            </span>
            <Radio.Group
              size="small"
              value={previewPlatform}
              onChange={(e) => setPreviewPlatform(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="FACEBOOK">
                <FacebookFilled className="text-blue-600 mr-1" /> FB
              </Radio.Button>
              <Radio.Button value="TIKTOK">
                <TikTokOutlined className="text-slate-900 dark:text-white mr-1" /> TikTok
              </Radio.Button>
            </Radio.Group>
          </div>

          {/* Smartphone Device Frame */}
          <div className="w-[310px] h-[540px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between overflow-hidden">
            {/* Phone Top Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-20" />

            {/* Phone Screen Container */}
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[28px] overflow-y-auto pt-6 text-slate-900 dark:text-slate-100 custom-scrollbar text-xs flex flex-col justify-between">
              {/* FACEBOOK PREVIEW */}
              {previewPlatform === 'FACEBOOK' && (
                <div className="space-y-2.5 p-3">
                  {/* FB Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                        size={32}
                      />
                      <div>
                        <div className="font-bold text-xs leading-tight">BizSocial Official Fanpage</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          Vừa xong • <GlobalOutlined className="text-[9px]" />
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold text-sm">•••</span>
                  </div>

                  {/* FB Content */}
                  <div className="text-xs leading-relaxed whitespace-pre-wrap">
                    {watchContent || 'Nội dung caption xem trước của bài đăng sẽ hiển thị ở đây...'}
                  </div>

                  {/* FB Hashtags */}
                  {watchHashtags && (
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px]">
                      {watchHashtags}
                    </div>
                  )}

                  {/* FB Media Image */}
                  {watchMediaUrls && watchMediaUrls.length > 0 ? (
                    <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 max-h-48">
                      <img src={watchMediaUrls[0]} alt="FB Post Media" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-36 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 text-[11px] border border-dashed border-slate-300 dark:border-slate-800">
                      <PictureOutlined className="text-xl mr-1" /> Chưa có ảnh/video
                    </div>
                  )}

                  {/* FB Reaction Counter */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>👍 ❤️ 128 Lượt thích</span>
                    <span>14 Bình luận • 6 Chia sẻ</span>
                  </div>

                  {/* FB Action Bar */}
                  <div className="grid grid-cols-3 text-center pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500 font-bold text-[11px]">
                    <span className="flex items-center justify-center gap-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">
                      <LikeOutlined /> Thích
                    </span>
                    <span className="flex items-center justify-center gap-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">
                      <CommentOutlined /> Viết bình luận
                    </span>
                    <span className="flex items-center justify-center gap-1 py-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">
                      <ShareAltOutlined /> Chia sẻ
                    </span>
                  </div>
                </div>
              )}

              {/* TIKTOK PREVIEW */}
              {previewPlatform === 'TIKTOK' && (
                <div className="relative w-full h-full bg-slate-900 text-white flex flex-col justify-between p-3 overflow-hidden rounded-[28px]">
                  {/* TikTok Media Background */}
                  {watchMediaUrls && watchMediaUrls.length > 0 ? (
                    <img src={watchMediaUrls[0]} alt="TikTok Media" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 opacity-90 flex items-center justify-center text-slate-400 text-xs">
                      TikTok Video Placeholder
                    </div>
                  )}

                  {/* Overlay Top Bar */}
                  <div className="relative z-10 flex justify-between text-xs font-bold pt-1">
                    <span>Đang theo dõi</span>
                    <span className="border-b-2 border-white pb-0.5">Dành cho bạn</span>
                  </div>

                  {/* Overlay Right Action Buttons */}
                  <div className="relative z-10 self-end space-y-3 text-center pr-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border border-white flex items-center justify-center font-bold text-[10px]">
                      Biz
                    </div>
                    <div className="space-y-0.5">
                      <LikeOutlined className="text-lg text-white" />
                      <div className="text-[9px] font-bold">2.4k</div>
                    </div>
                    <div className="space-y-0.5">
                      <CommentOutlined className="text-lg text-white" />
                      <div className="text-[9px] font-bold">180</div>
                    </div>
                    <div className="space-y-0.5">
                      <ShareAltOutlined className="text-lg text-white" />
                      <div className="text-[9px] font-bold">56</div>
                    </div>
                  </div>

                  {/* Overlay Bottom Caption */}
                  <div className="relative z-10 space-y-1 pb-2">
                    <div className="font-bold text-xs">@bizsocial.official</div>
                    <div className="text-[11px] line-clamp-3 font-normal leading-tight opacity-90">
                      {watchContent || 'Nội dung caption TikTok...'}
                    </div>
                    <div className="text-[10px] font-bold text-cyan-300">
                      {watchHashtags || '#TikTokStudio #BizSocial'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};
