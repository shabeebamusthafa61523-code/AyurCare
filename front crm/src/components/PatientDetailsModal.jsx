import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  User, Phone, Mail, MapPin, Calendar, Clock, Stethoscope, Sparkles, 
  FileText, Activity, Receipt, CheckCircle2, AlertCircle, X, RefreshCw, 
  HeartPulse, Flame, ArrowRight, Pill, BadgeCheck, ShieldAlert, 
  History, Layers, ChevronRight, CreditCard
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import PatientCardModal from './PatientCardModal';

export default function PatientDetailsModal({ isOpen, onClose, patientId, initialPatient }) {
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(initialPatient || null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [history, setHistory] = useState({
    appointments: [],
    emrs: [],
    prescriptions: [],
    panchakarma: [],
    labTests: [],
    bills: [],
    followUps: []
  });
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'profile' | 'emr' | 'panchakarma' | 'rx' | 'followups' | 'billing'

  useEffect(() => {
    if (isOpen && patientId) {
      loadFullDetails();
    }
  }, [isOpen, patientId]);

  const loadFullDetails = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getPatientById(patientId);
      if (res.success) {
        setPatientData(res.patient);
        if (res.history) {
          setHistory({
            appointments: res.history.appointments || [],
            emrs: res.history.emrs || [],
            prescriptions: res.history.prescriptions || [],
            panchakarma: res.history.panchakarma || [],
            labTests: res.history.labTests || [],
            bills: res.history.bills || [],
            followUps: res.history.followUps || []
          });
        }
      }
    } catch (err) {
      console.error('Failed to load patient 360 profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Build Unified Chronological Activity Timeline
  const timelineEvents = [
    ...(history.appointments || []).map(a => ({
      type: 'appointment',
      date: new Date(a.date || a.createdAt),
      title: `${a.appointmentType || 'OP Consultation'} - TOKEN #${a.tokenNumber || 1}`,
      subtitle: `With ${a.doctorName || 'Vaidya'} (${a.department || 'Ayurvedic OP'})`,
      status: a.status,
      badgeColor: a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      icon: Calendar,
      details: a.notes ? `Cabin / Notes: ${a.notes}` : `Time Slot: ${a.timeSlot}`
    })),
    ...(history.emrs || []).map(e => ({
      type: 'emr',
      date: new Date(e.createdAt),
      title: `Rogi Pariksha & Clinical EMR: ${e.diagnosis || 'Health Assessment'}`,
      subtitle: `Consulting Vaidya: ${e.doctorName || 'Doctor'}`,
      status: e.status || 'Active Consultation',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
      icon: Stethoscope,
      details: e.chiefComplaints?.join(', ') || 'Chief complaints evaluated'
    })),
    ...(history.panchakarma || []).map(pk => ({
      type: 'panchakarma',
      date: new Date(pk.startDate || pk.createdAt),
      title: `Panchakarma: ${pk.therapyName || 'Therapy Course'} (${pk.totalDays || 7} Days)`,
      subtitle: `Droni Room: ${pk.roomBed || 'Suite A'} | Stage: ${pk.stage || 'Pradhana Karma'}`,
      status: pk.status,
      badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
      icon: Sparkles,
      details: pk.instructions || `Session: Day ${pk.dailyLogs?.length || 1}`
    })),
    ...(history.prescriptions || []).map(rx => ({
      type: 'rx',
      date: new Date(rx.createdAt),
      title: `Aushadhi Prescription (${rx.medicines?.length || 0} Classical Medicines)`,
      subtitle: `Prescribed by: ${rx.doctorName || 'Vaidya'}`,
      status: 'Dispensed',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
      icon: Pill,
      details: rx.medicines?.map(m => m.medicineName).join(', ') || 'Herbal preparations'
    })),
    ...(history.followUps || []).map(fu => ({
      type: 'followup',
      date: new Date(fu.followUpDate || fu.createdAt),
      title: `Follow-up Review: ${fu.purpose || 'Post-treatment evaluation'}`,
      subtitle: `With ${fu.doctorName || 'Vaidya'}`,
      status: fu.status || 'Pending',
      badgeColor: fu.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
      icon: Clock,
      details: fu.notes || 'Routine recovery and symptom review'
    })),
    ...(history.bills || []).map(b => ({
      type: 'billing',
      date: new Date(b.createdAt),
      title: `Hospital Invoice #${b.billNumber || 'INV'} - ₹${b.totalAmount || 0}`,
      subtitle: `Items: ${b.items?.map(i => i.item).join(', ') || 'Consultation & Services'}`,
      status: b.paymentStatus || 'Paid',
      badgeColor: b.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
      icon: Receipt,
      details: `Paid via: ${b.paymentMethod || 'Cash / UPI'}`
    }))
  ].sort((a, b) => b.date - a.date);

  const p = patientData || {};

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="bg-white dark:bg-[#111622] border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ======================================================== */}
        {/* MODAL HEADER: PATIENT BIO & CONSTITUTIONAL DOSHA BADGES  */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {p.name || 'Patient Profile'}
                  </h2>
                  <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-lg">
                    {p.patientId || 'PAT-1001'}
                  </span>
                  {p.bloodGroup && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                      {p.bloodGroup}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {p.age || '—'} Yrs, {p.gender || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone || '—'}
                  </span>
                  {p.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {p.email}
                    </span>
                  )}
                  {p.address && (
                    <span className="flex items-center gap-1 max-w-xs truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {p.address}
                    </span>
                  )}
                </div>

                {/* Ayurvedic Constitutional Badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 px-2.5 py-1 rounded-xl">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Prakriti: {p.prakriti || 'Vata-Pitta'}
                  </span>
                  {p.vikriti && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900 px-2.5 py-1 rounded-xl">
                      <HeartPulse className="w-3 h-3 text-purple-500" /> Vikriti: {p.vikriti}
                    </span>
                  )}
                  {p.agni && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 px-2 py-1 rounded-xl">
                      <Flame className="w-3 h-3 text-rose-500" /> Agni: {p.agni}
                    </span>
                  )}
                  {p.dietHabit && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 px-2 py-1 rounded-xl">
                      Diet: {p.dietHabit}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setShowCardModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold transition cursor-pointer shadow-xs"
                title="Generate and print official AyurCare Health ID Card"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Health ID Card</span>
              </button>
              <button 
                onClick={loadFullDetails}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                title="Refresh patient history"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* TAB NAVIGATION BAR */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
            {[
              { id: 'timeline', label: 'Complete Timeline Logs', count: timelineEvents.length, icon: History },
              { id: 'profile', label: 'Ayurvedic Profile', icon: Sparkles },
              { id: 'appointments', label: 'OP Visits & Tokens', count: history.appointments?.length || 0, icon: Calendar },
              { id: 'emr', label: 'Consultations & EMR', count: history.emrs?.length || 0, icon: Stethoscope },
              { id: 'panchakarma', label: 'Panchakarma Therapies', count: history.panchakarma?.length || 0, icon: Sparkles },
              { id: 'rx', label: 'Prescriptions', count: history.prescriptions?.length || 0, icon: Pill },
              { id: 'followups', label: 'Follow-ups & Reviews', count: history.followUps?.length || 0, icon: Clock },
              { id: 'billing', label: 'Invoices & Billing', count: history.bills?.length || 0, icon: Receipt },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODAL BODY: ACTIVE TAB CONTENT                           */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <span>Retrieving complete clinical history, Panchakarma logs, and follow-ups...</span>
            </div>
          ) : (
            <>
              {/* ---------------------------------------------------- */}
              {/* TAB 1: COMPLETE ACTIVITY TIMELINE LOGS               */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-600" />
                      Comprehensive Activity History (Everything Done)
                    </h3>
                    <span className="text-xs text-slate-400">{timelineEvents.length} Recorded Clinical Events</span>
                  </div>

                  {timelineEvents.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      No medical records or OP consultations recorded for this patient yet.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                      {timelineEvents.map((event, idx) => (
                        <div key={idx} className="relative group">
                          {/* Timeline Dot Icon */}
                          <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white dark:bg-[#111622] border-2 border-emerald-500 text-emerald-600 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          </div>

                          <div className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:border-emerald-400/60 transition">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-black text-slate-900 dark:text-white">
                                    {event.title}
                                  </span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${event.badgeColor}`}>
                                    {event.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                  {event.subtitle}
                                </p>
                                {event.details && (
                                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                    {event.details}
                                  </p>
                                )}
                              </div>

                              <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                                {event.date.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 2: DETAILED AYURVEDIC PROFILE & CONSTITUTION     */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dosha & Constitution Card */}
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-5 rounded-2xl space-y-3">
                      <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" /> Tridosha &amp; Constitutional Profiling
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Prakriti (Inborn Constitution):</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.prakriti || 'Vata-Pitta'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Vikriti (Active Imbalance):</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.vikriti || 'None detected'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Agni (Digestive Fire):</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.agni || 'Sama Agni'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Koshtha (Bowel / Elimination):</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.koshtha || 'Madhyama'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Diet & Lifestyle Card */}
                    <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 p-5 rounded-2xl space-y-3">
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                        <HeartPulse className="w-4 h-4 text-emerald-600" /> Diet Habits &amp; Allergies
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Dietary Habit:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.dietHabit || 'Vegetarian'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Allergies:</span>
                          <span className="font-bold text-rose-600">{p.allergies?.join(', ') || 'No known allergies'}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block">Medical History / Chronic Conditions:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {p.medicalHistory?.join(', ') || 'None reported'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Clinic Registration Notes */}
                  {p.notes && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Registration &amp; Clinical Intake Notes
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{p.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 3: OP VISITS & APPOINTMENTS                      */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'appointments' && (
                <div className="space-y-3">
                  {history.appointments.length === 0 ? (
                    <p className="py-12 text-center text-xs text-slate-400">No appointments recorded.</p>
                  ) : (
                    history.appointments.map(a => (
                      <div key={a._id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-amber-600">TOKEN #{a.tokenNumber || 1}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{a.appointmentType}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                              {a.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Vaidya: {a.doctorName} • {a.department || 'Ayurvedic OP'} • {a.notes || a.timeSlot}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{new Date(a.date).toLocaleDateString()}</p>
                          <p className="text-[11px] text-slate-400">Fee: ₹{a.consultationFee || 500}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 4: CONSULTATIONS & ASHTAVIDHA PARIKSHA EMR       */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'emr' && (
                <div className="space-y-4">
                  {history.emrs.length === 0 ? (
                    <p className="py-12 text-center text-xs text-slate-400">No clinical EMR consultations recorded.</p>
                  ) : (
                    history.emrs.map(emr => (
                      <div key={emr._id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              Diagnosis (Roga Nidana): {emr.diagnosis || 'Clinical Assessment'}
                            </h4>
                            <p className="text-xs text-slate-400">Consulted by: {emr.doctorName}</p>
                          </div>
                          <span className="text-xs font-mono text-slate-400">{new Date(emr.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Ashtavidha Pariksha findings if present */}
                        {emr.ashtavidhaPariksha && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700 text-[11px]">
                            <div><span className="text-slate-400">Nadi (Pulse):</span> <strong className="block">{emr.ashtavidhaPariksha.nadi || 'Normal'}</strong></div>
                            <div><span className="text-slate-400">Jihva (Tongue):</span> <strong className="block">{emr.ashtavidhaPariksha.jihva || 'Nirama'}</strong></div>
                            <div><span className="text-slate-400">Mutra (Urine):</span> <strong className="block">{emr.ashtavidhaPariksha.mutra || 'Normal'}</strong></div>
                            <div><span className="text-slate-400">Mala (Bowel):</span> <strong className="block">{emr.ashtavidhaPariksha.mala || 'Regular'}</strong></div>
                          </div>
                        )}

                        {emr.pathyaApathya && (
                          <div className="text-xs bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-3 rounded-xl">
                            <strong className="text-emerald-800 dark:text-emerald-300 block mb-1">Pathya-Apathya (Diet &amp; Lifestyle Regimen):</strong>
                            <p className="text-slate-700 dark:text-slate-300">{emr.pathyaApathya}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 5: PANCHAKARMA THERAPIES LOG                     */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'panchakarma' && (
                <div className="space-y-4">
                  {history.panchakarma.length === 0 ? (
                    <p className="py-12 text-center text-xs text-slate-400">No Panchakarma therapy packages on record.</p>
                  ) : (
                    history.panchakarma.map(pk => (
                      <div key={pk._id} className="bg-teal-50/30 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">{pk.stage || 'Pradhana Karma'}</span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pk.therapyName}</h4>
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500 text-slate-950">
                            {pk.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-teal-200/50 dark:border-teal-900/40">
                          <div><span className="text-slate-400">Droni Room / Bed:</span> <strong className="block">{pk.roomBed || 'Suite A'}</strong></div>
                          <div><span className="text-slate-400">Duration:</span> <strong className="block">{pk.totalDays || 7} Days course</strong></div>
                          <div><span className="text-slate-400">Therapist:</span> <strong className="block">{pk.therapistName || 'Staff Therapist'}</strong></div>
                        </div>

                        {pk.dailyLogs && pk.dailyLogs.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-500">Daily Session Progress ({pk.dailyLogs.length} logged):</span>
                            {pk.dailyLogs.map((log, lIdx) => (
                              <div key={lIdx} className="text-xs flex items-center justify-between bg-slate-100/60 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg">
                                <span>Day {log.dayNumber}: {log.procedureDone}</span>
                                <span className="font-mono text-slate-400">{log.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 6: PRESCRIPTIONS & CLASSICAL FORMULATIONS        */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'rx' && (
                <div className="space-y-3">
                  {history.prescriptions.length === 0 ? (
                    <p className="py-12 text-center text-xs text-slate-400">No classical prescriptions recorded.</p>
                  ) : (
                    history.prescriptions.map(rx => (
                      <div key={rx._id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Rx by {rx.doctorName}</span>
                            <span className="text-xs text-slate-400 ml-2">({rx.medicines?.length || 0} formulations)</span>
                          </div>
                          <span className="text-xs font-mono text-slate-400">{new Date(rx.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-2">
                          {rx.medicines?.map((med, mIdx) => (
                            <div key={mIdx} className="bg-white dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                              <div>
                                <strong className="text-slate-900 dark:text-white">{med.medicineName}</strong>
                                <span className="text-[11px] text-slate-400 ml-2">[{med.kalpana || 'Kashayam'}]</span>
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  Dosage: {med.dosage} • Sevana Kala: {med.sevanaKala || 'Before Meals'}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  Anupana: {med.anupana || 'Lukewarm Water'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 7: FOLLOW-UPS & REVIEWS LOG                      */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'followups' && (
                <div className="space-y-3">
                  {history.followUps.length === 0 ? (
                    <p className="py-12 text-center text-xs text-slate-400">No scheduled follow-up reviews.</p>
                  ) : (
                    history.followUps.map(fu => (
                      <div key={fu._id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{fu.purpose || 'Follow-up Consultation'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              fu.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {fu.status || 'Pending'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            With: {fu.doctorName} • {fu.notes || 'Review symptoms and treatment response'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            Due: {new Date(fu.followUpDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 8: INVOICES & BILLING                            */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'billing' && (
                <div className="space-y-3">
                  {history.bills.length === 0 ? (
                    <p className="py-12 text-center text-xs text-slate-400">No billing invoices found.</p>
                  ) : (
                    history.bills.map(b => (
                      <div key={b._id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-600">{b.billNumber}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Total: ₹{b.totalAmount}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                              {b.paymentStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Payment: {b.paymentMethod || 'Cash'} • {b.items?.map(i => i.item).join(', ') || 'Consultation'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400">
            AyurCare Patient 360° Electronic Health Record
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Patient Health ID Card Modal */}
      {showCardModal && (
        <PatientCardModal
          patient={p}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </div>,
    document.body
  );
}
