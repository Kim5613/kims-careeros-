'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Row, Col } from 'antd';
import { SendOutlined, ProjectOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ITEMS = [
  { key: 'job-seeking', icon: <SendOutlined style={{fontSize:28,color:'#8b7cf0'}} />, title: '求职战役', desc: 'JD诊断 · 投递追踪 · 面试复盘 · Offer对比', route: '/battle/job-seeking' },
  { key: 'internal', icon: <ProjectOutlined style={{fontSize:28,color:'#fa8c16'}} />, title: '内部战役', desc: 'BP项目 · 晋升答辩 · PIP改进 · 简历素材源', route: '/battle/internal' },
];

export default function BattleHomePage() {
  const router = useRouter();
  return (
    <div style={{padding:'40px 48px 24px',background:'#faf8f6',minHeight:'100vh'}}>
      <div style={{marginBottom:28}}>
        <Title level={3} style={{margin:0,fontSize:20,fontWeight:600}}>实战沙盘</Title>
        <Text type="secondary" style={{marginTop:4,display:'block'}}>求职全流程追踪 · 项目经验复盘</Text>
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
