import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const verificationStatus = await db.kycVerificationStatus.findUnique({
      where: { userId: session.user.id },
    });

    const documents = await db.kycDocument.findMany({
      where: { userId: session.user.id },
    });

    // Create status object
    const status = {
      identification: {
        form: verificationStatus?.identificationStatus || 'not_submitted',
        document: documents.find(d => d.documentType === 'identification')?.status || 'not_submitted'
      },
      address: {
        form: verificationStatus?.addressStatus || 'not_submitted',
        document: documents.find(d => d.documentType === 'address')?.status || 'not_submitted'
      },
      tax: {
        form: verificationStatus?.taxStatus || 'not_submitted',
        document: documents.find(d => d.documentType === 'tax')?.status || 'not_submitted'
      },
      financial: {
        form: verificationStatus?.financialStatus || 'not_submitted',
        document: documents.find(d => d.documentType === 'financial')?.status || 'not_submitted'
      }
    };

    return NextResponse.json({ 
      data: {
        status,
        isComplete: verificationStatus?.isComplete || false
      }
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC status' },
      { status: 500 }
    );
  }
}