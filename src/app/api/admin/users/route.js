import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Get user role from token
    const token = req.cookies.get('token')?.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decoded.role;

    // If admin, exclude other admins and superadmins from results
    let query = userRole === 'admin' ? { role: { $nin: ['admin', 'superadmin'] } } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const userId = url.pathname.split('/').pop();

    // Get user role from token
    const token = req.cookies.get('token')?.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decoded.role;

    // Find user to be deleted
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (userRole !== 'superadmin' && 
       (userToDelete.role === 'admin' || userToDelete.role === 'superadmin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this user' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(userId);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    // Get admin role from token
    const token = req.cookies.get('token')?.value;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminRole = decoded.role;

    // Only admin and superadmin can create users
    if (adminRole !== 'admin' && adminRole !== 'superadmin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const userData = await req.json();
    
    // Regular admin can only create patients and doctors
    if (adminRole === 'admin' && 
        (userData.role === 'admin' || userData.role === 'superadmin')) {
      return NextResponse.json(
        { error: 'Cannot create admin or superadmin users' },
        { status: 403 }
      );
    }

    const newUser = await User.create(userData);
    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
