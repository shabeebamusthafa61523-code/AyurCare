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
    enum: ['Medicine', 'Consumable', 'Equipment', 'Supplies'],
    default: 'Medicine'
  },
  batchNumber: { type: String, default: 'BATCH-001' },
  quantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 10 },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  expiryDate: { type: Date },
  supplier: { type: String, default: 'General Supplier' },
  location: { type: String, default: 'Pharmacy Shelf A' }
}, { timestamps: true });

export default mongoose.model('PharmacyInventory', pharmacyInventorySchema);
