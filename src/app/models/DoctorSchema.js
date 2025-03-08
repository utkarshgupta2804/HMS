import mongoose from 'mongoose';

// Define schedules without _id
const timeSlotSchema = new mongoose.Schema({
  startTime: String,
  endTime: String
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  slots: [timeSlotSchema]
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: { type: Number, required: true },
  consultationFee: { type: Number, required: true },
  availability: [scheduleSchema], // Changed to array directly
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  ratings: [{
    rating: Number,
    review: String,
    date: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
}, {
  timestamps: true,
  strict: true
});

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
export default Doctor;
