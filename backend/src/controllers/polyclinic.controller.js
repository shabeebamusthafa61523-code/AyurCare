import Patient from '../models/patient.model.js';
import Appointment from '../models/appointment.model.js';
import EMR from '../models/emr.model.js';
import Prescription from '../models/prescription.model.js';
import Laboratory from '../models/laboratory.model.js';
import PharmacyInventory from '../models/pharmacyInventory.model.js';
import Billing from '../models/billing.model.js';
import FollowUp from '../models/followUp.model.js';
import DoctorSchedule from '../models/doctorSchedule.model.js';
import User from '../models/user.model.js';
import Lead from '../models/lead.model.js';
import Panchakarma from '../models/panchakarma.model.js';

// Seed Initial Ayurvedic Hospital Demo Data
export const seedPolyclinicData = async () => {
  try {
    const panchakarmaCount = await Panchakarma.countDocuments();
    const patientCount = await Patient.countDocuments();

    if (panchakarmaCount === 0 || patientCount === 0) {
      console.log('🌿 Seeding authentic Ayurvedic Hospital & Panchakarma demo data...');
      
      let patients = await Patient.find();
      if (patients.length === 0) {
        patients = await Patient.insertMany([
          {
            patientId: 'PAT-1001',
            name: 'Ramesh Varier',
            phone: '+91 9847012345',
            email: 'ramesh.varier@example.com',
            gender: 'Male',
            age: 48,
            bloodGroup: 'B+',
            address: 'Kottakkal, Malappuram, Kerala',
            prakriti: 'Vata-Kapha',
            vikriti: 'Vata Aggravation (Sandhivata / Osteoarthritis)',
            agni: 'Manda (Sluggish)',
            koshtha: 'Krura (Hard)',
            dietHabit: 'Vegetarian',
            medicalHistory: ['Chronic Bilateral Knee Pain', 'Morning Joint Stiffness', 'Lumbar Discomfort'],
            allergies: ['Dust'],
            notes: 'Advised 14-day Janu Basti & Patra Pinda Sweda course.'
          },
          {
            patientId: 'PAT-1002',
            name: 'Lakshmi Menon',
            phone: '+91 9847198765',
            email: 'lakshmi.menon@example.com',
            gender: 'Female',
            age: 34,
            bloodGroup: 'O+',
            address: 'Round North, Thrissur, Kerala',
            prakriti: 'Pitta-Vata',
            vikriti: 'Pitta Imbalance (Amlapitta & Stress-induced Insomnia)',
            agni: 'Tikshna (Sharp)',
            koshtha: 'Mridu (Soft)',
            dietHabit: 'Vegetarian',
            medicalHistory: ['Hyperacidity / Acid Reflux', 'Disturbed Sleep (Anidra)', 'Tension Headaches'],
            allergies: ['None'],
            notes: 'Advised Shirodhara and Takradhara for cooling Pitta and calming Manas.'
          },
          {
            patientId: 'PAT-1003',
            name: 'Siddharth Nair',
            phone: '+91 9447234567',
            email: 'siddharth.nair@example.com',
            gender: 'Male',
            age: 52,
            bloodGroup: 'A+',
            address: 'Kaloor, Kochi, Kerala',
            prakriti: 'Kapha-Vata',
            vikriti: 'Medo-Dhatvagni Mandya (Sthaulya & Dyslipidemia)',
            agni: 'Manda (Sluggish)',
            koshtha: 'Madhyama (Moderate)',
            dietHabit: 'Non-Vegetarian',
            medicalHistory: ['High Triglycerides', 'Sluggish Metabolism', 'Mild Hypertension'],
            allergies: ['Shellfish'],
            notes: 'Recommended Udvartana (Dry herbal powder massage) and Kashaya Basti.'
          }
        ]);
      }

      // Seed Chief Ayurvedic Physician (Vaidya)
      let vaidyaUser = await User.findOne({ email: 'dr.arya@ayurhospital.com' });
      if (!vaidyaUser) {
        vaidyaUser = await User.create({
          name: 'Dr. Arya Warrier',
          email: 'dr.arya@ayurhospital.com',
          phone: '9847000111',
          password: 'password123',
          role: 'Doctor',
          departmentName: 'Kayachikitsa & Panchakarma'
        });
      }

      // Seed Senior Panchakarma Therapists
      let maleTherapist = await User.findOne({ email: 'therapist.rahul@ayurhospital.com' });
      if (!maleTherapist) {
        maleTherapist = await User.create({
          name: 'Rahul K. (Senior Therapist)',
          email: 'therapist.rahul@ayurhospital.com',
          phone: '9847000222',
          password: 'password123',
          role: 'Staff',
          departmentName: 'Panchakarma Wing'
        });
      }

      let femaleTherapist = await User.findOne({ email: 'therapist.priya@ayurhospital.com' });
      if (!femaleTherapist) {
        femaleTherapist = await User.create({
          name: 'Priya Nair (Senior Therapist)',
          email: 'therapist.priya@ayurhospital.com',
          phone: '9847000333',
          password: 'password123',
          role: 'Staff',
          departmentName: 'Panchakarma Wing'
        });
      }

      // Ensure schedules exist for Vaidya and Therapists
      await DoctorSchedule.deleteMany({});
      await DoctorSchedule.create([
        {
          doctor: vaidyaUser._id,
          doctorName: 'Dr. Arya Warrier (BAMS, MD Ayu)',
          staffType: 'Vaidya (Ayurvedic Physician)',
          gender: 'Female',
          qualification: 'BAMS, MD (Kayachikitsa)',
          specialization: 'Kayachikitsa, Panchakarma & Roga Nidana',
          consultationFee: 500,
          honorariumType: 'Percentage',
          honorariumRate: 75,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          timeSlots: ['09:00 AM - 01:00 PM', '04:00 PM - 07:30 PM']
        },
        {
          doctor: maleTherapist._id,
          doctorName: 'Rahul K. (Lead Male Therapist)',
          staffType: 'Panchakarma Therapist',
          gender: 'Male',
          qualification: 'Diploma in Ayurveda Panchakarma Therapy (DAPT)',
          specialization: 'Abhyanga, Kizhi, Pizhichil & Basti Procedures',
          consultationFee: 0,
          honorariumType: 'MonthlySalary',
          honorariumRate: 0,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          timeSlots: ['07:30 AM - 12:30 PM', '03:00 PM - 06:30 PM']
        },
        {
          doctor: femaleTherapist._id,
          doctorName: 'Priya Nair (Lead Female Therapist)',
          staffType: 'Panchakarma Therapist',
          gender: 'Female',
          qualification: 'Diploma in Ayurveda Nursing & Panchakarma (DAPN)',
          specialization: 'Shirodhara, Mukhalepam, Njavarakizhi & Swedana',
          consultationFee: 0,
          honorariumType: 'MonthlySalary',
          honorariumRate: 0,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          timeSlots: ['07:30 AM - 12:30 PM', '03:00 PM - 06:30 PM']
        }
      ]);

      // Seed Aushadhi Shala (Herbal Dispensary Inventory)
      const existingMeds = await PharmacyInventory.countDocuments();
      if (existingMeds < 5) {
        await PharmacyInventory.insertMany([
          {
            itemCode: 'KASH-101',
            name: 'Maharasnadi Kashayam (450ml)',
            category: 'Kashayam',
            classicalReference: 'Sahasrayogam',
            manufacturer: 'Kottakkal Arya Vaidya Sala',
            batchNumber: 'MRK-2026',
            quantity: 45,
            unit: 'Bottles',
            minStockLevel: 10,
            purchasePrice: 180,
            sellingPrice: 240,
            expiryDate: new Date('2028-06-30'),
            supplier: 'AVS Kottakkal Depot',
            location: 'Rack A - Kashaya Shala'
          },
          {
            itemCode: 'ARIS-201',
            name: 'Dasamoolarishtam (450ml)',
            category: 'Arishtam / Asavam',
            classicalReference: 'Bhaishajya Ratnavali',
            manufacturer: 'Vaidyaratnam Oushadhasala',
            batchNumber: 'DAR-2026',
            quantity: 60,
            unit: 'Bottles',
            minStockLevel: 15,
            purchasePrice: 160,
            sellingPrice: 220,
            expiryDate: new Date('2031-12-31'),
            supplier: 'Vaidyaratnam Agency',
            location: 'Rack B - Asava Section'
          },
          {
            itemCode: 'TAIL-301',
            name: 'Mahanarayana Thailam (200ml)',
            category: 'Tailam / Thailam',
            classicalReference: 'Bhaishajya Ratnavali',
            manufacturer: 'Kottakkal Arya Vaidya Sala',
            batchNumber: 'MNT-2026',
            quantity: 35,
            unit: 'Bottles',
            minStockLevel: 8,
            purchasePrice: 210,
            sellingPrice: 280,
            expiryDate: new Date('2029-04-15'),
            supplier: 'AVS Kottakkal Depot',
            location: 'Rack C - Taila Section'
          },
          {
            itemCode: 'TAIL-302',
            name: 'Ksheerabala 101 Avarthana (10ml Drop)',
            category: 'Tailam / Thailam',
            classicalReference: 'Ashtanga Hridaya',
            manufacturer: 'AVP Coimbatore',
            batchNumber: 'KSH-101',
            quantity: 8,
            unit: 'Bottles',
            minStockLevel: 10,
            purchasePrice: 190,
            sellingPrice: 260,
            expiryDate: new Date('2028-11-20'),
            supplier: 'AVP Depot',
            location: 'Rack C - Taila Section'
          },
          {
            itemCode: 'CHUR-401',
            name: 'Triphala Churnam (100g)',
            category: 'Churnam',
            classicalReference: 'Charaka Samhita',
            manufacturer: 'Kerala Ayurveda Ltd.',
            batchNumber: 'TPC-2026',
            quantity: 75,
            unit: 'Jars',
            minStockLevel: 20,
            purchasePrice: 85,
            sellingPrice: 130,
            expiryDate: new Date('2028-09-10'),
            supplier: 'Kerala Ayurveda Direct',
            location: 'Rack D - Churna Section'
          },
          {
            itemCode: 'GULI-501',
            name: 'Yogaraj Guggulu (100 Tabs)',
            category: 'Gulika / Vati',
            classicalReference: 'Bhaishajya Ratnavali',
            manufacturer: 'Dhootapapeshwar',
            batchNumber: 'YRG-2026',
            quantity: 50,
            unit: 'Bottles',
            minStockLevel: 12,
            purchasePrice: 220,
            sellingPrice: 310,
            expiryDate: new Date('2029-01-30'),
            supplier: 'National Ayurvedic Distributors',
            location: 'Rack E - Vati Shala'
          },
          {
            itemCode: 'GHRI-601',
            name: 'Brahmi Ghritam (150g)',
            category: 'Ghritam',
            classicalReference: 'Ashtanga Hridaya',
            manufacturer: 'Kottakkal Arya Vaidya Sala',
            batchNumber: 'BRG-2026',
            quantity: 24,
            unit: 'Jars',
            minStockLevel: 6,
            purchasePrice: 280,
            sellingPrice: 375,
            expiryDate: new Date('2028-08-30'),
            supplier: 'AVS Kottakkal Depot',
            location: 'Rack F - Ghrita Section'
          },
          {
            itemCode: 'LEHY-701',
            name: 'Chyawanprash Rasayanam (500g)',
            category: 'Lehyam / Rasayanam',
            classicalReference: 'Charaka Samhita',
            manufacturer: 'Kottakkal Arya Vaidya Sala',
            batchNumber: 'CWP-2026',
            quantity: 40,
            unit: 'Jars',
            minStockLevel: 10,
            purchasePrice: 240,
            sellingPrice: 330,
            expiryDate: new Date('2028-12-31'),
            supplier: 'AVS Kottakkal Depot',
            location: 'Rack G - Lehya Section'
          },
          {
            itemCode: 'PK-SUP-801',
            name: 'Panchakarma Medicated Sesame Oil (5L Bulk Can)',
            category: 'Panchakarma Supplies',
            classicalReference: 'Ayurvedic Pharmacopoeia',
            manufacturer: 'Herbal Pharmacy Lab',
            batchNumber: 'SES-5L',
            quantity: 6,
            unit: 'Cans',
            minStockLevel: 8,
            purchasePrice: 1800,
            sellingPrice: 2400,
            expiryDate: new Date('2028-10-15'),
            supplier: 'Panchakarma Essentials',
            location: 'Panchakarma Store Room'
          }
        ]);
      }

      // Seed Panchakarma Therapy Bookings
      await Panchakarma.create([
        {
          bookingNo: 'PK-1001',
          patient: patients[0]._id,
          patientName: patients[0].name,
          patientPhone: patients[0].phone,
          doctor: vaidyaUser._id,
          doctorName: 'Dr. Arya Warrier (BAMS, MD)',
          therapist: maleTherapist._id,
          therapistName: 'Rahul K. (Male Therapist)',
          therapistGender: 'Male',
          therapyName: 'Janu Basti (Medicated Oil Retention on Knee)',
          roomOrDroni: 'Panchakarma Suite 1 (Droni A)',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          totalSessions: 14,
          completedSessions: 3,
          timeSlot: '08:00 AM - 09:15 AM',
          status: 'In-Progress',
          packageCost: 12500,
          medicatedOilOrKashayam: 'Mahanarayana Thailam & Ksheerabala 101',
          purvaKarmaNotes: 'Pre-check: Knee joint localized Snehana (gentle oleation) with warm oil and Nadi Sweda.',
          pradhanaKarmaNotes: 'Gram flour ring placed firmly around bilateral patella. Warm Mahanarayana oil poured and retained at 40°C for 35 mins.',
          paschatKarmaNotes: 'Oil removed, mild herbal patra pinda sweda applied. Advised warm water bath after 1 hour and zero cold exposure.',
          sessionLogs: [
            { sessionNumber: 1, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), therapistName: 'Rahul K.', vitals: { bp: '124/82', pulse: '74' }, observationNotes: 'Patient felt initial relief in stiffness.', status: 'Completed' },
            { sessionNumber: 2, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), therapistName: 'Rahul K.', vitals: { bp: '120/80', pulse: '72' }, observationNotes: 'Flexion improved without acute crepitus.', status: 'Completed' },
            { sessionNumber: 3, date: new Date(), therapistName: 'Rahul K.', vitals: { bp: '122/80', pulse: '76' }, observationNotes: 'Tolerated warmth comfortably. Swelling noticeably reduced.', status: 'Completed' }
          ]
        },
        {
          bookingNo: 'PK-1002',
          patient: patients[1]._id,
          patientName: patients[1].name,
          patientPhone: patients[1].phone,
          doctor: vaidyaUser._id,
          doctorName: 'Dr. Arya Warrier (BAMS, MD)',
          therapist: femaleTherapist._id,
          therapistName: 'Priya Nair (Female Therapist)',
          therapistGender: 'Female',
          therapyName: 'Shirodhara (Continuous Medicated Oil Pouring)',
          roomOrDroni: 'Shirodhara Quiet Chamber',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalSessions: 7,
          completedSessions: 1,
          timeSlot: '09:30 AM - 10:45 AM',
          status: 'In-Progress',
          packageCost: 8400,
          medicatedOilOrKashayam: 'Ksheerabala Tailam & Brahmi Ghritam',
          purvaKarmaNotes: 'Pre-procedure: Mild head massage (Shiro Abhyanga) for 10 mins. Eyes covered with rose water pads.',
          pradhanaKarmaNotes: 'Lukewarm Ksheerabala taila poured in rhythmic oscillations onto the forehead (Ajna Chakra) for 40 minutes.',
          paschatKarmaNotes: 'Towel wiped, patient rested in quiet room for 20 mins. Advised warm water sip and early evening sleep.',
          sessionLogs: [
            { sessionNumber: 1, date: new Date(), therapistName: 'Priya Nair', vitals: { bp: '118/76', pulse: '70' }, observationNotes: 'Deep relaxation induced. Patient reported calm mental state.', status: 'Completed' }
          ]
        }
      ]);

      // Seed Doctor Appointment
      const today = new Date();
      const appointment = await Appointment.create({
        appointmentNo: 'APT-1001',
        patient: patients[0]._id,
        patientName: patients[0].name,
        patientPhone: patients[0].phone,
        doctor: vaidyaUser._id,
        doctorName: 'Dr. Arya Warrier (BAMS, MD)',
        specialization: 'Kayachikitsa & Panchakarma',
        department: 'Ayurvedic OP',
        appointmentType: 'Doctor Consultation',
        date: today,
        timeSlot: '10:00 AM - 10:30 AM',
        status: 'Checked-In',
        tokenNumber: 1,
        consultationFee: 500
      });

      // Seed Ayurvedic EMR with Ashtavidha Pariksha & Prakriti
      const emr = await EMR.create({
        patient: patients[0]._id,
        appointment: appointment._id,
        doctor: vaidyaUser._id,
        doctorName: 'Dr. Arya Warrier (BAMS, MD)',
        symptoms: 'Bilateral knee stiffness, pain aggravated during morning and cold weather, crackling sound on walking.',
        vitals: { bp: '124/82', pulse: '72', temp: '98.4 F', weight: '74 kg', spo2: '99%' },
        diagnosis: 'Sandhivata (Bilateral Knee Osteoarthritis)',
        rogaNidana: 'Sandhivata (Janu Sandhigata Vata)',
        dushyaDhatu: 'Asthi & Majja Dhatu Dushti, Vata Prakopa',
        prakriti: 'Vata-Kapha',
        vikriti: 'Vata Aggravation with Kapha Kshaya',
        agni: 'Manda (Low/Sluggish)',
        koshtha: 'Krura (Hard/Constipated)',
        amaStatus: 'Niraama (Toxin Free)',
        ashtavidhaPariksha: {
          nadi: 'Sarpa Gati / Vata Pradhana (Irregular, quick pulse)',
          mutra: 'Prakrita (Clear straw yellow, no burning)',
          mala: 'Vibandha (Occasional dry hard stool, incomplete evacuation)',
          jihva: 'Niraama (Pink, slightly dry, minimal coating)',
          shabda: 'Prakrita (Clear voice)',
          sparsha: 'Sheeta / Ruksha (Cold and dry to touch around knees)',
          drik: 'Prakrita (Clear vision)',
          akriti: 'Madhyama (Moderate physique)'
        },
        chikitsaType: 'Combined (Shamana + Shodhana)',
        treatmentPlan: '14-Day Janu Basti + Internal Shamana Aushadhis (Maharasnadi + Yogaraj Guggulu).',
        panchakarmaTherapies: [
          { therapyName: 'Janu Basti (Medicated Oil Retention on Knee)', days: 14, instructions: 'Bilateral knee application with warm Mahanarayana taila.' },
          { therapyName: 'Patra Pinda Sweda (Elakizhi)', days: 7, instructions: 'Apply after Janu Basti for deep tissue soothing.' }
        ],
        pathyaApathya: {
          pathyaAhara: 'Warm cooked barley, boiled moong dal, ginger tea, warm cow milk with a pinch of turmeric, cow ghee.',
          apathyaAhara: 'Cold water, refrigerated leftovers, curd/yogurt at night, raw salads, excessive dry foods, chickpeas.',
          pathyaVihara: 'Gentle knee flexing exercises, sunbath for 20 mins, oil massage before bath, early sleep.',
          apathyaVihara: 'Squatting, continuous prolonged standing, direct AC exposure onto knees, staying awake late.'
        },
        consultationNotes: 'Patient advised to strictly observe Pathya Ahara and complete the 14-day Janu Basti course.',
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      });

      // Seed Ayurvedic Prescription
      await Prescription.create({
        prescriptionNo: 'RX-1001',
        emr: emr._id,
        patient: patients[0]._id,
        patientName: patients[0].name,
        doctor: vaidyaUser._id,
        doctorName: 'Dr. Arya Warrier (BAMS, MD)',
        medicines: [
          {
            name: 'Maharasnadi Kashayam',
            form: 'Kashayam',
            dosage: '15 ml mixed with 45 ml boiled lukewarm water',
            frequency: 'Twice daily',
            anupana: 'Lukewarm water',
            timing: 'Pragbhakta (Before Food)',
            duration: '15 Days',
            instructions: 'Drink on an empty stomach in the morning and 30 mins before dinner.'
          },
          {
            name: 'Yogaraj Guggulu',
            form: 'Gulika / Vati',
            dosage: '2 Tablets',
            frequency: 'Twice daily',
            anupana: 'Warm water or with Maharasnadi Kashayam',
            timing: 'Adhobhakta (After Food)',
            duration: '15 Days',
            instructions: 'Take after breakfast and after dinner.'
          },
          {
            name: 'Mahanarayana Thailam',
            form: 'Tailam / Thailam',
            dosage: 'Sufficient quantity for gentle external massage',
            frequency: 'Once daily (Morning)',
            anupana: 'External Application',
            timing: 'External Application',
            duration: '30 Days',
            instructions: 'Warm the oil in a water bath, apply gently over knees, followed by hot fomentation.'
          }
        ],
        pathyaApathyaNotes: 'Drink boiled warm water throughout the day. Avoid curd, sour curries, and cold beverages.',
        notes: 'Review in OP clinic after 14 days of Janu Basti therapy.'
      });

      // Seed Invoices
      await Billing.create({
        invoiceNo: 'INV-1001',
        patient: patients[0]._id,
        patientName: patients[0].name,
        appointment: appointment._id,
        items: [
          { description: 'Vaidya Ayurvedic Consultation (Kayachikitsa)', category: 'Consultation', qty: 1, unitPrice: 500, amount: 500 },
          { description: 'Janu Basti Therapy Package (14 Sessions)', category: 'Therapy Package', qty: 1, unitPrice: 12500, amount: 12500 },
          { description: 'Maharasnadi Kashayam & Yogaraj Guggulu (Aushadhi)', category: 'Aushadhi / Pharmacy', qty: 1, unitPrice: 550, amount: 550 }
        ],
        totalAmount: 13550,
        discount: 550,
        tax: 0,
        netAmount: 13000,
        paidAmount: 13000,
        pendingAmount: 0,
        status: 'Paid',
        paymentMode: 'UPI'
      });

      // Seed Follow-up
      await FollowUp.create({
        patient: patients[0]._id,
        patientName: patients[0].name,
        patientPhone: patients[0].phone,
        doctor: vaidyaUser._id,
        doctorName: 'Dr. Arya Warrier (BAMS, MD)',
        appointment: appointment._id,
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        purpose: 'Post-Panchakarma (Janu Basti) Assessment & Joint Mobility Review',
        status: 'Pending'
      });

      console.log('✅ Authentic Ayurvedic Hospital demo data successfully seeded!');
    }
  } catch (err) {
    console.error('⚠️ Ayurvedic Hospital seeding notice:', err.message);
  }
};

