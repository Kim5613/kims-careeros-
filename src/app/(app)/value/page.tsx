'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Row, Col } from 'antd';
import { ScheduleOutlined, RiseOutlined, AuditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ITEMS = [
  { key: 'timeline', icon: <ScheduleOutlined style={{fontSize:28,color:'#8b7cf0'}} />, title: '职业履历', desc: '职业生涯时间轴 · 跳槽记录 · 晋升里程碑', route: '/value/timeline' },
  { key: 'salary', icon: <RiseOutlined style={{fontSize:28,color:'#eb2f96'}} />, title: '薪资涨幅', desc: '薪资曲线 · Offer记录 · 市场对标', route: '/value/salary' },
  { key: 'review', icon: <AuditOutlined style={{fontSize:28,color:'#fa8c16'}} />, title: '身价复盘', desc: '年度复盘 · 成长诊断 · 市场价值评估', route: '/value/review' },
];

export default function ValueHomePage() {
  const router = useRouter();
  return (
    <div style={{padding:'40px 48px 24px',background:'#faf8f6',minHeight:'100vh'}}>
      <div style={{marginBottom:28}}>
        <Title level={3} style={{margin:0,fontSize:20,fontWeight:600}}>身价账本</Title>
        <Text type="secondary" style={{marginTop:4,display:'block'}}>职业履历 · 薪资追踪 · 身价复盘</Text>
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
