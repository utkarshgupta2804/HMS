import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";
import Doctor from "@/app/models/DoctorSchema";
import Appointment from "@/app/models/AppointmentSchema";
import MedicalRecord from "@/app/models/MedicalRecordSchema";
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        await dbConnect();

        // Get token from cookies using the new Next.js cookies API
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error("Token verification failed:", error);
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        if (!decoded || !decoded._id) {
            return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
        }

        const userId = decoded._id; // Extract userId from the decoded token
        
        const userData = await User.findById(userId).select("fullName email phone");

        // Fetch upcoming appointments
        const upcomingAppointments = await Appointment.find({
            patientId: userId,
            status: 'pending',  // Changed from 'scheduled' to 'pending'
            timeSlot: { $gte: new Date() }, // Changed from datetime to timeSlot
        }).sort({ timeSlot: 1 }).populate('doctorId');

        // Fetch past appointments
        const pastAppointments = await Appointment.find({
            patientId: userId,
            status: 'approved',
            timeSlot: { $lt: new Date() }, // Changed from datetime to timeSlot
        }).sort({ timeSlot: -1 }).populate('doctorId');

        // Fetch medical records
        const medicalRecords = await MedicalRecord.find({ patientId: userId }).sort({ date: -1 });

        // Get prescriptions from completed appointments
        const prescriptions = await Appointment.find({
            patientId: userId,
            status: "completed",
            "prescription.medicines": { $exists: true, $ne: [] },
        });

        // Format recent activity
        const recentActivity = [...upcomingAppointments, ...pastAppointments]
            .sort((a, b) => new Date(b.timeSlot) - new Date(a.timeSlot))
            .slice(0, 5)
            .map(appointment => ({
                type: "appointment",
                title: `Appointment ${appointment.reason}`,
                datetime: appointment.timeSlot,
                status: appointment.status === "pending" ? "upcoming" : "completed",
            }));

        const dashboardData = {
            fullname: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            upcomingAppointments: upcomingAppointments.length || 0,
            pastAppointments: pastAppointments.length || 0,
            medicalRecords: medicalRecords.length || 0,
            prescriptions: prescriptions.length || 0,
            recentActivity: recentActivity || [],
        };

        return NextResponse.json(dashboardData);
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
