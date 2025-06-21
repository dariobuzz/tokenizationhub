import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    const { fullName, email, password } = await req.json();
    console.log('Registration data received:', { fullName, email });
    
    // Declare verifyToken in the outer scope
    let verifyToken = '';
    let user;
    
    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log('User already exists:', email);
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      throw error;
    }

    try {
      console.log('Creating user in database...');
      verifyToken = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Check if fullName is provided, use a default if not
      const userFullName = fullName || 'User'; // Provide a default name if fullName is undefined
      
      // When creating a new user
      const newUser = await prisma.user.create({
        data: {
          fullName: userFullName,
          email,
          password: hashedPassword,
          verifyToken: verifyToken
        }
      });
      console.log('User created successfully:', newUser.id);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verifyToken}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your TokenizeHub Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to TokenizeHub!</h1>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    });

    return NextResponse.json({ 
      message: 'Registration successful! Please check your email to verify your account.' 
    });

  } catch (error) {
    console.error('Detailed registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}