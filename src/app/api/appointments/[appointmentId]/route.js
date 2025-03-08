import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Appointment from "@/app/models/AppointmentSchema";

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { appointmentId } = params;
    const data = await req.json();

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: data.status },
      { new: true }
    ).populate('doctorId', 'name specialization');

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
