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
  LayoutGrid
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const THERAPY_OPTIONS = [
  'Abhyanga & Swedana (Herbal Oil Massage & Steam)',
  'Shirodhara (Continuous Medicated Oil Pouring)',
  'Elakizhi (Herbal Leaf Bolus Bag)',
  'Podikizhi (Herbal Powder Bolus Bag)',
  'Njavarakizhi (Shashtika Shali Pinda Sweda)',
  'Kati Basti (Medicated Oil Retention on Lower Back)',
  'Janu Basti (Medicated Oil Retention on Knee)',
  'Greeva Basti (Medicated Oil Retention on Neck)',
  'Pizhichil (Medicated Oil Bath / Royal Treatment)',
  'Nasya Karma (Nasal Errhine Therapy)',
  'Virechana Karma (Therapeutic Purgation)',
  'Vamana Karma (Therapeutic Emesis)',
  'Matra Basti / Sneha Basti (Medicated Oil Enema)',
  'Kashaya Basti / Niruha Basti (Herbal Decoction Enema)',
  'Udvartana (Herbal Powder Exfoliation / Weight Management)',
  'Takradhara (Medicated Buttermilk Pouring)',
  'Lepam & Mukhalepam (Ayurvedic Herbal Paste Application)',
  'Netra Tarpana (Medicated Ghee Eye Bath)'
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

  // New Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    patientName: '',
    patientPhone: '',
    doctorName: 'Dr. Arya Warrier (BAMS, MD)',
    therapistName: 'Rahul K. (Male Therapist)',
    therapistGender: 'Male',
    therapyName: 'Janu Basti (Medicated Oil Retention on Knee)',
    serviceId: '',
    roomOrDroni: 'Panchakarma Suite 1 (Droni A)',
    totalSessions: 7,
    timeSlot: '08:00 AM - 09:15 AM',
    packageCost: 7500,
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

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      alert('Please select a patient.');
      return;
    }

    try {
      const res = await polyclinicService.createPanchakarmaBooking(formData);
      if (res.success) {
        setShowBookingModal(false);
        fetchData();
        setConfirmModal({
          isOpen: true,
          title: 'Panchakarma Package Booked',
          message: `Therapy package "${formData.therapyName}" (${formData.totalSessions} sessions) created for ${formData.patientName}.`,
          confirmText: 'Done',
          variant: 'success',
          onConfirm: () => {}
        });
      }
    } catch (err) {
      alert(err.message);
    }
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
          onClick={() => setShowBookingModal(true)}
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
                    <tr key={b._id} className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
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
                <Sparkles className="w-5 h-5 text-emerald-500" /> Book Ayurvedic Therapy Package
              </h2>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Therapy Procedure / Service *
                  </label>
                  <span className="text-[10px] text-slate-400">Auto-sets package price &amp; duration</span>
                </div>
                <select
                  value={formData.therapyName}
                  onChange={(e) => {
                    const val = e.target.value;
                    const matchedService = services.find(s => s.name === val || s._id === val);
                    if (matchedService) {
                      setFormData(prev => ({
                        ...prev,
                        therapyName: matchedService.name,
                        serviceId: matchedService._id,
                        packageCost: matchedService.price * (prev.totalSessions || 1),
                        pradhanaKarmaNotes: matchedService.description || prev.pradhanaKarmaNotes
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        therapyName: val,
                        serviceId: ''
                      }));
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                >
                  {services.length > 0 && (
                    <optgroup label="✨ Clinic Catalog Services (Official Pricing &amp; Duration)">
                      {services.map(s => (
                        <option key={s._id} value={s.name}>
                          {s.name} — ₹{s.price} ({s.duration}) [{s.category}]
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="🌿 Traditional Classical Panchakarma Procedures">
                    {THERAPY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </optgroup>
                </select>

                {(() => {
                  const s = services.find(x => x.name === formData.therapyName || x._id === formData.serviceId);
                  return s ? (
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20">
                      <span className="flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{s.category}</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" /> {s.duration}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{s.price}/session
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
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
                      const s = services.find(x => x.name === formData.therapyName || x._id === formData.serviceId);
                      setFormData(prev => ({
                        ...prev,
                        totalSessions: newSessions,
                        packageCost: s ? (s.price * newSessions) : prev.packageCost
                      }));
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Package Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.packageCost}
                    onChange={(e) => setFormData({ ...formData, packageCost: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
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
                  Confirm Booking
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
