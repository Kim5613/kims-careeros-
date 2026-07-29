'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

  // 写操作（POST/PATCH/DELETE）必须用不带查询参数的基础地址，
  // 否则 `${endpoint}/${id}` 会把 id 拼进查询串里，打到集合路由上导致 405
  // （坑点记录：memory/project-kims-careeros.md，2026-07-27）
  const baseEndpoint = endpoint.split('?')[0];

  const [data, setData] = useState<T[]>(mockData);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  // mockData 常是调用方内联生成的数组（每次渲染都是新引用），
  // 若放进依赖数组会导致 refetch 身份每轮渲染都变 → 无限重拉（页面闪动）
  // 用 ref 读最新值，依赖只保留 endpoint
  const mockDataRef = useRef(mockData);
  useEffect(() => {
    mockDataRef.current = mockData;
  }, [mockData]);

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
      setData(mockDataRef.current);
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (fetchOnMount) refetch();
  }, [fetchOnMount, refetch]);

  const create = useCallback(
    async (item: Partial<T>): Promise<T | null> => {
      try {
        const res = await fetch(baseEndpoint, {
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
        const res = await fetch(`${baseEndpoint}/${id}`, {
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
        const res = await fetch(`${baseEndpoint}/${id}`, { method: 'DELETE' });
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
