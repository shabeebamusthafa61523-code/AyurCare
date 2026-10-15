import mongoose from 'mongoose';

const clinicServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: 'Panchakarma Therapy'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be greater than or equal to 0'],
    default: 500
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    default: '45 mins'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

export default mongoose.model('ClinicService', clinicServiceSchema);
