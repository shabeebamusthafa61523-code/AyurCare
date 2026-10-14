import mongoose from 'mongoose';

const pharmacyInventorySchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Kashayam',
      'Arishtam / Asavam',
      'Tailam / Thailam',
      'Ghritam',
      'Churnam',
      'Gulika / Vati',
      'Lehyam / Rasayanam',
      'Bhasmam / Pishti',
      'Panchakarma Supplies',
      'Consumables & Linen',
      'General / Other'
    ],
    default: 'Kashayam'
  },
  classicalReference: { type: String, default: 'Sahasrayogam / Ashtanga Hridaya' },
  manufacturer: { type: String, default: 'Kottakkal Arya Vaidya Sala' },
  batchNumber: { type: String, default: 'BATCH-001' },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'Bottles' }, // Bottles, Jars, Strips, Liters, Kg
  minStockLevel: { type: Number, default: 10 },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  expiryDate: { type: Date },
  supplier: { type: String, default: 'Herbal Distributors Ltd.' },
  location: { type: String, default: 'Aushadhi Shala Rack A' }
}, { timestamps: true });

export default mongoose.model('PharmacyInventory', pharmacyInventorySchema);
