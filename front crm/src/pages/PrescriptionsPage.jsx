import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, 
  Plus, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Stethoscope, 
  Sparkles, 
  Pill, 
  Table, 
  Search, 
  PenTool,
  Calendar,
  User,
  HeartPulse,
  Tag,
  Eye,
  Edit2,
  X
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const TIMING_OPTIONS = {
  Medicine: [
    'Twice daily (After Food)',
    'Twice daily (Before Food)',
    'Thrice daily (After Food)',
    'Once daily (Morning)',
    'Once daily (Night / Bedtime)',
    'Empty Stomach',
    'As Needed (SOS)',
    'External Application'
  ],
  Therapy: [
    'Daily (Morning)',
    'Daily (Evening)',
    'Alternate Days',
    'Weekly (1 Session)',
    'Continuous 7 Days',
    'Continuous 14 Days',
    'Single Intensive Session'
  ],
  Service: [
    'Weekly Review',
    'Bi-weekly Review',
    'Monthly Checkup',
    'Post-therapy Evaluation',
    'Follow-up Visit',
    'Single Assessment'
  ]
};

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState([]);
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [services, setServices] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');

  // Separate Prescription Form State for Medicines, Therapies, and Services
  const [selectedPatient, setSelectedPatient] = useState('');
  const [prescribedMedicines, setPrescribedMedicines] = useState([
    {
      name: '',
      dosage: '1 Tab',
      frequency: 'Twice daily (After Food)',
      timing: 'After Food',
      duration: '7 Days',
      instructions: 'Take with warm water'
    }
  ]);
  const [prescribedTherapies, setPrescribedTherapies] = useState([]);
  const [prescribedServices, setPrescribedServices] = useState([]);
  const [adviceNotes, setAdviceNotes] = useState('Drink warm water. Avoid oily & cold items. Review after 7 days.');

  // Edit Prescription State
  const [editingRxId, setEditingRxId] = useState(null);

  // Print Preview Modal State
  const [previewRx, setPreviewRx] = useState(null);
  // Interactive View Prescription Modal State
  const [viewRx, setViewRx] = useState(null);

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
      const [patRes, pharmRes, rxRes, servRes] = await Promise.all([
        polyclinicService.getPatients(),
        polyclinicService.getPharmacyItems(),
        polyclinicService.getPrescriptions(),
        polyclinicService.getServices()
      ]);

      if (patRes.success) setPatients(patRes.patients || []);
      if (pharmRes.success) setPharmacyItems(pharmRes.items || []);
      if (rxRes.success) setPrescriptions(rxRes.prescriptions || []);
      if (servRes.success) setServices(servRes.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Separate catalog lists for medicines, therapies, and services
  const catalog = useMemo(() => {
    const meds = (pharmacyItems || []).map(p => ({
      name: p.name,
      type: 'Medicine',
      category: p.category || 'Dispensary',
      price: p.sellingPrice || p.price || 150,
      quantity: p.quantity ?? 0,
      unit: p.unit || 'Bottles'
    }));
    const therapies = (services || [])
      .filter(s => (s.category || '').toLowerCase().includes('therapy') || (s.category || '').toLowerCase().includes('panchakarma'))
      .map(s => ({
        name: s.name,
        type: 'Therapy',
        category: s.category,
        duration: s.duration || '45 mins',
        price: s.price || 1500
      }));
    const clinicServices = (services || [])
      .filter(s => !(s.category || '').toLowerCase().includes('therapy') && !(s.category || '').toLowerCase().includes('panchakarma'))
      .map(s => ({
        name: s.name,
        type: 'Service',
        category: s.category,
        duration: s.duration || '30 mins',
        price: s.price || 500
      }));

    return { meds, therapies, clinicServices };
  }, [pharmacyItems, services]);

  // Helper to extract separate categories from any prescription (new or legacy)
  const extractRxCategories = (rx) => {
    if (!rx) return { meds: [], therapies: [], services: [] };

    let therapies = Array.isArray(rx.therapies) && rx.therapies.length > 0
      ? rx.therapies
      : (rx.medicines || []).filter(m => (m.form || '').toLowerCase() === 'therapy');

    let services = Array.isArray(rx.services) && rx.services.length > 0
      ? rx.services
      : (rx.medicines || []).filter(m => (m.form || '').toLowerCase() === 'service');

    let meds = (rx.medicines || []).filter(m => {
      const f = (m.form || '').toLowerCase();
      return f !== 'therapy' && f !== 'service';
    });

    return { meds, therapies, services };
  };

  // 1. Medicines Handlers
  const addMedicineRow = (prefillName = '') => {
    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        name: prefillName,
        dosage: '1 Tab',
        frequency: 'Twice daily (After Food)',
        timing: 'After Food',
        duration: '7 Days',
        instructions: 'Take with warm water'
      }
    ]);
  };

  const removeMedicineRow = (index) => {
    setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
  };

  const updateMedicineRow = (index, field, value) => {
    const updated = [...prescribedMedicines];
    updated[index][field] = value;
    setPrescribedMedicines(updated);
  };

  // 2. Therapies Handlers
  const addTherapyRow = (prefillName = '') => {
    setPrescribedTherapies([
      ...prescribedTherapies,
      {
        name: prefillName,
        sessions: '7 Sessions',
        frequency: 'Daily (Morning)',
        duration: '45 mins',
        instructions: 'Warm water bath post-session'
      }
    ]);
  };

  const removeTherapyRow = (index) => {
    setPrescribedTherapies(prescribedTherapies.filter((_, i) => i !== index));
  };

  const updateTherapyRow = (index, field, value) => {
    const updated = [...prescribedTherapies];
    updated[index][field] = value;
    if (field === 'name') {
      const match = catalog.therapies.find(t => t.name.toLowerCase() === value.trim().toLowerCase());
      if (match && match.duration) {
        updated[index].duration = match.duration;
      }
    }
    setPrescribedTherapies(updated);
  };

  // 3. Clinical Services Handlers
  const addServiceRow = (prefillName = '') => {
    setPrescribedServices([
      ...prescribedServices,
      {
        name: prefillName,
        sessions: '1 Session',
        frequency: 'Weekly Review',
        duration: '30 mins',
        instructions: ''
      }
    ]);
  };

  const removeServiceRow = (index) => {
    setPrescribedServices(prescribedServices.filter((_, i) => i !== index));
  };

  const updateServiceRow = (index, field, value) => {
    const updated = [...prescribedServices];
    updated[index][field] = value;
    if (field === 'name') {
      const match = catalog.clinicServices.find(s => s.name.toLowerCase() === value.trim().toLowerCase());
      if (match && match.duration) {
        updated[index].duration = match.duration;
      }
    }
    setPrescribedServices(updated);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select a patient before generating the prescription.');
      return;
    }

    const totalCount = prescribedMedicines.length + prescribedTherapies.length + prescribedServices.length;
    if (totalCount === 0) {
      alert('Please prescribe at least one Medicine, Therapy, or Clinical Service.');
      return;
    }

    if (prescribedMedicines.some(i => !i.name.trim())) {
      alert('Please enter or select a name for all prescribed medicines.');
      return;
    }
    if (prescribedTherapies.some(i => !i.name.trim())) {
      alert('Please enter or select a name for all prescribed therapies.');
      return;
    }
    if (prescribedServices.some(i => !i.name.trim())) {
      alert('Please enter or select a name for all prescribed services.');
      return;
    }

    const patientObj = patients.find(p => p._id === selectedPatient);

    // Combined items for backwards-compatibility
    const combinedLegacy = [
      ...prescribedMedicines.map(item => ({
        name: item.name,
        form: 'Medicine',
        dosage: item.dosage || '1 dose',
        frequency: item.frequency || 'Twice daily',
        timing: item.frequency || 'After Food',
        anupana: item.instructions || 'Warm water',
        duration: item.duration || '7 Days',
        instructions: item.instructions || ''
      })),
      ...prescribedTherapies.map(item => ({
        name: item.name,
        form: 'Therapy',
        dosage: item.sessions || '7 Sessions',
        frequency: item.frequency || 'Daily (Morning)',
        timing: item.frequency || 'Daily (Morning)',
        anupana: item.instructions || 'Warm herbal oil',
        duration: item.duration || '45 mins',
        instructions: item.instructions || ''
      })),
      ...prescribedServices.map(item => ({
        name: item.name,
        form: 'Service',
        dosage: item.sessions || '1 Session',
        frequency: item.frequency || 'Weekly Review',
        timing: item.frequency || 'Weekly Review',
        anupana: '',
        duration: item.duration || '30 mins',
        instructions: item.instructions || ''
      }))
    ];

    try {
      const payload = {
        patient: selectedPatient,
        patientName: patientObj?.name || 'Patient',
        doctorName: 'Dr. Arya Warrier (BAMS, MD)',
        medicines: combinedLegacy,
        therapies: prescribedTherapies,
        services: prescribedServices,
        pathyaApathyaNotes: adviceNotes,
        notes: adviceNotes
      };

      let res;
      if (editingRxId) {
        res = await polyclinicService.updatePrescription(editingRxId, payload);
      } else {
        res = await polyclinicService.createPrescription(payload);
      }

      if (res.success) {
        setConfirmModal({
          isOpen: true,
          title: editingRxId ? 'Prescription Updated Successfully' : 'Prescription Issued Successfully',
          message: `Prescription ${res.prescription?.prescriptionNo || ''} has been ${editingRxId ? 'updated' : 'created'} for ${patientObj?.name || 'patient'}.`,
          confirmText: 'Done',
          variant: 'success',
          onConfirm: () => {}
        });
        cancelEditRx();
        fetchData();
        setViewMode('table');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleEditRx = (rx) => {
    setEditingRxId(rx._id);
    setSelectedPatient(rx.patient?._id || rx.patient || '');
    const { meds, therapies, services: srvs } = extractRxCategories(rx);
    setPrescribedMedicines(meds.length > 0 ? meds.map(m => ({ ...m })) : [
      {
        name: '',
        dosage: '1 Tab',
        frequency: 'Twice daily (After Food)',
        timing: 'After Food',
        duration: '7 Days',
        instructions: 'Take with warm water'
      }
    ]);
    setPrescribedTherapies(therapies.length > 0 ? therapies.map(t => ({ ...t })) : []);
    setPrescribedServices(srvs.length > 0 ? srvs.map(s => ({ ...s })) : []);
    setAdviceNotes(rx.pathyaApathyaNotes || rx.notes || '');
    setViewMode('form');
  };

  const cancelEditRx = () => {
    setEditingRxId(null);
    setSelectedPatient('');
    setPrescribedMedicines([
      {
        name: '',
        dosage: '1 Tab',
        frequency: 'Twice daily (After Food)',
        timing: 'After Food',
        duration: '7 Days',
        instructions: 'Take with warm water'
      }
    ]);
    setPrescribedTherapies([]);
    setPrescribedServices([]);
    setAdviceNotes('Drink warm water. Avoid oily & cold items. Review after 7 days.');
  };

  const handleDeleteRx = (rx) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Prescription',
      message: `Are you sure you want to delete prescription "${rx.prescriptionNo}" for ${rx.patientName}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await polyclinicService.deletePrescription(rx._id);
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || err.message || 'Failed to delete prescription');
        }
      }
    });
  };

  const handlePrintRx = (rx) => {
    setPreviewRx(rx);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDispenseRx = (rx) => {
    setConfirmModal({
      isOpen: true,
      title: 'Dispense Prescription & Bill Patient',
      message: `Dispense prescribed medicines for ${rx.patientName} (${rx.prescriptionNo})? This will automatically deduct stock from Pharmacy Inventory and add medicine charges to the patient's daily invoice.`,
      confirmText: 'Dispense & Bill Now',
      variant: 'success',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.dispensePrescription(rx._id);
          if (res.success) {
            fetchData();
            setConfirmModal({
              isOpen: true,
              title: 'Prescription Dispensed Successfully',
              message: res.message || 'Medicines dispensed and added to patient bill.',
              confirmText: 'Done',
              variant: 'success',
              onConfirm: () => {}
            });
          }
        } catch (err) {
          alert(err.response?.data?.message || err.message || 'Failed to dispense prescription');
        }
      }
    });
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    const term = searchTerm.toLowerCase();
    return (rx.prescriptionNo || '').toLowerCase().includes(term) ||
           (rx.patientName || '').toLowerCase().includes(term) ||
           (rx.doctorName || '').toLowerCase().includes(term) ||
           (rx.medicines || []).some(m => (m.name || '').toLowerCase().includes(term));
  });

  // Render badge helper for item types
  const renderItemTypeBadge = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('therapy') || t.includes('panchakarma')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-2.5 h-2.5" /> Therapy
        </span>
      );
    }
    if (t.includes('service') || t.includes('consultation')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Stethoscope className="w-2.5 h-2.5" /> Service
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <Pill className="w-2.5 h-2.5" /> Medicine
      </span>
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Clinical Prescriptions
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Prescriptions Management
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            Prescribe Medicines (Aushadhi), Panchakarma Therapies, and Clinical Services in a unified digital slip.
          </p>
        </div>

        <button
          onClick={() => setViewMode(viewMode === 'table' ? 'form' : 'table')}
          className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg transition text-xs whitespace-nowrap self-start sm:self-auto"
        >
          {viewMode === 'table' ? (
            <>
              <Plus className="w-4 h-4" /> Create New Prescription
            </>
          ) : (
            <>
              <Table className="w-4 h-4" /> View Prescriptions Table
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
            placeholder="Search Rx no, patient, medicine, therapy..."
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
            <PenTool className="w-3.5 h-3.5" /> Prescription Builder
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Prescriptions Table View */
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          {filteredPrescriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No Prescriptions Found</h3>
              <p className="mt-1">Issue digital prescriptions combining Medicines, Panchakarma Therapies, and Services.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Rx No</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Prescribed Medicines, Therapies & Services</th>
                    <th className="py-3 px-4">Advice / Notes</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredPrescriptions.map((rx) => (
                    <tr key={rx._id} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {rx.prescriptionNo}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{rx.patientName}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rx.doctorName || 'Doctor'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[280px]">
                        {(() => {
                          const { meds, therapies, services } = extractRxCategories(rx);
                          return (
                            <div className="flex flex-col gap-1.5 max-w-md">
                              {meds.length > 0 && (
                                <div className="space-y-0.5">
                                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 uppercase tracking-wider">
                                    <Pill className="w-2.5 h-2.5" /> Medicines ({meds.length}):
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {meds.map((m, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
                                        <span className="font-bold">{m.name}</span>
                                        {m.dosage && <span className="text-slate-500">({m.dosage})</span>}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {therapies.length > 0 && (
                                <div className="space-y-0.5">
                                  <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 uppercase tracking-wider">
                                    <Sparkles className="w-2.5 h-2.5" /> Therapies ({therapies.length}):
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {therapies.map((t, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-1.5 py-0.5 rounded text-purple-900 dark:text-purple-300">
                                        <span className="font-bold">{t.name}</span>
                                        {t.sessions && <span>({t.sessions})</span>}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {services.length > 0 && (
                                <div className="space-y-0.5">
                                  <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 uppercase tracking-wider">
                                    <Stethoscope className="w-2.5 h-2.5" /> Services ({services.length}):
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {services.map((s, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-1.5 py-0.5 rounded text-blue-900 dark:text-blue-300">
                                        <span className="font-bold">{s.name}</span>
                                        {s.sessions && <span>({s.sessions})</span>}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 min-w-[180px]">
                        <p className="text-slate-600 dark:text-slate-300 truncate max-w-xs text-[11px]">
                          {rx.pathyaApathyaNotes || rx.notes || '—'}
                        </p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {new Date(rx.date || rx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {rx.dispensed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dispensed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDispenseRx(rx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title="Dispense medicines from Pharmacy & add charges to daily invoice"
                            >
                              <Pill className="w-3.5 h-3.5" /> Dispense &amp; Bill
                            </button>
                          )}

                          <button
                            onClick={() => setViewRx(rx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
                            title="View Prescription Details"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button
                            onClick={() => handlePrintRx(rx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 shadow-xs transition cursor-pointer"
                            title="Print Prescription Slip"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print
                          </button>

                          {/* Hidden Edit & Delete (Revealed on row hover) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                            <button
                              onClick={() => handleEditRx(rx)}
                              className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60 transition"
                              title="Edit Prescription"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRx(rx)}
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition"
                              title="Delete Prescription"
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
          {/* Prescription Generation Form */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> {editingRxId ? 'Update Clinical Prescription' : 'New Clinical Prescription'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {editingRxId ? 'Modify prescribed medicines, therapies, or clinical services' : 'Prescribe Medicines, Panchakarma Therapies, and Services'}
                </p>
              </div>

              {editingRxId && (
                <button
                  type="button"
                  onClick={cancelEditRx}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
                >
                  Cancel Edit
                </button>
              )}

              {/* Quick Summary Counts & Add Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => addMedicineRow()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
                  title="Add Medicine"
                >
                  <Pill className="w-3 h-3 text-emerald-600" /> + Medicine ({prescribedMedicines.length})
                </button>
                <button
                  type="button"
                  onClick={() => addTherapyRow()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 transition"
                  title="Add Panchakarma Therapy"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" /> + Therapy ({prescribedTherapies.length})
                </button>
                <button
                  type="button"
                  onClick={() => addServiceRow()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition"
                  title="Add Clinical Service"
                >
                  <Stethoscope className="w-3 h-3 text-blue-600" /> + Service ({prescribedServices.length})
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-6">
              {/* Patient Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.phone}) {p.patientId ? `- ${p.patientId}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 1. SEPARATE SECTION: MEDICINES (AUSHADHI) */}
              <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Prescribed Medicines (Aushadhi)
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {prescribedMedicines.length}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-400">Internal Ayurvedic formulations, Kashayams, tablets & tonics</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addMedicineRow()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 hover:bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
                  >
                    <Plus className="w-3 h-3" /> Add Medicine
                  </button>
                </div>

                {prescribedMedicines.length === 0 ? (
                  <div className="p-3 text-center border border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-400 text-xs">
                    No internal medicines prescribed. Click <button type="button" onClick={() => addMedicineRow()} className="text-emerald-600 font-bold underline ml-1">+ Add Medicine</button> if needed.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {prescribedMedicines.map((m, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-750 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Medicine #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeMedicineRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-lg transition"
                            title="Remove Medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Medicine Name *</label>
                            {catalog.meds.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateMedicineRow(idx, 'name', e.target.value);
                                  }
                                }}
                                className="w-full mb-1 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg px-2 py-1 text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold"
                              >
                                <option value="">-- Quick Select Medicine (with Fee / MRP) --</option>
                                {catalog.meds.map((cm, i) => (
                                  <option key={i} value={cm.name}>
                                    {cm.name} — ₹{cm.price} [{cm.category}]
                                  </option>
                                ))}
                              </select>
                            )}
                            <input
                              type="text"
                              required
                              value={m.name}
                              onChange={(e) => updateMedicineRow(idx, 'name', e.target.value)}
                              placeholder="e.g. Maharasnadi Kashayam, Triphala..."
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                              list={`med-datalist-${idx}`}
                            />
                            <datalist id={`med-datalist-${idx}`}>
                              {catalog.meds.map((cm, i) => (
                                <option key={i} value={cm.name} label={`₹${cm.price} (${cm.category})`}>
                                  {cm.name} — ₹{cm.price} ({cm.category})
                                </option>
                              ))}
                            </datalist>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Dosage</label>
                            <input
                              type="text"
                              value={m.dosage}
                              onChange={(e) => updateMedicineRow(idx, 'dosage', e.target.value)}
                              placeholder="e.g. 1 Tab / 15ml"
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Timing / Frequency</label>
                            <select
                              value={m.frequency}
                              onChange={(e) => updateMedicineRow(idx, 'frequency', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            >
                              {TIMING_OPTIONS.Medicine.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Duration</label>
                            <input
                              type="text"
                              value={m.duration}
                              onChange={(e) => updateMedicineRow(idx, 'duration', e.target.value)}
                              placeholder="e.g. 7 Days"
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={m.instructions}
                            onChange={(e) => updateMedicineRow(idx, 'instructions', e.target.value)}
                            placeholder="Anupana / Instructions (optional: e.g. With 45ml lukewarm water after food)"
                            className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. SEPARATE SECTION: PANCHAKARMA & THERAPIES */}
              <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Panchakarma & Clinical Therapies
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {prescribedTherapies.length}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-400">External procedures, Kriyas, Shirodhara & therapy courses</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addTherapyRow()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 hover:bg-purple-100 dark:bg-purple-950 px-2.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 transition"
                  >
                    <Plus className="w-3 h-3" /> Add Therapy
                  </button>
                </div>

                {prescribedTherapies.length === 0 ? (
                  <div className="p-3 text-center border border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-400 text-xs">
                    No therapies prescribed. Click <button type="button" onClick={() => addTherapyRow()} className="text-purple-600 font-bold underline ml-1">+ Add Therapy</button> if external procedures or Panchakarma are required.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {prescribedTherapies.map((t, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-750 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Therapy #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeTherapyRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-lg transition"
                            title="Remove Therapy"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Therapy Name *</label>
                            {catalog.therapies.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const selected = catalog.therapies.find(ct => ct.name === e.target.value);
                                    updateTherapyRow(idx, 'name', e.target.value);
                                    if (selected?.duration) updateTherapyRow(idx, 'duration', selected.duration);
                                  }
                                }}
                                className="w-full mb-1 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-lg px-2 py-1 text-[11px] text-purple-900 dark:text-purple-300 font-semibold"
                              >
                                <option value="">-- Quick Select Therapy (with Fee) --</option>
                                {catalog.therapies.map((ct, i) => (
                                  <option key={i} value={ct.name}>
                                    {ct.name} — ₹{ct.price} ({ct.duration}) [{ct.category}]
                                  </option>
                                ))}
                              </select>
                            )}
                            <input
                              type="text"
                              required
                              value={t.name}
                              onChange={(e) => updateTherapyRow(idx, 'name', e.target.value)}
                              placeholder="e.g. Shirodhara, Abhyanga, Janu Basti..."
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                              list={`therapy-datalist-${idx}`}
                            />
                            <datalist id={`therapy-datalist-${idx}`}>
                              {catalog.therapies.map((ct, i) => (
                                <option key={i} value={ct.name} label={`₹${ct.price} (${ct.duration})`}>
                                  {ct.name} — ₹{ct.price} ({ct.duration})
                                </option>
                              ))}
                            </datalist>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Sessions</label>
                            <input
                              type="text"
                              value={t.sessions}
                              onChange={(e) => updateTherapyRow(idx, 'sessions', e.target.value)}
                              placeholder="e.g. 7 Sessions"
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Schedule / Frequency</label>
                            <select
                              value={t.frequency}
                              onChange={(e) => updateTherapyRow(idx, 'frequency', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            >
                              {TIMING_OPTIONS.Therapy.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Duration</label>
                            <input
                              type="text"
                              value={t.duration}
                              onChange={(e) => updateTherapyRow(idx, 'duration', e.target.value)}
                              placeholder="e.g. 60 mins"
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={t.instructions}
                            onChange={(e) => updateTherapyRow(idx, 'instructions', e.target.value)}
                            placeholder="Therapy notes (optional: e.g. Continuous medicated oil flow, warm water bath after session)"
                            className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. SEPARATE SECTION: CLINICAL SERVICES & PROCEDURES */}
              <div className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Clinical Services & Follow-ups
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {prescribedServices.length}
                        </span>
                      </h3>
                      <p className="text-[10px] text-slate-400">Consultations, review visits, Nadi Pariksha, and lifestyle guidance</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addServiceRow()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 hover:bg-blue-100 dark:bg-blue-950 px-2.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 transition"
                  >
                    <Plus className="w-3 h-3" /> Add Service
                  </button>
                </div>

                {prescribedServices.length === 0 ? (
                  <div className="p-3 text-center border border-dashed border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-400 text-xs">
                    No clinical services prescribed. Click <button type="button" onClick={() => addServiceRow()} className="text-blue-600 font-bold underline ml-1">+ Add Service</button> for follow-up reviews or specialized consultations.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {prescribedServices.map((s, idx) => (
                      <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-750 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">Service #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeServiceRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded-lg transition"
                            title="Remove Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Service Name *</label>
                            {catalog.clinicServices.length > 0 && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const selected = catalog.clinicServices.find(cs => cs.name === e.target.value);
                                    updateServiceRow(idx, 'name', e.target.value);
                                    if (selected?.duration) updateServiceRow(idx, 'duration', selected.duration);
                                  }
                                }}
                                className="w-full mb-1 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-lg px-2 py-1 text-[11px] text-blue-900 dark:text-blue-300 font-semibold"
                              >
                                <option value="">-- Quick Select Service (with Fee) --</option>
                                {catalog.clinicServices.map((cs, i) => (
                                  <option key={i} value={cs.name}>
                                    {cs.name} — ₹{cs.price} ({cs.duration}) [{cs.category}]
                                  </option>
                                ))}
                              </select>
                            )}
                            <input
                              type="text"
                              required
                              value={s.name}
                              onChange={(e) => updateServiceRow(idx, 'name', e.target.value)}
                              placeholder="e.g. Vaidya Consultation, Nadi Pariksha..."
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                              list={`service-datalist-${idx}`}
                            />
                            <datalist id={`service-datalist-${idx}`}>
                              {catalog.clinicServices.map((cs, i) => (
                                <option key={i} value={cs.name} label={`₹${cs.price} (${cs.duration})`}>
                                  {cs.name} — ₹{cs.price} ({cs.duration})
                                </option>
                              ))}
                            </datalist>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Sessions / Review</label>
                            <input
                              type="text"
                              value={s.sessions}
                              onChange={(e) => updateServiceRow(idx, 'sessions', e.target.value)}
                              placeholder="e.g. 1 Session"
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Schedule / Frequency</label>
                            <select
                              value={s.frequency}
                              onChange={(e) => updateServiceRow(idx, 'frequency', e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            >
                              {TIMING_OPTIONS.Service.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Duration</label>
                            <input
                              type="text"
                              value={s.duration}
                              onChange={(e) => updateServiceRow(idx, 'duration', e.target.value)}
                              placeholder="e.g. 30 mins"
                              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={s.instructions}
                            onChange={(e) => updateServiceRow(idx, 'instructions', e.target.value)}
                            placeholder="Service notes (optional: e.g. Dietary review, blood pressure check)"
                            className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctor Advice / Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Doctor's General Advice & Lifestyle Instructions (Optional)
                </label>
                <textarea
                  rows="2"
                  value={adviceNotes}
                  onChange={(e) => setAdviceNotes(e.target.value)}
                  placeholder="e.g. Drink warm water, avoid cold/sour items, review after 7 days..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                {editingRxId && (
                  <button
                    type="button"
                    onClick={cancelEditRx}
                    className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-850 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> {editingRxId ? 'Update Prescription' : 'Issue Complete Prescription'}
                </button>
              </div>
            </form>
          </div>

          {/* Recently Issued Prescriptions Sidebar Feed */}
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
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {rx.prescriptionNo}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white mt-1">{rx.patientName}</h4>
                        <p className="text-[11px] text-slate-400">{new Date(rx.date || rx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewRx(rx)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-xs transition"
                          title="View Prescription Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrintRx(rx)}
                          className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-xs transition"
                          title="Print Prescription Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      {(() => {
                        const { meds, therapies, services } = extractRxCategories(rx);
                        return (
                          <>
                            {meds.map((m, idx) => (
                              <div key={`m-${idx}`} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 truncate">
                                  {renderItemTypeBadge('Medicine')}
                                  <span className="font-medium truncate">{m.name}</span>
                                </div>
                                <span className="text-slate-400 shrink-0">{m.dosage || ''}</span>
                              </div>
                            ))}
                            {therapies.map((t, idx) => (
                              <div key={`t-${idx}`} className="text-[11px] text-purple-700 dark:text-purple-300 flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 truncate">
                                  {renderItemTypeBadge('Therapy')}
                                  <span className="font-medium truncate">{t.name}</span>
                                </div>
                                <span className="text-purple-500 shrink-0">{t.sessions || ''}</span>
                              </div>
                            ))}
                            {services.map((s, idx) => (
                              <div key={`s-${idx}`} className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 truncate">
                                  {renderItemTypeBadge('Service')}
                                  <span className="font-medium truncate">{s.name}</span>
                                </div>
                                <span className="text-blue-500 shrink-0">{s.sessions || ''}</span>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>

                    {(rx.pathyaApathyaNotes || rx.notes) && (
                      <p className="text-[10px] text-slate-500 italic bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60">
                        {rx.pathyaApathyaNotes || rx.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive View Prescription Modal */}
      {viewRx && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {viewRx.prescriptionNo}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">Prescription Details</h3>
                <p className="text-xs text-slate-400">Date: {new Date(viewRx.date || viewRx.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setViewRx(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient & Doctor Details Card */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block font-medium">Patient Name:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewRx.patientName}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Attending Doctor:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewRx.doctorName || 'Doctor'}</p>
              </div>
            </div>

            {/* Prescribed Items Separated by Category */}
            {(() => {
              const { meds, therapies, services } = extractRxCategories(viewRx);
              const totalItems = meds.length + therapies.length + services.length;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Prescribed Clinical Items ({totalItems})
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                      {meds.length > 0 && <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">{meds.length} Meds</span>}
                      {therapies.length > 0 && <span className="text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">{therapies.length} Therapies</span>}
                      {services.length > 0 && <span className="text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{services.length} Services</span>}
                    </div>
                  </div>

                  {/* 1. Medicines Table */}
                  {meds.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        <span>Prescribed Medicines (Aushadhi) ({meds.length})</span>
                      </div>
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">Medicine Name</th>
                              <th className="py-2 px-3">Dosage</th>
                              <th className="py-2 px-3">Timing / Frequency</th>
                              <th className="py-2 px-3">Duration</th>
                              <th className="py-2 px-3">Instructions / Anupana</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {meds.map((m, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                                <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{m.name}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.dosage || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.timing || m.frequency || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.duration || '—'}</td>
                                <td className="py-2 px-3 text-slate-500 italic">{m.instructions || m.anupana || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 2. Therapies Table */}
                  {therapies.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-300">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Panchakarma & Clinical Therapies ({therapies.length})</span>
                      </div>
                      <div className="border border-purple-200 dark:border-purple-800/60 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 font-bold border-b border-purple-200 dark:border-purple-800">
                            <tr>
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">Therapy / Treatment</th>
                              <th className="py-2 px-3">Sessions</th>
                              <th className="py-2 px-3">Schedule / Timing</th>
                              <th className="py-2 px-3">Duration</th>
                              <th className="py-2 px-3">Clinical Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-100 dark:divide-purple-900/40">
                            {therapies.map((t, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-3 font-bold text-purple-400">{idx + 1}</td>
                                <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{t.name}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{t.sessions || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{t.frequency || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{t.duration || '—'}</td>
                                <td className="py-2 px-3 text-slate-500 italic">{t.instructions || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 3. Services Table */}
                  {services.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span>Clinical Services & Follow-ups ({services.length})</span>
                      </div>
                      <div className="border border-blue-200 dark:border-blue-800/60 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold border-b border-blue-200 dark:border-blue-800">
                            <tr>
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">Service Name</th>
                              <th className="py-2 px-3">Sessions / Review</th>
                              <th className="py-2 px-3">Schedule</th>
                              <th className="py-2 px-3">Duration</th>
                              <th className="py-2 px-3">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-100 dark:divide-blue-900/40">
                            {services.map((s, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-3 font-bold text-blue-400">{idx + 1}</td>
                                <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{s.sessions || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{s.frequency || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{s.duration || '—'}</td>
                                <td className="py-2 px-3 text-slate-500 italic">{s.instructions || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Doctor Advice / Notes */}
            {(viewRx.pathyaApathyaNotes || viewRx.notes) && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  Doctor's Advice & Patient Instructions:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {viewRx.pathyaApathyaNotes || viewRx.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {viewRx.dispensed ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dispensed to Bill
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const target = viewRx;
                    setViewRx(null);
                    handleDispenseRx(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Pill className="w-3.5 h-3.5" /> Dispense from Pharmacy &amp; Bill
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewRx(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewRx;
                  setViewRx(null);
                  handlePrintRx(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Prescription Slip
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Printable Prescription Slip Modal (Visible during print) */}
      {previewRx && (
        <div className="fixed inset-0 z-50 bg-white text-slate-900 p-8 print:block hidden overflow-y-auto" id="printable-rx">
          <div className="max-w-3xl mx-auto space-y-6 border-b pb-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h1 className="text-2xl font-black text-emerald-900 uppercase">AYURVEDIC CLINIC & HOSPITAL</h1>
                <p className="text-xs text-slate-500">Holistic Care, Panchakarma Therapy & Clinical Dispensary</p>
                <p className="text-xs text-slate-500">Phone: +91 98470 12345 | opd@ayurvedichospital.com</p>
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
                <span className="font-bold">Attending Doctor:</span> {previewRx.doctorName}
              </div>
            </div>

            {/* Prescribed Items Tables: Separate for Medicines, Therapies, Services */}
            {(() => {
              const { meds, therapies, services } = extractRxCategories(previewRx);
              return (
                <div className="space-y-4">
                  {/* 1. Medicines */}
                  {meds.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-900 border-b border-emerald-300 pb-1 mb-2">
                        Prescribed Medicines (Aushadhi)
                      </h3>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b text-slate-600 font-semibold">
                            <th className="py-1 w-6">#</th>
                            <th className="py-1">Medicine Name</th>
                            <th className="py-1">Dosage</th>
                            <th className="py-1">Timing</th>
                            <th className="py-1">Duration</th>
                            <th className="py-1">Instructions / Anupana</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meds.map((m, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-1.5 font-bold">{idx + 1}</td>
                              <td className="py-1.5 font-bold text-slate-900">{m.name}</td>
                              <td className="py-1.5">{m.dosage || '—'}</td>
                              <td className="py-1.5">{m.timing || m.frequency || 'After Food'}</td>
                              <td className="py-1.5">{m.duration || '—'}</td>
                              <td className="py-1.5 text-slate-600">{m.instructions || m.anupana || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 2. Therapies */}
                  {therapies.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-purple-900 border-b border-purple-300 pb-1 mb-2">
                        Panchakarma & Clinical Therapies
                      </h3>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b text-slate-600 font-semibold">
                            <th className="py-1 w-6">#</th>
                            <th className="py-1">Therapy / Treatment</th>
                            <th className="py-1">Sessions</th>
                            <th className="py-1">Schedule / Frequency</th>
                            <th className="py-1">Duration</th>
                            <th className="py-1">Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {therapies.map((t, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-1.5 font-bold">{idx + 1}</td>
                              <td className="py-1.5 font-bold text-slate-900">{t.name}</td>
                              <td className="py-1.5">{t.sessions || '—'}</td>
                              <td className="py-1.5">{t.frequency || '—'}</td>
                              <td className="py-1.5">{t.duration || '—'}</td>
                              <td className="py-1.5 text-slate-600">{t.instructions || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 3. Services */}
                  {services.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 border-b border-blue-300 pb-1 mb-2">
                        Clinical Services & Procedures
                      </h3>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b text-slate-600 font-semibold">
                            <th className="py-1 w-6">#</th>
                            <th className="py-1">Service / Procedure</th>
                            <th className="py-1">Sessions / Review</th>
                            <th className="py-1">Schedule</th>
                            <th className="py-1">Duration</th>
                            <th className="py-1">Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((s, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-1.5 font-bold">{idx + 1}</td>
                              <td className="py-1.5 font-bold text-slate-900">{s.name}</td>
                              <td className="py-1.5">{s.sessions || '—'}</td>
                              <td className="py-1.5">{s.frequency || '—'}</td>
                              <td className="py-1.5">{s.duration || '—'}</td>
                              <td className="py-1.5 text-slate-600">{s.instructions || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Advice / Notes */}
            {(previewRx.pathyaApathyaNotes || previewRx.notes) && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-900">Doctor's Advice & Patient Instructions:</span>
                <p className="mt-1 text-slate-800">{previewRx.pathyaApathyaNotes || previewRx.notes}</p>
              </div>
            )}

            {/* Footer / Signature */}
            <div className="flex justify-between items-end pt-12">
              <div className="text-[11px] text-slate-400">
                Generated via Ayurvedic Clinic System
              </div>
              <div className="text-center text-xs">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <span className="font-bold">{previewRx.doctorName}</span>
                <div className="text-[10px] text-slate-500">Authorized Signature</div>
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
