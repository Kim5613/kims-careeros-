/**
 * 窗口拖拽 Hook
 * 在 frameless 窗口中，通过 mousedown 事件触发 Tauri 的 start_dragging
 */

import { useCallback, useRef } from 'react';

// Tauri API 全局注入
declare global {
  interface Window {
    __TAURI__?: {
      core?: {
        invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
      };
    };
  }
}

export function useDrag() {
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // 不对按钮、输入框等元素触发拖拽
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    isDragging.current = true;
    offset.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - offset.current.x;
    const dy = e.clientY - offset.current.y;

    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return; // 去抖

    try {
      // Tauri v2: 通过 invoke 命令开始拖动（由系统处理窗口移动）
      if (window.__TAURI__?.core?.invoke) {
        window.__TAURI__.core.invoke('plugin:window|start_dragging');
      }
    } catch {
      // fallback: Tauri API 不可用时忽略
    }

    isDragging.current = false;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return { onMouseDown, onMouseMove, onMouseUp };
}
