import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json(
                { error: 'User does not exist' },
                { status: 404 }
            );
        }

        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = jwt.sign(
            {
                _id: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        const userWithoutPassword = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        };

        const response = NextResponse.json({
            message: 'Login successful',
            user: userWithoutPassword
        });

        // Set JWT token in cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from strict to lax for better compatibility
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Signin error:', error);
        return NextResponse.json(
            { error: 'Something went wrong during sign in' },
            { status: 500 }
        );
    }
}
