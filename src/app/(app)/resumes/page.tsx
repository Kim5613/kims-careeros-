'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Tabs,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  message,
  Empty,
  Badge,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  CopyOutlined,
  PhoneOutlined,
  SmileOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import FileUpload from '@/components/FileUpload';
import AttachmentList from '@/components/AttachmentList';
import { useApiList } from '@/lib/hooks/useApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

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

interface CoverLetterItem {
  id: string;
  title: string;
  content: string;
  targetCompany: string | null;
  targetPosition: string | null;
  createdAt: string;
}

interface SelfIntroductionItem {
  id: string;
  title: string;
  content: string;
  scenario: string; // 面试/电话/社交场合
  duration: string | null; // 30秒/1分钟/3分钟
  tags: string[];
  createdAt: string;
}

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const SCENARIO_OPTIONS = [
  { label: '面试', value: '面试' },
  { label: '电话', value: '电话' },
  { label: '社交场合', value: '社交场合' },
];

const DURATION_OPTIONS = [
  { label: '30秒', value: '30秒' },
  { label: '1分钟', value: '1分钟' },
  { label: '3分钟', value: '3分钟' },
];

const SCENARIO_COLOR_MAP: Record<string, string> = {
  '面试': 'blue',
  '电话': 'green',
  '社交场合': 'purple',
};

const SCENARIO_ICON_MAP: Record<string, React.ReactNode> = {
  '面试': <VideoCameraOutlined />,
  '电话': <PhoneOutlined />,
  '社交场合': <SmileOutlined />,
};

const DURATION_COLOR_MAP: Record<string, string> = {
  '30秒': 'cyan',
  '1分钟': 'orange',
  '3分钟': 'magenta',
};

// ────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────

const MOCK_RESUMES: ResumeItem[] = [
  {
    id: 'resume-1',
    title: '高级前端工程师简历',
    content: '## 个人信息\n姓名：张明\n工作年限：8年\n\n## 工作经历\n### 某科技有限公司（2022-至今）\n- 负责核心业务前端架构设计\n- 推动微前端架构落地\n- 主导前端性能优化，首屏加载提升40%\n\n### 某互联网公司（2019-2022）\n- 参与中后台系统搭建\n- 技术选型与团队规范制定',
    targetPosition: '高级前端工程师',
    targetCompany: '字节跳动',
    version: 3,
    isDefault: true,
    createdAt: '2026-05-15T08:00:00.000Z',
  },
  {
    id: 'resume-2',
    title: '全栈工程师简历',
    content: '## 个人信息\n姓名：张明\n工作年限：8年\n\n## 技术栈\n- 前端：React, Vue, Next.js, TypeScript\n- 后端：Node.js, Go, PostgreSQL\n- 云原生：Docker, Kubernetes\n\n## 项目经历\n### 全栈开发平台\n- 独立设计并实现企业级SaaS产品\n- 前后端分离架构，支持多租户',
    targetPosition: '全栈开发工程师',
    targetCompany: '腾讯',
    version: 2,
    isDefault: false,
    createdAt: '2026-05-20T10:30:00.000Z',
  },
  {
    id: 'resume-3',
    title: '技术负责人简历',
    content: '## 个人信息\n姓名：张明\n工作年限：8年\n\n## 管理经验\n- 带领10人前端团队完成多个核心项目\n- 制定技术路线图和OKR\n- 建立前端技术评审机制\n\n## 核心成果\n- 推动前端工程化体系建设\n- 实现团队人效提升30%',
    targetPosition: '前端技术负责人',
    targetCompany: '阿里巴巴',
    version: 1,
    isDefault: false,
    createdAt: '2026-06-01T14:00:00.000Z',
  },
];

