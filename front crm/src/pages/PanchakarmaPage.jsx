import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Activity, 
  ChevronRight, 
  Flame, 
  Droplet, 
  X,
  FileText,
  BedDouble,
  HeartPulse,
  Table,
  LayoutGrid,
  Edit2,
  Trash2
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const THERAPY_OPTIONS = [
  { name: 'Abhyanga & Swedana (Herbal Oil Massage & Steam)', fee: 1200, duration: '60 mins' },
  { name: 'Shirodhara (Continuous Medicated Oil Pouring)', fee: 1500, duration: '45 mins' },
  { name: 'Elakizhi (Herbal Leaf Bolus Bag)', fee: 1200, duration: '45 mins' },
  { name: 'Podikizhi (Herbal Powder Bolus Bag)', fee: 1100, duration: '45 mins' },
  { name: 'Njavarakizhi (Shashtika Shali Pinda Sweda)', fee: 1800, duration: '60 mins' },
  { name: 'Kati Basti (Medicated Oil Retention on Lower Back)', fee: 850, duration: '30 mins' },
  { name: 'Janu Basti (Medicated Oil Retention on Knee)', fee: 850, duration: '30 mins' },
  { name: 'Greeva Basti (Medicated Oil Retention on Neck)', fee: 850, duration: '30 mins' },
  { name: 'Pizhichil (Medicated Oil Bath / Royal Treatment)', fee: 2500, duration: '60 mins' },
  { name: 'Nasya Karma (Nasal Errhine Therapy)', fee: 750, duration: '30 mins' },
  { name: 'Virechana Karma (Therapeutic Purgation)', fee: 3000, duration: 'Procedure Protocol' },
  { name: 'Vamana Karma (Therapeutic Emesis)', fee: 3500, duration: 'Procedure Protocol' },
  { name: 'Matra Basti / Sneha Basti (Medicated Oil Enema)', fee: 800, duration: '30 mins' },
  { name: 'Kashaya Basti / Niruha Basti (Herbal Decoction Enema)', fee: 1200, duration: '45 mins' },
  { name: 'Udvartana (Herbal Powder Exfoliation / Weight Management)', fee: 1300, duration: '45 mins' },
  { name: 'Takradhara (Medicated Buttermilk Pouring)', fee: 1400, duration: '45 mins' },
  { name: 'Lepam & Mukhalepam (Ayurvedic Herbal Paste Application)', fee: 650, duration: '30 mins' },
  { name: 'Netra Tarpana (Medicated Ghee Eye Bath)', fee: 900, duration: '30 mins' }
];

