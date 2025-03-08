import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import User from "@/app/models/userSchema";
import Doctor from "@/app/models/DoctorSchema";
import Appointment from "@/app/models/AppointmentSchema";
import MedicalRecord from "@/app/models/MedicalRecordSchema";

export async function GET() {
    try {
        await dbConnect();

        // Get total counts
        const totalPatients = await User.countDocuments({role: 'patient'});
        const totalDoctors = await Doctor.countDocuments();
        const totalMedicalRecords = await MedicalRecord.countDocuments(); // Add this line
        
        // Get today's appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointmentsToday = await Appointment.countDocuments({
            timeSlot: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Get pending appointment requests
        const pendingRequests = await Appointment.countDocuments({ status: 'pending' });

        // Get recent activity
        const recentActivity = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('patientId', 'fullName')
            .populate('doctorId', 'name');

        const formattedActivity = recentActivity.map(activity => ({
            id: activity._id,
            type: 'appointment',
            patient: activity.patientId?.fullName || 'Unknown Patient',
            doctor: activity.doctorId?.name || 'Unassigned',
            status: activity.status,
            timeAgo: activity.createdAt
        }));

        return NextResponse.json({
            stats: {
                totalPatients,
                totalDoctors,
                appointmentsToday,
                pendingRequests,
                totalMedicalRecords // Add this line
            },
            recentActivity: formattedActivity
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);
        return NextResponse.json(
            { error: "Failed to fetch admin dashboard data" },
            { status: 500 }
        );
    }
}
