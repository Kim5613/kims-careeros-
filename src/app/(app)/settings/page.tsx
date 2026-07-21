'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Button, message, Divider, Row, Col, Radio, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Theme, getStoredTheme, themes } from '@/lib/themes';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [changing, setChanging] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    setCurrentTheme(getStoredTheme());
  }, []);

  const handleChangePassword = async () => {
    if (!oldPwd || !newPwd) { message.warning('请填写新旧密码'); return; }
    setChanging(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: oldPwd }),
      });
      if (!res.ok) { message.error('旧密码错误'); return; }
      // 目前通过 .env 管理密码，这里先提示
      message.info('密码修改功能需配合环境变量，当前版本请在 .env 中修改 ACCESS_PASSWORD');
    } catch { message.error('操作失败'); }
    finally { setChanging(false); }
  };

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (theme) {
      localStorage.setItem('careeros-theme', theme.id);
      setCurrentTheme(theme);
      message.success(`已切换为 ${theme.name}`);
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: '40px 48px 24px', background: '#faf8f6', minHeight: '100vh' }}>
      <Title level={3} style={{ fontSize: 20, fontWeight: 600 }}>设置</Title>

      {/* 密码修改 */}
      <Card title={<span><LockOutlined /> 密码修改</span>} style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.Password placeholder="旧密码" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} style={{ borderRadius: 8, maxWidth: 320 }} />
          <Input.Password placeholder="新密码" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={{ borderRadius: 8, maxWidth: 320 }} />
          <Button type="primary" loading={changing} onClick={handleChangePassword} style={{ borderRadius: 8 }}>修改密码</Button>
          <Text type="secondary" style={{ fontSize: 12 }}>当前版本通过 .env 文件管理密码，后续版本支持在线修改</Text>
        </Space>
      </Card>

      {/* 主题切换 */}
      <Card title="主题切换" style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
        <Row gutter={[12, 12]}>
          {themes.map((theme) => (
            <Col key={theme.id} xs={12} sm={8} md={6}>
              <div
                onClick={() => handleThemeChange(theme.id)}
                style={{
                  border: currentTheme.id === theme.id ? '2px solid #8b7cf0' : '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: currentTheme.id === theme.id ? '#f0f5ff' : '#fff',
                  transition: 'all 0.2s',
                }}
              >
                <img src={theme.logo} alt={theme.name} style={{ height: 32, objectFit: 'contain', marginBottom: 6 }} />
                <div style={{ fontSize: 12, color: '#666' }}>{theme.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 字体设计 */}
      <Card title="字体设计" style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
        <Text type="secondary">字体样式配置功能待下一版本开放</Text>
      </Card>

      {/* 分享权限 */}
      <Card title="分享权限" style={{ borderRadius: 8, boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)' }}>
        <Text type="secondary">分享链接权限管理功能待下一版本开放</Text>
      </Card>
    </div>
  );
}
