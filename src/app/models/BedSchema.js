const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    totalBeds: {
        type: Number,
        required: true,
        min: 0
    },
    availableBeds: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                return v <= this.totalBeds;
            },
            message: 'Available beds cannot exceed total beds'
        }
    },
    bedsInUse: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

// Add pre-save middleware to ensure consistency
bedSchema.pre('save', function(next) {
    this.availableBeds = this.totalBeds - this.bedsInUse;
    next();
});

module.exports = mongoose.models.Bed || mongoose.model('Bed', bedSchema);
