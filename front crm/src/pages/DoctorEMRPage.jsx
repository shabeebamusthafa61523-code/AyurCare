import React, { useState, useEffect } from 'react';
import { Stethoscope, FileText, User, Activity, Plus, CheckCircle2, Save, Calendar } from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

export default function DoctorEMRPage() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [emrs, setEmrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {}
  });

  // Active EMR Consultation Form State
  const [formData, setFormData] = useState({
    patient: '',
    patientName: '',
    appointment: '',
    doctorName: 'Dr. Rajesh Gupta',
    symptoms: '',
    vitals: { bp: '120/80', pulse: '76', temp: '98.6 F', weight: '70 kg', spo2: '99%' },
    allergies: '',
    medicalHistory: '',
    diagnosis: '',
    treatmentPlan: '',
    consultationNotes: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const patRes = await polyclinicService.getPatients();
      if (patRes.success) setPatients(patRes.patients);

      const apptRes = await polyclinicService.getAppointments();
      if (apptRes.success) {
        setAppointments(apptRes.appointments);
        // Pre-select patient if in consultation
        const activeAppt = apptRes.appointments.find(a => a.status === 'In-Consultation' || a.status === 'Checked-In');
        if (activeAppt) {
          setFormData(prev => ({
            ...prev,
            patient: activeAppt.patient?._id || activeAppt.patient,
            patientName: activeAppt.patientName,
            appointment: activeAppt._id,
            doctor: activeAppt.doctor?._id || activeAppt.doctor,
            doctorName: activeAppt.doctorName
          }));
        }
      }

      const emrRes = await polyclinicService.getEmrRecords();
      if (emrRes.success) setEmrs(emrRes.emrs);
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
      title: `Save Consultation EMR Record`,
      message: `Save EMR consultation record for ${formData.patientName} with diagnosis "${formData.diagnosis}"?`,
      confirmText: `Save EMR Record`,
      variant: 'success',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.createEmrRecord(formData);
          if (res.success) {
            setFormData({
              patient: '',
              patientName: '',
              appointment: '',
              doctorName: 'Dr. Rajesh Gupta',
              symptoms: '',
              vitals: { bp: '120/80', pulse: '76', temp: '98.6 F', weight: '70 kg', spo2: '99%' },
              allergies: '',
              medicalHistory: '',
              diagnosis: '',
              treatmentPlan: '',
              consultationNotes: '',
              followUpDate: ''
            });
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
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" /> Doctor Consultation & EMR Records
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Record patient symptoms, vitals, diagnosis, treatment plans, and clinical consultation notes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-purple-500" /> Record New Patient Consultation
          </h2>

          <form onSubmit={requestSubmit} className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
              <select
                value={formData.patient}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.phone}) - {p.patientId}
                  </option>
                ))}
              </select>
            </div>

            {/* Vitals Grid */}
            <div className="bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/30 p-4 rounded-xl space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-600" /> Patient Vitals
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500">BP (mmHg)</label>
                  <input
                    type="text"
                    value={formData.vitals.bp}
                    onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, bp: e.target.value } })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Pulse (bpm)</label>
                  <input
                    type="text"
                    value={formData.vitals.pulse}
                    onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, pulse: e.target.value } })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Temp (°F)</label>
                  <input
                    type="text"
                    value={formData.vitals.temp}
                    onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, temp: e.target.value } })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">Weight (kg)</label>
                  <input
                    type="text"
                    value={formData.vitals.weight}
                    onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, weight: e.target.value } })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500">SpO2 (%)</label>
                  <input
                    type="text"
                    value={formData.vitals.spo2}
                    onChange={(e) => setFormData({ ...formData, vitals: { ...formData.vitals, spo2: e.target.value } })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Symptoms & History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Symptoms / Complaints *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Fever, dry cough..."
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Allergies & History</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Known Penicillin allergy..."
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Clinical Diagnosis & Treatment Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Viral Upper Respiratory Infection"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Treatment Plan & Advice</label>
              <textarea
                rows="3"
                placeholder="Detail treatment instructions and clinical advice..."
                value={formData.treatmentPlan}
                onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save EMR Consultation Record
            </button>
          </form>
        </div>

        {/* EMR History Feed */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" /> Recent Medical Consultations
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {emrs.length === 0 ? (
              <p className="text-xs text-slate-400">No EMR records found.</p>
            ) : (
              emrs.map((item) => (
                <div key={item._id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{item.patient?.name || item.patientName || 'Patient'}</span>
                    <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-purple-600 font-semibold">{item.diagnosis}</p>
                  <p className="text-slate-400 text-[11px]">Symptoms: {item.symptoms}</p>
                  {item.vitals && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      <span>BP: {item.vitals.bp || 'N/A'}</span> • <span>Pulse: {item.vitals.pulse || 'N/A'}</span> • <span>SpO2: {item.vitals.spo2 || 'N/A'}</span>
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
