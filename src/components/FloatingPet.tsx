'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── 聊天 API ──
interface Msg { id: string; role: 'user' | 'assistant'; content: string; timestamp: number; }

function useWebChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [thinking, setThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const user: Msg = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    setMessages((p) => [...p, user]);
    setStreaming(true); setThinking(true);
    abortRef.current?.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pet-token': localStorage.getItem('pet-api-token') || '',
        },
        body: JSON.stringify({ messages: [...messages, user].map((m) => ({ role: m.role, content: m.content })) }),
        signal: ctrl.signal,
      });
      const reader = res.body?.getReader(); if (!reader) throw new Error('');
      const dec = new TextDecoder(); let content = ''; const aid = crypto.randomUUID();
      setMessages((p) => [...p, { id: aid, role: 'assistant', content: '', timestamp: Date.now() }]);
      setThinking(false);
      while (true) { const { done, value } = await reader.read(); if (done) break; content += dec.decode(value, { stream: true }); setMessages((p) => p.map((m) => m.id === aid ? { ...m, content } : m)); }
    } catch { setMessages((p) => [...p, { id: crypto.randomUUID(), role: 'assistant', content: '连接失败', timestamp: Date.now() }]); }
    finally { setStreaming(false); setThinking(false); }
  }, [messages, streaming]);
  return { messages, streaming, thinking, send };
}

// ── 组件 ──
export default function FloatingPet() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [idle, setIdle] = useState(false);
  const idleT = useRef<ReturnType<typeof setInterval>>();
  const lastAct = useRef(Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, streaming, thinking, send } = useWebChat();

  // idle 缩小
  useEffect(() => {
    if (open) { setIdle(false); return; }
    idleT.current = setInterval(() => { if (Date.now() - lastAct.current > 15000) setIdle(true); }, 2000);
    return () => clearInterval(idleT.current);
  }, [open]);

  const wake = () => { lastAct.current = Date.now(); setIdle(false); };

  // 发送
  const doSend = useCallback(() => {
    if (!input.trim() || streaming) return;
    send(input.trim()); setInput('');
  }, [input, streaming, send]);

  // 流式
  const [talking, setTalking] = useState(false);
  useEffect(() => { if (streaming) setTalking(true); else setTalking(false); }, [streaming]);

  // 滚动
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streaming]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const emo = talking ? '😸' : thinking ? '🤔' : '🐱';
  const fmt = (ts: number) => { const d = new Date(ts); return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`; };

  const content = (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {!open ? (
        <button
          onClick={() => { wake(); setOpen(true); }}
          onMouseEnter={wake}
          style={{
            width: idle ? 36 : 56, height: idle ? 36 : 56, borderRadius: '50%',
            border: 'none', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
            fontSize: idle ? 24 : 36, cursor: 'pointer',
            opacity: idle ? 0.5 : 1, transition: 'all 0.4s ease',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, padding: 0,
          }}
          title="点击召唤芝士"
        >
          {emo}
        </button>
      ) : (
        <div style={{
          width: 380, height: 520, display: 'flex', flexDirection: 'column',
          background: 'rgba(24,24,28,0.95)', backdropFilter: 'blur(20px)',
          borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)', overflow: 'hidden',
        }}>
          {/* 标题 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>🐱 芝士</span>
            <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>✕</button>
          </div>
          {/* 消息 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🐱</div>
                  <div>有什么可以帮你的？</div>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', color: '#fff', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #8b7cf0, #6c5ce7)' : 'rgba(255,255,255,0.08)',
                }}>{m.content}</div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{fmt(m.timestamp)}</span>
              </div>
            ))}
            {thinking && !streaming && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, padding: '8px 14px' }}>💭 思考中...</div>}
            <div ref={bottomRef} />
          </div>
          {/* 输入 */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } }}
              placeholder="说点什么..." disabled={streaming}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px', color: '#fff', fontSize: 13, outline: 'none' }} />
            <button onClick={doSend} disabled={!input.trim() || streaming}
              style={{ border: 'none', background: input.trim() ? '#8b7cf0' : 'rgba(255,255,255,0.06)', color: '#fff', borderRadius: 12, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>发送</button>
          </div>
        </div>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
