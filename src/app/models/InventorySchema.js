import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Medicine', 'Equipment', 'Supplies', 'Laboratory'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  minQuantity: {
    type: Number,
    required: [true, 'Minimum quantity is required'],
    min: [0, 'Minimum quantity cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Storage location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    set: v => parseFloat(parseFloat(v).toFixed(2)), // Format price when setting
    get: v => parseFloat(parseFloat(v).toFixed(2)), // Format price when getting
    min: [0, 'Price cannot be negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  initialStock: {
    type: Number,
    required: [true, 'Initial stock is required'],
    min: [0, 'Initial stock cannot be negative']
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Sold quantity cannot be negative']
  },
  sales: [{
    date: {
      type: Date,
      default: Date.now
    },
    quantity: Number,
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  strict: true  // Change back to true
});

// Create indexes for better query performance
inventorySchema.index({ name: 1 });
inventorySchema.index({ category: 1 });

// Virtual field to check if item is low in stock
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minQuantity;
});

// Add virtual for remaining stock
inventorySchema.virtual('currentStock').get(function() {
  return this.quantity;
});

// Add virtual for total revenue
inventorySchema.virtual('totalRevenue').get(function() {
  return this.soldQuantity * this.price;
});

// Add a pre-save middleware to ensure price is always a number
inventorySchema.pre('save', function(next) {
  if (this.price === undefined || this.price === null) {
    this.price = 0;
  }
  this.price = Number(this.price);
  next();
});

// Force price to be included in toJSON
inventorySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.price = Number(ret.price || 0);
    return ret;
  }
});

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export default Inventory;
