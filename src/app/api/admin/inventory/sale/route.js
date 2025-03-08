import { NextResponse } from 'next/server';
import dbConnect from "@/app/utils/mongodb";
import Inventory from '@/app/models/InventorySchema';
import SalesRecord from '@/app/models/SalesRecordSchema';

export async function POST(request) {
  try {
    await dbConnect();
    const { itemId, quantity, prescriptionId, userId } = await request.json();

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update inventory
      const item = await Inventory.findById(itemId);
      if (!item || item.quantity < quantity) {
        throw new Error('Insufficient stock');
      }

      // Update inventory quantities
      item.quantity -= quantity;
      item.soldQuantity += quantity;
      item.sales.push({
        date: new Date(),
        quantity,
        prescriptionId,
        userId
      });

      await item.save({ session });

      // Create sales record
      const salesRecord = new SalesRecord({
        itemId,
        quantity,
        totalAmount: quantity * item.price,
        prescriptionId,
        userId
      });

      await salesRecord.save({ session });
      await session.commitTransaction();

      return NextResponse.json({
        message: 'Sale recorded successfully',
        updatedStock: item.quantity
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Sale recording error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record sale' },
      { status: 500 }
    );
  }
}
