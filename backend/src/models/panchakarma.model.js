import mongoose from 'mongoose';

const panchakarmaSchema = new mongoose.Schema({
  bookingNo: {
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
  patientPhone: { type: String, default: '' },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorName: { type: String, default: 'Dr. Vaidya' },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  therapistName: { type: String, default: 'Assigned Therapist' },
  therapistGender: {
    type: String,
    enum: ['Male', 'Female', 'Any'],
    default: 'Any'
  },
  therapies: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClinicService' },
    name: { type: String },
    category: { type: String },
    price: { type: Number },
    duration: { type: String }
  }],
  therapyName: {
    type: String,
    required: true,
    default: 'Abhyanga & Swedana (Herbal Oil Massage & Steam)'
  },
  roomOrDroni: {
    type: String,
    default: 'Panchakarma Suite 1 (Droni A)'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  totalSessions: {
    type: Number,
    default: 7
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  timeSlot: {
    type: String,
    default: '08:00 AM - 09:30 AM'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In-Progress', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  packageCost: {
    type: Number,
    default: 7000
  },
  medicatedOilOrKashayam: {
    type: String,
    default: 'Mahanarayana Taila / Ksheerabala 101'
  },
  purvaKarmaNotes: {
    type: String,
    default: 'Pre-check: Check BP, pulse, empty stomach or light food.'
  },
  pradhanaKarmaNotes: {
    type: String,
    default: 'Procedure executed with gentle downward strokes.'
  },
  paschatKarmaNotes: {
    type: String,
    default: 'Post-procedure: Mild Swedana (steam), warm water bath with herbal green gram paste, drink hot boiled jeera water.'
  },
  sessionLogs: [{
    sessionNumber: { type: Number },
    date: { type: Date, default: Date.now },
    therapistName: { type: String },
    vitals: { bp: String, pulse: String },
    observationNotes: { type: String },
    status: { type: String, enum: ['Completed', 'Missed', 'Rescheduled'], default: 'Completed' }
  }]
}, { timestamps: true });

export default mongoose.model('Panchakarma', panchakarmaSchema);
