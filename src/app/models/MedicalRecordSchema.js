import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  diagnosis: String,
  treatment: String,
  medications: [{
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    name: String,
    dosage: String,
    duration: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: String,
    price: Number
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  doctorNotes: String,
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    date: Date
  }]
}, {
  timestamps: true
});

// Remove the post-save middleware as we're handling updates in the prescription route

const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
