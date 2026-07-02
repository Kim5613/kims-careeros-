import type { Metadata } from 'next';
import './globals.css';
import 'antd/dist/reset.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AntdConfigProvider } from '@/components/AntdConfigProvider';

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
          <AntdConfigProvider>{children}</AntdConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
