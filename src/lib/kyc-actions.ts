'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function uploadKycDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const documentType = formData.get('documentType') as string;
    
    if (!file || !userId || !documentType) {
      throw new Error('Missing required fields');
    }

    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Get the file data as buffer
    const blobData = await file.arrayBuffer();
    const buffer = Buffer.from(blobData);
    
    // Check if document already exists for this user and document type
    const existingDoc = await db.kycDocument.findUnique({
      where: {
        userId_documentType: {
          userId,
          documentType,
        },
      },
    });

    let docId;
    
    if (existingDoc) {
      // Update existing document
      await db.kycDocument.update({
        where: { id: existingDoc.id },
        data: {
          status: 'pending',
          updatedAt: new Date(),
          fileType: file.type,
          fileSize: file.size,
        },
      });
      
      // Check if blob exists and update or create
      const existingBlob = await db.kycDocumentBlob.findFirst({
        where: { documentId: existingDoc.id }
      });
      
      if (existingBlob) {
        await db.kycDocumentBlob.update({
          where: { id: existingBlob.id },
          data: {
            blobData: buffer,
            mimeType: file.type,
            fileSize: file.size,
          }
        });
      } else {
        await db.kycDocumentBlob.create({
          data: {
            documentId: existingDoc.id,
            blobData: buffer,
            mimeType: file.type,
            fileSize: file.size,
          }
        });
      }
      
      docId = existingDoc.id;
    } else {
      // Create new document
      const newDoc = await db.kycDocument.create({
        data: {
          id: documentId,
          userId,
          documentType,
          fileSize: file.size,
          fileType: file.type,
          status: 'pending',
        },
      });
      
      // Create new blob entry
      await db.kycDocumentBlob.create({
        data: {
          documentId: newDoc.id,
          blobData: buffer,
          mimeType: file.type,
          fileSize: file.size,
        }
      });
      
      docId = newDoc.id;
    }

    revalidatePath('/kyc');
    return { success: true, documentId: docId };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}