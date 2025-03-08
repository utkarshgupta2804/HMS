import { NextResponse } from 'next/server';
import dbConnect from "@/app/utils/mongodb";
import SalesRecord from '@/app/models/SalesRecordSchema';
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

export async function GET(request) {
  try {
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get monthly sales data and top items data
    const [monthlySales, topItems] = await Promise.all([
      SalesRecord.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" }
            },
            total: { $sum: "$totalAmount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 6 }
      ]),

      SalesRecord.aggregate([
        {
          $group: {
            _id: '$itemId',
            totalSold: { $sum: '$quantity' },
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        {
          $lookup: {
            from: 'inventories',
            localField: '_id',
            foreignField: '_id',
            as: 'inventoryData'
          }
        },
        {
          $unwind: '$inventoryData'
        },
        {
          $project: {
            name: '$inventoryData.name',
            soldQuantity: '$totalSold',
            initialStock: '$inventoryData.initialStock',
            currentStock: '$inventoryData.quantity',
            price: '$inventoryData.price',
            totalRevenue: 1
          }
        },
        {
          $sort: { totalSold: -1 }
        },
        {
          $limit: 5
        }
      ])
    ]);

    return NextResponse.json({
      monthly: monthlySales.map(item => ({
        month: new Date(2024, item._id.month - 1).toLocaleString('default', { month: 'short' }),
        total: item.total
      })),
      topItems,
      summary: {
        totalRevenue: await SalesRecord.aggregate([
          { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]).then(result => result[0]?.total || 0),
        totalSales: await SalesRecord.countDocuments(),
        averageOrderValue: await SalesRecord.aggregate([
          { $group: { _id: null, avg: { $avg: "$totalAmount" } } }
        ]).then(result => result[0]?.avg || 0)
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
