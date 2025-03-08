import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Doctor from "@/app/models/DoctorSchema";

export async function GET() {
  try {
    await dbConnect();
    console.log('Fetching doctors...');
    
    const doctors = await Doctor.find({ status: 'active' })
      .select('_id name specialization availability consultationFee')
      .lean();

    // Verify availability data is present
    doctors.forEach(doc => {
      if (!doc.availability || doc.availability.length === 0) {
        console.warn(`Doctor ${doc._id} has no availability schedule`);
      }
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Fetch doctors error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}