const MOCK_COVER_LETTERS: CoverLetterItem[] = [
  {
    id: 'cl-1',
    title: '字节跳动-高级前端工程师求职信',
    content: '尊敬的招聘负责人：\n\n您好！我是一名拥有8年经验的前端工程师，对字节跳动的技术创新和产品理念深感敬佩。\n\n在过往的工作中，我主导了多个大型前端项目的架构设计与性能优化，积累了丰富的团队管理和技术决策经验。我相信我的技术深度和广度能够为字节跳动的前端团队带来价值。\n\n期待有机会与您进一步交流。',
    targetCompany: '字节跳动',
    targetPosition: '高级前端工程师',
    createdAt: '2026-05-16T09:00:00.000Z',
  },
  {
    id: 'cl-2',
    title: '腾讯-全栈工程师求职信',
    content: '尊敬的HR团队：\n\n您好！我对腾讯全栈工程师岗位非常感兴趣。\n\n我具备完整的前后端开发能力，在Node.js、React、Go等技术栈上有深入实践。曾独立设计并落地企业级SaaS产品，对全链路开发有丰富经验。\n\n希望能加入腾讯，参与更多有挑战性的项目。',
    targetCompany: '腾讯',
    targetPosition: '全栈开发工程师',
    createdAt: '2026-05-21T11:00:00.000Z',
  },
];

const MOCK_SELF_INTROS: SelfIntroductionItem[] = [
  {
    id: 'si-1',
    title: '面试-30秒快速自我介绍',
    content: '您好，我是张明，8年前端开发经验。擅长React生态和前端架构设计，曾主导多个大型项目从0到1的搭建。目前在寻找高级前端工程师或技术负责人的机会，希望能加入一个技术驱动的团队，做有影响力的产品。',
    scenario: '面试',
    duration: '30秒',
    tags: ['面试', '前端', '快速'],
    createdAt: '2026-05-10T08:00:00.000Z',
  },
  {
    id: 'si-2',
    title: '面试-1分钟标准自我介绍',
    content: '面试官您好，我是张明，目前是一名有8年经验的前端工程师。\n\n我的技术栈覆盖React全家桶、TypeScript、Node.js，以及前端工程化和微前端架构。在上一家公司，我带领10人团队完成了核心业务系统的前端重构，首屏加载速度提升了40%。\n\n我在技术选型、团队协作和项目管理方面都有比较丰富的经验。我个人追求代码质量和工程效率的平衡，也热衷于推动团队技术成长。\n\n非常期待能加入贵公司，一起打造优秀的产品。',
    scenario: '面试',
    duration: '1分钟',
    tags: ['面试', '标准', '前端架构'],
    createdAt: '2026-05-10T09:00:00.000Z',
  },
  {
    id: 'si-3',
    title: '电话-30秒简短介绍',
    content: '您好，我是张明。我是一名前端工程师，有8年的开发经验，最近在关注技术管理和架构方向的机会。方便的话可以聊聊贵公司的岗位情况。',
    scenario: '电话',
    duration: '30秒',
    tags: ['电话', '简短', '猎头沟通'],
    createdAt: '2026-05-11T10:00:00.000Z',
  },
  {
    id: 'si-4',
    title: '社交场合-3分钟深度介绍',
    content: '大家好，我是张明，很高兴能在这里认识各位。\n\n我在前端领域深耕了8年，从早期的jQuery时代一路走到现在的React和AI辅助开发时代。期间经历了从小公司到大厂的不同阶段，对技术团队的搭建和产品开发流程都有比较深的理解。\n\n目前我比较关注的方向是前端工程化、微前端架构，以及如何用技术手段提升研发效率。之前我主导了一个前端中台项目，统一了公司十几条业务线的前端技术栈，这件事让我收获很大。\n\n工作之外，我喜欢写技术博客和参加社区活动，也是几个开源项目的贡献者。我相信技术人应该保持开放和学习的心态。\n\n如果大家对前端架构或技术管理感兴趣，很乐意交流。',
    scenario: '社交场合',
    duration: '3分钟',
    tags: ['社交', '深度', '技术分享'],
    createdAt: '2026-05-12T14:00:00.000Z',
  },
];

// ────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────

