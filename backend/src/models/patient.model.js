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
  prakriti: {
    type: String,
    enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridosha / Sama', 'Unknown'],
    default: 'Unknown'
  },
  vikriti: {
    type: String,
    default: ''
  },
  agni: {
    type: String,
    enum: ['Manda (Sluggish)', 'Tikshna (Sharp)', 'Vishama (Irregular)', 'Sama (Balanced)', 'Unknown'],
    default: 'Unknown'
  },
  koshtha: {
    type: String,
    enum: ['Krura (Hard)', 'Mridu (Soft)', 'Madhyama (Moderate)', 'Unknown'],
    default: 'Unknown'
  },
  dietHabit: {
    type: String,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'],
    default: 'Vegetarian'
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
