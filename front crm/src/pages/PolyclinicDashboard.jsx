import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  AlertTriangle, 
  Stethoscope, 
  Activity, 
  FileText, 
  Pill, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Sparkles,
  Droplet,
  Flame,
  BedDouble,
  HeartPulse
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import { Link } from 'react-router-dom';

export default function PolyclinicDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      totalPatients: 0,
      todayAppointments: 0,
      waitingQueue: 0,
      inConsultation: 0,
      completedToday: 0,
      activePanchakarma: 0,
      completedTherapies: 0,
      todayRevenue: 0,
      totalRevenue: 0,
      pendingPayments: 0,
      lowStockCount: 0
    },
    recentPanchakarma: [],
    lowStockItems: [],
    doctors: []
  });

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getDashboardStats();
      if (res.success) setData(res);

      const apptRes = await polyclinicService.getAppointments();
      if (apptRes.success) {
        setAppointments(apptRes.appointments.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Registered Rogis (Patients)', 
      value: data.stats.totalPatients, 
      subtitle: 'Profiles with Prakriti records', 
      icon: Users, 
      link: '/patient-enquiries' 
    },
    { 
      title: "Today's Vaidya Consultations", 
      value: data.stats.todayAppointments, 
      subtitle: 'Scheduled OP appointments', 
      icon: Calendar, 
      link: '/appointments' 
    },
    { 
      title: 'Active Panchakarma Courses', 
      value: data.stats.activePanchakarma || 2, 
      subtitle: 'In-progress therapy packages', 
      icon: Sparkles, 
      link: '/panchakarma' 
    },
    { 
      title: 'Live OP Queue (Waiting)', 
      value: data.stats.waitingQueue, 
      subtitle: 'Patients at reception room', 
      icon: Clock, 
      link: '/reception-queue' 
    },
    { 
      title: "Today's Hospital Collection", 
      value: `₹${(data.stats.todayRevenue || 0).toLocaleString()}`, 
      subtitle: 'Consultations, therapies & Aushadhi', 
      icon: DollarSign, 
      link: '/billing' 
    },
    { 
      title: 'Aushadhi Shala Low Stock', 
      value: data.stats.lowStockCount, 
      subtitle: 'Classical herbal medicines to reorder', 
      icon: AlertTriangle, 
      link: '/pharmacy-inventory' 
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Premium Ayurvedic Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white p-8 md:p-10 shadow-2xl border border-emerald-800/80">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> Ayurvedic Hospital & Panchakarma Suite
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Ayurvedic Hospital & Wellness Operations
            </h1>
            <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed">
              Tridosha Rogi Pariksha, Ashtavidha diagnostics, Panchakarma therapy scheduling & Droni bed management, Aushadhi Shala herbal dispensary, and consolidated billing.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/patient-enquiries" className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-5 py-3 rounded-2xl transition shadow-lg text-xs whitespace-nowrap">
              <Plus className="w-4 h-4" /> Register Rogi
            </Link>
            <Link to="/appointments" className="inline-flex items-center gap-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 font-semibold px-4 py-3 rounded-2xl border border-emerald-700/80 transition text-xs whitespace-nowrap">
              <Calendar className="w-4 h-4" /> Book OP Slot
            </Link>
            <Link to="/panchakarma" className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold px-4 py-3 rounded-2xl border border-emerald-500/40 transition text-xs whitespace-nowrap">
              <Droplet className="w-4 h-4 text-emerald-400" /> Panchakarma Suite
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link}>
              <motion.div 
                whileHover={{ y: -3 }}
                className="group relative bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{card.title}</span>
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{card.value}</div>
                  <p className="text-xs text-slate-400 font-normal">{card.subtitle}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Live Panchakarma Sessions & Vaidya Consultation Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Panchakarma Courses */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Panchakarma Therapies</h2>
            </div>
            <Link to="/panchakarma" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data.recentPanchakarma && data.recentPanchakarma.length > 0) ? (
              data.recentPanchakarma.map((pk) => {
                const progress = Math.min(100, Math.round(((pk.completedSessions || 0) / (pk.totalSessions || 1)) * 100));
                return (
                  <div key={pk._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{pk.patientName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {pk.status}
                      </span>
                    </div>

                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5" /> {pk.therapyName}
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>Therapist: {pk.therapistName}</span>
                      <span>{pk.completedSessions || 0} of {pk.totalSessions} Sessions ({progress}%)</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No active Panchakarma courses recorded.</p>
            )}
          </div>
        </div>

        {/* Today's Vaidya Consultations */}
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Vaidya OP Schedule</h2>
            </div>
            <Link to="/appointments" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              View Appointments <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No appointments scheduled for today.</p>
            ) : (
              appointments.map((appt) => (
                <div key={appt._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Token #{appt.tokenNumber || 1}</span>
                      <span>•</span>
                      <span>{appt.patientName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Vaidya: {appt.doctorName} • {appt.timeSlot}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    appt.status === 'Completed'
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                      : appt.status === 'In-Consultation'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* On-Duty Vaidyas & Panchakarma Therapists */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Hospital Vaidyas & Panchakarma Therapists
            </h2>
          </div>
          <Link to="/doctors-staff" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            Manage Staff <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data.doctors || []).map((doc) => (
            <div key={doc._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{doc.doctorName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {doc.staffType || 'Ayurvedic Practitioner'}
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{doc.specialization}</p>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800">
                <span>Fee: ₹{doc.consultationFee || 0}</span>
                <span>{doc.availableDays?.length || 6} Days/Week</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
