'use client';

import React from 'react';
import { Result } from 'antd';

interface Props {
  icon: string;       // emoji
  title: string;      // 中文标题
  subtitle: string;   // 英文副标题
  description?: string;
}

export default function PlaceholderPage({ icon, title, subtitle, description }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 40,
      background: '#faf8f6',
    }}>
      <Result
        icon={<span style={{ fontSize: 64 }}>{icon}</span>}
        title={<span style={{ fontSize: 22, fontWeight: 600 }}>{title}</span>}
        subTitle={
          <div>
            <div style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>{subtitle}</div>
            {description && <div style={{ fontSize: 13, color: '#bbb' }}>{description}</div>}
          </div>
        }
      />
    </div>
  );
}
