'use client';

import React, { useState } from 'react';
import { Upload, message, Progress } from 'antd';
import {
  InboxOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
} from '@ant-design/icons';

const { Dragger } = Upload;

interface FileUploadProps {
  entityType: 'resume' | 'candidate';
  entityId: string;
  onSuccess?: (attachment: any) => void;
  accept?: string;
  maxCount?: number;
}

export default function FileUpload({
  entityType,
  entityId,
  onSuccess,
  accept = '.pdf,.jpg,.jpeg,.png,.md,.txt',
  maxCount = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept,
    maxCount,
    showUploadList: false,
    beforeUpload: (file: File) => {
      // 验证文件大小
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        message.error('文件大小不能超过 20MB');
        return Upload.LIST_IGNORE;
      }

      // 验证文件类型
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'md', 'txt'];
      if (!ext || !allowedExts.includes(ext)) {
        message.error('仅支持 PDF、JPG、PNG、Markdown 格式');
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    customRequest: async (options: any) => {
      const { file, onSuccess: onUploadSuccess, onError } = options;
      setUploading(true);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);

        setProgress(30);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        setProgress(70);

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || '上传失败');
        }

        const attachment = await response.json();
        setProgress(100);

        message.success(`${file.name} 上传成功`);
        onUploadSuccess?.(attachment);
        onSuccess?.(attachment);
      } catch (err: any) {
        message.error(`上传失败: ${err.message}`);
        onError?.(err);
      } finally {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
      }
    },
  };

  return (
    <div>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p className="ant-upload-hint">
          支持 PDF、JPG、PNG、Markdown 格式，单文件不超过 20MB
        </p>
      </Dragger>
      {uploading && (
        <Progress
          percent={progress}
          status="active"
          style={{ marginTop: 12 }}
        />
      )}
    </div>
  );
}
