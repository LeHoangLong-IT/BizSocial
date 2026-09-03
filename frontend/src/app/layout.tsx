import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider, App as AntdApp } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BizSocial ERP",
  description: "Next Generation ERP for Social Media Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1677ff',
                borderRadius: 8,
              },
            }}
          >
            <AntdApp>
              {children}
            </AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
