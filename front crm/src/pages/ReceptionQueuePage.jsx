import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, Clock, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, 
  Stethoscope, Plus, Printer, Volume2, Tv, X, User, Phone, 
  Building2, Sparkles, Activity, FileText, Table, LayoutGrid, Search,
  Edit2, Trash2, History, Users
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';
import PatientDetailsModal from '../components/PatientDetailsModal';

export default function ReceptionQueuePage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [selectedPatientIdForDetails, setSelectedPatientIdForDetails] = useState(null);
  const [editingTokenId, setEditingTokenId] = useState(null);

  // TV Waiting Lounge Display Mode
  const [isTvMode, setIsTvMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Walk-in Token Generator Modal
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [patientMode, setPatientMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    prakriti: 'Vata-Pitta'
  });
  const [tokenForm, setTokenForm] = useState({
    doctorId: '',
    doctorName: '',
    serviceId: '',
    serviceName: '',
    serviceCategory: '',
    serviceDuration: '',
    servicePrice: 0,
    department: 'Ayurvedic OP',
    appointmentType: 'Doctor Consultation',
    cabin: 'OP Cabin 1 (Kayachikitsa)',
    consultationFee: 500,
    notes: 'Walk-in OP Consultation'
  });

  // Token Slip Print Modal
  const [activeSlip, setActiveSlip] = useState(null);

  // Phone lookup dropdown and existing patient search state
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(true);
  const [existingSearchQuery, setExistingSearchQuery] = useState('');

  // Check if entered phone number matches any existing patients under ANY name
  const phoneMatches = useMemo(() => {
    const raw = (newPatient.phone || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (!digits || digits.length < 4) return [];

    return patients.filter(p => {
      const pDigits = (p.phone || '').replace(/\D/g, '');
      if (!pDigits) return false;
      return pDigits.includes(digits) || (digits.length >= 7 && pDigits.endsWith(digits.slice(-10)));
    });
  }, [patients, newPatient.phone]);

  // Helper to extract visit history summary for a patient
  const getPatientSummary = (patId, patPhone) => {
    const patAppts = appointments.filter(a => {
      const aPatId = (a.patient?._id || a.patient || '').toString();
      const pClean = patPhone ? patPhone.replace(/\D/g, '') : '';
      const aClean = (a.patientPhone || '').replace(/\D/g, '');
      return aPatId === patId.toString() || (pClean && aClean && aClean === pClean);
    });

    const activeToday = patAppts.find(a => {
      const isToday = new Date(a.date).toDateString() === new Date().toDateString();
      return isToday && a.status !== 'Completed' && a.status !== 'Cancelled';
    });

    const lastAppt = patAppts[0];

    return {
      totalVisits: patAppts.length,
      lastVisitDate: lastAppt ? new Date(lastAppt.date).toLocaleDateString() : null,
      lastDoctor: lastAppt?.doctorName,
      lastService: lastAppt?.serviceName || lastAppt?.appointmentType,
      activeTodayToken: activeToday?.tokenNumber || (activeToday ? activeToday._id.slice(-4) : null)
    };
  };

  // Filtered patients for existing patient dropdown
  const filteredExistingPatients = useMemo(() => {
    if (!existingSearchQuery.trim()) return patients;
    const q = existingSearchQuery.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');

    return patients.filter(p => {
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const idMatch = (p.patientId || '').toLowerCase().includes(q);
      const pDigits = (p.phone || '').replace(/\D/g, '');
      const phoneMatch = qDigits ? (pDigits.includes(qDigits) || (qDigits.length >= 7 && pDigits.endsWith(qDigits.slice(-10)))) : false;
      return nameMatch || idMatch || phoneMatch;
    });
  }, [patients, existingSearchQuery]);

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
    fetchQueue();
    fetchRoster();

    // Clock ticker for TV mode
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getAppointments();
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error('Queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async () => {
    try {
      const pRes = await polyclinicService.getPatients();
      if (pRes.success) setPatients(pRes.patients);

      const dRes = await polyclinicService.getDoctors();
      if (dRes.success && dRes.doctors.length > 0) {
        setDoctors(dRes.doctors);
        const firstDoc = dRes.doctors[0];
        const docObj = firstDoc.doctor || firstDoc;
        setTokenForm(prev => ({
          ...prev,
          doctorId: docObj._id || firstDoc._id,
          doctorName: docObj.name || 'Dr. Arya Warrier (BAMS, MD)',
          consultationFee: prev.serviceId ? prev.consultationFee : (firstDoc.consultationFee || 500)
        }));
      }

      const sRes = await polyclinicService.getServices();
      if (sRes.success && sRes.services) {
        setServices(sRes.services.filter(s => s.status !== 'Inactive'));
      }
    } catch (err) {
      console.error('Roster fetch error:', err);
    }
  };

  const handleServiceChange = (serviceId) => {
    const selectedS = services.find(s => s._id === serviceId);
    if (selectedS) {
      const isTherapy = (selectedS.category || '').toLowerCase().includes('panchakarma') || 
                        (selectedS.category || '').toLowerCase().includes('therapy');
      setTokenForm(prev => ({
        ...prev,
        serviceId: selectedS._id,
        serviceName: selectedS.name,
        serviceCategory: selectedS.category,
        serviceDuration: selectedS.duration,
        servicePrice: selectedS.price,
        consultationFee: selectedS.price,
        appointmentType: isTherapy ? 'Panchakarma Therapy Session' : 'Doctor Consultation',
        cabin: isTherapy && prev.cabin.includes('OP Cabin') ? 'Panchakarma Suite A (Droni Bed 1)' : prev.cabin
      }));
    } else {
      const doc = doctors.find(d => ((d.doctor?._id || d._id) === tokenForm.doctorId));
      setTokenForm(prev => ({
        ...prev,
        serviceId: '',
        serviceName: '',
        serviceCategory: '',
        serviceDuration: '',
        servicePrice: 0,
        consultationFee: doc?.consultationFee || 500,
        appointmentType: 'Doctor Consultation'
      }));
    }
  };

  // Voice Speech Chime Announcement
  const announceToken = (item) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cabin = item.notes?.includes('Cabin') ? item.notes : 'OP Cabin 1';
      const text = `Token number ${item.tokenNumber || 1}. ${item.patientName}. Please proceed to ${item.doctorName}, ${cabin}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Issue New Walk-in Token Handler
  const handleIssueToken = async (e) => {
    e.preventDefault();
    try {
      let patientId = selectedPatientId;
      let patientName = '';
      let patientPhone = '';

      if (patientMode === 'new') {
        if (!newPatient.name || !newPatient.phone) {
          alert('Please enter patient name and phone number');
          return;
        }
        const createdP = await polyclinicService.createPatient({
          name: newPatient.name,
          phone: newPatient.phone,
          age: Number(newPatient.age) || 30,
          gender: newPatient.gender,
          prakriti: newPatient.prakriti,
          vikriti: 'General Ayurvedic Health Consultation'
        });
        if (createdP.success) {
          patientId = createdP.patient._id;
          patientName = createdP.patient.name;
          patientPhone = createdP.patient.phone;
          setPatients(prev => [createdP.patient, ...prev]);
        }
      } else {
        const found = patients.find(p => p._id === selectedPatientId);
        if (found) {
          patientName = found.name;
          patientPhone = found.phone;
        } else {
          alert('Please select a patient or add a new one');
          return;
        }
      }

      const apptPayload = {
        patient: patientId,
        patientName,
        patientPhone,
        doctor: tokenForm.doctorId,
        doctorName: tokenForm.doctorName,
        department: tokenForm.department,
        appointmentType: tokenForm.appointmentType,
        service: tokenForm.serviceId || null,
        serviceName: tokenForm.serviceName || '',
        serviceCategory: tokenForm.serviceCategory || '',
        serviceDuration: tokenForm.serviceDuration || '',
        servicePrice: Number(tokenForm.servicePrice || tokenForm.consultationFee) || 0,
        date: new Date().toISOString(),
        timeSlot: 'Walk-in OP',
        status: 'Checked-In', // Immediately in waiting queue!
        consultationFee: Number(tokenForm.consultationFee) || 500,
        notes: tokenForm.cabin
      };

      if (editingTokenId) {
        const res = await polyclinicService.updateAppointment(editingTokenId, apptPayload);
        if (res.success) {
          setShowTokenModal(false);
          setEditingTokenId(null);
          fetchQueue();
          setNewPatient({ name: '', phone: '', age: '', gender: 'Male', prakriti: 'Vata-Pitta' });
          setTokenForm(prev => ({
            ...prev,
            serviceId: '',
            serviceName: '',
            serviceCategory: '',
            serviceDuration: '',
            servicePrice: 0
          }));
        } else {
          alert(res.message || 'Failed to update token');
        }
        return;
      }

      const res = await polyclinicService.createAppointment(apptPayload);
      if (res.success) {
        setShowTokenModal(false);
        fetchQueue();
        // Immediately pop up printable slip for this token
        setActiveSlip({
          ...res.appointment,
          patientDetails: patientMode === 'new' ? newPatient : patients.find(p => p._id === patientId),
          cabin: tokenForm.cabin,
          serviceName: tokenForm.serviceName || res.appointment.serviceName,
          serviceCategory: tokenForm.serviceCategory || res.appointment.serviceCategory,
          serviceDuration: tokenForm.serviceDuration || res.appointment.serviceDuration,
          servicePrice: tokenForm.servicePrice || res.appointment.servicePrice
        });
        // Reset new patient form and service selection
        setNewPatient({ name: '', phone: '', age: '', gender: 'Male', prakriti: 'Vata-Pitta' });
        setTokenForm(prev => ({
          ...prev,
          serviceId: '',
          serviceName: '',
          serviceCategory: '',
          serviceDuration: '',
          servicePrice: 0
        }));
      }
    } catch (err) {
      alert(err.message || 'Error issuing token');
    }
  };

  const handleOpenEditToken = (token) => {
    setEditingTokenId(token._id);
    setPatientMode('existing');
    setSelectedPatientId(typeof token.patient === 'object' ? token.patient?._id : token.patient);
    setTokenForm({
      doctorId: typeof token.doctor === 'object' ? token.doctor?._id : (token.doctor || ''),
      doctorName: token.doctorName || '',
      serviceId: typeof token.service === 'object' ? token.service?._id : (token.service || ''),
      serviceName: token.serviceName || '',
      serviceCategory: token.serviceCategory || '',
      serviceDuration: token.serviceDuration || '',
      servicePrice: token.servicePrice || 0,
      department: token.department || 'Ayurvedic OP',
      appointmentType: token.appointmentType || 'Doctor Consultation',
      cabin: token.notes?.includes('Cabin') || token.notes?.includes('Suite') ? token.notes : 'OP Cabin 1 (Kayachikitsa)',
      consultationFee: token.consultationFee || 500,
      notes: token.notes || 'Walk-in OP Consultation'
    });
    setShowTokenModal(true);
  };

  const handleDeleteToken = (token) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Queue Token',
      message: `Are you sure you want to delete Token #${token.tokenNumber || 1} for ${token.patientName}? This action cannot be undone.`,
      confirmText: 'Delete Token',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.deleteAppointment(token._id);
          if (res.success) {
            fetchQueue();
          } else {
            alert(res.message || 'Failed to delete token');
          }
        } catch (err) {
          alert(err.message || 'Error deleting token');
        }
      }
    });
  };

  const requestStatusUpdate = (item, status) => {
    setConfirmModal({
      isOpen: true,
      title: `Queue Status Action`,
      message: `Move ${item.patientName} (TOKEN #${item.tokenNumber || 1}) to "${status}"?`,
      confirmText: `Move to ${status}`,
      variant: status === 'Completed' ? 'success' : 'primary',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.updateAppointmentStatus(item._id, status);
          if (res.success) {
            fetchQueue();
            if (status === 'In-Consultation') {
              announceToken(item);
            }
          }
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  const waitingQueue = appointments.filter(a => a.status === 'Checked-In');
  const inConsultation = appointments.filter(a => a.status === 'In-Consultation');
  const completedQueue = appointments.filter(a => a.status === 'Completed');

  // ==========================================
  // FULLSCREEN WAITING LOUNGE TV DISPLAY MODE
  // ==========================================
  if (isTvMode) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white p-6 md:p-10 flex flex-col justify-between overflow-hidden select-none font-sans">
        {/* TV Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 shrink-0">
          <div className="flex items-center gap-4">
            <img src="/logo2.png" alt="AyurCare Emblem" className="h-16 w-16 object-contain" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-emerald-400">
                AYURCARE AYURVEDIC HOSPITAL
              </h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">
                Live Outpatient &amp; Panchakarma Token Calling System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl md:text-4xl font-black text-white font-mono">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs md:text-sm text-slate-400 font-semibold uppercase tracking-wider">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <button
              onClick={() => setIsTvMode(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-700"
            >
              <X className="w-4 h-4" /> Exit TV View
            </button>
          </div>
        </div>

        {/* TV 2-Column Split: Now Serving vs Upcoming */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6 flex-1 overflow-hidden">
          {/* NOW SERVING (In Consultation) */}
          <div className="bg-emerald-950/30 border-2 border-emerald-500/50 rounded-3xl p-6 flex flex-col shadow-2xl shadow-emerald-950/50">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-4 mb-4 shrink-0">
              <span className="flex items-center gap-3 text-2xl font-black text-emerald-300 uppercase tracking-wider">
                <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping inline-block" />
                NOW SERVING
              </span>
              <span className="bg-emerald-500 text-slate-950 font-black text-base px-3 py-1 rounded-full">
                {inConsultation.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {inConsultation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-16">
                  <Stethoscope className="w-16 h-16 mb-3 opacity-30 text-emerald-400" />
                  <p className="text-xl font-bold">Consultation Cabins Ready</p>
                  <p className="text-sm text-slate-400 mt-1">Next tokens will be called shortly</p>
                </div>
              ) : (
                inConsultation.map(item => (
                  <div key={item._id} className="bg-gradient-to-r from-emerald-900/60 to-emerald-950/80 border-2 border-emerald-400/60 rounded-2xl p-6 flex items-center justify-between shadow-lg">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-4xl md:text-5xl font-black text-emerald-300 font-mono">
                          TOKEN #{item.tokenNumber || 1}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white mt-1">{item.patientName}</p>
                      {item.serviceName && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/30 w-fit">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{item.serviceName}</span>
                          {item.serviceDuration && <span className="text-[11px] text-emerald-400/80">({item.serviceDuration})</span>}
                        </div>
                      )}
                      <p className="text-base text-emerald-200/90 font-medium mt-1">
                        Vaidya: {item.doctorName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-emerald-400 text-slate-950 font-black text-base md:text-lg px-4 py-2 rounded-xl shadow-md uppercase">
                        {item.notes?.includes('Cabin') ? item.notes : 'Cabin 1'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* UP NEXT IN QUEUE */}
          <div className="bg-amber-950/20 border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col shadow-2xl shadow-amber-950/50">
            <div className="flex items-center justify-between border-b border-amber-800/60 pb-4 mb-4 shrink-0">
              <span className="flex items-center gap-3 text-2xl font-black text-amber-300 uppercase tracking-wider">
                <Clock className="w-6 h-6 text-amber-400" />
                WAITING ROOM QUEUE
              </span>
              <span className="bg-amber-500 text-slate-950 font-black text-base px-3 py-1 rounded-full">
                {waitingQueue.length} In Line
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {waitingQueue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-16">
                  <UserCheck className="w-16 h-16 mb-3 opacity-30 text-amber-400" />
                  <p className="text-xl font-bold">Waiting Room Clear</p>
                  <p className="text-sm text-slate-400 mt-1">All registered patients have been attended</p>
                </div>
              ) : (
                waitingQueue.map((item, idx) => (
                  <div key={item._id} className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono w-28">
                        #{item.tokenNumber || 1}
                      </span>
                      <div>
                        <p className="text-lg font-bold text-white">{item.patientName}</p>
                        {item.serviceName && (
                          <p className="text-xs text-amber-300 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" /> {item.serviceName}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">With {item.doctorName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300/80 bg-amber-950/60 border border-amber-800/50 px-3 py-1 rounded-lg">
                        {idx === 0 ? 'Next in Turn' : `${idx} ahead`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TV Ticker Footer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-3 text-center text-xs md:text-sm text-slate-400 flex items-center justify-center gap-3 shrink-0">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Ayurvedic Health Tip:</strong> Please rest calmly in the lounge prior to Nadi Pariksha (Pulse Examination). Avoid icy cold beverages.
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // STANDARD RECEPTION DESK QUEUE MANAGEMENT
  // ==========================================
  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" /> Ayurvedic OP Token &amp; Reception Queue
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Instant walk-in token issuance, printable thermal slips, audio token calling, and waiting lounge TV screen dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Issue Walk-in Token Button */}
          <button
            onClick={() => {
              setEditingTokenId(null);
              setShowTokenModal(true);
            }}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Issue Walk-in OP Token
          </button>

          {/* TV Display Mode Button */}
          <button
            onClick={() => setIsTvMode(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
            title="Launch Fullscreen Waiting Room TV Display"
          >
            <Tv className="w-4 h-4" /> Waiting Room TV
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Table View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban Board
            </button>
          </div>

          <button 
            onClick={fetchQueue}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2.5 rounded-xl transition cursor-pointer"
            title="Refresh Live Queue"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Waiting in Lounge</p>
              <p className="text-xl font-black text-amber-900 dark:text-amber-200">{waitingQueue.length} Patients</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md">Queue</span>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">In Vaidya Cabins</p>
              <p className="text-xl font-black text-emerald-900 dark:text-emerald-200">{inConsultation.length} Consultations</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-md">Active</span>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 font-semibold">Completed Today</p>
              <p className="text-xl font-black text-indigo-900 dark:text-indigo-200">{completedQueue.length} Visited</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-md">Done</span>
        </div>
      </div>

      {/* Queue View: Table vs Kanban */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
              <thead className="uppercase bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Token #</th>
                  <th className="py-3.5 px-4 font-bold">Patient Details</th>
                  <th className="py-3.5 px-4 font-bold">Assigned Vaidya</th>
                  <th className="py-3.5 px-4 font-bold">Treatment / Service</th>
                  <th className="py-3.5 px-4 font-bold">Cabin / Room</th>
                  <th className="py-3.5 px-4 font-bold">Fee (₹)</th>
                  <th className="py-3.5 px-4 font-bold">Queue Stage</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      No active patient tokens in today's reception queue.
                    </td>
                  </tr>
                ) : (
                  appointments.map((item) => (
                    <tr key={item._id} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                          #{item.tokenNumber || 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedPatientIdForDetails(item.patient)}
                          className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer hover:underline"
                        >
                          {item.patientName} &rarr;
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {item.patientPhone || 'Walk-in'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.doctorName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.serviceName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-semibold text-xs">
                            <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{item.serviceName}</span>
                            {item.serviceDuration && <span className="text-[10px] text-slate-400 font-normal">({item.serviceDuration})</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">General Consultation</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg text-xs">
                          {item.notes?.includes('Cabin') ? item.notes : 'OP Cabin 1'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{item.consultationFee || 500}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-block ${
                          item.status === 'Checked-In' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          item.status === 'In-Consultation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 animate-pulse' :
                          item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.status === 'Checked-In' ? '⏳ Waiting Room' :
                           item.status === 'In-Consultation' ? '🩺 In Consultation' :
                           item.status === 'Completed' ? '✅ Visited' : item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => announceToken(item)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                            title="Chime / Announce Token over Speaker"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setActiveSlip({ ...item, cabin: item.notes || 'OP Cabin 1' })}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                            title="Print Token Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {item.status === 'Checked-In' && (
                            <button
                              onClick={() => requestStatusUpdate(item, 'In-Consultation')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              Call <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {item.status === 'In-Consultation' && (
                            <button
                              onClick={() => requestStatusUpdate(item, 'Completed')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </button>
                          )}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditToken(item)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                              title="Edit Token Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteToken(item)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                              title="Delete Token"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 3-Column Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Waiting Room Queue */}
        <div className="bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/50 dark:border-amber-900/40 pb-3">
            <h2 className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Waiting Room Queue
            </h2>
            <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {waitingQueue.length}
            </span>
          </div>

          <div className="space-y-3">
            {waitingQueue.length === 0 ? (
              <p className="text-xs text-amber-700/60 dark:text-amber-400/60 text-center py-8">Waiting room clear.</p>
            ) : (
              waitingQueue.map((item, idx) => (
                <div key={item._id} className="bg-white dark:bg-[#111622] border border-amber-200/70 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2.5 transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-200/50">
                      TOKEN #{item.tokenNumber || 1}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{item.timeSlot}</span>
                  </div>

                  <div>
                    <p 
                      onClick={() => setSelectedPatientIdForDetails(item.patient)}
                      className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer hover:underline"
                      title="Click to view complete patient history, logs & follow-ups"
                    >
                      {item.patientName} &rarr;
                    </p>
                    {item.serviceName && (
                      <div className="my-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-500/20">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>{item.serviceName}</span>
                        {item.serviceDuration && <span className="text-[10px] text-slate-400">({item.serviceDuration})</span>}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">Vaidya: {item.doctorName}</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                      📍 {item.notes?.includes('Cabin') ? item.notes : 'Cabin 1'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {/* Voice Announce Button */}
                    <button
                      type="button"
                      onClick={() => announceToken(item)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                      title="Chime / Announce Token over Speaker"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Print Token Slip Button */}
                    <button
                      type="button"
                      onClick={() => setActiveSlip({ ...item, cabin: item.notes || 'OP Cabin 1' })}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                      title="Print Token Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Send to Vaidya */}
                    <button
                      onClick={() => requestStatusUpdate(item, 'In-Consultation')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      Call to Cabin <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Doctor Consultation */}
        <div className="bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-200/60 dark:border-emerald-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-900/40 pb-3">
            <h2 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" /> In Vaidya Consultation
            </h2>
            <span className="bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {inConsultation.length}
            </span>
          </div>

          <div className="space-y-3">
            {inConsultation.length === 0 ? (
              <p className="text-xs text-purple-700/60 dark:text-purple-400/60 text-center py-8">No active consultations.</p>
            ) : (
              inConsultation.map(item => (
                <div key={item._id} className="bg-white dark:bg-[#111622] border border-purple-200/70 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-600">TOKEN #{item.tokenNumber || 1}</span>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md animate-pulse">
                      Active
                    </span>
                  </div>
                  <div>
                    <p 
                      onClick={() => setSelectedPatientIdForDetails(item.patient)}
                      className="font-bold text-slate-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer hover:underline"
                      title="Click to view complete patient history, logs & follow-ups"
                    >
                      {item.patientName} &rarr;
                    </p>
                    {item.serviceName && (
                      <div className="my-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[11px] font-semibold border border-purple-500/20">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>{item.serviceName}</span>
                        {item.serviceDuration && <span className="text-[10px] text-purple-400">({item.serviceDuration})</span>}
                      </div>
                    )}
                    <p className="text-xs text-slate-400">With {item.doctorName}</p>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                      📍 {item.notes?.includes('Cabin') ? item.notes : 'Cabin 1'}
                    </p>
                  </div>
                  <button
                    onClick={() => requestStatusUpdate(item, 'Completed')}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete Consultation
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed Today */}
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed Today
            </h2>
            <span className="bg-slate-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {completedQueue.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {completedQueue.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">None completed yet today.</p>
            ) : (
              completedQueue.map(item => (
                <div key={item._id} className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono font-bold">TOKEN #{item.tokenNumber || 1}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  </div>
                  <p 
                    onClick={() => setSelectedPatientIdForDetails(item.patient)}
                    className="font-bold text-slate-900 dark:text-white text-xs hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer hover:underline"
                    title="Click to view complete patient history, logs & follow-ups"
                  >
                    {item.patientName} &rarr;
                  </p>
                  {item.serviceName && (
                    <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> {item.serviceName}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">{item.doctorName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {/* ======================================================== */}
      {/* 1. WALK-IN TOKEN DISPENSER MODAL                         */}
      {/* ======================================================== */}
      {showTokenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingTokenId ? 'Update OP Queue Token' : 'Issue Walk-in OP Token'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingTokenId ? 'Modify token details, cabin or attending Vaidya' : 'Assign token number & place patient into waiting queue'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowTokenModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueToken} className="space-y-4">
              {/* Patient Selection Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Patient Mode
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPatientMode('existing')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      patientMode === 'existing' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    Existing Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientMode('new')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition ${
                      patientMode === 'new' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    + Quick New Patient
                  </button>
                </div>
              </div>

              {patientMode === 'existing' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Select Registered Patient
                    </label>
                    <span className="text-[10px] text-slate-400">Search by name, ID or phone</span>
                  </div>

                  {/* Phone / Name filter search input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Type phone number or patient name to filter..."
                      value={existingSearchQuery}
                      onChange={(e) => setExistingSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    {existingSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setExistingSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option value="">-- Choose Patient ({filteredExistingPatients.length} found) --</option>
                    {filteredExistingPatients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.patientId || 'PAT'} - {p.name} ({p.phone}) {p.prakriti ? `[${p.prakriti}]` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Selected patient preview summary */}
                  {selectedPatientId && (() => {
                    const selP = patients.find(p => p._id === selectedPatientId);
                    if (!selP) return null;
                    const summary = getPatientSummary(selP._id, selP.phone);
                    const familyMembers = patients.filter(p => p._id !== selP._id && (p.phone || '').replace(/\D/g, '') === (selP.phone || '').replace(/\D/g, ''));
                    return (
                      <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-600" />
                            {selP.name} ({selP.age || '—'} yrs, {selP.gender || '—'})
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedPatientIdForDetails(selP._id)}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            <FileText className="w-3 h-3" /> View 360 History
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Phone: <strong>{selP.phone}</strong></span>
                          <span>Prakriti: <strong>{selP.prakriti || 'Tridoshic'}</strong></span>
                          <span>Visits: <strong>{summary.totalVisits}</strong></span>
                          {summary.lastVisitDate && <span>Last: <strong>{summary.lastVisitDate}</strong></span>}
                          {summary.activeTodayToken && (
                            <span className="text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                              ⚡ Active Token Today: #{summary.activeTodayToken}
                            </span>
                          )}
                        </div>
                        {familyMembers.length > 0 && (
                          <div className="pt-1 border-t border-emerald-200/50 dark:border-emerald-800/40 text-[10px] text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-600" />
                            <span>Other profiles sharing phone {selP.phone}:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {familyMembers.map(m => m.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Anjali Nair"
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                        required
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g. 98470 12345"
                          value={newPatient.phone}
                          onChange={(e) => {
                            setNewPatient({ ...newPatient, phone: e.target.value });
                            setShowPhoneDropdown(true);
                          }}
                          onFocus={() => setShowPhoneDropdown(true)}
                          required
                          className={`w-full bg-white dark:bg-slate-800 border rounded-xl p-2 text-xs transition ${
                            phoneMatches.length > 0
                              ? 'border-amber-400 ring-1 ring-amber-400/40 dark:border-amber-500'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        {phoneMatches.length > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            <Users className="w-2.5 h-2.5" /> {phoneMatches.length} match{phoneMatches.length > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>

                      {/* History dropdown for this phone number under ANY name */}
                      {showPhoneDropdown && phoneMatches.length > 0 && (
                        <div className="absolute left-0 right-0 sm:w-[380px] sm:-left-36 top-full mt-1.5 z-50 bg-white dark:bg-[#161d2b] border border-amber-300 dark:border-amber-700 rounded-2xl shadow-2xl p-2.5 space-y-2 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                          <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60 dark:border-amber-900/40">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                              <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>History for {newPatient.phone}:</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowPhoneDropdown(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Found {phoneMatches.length} registered patient profile(s) sharing this phone number under different or existing names:
                          </p>

                          <div className="space-y-2">
                            {phoneMatches.map(match => {
                              const summary = getPatientSummary(match._id, match.phone);
                              return (
                                <div
                                  key={match._id}
                                  className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 hover:border-amber-400 transition space-y-1.5"
                                >
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                                          {match.name}
                                        </span>
                                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                          {match.patientId || 'PAT'}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <span>{match.gender || 'Patient'}, {match.age || '—'} yrs</span>
                                        <span>•</span>
                                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{match.prakriti || 'Tridoshic'}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPatientIdForDetails(match._id)}
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition flex items-center gap-0.5"
                                        title="View Full Clinical History"
                                      >
                                        <FileText className="w-2.5 h-2.5 text-blue-500" /> History
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPatientMode('existing');
                                          setSelectedPatientId(match._id);
                                          setShowPhoneDropdown(false);
                                        }}
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-0.5 shadow-xs"
                                        title="Use this existing profile for token"
                                      >
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Select
                                      </button>
                                    </div>
                                  </div>

                                  {/* History details */}
                                  <div className="text-[10px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 p-1.5 rounded-lg border border-amber-100 dark:border-slate-700/80 space-y-0.5">
                                    <div className="flex justify-between">
                                      <span>Total Visits: <strong>{summary.totalVisits}</strong></span>
                                      {summary.lastVisitDate && (
                                        <span>Last: <strong>{summary.lastVisitDate}</strong></span>
                                      )}
                                    </div>
                                    {summary.lastDoctor && (
                                      <div className="truncate text-slate-500">
                                        Doctor: {summary.lastDoctor} {summary.lastService ? `• ${summary.lastService}` : ''}
                                      </div>
                                    )}
                                    {summary.activeTodayToken && (
                                      <div className="text-amber-700 dark:text-amber-400 font-bold">
                                        ⚡ Active Token Today: #{summary.activeTodayToken}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="pt-1.5 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Different family member?</span>
                            <button
                              type="button"
                              onClick={() => setShowPhoneDropdown(false)}
                              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                            >
                              Continue registering new patient →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Age</label>
                      <input
                        type="number"
                        placeholder="35"
                        value={newPatient.age}
                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Gender</label>
                      <select
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Prakriti</label>
                      <select
                        value={newPatient.prakriti}
                        onChange={(e) => setNewPatient({ ...newPatient, prakriti: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                      >
                        <option>Vata</option>
                        <option>Pitta</option>
                        <option>Kapha</option>
                        <option>Vata-Pitta</option>
                        <option>Pitta-Kapha</option>
                        <option>Vata-Kapha</option>
                        <option>Tridoshic</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Treatment / Service Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Treatment / Therapy Service
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Optional (Auto-sets fee)</span>
                </div>
                <select
                  value={tokenForm.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="">-- General Vaidya Consultation (Default: ₹500) --</option>
                  {services.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} — ₹{s.price} ({s.duration}) [{s.category}]
                    </option>
                  ))}
                </select>

                {tokenForm.serviceId && (() => {
                  const s = services.find(x => x._id === tokenForm.serviceId);
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
                          ₹{s.price}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Vaidya & Cabin Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Vaidya (Doctor)
                  </label>
                  <select
                    value={tokenForm.doctorId}
                    onChange={(e) => {
                      const docObj = doctors.find(d => ((d.doctor?._id || d._id) === e.target.value));
                      setTokenForm({
                        ...tokenForm,
                        doctorId: e.target.value,
                        doctorName: docObj?.doctor?.name || docObj?.name || 'Dr. Arya Warrier',
                        consultationFee: docObj?.consultationFee || 500
                      });
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    {doctors.map(d => {
                      const id = d.doctor?._id || d._id;
                      const name = d.doctor?.name || d.name;
                      const fee = d.consultationFee || 500;
                      return (
                        <option key={id} value={id}>
                          {name} ({d.specialization || 'Vaidya'}) — ₹{fee}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Consultation Room / Cabin
                  </label>
                  <select
                    value={tokenForm.cabin}
                    onChange={(e) => setTokenForm({ ...tokenForm, cabin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="OP Cabin 1 (Kayachikitsa)">OP Cabin 1 (Kayachikitsa)</option>
                    <option value="OP Cabin 2 (Shalya &amp; Marma)">OP Cabin 2 (Shalya &amp; Marma)</option>
                    <option value="OP Cabin 3 (Prasuti &amp; Stri Roga)">OP Cabin 3 (Prasuti Tantra)</option>
                    <option value="Panchakarma Suite A (Droni Bed 1)">Panchakarma Suite A</option>
                    <option value="Panchakarma Suite B (Droni Bed 2)">Panchakarma Suite B</option>
                  </select>
                </div>
              </div>

              {/* Consultation Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Token Category
                  </label>
                  <select
                    value={tokenForm.appointmentType}
                    onChange={(e) => setTokenForm({ ...tokenForm, appointmentType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="Doctor Consultation">Doctor Consultation</option>
                    <option value="Panchakarma Therapy Session">Panchakarma Therapy Session</option>
                    <option value="Follow-up Review">Follow-up Review</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    OP Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={tokenForm.consultationFee}
                    onChange={(e) => setTokenForm({ ...tokenForm, consultationFee: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTokenModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> {editingTokenId ? 'Save Changes' : 'Issue & Print Slip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PRINTABLE AYURVEDIC OP TOKEN SLIP MODAL               */}
      {/* ======================================================== */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official OP Token Slip
              </span>
              <button onClick={() => setActiveSlip(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The Actual Printable Thermal Slip */}
            <div id="printable-token-slip" className="bg-amber-50/50 dark:bg-slate-900/60 border-2 border-dashed border-amber-300/80 dark:border-slate-700 rounded-2xl p-5 text-center font-sans space-y-3">
              <div className="flex justify-center items-center gap-2">
                <img src="/logo2.png" alt="AyurCare Emblem" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                  AYURCARE AYURVEDIC HOSPITAL
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Centre for Classical Panchakarma &amp; Rogi Pariksha
                </p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-3 my-2">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest block">
                  OP TOKEN NUMBER
                </span>
                <div className="text-5xl font-black text-slate-900 dark:text-white font-mono my-1 tracking-tight">
                  #{activeSlip.tokenNumber || 1}
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-left text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-bold">{activeSlip.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vaidya:</span>
                  <span className="font-bold">{activeSlip.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cabin / Room:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeSlip.cabin || activeSlip.notes || 'Cabin 1'}</span>
                </div>
                {activeSlip.serviceName && (
                  <div className="flex justify-between items-center py-1 border-t border-b border-dashed border-amber-300/60 dark:border-slate-700 my-1">
                    <span className="text-slate-500 text-[11px] font-semibold">Service / Karma:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-right text-xs">
                      {activeSlip.serviceName} {activeSlip.serviceDuration ? `(${activeSlip.serviceDuration})` : ''}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-medium">{activeSlip.serviceCategory || activeSlip.appointmentType || 'Consultation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Fee:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">₹{activeSlip.consultationFee || 500}</span>
                </div>
              </div>

              <div className="bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2.5 rounded-xl text-[10px] text-amber-900 dark:text-amber-300 text-left">
                🌿 <strong>Pathya Tip:</strong> Please rest comfortably in the waiting lounge. Avoid cold refrigerated water before pulse examination (Nadi Pariksha).
              </div>
            </div>

            {/* Print & Close Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print Thermal Slip
              </button>
              <button
                onClick={() => setActiveSlip(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient 360 Full Details & Logs Modal */}
      <PatientDetailsModal
        isOpen={!!selectedPatientIdForDetails}
        patientId={selectedPatientIdForDetails}
        onClose={() => setSelectedPatientIdForDetails(null)}
      />

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
