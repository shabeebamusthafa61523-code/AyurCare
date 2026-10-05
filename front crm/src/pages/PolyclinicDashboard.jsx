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
  ChevronRight
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
      todayRevenue: 0,
      totalRevenue: 0,
      pendingPayments: 0,
      lowStockCount: 0
    },
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
    { title: 'Total Patients', value: data.stats.totalPatients, subtitle: 'Registered profiles', icon: Users, link: '/patients' },
    { title: "Today's Appointments", value: data.stats.todayAppointments, subtitle: 'Scheduled slots', icon: Calendar, link: '/appointments' },
    { title: 'Live Queue (Waiting)', value: data.stats.waitingQueue, subtitle: 'In reception room', icon: Clock, link: '/reception-queue' },
    { title: 'In Consultation', value: data.stats.inConsultation, subtitle: 'With doctor', icon: Activity, link: '/doctor-emr' },
    { title: "Today's Collection", value: `₹${data.stats.todayRevenue.toLocaleString()}`, subtitle: 'Paid invoices', icon: DollarSign, link: '/billing' },
    { title: 'Pharmacy Low Stock', value: data.stats.lowStockCount, subtitle: 'Items to reorder', icon: AlertTriangle, link: '/pharmacy-inventory' }
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
      {/* Premium Minimal Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-10 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold tracking-wide border border-emerald-500/20">
              <Stethoscope className="w-3.5 h-3.5" /> Healthcare Command Suite
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Polyclinic & Wellness Operations
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Seamless patient registration, queue dispatching, EMR consultation, digital prescriptions, lab orders, and pharmacy inventory control.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/patient-enquiries" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-2xl transition shadow-lg text-sm">
              <Plus className="w-4 h-4" /> Register Patient
            </Link>
            <Link to="/appointments" className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold px-4 py-3 rounded-2xl border border-slate-700/80 transition text-sm">
              <Calendar className="w-4 h-4" /> Book Slot
            </Link>
            <Link to="/reception-queue" className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold px-4 py-3 rounded-2xl border border-slate-700/80 transition text-sm">
              <UserCheck className="w-4 h-4" /> Reception Queue
            </Link>
          </div>
        </div>
      </div>

      {/* Premium Minimal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link}>
              <motion.div 
                whileHover={{ y: -3 }}
                className="group relative bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{card.title}</span>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{card.value}</div>
                  <p className="text-xs text-slate-400 font-normal">{card.subtitle}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Queue Feed & Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Queue Table Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" /> Today's Patient Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Live status of active appointments and waiting room tokens</p>
            </div>
            <Link to="/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-400 text-xs">No active appointments scheduled today.</td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">#{appt.tokenNumber || 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{appt.patientName}</div>
                        <div className="text-xs text-slate-400">{appt.patientPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">{appt.doctorName}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">{appt.timeSlot}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          appt.status === 'Checked-In' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50' :
                          appt.status === 'In-Consultation' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50' :
                          appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50' :
                          'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets: Active Doctors & Inventory Alerts */}
        <div className="space-y-6">
          {/* Active Doctors Panel */}
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-500" /> Active Doctors & Specialists
            </h3>
            <div className="space-y-2.5">
              {data.doctors.length === 0 ? (
                <p className="text-xs text-slate-400">No doctors registered.</p>
              ) : (
                data.doctors.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs">{doc.doctorName}</p>
                      <p className="text-[11px] text-slate-400">{doc.specialization}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                      ₹{doc.consultationFee}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Warnings Panel */}
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" /> Low Stock Inventory
              </h3>
              <Link to="/pharmacy-inventory" className="text-xs font-semibold text-emerald-600 hover:underline">Manage</Link>
            </div>
            <div className="space-y-2">
              {data.lowStockItems.length === 0 ? (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2 py-2">
                  <CheckCircle2 className="w-4 h-4" /> All medicine inventory optimal.
                </div>
              ) : (
                data.lowStockItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold text-xs bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md text-rose-900 dark:text-rose-100">
                      {item.quantity} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
