"use client";

import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, App } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const loginStore = useAuthStore((state) => state.login);
  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Gọi API Login backend
      const res = await axios.post('http://localhost:3001/auth/login', {
        email: values.email,
        password: values.password,
      });
      const { user, permissions, access_token } = res.data;

      // Lưu vào Zustand
      loginStore(user, permissions, access_token);

      // Lưu localStorage để giữ session
      localStorage.setItem('access_token', access_token);

      message.success('Đăng nhập thành công!');

      // Chuyển hướng về trang chủ
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 sm:p-6 overflow-hidden">
      {/* Custom Styles for Particle Floating Animations */}
      <style>{`
        @keyframes longDrift1 {
          0% { transform: translate(0px, 0px) scale(0.9); opacity: 0.2; }
          25% { transform: translate(-55px, -70px) scale(1.15); opacity: 0.9; }
          50% { transform: translate(40px, -120px) scale(0.8); opacity: 0.35; }
          75% { transform: translate(80px, -55px) scale(1.1); opacity: 0.85; }
          100% { transform: translate(0px, 0px) scale(0.9); opacity: 0.2; }
        }
        @keyframes longDrift2 {
          0% { transform: translate(0px, 0px) scale(1); opacity: 0.45; }
          30% { transform: translate(85px, 60px) scale(1.2); opacity: 0.95; }
          60% { transform: translate(-70px, 110px) scale(0.75); opacity: 0.25; }
          85% { transform: translate(-30px, 40px) scale(1.1); opacity: 0.8; }
          100% { transform: translate(0px, 0px) scale(1); opacity: 0.45; }
        }
        @keyframes longDrift3 {
          0% { transform: translate(0px, 0px) scale(1.1); opacity: 0.3; }
          20% { transform: translate(-95px, 45px) scale(0.85); opacity: 0.8; }
          50% { transform: translate(60px, -95px) scale(1.2); opacity: 0.95; }
          80% { transform: translate(110px, -35px) scale(0.9); opacity: 0.4; }
          100% { transform: translate(0px, 0px) scale(1.1); opacity: 0.3; }
        }
        @keyframes longDrift4 {
          0% { transform: translate(0px, 0px) scale(0.85); opacity: 0.4; }
          25% { transform: translate(65px, -80px) scale(1.15); opacity: 0.9; }
          55% { transform: translate(125px, 40px) scale(0.7); opacity: 0.25; }
          80% { transform: translate(-50px, 85px) scale(1.1); opacity: 0.85; }
          100% { transform: translate(0px, 0px) scale(0.85); opacity: 0.4; }
        }
        @keyframes longDrift5 {
          0% { transform: translate(0px, 0px) scale(0.9); opacity: 0.35; }
          35% { transform: translate(-90px, -90px) scale(1.2); opacity: 0.95; }
          65% { transform: translate(-30px, 70px) scale(0.75); opacity: 0.35; }
          85% { transform: translate(60px, -25px) scale(1.1); opacity: 0.75; }
          100% { transform: translate(0px, 0px) scale(0.9); opacity: 0.35; }
        }
        @keyframes longDrift6 {
          0% { transform: translate(0px, 0px) scale(1.1); opacity: 0.6; }
          30% { transform: translate(-65px, 80px) scale(0.8); opacity: 0.3; }
          70% { transform: translate(95px, -75px) scale(1.2); opacity: 0.95; }
          100% { transform: translate(0px, 0px) scale(1.1); opacity: 0.6; }
        }
        @keyframes longDrift7 {
          0% { transform: translate(0px, 0px) scale(0.85); opacity: 0.25; }
          40% { transform: translate(105px, -85px) scale(1.2); opacity: 0.9; }
          75% { transform: translate(-70px, -50px) scale(0.8); opacity: 0.4; }
          100% { transform: translate(0px, 0px) scale(0.85); opacity: 0.25; }
        }
        @keyframes longDrift8 {
          0% { transform: translate(0px, 0px) scale(1); opacity: 0.4; }
          33% { transform: translate(-80px, 60px) scale(1.2); opacity: 0.9; }
          66% { transform: translate(90px, 95px) scale(0.75); opacity: 0.25; }
          100% { transform: translate(0px, 0px) scale(1); opacity: 0.4; }
        }
        .particle-1 { animation: longDrift1 8.5s ease-in-out infinite; }
        .particle-2 { animation: longDrift2 10.0s ease-in-out infinite 0.8s; }
        .particle-3 { animation: longDrift3 11.0s ease-in-out infinite 1.5s; }
        .particle-4 { animation: longDrift4 9.0s ease-in-out infinite 2.2s; }
        .particle-5 { animation: longDrift5 7.8s ease-in-out infinite 1.0s; }
        .particle-6 { animation: longDrift6 10.5s ease-in-out infinite 2.5s; }
        .particle-7 { animation: longDrift7 9.5s ease-in-out infinite 3.0s; }
        .particle-8 { animation: longDrift8 11.5s ease-in-out infinite 0.5s; }
      `}</style>

      {/* Curved Top Background Banner with Image & Chaotic Animated Particles */}
      <div className="absolute top-0 left-0 right-0 h-[380px] md:h-[400px] z-0 overflow-hidden">
        {/* Background Image of Corporate Team/Office */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
          style={{ backgroundImage: "url('/auth-bg.jpg')" }}
        />

        {/* Deep Blue / Navy Translucent Overlay for High Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f]/85 via-[#1e3a8a]/75 to-[#0a192f]/85 mix-blend-multiply" />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />

        {/* Chaotic Long-Journey Floating Moving Particles - Scaled down 50% */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Left Wing Particles */}
          <div className="particle-1 absolute top-8 left-[5%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
          <div className="particle-3 absolute top-18 left-[12%] w-[3px] h-[3px] bg-white/90 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
          <div className="particle-2 absolute top-10 left-[22%] w-1 h-1 bg-white/90 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
          <div className="particle-5 absolute top-32 left-[4%] w-[3px] h-[3px] bg-white/70 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.6)]" />
          <div className="particle-4 absolute top-40 left-[16%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
          <div className="particle-6 absolute top-26 left-[28%] w-[2px] h-[2px] bg-white/60 rounded-full" />
          <div className="particle-7 absolute top-52 left-[9%] w-1 h-1 bg-white/80 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.7)]" />
          <div className="particle-8 absolute top-46 left-[25%] w-[3px] h-[3px] bg-white/75 rounded-full" />
          <div className="particle-2 absolute top-60 left-[18%] w-1 h-1 bg-white/85 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
          <div className="particle-5 absolute top-16 left-[33%] w-[2px] h-[2px] bg-white/60 rounded-full" />
          <div className="particle-3 absolute top-66 left-[6%] w-[3px] h-[3px] bg-white/70 rounded-full" />
          <div className="particle-1 absolute top-36 left-[34%] w-1 h-1 bg-white/80 rounded-full" />

          {/* Center Upper Sky Particles */}
          <div className="particle-7 absolute top-6 left-[42%] w-1 h-1 bg-white/85 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
          <div className="particle-4 absolute top-14 left-[48%] w-[3px] h-[3px] bg-white/70 rounded-full" />
          <div className="particle-8 absolute top-8 left-[55%] w-1 h-1 bg-white/80 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />

          {/* Right Wing Particles */}
          <div className="particle-5 absolute top-6 right-[8%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
          <div className="particle-1 absolute top-16 right-[17%] w-[3px] h-[3px] bg-white/90 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
          <div className="particle-6 absolute top-10 right-[27%] w-1 h-1 bg-white/90 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
          <div className="particle-3 absolute top-36 right-[5%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
          <div className="particle-4 absolute top-28 right-[21%] w-[3px] h-[3px] bg-white/75 rounded-full" />
          <div className="particle-7 absolute top-46 right-[13%] w-1 h-1 bg-white/80 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.7)]" />
          <div className="particle-2 absolute top-22 right-[33%] w-[3px] h-[3px] bg-white/80 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.7)]" />
          <div className="particle-8 absolute top-54 right-[22%] w-1 h-1 bg-white/70 rounded-full" />
          <div className="particle-5 absolute top-42 right-[30%] w-[3px] h-[3px] bg-white/85 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.7)]" />
          <div className="particle-1 absolute top-62 right-[10%] w-[3px] h-[3px] bg-white/60 rounded-full" />
          <div className="particle-6 absolute top-50 right-[35%] w-[2px] h-[2px] bg-white/60 rounded-full" />
          <div className="particle-3 absolute top-68 right-[25%] w-1 h-1 bg-white/75 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.7)]" />

          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[320px] bg-blue-400/15 blur-3xl rounded-full" />
        </div>

        {/* Bottom Curve Wave SVG - Elevated according to user's red line drawing */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
          <svg
            viewBox="0 0 1440 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-24 md:h-36 text-[#f8fafc] fill-current"
            preserveAspectRatio="none"
          >
            <path d="M 0,38 C 220,70 480,135 690,135 C 920,135 1200,60 1440,12 L 1440,140 L 0,140 Z" />
          </svg>
        </div>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-[430px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-100/90 p-8 sm:p-10 my-auto">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <svg
            width="36"
            height="36"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            {/* Hexagon Border */}
            <path
              d="M22 4L37.5885 13V31L22 40L6.41154 31V13L22 4Z"
              stroke="#0f766e"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="#f0fdfa"
            />
            {/* Growth Graph Arrow */}
            <path
              d="M15 25.5L20.5 20L24.5 24L30 17"
              stroke="#0d9488"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26 17H30V21"
              stroke="#0d9488"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Node Dots on Vertices */}
            <circle cx="22" cy="4" r="3" fill="#2563eb" />
            <circle cx="37.6" cy="13" r="3" fill="#ea580c" />
            <circle cx="37.6" cy="31" r="3" fill="#dc2626" />
            <circle cx="22" cy="40" r="3" fill="#f59e0b" />
            <circle cx="6.4" cy="31" r="3" fill="#0d9488" />
            <circle cx="6.4" cy="13" r="3" fill="#3b82f6" />
          </svg>
          <span className="text-[25px] font-bold tracking-tight text-slate-800">
            BizSocial <span className="font-extrabold text-slate-900">ERP</span>
          </span>
        </div>

        {/* Header Titles */}
        <div className="text-center mb-6">
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight mb-1">
            Chào mừng trở lại!
          </h1>
          <p className="text-slate-500 text-sm">
            Đăng nhập vào tài khoản BizSocial ERP của bạn
          </p>
        </div>

        {/* Login Form */}
        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          {/* Email Address */}
          <div className="mb-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Địa chỉ Email
            </label>
          </div>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Địa chỉ Email không đúng định dạng!' },
            ]}
            className="!mb-4"
          >
            <Input
              size="large"
              placeholder="you@example.com"
              className="h-11 rounded-lg border-slate-200 text-slate-800 placeholder:text-slate-400 hover:border-teal-500 focus:border-teal-500"
            />
          </Form.Item>

          {/* Password */}
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={() => message.info('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu!')}
              className="text-xs sm:text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              Quên mật khẩu?
            </button>
          </div>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            className="!mb-3"
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-slate-400 mr-2 text-base" />}
              placeholder="************"
              className="h-11 rounded-lg border-slate-200 text-slate-800 placeholder:text-slate-400 hover:border-teal-500 focus:border-teal-500"
            />
          </Form.Item>

          {/* Remember me */}
          <Form.Item name="remember" valuePropName="checked" className="!mb-5">
            <Checkbox className="text-slate-500 text-sm font-normal select-none">
              Ghi nhớ đăng nhập
            </Checkbox>
          </Form.Item>

          {/* Submit Button (Dark Navy) */}
          <Form.Item className="!mb-0">
            <Button
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full !h-11 !bg-[#1c2434] hover:!bg-[#0f172a] active:!bg-[#090d16] !text-white font-semibold text-base !rounded-lg !border-0 shadow-sm transition-all"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
