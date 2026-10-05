import React, { useState, useEffect } from 'react';
import { Pill, Plus, Printer, FileText, Trash2, CheckCircle2, Stethoscope, Download } from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState([]);
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Prescription State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [medicines, setMedicines] = useState([
    { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }
  ]);
  const [notes, setNotes] = useState('Drink warm water, take adequate rest, and avoid cold drinks.');

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
      const patRes = await polyclinicService.getPatients();
      if (patRes.success) setPatients(patRes.patients);

      const pharmRes = await polyclinicService.getPharmacyItems();
      if (pharmRes.success) setPharmacyItems(pharmRes.items || []);

      const rxRes = await polyclinicService.getPrescriptions();
      if (rxRes.success) setPrescriptions(rxRes.prescriptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMedicineRow = () => {
    setMedicines([...medicines, { name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }]);
  };

  const removeMedicineRow = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      setConfirmModal({
        isOpen: true,
        title: 'Patient Required',
        message: 'Please select a patient before generating the prescription.',
        confirmText: 'OK',
        variant: 'warning',
        onConfirm: () => {}
      });
      return;
    }

    const patientObj = patients.find(p => p._id === selectedPatient);

    try {
      const res = await polyclinicService.createPrescription({
        patient: selectedPatient,
        patientName: patientObj?.name || 'Patient',
        doctorName: 'Dr. Rajesh Gupta',
        medicines,
        notes
      });
      if (res.success) {
        setConfirmModal({
          isOpen: true,
          title: 'Digital Prescription Generated',
          message: `Prescription ${res.prescription?.prescriptionNo || ''} created for ${patientObj?.name}.`,
          confirmText: 'Great!',
          variant: 'success',
          onConfirm: () => {}
        });
        setSelectedPatient('');
        setMedicines([{ name: '', dosage: '1 tablet', frequency: '1-0-1', duration: '5 Days', instructions: 'After food' }]);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handlePrintRx = (rx) => {
    window.print();
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-500" /> Digital Prescription & Rx Engine
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Structured medicine dosages, frequency schedules, duration, and food timing instructions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Creation Form */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-emerald-500" /> Create Digital Prescription
          </h2>

          <form onSubmit={handleCreatePrescription} className="space-y-4">
            {/* Patient Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.phone}) - {p.patientId}
                  </option>
                ))}
              </select>
            </div>

            {/* Datalist for Available Pharmacy Stock */}
            <datalist id="pharmacy-medicines">
              {pharmacyItems.map(item => (
                <option key={item._id} value={item.name} />
              ))}
            </datalist>

            {/* Medicines List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Prescribed Medicines
                </label>
                <button
                  type="button"
                  onClick={addMedicineRow}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </div>

              {medicines.map((med, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-start text-xs">
                  {/* Medicine Name (Typeable Text Input + Pharmacy Inventory Selector) */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Medicine Name *</label>
                    <input
                      type="text"
                      list="pharmacy-medicines"
                      placeholder="Type or pick medicine..."
                      value={med.name}
                      onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                      required
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white text-xs font-semibold focus:border-emerald-500 outline-none shadow-sm"
                    />
                    {pharmacyItems.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            updateMedicine(idx, 'name', e.target.value);
                          }
                        }}
                        className="w-full bg-slate-200/60 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg px-1.5 py-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                      >
                        <option value="">-- Select from Pharmacy Stock --</option>
                        {pharmacyItems.map(item => (
                          <option key={item._id} value={item.name}>
                            📦 {item.name} (In Stock: {item.quantity} | ₹{item.sellingPrice || item.price || 0})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Dosage */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 tab"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  {/* Frequency Dropdown */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Frequency</label>
                    <select
                      value={med.frequency}
                      onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      <option value="1-0-1">1-0-1 (Morn-Night)</option>
                      <option value="1-0-0">1-0-0 (Morning)</option>
                      <option value="0-1-0">0-1-0 (Afternoon)</option>
                      <option value="0-0-1">0-0-1 (Night)</option>
                      <option value="1-1-1">1-1-1 (Thrice daily)</option>
                      <option value="1-1-1-1">1-1-1-1 (4 times/day)</option>
                      <option value="As Needed">As Needed (SOS)</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 Days"
                      value={med.duration}
                      onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  {/* Timing / Food Instructions Dropdown */}
                  <div className="space-y-1 flex flex-col">
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Timing / Food</label>
                    <div className="flex items-center gap-1">
                      <select
                        value={med.instructions}
                        onChange={(e) => updateMedicine(idx, 'instructions', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-slate-900 dark:text-white text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                      >
                        <option value="After food">After food</option>
                        <option value="Before food">Before food</option>
                        <option value="Empty stomach">Empty stomach</option>
                        <option value="With food / meals">With food / meals</option>
                        <option value="30 mins before food">30 mins before food</option>
                        <option value="Before bed (At night)">Before bed (At night)</option>
                        <option value="As needed (SOS)">As needed (SOS)</option>
                      </select>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicineRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 flex-shrink-0"
                          title="Remove Medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor Advice & Dietary Notes</label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Generate Digital Prescription
            </button>
          </form>
        </div>

        {/* Prescription Feed */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-4 h-4 text-emerald-500" /> Recent Digital Prescriptions
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400">No prescriptions issued.</p>
            ) : (
              prescriptions.map((rx) => (
                <div key={rx._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                    <div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{rx.prescriptionNo}</p>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{rx.patientName}</p>
                    </div>
                    <button
                      onClick={() => handlePrintRx(rx)}
                      className="p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition"
                      title="Print Prescription"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-slate-400 text-[11px]">Prescribed Medicines:</p>
                    {(rx.medicines || []).map((m, i) => (
                      <div key={i} className="flex flex-col gap-0.5 text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                          <span>{m.name}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                            {m.instructions || 'After food'}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Dosage: {m.dosage} • Frequency: {m.frequency} • Duration: {m.duration}
                        </div>
                      </div>
                    ))}
                  </div>
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
