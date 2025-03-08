import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Appointment from "@/app/models/AppointmentSchema";
import Bed from "@/app/models/BedSchema";

export async function GET() {
  try {
    await dbConnect();
    const currentDate = new Date();
    
    // Find all approved appointments that are in the past
    const pastAppointments = await Appointment.find({
      status: 'approved',
      timeSlot: { $lt: currentDate }
    });

    // Update appointments and manage beds
    for (const appointment of pastAppointments) {
      // Update appointment status
      await Appointment.findByIdAndUpdate(
        appointment._id,
        { status: 'completed' },
        { new: true }
      );

      // Release bed
      try {
        const currentBeds = await Bed.findOne();
        if (currentBeds && currentBeds.bedsInUse > 0) {
          await Bed.findOneAndUpdate({}, {
            $inc: { 
              bedsInUse: -1,
              availableBeds: 1
            }
          });
        }
      } catch (bedError) {
        console.error('Bed management error:', bedError);
      }
    }

    return NextResponse.json({
      message: `Updated ${pastAppointments.length} past appointments`,
      updatedCount: pastAppointments.length
    });
  } catch (error) {
    console.error('Check appointments error:', error);
    return NextResponse.json({ error: 'Failed to check appointments' }, { status: 500 });
  }
}
