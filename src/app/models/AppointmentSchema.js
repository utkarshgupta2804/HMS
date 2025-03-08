import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: false
  },
  timeSlot: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'cancelled', 'completed'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  },
  notes: String,
  symptoms: {
    type: [String],
    default: []
  },
  type: {
    type: String,
    required: true,
    default: 'regular'
  }
}, {
  timestamps: true
});

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
