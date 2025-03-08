import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";
import jwt from 'jsonwebtoken';

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { userId } = params;

        // Get user role from token
        const token = req.cookies.get('token')?.value;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userRole = decoded.role;

        // Find user to be deleted
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check permissions
        if (userRole !== 'superadmin' && userToDelete.role === 'admin') {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        await User.findByIdAndDelete(userId);
        return NextResponse.json({ success: true, message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
