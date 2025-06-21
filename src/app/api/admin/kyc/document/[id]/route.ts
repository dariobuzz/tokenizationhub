import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Removed authentication check
    
    const documentId = params.id;
    
    // Get the document blob
    const documentBlob = await db.kycDocumentBlob.findFirst({
      where: {
        documentId: documentId
      },
      select: {
        blobData: true,
        mimeType: true
      }
    });
    
    if (!documentBlob) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Return the blob data with the correct content type
    return new NextResponse(documentBlob.blobData, {
      headers: {
        'Content-Type': documentBlob.mimeType
      }
    });
  } catch (error) {
    console.error('Error fetching document blob:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}