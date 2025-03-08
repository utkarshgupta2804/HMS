import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import { superAdminAuth } from "@/app/middleware/adminAuth";
import User from "@/app/models/userSchema";

// Get all admins
export async function GET(req) {
    try {
        await superAdminAuth(req);
        await dbConnect();

        const admins = await User.find({ 
            role: 'admin' 
        }).select('-password');

        return NextResponse.json(admins);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch admins' },
            { status: 500 }
        );
    }
}

// Create new admin
export async function POST(req) {
    try {
        await superAdminAuth(req);
        await dbConnect();

        const data = await req.json();
        data.role = 'admin'; // Force role to be admin

        const admin = await User.create(data);
        const adminWithoutPassword = admin.toObject();
        delete adminWithoutPassword.password;

        return NextResponse.json({ 
            message: 'Admin created successfully',
            admin: adminWithoutPassword 
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create admin' },
            { status: 500 }
        );
    }
}

// Remove admin
export async function DELETE(req) {
    try {
        await superAdminAuth(req);
        await dbConnect();

        const { adminId } = await req.json();
        
        const admin = await User.findOneAndDelete({
            _id: adminId,
            role: 'admin' // Extra safety check
        });

        if (!admin) {
            return NextResponse.json(
                { error: 'Admin not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Admin removed successfully' 
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to remove admin' },
            { status: 500 }
        );
    }
}
