import type { Metadata } from 'next';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: "Kim's CareerOS",
  description: "Kim 的职业发展与 HR 工作管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, marginLeft: 240, background: '#f5f5f5' }}>
              <div style={{ padding: 24 }}>
                {children}
              </div>
            </main>
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
}
