import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import MedicalRecord from "@/app/models/MedicalRecordSchema";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
    try {
        await dbConnect();

        // Get token from cookies
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch records for the authenticated patient
        const records = await MedicalRecord.find({ patientId: decoded._id })
            .populate('patientId', 'fullName email phone gender age')  // Added phone and gender to populated fields
            .sort({ date: -1 });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Medical records fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch medical records" },
            { status: 500 }
        );
    }
}
