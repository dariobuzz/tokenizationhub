import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('documentType');
    
    if (!documentType) {
      // Get all documents for this user
      const documents = await db.kycDocument.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          documentType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      return NextResponse.json({ success: true, data: documents });
    }
    
    // Get specific document
    const document = await db.kycDocument.findUnique({
      where: {
        userId_documentType: {
          userId: session.user.id,
          documentType,
        },
      },
      select: {
        id: true,
        documentType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

// Endpoint to get the actual blob data
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { documentId } = data;
    
    if (!documentId) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
    }
    
    // Verify the user owns this document
    const document = await db.kycDocument.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }
    
    // Get the blob data
    const blobData = await db.kycDocumentBlob.findFirst({
      where: { documentId },
      select: {
        blobData: true,
        mimeType: true,
      },
    });
    
    if (!blobData) {
      return NextResponse.json({ error: 'Blob data not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        blobData: blobData.blobData.toString(),
        mimeType: blobData.mimeType,
      } 
    });
  } catch (error) {
    console.error('Error fetching blob data:', error);
    return NextResponse.json({ error: 'Failed to fetch blob data' }, { status: 500 });
  }
}