import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getUserById, getUserStats } from '@/lib/db/users';

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get current user to check if admin
    const currentUser = await getUserById(decoded.userId);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get stats
    const stats = await getUserStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in admin stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
