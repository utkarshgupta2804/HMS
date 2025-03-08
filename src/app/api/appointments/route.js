import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import Appointment from "@/app/models/AppointmentSchema";
import * as jose from 'jose';

async function verifyAuth(req) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    
    const user = await verifyAuth(req);
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    let query = {
      patientId: user._id
    };
    
    if (status && status !== 'all') {
      if (status === 'approved') {
        query.status = { $in: ['approved', 'scheduled'] };
      } else {
        query.status = status;
      }
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        model: 'Doctor',
        select: 'name specialization consultationFee'
      })
      .sort({ timeSlot: -1 });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch appointments',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    
    const user = await verifyAuth(req);
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['doctorId', 'timeSlot', 'reason', 'type'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    const appointmentData = {
      ...data,
      patientId: user._id,
      timeSlot: new Date(data.timeSlot),
      status: 'pending',
      symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
      notes: data.notes || '',
      type: data.type || 'regular'
    };

    const appointment = await Appointment.create(appointmentData);
    await appointment.populate([
      { path: 'patientId', select: 'fullName email phone' },
      { path: 'doctorId', select: 'name specialization' }
    ]);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
