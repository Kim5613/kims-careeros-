/**
 * AI 聊天面板
 * 展开时显示消息列表 + 输入框
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../hooks/useChat';

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  isThinking: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  isListening?: boolean;
  onVoiceToggle?: () => void;
}

export default function ChatPanel({
  messages,
  isStreaming,
  isThinking,
  onSend,
  onClose,
  isListening,
  onVoiceToggle,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动滚到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // 默认聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      width: 360,
      height: 480,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(24, 24, 28, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      overflow: 'hidden',
      animation: 'slideUp 0.25s ease-out',
    }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        cursor: 'move',
      }} data-tauri-drag-region>
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>芝士</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onVoiceToggle}
            style={{
              border: 'none',
              background: isListening ? 'rgba(139, 124, 240, 0.3)' : 'rgba(255,255,255,0.08)',
              color: '#fff',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {isListening ? '🎙️' : '🎤'}
          </button>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 13,
            textAlign: 'center',
            padding: 20,
          }}>
            <div>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🐱</div>
              <div>有什么可以帮你的？</div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
                试试问我"今天有什么安排"<br />
                或"帮我查一下投递状态"
              </div>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{
              maxWidth: '85%',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #8b7cf0, #6c5ce7)'
                : 'rgba(255,255,255,0.08)',
              color: '#fff',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '10px 14px',
              fontSize: 13,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.content || (isStreaming && msg.role === 'assistant' ? (
                <span style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                  <span style={{
                    width: 6, height: 6, background: '#8b7cf0', borderRadius: '50%',
                    animation: 'petIdle 0.6s ease-in-out infinite',
                  }} />
                  <span style={{
                    width: 6, height: 6, background: '#8b7cf0', borderRadius: '50%',
                    animation: 'petIdle 0.6s ease-in-out 0.15s infinite',
                  }} />
                  <span style={{
                    width: 6, height: 6, background: '#8b7cf0', borderRadius: '50%',
                    animation: 'petIdle 0.6s ease-in-out 0.3s infinite',
                  }} />
                </span>
              ) : null)}
            </div>
            <span style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.2)',
              marginTop: 4,
              padding: '0 4px',
            }}>
              {formatTime(msg.timestamp)}
            </span>
          </div>
        ))}
        {isThinking && !isStreaming && (
          <div style={{
            display: 'flex',
            gap: 4,
            padding: '8px 14px',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>💭</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>思考中...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入栏 */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: 8,
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? '正在聆听...' : '说点什么...'}
          disabled={isStreaming || isListening}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '8px 14px',
            color: '#fff',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#8b7cf0'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          style={{
            border: 'none',
            background: input.trim() ? '#8b7cf0' : 'rgba(255,255,255,0.06)',
            color: '#fff',
            borderRadius: 12,
            padding: '8px 16px',
            fontSize: 13,
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s',
            fontWeight: 600,
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}
