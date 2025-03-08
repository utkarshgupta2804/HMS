import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Doctor from "@/app/models/DoctorSchema";

export async function GET() {
  try {
    await dbConnect();

    const doctors = await Doctor.find()
      .select('name specialization experience qualifications consultationFee availability ratings averageRating status')
      .sort({ createdAt: -1 });
    
    console.log('Doctors found:', JSON.stringify(doctors, null, 2));
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    console.log('Received data:', JSON.stringify(data, null, 2));

    // Validate availability data
    if (!Array.isArray(data.availability)) {
      return NextResponse.json({ 
        error: 'Availability must be an array' 
      }, { status: 400 });
    }

    // Format the doctor data
    const doctorData = {
      name: data.name,
      specialization: data.specialization,
      experience: parseInt(data.experience),
      qualifications: data.qualifications.map(q => ({
        degree: q.degree,
        institution: q.institution,
        year: parseInt(q.year)
      })),
      consultationFee: parseInt(data.consultationFee),
      // Format availability data
      availability: data.availability.map(day => ({
        day: day.day,
        slots: day.slots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      }))
    };

    console.log('Formatted data:', JSON.stringify(doctorData, null, 2));

    // Create the doctor document
    const doctor = new Doctor(doctorData);
    const savedDoctor = await doctor.save();

    // Verify saved data
    const verifiedDoctor = await Doctor.findById(savedDoctor._id);
    console.log('Saved doctor data:', JSON.stringify(verifiedDoctor, null, 2));

    return NextResponse.json({
      success: true,
      doctor: verifiedDoctor
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    return NextResponse.json({ 
      error: 'Failed to create doctor',
      details: error.message 
    }, { status: 500 });
  }
}

// Update doctor
export async function PUT(req) {
  try {
    await adminAuth(req);
    await dbConnect();
    
    const { doctorId, ...updateData } = await req.json();
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({ message: 'Doctor updated', doctor });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete doctor
export async function DELETE(req) {
  try {
    await adminAuth(req);
    await dbConnect();
    
    const { doctorId } = await req.json();
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Delete doctor profile
    await Doctor.findByIdAndDelete(doctorId);

    return NextResponse.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
