import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import MedicalRecord from "@/app/models/MedicalRecordSchema";
import Inventory from "@/app/models/InventorySchema";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    try {
        await dbConnect();

        // Verify admin authorization
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        
        // Update inventory quantities before creating medical record
        for (const medication of data.medications) {
            if (medication.name && medication.quantity) {
                const inventoryItem = await Inventory.findOne({ name: medication.name });
                if (!inventoryItem) {
                    return NextResponse.json(
                        { error: `Medicine ${medication.name} not found in inventory` },
                        { status: 400 }
                    );
                }
                if (inventoryItem.quantity < medication.quantity) {
                    return NextResponse.json(
                        { error: `Insufficient quantity for ${medication.name}` },
                        { status: 400 }
                    );
                }
                
                // Update inventory quantity
                inventoryItem.quantity -= medication.quantity;
                await inventoryItem.save();
            }
        }

        const medicalRecord = await MedicalRecord.create(data);

        return NextResponse.json({
            message: "Medical record created successfully",
            record: medicalRecord
        });
    } catch (error) {
        console.error("Medical record creation error:", error);
        return NextResponse.json(
            { error: "Failed to create medical record" },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        await dbConnect();

        // Verify admin authorization
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Add search functionality
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const patientId = searchParams.get('patientId');

        let query = {};
        if (search) {
            query = {
                $or: [
                    { type: { $regex: search, $options: 'i' } },
                    { diagnosis: { $regex: search, $options: 'i' } }
                ]
            };
        }
        if (patientId) {
            query.patientId = patientId;
        }

        const records = await MedicalRecord.find(query)
            .populate('patientId', 'fullName email')
            .sort({ date: -1 });

        return NextResponse.json(records);
    } catch (error) {
        console.error("Medical records fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch medical records" },
            { status: 500 }
        );
    }
}
