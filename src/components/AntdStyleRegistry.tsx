'use client';

import React, { useState } from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { useServerInsertedHTML } from 'next/navigation';
import type { ReactNode } from 'react';

export default function AntdStyleRegistry({ children }: { children: ReactNode }) {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    const styleText = extractStyle(cache, { plain: true, once: true });
    if (!styleText || styleText.trim() === '') {
      return null;
    }
    // Filter out the cache path marker if present
    if (styleText === '.data-ant-cssinjs-cache-path{content:"";}' || 
        styleText.trim() === '.data-ant-cssinjs-cache-path{content:"";}') {
      return null;
    }
    return (
      <style
        id="antd-cssinjs"
        data-rc-order="prepend"
        data-rc-priority="-1000"
        dangerouslySetInnerHTML={{ __html: styleText }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
