import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { saveUserToken, getUserToken, getUserTokenList, deleteUserToken } from '@/lib/db/users';

/**
 * GET /api/tokens - Get all token names for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's token list
    const tokens = await getUserTokenList(payload.userId);

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Get tokens error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tokens - Save a new token for the current user
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { tokenName, token, tokenType } = body;

    if (!tokenName || !token) {
      return NextResponse.json(
        { error: 'Token name and value are required' },
        { status: 400 }
      );
    }

    // Save the token (encrypted)
    const success = await saveUserToken(
      payload.userId,
      tokenName,
      token,
      tokenType || 'hubspot'
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Token saved successfully' });
  } catch (error) {
    console.error('Save token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tokens - Delete a token for the current user
 */
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { tokenName } = body;

    if (!tokenName) {
      return NextResponse.json(
        { error: 'Token name is required' },
        { status: 400 }
      );
    }

    // Delete the token
    const success = await deleteUserToken(payload.userId, tokenName);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Delete token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
