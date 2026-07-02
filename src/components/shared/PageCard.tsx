'use client';

import React from 'react';
import { Card } from 'antd';
import { mixins, radius } from '@/lib/design-tokens';

type Props = {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
  style?: React.CSSProperties;
};

/** 统一内容卡片：圆角20 + 柔和阴影，所有页面共用 */
export default function PageCard({ title, extra, children, noPadding, style }: Props) {
  return (
    <Card
      title={title}
      extra={extra}
      style={{ ...mixins.card, marginBottom: 16, ...style }}
      styles={{
        body: {
          padding: noPadding ? 0 : '16px 20px',
          borderRadius: radius.lg,
        },
      }}
    >
      {children}
    </Card>
  );
}
