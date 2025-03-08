import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        // Clear the auth token cookie
        response.cookies.set({
            name: 'token',
            value: '',
            expires: new Date(0),
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { error: 'Error during sign out' },
            { status: 500 }
        );
    }
}