export default function ResumesPage() {
  const [activeTab, setActiveTab] = useState('resumes');

  // Resume state — API-first
  const {
    data: resumes,
    loading: resumeLoading,
    create: resumeCreate,
    update: resumeUpdate,
    remove: resumeRemove,
    refetch: refetchResumes,
  } = useApiList<ResumeItem>({ endpoint: '/api/resumes', mockData: MOCK_RESUMES });

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeModalLoading, setResumeModalLoading] = useState(false);
  const [editingResume, setEditingResume] = useState<ResumeItem | null>(null);
  const [previewResume, setPreviewResume] = useState<ResumeItem | null>(null);
  const [resumeForm] = Form.useForm();
  const [uploadAreaVisible, setUploadAreaVisible] = useState(false);

  // Cover letter state — API-first
  const {
    data: coverLetters,
    loading: clLoading,
    create: clCreate,
    update: clUpdate,
    remove: clRemove,
  } = useApiList<CoverLetterItem>({ endpoint: '/api/cover-letters', mockData: MOCK_COVER_LETTERS });

  const [clModalOpen, setClModalOpen] = useState(false);
  const [clModalLoading, setClModalLoading] = useState(false);
  const [editingCl, setEditingCl] = useState<CoverLetterItem | null>(null);
  const [previewCl, setPreviewCl] = useState<CoverLetterItem | null>(null);
  const [clForm] = Form.useForm();

  // Self-introduction state — API-first
  const {
    data: selfIntros,
    loading: siLoading,
    create: siCreate,
    update: siUpdate,
    remove: siRemove,
  } = useApiList<SelfIntroductionItem>({ endpoint: '/api/self-introductions', mockData: MOCK_SELF_INTROS });

  const [siModalOpen, setSiModalOpen] = useState(false);
  const [siModalLoading, setSiModalLoading] = useState(false);
  const [editingSi, setEditingSi] = useState<SelfIntroductionItem | null>(null);
  const [siForm] = Form.useForm();

  // ════════════════════════════════════════════
  // Resume handlers
  // ════════════════════════════════════════════

  const openCreateResume = () => {
    setEditingResume(null);
    setUploadAreaVisible(false);
    resumeForm.resetFields();
    resumeForm.setFieldsValue({ version: 1, isDefault: false });
    setResumeModalOpen(true);
  };

  const openEditResume = (item: ResumeItem) => {
    setEditingResume(item);
    setUploadAreaVisible(false);
    resumeForm.setFieldsValue({
      title: item.title,
      content: item.content,
      targetPosition: item.targetPosition ?? undefined,
      targetCompany: item.targetCompany ?? undefined,
      version: item.version,
      isDefault: item.isDefault,
    });
    setResumeModalOpen(true);
  };

  const handleResumeSave = async () => {
    try {
      const values = await resumeForm.validateFields();
      setResumeModalLoading(true);

      const payload = {
        title: values.title,
        content: values.content,
        targetPosition: values.targetPosition ?? null,
        targetCompany: values.targetCompany ?? null,
        version: values.version ?? 1,
        isDefault: values.isDefault ?? false,
      };

      if (editingResume) {
        await resumeUpdate(editingResume.id, payload);
        message.success('简历已更新');
      } else {
        await resumeCreate(payload);
        message.success('简历已创建');
      }
      setResumeModalOpen(false);
    } catch {
      // validation error
    } finally {
      setResumeModalLoading(false);
    }
  };

  const handleDeleteResume = (item: ResumeItem) => {
    resumeRemove(item.id);
    message.success('简历已删除');
  };

  const handleToggleDefault = (item: ResumeItem) => {
    resumeUpdate(item.id, { isDefault: !item.isDefault } as any);
    message.success(item.isDefault ? '已取消默认' : '已设为默认简历');
  };

  const handleCopyResume = (item: ResumeItem) => {
    resumeCreate({
      title: `${item.title}（副本）`,
      content: item.content,
      targetPosition: item.targetPosition,
      targetCompany: item.targetCompany,
      version: 1,
      isDefault: false,
    });
    message.success('已复制简历');
  };

  // 文档解析后自动填充内容到编辑器
  const handleResumeParsed = (attachment: any) => {
    if (attachment.parsedText) {
      resumeForm.setFieldsValue({ content: attachment.parsedText });
      message.success('文档内容已填充到编辑器，请检查并调整');
    }
  };

  // ════════════════════════════════════════════
  // Cover letter handlers
  // ════════════════════════════════════════════

  const openCreateCl = () => {
    setEditingCl(null);
    clForm.resetFields();
    setClModalOpen(true);
  };

  const openEditCl = (item: CoverLetterItem) => {
    setEditingCl(item);
    clForm.setFieldsValue({
      title: item.title,
      content: item.content,
      targetCompany: item.targetCompany ?? undefined,
      targetPosition: item.targetPosition ?? undefined,
    });
    setClModalOpen(true);
  };

  const handleClSave = async () => {
    try {
      const values = await clForm.validateFields();
      setClModalLoading(true);

      const payload = {
        title: values.title,
        content: values.content,
        targetCompany: values.targetCompany ?? null,
        targetPosition: values.targetPosition ?? null,
      };

      if (editingCl) {
        await clUpdate(editingCl.id, payload);
        message.success('求职信已更新');
      } else {
        await clCreate(payload);
        message.success('求职信已创建');
      }
      setClModalOpen(false);
    } catch {
      // validation error
    } finally {
      setClModalLoading(false);
    }
  };

  const handleDeleteCl = (item: CoverLetterItem) => {
    clRemove(item.id);
    message.success('求职信已删除');
  };

  const handleCopyCl = (item: CoverLetterItem) => {
    clCreate({ title: `${item.title}（副本）`, content: item.content, targetCompany: item.targetCompany, targetPosition: item.targetPosition });
    message.success('已复制求职信');
  };

  // ════════════════════════════════════════════
  // Self-introduction handlers
  // ════════════════════════════════════════════

  const openCreateSi = () => {
    setEditingSi(null);
    siForm.resetFields();
    siForm.setFieldsValue({ scenario: '面试', duration: '1分钟', tags: [] });
    setSiModalOpen(true);
  };

  const openEditSi = (item: SelfIntroductionItem) => {
    setEditingSi(item);
    siForm.setFieldsValue({
      title: item.title,
      content: item.content,
      scenario: item.scenario,
      duration: item.duration ?? undefined,
      tags: item.tags,
    });
    setSiModalOpen(true);
  };

  const handleSiSave = async () => {
    try {
      const values = await siForm.validateFields();
      setSiModalLoading(true);

      const payload = {
        title: values.title,
        content: values.content,
        scenario: values.scenario,
        duration: values.duration ?? null,
        tags: values.tags ?? [],
      };

      if (editingSi) {
        await siUpdate(editingSi.id, payload);
        message.success('话术已更新');
      } else {
        await siCreate(payload);
        message.success('话术已创建');
      }
      setSiModalOpen(false);
    } catch {
      // validation error
    } finally {
      setSiModalLoading(false);
    }
  };

  const handleDeleteSi = (item: SelfIntroductionItem) => {
    siRemove(item.id);
    message.success('话术已删除');
  };

  // ── Grouped self-intros ──
  const groupedIntros = useMemo(() => {
    const groups: Record<string, SelfIntroductionItem[]> = {};
    for (const item of selfIntros) {
      if (!groups[item.scenario]) {
        groups[item.scenario] = [];
      }
      groups[item.scenario].push(item);
    }
    return groups;
  }, [selfIntros]);

  // ════════════════════════════════════════════
  // Render: Resume tab
  // ════════════════════════════════════════════

  const renderResumeTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary">
          共 {resumes.length} 份简历，管理不同版本的简历以匹配不同岗位
        </Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateResume} style={{ borderRadius: 8 }}>
          新增简历
        </Button>
      </div>

      {resumes.length === 0 ? (
        <Card style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', textAlign: 'center', padding: 40 }}>
          <Empty description="暂无简历，点击「新增简历」开始创建" />
        </Card>
      ) : (
        <Row gutter={[14, 14]}>
          {resumes.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', height: '100%' }}
                styles={{ body: { padding: '20px 20px 16px' } }}
                actions={[
                  <Tooltip title="编辑" key="edit">
                    <EditOutlined onClick={() => openEditResume(item)} />
                  </Tooltip>,
                  <Tooltip title="预览" key="preview">
                    <EyeOutlined onClick={() => setPreviewResume(item)} />
                  </Tooltip>,
                  <Tooltip title="复制" key="copy">
                    <CopyOutlined onClick={() => handleCopyResume(item)} />
                  </Tooltip>,
                  <Tooltip title={item.isDefault ? '取消默认' : '设为默认'} key="star">
                    <span onClick={() => handleToggleDefault(item)}>
                      {item.isDefault ? (
                        <StarFilled style={{ color: '#faad14' }} />
                      ) : (
                        <StarOutlined />
                      )}
                    </span>
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="确认删除此简历？"
                    onConfirm={() => handleDeleteResume(item)}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="删除">
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FileTextOutlined style={{ fontSize: 20, color: '#8b7cf0' }} />
                    <Title level={5} style={{ margin: 0, flex: 1 }}>
                      {item.title}
                    </Title>
                    {item.isDefault && (
                      <Badge count="默认" style={{ backgroundColor: '#faad14', color: '#fff', fontSize: 11 }} />
                    )}
                  </div>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {item.targetPosition && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        目标岗位：<Text strong style={{ fontSize: 13 }}>{item.targetPosition}</Text>
                      </Text>
                    )}
                    {item.targetCompany && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        目标公司：<Text strong style={{ fontSize: 13 }}>{item.targetCompany}</Text>
                      </Text>
                    )}
                  </Space>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color="blue" style={{ borderRadius: 8 }}>V{item.version}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  // ════════════════════════════════════════════
  // Render: Cover letter tab
  // ════════════════════════════════════════════

  const renderCoverLetterTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text type="secondary">
          共 {coverLetters.length} 封求职信，针对不同公司和岗位定制
        </Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCl} style={{ borderRadius: 8 }}>
          新增求职信
        </Button>
      </div>

      {coverLetters.length === 0 ? (
        <Card style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', textAlign: 'center', padding: 40 }}>
          <Empty description="暂无求职信，点击「新增求职信」开始创建" />
        </Card>
      ) : (
        <Row gutter={[14, 14]}>
          {coverLetters.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', height: '100%' }}
                styles={{ body: { padding: '20px 20px 16px' } }}
                actions={[
                  <Tooltip title="编辑" key="edit">
                    <EditOutlined onClick={() => openEditCl(item)} />
                  </Tooltip>,
                  <Tooltip title="预览" key="preview">
                    <EyeOutlined onClick={() => setPreviewCl(item)} />
                  </Tooltip>,
                  <Tooltip title="复制" key="copy">
                    <CopyOutlined onClick={() => handleCopyCl(item)} />
                  </Tooltip>,
                  <Popconfirm
                    key="delete"
                    title="确认删除此求职信？"
                    onConfirm={() => handleDeleteCl(item)}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="删除">
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FileTextOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                    <Title level={5} style={{ margin: 0, flex: 1 }}>
                      {item.title}
                    </Title>
                  </div>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    {item.targetCompany && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        目标公司：<Text strong style={{ fontSize: 13 }}>{item.targetCompany}</Text>
                      </Text>
                    )}
                    {item.targetPosition && (
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        目标岗位：<Text strong style={{ fontSize: 13 }}>{item.targetPosition}</Text>
                      </Text>
                    )}
                  </Space>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 3 }}
                  style={{ fontSize: 13, margin: 0 }}
                >
                  {item.content}
                </Paragraph>

                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  // ════════════════════════════════════════════
  // Render: Self-introduction tab
  // ════════════════════════════════════════════

  const renderSelfIntroTab = () => {
    const scenarioOrder = ['面试', '电话', '社交场合'];

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text type="secondary">
            共 {selfIntros.length} 条话术，按场景和时长分类管理
          </Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateSi} style={{ borderRadius: 8 }}>
            新增话术
          </Button>
        </div>

        {selfIntros.length === 0 ? (
          <Card style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', textAlign: 'center', padding: 40 }}>
            <Empty description="暂无话术，点击「新增话术」开始创建" />
          </Card>
        ) : (
          scenarioOrder.map((scenario) => {
            const items = groupedIntros[scenario];
            if (!items || items.length === 0) return null;

            return (
              <div key={scenario} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Space>
                    {SCENARIO_ICON_MAP[scenario]}
                    <Title level={5} style={{ margin: 0 }}>
                      {scenario}
                    </Title>
                  </Space>
                  <Badge
                    count={items.length}
                    style={{ backgroundColor: '#8b7cf0', fontSize: 12 }}
                  />
                </div>

                <Row gutter={[14, 14]}>
                  {items.map((item) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                      <Card
                        hoverable
                        style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)', height: '100%' }}
                        styles={{ body: { padding: '20px 20px 16px' } }}
                        actions={[
                          <Tooltip title="编辑" key="edit">
                            <EditOutlined onClick={() => openEditSi(item)} />
                          </Tooltip>,
                          <Popconfirm
                            key="delete"
                            title="确认删除此话术？"
                            onConfirm={() => handleDeleteSi(item)}
                            okText="删除"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <Tooltip title="删除">
                              <DeleteOutlined style={{ color: '#ff4d4f' }} />
                            </Tooltip>
                          </Popconfirm>,
                        ]}
                      >
                        <div style={{ marginBottom: 8 }}>
                          <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                            {item.title}
                          </Title>
                          <Space size={6}>
                            <Tag
                              color={SCENARIO_COLOR_MAP[item.scenario] ?? 'default'}
                              icon={SCENARIO_ICON_MAP[item.scenario]}
                              style={{ borderRadius: 8 }}
                            >
                              {item.scenario}
                            </Tag>
                            {item.duration && (
                              <Tag color={DURATION_COLOR_MAP[item.duration] ?? 'default'} style={{ borderRadius: 8 }}>
                                {item.duration}
                              </Tag>
                            )}
                          </Space>
                        </div>

                        <Divider style={{ margin: '8px 0' }} />

                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 3 }}
                          style={{ fontSize: 13, margin: '8px 0 0' }}
                        >
                          {item.content}
                        </Paragraph>

                        {item.tags.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {item.tags.map((tag) => (
                              <Tag key={tag} style={{ fontSize: 11, borderRadius: 8 }}>
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════
  // Main render
  // ════════════════════════════════════════════

  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          简历与求职信管理
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
          管理简历版本、求职信模板和自我介绍话术，为每一次求职做好准备
        </Paragraph>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'resumes',
            label: (
              <span>
                <FileTextOutlined /> 简历版本管理
              </span>
            ),
            children: renderResumeTab(),
          },
          {
            key: 'cover-letters',
            label: (
              <span>
                <CopyOutlined /> 求职信模板
              </span>
            ),
            children: renderCoverLetterTab(),
          },
          {
            key: 'self-intros',
            label: (
              <span>
                <SmileOutlined /> 自我介绍话术库
              </span>
            ),
            children: renderSelfIntroTab(),
          },
        ]}
      />

      {/* ── Resume Create/Edit Modal ── */}
      <Modal
        title={
          <Space>
            {editingResume ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingResume ? '编辑简历' : '新增简历'}</span>
          </Space>
        }
        open={resumeModalOpen}
        onOk={handleResumeSave}
        onCancel={() => setResumeModalOpen(false)}
        confirmLoading={resumeModalLoading}
        okText={editingResume ? '保存修改' : '创建'}
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form
          form={resumeForm}
          layout="vertical"
          initialValues={{ version: 1, isDefault: false }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="简历标题"
            rules={[{ required: true, message: '请输入简历标题' }]}
          >
            <Input placeholder="如：高级前端工程师简历" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetPosition" label="目标岗位">
                <Input placeholder="如：高级前端工程师" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetCompany" label="目标公司">
                <Input placeholder="如：字节跳动" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="version" label="版本号">
                <Input type="number" min={1} placeholder="1" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isDefault" label="设为默认">
                <Select
                  options={[
                    { label: '是', value: true },
                    { label: '否', value: false },
                  ]}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label="简历内容"
            rules={[{ required: true, message: '请输入简历内容' }]}
          >
            <TextArea
              rows={10}
              placeholder="粘贴或输入简历内容（支持 Markdown 格式）"
              maxLength={10000}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>

        {editingResume && (
          <>
            <Divider orientation="left" style={{ margin: '16px 0 12px' }}>
              简历文件
            </Divider>
            <div style={{ marginBottom: 12 }}>
              <Button
                icon={<UploadOutlined />}
                onClick={() => setUploadAreaVisible((v) => !v)}
                size="small"
              >
                {uploadAreaVisible ? '收起上传' : '上传简历文件'}
              </Button>
            </div>
            {uploadAreaVisible && (
              <FileUpload
                entityType="resume"
                entityId={editingResume.id}
                onSuccess={() => {
                  message.success('文件上传成功，请点击"解析文档"提取内容');
                }}
                accept=".pdf,.jpg,.jpeg,.png,.md"
              />
            )}
            <AttachmentList
              entityType="resume"
              entityId={editingResume.id}
              onParsed={handleResumeParsed}
            />
          </>
        )}
      </Modal>

      {/* ── Resume Preview Modal ── */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>简历预览 - {previewResume?.title}</span>
          </Space>
        }
        open={!!previewResume}
        onCancel={() => setPreviewResume(null)}
        footer={
          <Button onClick={() => setPreviewResume(null)}>关闭</Button>
        }
        width={680}
      >
        {previewResume && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="blue" style={{ borderRadius: 8 }}>V{previewResume.version}</Tag>
                {previewResume.targetPosition && (
                  <Tag color="cyan" style={{ borderRadius: 8 }}>{previewResume.targetPosition}</Tag>
                )}
                {previewResume.targetCompany && (
                  <Tag color="purple" style={{ borderRadius: 8 }}>{previewResume.targetCompany}</Tag>
                )}
                {previewResume.isDefault && (
                  <Badge count="默认" style={{ backgroundColor: '#faad14' }} />
                )}
              </Space>
            </div>
            <Divider />
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.8,
                color: '#333',
                background: '#fafafa',
                padding: 16,
                borderRadius: 8,
              }}
            >
              {previewResume.content}
            </pre>
          </div>
        )}
      </Modal>

      {/* ── Cover Letter Create/Edit Modal ── */}
      <Modal
        title={
          <Space>
            {editingCl ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingCl ? '编辑求职信' : '新增求职信'}</span>
          </Space>
        }
        open={clModalOpen}
        onOk={handleClSave}
        onCancel={() => setClModalOpen(false)}
        confirmLoading={clModalLoading}
        okText={editingCl ? '保存修改' : '创建'}
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form form={clForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="求职信标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="如：字节跳动-高级前端工程师求职信" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="targetCompany" label="目标公司">
                <Input placeholder="如：字节跳动" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetPosition" label="目标岗位">
                <Input placeholder="如：高级前端工程师" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label="求职信内容"
            rules={[{ required: true, message: '请输入求职信内容' }]}
          >
            <TextArea
              rows={10}
              placeholder="撰写你的求职信内容..."
              maxLength={5000}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Cover Letter Preview Modal ── */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>求职信预览 - {previewCl?.title}</span>
          </Space>
        }
        open={!!previewCl}
        onCancel={() => setPreviewCl(null)}
        footer={
          <Button onClick={() => setPreviewCl(null)}>关闭</Button>
        }
        width={680}
      >
        {previewCl && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                {previewCl.targetCompany && (
                  <Tag color="purple" style={{ borderRadius: 8 }}>{previewCl.targetCompany}</Tag>
                )}
                {previewCl.targetPosition && (
                  <Tag color="blue" style={{ borderRadius: 8 }}>{previewCl.targetPosition}</Tag>
                )}
              </Space>
            </div>
            <Divider />
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.8,
                color: '#333',
                background: '#fafafa',
                padding: 16,
                borderRadius: 8,
              }}
            >
              {previewCl.content}
            </pre>
          </div>
        )}
      </Modal>

      {/* ── Self-introduction Create/Edit Modal ── */}
      <Modal
        title={
          <Space>
            {editingSi ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingSi ? '编辑话术' : '新增话术'}</span>
          </Space>
        }
        open={siModalOpen}
        onOk={handleSiSave}
        onCancel={() => setSiModalOpen(false)}
        confirmLoading={siModalLoading}
        okText={editingSi ? '保存修改' : '创建'}
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form
          form={siForm}
          layout="vertical"
          initialValues={{ scenario: '面试', duration: '1分钟' }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="话术标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="如：面试-1分钟标准自我介绍" style={{ borderRadius: 8 }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scenario"
                label="使用场景"
                rules={[{ required: true, message: '请选择场景' }]}
              >
                <Select options={SCENARIO_OPTIONS} style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="话术时长">
                <Select options={DURATION_OPTIONS} placeholder="选择时长" allowClear style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="输入后回车添加标签"
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="话术内容"
            rules={[{ required: true, message: '请输入话术内容' }]}
          >
            <TextArea
              rows={8}
              placeholder="输入自我介绍话术内容..."
              maxLength={3000}
              showCount
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
