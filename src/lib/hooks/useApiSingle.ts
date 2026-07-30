'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';

interface UseApiSingleOptions<T> {
  /** API 端点 */
  endpoint: string;
  /** API 失败时的降级数据 */
  mockData: T | null;
  /** 是否在挂载时自动获取，默认 true */
  fetchOnMount?: boolean;
}

interface UseApiSingleReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  save: (item: Partial<T>) => Promise<T | null>;
  refetch: () => Promise<void>;
}

/**
 * 通用单例 API 数据管理 hook
 *
 * 模式：API-first + Mock 降级
 * - GET 获取单条记录
 * - POST 执行 upsert（创建或更新）
 * - API 不可用时自动降级到本地 mock 数据
 *
 * 对标 useApiList，但针对单例资源（如 PersonalInfo）
 */
export function useApiSingle<T extends { id?: string }>(
  options: UseApiSingleOptions<T>
): UseApiSingleReturn<T> {
  const { endpoint, mockData, fetchOnMount = true } = options;

  const [data, setData] = useState<T | null>(mockData);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<string | null>(null);

  // 同 useApiList：mockData 若为内联新对象，直接进依赖会无限重拉，用 ref 读最新值
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
      setData(json);
    } catch {
      setData(mockDataRef.current);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (fetchOnMount) refetch();
  }, [fetchOnMount, refetch]);

  const save = useCallback(
    async (item: Partial<T>): Promise<T | null> => {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as any).error || '保存失败');
        }
        const saved = await res.json();
        setData(saved);
        return saved;
      } catch (err) {
        // 本地降级
        const fallback = {
          ...data,
          ...item,
          id: data?.id || `local-${Date.now()}`,
        } as T;
        setData(fallback);
        // 如果是服务端校验失败（非网络错误），重新抛出让调用方处理
        if (err instanceof Error && err.message !== 'Failed to fetch') {
          throw err;
        }
        // 网络失败走了本地降级：数据没入库，必须让用户知道
        message.warning('网络异常，数据仅保存在本地，未同步到服务器');
        return fallback;
      }
    },
    [endpoint, data]
  );

  return { data, loading, error, save, refetch };
}
