'use client';

import React from 'react';
import { Typography } from 'antd';
import { mixins, type as t } from '@/lib/design-tokens';

const { Title, Text } = Typography;

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

/** 页面外层容器 + 统一标题，所有页面共用 */
export default function PageWrap({ title, subtitle, children }: Props) {
  return (
    <div style={{ ...mixins.pageWrap }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, ...t.pageTitle }}>{title}</Title>
        {subtitle && <Text type="secondary" style={{ ...t.caption, marginTop: 4, display: 'block' }}>{subtitle}</Text>}
      </div>
      {children}
    </div>
  );
}
