'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

export default function ValueSalaryPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/salary-growth'); }, [router]);
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#faf8f6' }}><Spin /></div>;
}
