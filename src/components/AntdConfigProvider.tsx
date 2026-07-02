'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { getStoredTheme } from '@/lib/themes';
import { radius, colors } from '@/lib/design-tokens';

export function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  const [primaryColor, setPrimaryColor] = useState<string>(colors.primary);

  useEffect(() => {
    const theme = getStoredTheme();
    setPrimaryColor(theme.primaryColor || colors.primary);
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryColor,
          borderRadius: radius.md,
          colorBgContainer: colors.surface,
          colorBgLayout: colors.bg,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Card: {
            borderRadiusLG: radius.lg,
            paddingLG: 20,
          },
          Button: {
            borderRadius: radius.lg,
            primaryShadow: 'none',
          },
          Table: {
            borderRadius: radius.lg,
            headerBg: colors.bg,
            headerBorderRadius: radius.sm,
          },
          Modal: {
            borderRadiusLG: radius.lg,
          },
          Tag: {
            borderRadiusSM: radius.sm,
          },
          Segmented: {
            borderRadius: radius.lg,
          },
          Menu: {
            itemBorderRadius: radius.md,
            itemSelectedBg: colors.primaryLight,
            itemSelectedColor: primaryColor,
            itemActiveBg: '#f3f1ee',
            itemColor: '#666',
            itemHoverColor: '#333',
            subMenuItemBg: 'transparent',
          },
          Layout: {
            siderBg: '#fcfbfa',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
