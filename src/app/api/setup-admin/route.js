import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";

export async function POST(req) {
    try {
        await dbConnect();

        const adminUser = {
            fullName: 'Admin User',
            email: 'admin@hms.com',
            password: 'admin123',  // You should change this
            phone: '1234567890',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Other',
            role: 'admin'
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        if (existingAdmin) {
            return NextResponse.json({ message: 'Admin already exists' });
        }

        // Create admin user
        const user = await User.create(adminUser);

        return NextResponse.json({ 
            message: 'Admin user created successfully',
            credentials: {
                email: adminUser.email,
                password: adminUser.password
            }
        });
    } catch (error) {
        console.error('Setup admin error:', error);
        return NextResponse.json(
            { error: 'Failed to create admin user' },
            { status: 500 }
        );
    }
}
