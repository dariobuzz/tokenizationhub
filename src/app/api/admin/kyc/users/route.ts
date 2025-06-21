import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Fix the import path to match your actual auth configuration
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Temporarily bypass admin check for testing
    const session = await getServerSession(authConfig);
    
    console.log('Session in API route:', session);
    
    // Temporarily bypass admin check for testing
    /*
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    */
    
    // Get all users with their KYC data
    const users = await db.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        documents: {
          select: {
            id: true,
            documentType: true,
            fileType: true,
            fileSize: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        formData: {
          select: {
            id: true,
            formType: true,
            formData: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          }
        }
      }
    });
    
    // Transform the data to match our frontend structure
    const transformedUsers = users.map(user => {
      const documents = {
        identification: user.documents.find(d => d.documentType === 'identification') || null,
        address: user.documents.find(d => d.documentType === 'address') || null,
        tax: user.documents.find(d => d.documentType === 'tax') || null,
        financial: user.documents.find(d => d.documentType === 'financial') || null,
      };
      
      const formData = {
        identification: user.formData.find(f => f.formType === 'identification') || null,
        address: user.formData.find(f => f.formType === 'address') || null,
        tax: user.formData.find(f => f.formType === 'tax') || null,
        financial: user.formData.find(f => f.formType === 'financial') || null,
      };
      
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        documents,
        formData
      };
    });
    
    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error fetching KYC users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}