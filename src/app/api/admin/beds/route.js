import { NextResponse } from 'next/server';
import dbConnect from "@/app/utils/mongodb";
import Bed from '@/app/models/BedSchema';

export async function GET() {
  try {
    await dbConnect();
    const bedData = await Bed.findOne({});
    
    if (!bedData) {
      const defaultBed = await Bed.create({
        totalBeds: 100,
        availableBeds: 100,
        bedsInUse: 0
      });
      return NextResponse.json(defaultBed);
    }

    return NextResponse.json(bedData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const data = await req.json();
    const { action } = data;

    const currentBeds = await Bed.findOne();
    if (!currentBeds) {
      return NextResponse.json({ error: 'No bed configuration found' }, { status: 404 });
    }

    let update = {};
    if (action === 'occupy') {
      // Check if we have available beds
      if (currentBeds.availableBeds <= 0) {
        return NextResponse.json({ error: 'No beds available' }, { status: 400 });
      }
      update = {
        bedsInUse: currentBeds.bedsInUse + 1,
        availableBeds: currentBeds.availableBeds - 1
      };
    } else if (action === 'release') {
      // Check if there are beds in use
      if (currentBeds.bedsInUse <= 0) {
        return NextResponse.json({ error: 'No beds in use' }, { status: 400 });
      }
      update = {
        bedsInUse: currentBeds.bedsInUse - 1,
        availableBeds: currentBeds.availableBeds + 1
      };
    } else {
      // Handle direct updates from bed management
      update = {
        bedsInUse: data.bedsInUse,
        totalBeds: data.totalBeds
      };
    }

    const updatedBeds = await Bed.findOneAndUpdate(
      {},
      update,
      { new: true }
    );

    return NextResponse.json(updatedBeds);
  } catch (error) {
    console.error('Update beds error:', error);
    return NextResponse.json({ error: 'Failed to update beds' }, { status: 500 });
  }
}
