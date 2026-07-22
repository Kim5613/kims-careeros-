/**
 * 主动提醒轮询 Hook
 * 每 30 秒轮询 /api/pet/notifications，返回当前应显示的提醒
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface Notification {
  type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  data?: unknown;
}

interface UseNotificationsReturn {
  current: Notification | null;
  queue: Notification[];
  dismiss: () => void;
  isEnabled: (type: string) => boolean;
}

const API_BASE = 'http://localhost:3000';
const POLL_INTERVAL = 30000; // 30 秒
const DISPLAY_DURATION = 8000; // 每个提醒显示 8 秒

export function useNotifications(): UseNotificationsReturn {
  const [queue, setQueue] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 轮询
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pet/notifications`);
        if (!res.ok) return;
        const data = await res.json();
        const items: Notification[] = data.notifications || [];

        // 去重：同类型 + 同消息 = 不重复通知
        const newItems = items.filter((n) => {
          const key = `${n.type}:${n.message}`;
          if (seenRef.current.has(key)) return false;
          seenRef.current.add(key);
          return true;
        });

        if (newItems.length > 0) {
          setQueue((prev) => [...prev, ...newItems]);
        }

        // 清理过大的 seen set
        if (seenRef.current.size > 200) {
          seenRef.current = new Set([...seenRef.current].slice(-100));
        }
      } catch {
        // CareerOS 未启动时静默
      }
    };

    poll(); // 首次立即检查
    timerRef.current = setInterval(poll, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // 逐个显示队列中的提醒
  useEffect(() => {
    if (current || queue.length === 0) return;

    // 高优先级先显示
    const sorted = [...queue].sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });

    const next = sorted[0];
    setCurrent(next);
    setQueue((prev) => prev.filter((n) => n !== next));

    // 显示 N 秒后自动消失
    const timeout = setTimeout(() => {
      setCurrent(null);
    }, DISPLAY_DURATION);

    return () => clearTimeout(timeout);
  }, [current, queue]);

  const dismiss = useCallback(() => {
    setCurrent(null);
  }, []);

  // 这里不需要 isEnabled ——桌面端不做过滤，服务端已经按 settings 过滤了
  const isEnabled = useCallback((_type: string) => true, []);

  return { current, queue, dismiss, isEnabled };
}
