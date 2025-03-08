import { NextResponse } from 'next/server';
import dbConnect from "@/app/utils/mongodb";
import Inventory from '@/app/models/InventorySchema';
import * as jose from 'jose';

async function verifyAdminToken(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.role === 'admin';
  } catch (error) {
    return false;
  }
}

// PUT - Update inventory item
export async function PUT(request, { params }) {
  try {
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    // Validate medicine price
    if (data.category === 'Medicine' && (!data.price || data.price <= 0)) {
      return NextResponse.json(
        { error: 'Valid price is required for medicine items' },
        { status: 400 }
      );
    }

    // Update with price handling
    const updateData = {
      ...data,
      price: data.category === 'Medicine' ? parseFloat(data.price) : 0,
      lastUpdated: new Date()
    };

    const updatedItem = await Inventory.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE - Remove inventory item
export async function DELETE(request, { params }) {
  try {
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    await dbConnect();
    const deletedItem = await Inventory.findByIdAndDelete(params.id);

    if (!deletedItem) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}