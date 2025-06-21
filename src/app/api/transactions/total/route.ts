import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const method = searchParams.get('method');

    if (!userId || !method) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify the user ID matches the authenticated user
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate total deposits
    const total = await prisma.transaction.aggregate({
      where: {
        userId,
        method,
        type: 'deposit',
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      total: total._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error calculating total deposits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}