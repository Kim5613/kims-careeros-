'use client';

import React, { useState, useEffect } from 'react';
import {
  List,
  Button,
  Modal,
  message,
  Popconfirm,
  Tag,
  Space,
  Spin,
  Typography,
} from 'antd';
import {
  FilePdfOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { Paragraph } = Typography;

interface Attachment {
  id: string;
  filename: string;
  storedPath: string;
  mimeType: string;
  size: number;
  entityType: string;
  parsedText?: string | null;
  createdAt: string;
}

interface AttachmentListProps {
  entityType: 'resume' | 'candidate';
  entityId: string;
  onDeleted?: () => void;
  onParsed?: (attachment: Attachment) => void;
}

// 文件图标映射
function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') return <FilePdfOutlined style={{ color: '#e74c3c', fontSize: 20 }} />;
  if (mimeType.startsWith('image/')) return <FileImageOutlined style={{ color: '#3498db', fontSize: 20 }} />;
  if (mimeType === 'text/markdown') return <FileMarkdownOutlined style={{ color: '#2ecc71', fontSize: 20 }} />;
  return <FileTextOutlined style={{ fontSize: 20 }} />;
}

// 文件大小格式化
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// MIME 类型标签
function getTypeLabel(mimeType: string): string {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'text/markdown': 'Markdown',
    'text/plain': '文本',
  };
  return map[mimeType] || '文件';
}

export default function AttachmentList({
  entityType,
  entityId,
  onDeleted,
  onParsed,
}: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [parsingId, setParsingId] = useState<string | null>(null);

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attachments?entityType=${entityType}&entityId=${entityId}`
      );
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch (err) {
      console.error('获取附件列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) {
      fetchAttachments();
    }
  }, [entityId]);

  // 解析文档
  const handleParse = async (attachment: Attachment) => {
    setParsingId(attachment.id);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId: attachment.id }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || '解析失败');
      }

      const result = await res.json();
      message.success('文档解析完成');

      // 刷新列表
      fetchAttachments();

      onParsed?.({ ...attachment, parsedText: result.parsedText });
    } catch (err: any) {
      message.error(`解析失败: ${err.message}`);
    } finally {
      setParsingId(null);
    }
  };

  // 预览解析文本
  const handlePreview = (attachment: Attachment) => {
    setPreviewTitle(attachment.filename);
    setPreviewText(attachment.parsedText || '尚未解析');
    setPreviewVisible(true);
  };

  // 删除附件
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error('删除失败');
      }

      message.success('附件已删除');
      fetchAttachments();
      onDeleted?.();
    } catch (err: any) {
      message.error(`删除失败: ${err.message}`);
    }
  };

  // 下载文件
  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = `/api/files/${attachment.storedPath}`;
    link.download = attachment.filename;
    link.click();
  };

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : attachments.length === 0 ? (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 16 }}>
          暂无附件
        </Text>
      ) : (
        <List
          dataSource={attachments}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="download"
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(item)}
                  size="small"
                />,
                item.parsedText ? (
                  <Button
                    key="preview"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(item)}
                    size="small"
                  />
                ) : (
                  <Button
                    key="parse"
                    type="text"
                    loading={parsingId === item.id}
                    onClick={() => handleParse(item)}
                    size="small"
                  >
                    解析
                  </Button>
                ),
                <Popconfirm
                  key="delete"
                  title="确定删除此附件？"
                  onConfirm={() => handleDelete(item.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={getFileIcon(item.mimeType)}
                title={
                  <Space>
                    <span>{item.filename}</span>
                    <Tag>{getTypeLabel(item.mimeType)}</Tag>
                    {item.parsedText && <Tag color="green">已解析</Tag>}
                  </Space>
                }
                description={`${formatFileSize(item.size)} · ${new Date(item.createdAt).toLocaleDateString('zh-CN')}`}
              />
            </List.Item>
          )}
        />
      )}

      <Modal
        title={`文档内容 - ${previewTitle}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={720}
      >
        <Paragraph
          style={{
            maxHeight: 500,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: 13,
          }}
        >
          {previewText}
        </Paragraph>
      </Modal>
    </div>
  );
}
