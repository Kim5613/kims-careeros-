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
          borderRadius: radius.sm,
          colorBgContainer: colors.surface,
          colorBgLayout: colors.bg,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: 14,
          colorText: colors.text,
          colorTextSecondary: colors.textSecondary,
          colorBorder: colors.border,
        },
        components: {
          Card: {
            borderRadiusLG: radius.md,
            paddingLG: 20,
          },
          Button: {
            borderRadius: radius.sm,
            primaryShadow: 'none',
            defaultShadow: 'none',
          },
          Table: {
            borderRadius: radius.md,
            headerBg: colors.bgWarm,
            headerBorderRadius: radius.sm,
          },
          Modal: {
            borderRadiusLG: radius.lg,
          },
          Tag: {
            borderRadiusSM: radius.sm,
          },
          Segmented: {
            borderRadius: radius.sm,
          },
          Input: {
            borderRadius: radius.sm,
            activeBorderColor: primaryColor,
          },
          Menu: {
            itemBorderRadius: radius.sm,
            itemSelectedBg: colors.primaryLight,
            itemSelectedColor: primaryColor,
            itemActiveBg: colors.bgWarm,
            itemColor: colors.textSecondary,
            itemHoverColor: colors.text,
            subMenuItemBg: 'transparent',
          },
          Typography: {
            titleMarginBottom: 0,
            titleMarginTop: 0,
          },
          Layout: {
            siderBg: 'transparent',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}