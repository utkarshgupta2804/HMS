import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        
        // Debug logs
        console.log('Attempting to create user with data:', {
            ...body,
            password: '[REDACTED]'
        });

        // Validate date format
        const dateOfBirth = new Date(body.dateOfBirth);
        if (isNaN(dateOfBirth)) {
            return NextResponse.json(
                { error: 'Invalid date format for dateOfBirth' },
                { status: 400 }
            );
        }

        // Format the data properly
        const userData = {
            fullName: body.fullName,
            email: body.email.toLowerCase(),
            password: body.password,
            phone: body.phone,
            dateOfBirth: dateOfBirth,
            gender: body.gender,
            role: 'patient' // Default role
        };

        // Create user with formatted data
        const user = await User.create(userData);
        console.log('User created successfully:', user._id);

        // Return sanitized response
        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        }, { status: 201 });

    } catch (error) {
        // Detailed error logging
        console.error('Signup error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: Object.values(error.errors).map(err => err.message).join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}