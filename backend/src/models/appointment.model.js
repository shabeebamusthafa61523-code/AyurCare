import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentNo: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: { type: String, required: true },
  specialization: { type: String, default: 'General Medicine' },
  department: { type: String, default: 'Consultation' },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: {
    type: String,
    enum: ['Scheduled', 'Checked-In', 'In-Consultation', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  tokenNumber: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  checkInTime: { type: Date },
  consultationStartTime: { type: Date },
  consultationEndTime: { type: Date }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
