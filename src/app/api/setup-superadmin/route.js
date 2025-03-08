import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";

export async function POST(req) {
    try {
        await dbConnect();

        // Check if superadmin already exists
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
        if (existingSuperAdmin) {
            return NextResponse.json(
                { error: 'Superadmin already exists' },
                { status: 400 }
            );
        }

        const superAdminUser = {
            fullName: 'Super Admin',
            email: 'superadmin@hms.com',
            password: 'superadmin123',  // Change this in production
            phone: '1234567890',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Other',
            role: 'superadmin'
        };

        const user = await User.create(superAdminUser);

        return NextResponse.json({ 
            message: 'Superadmin created successfully',
            credentials: {
                email: superAdminUser.email,
                password: superAdminUser.password
            }
        });
    } catch (error) {
        console.error('Setup superadmin error:', error);
        return NextResponse.json(
            { error: 'Failed to create superadmin' },
            { status: 500 }
        );
    }
}
