'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function CognitionSkillsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/growth/skill-map'); }, [router]);
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#faf8f6' }}><Spin /></div>;
}
