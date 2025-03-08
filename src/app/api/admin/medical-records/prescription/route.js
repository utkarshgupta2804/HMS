import { NextResponse } from 'next/server';
import dbConnect from "@/app/utils/mongodb";
import MedicalRecord from '@/app/models/MedicalRecordSchema';
import Inventory from '@/app/models/InventorySchema';
import SalesRecord from '@/app/models/SalesRecordSchema';
import mongoose from 'mongoose';

export async function POST(request) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await dbConnect();
    const { patientId, medications, ...recordData } = await request.json();

    // Process and verify medications
    const processedMedications = await Promise.all(medications.map(async (med) => {
      const inventoryItem = await Inventory.findOne({ name: med.name }).session(session);
      
      if (!inventoryItem) {
        throw new Error(`Medication ${med.name} not found in inventory`);
      }

      if (inventoryItem.quantity < med.quantity) {
        throw new Error(`Insufficient stock for ${med.name}. Available: ${inventoryItem.quantity}`);
      }

      // Update inventory
      await Inventory.findByIdAndUpdate(
        inventoryItem._id,
        {
          $inc: { 
            quantity: -med.quantity,
            soldQuantity: med.quantity
          },
          $push: {
            sales: {
              date: new Date(),
              quantity: med.quantity,
              userId: patientId
            }
          }
        },
        { session }
      );

      // Create sales record
      await SalesRecord.create([{
        itemId: inventoryItem._id,
        quantity: med.quantity,
        totalAmount: med.quantity * inventoryItem.price,
        userId: patientId,
        date: new Date()
      }], { session });

      return {
        medicationId: inventoryItem._id,
        name: inventoryItem.name,
        quantity: med.quantity,
        dosage: med.dosage,
        duration: med.duration,
        unit: inventoryItem.unit,
        price: inventoryItem.price
      };
    }));

    // Create medical record
    const medicalRecord = await MedicalRecord.create([{
      patientId,
      ...recordData,
      medications: processedMedications,
      date: new Date()
    }], { session });

    await session.commitTransaction();

    return NextResponse.json({ 
      message: 'Prescription created successfully',
      record: medicalRecord[0]
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Prescription creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create prescription' },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
