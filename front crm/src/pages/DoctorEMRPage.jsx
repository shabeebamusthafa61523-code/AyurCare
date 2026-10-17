import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  FileText, 
  User, 
  Activity, 
  Plus, 
  CheckCircle2, 
  Save, 
  Calendar,
  Sparkles,
  Droplet,
  Flame,
  Wind,
  HeartPulse,
  Leaf,
  Apple,
  ShieldAlert,
  Table,
  Search,
  PenTool,
  Edit2,
  Trash2,
  X,
  Pill,
  Zap,
  ArrowRight,
  Clock,
  Printer
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const AYURVEDIC_TEMPLATES = [
  {
    id: 'sandhivata',
    icon: '🦴',
    label: 'Sandhivata (Joint Pain / Osteoarthritis)',
    shortLabel: 'Sandhivata (Joint Pain)',
    color: 'emerald',
    data: {
      rogaNidana: 'Sandhivata (Osteoarthritis / Degenerative Joint Disorder)',
      dushyaDhatu: 'Asthi & Majja Dhatu, Vata Prakopa, Sandhigata Vata',
      prakriti: 'Vata-Kapha',
      vikriti: 'Severe Vata Aggravation with Mild Avarana',
      agni: 'Manda (Sluggish)',
      koshtha: 'Krura (Hard)',
      amaStatus: 'Niraama (Toxin Free)',
      chikitsaType: 'Combined (Shamana + Shodhana)',
      treatmentPlan: '14-day Janu Basti & Patra Pinda Sweda course alongside classical Shamana Aushadhis (Dhanwantharam Kashayam, Yogaraja Guggulu, Sahacharadi Tailam external application).',
      pathyaApathya: {
        pathyaAhara: 'Warm freshly cooked foods, barley/moong soup, cow ghee, warm spiced milk with dry ginger.',
        apathyaAhara: 'Cold refrigerated items, raw cabbage, sprouts, sour yogurt at night, deep-fried snacks.',
        pathyaVihara: 'Gentle non-weight bearing movement, warm sunlight exposure, early bedtime.',
        apathyaVihara: 'Excessive stair climbing, prolonged standing, direct exposure to cold drafts or AC.'
      },
      consultationNotes: 'Advised strict adherence to warm water consumption and knee support during ambulation.'
    }
  },
  {
    id: 'amlapitta',
    icon: '🔥',
    label: 'Amlapitta (Hyperacidity / GERD)',
    shortLabel: 'Amlapitta (Acidity / GERD)',
    color: 'amber',
    data: {
      rogaNidana: 'Urdhvaga Amlapitta (Hyperacidity & Acid Reflux)',
      dushyaDhatu: 'Rasa & Rakta Dhatu, Pitta Prakopa with Vidagdha Ajirna',
      prakriti: 'Pitta-Vata',
      vikriti: 'Sharp Pitta Aggravation with Ushna-Tikshna Guna',
      agni: 'Tikshna (Sharp/Irregular)',
      koshtha: 'Mridu (Soft)',
      amaStatus: 'Saama (Toxic Accumulation)',
      chikitsaType: 'Shamana (Palliative)',
      treatmentPlan: 'Shamana Chikitsa with Pitta-Samana Aushadhis (Avipattikar Churna, Kamadudha Rasa, Shatavari Ghritam). Advised Takradhara if stress-induced.',
      pathyaApathya: {
        pathyaAhara: 'Puffed rice (Laja Manda), boiled barley water, pomegranate, soaked raisins, coconut water, cow milk.',
        apathyaAhara: 'Chili, fermented/spicy gravies, tomato, vinegar, oily snacks, tea/coffee on empty stomach.',
        pathyaVihara: 'Calm peaceful environment, regular meal timings, Shitali Pranayama.',
        apathyaVihara: 'Anger, prolonged fasting, skipping meals, sleeping immediately after meals.'
      },
      consultationNotes: 'Patient advised to avoid late dinners and maintain 2-hour gap between meal and sleep.'
    }
  },
  {
    id: 'prameha',
    icon: '🌾',
    label: 'Prameha (Metabolic / Diabetes)',
    shortLabel: 'Prameha (Metabolic Care)',
    color: 'blue',
    data: {
      rogaNidana: 'Kaphaja Prameha / Madhumeha (Metabolic Disorder)',
      dushyaDhatu: 'Medas, Kleda, Mamsa & Rakta Dhatu, Kapha-Vata',
      prakriti: 'Kapha-Pitta',
      vikriti: 'Kapha & Medo-Dhatvagni Mandya with Srotorodha',
      agni: 'Manda (Sluggish)',
      koshtha: 'Madhyama (Regular)',
      amaStatus: 'Saama (Toxic Accumulation)',
      chikitsaType: 'Combined (Shamana + Shodhana)',
      treatmentPlan: 'Apatarpana Chikitsa: Nishakathakadi Kashayam, Chandraprabha Vati, Lodhrasavam. Recommended Udvartana (Dry herbal massage) course.',
      pathyaApathya: {
        pathyaAhara: 'Barley (Yava), horse gram soup, bitter gourd (Karela), methi seeds water, green gram.',
        apathyaAhara: 'Sweets, refined carbs/maida, bananas, potatoes, curd, day sleep, excess rice.',
        pathyaVihara: 'Brisk morning walking (45 mins), Surya Namaskar, active physical routine.',
        apathyaVihara: 'Sedentary habits, sleeping during the day (Diva Swapna), overeating.'
      },
      consultationNotes: 'Advised daily FBS & PPBS log and periodic follow-up after 30 days.'
    }
  },
  {
    id: 'anidra',
    icon: '🧠',
    label: 'Anidra & Chinta (Insomnia & Stress)',
    shortLabel: 'Anidra (Insomnia & Stress)',
    color: 'purple',
    data: {
      rogaNidana: 'Anidra & Chittodwega (Chronic Insomnia & Neuro-stress)',
      dushyaDhatu: 'Manovaha Srotas, Prana & Vyana Vata, Tarpaka Kapha Kshaya',
      prakriti: 'Vata-Pitta',
      vikriti: 'Vata Aggravation affecting Manas and Hridaya',
      agni: 'Vishama (Irregular)',
      koshtha: 'Madhyama (Regular)',
      amaStatus: 'Niraama (Toxin Free)',
      chikitsaType: 'Combined (Shamana + Shodhana)',
      treatmentPlan: 'Shirodhara with Ksheerabala Tailam alongside Ashwagandharishta, Brahmi Vati, and Padabhyanga at bedtime.',
      pathyaApathya: {
        pathyaAhara: 'Warm cow milk with nutmeg & cardamom at night, almonds, freshly cooked rice with ghee.',
        apathyaAhara: 'Caffeine, energy drinks, pungent spicy food at night, dry snacks.',
        pathyaVihara: 'Warm foot massage with sesame oil before bed, digital detox 1 hr before sleep, meditation.',
        apathyaVihara: 'Night vigil (Ratri Jagarana), screen time in bed, excessive worrying.'
      },
      consultationNotes: 'Recommended 7-day Shirodhara course in Panchakarma Wing.'
    }
  },
  {
    id: 'gridhrasi',
    icon: '⚡',
    label: 'Gridhrasi & Katishoola (Sciatica & Lumbar Pain)',
    shortLabel: 'Gridhrasi (Sciatica / Back Pain)',
    color: 'rose',
    data: {
      rogaNidana: 'Gridhrasi (Sciatica / Lumbar Radiculopathy)',
      dushyaDhatu: 'Kandara, Snayu, Asthi & Majja Dhatu, Vata-Kapha',
      prakriti: 'Vata-Kapha',
      vikriti: 'Vata Aggravation in Kati & Sphik radiating down the leg',
      agni: 'Manda (Sluggish)',
      koshtha: 'Krura (Hard)',
      amaStatus: 'Niraama (Toxin Free)',
      chikitsaType: 'Combined (Shamana + Shodhana)',
      treatmentPlan: 'Kati Basti with Mahanarayana Tailam, Patra Pinda Sweda, Rasnasaptakam Kashayam & Trayodashanga Guggulu.',
      pathyaApathya: {
        pathyaAhara: 'Warm light soups, garlic milk (Lashuna Ksheerapaka), drumstick soup, warm water.',
        apathyaAhara: 'Heavy legumes, cold breeze, raw salads, cold drinks.',
        pathyaVihara: 'Use firm mattress, lumbar support while sitting, gentle spinal stretches after warm fomentation.',
        apathyaVihara: 'Bending forward with weights, prolonged bike rides on rough roads, jerky movements.'
      },
      consultationNotes: 'Advised strict avoidance of heavy lifting and prescribed 7-day Kati Basti course.'
    }
  }
];

