/**
 * AI 对话 Hook — 连接 CareerOS /api/chat
 * 支持流式输出、工具调用状态、消息历史管理
 */

import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
  toolName?: string;
  toolStatus?: 'calling' | 'done';
}

interface UseChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  isThinking: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

const API_BASE = 'http://localhost:3000';

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setIsThinking(true);

    // 中止之前的请求
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 构建消息历史（只发送 role + content）
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role === 'tool' ? 'assistant' : m.role,
        content: m.role === 'tool'
          ? `[工具调用: ${m.toolName}] ${m.content}`
          : m.content,
      }));

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // 流式读取
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = crypto.randomUUID();

      // 添加一条空的助手消息，边读边更新
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
      ]);

      setIsThinking(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // AI SDK 的 text stream 格式：纯文本，直接拼接
        assistantContent += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: assistantContent } : m,
          ),
        );
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('[useChat]', error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '抱歉，连接遇到问题了。请确认 CareerOS 正在运行（localhost:3000）。',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsStreaming(false);
      setIsThinking(false);
    }
  }, [messages, isStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, isThinking, sendMessage, clearMessages };
}
