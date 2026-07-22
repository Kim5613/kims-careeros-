/**
 * Kim's AI Desktop Pet — 芝士
 *
 * 收起态：右下角 120×120，双击展开，随意拖动
 * 展开态：420×620，宠物头 + 聊天面板
 */

import React, { useState, useCallback, useEffect } from 'react';
import Pet from './components/Pet';
import ChatPanel from './components/ChatPanel';
import { useChat } from './hooks/useChat';
import { useNotifications } from './hooks/useNotifications';
import { useAntiBlocking } from './hooks/useAntiBlocking';
import type { PetState } from './components/Pet';

const SPRITE_URL = undefined; // emoji 占位

export default function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [petState, setPetState] = useState<PetState>('idle');
  const [notification, setNotification] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const { messages, isStreaming, isThinking, sendMessage } = useChat();
  const { current: proactiveNote, dismiss: dismissNote } = useNotifications();
  const { opacity, scale, recordInteraction, petHandlers } = useAntiBlocking(isExpanded, isStreaming);

  const displayNotification = proactiveNote?.message || notification;

  // ── 窗口尺寸 ──
  const resizeWindow = useCallback(async (expanded: boolean) => {
    try {
      const { getCurrentWindow, PhysicalSize } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      if (expanded) {
        await win.setSize(new PhysicalSize(420, 620));
      } else {
        await win.setSize(new PhysicalSize(120, 120));
      }
    } catch {}
  }, []);

  const toggleExpand = useCallback(() => {
    const next = !isExpanded;
    setIsExpanded(next);
    resizeWindow(next);
    if (!next) setPetState('idle');
  }, [isExpanded, resizeWindow]);

  // ── 发送消息 ──
  const handleSend = useCallback(async (text: string) => {
    setPetState('thinking');
    await sendMessage(text);
    setPetState('idle');
  }, [sendMessage]);

  // ── 语音 ──
  const handleVoiceToggle = useCallback(() => {
    if (isListening) { setIsListening(false); setPetState('idle'); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setNotification('浏览器不支持语音'); setTimeout(() => setNotification(null), 3000); return; }
    const r = new SR();
    r.lang = 'zh-CN'; r.interimResults = false;
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; if (t) { setPetState('listening'); handleSend(t); } };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
    setIsListening(true); setPetState('listening');
  }, [isListening, handleSend]);

  useEffect(() => {
    if (isStreaming && (petState === 'idle' || petState === 'thinking')) setPetState('talking');
    if (!isStreaming && (petState === 'talking' || petState === 'thinking')) setPetState('idle');
  }, [isStreaming, petState]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      {!isExpanded ? (
        // ===== 收起态：拖动 + 双击展开 =====
        <div
          data-tauri-drag-region
          onDoubleClick={toggleExpand}
          style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            transform: `scale(${scale})`, opacity,
            transition: 'transform 0.5s ease, opacity 0.5s ease',
            transformOrigin: 'center center',
          }}
          {...petHandlers}
        >
          <Pet
            state={petState}
            onClick={() => {}}
            notification={displayNotification}
            onNotificationDismiss={() => { setNotification(null); dismissNote(); }}
            spriteUrl={SPRITE_URL}
          />
        </div>
      ) : (
        // ===== 展开态 =====
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px', background: 'transparent' }}>
          <div data-tauri-drag-region onDoubleClick={toggleExpand} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Pet state={petState} onClick={() => {}} notification={displayNotification} onNotificationDismiss={() => { setNotification(null); dismissNote(); }} spriteUrl={SPRITE_URL} />
          </div>
          <div onClick={recordInteraction} onKeyDown={recordInteraction} style={{ flex: 1, overflow: 'hidden' }}>
            <ChatPanel messages={messages} isStreaming={isStreaming} isThinking={isThinking} onSend={handleSend} onClose={toggleExpand} isListening={isListening} onVoiceToggle={handleVoiceToggle} />
          </div>
        </div>
      )}
    </div>
  );
}
