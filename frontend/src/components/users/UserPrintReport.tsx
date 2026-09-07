"use client";

import React from 'react';
import { UserDataType } from './UserGridView';

interface UserPrintReportProps {
  users: UserDataType[];
}

export const UserPrintReport: React.FC<UserPrintReportProps> = ({ users }) => {
  return (
    <div className="hidden print:block w-full print-only-view">
      <div className="border-b-2 border-slate-900 pb-3 mb-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide m-0">
            DANH SÁCH NGƯỜI DÙNG HỆ THỐNG
          </h1>
          <p className="text-xs text-slate-500 m-0 mt-1 font-medium">
            BizSocial ERP — Quản trị người dùng & Phân quyền
          </p>
        </div>
        <div className="mt-5 text-xs text-slate-600 flex justify-between items-end">
          <p className="m-0 font-medium">
            Thời gian in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="m-0 text-slate-400 mt-0.5">
            Tổng số nhân sự: {users.length} người
          </p>
        </div>
      </div>

      <table className="w-full border-collapse border border-slate-300 text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-semibold">
            <th className="border border-slate-300 px-2.5 py-2 text-center w-12">STT</th>
            <th className="border border-slate-300 px-3 py-2 text-left w-48">Họ và tên</th>
            <th className="border border-slate-300 px-3 py-2 text-left">Email</th>
            <th className="border border-slate-300 px-2.5 py-2 text-center w-28">Số điện thoại</th>
            <th className="border border-slate-300 px-2.5 py-2 text-center w-28">Vai trò</th>
            <th className="border border-slate-300 px-2.5 py-2 text-center w-32">Phòng ban</th>
            <th className="border border-slate-300 px-2.5 py-2 text-center w-28">Ngày tạo</th>
            <th className="border border-slate-300 px-2 py-2 text-center w-24">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
              <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-500 font-normal">
                {idx + 1}
              </td>
              <td className="border border-slate-300 px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                {u.name} <span className="text-[10px] text-slate-400 font-normal">#{u.id}</span>
              </td>
              <td className="border border-slate-300 px-3 py-2 text-slate-700 font-normal whitespace-nowrap">
                {u.email}
              </td>
              <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-700 font-normal whitespace-nowrap">
                {u.phone || '—'}
              </td>
              <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-800 font-medium whitespace-nowrap">
                {u.role}
              </td>
              <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-700 font-normal whitespace-nowrap">
                {u.department}
              </td>
              <td className="border border-slate-300 px-2.5 py-2 text-center text-slate-600 font-normal whitespace-nowrap">
                {u.createdOn}
              </td>
              <td className="border border-slate-300 px-2 py-2 text-center font-medium whitespace-nowrap">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                    u.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 font-medium'
                      : 'bg-rose-100 text-rose-800 font-medium'
                  }`}
                >
                  {u.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Chân trang in ấn */}
      <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-start text-xs text-slate-500">
        <div>
          <p className="m-0 font-medium text-slate-700">Ghi chú:</p>
          <p className="m-0 text-[11px] text-slate-400">Báo cáo được trích xuất tự động từ phân hệ quản trị BizSocial ERP.</p>
        </div>
        <div className="text-center min-w-[160px]">
          <p className="m-0 font-semibold text-slate-800">Người lập biểu</p>
          <p className="m-0 text-[11px] text-slate-400 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
          <div className="h-14"></div>
        </div>
      </div>
    </div>
  );
};
