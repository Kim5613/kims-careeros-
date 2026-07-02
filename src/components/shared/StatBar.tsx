'use client';

import React from 'react';
import { Typography } from 'antd';
import { mixins, type as t } from '@/lib/design-tokens';

const { Text } = Typography;

type StatItem = {
  label: string;
  value: string | number;
  color?: string;
};

type Props = {
  items: StatItem[];
  style?: React.CSSProperties;
};

/** 统计卡片条：统一圆角14 + 彩色顶部细线 */
export default function StatBar({ items, style }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: 12,
      marginBottom: 16,
      ...style,
    }}>
      {items.map((item, i) => (
        <div key={i} style={mixins.statCard(item.color)}>
          <div style={{ padding: '14px 18px', textAlign: 'center' }}>
            <Text style={{ ...t.caption, display: 'block', marginBottom: 4 }}>{item.label}</Text>
            <Text strong style={{ fontSize: 24, color: item.color || '#333' }}>{item.value}</Text>
          </div>
        </div>
      ))}
    </div>
  );
}
