'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, Typography, Input, Button, Tag, Radio, message, Divider, Upload, Alert } from 'antd';
import {
  ExperimentOutlined, ThunderboltOutlined, LoadingOutlined, FileTextOutlined,
  InboxOutlined, EditOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const FOCUS_OPTIONS = [
  { key: 'stability', label: '稳定性' },
  { key: 'growth', label: '成长空间' },
  { key: 'wlb', label: '工作生活平衡' },
  { key: 'salary', label: '薪酬待遇' },
  { key: 'culture', label: '团队文化' },
  { key: 'manager', label: '老板靠不靠谱' },
  { key: 'risk', label: '裁员/暴雷风险' },
  { key: 'remote', label: '远程/弹性办公' },
];

export default function DiagnosisPage() {
  const [company, setCompany] = useState('');
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [focus, setFocus] = useState<string[]>(['stability', 'growth', 'wlb']);
  const [depth, setDepth] = useState<'standard' | 'deep'>('standard');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  // 简历上传状态
  const [resumeFile, setResumeFile] = useState<{ name: string; chars: number } | null>(null);
  const [parsing, setParsing] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (generating && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generating]);

  // 文件上传 + 解析
  const handleResumeUpload = async (file: File): Promise<boolean> => {
    setParsing(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse/resume', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '解析失败');
      setResume(data.text);
      setResumeFile({ name: data.filename, chars: data.charCount });
      setShowPaste(false);
      message.success(`${data.filename} 解析完成，${data.charCount} 字`);
    } catch (e: any) {
      message.error(e.message || '解析失败');
      return false;
    } finally {
      setParsing(false);
    }
    return false; // prevent default upload
  };

  const canGenerate = company.trim() && jd.trim() && resume.trim() && !generating;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setError('');
    setReport('');

    const reqBody = {
      company: company.trim(),
      jd: jd.trim(),
      resume: resume.trim(),
      focus: focus.join('、'),
      depth,
    };

    try {
      const res = await fetch('/api/ai/job-diagnosis/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('0:')) {
            const text = line.slice(2).trim().replace(/^"|"$/g, '');
            setReport(prev => prev + text);
          }
        }
      }
    } catch (e: any) {
      setError(e.message || '生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const focusLabel = (k: string) => FOCUS_OPTIONS.find(o => o.key === k)?.label || k;

  return (
    <div style={{ padding: '24px 32px 12px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 600, letterSpacing: 1 }}>
            <ExperimentOutlined style={{ marginRight: 10, color: '#8b7cf0' }} />岗位诊断
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            JD + 简历 + 公司名 → AI 联网调研 → 红黄绿灯诊断报告
          </Text>
        </div>
        <Tag color="purple" style={{ borderRadius: 10 }}>DeepSeek 驱动 · 联网调研</Tag>
      </div>

      {/* 隐私提醒 */}
      <Alert
        message={'⚠️ 隐私提醒：本次分析走云端模型（DeepSeek），内容会发送到云端且不可撤回。建议简历脱敏：姓名→「X先生/女士」，删除手机/邮箱，现公司名→「现雇主A」。'}
        type="warning"
        showIcon
        style={{ borderRadius: 14, marginBottom: 20, maxWidth: 800, margin: '0 auto 20px' }}
      />

      {/* Form Cards */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* 1: 目标公司 */}
        <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 14 }}
          bodyStyle={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🏢</span>
            <Title level={5} style={{ margin: 0 }}>目标公司</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>必填 · 简称自动补全</Text>
          </div>
          <Input value={company} onChange={e => setCompany(e.target.value)}
            placeholder="公司名，简称或全称都行，如：字节、阿里巴巴、小红书……"
            style={{ borderRadius: 14, fontSize: 14 }} size="large" />
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
            集团名请注明具体 BU（如 阿里云 而非 阿里巴巴），不同 BU 现金流和稳定性可能完全不同
          </Text>
        </Card>

        {/* 2: 岗位 JD */}
        <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 14 }}
          bodyStyle={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <Title level={5} style={{ margin: 0 }}>岗位 JD</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>必填 · 直接粘贴文本</Text>
          </div>
          <TextArea value={jd} onChange={e => setJd(e.target.value)}
            placeholder={`直接粘贴 JD 全文，AI 会自动拆解四类要求：

[硬性-门槛] 学历、年限、技能……
[硬性-加分] "有 XX 经验优先"
[软性-特质] 性格、风格、价值观
[软性-场景] 工作模式、环境要求`}
            autoSize={{ minRows: 4, maxRows: 10 }} style={{ borderRadius: 14, fontSize: 14 }} />
        </Card>

        {/* 3: 简历 — 文件上传 */}
        <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 14 }}
          bodyStyle={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📄</span>
              <Title level={5} style={{ margin: 0 }}>我的简历</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>必填 · 上传文件自动解析</Text>
            </div>
            <Button type="link" size="small" icon={<EditOutlined />}
              onClick={() => setShowPaste(!showPaste)}
              style={{ color: '#bbb', fontSize: 12 }}>
              {showPaste ? '上传文件' : '或直接粘贴文本'}
            </Button>
          </div>

          {!showPaste ? (
            <>
              <Dragger
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.md,.txt"
                showUploadList={false}
                disabled={parsing}
                beforeUpload={handleResumeUpload as any}
                style={{ borderRadius: 14 }}>
                <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                  {parsing ? <LoadingOutlined style={{ fontSize: 32, color: '#8b7cf0' }} /> : <InboxOutlined />}
                </p>
                <p className="ant-upload-text" style={{ fontSize: 14 }}>
                  {parsing ? '正在解析文件……' : '点击或拖拽简历文件到此处上传'}
                </p>
                <p className="ant-upload-hint" style={{ fontSize: 12 }}>
                  支持 PDF、Word(.docx/.doc)、图片(.jpg/.png)、Markdown(.md)、纯文本(.txt)，不超过 20MB
                </p>
              </Dragger>

              {resumeFile && (
                <div style={{
                  marginTop: 10, padding: '8px 14px', background: '#f6ffed', borderRadius: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid #b7eb8f',
                }}>
                  <Text style={{ fontSize: 13 }}>
                    <FileTextOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                    {resumeFile.name} · {resumeFile.chars} 字已识别
                  </Text>
                  <Button type="link" size="small" onClick={() => setShowPaste(true)} style={{ fontSize: 12 }}>
                    查看/编辑文本
                  </Button>
                </div>
              )}
            </>
          ) : (
            <TextArea value={resume} onChange={e => setResume(e.target.value)}
              placeholder={`粘贴你的简历文本（建议脱敏后再贴）：

姓名 → "X先生/女士"
手机/邮箱 → 删除或替换
现公司名 → "现雇主A"

AI 会提取：核心技能 / 项目成果 / 平均任期 / 学历
用于和 JD 做五维匹配（M1技能 M2年限 M3文化 M4经历 M5成长）`}
              autoSize={{ minRows: 5, maxRows: 12 }} style={{ borderRadius: 14, fontSize: 14 }} />
          )}
        </Card>

        {/* 4 & 5: 关注重点 + 深度 */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flex: 1 }}
            bodyStyle={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🎯</span>
              <Title level={5} style={{ margin: 0 }}>关注重点</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>可多选</Text>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {FOCUS_OPTIONS.map(o => (
                <Tag.CheckableTag key={o.key} checked={focus.includes(o.key)}
                  onChange={checked => { checked ? setFocus([...focus, o.key]) : setFocus(focus.filter(k => k !== o.key)); }}
                  style={{ borderRadius: 12, padding: '4px 14px', fontSize: 13, border: '1px solid #e8e8e8' }}>
                  {o.label}
                </Tag.CheckableTag>
              ))}
            </div>
          </Card>

          <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flex: '0 0 200px' }}
            bodyStyle={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>📐</span>
              <Title level={5} style={{ margin: 0 }}>深度</Title>
            </div>
            <Radio.Group value={depth} onChange={e => setDepth(e.target.value)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Radio value="standard">
                  <Text style={{ fontSize: 13 }}>标准版</Text><br />
                  <Text type="secondary" style={{ fontSize: 11 }}>8-12 次搜索</Text>
                </Radio>
                <Radio value="deep">
                  <Text style={{ fontSize: 13 }}>深度版</Text><br />
                  <Text type="secondary" style={{ fontSize: 11 }}>15-35 次搜索 · 交叉验证</Text>
                </Radio>
              </div>
            </Radio.Group>
          </Card>
        </div>

        {/* Generate Button */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Button type="primary" size="large"
            icon={generating ? <LoadingOutlined /> : <ThunderboltOutlined />}
            onClick={handleGenerate} disabled={!canGenerate} loading={generating}
            style={{ borderRadius: 20, height: 52, paddingInline: 48, fontSize: 16, background: canGenerate ? '#8b7cf0' : undefined, borderColor: canGenerate ? '#8b7cf0' : undefined }}>
            {generating ? 'AI 正在联网调研并生成报告...' : '一键生成诊断报告'}
          </Button>
          {!canGenerate && (
            <div style={{ marginTop: 6 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {!company.trim() ? '请填写公司名' : !jd.trim() ? '请粘贴岗位 JD' : !resume.trim() ? '请上传简历或粘贴文本' : ''}
              </Text>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <Card style={{ borderRadius: 20, border: '1px solid #ffccc7', background: '#fff2f0', marginBottom: 20 }}
            bodyStyle={{ padding: '16px 24px' }}>
            <Text type="danger">❌ {error}</Text>
          </Card>
        )}

        {/* Report Output */}
        {(report || generating) && (
          <div ref={reportRef}>
            <Divider style={{ margin: '8px 0 20px' }}>
              <Text type="secondary" style={{ fontSize: 13 }}><FileTextOutlined /> 诊断报告</Text>
            </Divider>
            <Card style={{ borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', background: '#fff' }}
              bodyStyle={{ padding: '28px 32px' }}>
              {report ? (
                <ReactMarkdown components={{
                  h1: ({ children }) => <Title level={3} style={{ margin: '16px 0 10px' }}>{children}</Title>,
                  h2: ({ children }) => <Title level={4} style={{ margin: '14px 0 8px', fontWeight: 600 }}>{children}</Title>,
                  h3: ({ children }) => <Title level={5} style={{ margin: '12px 0 6px' }}>{children}</Title>,
                  p: ({ children }) => <Text style={{ fontSize: 14, lineHeight: 1.9, display: 'block', marginBottom: 8 }}>{children}</Text>,
                  li: ({ children }) => <li style={{ fontSize: 14, lineHeight: 1.9, marginBottom: 4 }}>{children}</li>,
                  ul: ({ children }) => <ul style={{ paddingLeft: 20, marginBottom: 10 }}>{children}</ul>,
                  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #8b7cf0', paddingLeft: 14, margin: '10px 0', color: '#666' }}>{children}</blockquote>,
                  code: ({ children }) => <code style={{ background: '#f5f3f0', padding: '2px 6px', borderRadius: 6, fontSize: 13 }}>{children}</code>,
                  table: ({ children }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>{children}</table>,
                  th: ({ children }) => <th style={{ border: '1px solid #e8e8e8', padding: '8px 12px', background: '#faf8f6', textAlign: 'left', fontSize: 13 }}>{children}</th>,
                  td: ({ children }) => <td style={{ border: '1px solid #e8e8e8', padding: '8px 12px', fontSize: 13 }}>{children}</td>,
                  hr: () => <Divider style={{ margin: '16px 0' }} />,
                }}>{report}</ReactMarkdown>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <LoadingOutlined style={{ fontSize: 32, color: '#8b7cf0', marginBottom: 16 }} />
                  <br /><Text type="secondary">AI 正在联网调研并生成报告……</Text>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
