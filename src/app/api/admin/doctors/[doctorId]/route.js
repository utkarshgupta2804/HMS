import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Doctor from "@/app/models/DoctorSchema";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { doctorId } = params;

    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return NextResponse.json(
      { error: 'Failed to delete doctor' },
      { status: 500 }
    );
  }
}
