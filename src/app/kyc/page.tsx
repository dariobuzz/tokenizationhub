'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import KYCContent from '@/components/KYCContent'; // Import a separate component

export default function KYCPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log('KYC Page - Current session:', session);
  console.log('KYC Page - Authentication status:', status);

  useEffect(() => {
    console.log('KYC Page - useEffect triggered with status:', status);
    if (status === 'unauthenticated') {
      console.log('KYC Page - User unauthenticated, redirecting to login');
      router.push('/login?callbackUrl=/kyc');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    console.log('KYC Page - Rendering loading state');
    return <div>Loading...</div>;
  }

  console.log('KYC Page - User authenticated, rendering main content');
  return (
  
         <Layout>
      <KYCContent /> {/* Use the separate component instead of KYCPage */}
      </Layout>
    
  );
}