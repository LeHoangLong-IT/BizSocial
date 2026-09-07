"use client";

import React from 'react';
import { Modal, Form, Input, Select, Row, Col, Upload, Button, FormInstance } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';

interface RoleOption {
  id: number;
  name: string;
}

interface DepartmentOption {
  id: number;
  name: string;
}

interface UserModalProps {
  isOpen: boolean;
  modalMode: 'add' | 'edit';
  form: FormInstance;
  onCancel: () => void;
  onOk: () => void;
  roles: RoleOption[];
  departments: DepartmentOption[];
  loading?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  modalMode,
  form,
  onCancel,
  onOk,
  roles,
  departments,
  loading = false,
}) => {
  return (
    <Modal
      title={
        <div className="text-base font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800/80">
          {modalMode === 'add' ? 'Thêm mới người dùng' : 'Cập nhật thông tin người dùng'}
        </div>
      }
      open={isOpen}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={modalMode === 'add' ? 'Thêm người dùng' : 'Cập nhật'}
      cancelText="Hủy bỏ"
      forceRender
      width={600}
      centered
      okButtonProps={{ className: '!bg-blue-600 hover:!bg-blue-700 !border-0 font-semibold' }}
      cancelButtonProps={{ className: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:dark:bg-slate-700' }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <Form form={form} layout="vertical" requiredMark={false} className="mt-2">
        <div className="mb-5">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">Ảnh đại diện</div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-slate-800/60 text-gray-400 dark:text-slate-500 shadow-2xs">
              <PictureOutlined className="text-xl" />
            </div>
            <div>
              <Upload showUploadList={false}>
                <Button icon={<UploadOutlined />} type="primary" className="bg-[#1e293b] dark:bg-indigo-600 hover:bg-slate-700 dark:hover:bg-indigo-500 font-medium text-xs h-8">
                  Tải ảnh lên
                </Button>
              </Upload>
              <div className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5">Định dạng JPG hoặc PNG, dung lượng tối đa 5MB.</div>
            </div>
          </div>
        </div>

        <Form.Item
          name="name"
          label={<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Họ và tên <span className="text-red-500">*</span></span>}
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
        >
          <Input size="middle" placeholder="Nhập họ và tên" className="rounded-lg" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="role"
              label={<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Vai trò <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select
                size="middle"
                placeholder="Chọn vai trò"
                options={roles.map((r) => ({ value: r.id.toString(), label: r.name }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="department"
              label={<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Phòng ban <span className="text-red-500">*</span></span>}
              rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}
            >
              <Select
                size="middle"
                placeholder="Chọn phòng ban"
                options={departments.map((d) => ({ value: d.id.toString(), label: d.name }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label={<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Email <span className="text-red-500">*</span></span>}
              rules={[{ required: true, type: 'email', message: 'Email không đúng định dạng' }]}
            >
              <Input size="middle" placeholder="email@example.com" className="rounded-lg" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label={<span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Số điện thoại</span>}
            >
              <Input size="middle" placeholder="0123456789" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              label={
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {modalMode === 'add' ? 'Mật khẩu' : 'Mật khẩu mới (Bỏ trống nếu không đổi)'}
                  {modalMode === 'add' && <span className="text-red-500"> *</span>}
                </span>
              }
              rules={[{ required: modalMode === 'add', message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password size="middle" placeholder="******" className="rounded-lg" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="confirmPassword"
              label={
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  {modalMode === 'add' ? 'Xác nhận mật khẩu' : 'Xác nhận mật khẩu mới'}
                  {modalMode === 'add' && <span className="text-red-500"> *</span>}
                </span>
              }
              rules={[{ required: modalMode === 'add', message: 'Vui lòng xác nhận mật khẩu' }]}
            >
              <Input.Password size="middle" placeholder="******" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
