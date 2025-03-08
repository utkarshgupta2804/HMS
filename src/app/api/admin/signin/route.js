import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";
import * as jose from 'jose';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email }).select('+password');
        console.log('Found user:', user?.email, user?.role); // Debug log

        if (!user || !['admin', 'superadmin'].includes(user.role)) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Create JWT using jose
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT({ 
            userId: user._id.toString(),
            role: user.role,
            email: user.email
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            }
        });

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            path: '/',
            maxAge: 86400,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        return response;
    } catch (error) {
        console.error('Signin error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
