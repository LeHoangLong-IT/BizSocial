import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdThemeProvider } from '@/components/providers/AntdThemeProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BizSocial ERP",
  description: "Next Generation ERP for Social Media Management",
  icons: {
    icon: "/BizSocial_Logo_1.png",
    shortcut: "/BizSocial_Logo_1.png",
    apple: "/BizSocial_Logo_1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <AntdRegistry>
          <AntdThemeProvider>
            {children}
          </AntdThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
