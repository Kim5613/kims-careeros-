/**
 * useAntiBlocking — 防遮挡 Hook
 *
 * 收起态 15 秒无互动后自动缩小+半透明，不挡工作区域
 * 鼠标靠近时立即恢复，保持随时可交互
 *
 * 后续可升级为真正的 click-through（需 Rust 端配合）
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const IDLE_TIMEOUT = 15_000; // 15 秒后触发收缩
const CHECK_INTERVAL = 1_000; // 每秒检查一次

interface AntiBlockingState {
  /** 是否处于收缩态 */
  isShrunk: boolean;
  /** 当前透明度 */
  opacity: number;
  /** 当前缩放 */
  scale: number;
}

export function useAntiBlocking(isExpanded: boolean, isStreaming: boolean) {
  const [state, setState] = useState<AntiBlockingState>({
    isShrunk: false,
    opacity: 1,
    scale: 1,
  });

  const lastInteractionRef = useRef(Date.now());
  const isHoveringRef = useRef(false);

  // 记录互动时间
  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (state.isShrunk) {
      setState({ isShrunk: false, opacity: 1, scale: 1 });
    }
  }, [state.isShrunk]);

  // 定时检查 idle 状态
  useEffect(() => {
    // 展开态或正在流式输出时不收缩
    if (isExpanded || isStreaming) {
      if (state.isShrunk) {
        setState({ isShrunk: false, opacity: 1, scale: 1 });
      }
      return;
    }

    const timer = setInterval(() => {
      const idle = Date.now() - lastInteractionRef.current;
      if (idle >= IDLE_TIMEOUT && !isHoveringRef.current && !state.isShrunk) {
        setState({ isShrunk: true, opacity: 0.3, scale: 0.35 });
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(timer);
  }, [isExpanded, isStreaming, state.isShrunk]);

  // 鼠标事件处理
  const petHandlers = {
    onMouseEnter: useCallback(() => {
      isHoveringRef.current = true;
      recordInteraction();
    }, [recordInteraction]),
    onMouseLeave: useCallback(() => {
      isHoveringRef.current = false;
    }, []),
    onClick: useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      recordInteraction();
    }, [recordInteraction]),
  };

  return {
    ...state,
    recordInteraction,
    petHandlers,
  };
}
