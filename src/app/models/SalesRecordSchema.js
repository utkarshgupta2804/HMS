import mongoose from 'mongoose';

const salesRecordSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  totalAmount: {
    type: Number,
    required: true
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const SalesRecord = mongoose.models.SalesRecord || mongoose.model('SalesRecord', salesRecordSchema);
export default SalesRecord;
