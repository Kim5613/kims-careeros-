/**
 * useSummon — 检测 CareerOS 的召唤信号
 *
 * 每 3 秒轮询 GET /api/pet/summon
 * 检测到信号 → 自动展开桌宠窗口
 */

import { useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:3000';
const POLL_INTERVAL = 3_000; // 3 秒

export function useSummon(isExpanded: boolean, onSummon: () => void) {
  const onSummonRef = useRef(onSummon);
  onSummonRef.current = onSummon;
  const isExpandedRef = useRef(isExpanded);
  isExpandedRef.current = isExpanded;

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pet/summon`);
        if (!res.ok) return;
        const { summoned } = await res.json();
        if (summoned && !isExpandedRef.current) {
          onSummonRef.current();
        }
      } catch {
        // CareerOS 未启动，静默
      }
    };

    check();
    const timer = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);
}
