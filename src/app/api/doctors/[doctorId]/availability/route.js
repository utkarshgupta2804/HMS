import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Doctor from "@/app/models/DoctorSchema";
import Appointment from "@/app/models/AppointmentSchema";

// Helper function to generate 15-minute slots
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    // Schedule 15-minute appointment
    const appointmentEndMinute = currentMinute + 15;
    let appointmentEndHour = currentHour;
    
    if (appointmentEndMinute >= 60) {
      appointmentEndHour = currentHour + 1;
    }

    const formattedStart = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const formattedEnd = `${String(appointmentEndHour).padStart(2, '0')}:${String(appointmentEndMinute % 60).padStart(2, '0')}`;

    slots.push({
      startTime: formattedStart,
      endTime: formattedEnd
    });

    // Move to next 15-minute slot
    currentMinute += 15;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
}

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { doctorId } = params;
    const { searchParams } = new URL(req.url);
    const requestedDate = searchParams.get('date');

    if (!requestedDate) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    const selectedDate = new Date(requestedDate);
    const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' });
    
    const daySchedule = doctor.availability?.find(a => a.day === dayOfWeek);
    if (!daySchedule?.slots?.length) {
      return NextResponse.json({ 
        availableSlots: [],
        message: `No slots available for ${dayOfWeek}`
      });
    }

    // Get all possible 15-minute slots for the day's schedule
    const allTimeSlots = daySchedule.slots.reduce((acc, slot) => {
      const intervalSlots = generateTimeSlots(slot.startTime, slot.endTime);
      return [...acc, ...intervalSlots];
    }, []);

    // Get booked appointments
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId,
      timeSlot: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['cancelled'] }
    });

    // Convert booked appointments to time strings for comparison
    const bookedTimes = bookedAppointments.map(apt => {
      const time = new Date(apt.timeSlot);
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    });

    // Convert time slots to datetime and filter out booked ones
    const availableSlots = allTimeSlots
      .filter(slot => !bookedTimes.includes(slot.startTime))
      .map(slot => {
        const [startHour, startMinute] = slot.startTime.split(':');
        const [endHour, endMinute] = slot.endTime.split(':');
        
        const startDateTime = new Date(requestedDate);
        startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
        
        const endDateTime = new Date(requestedDate);
        endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

        return {
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        };
      });

    return NextResponse.json({
      availableSlots,
      dayOfWeek,
      message: `Found ${availableSlots.length} slots for ${dayOfWeek}`
    });

  } catch (error) {
    console.error('Error in availability endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch availability',
      details: error.message 
    }, { status: 500 });
  }
}
