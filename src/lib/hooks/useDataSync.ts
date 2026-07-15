/**
 * useDataSync — 自动感知桌宠数据变动，触发 refetch
 *
 * 每 10 秒轮询 /api/pet/data-version，
 * 发现版本号变化时触发回调，确保 CareerOS 页面与桌宠操作保持同步。
 *
 * 用法：
 * ```tsx
 * const { version } = useDataSync(() => {
 *   // 桌宠改了数据，重新拉取
 *   fetchTodos();
 * });
 * ```
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

const POLL_INTERVAL = 10_000; // 10 秒

export function useDataSync(onDataChanged?: () => void) {
  const lastVersionRef = useRef(0);
  const callbackRef = useRef(onDataChanged);
  callbackRef.current = onDataChanged;

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/pet/data-version');
      if (!res.ok) return;
      const { version } = await res.json();

      if (version > lastVersionRef.current) {
        lastVersionRef.current = version;
        callbackRef.current?.();
      }
    } catch {
      // CareerOS 未启动或网络问题，静默
    }
  }, []);

  useEffect(() => {
    // 首次立即检查
    check();

    const timer = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [check]);

  return { checkNow: check };
}