export default function PanchakarmaPage() {
  const [bookings, setBookings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('table');

  // New / Edit Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [formData, setFormData] = useState({
    patient: '',
    patientName: '',
    patientPhone: '',
    doctorName: 'Dr. Arya Warrier (BAMS, MD)',
    therapistName: 'Rahul K. (Male Therapist)',
    therapistGender: 'Male',
    selectedTherapies: [
      { name: 'Janu Basti (Medicated Oil Retention on Knee)', price: 1200, fee: 1200, duration: '45 mins', category: 'Panchakarma Therapy' }
    ],
    therapyName: 'Janu Basti (Medicated Oil Retention on Knee)',
    serviceId: '',
    roomOrDroni: 'Panchakarma Suite 1 (Droni A)',
    totalSessions: 7,
    timeSlot: '08:00 AM - 09:15 AM',
    packageCost: 8400,
    medicatedOilOrKashayam: 'Mahanarayana Thailam & Ksheerabala 101',
    purvaKarmaNotes: 'Pre-check: BP, pulse. Local Snehana & Nadi Swedana.',
    pradhanaKarmaNotes: 'Main procedure administered with prescribed temperature retention.',
    paschatKarmaNotes: 'Post-procedure: Mild herbal swedana, avoid cold drinks and breeze.'
  });

  // Session Logging Modal
  const [selectedBookingForSession, setSelectedBookingForSession] = useState(null);
  const [sessionLogData, setSessionLogData] = useState({
    therapistName: '',
    vitals: { bp: '120/80', pulse: '74' },
    observationNotes: 'Procedure completed comfortably. Patient tolerated treatment well.'
  });

  // Details Modal
  const [viewDetailsBooking, setViewDetailsBooking] = useState(null);

  // Confirmation Modal
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
      const [bkRes, ptRes, docRes, srvRes] = await Promise.all([
        polyclinicService.getPanchakarmaBookings(),
        polyclinicService.getPatients(),
        polyclinicService.getDoctors(),
        polyclinicService.getServices()
      ]);

      if (bkRes.success) setBookings(bkRes.bookings || []);
      if (ptRes.success) setPatients(ptRes.patients || []);
      if (docRes.success) setDoctors(docRes.doctors || []);
      if (srvRes.success && srvRes.services) setServices(srvRes.services.filter(s => s.status !== 'Inactive'));
    } catch (err) {
      console.error('Error fetching Panchakarma data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patientId) => {
    const p = patients.find(pat => pat._id === patientId);
    if (p) {
      setFormData(prev => ({
        ...prev,
        patient: p._id,
        patientName: p.name,
        patientPhone: p.phone || '',
        therapistGender: p.gender === 'Female' ? 'Female' : 'Male',
        therapistName: p.gender === 'Female' ? 'Priya Nair (Female Therapist)' : 'Rahul K. (Male Therapist)'
      }));
    }
  };

  const handleAddTherapyToPackage = (therapyObj) => {
    if (!therapyObj || !therapyObj.name) return;
    const current = formData.selectedTherapies || [];
    if (current.some(t => t.name.toLowerCase() === therapyObj.name.toLowerCase())) {
      return; // Already in selection
    }
    const updated = [...current, {
      name: therapyObj.name,
      price: Number(therapyObj.price || therapyObj.fee) || 1200,
      fee: Number(therapyObj.price || therapyObj.fee) || 1200,
      duration: therapyObj.duration || '45 mins',
      category: therapyObj.category || 'Panchakarma Therapy',
      serviceId: therapyObj._id || therapyObj.serviceId || ''
    }];
    const combinedName = updated.map(t => t.name).join(' + ');
    const perSession = updated.reduce((sum, t) => sum + (Number(t.price || t.fee) || 0), 0);
    const newCost = perSession * (formData.totalSessions || 1);
    setFormData(prev => ({
      ...prev,
      selectedTherapies: updated,
      therapyName: combinedName,
      packageCost: newCost,
      pradhanaKarmaNotes: therapyObj.description ? `${prev.pradhanaKarmaNotes ? prev.pradhanaKarmaNotes + ' | ' : ''}${therapyObj.description}` : prev.pradhanaKarmaNotes
    }));
  };

  const handleRemoveTherapyFromPackage = (indexToRemove) => {
    const current = formData.selectedTherapies || [];
    if (current.length <= 1) {
      alert('At least one therapy procedure must be selected for a Panchakarma booking.');
      return;
    }
    const updated = current.filter((_, idx) => idx !== indexToRemove);
    const combinedName = updated.map(t => t.name).join(' + ');
    const perSession = updated.reduce((sum, t) => sum + (Number(t.price || t.fee) || 0), 0);
    const newCost = perSession * (formData.totalSessions || 1);
    setFormData(prev => ({
      ...prev,
      selectedTherapies: updated,
      therapyName: combinedName,
      packageCost: newCost
    }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      alert('Please select a patient.');
      return;
    }

    try {
      const therapiesPayload = (formData.selectedTherapies && formData.selectedTherapies.length > 0)
        ? formData.selectedTherapies
        : [{ name: formData.therapyName, price: formData.packageCost / (formData.totalSessions || 1), duration: '45 mins' }];

      const combinedName = therapiesPayload.map(t => t.name).join(' + ');
      const payload = {
        ...formData,
        therapies: therapiesPayload,
        therapyName: combinedName || formData.therapyName
      };

      let res;
      if (editingBookingId) {
        res = await polyclinicService.updatePanchakarmaBooking(editingBookingId, payload);
      } else {
        res = await polyclinicService.createPanchakarmaBooking(payload);
      }

      if (res.success) {
        setShowBookingModal(false);
        const wasEditing = Boolean(editingBookingId);
        setEditingBookingId(null);
        fetchData();
        setConfirmModal({
          isOpen: true,
          title: wasEditing ? 'Therapy Package Updated' : 'Panchakarma Package Booked',
          message: wasEditing
            ? `Therapy package "${combinedName}" updated successfully.`
            : `Therapy package "${combinedName}" (${formData.totalSessions} sessions) created for ${formData.patientName}.`,
          confirmText: 'Done',
          variant: 'success',
          onConfirm: () => {}
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleOpenEditBooking = (b) => {
    setEditingBookingId(b._id);

    let initialTherapies = [];
    if (Array.isArray(b.therapies) && b.therapies.length > 0) {
      initialTherapies = b.therapies.map(t => ({
        name: t.name,
        price: t.price || t.fee || 1200,
        fee: t.price || t.fee || 1200,
        duration: t.duration || '45 mins',
        category: t.category || 'Panchakarma Therapy',
        serviceId: t.serviceId || ''
      }));
    } else if (b.therapyName) {
      const parts = b.therapyName.split(' + ');
      initialTherapies = parts.map(name => {
        const found = services.find(s => s.name === name) || THERAPY_OPTIONS.find(t => t.name === name);
        return {
          name,
          price: found?.price || found?.fee || 1200,
          fee: found?.price || found?.fee || 1200,
          duration: found?.duration || '45 mins',
          category: found?.category || 'Panchakarma Therapy',
          serviceId: found?._id || ''
        };
      });
    }

    setFormData({
      patient: b.patient?._id || b.patient || '',
      patientName: b.patientName || '',
      patientPhone: b.patientPhone || '',
      doctorName: b.doctorName || 'Dr. Arya Warrier (BAMS, MD)',
      therapistName: b.therapistName || 'Rahul K. (Male Therapist)',
      therapistGender: b.therapistGender || 'Male',
      selectedTherapies: initialTherapies.length > 0 ? initialTherapies : [
        { name: b.therapyName || 'Abhyanga & Swedana', price: 1200, fee: 1200, duration: '60 mins', category: 'Panchakarma Therapy' }
      ],
      therapyName: b.therapyName || 'Abhyanga & Swedana',
      serviceId: b.serviceId || '',
      roomOrDroni: b.roomOrDroni || 'Panchakarma Suite 1 (Droni A)',
      totalSessions: b.totalSessions || 7,
      timeSlot: b.timeSlot || '08:00 AM - 09:15 AM',
      packageCost: b.packageCost || 7500,
      medicatedOilOrKashayam: b.medicatedOilOrKashayam || 'Mahanarayana Thailam & Ksheerabala 101',
      purvaKarmaNotes: b.purvaKarmaNotes || '',
      pradhanaKarmaNotes: b.pradhanaKarmaNotes || '',
      paschatKarmaNotes: b.paschatKarmaNotes || ''
    });
    setShowBookingModal(true);
  };

  const handleDeleteBooking = (b) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Panchakarma Booking',
      message: `Are you sure you want to cancel and delete therapy package "${b.therapyName}" for ${b.patientName}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await polyclinicService.deletePanchakarmaBooking(b._id);
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || err.message || 'Failed to delete booking');
        }
      }
    });
  };

  const handleOpenLogSession = (booking) => {
    setSelectedBookingForSession(booking);
    setSessionLogData({
      therapistName: booking.therapistName || 'Assigned Therapist',
      vitals: { bp: '120/80', pulse: '74' },
      observationNotes: 'Procedure completed comfortably with good therapeutic response.'
    });
  };

  const handleSubmitSessionLog = async (e) => {
    e.preventDefault();
    if (!selectedBookingForSession) return;

    try {
      const res = await polyclinicService.logPanchakarmaSession(selectedBookingForSession._id, sessionLogData);
      if (res.success) {
        setSelectedBookingForSession(null);
        fetchData();
        setConfirmModal({
          isOpen: true,
          title: 'Session Successfully Logged',
          message: `Session #${(selectedBookingForSession.completedSessions || 0) + 1} of ${selectedBookingForSession.totalSessions} recorded for ${selectedBookingForSession.patientName}.`,
          confirmText: 'OK',
          variant: 'success',
          onConfirm: () => {}
        });
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.therapyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.bookingNo && b.bookingNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeCount = bookings.filter(b => b.status === 'In-Progress' || b.status === 'Scheduled').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.packageCost || 0), 0);

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Ayurvedic Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Sparkles className="w-3 h-3" /> Classical Ayurvedic Chikitsa & Shodhana
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Panchakarma & Therapy Center
          </h1>
          <p className="text-emerald-200/80 text-xs sm:text-sm max-w-2xl">
            Therapy package scheduling, treatment room & Droni bed allocation, male/female therapist assignment, Purva-Pradhana-Paschat Karma session tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBookingId(null);
            setFormData({
              patient: '',
              patientName: '',
              patientPhone: '',
              doctorName: 'Dr. Arya Warrier (BAMS, MD)',
              therapistName: 'Rahul K. (Male Therapist)',
              therapistGender: 'Male',
              selectedTherapies: [
                { name: 'Janu Basti (Medicated Oil Retention on Knee)', price: 1200, fee: 1200, duration: '45 mins', category: 'Panchakarma Therapy' }
              ],
              therapyName: 'Janu Basti (Medicated Oil Retention on Knee)',
              serviceId: '',
              roomOrDroni: 'Panchakarma Suite 1 (Droni A)',
              totalSessions: 7,
              timeSlot: '08:00 AM - 09:15 AM',
              packageCost: 8400,
              medicatedOilOrKashayam: 'Mahanarayana Thailam & Ksheerabala 101',
              purvaKarmaNotes: 'Pre-check: BP, pulse. Local Snehana & Nadi Swedana.',
              pradhanaKarmaNotes: 'Main procedure administered with prescribed temperature retention.',
              paschatKarmaNotes: 'Rest 15 mins, lukewarm water wash, avoid cold exposure.'
            });
            setShowBookingModal(true);
          }}
          className="relative z-10 inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg transition text-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Book Therapy Package
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{activeCount}</div>
            <div className="text-xs text-slate-500">Active Therapy Packages</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{bookings.length}</div>
            <div className="text-xs text-slate-500">Total Bookings</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{completedCount}</div>
            <div className="text-xs text-slate-500">Completed Courses</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111622] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Therapy Revenue Booked</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, therapy name, or booking no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
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
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['All', 'In-Progress', 'Scheduled', 'Completed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  filterStatus === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Therapy Packages Content */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center">
          <BedDouble className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Therapy Packages Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || filterStatus !== 'All' 
              ? 'No therapy bookings match your search filters.' 
              : 'Start by scheduling an Ayurvedic therapy package for your patients.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Therapy & Herbal Oil</th>
                  <th className="py-3 px-4">Vaidya / Therapist</th>
                  <th className="py-3 px-4">Room & Slot</th>
                  <th className="py-3 px-4">Sessions Progress</th>
                  <th className="py-3 px-4">Package Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredBookings.map((b) => {
                  const progressPercent = Math.min(100, Math.round(((b.completedSessions || 0) / (b.totalSessions || 1)) * 100));
                  return (
                    <tr key={b._id} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          {b.bookingNo || 'PK-' + b._id?.slice(-4).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{b.patientName}</div>
                        <div className="text-[11px] text-slate-500">{b.patientPhone || 'No phone'}</div>
                      </td>
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{b.therapyName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                          {b.medicatedOilOrKashayam || 'Standard medicated herbs'}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200">{b.doctorName || 'Assigned Vaidya'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <span>{b.therapistName || 'Therapist'}</span>
                          {b.therapistGender && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">({b.therapistGender})</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <BedDouble className="w-3 h-3 text-slate-400" />
                          <span>{b.roomOrDroni}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{b.timeSlot}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          <span>{b.completedSessions || 0}/{b.totalSessions} sessions</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{(b.packageCost || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          b.status === 'Completed'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                            : b.status === 'In-Progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewDetailsBooking(b)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title="View Protocol & Karma Notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {b.status !== 'Completed' && (
                            <button
                              onClick={() => handleOpenLogSession(b)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-sm flex items-center gap-1"
                              title="Log Daily Session"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Log Session
                            </button>
                          )}

                          {/* Hidden Edit & Delete on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditBooking(b)}
                              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60 transition"
                              title="Edit Therapy Package"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition"
                              title="Delete Therapy Booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Therapy Cards List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map(b => {
            const progressPercent = Math.min(100, Math.round(((b.completedSessions || 0) / (b.totalSessions || 1)) * 100));
            return (
              <div
                key={b._id}
                className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          {b.bookingNo}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          b.status === 'Completed'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                            : b.status === 'In-Progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                        {b.patientName}
                      </h3>
                    </div>

                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ₹{(b.packageCost || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <div className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5" /> {b.therapyName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Oil / Herb: {b.medicatedOilOrKashayam}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-slate-400">Room/Droni:</span> {b.roomOrDroni}
                    </div>
                    <div>
                      <span className="text-slate-400">Time Slot:</span> {b.timeSlot}
                    </div>
                    <div>
                      <span className="text-slate-400">Therapist:</span> {b.therapistName}
                    </div>
                    <div>
                      <span className="text-slate-400">Gender Modality:</span> {b.therapistGender}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>Course Progress</span>
                      <span>{b.completedSessions || 0} of {b.totalSessions} Sessions ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => setViewDetailsBooking(b)}
                    className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Protocol
                  </button>

                  {b.status !== 'Completed' && (
                    <button
                      onClick={() => handleOpenLogSession(b)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Log Session
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Package Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" /> {editingBookingId ? 'Edit Ayurvedic Therapy Package' : 'Book Ayurvedic Therapy Package'}
              </h2>
              <button onClick={() => { setShowBookingModal(false); setEditingBookingId(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
                <select
                  value={formData.patient}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.patientId}) - {p.gender}, Age {p.age} {p.prakriti ? `[${p.prakriti}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Therapy Procedures Included *
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {(formData.selectedTherapies || []).length} { (formData.selectedTherapies || []).length === 1 ? 'Therapy Selected' : 'Therapies Selected' }
                  </span>
                </div>

                {/* Selected Therapies Cards */}
                {(formData.selectedTherapies && formData.selectedTherapies.length > 0) && (
                  <div className="space-y-1.5 mb-2.5 max-h-48 overflow-y-auto pr-1">
                    {formData.selectedTherapies.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl border bg-slate-50/90 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition shadow-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">
                              {t.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5 text-slate-400" /> {t.duration || '45 mins'}
                              </span>
                              {t.category && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-[9px] text-slate-600 dark:text-slate-300">
                                  {t.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            ₹{t.price || t.fee || 0}/day
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTherapyFromPackage(idx)}
                            title="Remove therapy procedure"
                            className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Another Therapy Dropdown */}
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const matchedService = services.find(s => s.name === val || s._id === val);
                    if (matchedService) {
                      handleAddTherapyToPackage(matchedService);
                    } else {
                      const matchedTrad = THERAPY_OPTIONS.find(t => t.name === val);
                      if (matchedTrad) {
                        handleAddTherapyToPackage(matchedTrad);
                      }
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-dashed border-emerald-400/60 dark:border-emerald-500/40 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="">➕ Add another therapy to this package...</option>
                  {services.length > 0 && (
                    <optgroup label="✨ Clinic Catalog Services">
                      {services.map(s => {
                        const isSelected = (formData.selectedTherapies || []).some(t => t.name.toLowerCase() === s.name.toLowerCase());
                        return (
                          <option key={s._id} value={s.name} disabled={isSelected}>
                            {isSelected ? '✓ ' : ''}{s.name} — ₹{s.price} ({s.duration}) [{s.category}]
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                  <optgroup label="🌿 Traditional Classical Panchakarma Procedures">
                    {THERAPY_OPTIONS.map(opt => {
                      const isSelected = (formData.selectedTherapies || []).some(t => t.name.toLowerCase() === opt.name.toLowerCase());
                      return (
                        <option key={opt.name} value={opt.name} disabled={isSelected}>
                          {isSelected ? '✓ ' : ''}{opt.name} — ₹{opt.fee} ({opt.duration})
                        </option>
                      );
                    })}
                  </optgroup>
                </select>

                {/* Quick Add Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[10px] text-slate-400 font-medium mr-0.5">Quick Add:</span>
                  {[
                    'Shirodhara (Continuous Medicated Oil Pouring)',
                    'Abhyanga & Swedana (Herbal Oil Massage & Steam)',
                    'Janu Basti (Medicated Oil Retention on Knee)',
                    'Kati Basti (Medicated Oil Retention on Lower Back)',
                    'Elakizhi (Herbal Leaf Bolus Bag)',
                    'Njavarakizhi (Shashtika Shali Pinda Sweda)',
                    'Nasya Karma (Nasal Errhine Therapy)'
                  ].map(quickName => {
                    const isAdded = (formData.selectedTherapies || []).some(t => t.name === quickName);
                    if (isAdded) return null;
                    const shortTitle = quickName.split(' (')[0];
                    return (
                      <button
                        key={quickName}
                        type="button"
                        onClick={() => {
                          const matched = services.find(s => s.name === quickName) || THERAPY_OPTIONS.find(t => t.name === quickName);
                          if (matched) handleAddTherapyToPackage(matched);
                          else handleAddTherapyToPackage({ name: quickName, price: 1200, fee: 1200, duration: '45 mins' });
                        }}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition flex items-center gap-1"
                      >
                        <Plus className="w-2.5 h-2.5" /> {shortTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Sessions (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.totalSessions}
                    onChange={(e) => {
                      const newSessions = Number(e.target.value) || 1;
                      const perSession = (formData.selectedTherapies || []).reduce((sum, t) => sum + (Number(t.price || t.fee) || 0), 0);
                      setFormData(prev => ({
                        ...prev,
                        totalSessions: newSessions,
                        packageCost: perSession > 0 ? (perSession * newSessions) : prev.packageCost
                      }));
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300">Package Cost (₹)</label>
                    {(() => {
                      const perSession = (formData.selectedTherapies || []).reduce((sum, t) => sum + (Number(t.price || t.fee) || 0), 0);
                      return perSession > 0 ? (
                        <span className="text-[10px] text-slate-400 font-mono">₹{perSession}/day × {formData.totalSessions}d</span>
                      ) : null;
                    })()}
                  </div>
                  <input
                    type="number"
                    value={formData.packageCost}
                    onChange={(e) => setFormData({ ...formData, packageCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room / Droni Table</label>
                  <input
                    type="text"
                    value={formData.roomOrDroni}
                    onChange={(e) => setFormData({ ...formData, roomOrDroni: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Daily Time Slot</label>
                  <input
                    type="text"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Therapist Assigned</label>
                  <input
                    type="text"
                    value={formData.therapistName}
                    onChange={(e) => setFormData({ ...formData, therapistName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Therapist Gender</label>
                  <select
                    value={formData.therapistGender}
                    onChange={(e) => setFormData({ ...formData, therapistGender: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male Therapist</option>
                    <option value="Female">Female Therapist</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Medicated Oil / Herb</label>
                <input
                  type="text"
                  value={formData.medicatedOilOrKashayam}
                  onChange={(e) => setFormData({ ...formData, medicatedOilOrKashayam: e.target.value })}
                  placeholder="e.g. Mahanarayana Thailam, Ksheerabala, Murivenna"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {editingBookingId ? 'Update Therapy Booking' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {selectedBookingForSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Log Session #{(selectedBookingForSession.completedSessions || 0) + 1}
                </h3>
                <p className="text-xs text-slate-500">{selectedBookingForSession.patientName} - {selectedBookingForSession.therapyName}</p>
              </div>
              <button onClick={() => setSelectedBookingForSession(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSessionLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Attending Therapist</label>
                <input
                  type="text"
                  value={sessionLogData.therapistName}
                  onChange={(e) => setSessionLogData({ ...sessionLogData, therapistName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pre-Procedure BP</label>
                  <input
                    type="text"
                    value={sessionLogData.vitals.bp}
                    onChange={(e) => setSessionLogData({
                      ...sessionLogData,
                      vitals: { ...sessionLogData.vitals, bp: e.target.value }
                    })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pulse</label>
                  <input
                    type="text"
                    value={sessionLogData.vitals.pulse}
                    onChange={(e) => setSessionLogData({
                      ...sessionLogData,
                      vitals: { ...sessionLogData.vitals, pulse: e.target.value }
                    })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Observations & Response</label>
                <textarea
                  rows="3"
                  value={sessionLogData.observationNotes}
                  onChange={(e) => setSessionLogData({ ...sessionLogData, observationNotes: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForSession(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Mark Session Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Therapy Details Modal */}
      {viewDetailsBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Panchakarma Protocol: {viewDetailsBooking.bookingNo}
                </h3>
                <p className="text-xs text-slate-500">{viewDetailsBooking.patientName} • {viewDetailsBooking.therapyName}</p>
                {viewDetailsBooking.therapies && viewDetailsBooking.therapies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {viewDetailsBooking.therapies.map((th, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-medium">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        {th.name} {th.duration ? `(${th.duration})` : ''} — ₹{th.price || th.fee}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setViewDetailsBooking(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Purvakarma (Preparatory Protocol):</div>
                <p>{viewDetailsBooking.purvaKarmaNotes}</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <div className="font-bold text-amber-800 dark:text-amber-300 mb-1">Pradhanakarma (Main Procedure Protocol):</div>
                <p>{viewDetailsBooking.pradhanaKarmaNotes}</p>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-100 dark:border-teal-900/40">
                <div className="font-bold text-teal-800 dark:text-teal-300 mb-1">Paschatkarma (Post-Therapy Regimen & Samsarjana Krama):</div>
                <p>{viewDetailsBooking.paschatKarmaNotes}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Session History Log ({viewDetailsBooking.sessionLogs?.length || 0} Sessions)</h4>
                {(!viewDetailsBooking.sessionLogs || viewDetailsBooking.sessionLogs.length === 0) ? (
                  <p className="text-slate-400 italic">No daily sessions recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {viewDetailsBooking.sessionLogs.map((log, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-bold text-emerald-600">Session #{log.sessionNumber}</span> • {new Date(log.date).toLocaleDateString()} by {log.therapistName}
                          <div className="text-slate-500 mt-0.5">{log.observationNotes}</div>
                        </div>
                        <span className="font-mono text-slate-400">BP: {log.vitals?.bp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setViewDetailsBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
              >
                Close
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