// 1. Dashboard Overview Stats
export const getPolyclinicDashboard = async (req, res) => {
  try {
    await seedPolyclinicData();

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const totalPatients = await Patient.countDocuments();
    const todayAppointments = await Appointment.countDocuments({ date: { $gte: todayStart, $lte: todayEnd } });
    const waitingQueue = await Appointment.countDocuments({ status: 'Checked-In' });
    const inConsultation = await Appointment.countDocuments({ status: 'In-Consultation' });
    const completedToday = await Appointment.countDocuments({ status: 'Completed', date: { $gte: todayStart, $lte: todayEnd } });
    
    // Panchakarma Therapy Stats
    const activePanchakarma = await Panchakarma.countDocuments({ status: { $in: ['Scheduled', 'In-Progress'] } });
    const completedTherapies = await Panchakarma.countDocuments({ status: 'Completed' });
    const recentPanchakarma = await Panchakarma.find().sort({ createdAt: -1 }).limit(5);

    // Revenue calculations
    const todayInvoices = await Billing.find({ date: { $gte: todayStart, $lte: todayEnd } });
    const todayRevenue = todayInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);

    const allInvoices = await Billing.find({});
    const totalRevenue = allInvoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const pendingPayments = allInvoices.reduce((acc, inv) => acc + (inv.pendingAmount || 0), 0);

    // Inventory Alerts
    const allItems = await PharmacyInventory.find({});
    const lowStockItems = allItems.filter(item => item.quantity <= item.minStockLevel);
    
    // Low stock count
    const lowStockCount = lowStockItems.length;

    // Doctor & Staff schedules
    const doctorSchedules = await DoctorSchedule.find({}).populate('doctor', 'name email phone');

    const payload = {
      success: true,
      stats: {
        totalPatients,
        todayAppointments,
        waitingQueue,
        inConsultation,
        completedToday,
        activePanchakarma,
        completedTherapies,
        todayRevenue,
        totalRevenue,
        pendingPayments,
        lowStockCount
      },
      recentPanchakarma,
      lowStockItems,
      doctors: doctorSchedules
    };
    payload.data = { ...payload };
    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Patient Management
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({ success: true, patients, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    if (!req.body.name || !req.body.phone) {
      return res.status(400).json({ success: false, message: 'Patient name and phone number are required.' });
    }
    const count = await Patient.countDocuments();
    const patientId = req.body.patientId || `PAT-${Date.now().toString().slice(-4)}${count + 1}`;
    const patient = await Patient.create({ ...req.body, patientId });
    res.status(201).json({ success: true, patient, data: patient });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    const appointments = await Appointment.find({ patient: req.params.id }).sort({ date: -1 });
    const emrs = await EMR.find({ patient: req.params.id }).sort({ createdAt: -1 });
    const prescriptions = await Prescription.find({ patient: req.params.id }).sort({ createdAt: -1 });
    const panchakarma = await Panchakarma.find({ patient: req.params.id }).sort({ createdAt: -1 });
    const labTests = await Laboratory.find({ patient: req.params.id }).sort({ createdAt: -1 });
    const bills = await Billing.find({ patient: req.params.id }).sort({ createdAt: -1 });
    const followUps = await FollowUp.find({ patient: req.params.id }).sort({ followUpDate: -1 });

    res.json({
      success: true,
      patient,
      data: patient,
      history: {
        appointments,
        emrs,
        prescriptions,
        panchakarma,
        labTests,
        bills,
        followUps
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Appointments & Queue Management
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: -1, tokenNumber: 1 });
    res.json({ success: true, appointments, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const patientId = req.body.patient || req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient reference is required to schedule an appointment.' });
    }

    let patientName = req.body.patientName;
    let patientPhone = req.body.patientPhone;

    const p = await Patient.findById(patientId);
    if (p) {
      if (!patientName) patientName = p.name;
      if (!patientPhone) patientPhone = p.phone;
    }

    let doctorId = req.body.doctor || req.body.doctorId;
    let doctorName = req.body.doctorName;
    if (!doctorId) {
      const defaultDoc = await User.findOne({ role: { $in: ['Doctor', '1', '2', 'superadmin'] } });
      if (defaultDoc) {
        doctorId = defaultDoc._id;
        if (!doctorName) doctorName = defaultDoc.name;
      }
    }
    if (!doctorName) doctorName = 'Dr. Arya Warrier (BAMS, MD)';

    const date = req.body.date || req.body.appointmentDate || new Date();
    const timeSlot = req.body.timeSlot || req.body.appointmentTime || '09:30 AM - 10:00 AM';

    // Check if patient already has an active/open appointment (Scheduled, Checked-In, In-Consultation)
    const activeQuery = [];
    if (patientId) {
      activeQuery.push({ patient: patientId });
    }
    if (patientPhone) {
      activeQuery.push({ patientPhone });
    }

    if (activeQuery.length > 0) {
      const existingActive = await Appointment.findOne({
        $or: activeQuery,
        status: { $in: ['Scheduled', 'Checked-In', 'In-Consultation'] }
      });

      if (existingActive) {
        return res.status(400).json({
          success: false,
          message: `Patient "${patientName || 'this patient'}" already has an active appointment (${existingActive.appointmentNo} - Status: ${existingActive.status}). A patient cannot book more than one active appointment at a time.`
        });
      }
    }

    const count = await Appointment.countDocuments();
    const appointmentNo = `APT-${Date.now().toString().slice(-4)}${count + 1}`;
    
    // Auto calculate token number for the date
    const dateStart = new Date(date);
    dateStart.setHours(0,0,0,0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23,59,59,999);
    
    const todayCount = await Appointment.countDocuments({ date: { $gte: dateStart, $lte: dateEnd } });
    const tokenNumber = todayCount + 1;

    const appointment = await Appointment.create({
      ...req.body,
      patient: patientId,
      doctor: doctorId,
      doctorName,
      date,
      timeSlot,
      appointmentNo,
      tokenNumber,
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || ''
    });

    res.status(201).json({ success: true, appointment, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateFields = { status };
    if (status === 'Checked-In') updateFields.checkInTime = new Date();
    if (status === 'In-Consultation') updateFields.consultationStartTime = new Date();
    if (status === 'Completed') updateFields.consultationEndTime = new Date();

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json({ success: true, appointment, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 4. Doctor Consultation (EMR)
export const getEmrRecords = async (req, res) => {
  try {
    const emrs = await EMR.find().populate('patient').sort({ createdAt: -1 });
    res.json({ success: true, emrs, data: emrs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEmrRecord = async (req, res) => {
  try {
    const patientId = req.body.patient || req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient reference is required to create an EMR record.' });
    }

    let doctorId = req.body.doctor || req.body.doctorId || req.user?._id;
    let doctorName = req.body.doctorName;

    if (!doctorId && req.body.appointment) {
      const appt = await Appointment.findById(req.body.appointment);
      if (appt && appt.doctor) {
        doctorId = appt.doctor;
        if (!doctorName) doctorName = appt.doctorName;
      }
    }

    if (!doctorId) {
      const docUser = await User.findOne({ role: { $in: ['Doctor', '1', '2', 'superadmin'] } });
      if (docUser) {
        doctorId = docUser._id;
        if (!doctorName) doctorName = docUser.name;
      }
    }

    const emrData = {
      ...req.body,
      patient: patientId,
      ...(doctorId ? { doctor: doctorId } : {}),
      doctorName: doctorName || 'Dr. Arya Warrier (BAMS, MD)'
    };

    const emr = await EMR.create(emrData);
    
    // Update appointment status to Completed if appointment ID provided
    if (req.body.appointment) {
      await Appointment.findByIdAndUpdate(req.body.appointment, { status: 'Completed', consultationEndTime: new Date() });
    }

    // Auto create follow-up reminder if followUpDate is specified
    if (req.body.followUpDate) {
      const patient = await Patient.findById(patientId);
      if (patient) {
        await FollowUp.create({
          patient: patient._id,
          patientName: patient.name,
          patientPhone: patient.phone,
          doctor: doctorId,
          doctorName: doctorName || 'Dr. Arya Warrier (BAMS, MD)',
          appointment: req.body.appointment,
          followUpDate: req.body.followUpDate,
          purpose: 'Scheduled Consultation Follow-up'
        });
      }
    }

    res.status(201).json({ success: true, emr, data: emr });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 5. Prescriptions
export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    res.json({ success: true, prescriptions, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const patientId = req.body.patient || req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient reference is required to issue a prescription.' });
    }

    let patientName = req.body.patientName;
    if (!patientName) {
      const p = await Patient.findById(patientId);
      if (p) patientName = p.name;
    }
    if (!patientName) patientName = 'Patient';

    let doctorId = req.body.doctor || req.body.doctorId || req.user?._id;
    let doctorName = req.body.doctorName;

    if (!doctorId) {
      const docUser = await User.findOne({ role: { $in: ['Doctor', '1', '2', 'superadmin'] } });
      if (docUser) {
        doctorId = docUser._id;
        if (!doctorName) doctorName = docUser.name;
      }
    }

    const count = await Prescription.countDocuments();
    const prescriptionNo = `RX-${Date.now().toString().slice(-4)}${count + 1}`;
    const prescription = await Prescription.create({
      ...req.body,
      patient: patientId,
      patientName,
      ...(doctorId ? { doctor: doctorId } : {}),
      doctorName: doctorName || 'Dr. Arya Warrier (BAMS, MD)',
      prescriptionNo
    });
    res.status(201).json({ success: true, prescription, data: prescription });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 6. Laboratory & Diagnostic Management
export const getLabTests = async (req, res) => {
  try {
    const labTests = await Laboratory.find().sort({ createdAt: -1 });
    res.json({ success: true, labTests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLabTest = async (req, res) => {
  try {
    const count = await Laboratory.countDocuments();
    const labTestNo = `LAB-${1001 + count}`;
    const labTest = await Laboratory.create({ ...req.body, labTestNo });
    res.status(201).json({ success: true, labTest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateLabTest = async (req, res) => {
  try {
    const labTest = await Laboratory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, labTest });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 7. Pharmacy & Inventory
export const getPharmacyItems = async (req, res) => {
  try {
    const items = await PharmacyInventory.find().sort({ name: 1 });
    res.json({ success: true, items, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPharmacyItem = async (req, res) => {
  try {
    const name = req.body.name || req.body.itemName;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Medicine name is required.' });
    }
    const count = await PharmacyInventory.countDocuments();
    const prefix = (req.body.category || 'MED').substring(0, 3).toUpperCase();
    const itemCode = req.body.itemCode || `${prefix}-${Date.now().toString().slice(-4)}${count + 1}`;

    const item = await PharmacyInventory.create({
      ...req.body,
      name,
      itemCode
    });
    res.status(201).json({ success: true, item, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePharmacyItem = async (req, res) => {
  try {
    const item = await PharmacyInventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, item, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 8. Billing & Invoicing
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Billing.find().sort({ createdAt: -1 });
    res.json({ success: true, invoices, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const patientId = req.body.patient || req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient reference is required to generate an invoice.' });
    }

    let patientName = req.body.patientName;
    if (!patientName) {
      const p = await Patient.findById(patientId);
      if (p) patientName = p.name;
    }

    const count = await Billing.countDocuments();
    const invoiceNo = `INV-${Date.now().toString().slice(-4)}${count + 1}`;
    
    let totalAmount = 0;
    const items = (req.body.items || []).map(item => {
      const amount = (item.qty || 1) * (item.unitPrice || 0);
      totalAmount += amount;
      return { ...item, amount };
    });

    const discount = req.body.discount || 0;
    const tax = req.body.tax || 0;
    const netAmount = totalAmount - discount + tax;
    const paidAmount = req.body.paidAmount !== undefined ? req.body.paidAmount : netAmount;
    const pendingAmount = Math.max(0, netAmount - paidAmount);
    const status = pendingAmount <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partially Paid' : 'Pending');

    const invoice = await Billing.create({
      ...req.body,
      patient: patientId,
      patientName: patientName || 'Patient',
      invoiceNo,
      items,
      totalAmount,
      netAmount,
      paidAmount,
      pendingAmount,
      status
    });

    res.status(201).json({ success: true, invoice, data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 9. Doctors & Staff Schedules
export const getDoctorSchedules = async (req, res) => {
  try {
    const doctors = await DoctorSchedule.find().populate('doctor');
    res.json({ success: true, doctors, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDoctorSchedule = async (req, res) => {
  try {
    const doc = await DoctorSchedule.create(req.body);
    res.status(201).json({ success: true, doctor: doc, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateDoctorSchedule = async (req, res) => {
  try {
    const doc = await DoctorSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, doctor: doc, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 10. Patient Follow-ups
export const getFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.find().sort({ followUpDate: 1 });
    res.json({ success: true, followUps, data: followUps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.create(req.body);
    res.status(201).json({ success: true, followUp, data: followUp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, followUp, data: followUp });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteFollowUp = async (req, res) => {
  try {
    await FollowUp.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Follow-up record removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 11. Panchakarma Therapy Management
export const getPanchakarmaBookings = async (req, res) => {
  try {
    const bookings = await Panchakarma.find()
      .populate('patient')
      .populate('doctor')
      .populate('therapist')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPanchakarmaBooking = async (req, res) => {
  try {
    const patientId = req.body.patient || req.body.patientId;
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient reference is required to schedule a Panchakarma booking.' });
    }

    let patientName = req.body.patientName;
    let patientPhone = req.body.patientPhone;
    if (!patientName || !patientPhone) {
      const p = await Patient.findById(patientId);
      if (p) {
        if (!patientName) patientName = p.name;
        if (!patientPhone) patientPhone = p.phone;
      }
    }

    let status = req.body.status || 'Scheduled';
    if (status === 'In Progress') status = 'In-Progress';

    const count = await Panchakarma.countDocuments();
    const bookingNo = `PK-${Date.now().toString().slice(-4)}${count + 1}`;
    const booking = await Panchakarma.create({
      ...req.body,
      patient: patientId,
      patientName: patientName || 'Patient',
      patientPhone: patientPhone || '',
      status,
      bookingNo
    });
    res.status(201).json({ success: true, booking, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePanchakarmaBooking = async (req, res) => {
  try {
    const booking = await Panchakarma.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const logPanchakarmaSession = async (req, res) => {
  try {
    const booking = await Panchakarma.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Panchakarma booking not found' });
    }
    const sessionNumber = (booking.completedSessions || 0) + 1;
    const newSession = {
      sessionNumber,
      date: req.body.date || new Date(),
      therapistName: req.body.therapistName || booking.therapistName,
      vitals: req.body.vitals || { bp: '120/80', pulse: '74' },
      observationNotes: req.body.observationNotes || 'Procedure completed smoothly.',
      status: req.body.status || 'Completed'
    };
    booking.sessionLogs.push(newSession);
    booking.completedSessions = sessionNumber;
    if (booking.completedSessions >= booking.totalSessions) {
      booking.status = 'Completed';
    } else {
      booking.status = 'In-Progress';
    }
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deletePanchakarmaBooking = async (req, res) => {
  try {
    await Panchakarma.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Panchakarma booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

