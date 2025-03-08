import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema';

export default async function adminAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify admin role
    const user = await User.findById(decoded.userId);
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Add user info to request
    request.admin = {
      userId: user._id,
      role: user.role,
      email: user.email
    };

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function superAdminAuth(request) {
  const response = await adminAuth(request);
  if (response.status !== 200) return response;
  
  if (request.admin.role !== 'superadmin') {
    return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
  }
  return NextResponse.next();
}
