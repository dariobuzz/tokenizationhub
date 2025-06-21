import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Get the session (optional - we can remove this check if needed)
    const session = await getServerSession(authConfig);
    
    // Parse the request body
    const { userId, section, documentId, formId, status } = await request.json();
    
    console.log('Received update request:', { userId, section, documentId, formId, status });
    
    // Validate required fields
    if (!userId || !section || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Update document status if documentId is provided
    if (documentId) {
      await db.kycDocument.update({
        where: { id: documentId },
        data: { status }
      });
      console.log(`Updated document ${documentId} status to ${status}`);
    }
    
    // Update form status if formId is provided
    if (formId) {
      await db.kycFormData.update({
        where: { id: formId },
        data: { status }
      });
      console.log(`Updated form ${formId} status to ${status}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' }, 
      { status: 500 }
    );
  }
}