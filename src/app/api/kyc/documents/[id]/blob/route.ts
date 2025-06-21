import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const documentId = params.id;
    
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