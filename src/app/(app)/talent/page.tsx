'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Row, Col } from 'antd';
import { UserOutlined, TagsOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ITEMS = [
  { key: 'contacts', icon: <UserOutlined style={{fontSize:28,color:'#8b7cf0'}} />, title: '人才档案', desc: '人脉网络 · 候选人库 · 简历管理', route: '/talent/contacts' },
  { key: 'categories', icon: <TagsOutlined style={{fontSize:28,color:'#52c41a'}} />, title: '人才分类', desc: '按职能/级别/行业分类 · 标签体系', route: '/talent/categories' },
  { key: 'operations', icon: <BarChartOutlined style={{fontSize:28,color:'#fa8c16'}} />, title: '人才运营', desc: '人才盘点 · 跟进记录 · 激活策略', route: '/talent/operations' },
];

export default function TalentHomePage() {
  const router = useRouter();
  return (
    <div style={{padding:'40px 48px 24px',background:'#faf8f6',minHeight:'100vh'}}>
      <div style={{marginBottom:28}}>
        <Title level={3} style={{margin:0,fontSize:20,fontWeight:600}}>人才弹药库</Title>
        <Text type="secondary" style={{marginTop:4,display:'block'}}>人才档案 · 分类体系 · 运营管理</Text>
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
