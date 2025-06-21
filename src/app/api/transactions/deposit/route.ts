import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/auth.config';
import { PrismaClient } from '@prisma/client';

// Create a Prisma client instance
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authConfig);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data = await request.json();
    const { userId, transactionHash, amount, currency, method, timestamp } = data;

    // Validate required fields
    if (!userId || !transactionHash || !amount || !currency || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the user ID matches the authenticated user
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    // Check if this transaction has already been recorded
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        transactionHash,
      },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { message: 'Transaction already recorded', transaction: existingTransaction },
        { status: 200 }
      );
    }

    // Create the transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        transactionHash,
        amount: parseFloat(amount),
        currency,
        method,
        type: 'deposit',
        status: 'completed',
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Update user's balance
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: {
          increment: parseFloat(amount),
        },
      },
    });

    return NextResponse.json(
      { message: 'Transaction recorded successfully', transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing deposit transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}