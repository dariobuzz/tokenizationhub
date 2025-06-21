import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { formType, formData } = await request.json();

    if (!formType || !formData) {
      return NextResponse.json(
        { error: 'Missing formType or formData' },
        { status: 400 }
      );
    }

    // Upsert the form data for the specific section
    const result = await db.kycFormData.upsert({
      where: {
        userId_formType: {
          userId: session.user.id,
          formType,
        },
      },
      create: {
        userId: session.user.id,
        formType,
        formData,
        status: 'pending',
      },
      update: {
        formData,
        status: 'pending',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error saving form data:', error);
    return NextResponse.json(
      { error: 'Failed to save form data' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    const { searchParams } = new URL(request.url);
    const formType = searchParams.get('formType');

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!formType) {
      // Return all forms if no specific type requested
      const forms = await db.kycFormData.findMany({
        where: { userId: session.user.id },
      });
      return NextResponse.json({ data: forms });
    }

    // Return specific form data
    const formData = await db.kycFormData.findUnique({
      where: {
        userId_formType: {
          userId: session.user.id,
          formType,
        },
      },
    });

    return NextResponse.json({ data: formData });
  } catch (error) {
    console.error('Error fetching form data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form data' },
      { status: 500 }
    );
  }
}