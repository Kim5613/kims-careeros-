'use client';

import React, { useState } from 'react';
import {
  Card, Button, Modal, Form, Input, Select, Tag, Typography,
  Space, message, Empty, Badge, Tooltip, Popconfirm, Row, Col, Divider,
} from 'antd';
import {
  PlusOutlined, FileTextOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, StarOutlined, StarFilled, CopyOutlined, UploadOutlined,
} from '@ant-design/icons';
import FileUpload from '@/components/FileUpload';
import AttachmentList from '@/components/AttachmentList';
import { useApiList } from '@/lib/hooks/useApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ── Types ──
interface ResumeItem {
  id: string;
  title: string;
  content: string;
  targetPosition: string | null;
  targetCompany: string | null;
  version: number;
  isDefault: boolean;
  createdAt: string;
}

// ── Mock Data ──
const MOCK_RESUMES: ResumeItem[] = [
  {
    id: 'resume-1', title: '高级前端工程师简历',
    content: '## 个人信息\n姓名：张明\n工作年限：8年\n\n## 工作经历\n### 某科技有限公司（2022-至今）\n- 负责核心业务前端架构设计\n- 推动微前端架构落地\n- 主导前端性能优化，首屏加载提升40%\n\n### 某互联网公司（2019-2022）\n- 参与中后台系统搭建\n- 技术选型与团队规范制定',
    targetPosition: '高级前端工程师', targetCompany: '字节跳动', version: 3, isDefault: true,
    createdAt: '2026-05-15T08:00:00.000Z',
  },
  {
    id: 'resume-2', title: '全栈工程师简历',
    content: '## 个人信息\n姓名：张明\n工作年限：8年\n\n## 技术栈\n- 前端：React, Vue, Next.js, TypeScript\n- 后端：Node.js, Go, PostgreSQL\n- 云原生：Docker, Kubernetes\n\n## 项目经历\n### 全栈开发平台\n- 独立设计并实现企业级SaaS产品\n- 前后端分离架构，支持多租户',
    targetPosition: '全栈开发工程师', targetCompany: '腾讯', version: 2, isDefault: false,
    createdAt: '2026-05-20T10:30:00.000Z',
  },
  {
    id: 'resume-3', title: '技术负责人简历',
    content: '## 个人信息\n姓名：张明\n工作年限：8年\n\n## 管理经验\n- 带领10人前端团队完成多个核心项目\n- 制定技术路线图和OKR\n- 建立前端技术评审机制\n\n## 核心成果\n- 推动前端工程化体系建设\n- 实现团队人效提升30%',
    targetPosition: '前端技术负责人', targetCompany: '阿里巴巴', version: 1, isDefault: false,
    createdAt: '2026-06-01T14:00:00.000Z',
  },
];

