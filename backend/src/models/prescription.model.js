import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  prescriptionNo: {
    type: String,
    required: true,
    unique: true
  },
  emr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EMR'
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: { type: String, required: true },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  medicines: [{
    name: { type: String, required: true },
    form: {
      type: String,
      default: 'Medicine'
    },
    dosage: { type: String, default: '1 Tab' },
    frequency: { type: String, default: 'Twice daily' },
    anupana: { type: String, default: 'Warm water' },
    timing: {
      type: String,
      default: 'After Food'
    },
    duration: { type: String, default: '7 Days' },
    instructions: { type: String, default: '' }
  }],
  therapies: [{
    name: { type: String, required: true },
    sessions: { type: String, default: '7 Sessions' },
    frequency: { type: String, default: 'Daily (Morning)' },
    duration: { type: String, default: '45 mins' },
    instructions: { type: String, default: '' }
  }],
  services: [{
    name: { type: String, required: true },
    sessions: { type: String, default: '1 Session' },
    frequency: { type: String, default: 'Weekly Review' },
    duration: { type: String, default: '30 mins' },
    instructions: { type: String, default: '' }
  }],
  pathyaApathyaNotes: {
    type: String,
    default: 'Drink boiled warm water. Avoid cold drinks, oily foods, curd at night, and fermented food.'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Prescription', prescriptionSchema);
