import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Appointment from "@/app/models/AppointmentSchema";
import Bed from "@/app/models/BedSchema"; // Add this import
import Doctor from "@/app/models/DoctorSchema";
import { sendAppointmentEmail, sendCancellationEmail } from "@/app/utils/nodemailer";

export async function GET() {
  try {
    await dbConnect();
    
    const appointments = await Appointment.find()
      .populate({
        path: 'patientId',
        model: 'User',
        select: 'fullName email phone _id'
      })
      .populate({
        path: 'doctorId',
        model: 'Doctor',
        select: 'name email specialization'
      })
      .lean()
      .exec(); // Add exec() to ensure proper population

    // Verify the data
    appointments.forEach(apt => {
      if (!apt.patientId) {
        console.warn(`Missing patient data for appointment ${apt._id}`);
      }
    });

    // Log the first appointment for debugging
    if (appointments.length > 0) {
      console.log('Sample appointment data:', {
        appointmentId: appointments[0]._id,
        patient: appointments[0].patientId,
        doctor: appointments[0].doctorId
      });
    }

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const { appointmentId, status, doctorId, datetime } = data;

    if (!appointmentId) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    // Get the current appointment to check previous status
    const currentAppointment = await Appointment.findById(appointmentId);
    if (!currentAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const updateData = {};

    // Set status based on the action
    if (doctorId) {
      updateData.doctorId = doctorId;
      updateData.status = 'approved';
    } else if (status) {
      updateData.status = status === 'scheduled' ? 'approved' : status;
    }

    if (datetime) {
      updateData.timeSlot = new Date(datetime);
    }

    // Handle bed management based on status changes
    try {
      if (updateData.status === 'approved' && currentAppointment.status !== 'approved') {
        // Allocate bed when appointment is approved
        const currentBeds = await Bed.findOne();
        if (!currentBeds || currentBeds.availableBeds <= 0) {
          return NextResponse.json({ error: 'No beds available' }, { status: 400 });
        }

        await Bed.findOneAndUpdate({}, {
          $inc: { 
            bedsInUse: 1,
            availableBeds: -1
          }
        });
      } else if ((updateData.status === 'cancelled' || updateData.status === 'completed') && 
                 currentAppointment.status === 'approved') {
        // Release bed when appointment is cancelled or completed
        const currentBeds = await Bed.findOne();
        if (currentBeds && currentBeds.bedsInUse > 0) {
          await Bed.findOneAndUpdate({}, {
            $inc: { 
              bedsInUse: -1,
              availableBeds: 1
            }
          });
        }
      }
    } catch (bedError) {
      console.error('Bed management error:', bedError);
      // Continue with appointment update even if bed management fails
    }

    // Update the appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    )
    .populate({
      path: 'doctorId',
      model: 'Doctor',
      select: 'name email specialization'
    })
    .populate('patientId', 'fullName email');

    // Handle email notifications
    try {
      if (updateData.status === 'approved') {
        await sendAppointmentEmail(appointment);
      } else if (updateData.status === 'cancelled') {
        await sendCancellationEmail(appointment);
      }
      // Removed completion email notification
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