// ── Page ──
export default function IdentityPage() {
  const { data: resumes, loading: resumeLoading, create: resumeCreate, update: resumeUpdate, remove: resumeRemove } = useApiList<ResumeItem>({ endpoint: '/api/resumes', mockData: MOCK_RESUMES });
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeModalLoading, setResumeModalLoading] = useState(false);
  const [editingResume, setEditingResume] = useState<ResumeItem | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeItem | null>(null);
  const [resumeForm] = Form.useForm();
  const [uploadAreaVisible, setUploadAreaVisible] = useState(false);

  const openCreateResume = () => {
    setEditingResume(null); setUploadAreaVisible(false);
    resumeForm.resetFields(); resumeForm.setFieldsValue({ version: 1, isDefault: false });
    setResumeModalOpen(true);
  };
  const openEditResume = (item: ResumeItem) => {
    setEditingResume(item); setUploadAreaVisible(false);
    resumeForm.setFieldsValue({ title: item.title, content: item.content, targetPosition: item.targetPosition ?? undefined, targetCompany: item.targetCompany ?? undefined, version: item.version, isDefault: item.isDefault });
    setResumeModalOpen(true);
  };
  const handleResumeSave = async () => {
    try {
      const values = await resumeForm.validateFields(); setResumeModalLoading(true);
      const payload = { title: values.title, content: values.content, targetPosition: values.targetPosition ?? null, targetCompany: values.targetCompany ?? null, version: values.version ?? 1, isDefault: values.isDefault ?? false };
      if (editingResume) { await resumeUpdate(editingResume.id, payload); message.success('简历已更新'); }
      else { await resumeCreate(payload); message.success('简历已创建'); }
      setResumeModalOpen(false);
    } catch { /* validation */ }
    finally { setResumeModalLoading(false); }
  };
  const handleDeleteResume = (item: ResumeItem) => { resumeRemove(item.id); message.success('简历已删除'); };
  const handleToggleDefault = (item: ResumeItem) => { resumeUpdate(item.id, { isDefault: !item.isDefault } as any); message.success(item.isDefault ? '已取消默认' : '已设为默认简历'); };
  const handleCopyResume = (item: ResumeItem) => { resumeCreate({ title: `${item.title}（副本）`, content: item.content, targetPosition: item.targetPosition, targetCompany: item.targetCompany, version: 1, isDefault: false }); message.success('已复制简历'); };
  const handleResumeParsed = (attachment: any) => { if (attachment.parsedText) { resumeForm.setFieldsValue({ content: attachment.parsedText }); message.success('文档内容已填充到编辑器，请检查并调整'); } };

  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>身份铭牌 · 我的简历</Title>
        <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
          管理简历版本，为每一次求职做好准备
        </Paragraph>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text type="secondary">共 {resumes.length} 份简历</Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateResume} style={{ borderRadius: 8 }}>新增简历</Button>
        </div>

        {resumes.length === 0 ? (
          <Card style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', textAlign: 'center', padding: 40 }}>
            <Empty description="暂无简历，点击「新增简历」开始创建" />
          </Card>
        ) : (
          <Row gutter={[14, 14]}>
            {resumes.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.id}>
                <Card hoverable style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', height: '100%' }}
                  styles={{ body: { padding: '20px 20px 16px' } }}
                  actions={[
                    <Tooltip title="编辑" key="edit"><EditOutlined onClick={() => openEditResume(item)} /></Tooltip>,
                    <Tooltip title="预览" key="preview"><EyeOutlined onClick={() => setPreviewResume(item)} /></Tooltip>,
                    <Tooltip title="复制" key="copy"><CopyOutlined onClick={() => handleCopyResume(item)} /></Tooltip>,
                    <Tooltip title={item.isDefault ? '取消默认' : '设为默认'} key="star">
                      <span onClick={() => handleToggleDefault(item)}>{item.isDefault ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}</span>
                    </Tooltip>,
                    <Popconfirm key="delete" title="确认删除此简历？" onConfirm={() => handleDeleteResume(item)} okText="删除" cancelText="取消" okButtonProps={{ danger: true }}>
                      <Tooltip title="删除"><DeleteOutlined style={{ color: '#ff4d4f' }} /></Tooltip>
                    </Popconfirm>,
                  ]}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FileTextOutlined style={{ fontSize: 20, color: '#8b7cf0' }} />
                      <Title level={5} style={{ margin: 0, flex: 1 }}>{item.title}</Title>
                      {item.isDefault && <Badge count="默认" style={{ backgroundColor: '#faad14', color: '#fff', fontSize: 11 }} />}
                    </div>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      {item.targetPosition && <Text type="secondary" style={{ fontSize: 13 }}>目标岗位：<Text strong style={{ fontSize: 13 }}>{item.targetPosition}</Text></Text>}
                      {item.targetCompany && <Text type="secondary" style={{ fontSize: 13 }}>目标公司：<Text strong style={{ fontSize: 13 }}>{item.targetCompany}</Text></Text>}
                    </Space>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color="blue" style={{ borderRadius: 8 }}>V{item.version}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal title={<Space>{editingResume ? <EditOutlined /> : <PlusOutlined />}<span>{editingResume ? '编辑简历' : '新增简历'}</span></Space>}
        open={resumeModalOpen} onOk={handleResumeSave} onCancel={() => setResumeModalOpen(false)}
        confirmLoading={resumeModalLoading} okText={editingResume ? '保存修改' : '创建'} cancelText="取消" width={640} destroyOnClose>
        <Form form={resumeForm} layout="vertical" initialValues={{ version: 1, isDefault: false }} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="简历标题" rules={[{ required: true, message: '请输入简历标题' }]}>
            <Input placeholder="如：高级前端工程师简历" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="targetPosition" label="目标岗位"><Input placeholder="如：高级前端工程师" style={{ borderRadius: 8 }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="targetCompany" label="目标公司"><Input placeholder="如：字节跳动" style={{ borderRadius: 8 }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="version" label="版本号"><Input type="number" min={1} placeholder="1" style={{ borderRadius: 8 }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="isDefault" label="设为默认"><Select options={[{ label: '是', value: true }, { label: '否', value: false }]} style={{ borderRadius: 8 }} /></Form.Item></Col>
          </Row>
          <Form.Item name="content" label="简历内容" rules={[{ required: true, message: '请输入简历内容' }]}>
            <TextArea rows={10} placeholder="粘贴或输入简历内容（支持 Markdown 格式）" maxLength={10000} showCount style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
        {editingResume && (<>
          <Divider orientation="left" style={{ margin: '16px 0 12px' }}>简历文件</Divider>
          <div style={{ marginBottom: 12 }}><Button icon={<UploadOutlined />} onClick={() => setUploadAreaVisible((v) => !v)} size="small">{uploadAreaVisible ? '收起上传' : '上传简历文件'}</Button></div>
          {uploadAreaVisible && <FileUpload entityType="resume" entityId={editingResume.id} onSuccess={() => { message.success('文件上传成功，请点击"解析文档"提取内容'); }} accept=".pdf,.jpg,.jpeg,.png,.md" />}
          <AttachmentList entityType="resume" entityId={editingResume.id} onParsed={handleResumeParsed} />
        </>)}
      </Modal>

      {/* Preview Modal */}
      <Modal title={<Space><EyeOutlined /><span>简历预览 - {previewResume?.title}</span></Space>}
        open={!!previewResume} onCancel={() => setPreviewResume(null)} footer={<Button onClick={() => setPreviewResume(null)}>关闭</Button>} width={680}>
        {previewResume && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue" style={{ borderRadius: 8 }}>V{previewResume.version}</Tag>
                {previewResume.targetPosition && <Tag color="cyan" style={{ borderRadius: 8 }}>{previewResume.targetPosition}</Tag>}
                {previewResume.targetCompany && <Tag color="purple" style={{ borderRadius: 8 }}>{previewResume.targetCompany}</Tag>}
                {previewResume.isDefault && <Badge count="默认" style={{ backgroundColor: '#faad14' }} />}
              </Space>
            </div>
            <Divider />
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.8, color: '#333', background: '#fafafa', padding: 16, borderRadius: 8 }}>
              {previewResume.content}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
