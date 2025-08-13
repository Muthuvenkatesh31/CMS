import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeCode, password } = body;

    // Basic validation
    if (!employeeCode || !password) {
      return NextResponse.json(
        { success: false, message: 'Employee code and password are required' },
        { status: 400 }
      );
    }

    const authResult = await authenticateUser({ employeeCode, password });

    if (authResult.success && authResult.token) {
      // Set HTTP-only cookie
      cookies().set('auth-token', authResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({
        success: true,
        message: authResult.message,
        user: authResult.user
      });
    } else {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
