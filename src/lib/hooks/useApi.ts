'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiOptions<T> {
  /** 创建时 POST 到此端点 */
  endpoint: string;
  /** API 失败时的降级数据 */
  mockData: T[];
  /** 是否在挂载时自动获取，默认 true */
  fetchOnMount?: boolean;
}

interface UseApiReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (item: Partial<T>) => Promise<T | null>;
  update: (id: string, changes: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * 通用 API 数据管理 hook
 *
 * 模式：API-first + Mock 降级
 * - 优先从 API 读写数据
 * - API 不可用时自动降级到本地 mock 数据
 * - 适合替换页面中 `useState(mockData)` 的模式
 */
export function useApiList<T extends { id: string }>(
  options: UseApiOptions<T>
): UseApiReturn<T> {
  const { endpoint, mockData, fetchOnMount = true } = options;

  const [data, setData] = useState<T[]>(mockData);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json)) {
        setData(json.length > 0 ? json : []);
        setApiAvailable(true);
      }
    } catch {
      setData(mockData);
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint, mockData]);

  useEffect(() => {
    if (fetchOnMount) refetch();
  }, [fetchOnMount, refetch]);

  const create = useCallback(
    async (item: Partial<T>): Promise<T | null> => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error(await res.json().then((d) => d.error).catch(() => '创建失败'));
        const created = await res.json();
        setData((prev) => [created, ...prev]);
        return created;
      } catch {
        // 本地降级
        const fallback = { ...item, id: `local-${Date.now()}`, createdAt: new Date().toISOString() } as unknown as T;
        setData((prev) => [fallback, ...prev]);
        return fallback;
      }
    },
    [endpoint]
  );

  const update = useCallback(
    async (id: string, changes: Partial<T>): Promise<T | null> => {
      try {
        const res = await fetch(`${endpoint}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        });
        if (!res.ok) throw new Error('更新失败');
        const updated = await res.json();
        setData((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
        return updated;
      } catch {
        // 本地降级
        setData((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
        );
        return { id, ...changes } as unknown as T;
      }
    },
    [endpoint]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('删除失败');
        setData((prev) => prev.filter((item) => item.id !== id));
        return true;
      } catch {
        // 本地降级
        setData((prev) => prev.filter((item) => item.id !== id));
        return true;
      }
    },
    [endpoint]
  );

  return { data, loading, error, create, update, remove, refetch };
}
