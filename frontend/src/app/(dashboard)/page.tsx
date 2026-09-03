"use client";

import React from 'react';
import { Typography, Row, Col, Card, Button, Avatar, Progress, Table, Space, Tag } from 'antd';
import { 
  DownloadOutlined, 
  PlusOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  DollarOutlined,
  UsergroupAddOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

const { Title, Text } = Typography;

// Mock Data cho Charts
const donutData = [
  { name: 'Engineering', value: 488, color: '#0ea5e9' },
  { name: 'Marketing', value: 282, color: '#f43f5e' },
  { name: 'Finance', value: 231, color: '#10b981' },
  { name: 'Sales', value: 180, color: '#f59e0b' },
  { name: 'HR', value: 103, color: '#8b5cf6' },
];

const barData = [
  { name: 'Mon', value: 80 },
  { name: 'Tue', value: 85 },
  { name: 'Wed', value: 90 },
  { name: 'Thu', value: 60 },
  { name: 'Fri', value: 100 },
  { name: 'Sat', value: 50 },
  { name: 'Sun', value: 40 },
];

const lineData = [
  { name: 'Jan', value: 1100 },
  { name: 'Feb', value: 1150 },
  { name: 'Mar', value: 1130 },
  { name: 'Apr', value: 1200 },
  { name: 'May', value: 1180 },
  { name: 'Jun', value: 1248 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const userName = user?.name?.split(' ')[0] || 'Andrew';

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <Title level={3} className="!mb-1 font-semibold text-gray-800">
            Good morning, {userName} <span className="text-2xl">👋</span>
          </Title>
          <Text className="text-gray-500">
            You have 7 leave requests and 2 urgent alerts pending.
          </Text>
        </div>
        <div className="flex gap-3">
          <Button icon={<DownloadOutlined />} className="rounded-lg font-medium text-gray-600 border-gray-200">
            Export <RightOutlined className="text-[10px] ml-1 rotate-90" />
          </Button>
          <Button type="primary" className="bg-[#1e293b] hover:bg-slate-700 rounded-lg font-medium border-0" icon={<PlusOutlined />}>
            Add Employee
          </Button>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* Total Workforce */}
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl h-full" styles={{ body: { padding: '24px' } }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <Text className="font-semibold text-gray-800 text-base block mb-2">Total Workforce</Text>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-gray-800">1,284</span>
                  <Tag color="success" className="mb-1 rounded-md bg-green-50 text-green-600 border-0 flex items-center px-2 py-0.5">
                    <span className="text-xs font-semibold">↗ 12 new this month</span>
                  </Tag>
                </div>
                <Text className="text-gray-400 text-xs mt-1 block">Active employees across 7 departments</Text>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TeamOutlined className="text-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                    <CalendarOutlined />
                  </div>
                  <Tag color="success" className="bg-green-50 text-green-600 border-0 text-[10px] font-bold m-0">↗ 3.64%</Tag>
                </div>
                <Text className="text-gray-500 text-xs block mb-1">On Leave Today</Text>
                <span className="text-xl font-bold text-gray-800">23</span>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                    <CheckCircleOutlined />
                  </div>
                  <Tag color="success" className="bg-green-50 text-green-600 border-0 text-[10px] font-bold m-0">↗ 3.64%</Tag>
                </div>
                <Text className="text-gray-500 text-xs block mb-1">Attendance Rate</Text>
                <span className="text-xl font-bold text-gray-800">94.2%</span>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                    <UsergroupAddOutlined />
                  </div>
                  <Tag color="success" className="bg-green-50 text-green-600 border-0 text-[10px] font-bold m-0">↗ 3.64%</Tag>
                </div>
                <Text className="text-gray-500 text-xs block mb-1">Open Positions</Text>
                <span className="text-xl font-bold text-gray-800">47</span>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white">
                    <DollarOutlined />
                  </div>
                  <Tag color="success" className="bg-green-50 text-green-600 border-0 text-[10px] font-bold m-0">↗ 3.64%</Tag>
                </div>
                <Text className="text-gray-500 text-xs block mb-1">Monthly Payroll</Text>
                <span className="text-xl font-bold text-gray-800">$1,248K</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Employee Distribution */}
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl h-full flex flex-col" styles={{ body: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' } }}>
            <div className="flex justify-between items-center mb-6">
              <Text className="font-semibold text-gray-800 text-base">Employee Distribution</Text>
              <Tag className="rounded-full bg-green-50 text-green-600 border-0 px-3 font-medium">Live</Tag>
            </div>
            
            <div className="flex items-center justify-between mt-2 mb-8">
              <div className="w-40 h-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-gray-800 leading-none mb-1">1,284</span>
                  <span className="text-[10px] text-gray-400">Employees</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {donutData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <Text className="text-gray-500 text-xs">{item.name}</Text>
                    </div>
                    <Text className="text-gray-800 font-semibold text-xs">{item.value}</Text>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-6">
              <div>
                <span className="text-xl font-bold text-gray-800 block">1196</span>
                <span className="text-gray-400 text-xs">Active</span>
              </div>
              <div className="border-l border-gray-100">
                <span className="text-xl font-bold text-gray-800 block">88</span>
                <span className="text-gray-400 text-xs">Inactive</span>
              </div>
              <div className="border-l border-gray-100">
                <span className="text-xl font-bold text-gray-800 block">12</span>
                <span className="text-gray-400 text-xs">On Leave</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Attendance Summary */}
        <Col xs={24} lg={8}>
          <Card variant="borderless" className="shadow-sm rounded-xl h-full" styles={{ body: { padding: '24px' } }}>
            <div className="flex justify-between items-center mb-6">
              <Text className="font-semibold text-gray-800 text-base">Attendance Summary</Text>
              <Button size="small" type="text" className="text-gray-500 font-medium text-xs">View Logs <RightOutlined className="text-[10px]"/></Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50/50 rounded-lg p-3">
                <Text className="text-gray-400 text-xs block mb-1">Present</Text>
                <span className="text-xl font-bold text-gray-800 block mb-1">1209</span>
                <Text className="text-gray-500 text-[10px]">94.2% of workforce</Text>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <Text className="text-gray-400 text-xs block mb-1">Late</Text>
                <span className="text-xl font-bold text-gray-800 block mb-1">78</span>
                <Text className="text-gray-500 text-[10px]">After 9:30 AM</Text>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <Text className="text-gray-400 text-xs block mb-1">Absent</Text>
                <span className="text-xl font-bold text-gray-800 block mb-1">52</span>
                <Text className="text-gray-500 text-[10px]">Unplanned absence</Text>
              </div>
              <div className="bg-gray-50/50 rounded-lg p-3">
                <Text className="text-gray-400 text-xs block mb-1">Remote</Text>
                <span className="text-xl font-bold text-gray-800 block mb-1">361</span>
                <Text className="text-gray-500 text-[10px]">WFH approved</Text>
              </div>
            </div>

            <Text className="font-semibold text-gray-800 text-sm block mb-4">Weekly Attendance Trend</Text>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 4, 4]} barSize={16}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Thu' ? '#f97316' : '#14b8a6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Row 2: Payroll & Recruitment */}
        <Col xs={24} lg={12}>
          <div className="bg-[#1e293b] rounded-xl p-6 h-full flex flex-col text-white relative overflow-hidden shadow-md">
            <div className="flex justify-between items-start relative z-10 mb-8">
              <div>
                <Text className="text-slate-300 text-sm block mb-1">Monthly Payroll</Text>
                <span className="text-4xl font-bold text-white block mb-1">$1,248K</span>
                <Text className="text-slate-400 text-xs">March 2026 - 1,196 employees</Text>
              </div>
              <Button className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg backdrop-blur-sm" icon={<DownloadOutlined />}>
                Download Payslip
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 relative z-10 mb-8">
              <div>
                <Text className="text-slate-300 text-xs block mb-1">Avg Salary</Text>
                <span className="text-xl font-bold text-white">$1,285.3K</span>
              </div>
              <div>
                <Text className="text-slate-300 text-xs block mb-1">Last Month</Text>
                <span className="text-xl font-bold text-white">$1,196K</span>
              </div>
              <div>
                <Text className="text-slate-300 text-xs block mb-1">MOM Growth</Text>
                <span className="text-xl font-bold text-white">4.2%</span>
              </div>
            </div>

            <div className="mt-auto relative z-10">
              <Text className="text-slate-300 text-sm font-semibold block mb-4">6-Month Payroll Trend</Text>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-700/30 rounded-full blur-3xl pointer-events-none"></div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <Card variant="borderless" className="shadow-sm rounded-xl h-full" styles={{ body: { padding: '24px' } }}>
            <div className="flex justify-between items-center mb-6">
              <Text className="font-semibold text-gray-800 text-base">Recruitment Pipeline</Text>
              <Button size="small" className="rounded-md font-medium text-gray-600">
                <PlusOutlined className="text-xs" /> Post New Job
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border border-gray-100 rounded-lg p-3 flex gap-3 relative overflow-hidden">
                <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-800 block leading-tight">47</span>
                  <span className="text-[10px] text-gray-500">New Applicants</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full"></div>
              </div>
              <div className="border border-gray-100 rounded-lg p-3 flex gap-3 relative overflow-hidden">
                <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center text-gray-400">
                  <UsergroupAddOutlined className="text-lg" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-800 block leading-tight">23</span>
                  <span className="text-[10px] text-gray-500">Screening</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-full"></div>
              </div>
              <div className="border border-gray-100 rounded-lg p-3 flex gap-3 relative overflow-hidden">
                <div className="w-10 h-10 bg-gray-50 rounded-md flex items-center justify-center text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-800 block leading-tight">12</span>
                  <span className="text-[10px] text-gray-500">Interviews</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-blue-500 w-full"></div>
              </div>
            </div>

            <Text className="font-semibold text-gray-800 text-sm block mb-4">Recent Candidates</Text>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Alex Thompson', role: 'Senior Developer', status: 'Interview', color: 'pink' },
                { name: 'Maria Garcia', role: 'UX Designer', status: 'Applied', color: 'orange' },
                { name: 'Thomas Mervin', role: 'Senior Developer', status: 'Offer Made', color: 'purple' },
                { name: 'Regina Bryant', role: 'Android Developer', status: 'Hired', color: 'green' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar src={`https://api.dicebear.com/7.x/notionists/svg?seed=${c.name}`} className="bg-gray-100" />
                    <div className="leading-tight">
                      <Text strong className="text-sm block">{c.name}</Text>
                      <Text className="text-xs text-gray-400">{c.role}</Text>
                    </div>
                  </div>
                  <Tag color={c.color} className="rounded-full px-3 border-0 bg-opacity-20 font-medium m-0">
                    {c.status}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>

      </Row>
    </div>
  );
}
