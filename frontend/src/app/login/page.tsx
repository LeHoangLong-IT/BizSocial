"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Gọi API Login (Phase 1 giả lập endpoint)
      // const res = await axios.post('http://localhost:3001/auth/login', values);
      // const { token, permissions } = res.data;
      // localStorage.setItem('token', token);
      // localStorage.setItem('permissions', JSON.stringify(permissions));
      
      message.success('Đăng nhập thành công!');
      
      // Redirect...
    } catch (error) {
      message.error('Sai tài khoản hoặc mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border-0 p-4">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">BizSocial ERP</Title>
          <p className="text-gray-500">Đăng nhập vào hệ thống</p>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập Email!' }]}
          >
            <Input size="large" placeholder="admin@bizsocial.com" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password size="large" placeholder="******" />
          </Form.Item>

          <Form.Item className="mt-8">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full"
              loading={loading}
            >
              Đăng Nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
