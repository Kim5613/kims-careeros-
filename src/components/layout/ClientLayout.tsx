'use client';

import dynamic from 'next/dynamic';

const AppLayout = dynamic(() => import('@/components/layout/AppLayout'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f5f5f5',
      color: '#999',
      fontSize: 16,
    }}>
      Loading...
    </div>
  ),
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
