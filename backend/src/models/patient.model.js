import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  age: {
    type: Number,
    required: true
  },
  dob: {
    type: Date
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'],
    default: 'Unknown'
  },
  address: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  medicalHistory: [{
    type: String
  }],
  allergies: [{
    type: String
  }],
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Appointment Scheduled', 'Visited', 'Converted', 'Follow-up Required', 'Active', 'Inactive'],
    default: 'New'
  }
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
