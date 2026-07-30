'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';

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

  // 竞态守卫：只让最后一次 refetch 生效（快速切换简历版本时，旧响应不会覆盖新数据）
  const reqIdRef = useRef(0);
  // 首次成功加载前才允许 mock 降级；已有真实数据时失败不覆盖，只记 error
  const loadedRef = useRef(false);

  const refetch = useCallback(async () => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (reqId !== reqIdRef.current) return; // 已有更新的请求在飞，丢弃旧响应
      if (Array.isArray(json)) {
        setData(json);
        setApiAvailable(true);
        loadedRef.current = true;
      }
    } catch {
      if (reqId !== reqIdRef.current) return;
      setApiAvailable(false);
      setError('加载失败，请刷新重试');
      if (!loadedRef.current) setData(mockDataRef.current);
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
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
      } catch (err) {
        // 本地降级
        const fallback = { ...item, id: `local-${Date.now()}`, createdAt: new Date().toISOString() } as unknown as T;
        setData((prev) => [fallback, ...prev]);
        // 数据没入库必须让用户知道（否则刷新后"消失"）
        const isNetwork = err instanceof Error && err.message === 'Failed to fetch';
        message.warning(isNetwork
          ? '网络异常，数据仅本地暂存，未同步到服务器'
          : `服务器保存失败（${err instanceof Error ? err.message : '未知错误'}），数据仅本地暂存`);
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
      } catch (err) {
        // 本地降级
        setData((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...changes } : item))
        );
        const isNetwork = err instanceof Error && err.message === 'Failed to fetch';
        message.warning(isNetwork
          ? '网络异常，修改仅本地暂存，未同步到服务器'
          : `服务器更新失败（${err instanceof Error ? err.message : '未知错误'}），修改仅本地暂存`);
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
      } catch (err) {
        // 本地降级
        setData((prev) => prev.filter((item) => item.id !== id));
        const isNetwork = err instanceof Error && err.message === 'Failed to fetch';
        message.warning(isNetwork
          ? '网络异常，删除仅本地生效，未同步到服务器'
          : `服务器删除失败（${err instanceof Error ? err.message : '未知错误'}），删除仅本地生效`);
        return true;
      }
    },
    [endpoint]
  );

  return { data, loading, error, create, update, remove, refetch };
}
