'use client';

import { useParams } from 'next/navigation';
import { Result, Button } from 'antd';
import GravityLens from '@/components/growth/GravityLens';
import { DOMAIN_REGISTRY } from '@/data/domain-tracks';

export default function DomainPage() {
  const params = useParams();
  const domainSlug = params.domain as string;
  const domain = DOMAIN_REGISTRY[domainSlug];

  if (!domain) {
    return (
      <div style={{ padding: '80px 32px', background: '#0d0d0d', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
        <Result
          status="info"
          title={<span style={{ color: '#e0dcd5' }}>该赛道即将开放</span>}
          subTitle={<span style={{ color: '#888' }}>「{domainSlug}」板块的能力地图正在建设中，敬请期待</span>}
          extra={<Button type="primary" style={{ borderRadius: 20 }} href="/career-sphere">返回职业宇宙</Button>}
          style={{ background: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <GravityLens
      domainId={domainSlug}
      domainLabel={domain.label}
      tracks={domain.tracks}
      backHref="/career-sphere"
    />
  );
}
