import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Pill, AlertTriangle, FileText } from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';

export default function PolyclinicReportsPage() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    waitingQueue: 0,
    completedToday: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getDashboardStats();
      if (res.success) setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" /> Polyclinic Executive Analytics
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Revenue breakdown, consultation statistics, inventory alerts, and pending dues summary.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">₹{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Consultation + Lab + Pharmacy</p>
        </div>

        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Dues</p>
          <p className="text-3xl font-extrabold text-rose-500 tracking-tight">₹{stats.pendingPayments.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Outstanding patient balances</p>
        </div>

        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Patients</p>
          <p className="text-3xl font-extrabold text-indigo-500 tracking-tight">{stats.totalPatients}</p>
          <p className="text-xs text-slate-400">Active medical profiles</p>
        </div>

        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-2">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Low Stock Alerts</p>
          <p className="text-3xl font-extrabold text-amber-500 tracking-tight">{stats.lowStockCount}</p>
          <p className="text-xs text-slate-400">Items below minimum stock</p>
        </div>
      </div>
    </div>
  );
}
