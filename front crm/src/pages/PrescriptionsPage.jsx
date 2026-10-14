import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Stethoscope, 
  Download,
  Sparkles,
  Droplet,
  Coffee,
  Clock,
  Apple,
  ShieldAlert,
  ChevronDown,
  X
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const FORM_OPTIONS = [
  'Kashayam',
  'Arishtam / Asavam',
  'Tailam / Thailam',
  'Ghritam',
  'Churnam',
  'Gulika / Vati',
  'Lehyam / Rasayanam',
  'Bhasmam / Pishti',
  'Kwatha Choornam',
  'External Application',
  'Other'
];

const ANUPANA_OPTIONS = [
  'Lukewarm water (Ushnodaka)',
  'Boiled water with dry ginger (Shunti Jala)',
  'Honey (Madhu)',
  'Boiled warm cow milk (Ksheera)',
  'Cow ghee (Ghrita)',
  'Ginger juice (Ardraka Swarasa)',
  'Cumin water (Jeeraka Jala)',
  'Pomegranate juice (Dadima)',
  'Warm water with pinch of rock salt (Saindhava)',
  'External Application'
];

const TIMING_OPTIONS = [
  'Pragbhakta (Before Food)',
  'Adhobhakta (After Food)',
  'Madhyabhakta (During Food)',
  'Nishi (At Bedtime)',
  'Empty Stomach (Prathah Kaal)',
  'External Application'
];

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState([]);
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Prescription State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medicines, setMedicines] = useState([
    {
      name: 'Maharasnadi Kashayam',
      form: 'Kashayam',
      dosage: '15 ml mixed with 45 ml lukewarm water',
      frequency: 'Twice daily',
      anupana: 'Lukewarm water (Ushnodaka)',
      timing: 'Pragbhakta (Before Food)',
      duration: '15 Days',
      instructions: 'Drink on an empty stomach in the morning & before dinner.'
    }
  ]);
  const [pathyaApathyaNotes, setPathyaApathyaNotes] = useState(
    'Drink boiled warm water throughout the day. Avoid curd, refrigerated leftovers, sour curries, and direct cold AC exposure.'
  );
  const [notes, setNotes] = useState('Review after 15 days or upon completing the course.');

  // Print Preview Modal
  const [previewRx, setPreviewRx] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patRes, pharmRes, rxRes] = await Promise.all([
        polyclinicService.getPatients(),
        polyclinicService.getPharmacyItems(),
        polyclinicService.getPrescriptions()
      ]);

      if (patRes.success) setPatients(patRes.patients || []);
      if (pharmRes.success) setPharmacyItems(pharmRes.items || []);
      if (rxRes.success) setPrescriptions(rxRes.prescriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        form: 'Kashayam',
        dosage: '15 ml with 45 ml warm water',
        frequency: 'Twice daily',
        anupana: 'Lukewarm water (Ushnodaka)',
        timing: 'Adhobhakta (After Food)',
        duration: '15 Days',
        instructions: ''
      }
    ]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSelectPredefinedMedicine = (index, medName) => {
    const found = pharmacyItems.find(i => i.name === medName);
    const updated = [...medicines];
    updated[index].name = medName;
    if (found && found.category) {
      updated[index].form = found.category;
    }
    setMedicines(updated);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select a patient before generating the prescription.');
      return;
    }

    const patientObj = patients.find(p => p._id === selectedPatient);

    try {
      const res = await polyclinicService.createPrescription({
        patient: selectedPatient,
        patientName: patientObj?.name || 'Patient',
        doctorName: 'Dr. Arya Warrier (BAMS, MD)',
        medicines,
        pathyaApathyaNotes,
        notes
      });

      if (res.success) {
        setConfirmModal({
          isOpen: true,
          title: 'Ayurvedic Prescription Generated',
          message: `Prescription ${res.prescription?.prescriptionNo || ''} created for ${patientObj?.name}.`,
          confirmText: 'Done',
          variant: 'success',
          onConfirm: () => {}
        });
        setSelectedPatient('');
        setMedicines([
          {
            name: '',
            form: 'Kashayam',
            dosage: '15 ml with 45 ml warm water',
            frequency: 'Twice daily',
            anupana: 'Lukewarm water (Ushnodaka)',
            timing: 'Adhobhakta (After Food)',
            duration: '15 Days',
            instructions: ''
          }
        ]);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handlePrintRx = (rx) => {
    setPreviewRx(rx);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Aushadha Chikitsa & Sevana Kala
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Ayurvedic Digital Prescriptions (Aushadhi Patra)
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            Specify classical formulation types (Kashayam, Tailam, Arishtam, Churnam), Anupana carriers, Ayurvedic administration timings (Sevana Kala), and Pathya-Apathya rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Generation Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> New Ayurvedic Prescription
            </h2>
            <button
              type="button"
              onClick={addMedicineRow}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>

          <form onSubmit={handleCreatePrescription} className="space-y-5">
            {/* Patient Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">-- Choose Patient for Aushadhi Prescription --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.phone}) - {p.patientId} {p.prakriti ? `[Prakriti: ${p.prakriti}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Medicines List */}
            <div className="space-y-4">
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5" /> Aushadhi #{idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Medicine Name *</label>
                      <input
                        type="text"
                        required
                        value={med.name}
                        onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                        placeholder="e.g. Maharasnadi Kashayam, Yogaraj Guggulu..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                        list={`pharmacy-datalist-${idx}`}
                      />
                      <datalist id={`pharmacy-datalist-${idx}`}>
                        {pharmacyItems.map(item => (
                          <option key={item._id} value={item.name} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Formulation Form (Kalpana)</label>
                      <select
                        value={med.form}
                        onChange={(e) => updateMedicine(idx, 'form', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      >
                        {FORM_OPTIONS.map(form => (
                          <option key={form} value={form}>{form}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 15 ml, 2 tabs, 1 tsp"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Anupana (Carrier / Vehicle)</label>
                      <select
                        value={med.anupana}
                        onChange={(e) => updateMedicine(idx, 'anupana', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      >
                        {ANUPANA_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Sevana Kala (Administration Timing)</label>
                      <select
                        value={med.timing}
                        onChange={(e) => updateMedicine(idx, 'timing', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      >
                        {TIMING_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                        placeholder="e.g. 15 Days, 1 Month"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Special Instructions</label>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                        placeholder="e.g. Warm water bath after application"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pathya - Apathya & Clinical Instructions */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-emerald-600" /> Pathya - Apathya (Diet & Lifestyle Instructions for Patient)
              </label>
              <textarea
                rows="2"
                value={pathyaApathyaNotes}
                onChange={(e) => setPathyaApathyaNotes(e.target.value)}
                placeholder="List foods and routines to follow or avoid..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Generate Ayurvedic Digital Prescription
            </button>
          </form>
        </div>

        {/* Existing Prescriptions List */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> Issued Prescriptions
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {prescriptions.length} Total
            </span>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400">No prescriptions issued yet.</p>
            ) : (
              prescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {rx.prescriptionNo}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{rx.patientName}</h4>
                      <p className="text-[11px] text-slate-400">Vaidya: {rx.doctorName}</p>
                    </div>
                    <button
                      onClick={() => handlePrintRx(rx)}
                      className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-sm"
                      title="Print Prescription Slip"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Medicines list */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    {(rx.medicines || []).map((m, mIdx) => (
                      <div key={mIdx} className="bg-white dark:bg-slate-900/90 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex justify-between">
                          <span>{m.name}</span>
                          <span className="text-emerald-600 font-semibold">{m.form}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] mt-0.5">
                          {m.dosage} • Anupana: {m.anupana} • {m.timing}
                        </div>
                      </div>
                    ))}
                  </div>

                  {rx.pathyaApathyaNotes && (
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-xl">
                      <span className="font-bold">Pathya:</span> {rx.pathyaApathyaNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Printable Prescription Modal (hidden on screen, visible during window.print) */}
      {previewRx && (
        <div className="fixed inset-0 z-50 bg-white text-slate-900 p-8 print:block hidden overflow-y-auto" id="printable-rx">
          <div className="max-w-3xl mx-auto space-y-6 border-b pb-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h1 className="text-2xl font-black text-emerald-900 uppercase">AYURVEDIC HOSPITAL & PANCHAKARMA CENTRE</h1>
                <p className="text-xs text-slate-500">Holistic Healing, Panchakarma Therapy & Classical Aushadhi Dispensary</p>
                <p className="text-xs text-slate-500">Contact: +91 98470 12345 | opd@ayurvedichospital.com</p>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-emerald-700">{previewRx.prescriptionNo}</div>
                <div className="text-xs text-slate-500">Date: {new Date(previewRx.date || previewRx.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border">
              <div>
                <span className="font-bold">Patient Name:</span> {previewRx.patientName}
              </div>
              <div>
                <span className="font-bold">Consulting Vaidya:</span> {previewRx.doctorName}
              </div>
            </div>

            {/* Medicines List */}
            <div>
              <h3 className="font-bold text-sm text-emerald-950 mb-2 border-b pb-1">Rx - Aushadha Prayoga</h3>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b text-slate-600">
                    <th className="py-1">#</th>
                    <th className="py-1">Medicine (Aushadhi)</th>
                    <th className="py-1">Form (Kalpana)</th>
                    <th className="py-1">Dosage</th>
                    <th className="py-1">Anupana (Carrier)</th>
                    <th className="py-1">Timing (Sevana Kala)</th>
                    <th className="py-1">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewRx.medicines || []).map((m, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-1.5 font-bold">{idx + 1}</td>
                      <td className="py-1.5 font-bold">{m.name}</td>
                      <td className="py-1.5">{m.form}</td>
                      <td className="py-1.5">{m.dosage}</td>
                      <td className="py-1.5">{m.anupana}</td>
                      <td className="py-1.5">{m.timing}</td>
                      <td className="py-1.5">{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pathya - Apathya */}
            {previewRx.pathyaApathyaNotes && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900">Pathya - Apathya (Diet & Lifestyle Instructions):</span>
                <p className="mt-1">{previewRx.pathyaApathyaNotes}</p>
              </div>
            )}

            {/* Footer / Signature */}
            <div className="flex justify-between items-end pt-12">
              <div className="text-[11px] text-slate-400">
                Generated via Ayurvedic Hospital Suite
              </div>
              <div className="text-center text-xs">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <span className="font-bold">{previewRx.doctorName}</span>
                <div className="text-[10px] text-slate-500">Authorized Vaidya Signature</div>
              </div>
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
