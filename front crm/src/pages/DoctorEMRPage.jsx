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
  ShieldAlert
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

export default function DoctorEMRPage() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emrs, setEmrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ayurvedic'); // 'ayurvedic' | 'vitals' | 'pathya'

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
      const [patRes, apptRes, emrRes] = await Promise.all([
        polyclinicService.getPatients(),
        polyclinicService.getAppointments(),
        polyclinicService.getEmrRecords()
      ]);

      if (patRes.success) setPatients(patRes.patients || []);
      if (emrRes.success) setEmrs(emrRes.emrs || []);

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

  const requestSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient) {
      alert('Please select a patient first.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Save Ayurvedic Consultation EMR`,
      message: `Save Rogi Pariksha & clinical consultation record for ${formData.patientName} (${formData.rogaNidana})?`,
      confirmText: `Save EMR Record`,
      variant: 'success',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.createEmrRecord(formData);
          if (res.success) {
            setFormData(prev => ({
              ...prev,
              patient: '',
              patientName: '',
              symptoms: '',
              diagnosis: '',
              treatmentPlan: ''
            }));
            fetchData();
          }
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        }
      }
    });
  };

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Rogi Pariksha & Clinical Record
            </h2>
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

          <form onSubmit={requestSubmit} className="space-y-5">
            {/* Patient Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
              <select
                value={formData.patient}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
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

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Ayurvedic Consultation & Rogi Pariksha
            </button>
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

                  {item.ashtavidhaPariksha?.nadi && (
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      Nadi: {item.ashtavidhaPariksha.nadi}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
