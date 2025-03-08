import { NextResponse } from "next/server";
import dbConnect from "@/app/utils/mongodb";
import MedicalRecord from "@/app/models/MedicalRecordSchema";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Inventory from "@/app/models/InventorySchema";

// Helper function to verify admin
const verifyAdmin = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        throw new Error("Unauthorized");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    return decoded;
};

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        await verifyAdmin();

        const { id } = params;
        const data = await req.json();

        // Get old record to compare medications
        const oldRecord = await MedicalRecord.findById(id);
        if (!oldRecord) {
            return NextResponse.json(
                { error: "Record not found" },
                { status: 404 }
            );
        }

        // Track all inventory updates to perform them atomically
        const inventoryUpdates = [];

        // First, return all old medications to inventory
        for (const oldMed of oldRecord.medications) {
            if (oldMed.name && oldMed.quantity) {
                inventoryUpdates.push({
                    name: oldMed.name,
                    quantity: oldMed.quantity // Add back to inventory
                });
            }
        }

        // Then, subtract new medications from inventory
        for (const newMed of data.medications) {
            if (newMed.name && newMed.quantity) {
                const updateIndex = inventoryUpdates.findIndex(update => update.name === newMed.name);
                if (updateIndex !== -1) {
                    inventoryUpdates[updateIndex].quantity -= newMed.quantity;
                } else {
                    inventoryUpdates.push({
                        name: newMed.name,
                        quantity: -newMed.quantity // Subtract from inventory
                    });
                }
            }
        }

        // Verify and update inventory
        for (const update of inventoryUpdates) {
            const inventoryItem = await Inventory.findOne({ name: update.name });
            if (!inventoryItem) {
                return NextResponse.json(
                    { error: `Medicine ${update.name} not found in inventory` },
                    { status: 400 }
                );
            }

            const newQuantity = inventoryItem.quantity + update.quantity;
            if (newQuantity < 0) {
                return NextResponse.json(
                    { error: `Insufficient quantity for ${update.name}` },
                    { status: 400 }
                );
            }

            inventoryItem.quantity = newQuantity;
            await inventoryItem.save();
        }

        // Update the medical record
        const updatedRecord = await MedicalRecord.findByIdAndUpdate(
            id,
            data,
            { new: true }
        ).populate('patientId', 'fullName email');

        return NextResponse.json(updatedRecord);
    } catch (error) {
        console.error("Update medical record error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update medical record" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        await verifyAdmin();

        const { id } = params;
        const deletedRecord = await MedicalRecord.findByIdAndDelete(id);

        if (!deletedRecord) {
            return NextResponse.json(
                { error: "Record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Record deleted successfully" });
    } catch (error) {
        console.error("Delete medical record error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete medical record" },
            { status: error.message === "Unauthorized" ? 401 : 500 }
        );
    }
}
