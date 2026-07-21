'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, Typography } from 'antd';
import { CloseOutlined, SendOutlined, LoadingOutlined, MessageOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const { Text } = Typography;
const { TextArea } = Input;

interface ChatMessage { role: 'user' | 'assistant'; content: string; id: string; }

// 全局事件：其他组件可以 dispatch 'open-ai-panel' 来唤起面板
export const openAIPanel = () => window.dispatchEvent(new CustomEvent('open-ai-panel'));

export default function AISkillPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-ai-panel', handler);
    return () => window.removeEventListener('open-ai-panel', handler);
  }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    try {
      const res = await fetch('/api/ai/hr-roundtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) throw new Error('登录已过期，请刷新页面重新登录');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('响应流不可用');
      const aiId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { role: 'assistant', content: '', id: aiId }]);
      const decoder = new TextDecoder();
      let content = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content } : m));
      }
      if (!content.trim()) {
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: '⚠️ 没有收到回复，请重试' } : m));
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${e.message || '请稍后重试'}`, id: (Date.now() + 1).toString() }]);
    } finally {
      setStreaming(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* 悬浮按钮 */}
      <div
        onClick={() => setOpen(!open)}
        title="大师智囊团"
        style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b7cf0, #6c5ce7)',
          boxShadow: '0 4px 20px rgba(139,124,240,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 24, color: '#fff',
          transition: 'transform 0.2s, box-shadow 0.2s',
          animation: 'aiPulse 2s ease-in-out infinite',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(139,124,240,0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,124,240,0.4)';
        }}
      >
        {open ? <CloseOutlined style={{ fontSize: 20 }} /> : <MessageOutlined style={{ fontSize: 22 }} />}
      </div>

      {/* 右侧滑入面板 */}
      <div style={{
        position: 'fixed', top: 0, right: open ? 0 : -440, bottom: 0,
        width: 420, zIndex: 999,
        background: '#fff',
        boxShadow: open ? '-4px 0 30px rgba(0,0,0,0.12)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #faf8f6, #f5f3f0)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🏛️</span>
            <Text strong style={{ fontSize: 16 }}>大师智囊团</Text>
          </div>
          <Button type="text" icon={<CloseOutlined />} onClick={() => setOpen(false)}
            style={{ color: '#bbb' }} />
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px', background: '#faf8f6' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 60 }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🏛️</span>
              <Text type="secondary">六位大师 + 小七，会诊你的 HR 困惑</Text>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} style={{ marginBottom: 14 }}>
                {m.role === 'user' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '85%', background: '#8b7cf0', color: '#fff',
                      borderRadius: '16px 4px 16px 16px', padding: '10px 16px', fontSize: 13, lineHeight: 1.6 }}>
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>🏛️</span>
                    <div style={{ maxWidth: '88%', background: '#fff', borderRadius: '4px 16px 16px 16px',
                      padding: '10px 14px', fontSize: 12, lineHeight: 1.7, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                      {m.content ? (
                        <ReactMarkdown components={{
                          p: ({ children }) => <Text style={{ fontSize: 12, lineHeight: 1.7, display: 'block' }}>{children}</Text>,
                          h1: ({ children }) => <Text strong style={{ fontSize: 14, display: 'block', margin: '4px 0' }}>{children}</Text>,
                          h2: ({ children }) => <Text strong style={{ fontSize: 13, display: 'block', margin: '3px 0' }}>{children}</Text>,
                          li: ({ children }) => <li style={{ fontSize: 12, lineHeight: 1.7 }}>{children}</li>,
                          ul: ({ children }) => <ul style={{ paddingLeft: 16, margin: '4px 0' }}>{children}</ul>,
                          blockquote: ({ children }) => <blockquote style={{ borderLeft: '2px solid #8b7cf0', paddingLeft: 10, margin: '6px 0', color: '#666', fontSize: 12 }}>{children}</blockquote>,
                          table: ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '4px 0', fontSize: 11 }}>{children}</table>,
                          th: ({ children }) => <th style={{ border: '1px solid #e8e8e8', padding: '4px 8px', background: '#faf8f6', textAlign: 'left' }}>{children}</th>,
                          td: ({ children }) => <td style={{ border: '1px solid #e8e8e8', padding: '4px 8px' }}>{children}</td>,
                        }}>{m.content}</ReactMarkdown>
                      ) : (
                        <Text type="secondary"><LoadingOutlined /> 大师讨论中...</Text>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 18px', display: 'flex', gap: 8 }}>
          <TextArea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="描述你的 HR 问题……" autoSize={{ minRows: 1, maxRows: 3 }}
            disabled={streaming} style={{ borderRadius: 12, fontSize: 13 }} />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend}
            loading={streaming} disabled={!input.trim() || streaming}
            style={{ borderRadius: 12, background: '#8b7cf0', borderColor: '#8b7cf0', minWidth: 38, height: 38 }} />
        </div>
      </div>

      {/* Backdrop */}
      {open && <div onClick={() => setOpen(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.2)' }} />}

      {/* 呼吸灯动画 */}
      <style>{`
        @keyframes aiPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(139,124,240,0.4); }
          50% { box-shadow: 0 4px 28px rgba(139,124,240,0.7); }
        }
      `}</style>
    </>,
    document.body
  );
}
