'use client';
import DepositPage from '@/components/DepositTab';
import Layout from '@/components/Layout';
import { useSearchParams } from 'next/navigation';

export default function Deposit() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'bank';
  
  return (
    <Layout>
      <DepositPage />
    </Layout>
  );
}