'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Space, message, Spin } from 'antd';

const { TextArea } = Input;

interface ResumeParseModalProps {
  open: boolean;
  attachmentId: string | null;
  onConfirm: (parsedText: string) => Promise<void>;
  onCancel: () => void;
}

export default function ResumeParseModal({
  open,
  attachmentId,
  onConfirm,
  onCancel,
}: ResumeParseModalProps) {
  const [parsedText, setParsedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (open && attachmentId) {
      setLoading(true);
      setParsedText('');
      fetch('/api/parse/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.parsedText) {
            setParsedText(data.parsedText);
          } else if (data.error) {
            message.error(data.error);
          }
        })
        .catch(() => message.error('解析失败'))
        .finally(() => setLoading(false));
    }
  }, [open, attachmentId]);

  const handleConfirm = async () => {
    if (!parsedText.trim()) {
      message.warning('解析内容为空，请检查文件');
      return;
    }
    setConfirming(true);
    try {
      await onConfirm(parsedText);
      message.success('简历内容已入库');
      onCancel();
    } catch {
      message.error('保存失败');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal
      title="确认简历内容"
      open={open}
      onCancel={onCancel}
      width={720}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" loading={confirming} onClick={handleConfirm}>
            确认入库
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin tip="正在解析文件..." />
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
            请核对并编辑解析结果，确认无误后点击"确认入库"
          </div>
          <TextArea
            value={parsedText}
            onChange={(e) => setParsedText(e.target.value)}
            rows={16}
            style={{ fontFamily: 'monospace', fontSize: 13 }}
            placeholder="解析内容为空"
          />
        </div>
      )}
    </Modal>
  );
}
