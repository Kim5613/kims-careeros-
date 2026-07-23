'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Row, Col } from 'antd';
import { ImportOutlined, CodeOutlined, SmileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ITEMS = [
  { key: 'input', icon: <ImportOutlined style={{fontSize:28,color:'#722ed1'}} />, title: '输入资料', desc: '文章 · 书摘 · 课程笔记 · 信息摄入管理', route: '/cognition/input' },
  { key: 'skills', icon: <CodeOutlined style={{fontSize:28,color:'#52c41a'}} />, title: '技能学习', desc: '能力地图 · 学习路径 · 技能追踪', route: '/cognition/skills' },
  { key: 'hobbies', icon: <SmileOutlined style={{fontSize:28,color:'#13c2c2'}} />, title: '生活兴趣', desc: '兴趣爱好 · 副业探索 · 生活方式', route: '/cognition/hobbies' },
];

export default function CognitionHomePage() {
  const router = useRouter();
  return (
    <div style={{padding:'40px 48px 24px',background:'#faf8f6',minHeight:'100vh'}}>
      <div style={{marginBottom:28}}>
        <Title level={3} style={{margin:0,fontSize:20,fontWeight:600}}>认知实验室</Title>
        <Text type="secondary" style={{marginTop:4,display:'block'}}>信息输入 · 技能学习 · 兴趣探索</Text>
      </div>
      <Row gutter={[16,16]}>
        {ITEMS.map(item=>(
          <Col xs={24} sm={12} key={item.key}>
            <div onClick={()=>router.push(item.route)} style={{cursor:'pointer',padding:'28px 24px',borderRadius:14,background:'#fff',boxShadow:'0 0 0 1px rgba(0,0,0,0.03),0 1px 2px rgba(0,0,0,0.02)',transition:'box-shadow 0.15s',display:'flex',alignItems:'center',gap:16}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 0 0 1px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.06)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 0 0 1px rgba(0,0,0,0.03),0 1px 2px rgba(0,0,0,0.02)';}}>
              {item.icon}
              <div>
                <div style={{fontSize:16,fontWeight:500,marginBottom:4}}>{item.title}</div>
                <div style={{fontSize:13,color:'#999'}}>{item.desc}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
