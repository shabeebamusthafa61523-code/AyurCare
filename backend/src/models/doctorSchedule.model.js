import mongoose from 'mongoose';

const doctorScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  doctorName: { type: String, required: true },
  staffType: {
    type: String,
    enum: ['Vaidya (Ayurvedic Physician)', 'Panchakarma Therapist', 'Ayurvedic Pharmacist', 'Care Coordinator'],
    default: 'Vaidya (Ayurvedic Physician)'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Female'
  },
  qualification: {
    type: String,
    default: 'BAMS, MD (Ayurveda)'
  },
  specialization: { type: String, default: 'Kayachikitsa & Panchakarma' },
  consultationFee: { type: Number, default: 500 },
  honorariumType: {
    type: String,
    enum: ['Percentage', 'FixedPerConsultation', 'MonthlySalary'],
    default: 'Percentage'
  },
  honorariumRate: { type: Number, default: 70 }, // e.g. 70% or 350 INR
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  timeSlots: [{
    type: String
  }],
  status: { type: String, enum: ['Active', 'On Leave'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('DoctorSchedule', doctorScheduleSchema);
