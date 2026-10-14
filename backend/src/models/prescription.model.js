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
      default: 'Kashayam'
    },
    dosage: { type: String, default: '15 ml with 45 ml lukewarm water' },
    frequency: { type: String, default: 'Twice daily' },
    anupana: { type: String, default: 'Lukewarm water' }, // Carrier/Vehicle (Honey, Milk, Ghee, Ginger water)
    timing: {
      type: String,
      default: 'Adhobhakta (After Food)'
    },
    duration: { type: String, default: '15 Days' },
    instructions: { type: String, default: '' }
  }],
  pathyaApathyaNotes: {
    type: String,
    default: 'Drink boiled warm water. Avoid cold drinks, oily foods, curd at night, and fermented food.'
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Prescription', prescriptionSchema);
