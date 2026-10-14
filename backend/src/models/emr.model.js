import mongoose from 'mongoose';

const emrSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorName: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  symptoms: { type: String, default: '' },
  vitals: {
    bp: { type: String, default: '' },
    pulse: { type: String, default: '' },
    temp: { type: String, default: '' },
    weight: { type: String, default: '' },
    spo2: { type: String, default: '' }
  },
  allergies: { type: String, default: '' },
  medicalHistory: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  rogaNidana: { type: String, default: '' }, // Ayurvedic Clinical Diagnosis (e.g. Sandhivata, Amavata)
  dushyaDhatu: { type: String, default: '' }, // Involved Dhatus (Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra)
  
  // Ayurvedic Rogi Pariksha
  prakriti: { type: String, default: 'Vata-Pitta' },
  vikriti: { type: String, default: 'Vata Aggravation' },
  agni: {
    type: String,
    enum: ['Manda (Low/Sluggish)', 'Tikshna (Sharp/High)', 'Vishama (Irregular)', 'Sama (Balanced)'],
    default: 'Sama (Balanced)'
  },
  koshtha: {
    type: String,
    enum: ['Krura (Hard/Constipated)', 'Mridu (Soft/Loose)', 'Madhyama (Regular)'],
    default: 'Madhyama (Regular)'
  },
  amaStatus: {
    type: String,
    enum: ['Saama (With Toxins)', 'Niraama (Toxin Free)'],
    default: 'Niraama (Toxin Free)'
  },

  // Ashtavidha Pariksha (Eight-Fold Clinical Examination)
  ashtavidhaPariksha: {
    nadi: { type: String, default: 'Vata-Pitta Gati (Regular)' },
    mutra: { type: String, default: 'Prakrita (Normal, clear straw)' },
    mala: { type: String, default: 'Prakrita (Formed, regular)' },
    jihva: { type: String, default: 'Niraama (Clean, pink)' },
    shabda: { type: String, default: 'Spashta (Clear & steady)' },
    sparsha: { type: String, default: 'Samashitoshna (Normal temperature, soft)' },
    drik: { type: String, default: 'Prakrita (Clear sclera, bright)' },
    akriti: { type: String, default: 'Madhyama (Moderate build)' }
  },

  treatmentPlan: { type: String, default: '' },
  chikitsaType: {
    type: String,
    enum: ['Shamana (Palliative / Internal Aushadhi)', 'Shodhana (Panchakarma / Detoxification)', 'Combined (Shamana + Shodhana)'],
    default: 'Combined (Shamana + Shodhana)'
  },

  // Panchakarma Prescriptions
  panchakarmaTherapies: [{
    therapyName: { type: String },
    days: { type: Number, default: 7 },
    instructions: { type: String }
  }],

  // Pathya & Apathya (Diet & Lifestyle Guidance)
  pathyaApathya: {
    pathyaAhara: { type: String, default: 'Warm water, freshly cooked light meals, moong dal soup, ghee.' },
    apathyaAhara: { type: String, default: 'Cold drinks, sour/fermented foods, bakery items, deep fried items.' },
    pathyaVihara: { type: String, default: 'Daily gentle walking, Pranayama, sleep before 10:30 PM.' },
    apathyaVihara: { type: String, default: 'Daytime sleep, late night awakening, direct cold wind exposure.' }
  },

  consultationNotes: { type: String, default: '' },
  followUpDate: { type: Date },
  attachments: [{
    name: { type: String },
    url: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('EMR', emrSchema);
