import { NextResponse } from 'next/server';
import Bed from '@/app/models/BedSchema';
import dbConnect from '@/app/utils/mongodb';

export async function GET() {
    try {
        await dbConnect();
        const bedStats = await Bed.findOne();
        
        if (!bedStats) {
            return NextResponse.json(
                { error: 'No bed statistics found' },
                { status: 404 }
            );
        }

        return NextResponse.json(bedStats);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch bed statistics' },
            { status: 500 }
        );
    }
}
