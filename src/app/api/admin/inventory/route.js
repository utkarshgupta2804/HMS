import { NextResponse } from 'next/server';
import dbConnect from "@/app/utils/mongodb";
import Inventory from '@/app/models/InventorySchema';
import * as jose from 'jose';

// Helper function to verify admin token
async function verifyAdminToken(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return false;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    // Verify if the user is an admin
    return payload.role === 'admin';
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// GET - Fetch all inventory items
export async function GET(request) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Add category filter
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const query = category ? { category } : {};
    const items = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

// POST - Create new inventory item
export async function POST(request) {
  try {
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();
    
    // Format price properly
    const itemData = {
      ...data,
      price: parseFloat(parseFloat(data.price).toFixed(2)), // Ensure proper price format
      lastUpdated: new Date()
    };

    console.log('Processed data:', itemData);

    const newItem = new Inventory(itemData);
    const savedItem = await newItem.save();

    return NextResponse.json(savedItem, { status: 201 });
  } catch (error) {
    console.error('Full error:', error); // Enhanced error logging
    return NextResponse.json(
      { error: error.message || 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