export default function DoctorEMRPage() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emrs, setEmrs] = useState([]);
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ayurvedic'); // 'ayurvedic' | 'vitals' | 'pathya'
  const [editingEmrId, setEditingEmrId] = useState(null);

  // Fast Prescription Modal inside EMR
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxForm, setRxForm] = useState({
    patient: '',
    patientName: '',
    doctorName: 'Dr. Arya Warrier (BAMS, MD)',
    diagnosis: '',
    medicines: [
      { name: '', dosage: '1 Tab / 15ml', frequency: 'Twice daily (After Food)', timing: 'After Food', duration: '14 Days', quantity: 1, anupana: 'Boiled warm water' }
    ],
    therapies: [],
    pathyaApathyaNotes: ''
  });
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {}
  });

  // Active Ayurvedic EMR Consultation Form State
  const [formData, setFormData] = useState({
    patient: '',
    patientName: '',
    appointment: '',
    doctorName: 'Dr. Arya Warrier (BAMS, MD)',
    symptoms: '',
    vitals: { bp: '120/80', pulse: '74', temp: '98.4 F', weight: '70 kg', spo2: '99%' },
    allergies: '',
    medicalHistory: '',
    diagnosis: '',
    rogaNidana: 'Sandhivata (Osteoarthritis)',
    dushyaDhatu: 'Asthi & Majja Dhatu, Vata Prakopa',
    
    // Ayurvedic Rogi Pariksha
    prakriti: 'Vata-Pitta',
    vikriti: 'Vata Aggravation with Mild Pitta',
    agni: 'Sama (Balanced)',
    koshtha: 'Madhyama (Regular)',
    amaStatus: 'Niraama (Toxin Free)',
    
    // Ashtavidha Pariksha
    ashtavidhaPariksha: {
      nadi: 'Sarpa Gati / Vata Pradhana (Quick, irregular)',
      mutra: 'Prakrita (Clear straw yellow)',
      mala: 'Prakrita (Regular, formed)',
      jihva: 'Niraama (Pink, clean)',
      shabda: 'Spashta (Clear & steady voice)',
      sparsha: 'Samashitoshna (Normal temperature)',
      drik: 'Prakrita (Clear sclera)',
      akriti: 'Madhyama (Moderate physique)'
    },

    chikitsaType: 'Combined (Shamana + Shodhana)',
    treatmentPlan: 'Prescribed 14-day Janu Basti & Patra Pinda Sweda alongside classical Shamana Aushadhis.',
    
    // Pathya - Apathya Guidance
    pathyaApathya: {
      pathyaAhara: 'Warm water, freshly boiled moong soup, barley, warm cow milk with a pinch of turmeric, cow ghee.',
      apathyaAhara: 'Cold refrigerated items, curd at night, sour/fermented foods, raw cabbage, deep-fried snacks.',
      pathyaVihara: 'Gentle warm oil application, early morning sunbath (15 mins), sleep before 10:30 PM.',
      apathyaVihara: 'Direct exposure to cold breeze / AC, staying awake late (Ratri Jagarana), daytime sleeping (Diva Swapna).'
    },

    consultationNotes: 'Patient advised to strictly adhere to warm water consumption and follow-up after therapy course.',
    followUpDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patRes, apptRes, emrRes, pharmRes] = await Promise.all([
        polyclinicService.getPatients(),
        polyclinicService.getAppointments(),
        polyclinicService.getEmrRecords(),
        polyclinicService.getPharmacyItems()
      ]);

      if (patRes.success) setPatients(patRes.patients || []);
      if (emrRes.success) setEmrs(emrRes.emrs || []);
      if (pharmRes && pharmRes.success) setPharmacyItems(pharmRes.items || []);

      if (apptRes.success) {
        setAppointments(apptRes.appointments || []);
        const activeAppt = apptRes.appointments.find(a => a.status === 'In-Consultation' || a.status === 'Checked-In');
        if (activeAppt) {
          setFormData(prev => ({
            ...prev,
            patient: activeAppt.patient?._id || activeAppt.patient,
            patientName: activeAppt.patientName,
            appointment: activeAppt._id,
            doctor: activeAppt.doctor?._id || activeAppt.doctor,
            doctorName: activeAppt.doctorName || 'Dr. Arya Warrier (BAMS, MD)'
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (tpl) => {
    setFormData(prev => ({
      ...prev,
      rogaNidana: tpl.data.rogaNidana,
      dushyaDhatu: tpl.data.dushyaDhatu,
      prakriti: tpl.data.prakriti,
      vikriti: tpl.data.vikriti,
      agni: tpl.data.agni,
      koshtha: tpl.data.koshtha,
      amaStatus: tpl.data.amaStatus,
      chikitsaType: tpl.data.chikitsaType,
      treatmentPlan: tpl.data.treatmentPlan,
      pathyaApathya: { ...tpl.data.pathyaApathya },
      consultationNotes: tpl.data.consultationNotes
    }));
  };

  const handlePatientSelect = (patientId) => {
    const selected = patients.find(p => p._id === patientId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        patient: selected._id,
        patientName: selected.name,
        prakriti: selected.prakriti || 'Vata-Pitta',
        allergies: (selected.allergies || []).join(', '),
        medicalHistory: (selected.medicalHistory || []).join(', ')
      }));
    }
  };

  const handleCancelEdit = () => {
    setEditingEmrId(null);
    setFormData({
      patient: '',
      patientName: '',
      appointment: '',
      doctorName: 'Dr. Arya Warrier (BAMS, MD)',
      symptoms: '',
      vitals: { bp: '120/80', pulse: '74', temp: '98.4 F', weight: '70 kg', spo2: '99%' },
      allergies: '',
      medicalHistory: '',
      diagnosis: '',
      rogaNidana: 'Sandhivata (Osteoarthritis)',
      dushyaDhatu: 'Asthi & Majja Dhatu, Vata Prakopa',
      prakriti: 'Vata-Pitta',
      vikriti: 'Vata Aggravation with Mild Pitta',
      agni: 'Sama (Balanced)',
      koshtha: 'Madhyama (Regular)',
      amaStatus: 'Niraama (Toxin Free)',
      ashtavidhaPariksha: {
        nadi: 'Sarpa Gati / Vata Pradhana (Quick, irregular)',
        mutra: 'Prakrita (Clear straw yellow)',
        mala: 'Prakrita (Regular, formed)',
        jihva: 'Niraama (Clean, pink)',
        shabda: 'Prakrita (Clear & steady)',
        sparsha: 'Samashitoshna (Normal temp)',
        drik: 'Prakrita (Clear)',
        akriti: 'Madhyama (Moderate)'
      },
      chikitsaType: 'Combined (Shamana + Shodhana)',
      treatmentPlan: '',
      pathyaApathya: {
        pathyaAhara: 'Warm cooked barley, boiled vegetables, ginger tea, cow ghee.',
        apathyaAhara: 'Cold refrigerated items, dry snacks, curd at night, deep-fried food.',
        pathyaVihara: 'Morning gentle walking, 10 min Nadi Shodhana Pranayama.',
        apathyaVihara: 'Day sleep, night vigil, exposure to strong cold air.'
      },
      consultationNotes: '',
      followUpDate: ''
    });
  };

  const requestSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient) {
      alert('Please select a patient first.');
      return;
    }

    const isEditing = Boolean(editingEmrId);

    setConfirmModal({
      isOpen: true,
      title: isEditing ? `Update Doctor Consultation EMR` : `Save Ayurvedic Consultation EMR`,
      message: isEditing
        ? `Update Rogi Pariksha & clinical consultation record for ${formData.patientName || 'Patient'} (${formData.rogaNidana || 'EMR'})?`
        : `Save Rogi Pariksha & clinical consultation record for ${formData.patientName} (${formData.rogaNidana})?`,
      confirmText: isEditing ? `Update Consultation` : `Save EMR Record`,
      variant: 'success',
      onConfirm: async () => {
        try {
          const res = isEditing
            ? await polyclinicService.updateEmrRecord(editingEmrId, formData)
            : await polyclinicService.createEmrRecord(formData);
          if (res.success) {
            handleCancelEdit();
            fetchData();
            setViewMode('table');
          }
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        }
      }
    });
  };

  const handleSaveAndPrescribe = async () => {
    if (!formData.patient) {
      alert('Please select a patient first.');
      return;
    }

    try {
      const isEditing = Boolean(editingEmrId);
      const res = isEditing
        ? await polyclinicService.updateEmrRecord(editingEmrId, formData)
        : await polyclinicService.createEmrRecord(formData);

      if (res.success) {
        setRxForm({
          patient: formData.patient,
          patientName: formData.patientName,
          doctorName: formData.doctorName || 'Dr. Arya Warrier (BAMS, MD)',
          diagnosis: formData.rogaNidana || formData.diagnosis || '',
          medicines: [
            { name: '', dosage: '1 Tab / 15ml', frequency: 'Twice daily (After Food)', timing: 'After Food', duration: '14 Days', quantity: 1, anupana: 'Boiled warm water' }
          ],
          therapies: (formData.treatmentPlan || '').toLowerCase().includes('basti') || (formData.treatmentPlan || '').toLowerCase().includes('sweda') || (formData.treatmentPlan || '').toLowerCase().includes('dhara')
            ? [{ name: 'Ayurvedic Therapy Course', sessions: '7 Sessions', frequency: 'Daily (Morning)', duration: '45 mins' }]
            : [],
          pathyaApathyaNotes: formData.pathyaApathya?.pathyaAhara
            ? `Pathya (Recommended): ${formData.pathyaApathya.pathyaAhara} | Apathya (Avoid): ${formData.pathyaApathya.apathyaAhara || ''}`
            : 'Drink boiled warm water. Avoid cold & refrigerated items.'
        });
        setShowRxModal(true);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving consultation');
    }
  };

  const handleCreateFastPrescription = async (dispenseNow = false) => {
    if (!rxForm.patient) {
      alert('Patient reference missing.');
      return;
    }
    const validMeds = (rxForm.medicines || []).filter(m => m.name && m.name.trim());
    if (validMeds.length === 0 && (rxForm.therapies || []).length === 0) {
      alert('Please enter at least one medicine or therapy.');
      return;
    }

    try {
      setIsSubmittingRx(true);
      const payload = {
        patient: rxForm.patient,
        patientName: rxForm.patientName,
        doctorName: rxForm.doctorName,
        diagnosis: rxForm.diagnosis,
        medicines: validMeds,
        therapies: rxForm.therapies,
        pathyaApathyaNotes: rxForm.pathyaApathyaNotes
      };

      const res = await polyclinicService.createPrescription(payload);
      if (res.success) {
        const createdRx = res.prescription;
        if (dispenseNow && createdRx?._id) {
          try {
            await polyclinicService.dispensePrescription(createdRx._id);
          } catch (dispErr) {
            console.error('Dispense error:', dispErr);
          }
        }
        setShowRxModal(false);
        setConfirmModal({
          isOpen: true,
          title: 'Prescription Issued Successfully',
          message: `Prescription ${createdRx?.prescriptionNo || ''} has been created for ${rxForm.patientName}${dispenseNow ? ' and sent to pharmacy (stock deducted & added to bill).' : '.'}`,
          confirmText: 'Done',
          variant: 'success',
          onConfirm: () => {
            handleCancelEdit();
            fetchData();
            setViewMode('table');
          }
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to issue prescription');
    } finally {
      setIsSubmittingRx(false);
    }
  };

  const handleLoadEmrIntoForm = (item) => {
    setEditingEmrId(item._id);
    setFormData({
      patient: item.patient?._id || item.patient || '',
      patientName: item.patient?.name || item.patientName || '',
      appointment: item.appointment || '',
      doctorName: item.doctorName || 'Dr. Arya Warrier (BAMS, MD)',
      symptoms: item.symptoms || '',
      vitals: item.vitals || { bp: '120/80', pulse: '74', temp: '98.4 F', weight: '70 kg', spo2: '99%' },
      allergies: item.allergies || '',
      medicalHistory: item.medicalHistory || '',
      diagnosis: item.diagnosis || '',
      rogaNidana: item.rogaNidana || '',
      dushyaDhatu: item.dushyaDhatu || '',
      prakriti: item.prakriti || 'Vata-Pitta',
      vikriti: item.vikriti || '',
      agni: item.agni || 'Sama (Balanced)',
      koshtha: item.koshtha || 'Madhyama (Regular)',
      amaStatus: item.amaStatus || 'Niraama (Toxin Free)',
      ashtavidhaPariksha: item.ashtavidhaPariksha || {},
      chikitsaType: item.chikitsaType || 'Shamana (Palliative)',
      treatmentPlan: item.treatmentPlan || '',
      pathyaApathya: item.pathyaApathya || { pathyaAhara: '', apathyaAhara: '', pathyaVihara: '', apathyaVihara: '' },
      consultationNotes: item.consultationNotes || '',
      followUpDate: item.followUpDate ? item.followUpDate.split('T')[0] : ''
    });
    setViewMode('form');
  };

  const handleDeleteEmr = (item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete EMR Consultation Record',
      message: `Are you sure you want to delete the consultation record for ${item.patient?.name || item.patientName || 'patient'}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await polyclinicService.deleteEmrRecord(item._id);
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || err.message || 'Failed to delete record');
        }
      }
    });
  };

  const filteredEmrs = emrs.filter(e => {
    const term = searchTerm.toLowerCase();
    const patName = (e.patient?.name || e.patientName || '').toLowerCase();
    const docName = (e.doctorName || '').toLowerCase();
    const roga = (e.rogaNidana || e.diagnosis || '').toLowerCase();
    const sym = (e.symptoms || '').toLowerCase();
    return patName.includes(term) || docName.includes(term) || roga.includes(term) || sym.includes(term);
  });

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Vaidya Clinical Consultation
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" /> Ayurvedic EMR & Rogi Pariksha Suite
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            Comprehensive Tridosha Prakriti & Vikriti profiling, Ashtavidha Pariksha (Nadi, Jihva, etc.), Agni/Kostha/Ama analysis, Roga Nidana, and Pathya-Apathya guidance.
          </p>
        </div>

        <button
          onClick={() => {
            if (viewMode === 'table') {
              handleCancelEdit();
              setViewMode('form');
            } else {
              setViewMode('table');
            }
          }}
          className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg transition text-xs whitespace-nowrap self-start sm:self-auto"
        >
          {viewMode === 'table' ? (
            <>
              <Plus className="w-4 h-4" /> Start New Consultation
            </>
          ) : (
            <>
              <Table className="w-4 h-4" /> View Consultations Table
            </>
          )}
        </button>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, doctor, diagnosis, symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800 self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Table View
          </button>
          <button
            onClick={() => setViewMode('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'form'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Consultation Form
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* EMR Table View */
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          {filteredEmrs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Consultation Records Found</h3>
              <p className="mt-1">Perform Ashtavidha Pariksha and save your first Ayurvedic EMR record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Consultation Date</th>
                    <th className="py-3 px-4">Patient Details</th>
                    <th className="py-3 px-4">Attending Vaidya</th>
                    <th className="py-3 px-4">Prakriti & Dosha</th>
                    <th className="py-3 px-4">Roga Nidana / Diagnosis</th>
                    <th className="py-3 px-4">Nadi Pariksha</th>
                    <th className="py-3 px-4">Treatment Plan</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredEmrs.map((item) => (
                    <tr key={item._id} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {item.patient?.name || item.patientName || 'Patient'}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.patient?.phone || 'No phone'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.doctorName || 'Dr. Arya Warrier'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.prakriti ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {item.prakriti}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Vata-Pitta</span>
                        )}
                      </td>
                      <td className="py-3 px-4 min-w-[180px]">
                        <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                          {item.rogaNidana || item.diagnosis || 'Clinical Review'}
                        </span>
                        {item.symptoms && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block max-w-xs mt-0.5">
                            {item.symptoms}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 min-w-[160px]">
                        <span className="text-[11px] text-slate-700 dark:text-slate-300">
                          {item.ashtavidhaPariksha?.nadi || 'Prakrita (Balanced)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 min-w-[200px]">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate block max-w-xs">
                          {item.treatmentPlan || item.chikitsaType || 'Prescription & Lifestyle'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleLoadEmrIntoForm(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 font-bold text-xs transition"
                            title="Open in Consultation Editor"
                          >
                            <FileText className="w-3.5 h-3.5" /> View
                          </button>

                          {/* Hidden Edit & Delete on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                            <button
                              onClick={() => handleLoadEmrIntoForm(item)}
                              className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60 transition"
                              title="Edit Consultation EMR"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmr(item)}
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition"
                              title="Delete EMR Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                {editingEmrId ? 'Update Doctor Consultation EMR' : 'Rogi Pariksha & Clinical Record'}
              </h2>
              {editingEmrId && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Editing record for {formData.patientName || 'Selected Patient'}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('ayurvedic')}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'ayurvedic' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Tridosha & Ashtavidha
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vitals')}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'vitals' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Vitals & Complaints
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pathya')}
                className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'pathya' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Pathya - Apathya
              </button>
            </div>
          </div>

          {editingEmrId && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" />
                <span>You are currently updating Doctor Consultation EMR for <strong>{formData.patientName || 'Patient'}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 shadow-xs"
              >
                <X className="w-3.5 h-3.5" /> Cancel / Start New
              </button>
            </div>
          )}

          <form onSubmit={requestSubmit} className="space-y-5">
            {/* Patient Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
              <select
                value={formData.patient}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-semibold"
                required
              >
                <option value="">-- Choose Patient for Clinical Consultation --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.phone}) - {p.patientId} | Prakriti: {p.prakriti || 'Vata-Pitta'}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Ayurvedic Clinical Templates */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Quick Clinical Presets (1-Click Pariksha &amp; Protocol)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Autofills diagnosis, dosha &amp; pathya</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {AYURVEDIC_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300/80 dark:border-emerald-700/80 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-200 text-xs font-bold whitespace-nowrap shadow-xs transition active:scale-95"
                    title={`Apply protocol for ${tpl.label}`}
                  >
                    <span>{tpl.icon}</span>
                    <span>{tpl.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: AYURVEDIC DOSHA & ASHTAVIDHA PARIKSHA */}
            {activeTab === 'ayurvedic' && (
              <div className="space-y-4">
                {/* Prakriti & Agni Section */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-2xl space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Tridosha Prakriti, Agni & Kostha
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Prakriti (Constitution)</label>
                      <select
                        value={formData.prakriti}
                        onChange={(e) => setFormData({ ...formData, prakriti: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      >
                        {['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridosha / Sama'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Agni Status (Digestive Fire)</label>
                      <select
                        value={formData.agni}
                        onChange={(e) => setFormData({ ...formData, agni: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      >
                        {['Manda (Low/Sluggish)', 'Tikshna (Sharp/High)', 'Vishama (Irregular)', 'Sama (Balanced)'].map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Koshtha (Bowel Habit)</label>
                      <select
                        value={formData.koshtha}
                        onChange={(e) => setFormData({ ...formData, koshtha: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      >
                        {['Krura (Hard/Constipated)', 'Mridu (Soft/Loose)', 'Madhyama (Regular)'].map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Ama Status (Metabolic Endotoxins)</label>
                      <select
                        value={formData.amaStatus}
                        onChange={(e) => setFormData({ ...formData, amaStatus: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="Niraama (Toxin Free)">Niraama (Toxin Free / Clear)</option>
                        <option value="Saama (With Toxins)">Saama (Toxin Present / Sluggish)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Vikriti (Current Imbalance)</label>
                      <input
                        type="text"
                        value={formData.vikriti}
                        onChange={(e) => setFormData({ ...formData, vikriti: e.target.value })}
                        placeholder="e.g. Vata Prakopa with Kapha Kshaya"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Ashtavidha Pariksha */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600" /> Ashtavidha Pariksha (Eight-Fold Clinical Examination)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">1. Nadi (Pulse Diagnosis)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.nadi}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, nadi: e.target.value }
                        })}
                        placeholder="e.g. Sarpa Gati (Vata), Manduka (Pitta), Hamsa (Kapha)"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">2. Jihva (Tongue Examination)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.jihva}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, jihva: e.target.value }
                        })}
                        placeholder="e.g. Niraama (Clean pink), Saama (White coated), Dry"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">3. Mutra (Urine Examination)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.mutra}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, mutra: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">4. Mala (Stool Examination)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.mala}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, mala: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">5. Sparsha (Touch / Skin Texture)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.sparsha}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, sparsha: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">6. Shabda (Voice & Speech)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.shabda}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, shabda: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">7. Drik / Netra (Eyes & Vision)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.drik}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, drik: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">8. Akriti (Build & Posture)</label>
                      <input
                        type="text"
                        value={formData.ashtavidhaPariksha.akriti}
                        onChange={(e) => setFormData({
                          ...formData,
                          ashtavidhaPariksha: { ...formData.ashtavidhaPariksha, akriti: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Roga Nidana & Treatment Line */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Roga Nidana (Ayurvedic Diagnosis) *</label>
                    <input
                      type="text"
                      required
                      value={formData.rogaNidana}
                      onChange={(e) => setFormData({ ...formData, rogaNidana: e.target.value, diagnosis: e.target.value })}
                      placeholder="e.g. Sandhivata, Amavata, Amlapitta, Kushta"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dushya / Involved Dhatus</label>
                    <input
                      type="text"
                      value={formData.dushyaDhatu}
                      onChange={(e) => setFormData({ ...formData, dushyaDhatu: e.target.value })}
                      placeholder="e.g. Asthi, Majja, Rasa, Rakta"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Chikitsa Line & Treatment Plan</label>
                  <textarea
                    rows="2"
                    value={formData.treatmentPlan}
                    onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                    placeholder="e.g. Shamana with Kashayam + 14-day Janu Basti Shodhana therapy..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: VITALS & COMPLAINTS */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                {/* Vitals Grid */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" /> Objective Clinical Vitals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-500">BP (mmHg)</label>
                      <input
                        type="text"
                        value={formData.vitals.bp}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, bp: e.target.value } })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Pulse (bpm)</label>
                      <input
                        type="text"
                        value={formData.vitals.pulse}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, pulse: e.target.value } })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Temp (°F)</label>
                      <input
                        type="text"
                        value={formData.vitals.temp}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, temp: e.target.value } })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">Weight (kg)</label>
                      <input
                        type="text"
                        value={formData.vitals.weight}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, weight: e.target.value } })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500">SpO2 (%)</label>
                      <input
                        type="text"
                        value={formData.vitals.spo2}
                        onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, spo2: e.target.value } })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Symptoms / Chief Complaints *</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="e.g. Joint pain, morning stiffness, burning sensation in epigastrium..."
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Medical History & Allergies</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. Known dust allergy, past knee surgery..."
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultation & Progress Notes</label>
                  <textarea
                    rows="2"
                    value={formData.consultationNotes}
                    onChange={(e) => setFormData({ ...formData, consultationNotes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: PATHYA - APATHYA (DIET & LIFESTYLE) */}
            {activeTab === 'pathya' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Apple className="w-4 h-4 text-emerald-600" /> Pathya Ahara (Wholesome Diet)
                    </div>
                    <textarea
                      rows="3"
                      value={formData.pathyaApathya.pathyaAhara}
                      onChange={(e) => setFormData({
                        ...formData,
                        pathyaApathya: { ...formData.pathyaApathya, pathyaAhara: e.target.value }
                      })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-xs text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" /> Apathya Ahara (Foods to Strictly Avoid)
                    </div>
                    <textarea
                      rows="3"
                      value={formData.pathyaApathya.apathyaAhara}
                      onChange={(e) => setFormData({
                        ...formData,
                        pathyaApathya: { ...formData.pathyaApathya, apathyaAhara: e.target.value }
                      })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/40 p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-xs text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-teal-600" /> Pathya Vihara (Daily Routine & Yoga)
                    </div>
                    <textarea
                      rows="3"
                      value={formData.pathyaApathya.pathyaVihara}
                      onChange={(e) => setFormData({
                        ...formData,
                        pathyaApathya: { ...formData.pathyaApathya, pathyaVihara: e.target.value }
                      })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-2xl space-y-2">
                    <div className="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" /> Apathya Vihara (Habits to Avoid)
                    </div>
                    <textarea
                      rows="3"
                      value={formData.pathyaApathya.apathyaVihara}
                      onChange={(e) => setFormData({
                        ...formData,
                        pathyaApathya: { ...formData.pathyaApathya, apathyaVihara: e.target.value }
                      })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Follow-up Review Date</label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full sm:w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveAndPrescribe}
                className="w-full sm:flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Pill className="w-4 h-4" />
                <span>Save &amp; Write Prescription</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="submit"
                className={`w-full sm:w-auto px-6 py-3 ${editingEmrId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'} text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer`}
              >
                <Save className="w-4 h-4" />
                <span>{editingEmrId ? 'Update EMR Only' : 'Save EMR Only'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* EMR Consultations Feed */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" /> Recent Consultations
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {emrs.length} Records
            </span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {emrs.length === 0 ? (
              <p className="text-xs text-slate-400">No consultation records found.</p>
            ) : (
              emrs.map((item) => (
                <div key={item._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.patient?.name || item.patientName || 'Patient'}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {item.rogaNidana || item.diagnosis || 'Clinical Review'}
                    </span>
                    {item.prakriti && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        Prakriti: {item.prakriti}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-500 text-[11px] line-clamp-2">
                    Symptoms: {item.symptoms}
                  </p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-slate-800">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate max-w-[170px]">
                      {item.ashtavidhaPariksha?.nadi ? `Nadi: ${item.ashtavidhaPariksha.nadi}` : (item.chikitsaType || 'Consultation')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLoadEmrIntoForm(item)}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {/* Fast Prescription Modal inside EMR */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Issue Ayurvedic Prescription
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong>{rxForm.patientName}</strong> | Doctor: <strong>{rxForm.doctorName}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowRxModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prescribed Medicines List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Medicines (Aushadhi)
                </span>
                <button
                  type="button"
                  onClick={() => setRxForm(prev => ({
                    ...prev,
                    medicines: [...prev.medicines, { name: '', dosage: '1 Tab / 15ml', frequency: 'Twice daily (After Food)', timing: 'After Food', duration: '14 Days', quantity: 1, anupana: 'Boiled warm water' }]
                  }))}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Medicine
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {rxForm.medicines.map((med, idx) => {
                  const cleanName = (med.name || '').trim().toLowerCase();
                  const matchedStock = pharmacyItems.find(p => (p.name || '').toLowerCase() === cleanName || (p.name || '').toLowerCase().startsWith(cleanName));
                  return (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400">#{idx + 1}</span>
                          {med.name && matchedStock ? (
                            matchedStock.quantity > 5 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                                🟢 In Stock: {matchedStock.quantity} {matchedStock.unit || 'units'} (₹{matchedStock.sellingPrice || 150})
                              </span>
                            ) : matchedStock.quantity > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                                🟡 Low Stock: {matchedStock.quantity}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                                🔴 Out of Stock
                              </span>
                            )
                          ) : null}
                        </div>
                        {rxForm.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setRxForm(prev => ({
                              ...prev,
                              medicines: prev.medicines.filter((_, i) => i !== idx)
                            }))}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Medicine Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dhanwantharam Kashayam, Triphala..."
                            value={med.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRxForm(prev => {
                                const arr = [...prev.medicines];
                                arr[idx].name = val;
                                return { ...prev, medicines: arr };
                              });
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                            list={`rx-datalist-${idx}`}
                          />
                          <datalist id={`rx-datalist-${idx}`}>
                            {pharmacyItems.map((item, i) => (
                              <option key={i} value={item.name}>
                                {item.name} (Stock: {item.quantity} | ₹{item.sellingPrice || 150})
                              </option>
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Dosage</label>
                          <input
                            type="text"
                            placeholder="e.g. 1 Tab / 15ml"
                            value={med.dosage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRxForm(prev => {
                                const arr = [...prev.medicines];
                                arr[idx].dosage = val;
                                return { ...prev, medicines: arr };
                              });
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Timing</label>
                          <select
                            value={med.timing}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRxForm(prev => {
                                const arr = [...prev.medicines];
                                arr[idx].timing = val;
                                return { ...prev, medicines: arr };
                              });
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="Before Food">Before Food</option>
                            <option value="After Food">After Food</option>
                            <option value="Empty Stomach">Empty Stomach</option>
                            <option value="Bedtime">Bedtime</option>
                            <option value="External Application">External Application</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Anupana (Carrier)</label>
                          <input
                            type="text"
                            placeholder="e.g. Boiled warm water, Honey, Milk"
                            value={med.anupana}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRxForm(prev => {
                                const arr = [...prev.medicines];
                                arr[idx].anupana = val;
                                return { ...prev, medicines: arr };
                              });
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g. 7 Days, 14 Days"
                            value={med.duration}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRxForm(prev => {
                                const arr = [...prev.medicines];
                                arr[idx].duration = val;
                                return { ...prev, medicines: arr };
                              });
                            }}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pathya Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dietary &amp; Lifestyle Regimen (Pathya-Apathya)
              </label>
              <textarea
                rows="2"
                value={rxForm.pathyaApathyaNotes}
                onChange={(e) => setRxForm(prev => ({ ...prev, pathyaApathyaNotes: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                placeholder="Dietary instructions for the patient..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={isSubmittingRx}
                onClick={() => handleCreateFastPrescription(true)}
                className="w-full sm:flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Issue &amp; Dispense to Bill</span>
              </button>

              <button
                type="button"
                disabled={isSubmittingRx}
                onClick={() => handleCreateFastPrescription(false)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Issue Only (Prescription Slip)
              </button>

              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}
