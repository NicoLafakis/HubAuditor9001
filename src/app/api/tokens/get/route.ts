import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getUserToken } from '@/lib/db/users';

/**
 * GET /api/tokens/get?name=xxx - Get a specific token value (decrypted) for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(authToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tokenName = searchParams.get('name');

    if (!tokenName) {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      );
    }

    // Get and decrypt the token
    const tokenValue = getUserToken(payload.userId, tokenName);

    if (!tokenValue) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tokenValue });
  } catch (error) {
    console.error('Get token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
