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

      {/* Executive Summary Table */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Clinic Performance & Revenue Breakdown</h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
            Real-time Telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-5">Operational Indicator</th>
                <th className="py-3.5 px-5">Current Metric</th>
                <th className="py-3.5 px-5">Financial / Volume Value</th>
                <th className="py-3.5 px-5">Health / Assessment</th>
                <th className="py-3.5 px-5 text-right">Details & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              <tr className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Total Hospital Revenue
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">All Time Cumulative</td>
                <td className="py-3.5 px-5 font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{(stats.totalRevenue || 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Strong Growth
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right text-slate-500 text-[11px]">
                  Includes Consultations, Panchakarma, Pharmacy & Lab
                </td>
              </tr>

              <tr className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Today's Collection
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">Current Date Daily</td>
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                  ₹{(stats.todayRevenue || 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Active Flow
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right text-slate-500 text-[11px]">
                  OPD Tokens, Service fees, and Med sales recorded today
                </td>
              </tr>

              <tr className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Outstanding Due Balances
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">Unsettled Patient Bills</td>
                <td className="py-3.5 px-5 font-bold text-rose-600 dark:text-rose-400">
                  ₹{(stats.pendingPayments || 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Follow-up Required
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right text-slate-500 text-[11px]">
                  Pending invoices across reception and billing desk
                </td>
              </tr>

              <tr className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" /> Registered Patient Cohort
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">Active Unique Patients</td>
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                  {stats.totalPatients || 0}
                </td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    Expanding
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right text-slate-500 text-[11px]">
                  Patients with electronic medical records (EMR)
                </td>
              </tr>

              <tr className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Today's Scheduled Visits
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">Daily Bookings</td>
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                  {stats.todayAppointments || 0} appointments
                </td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {stats.completedToday || 0} Attended
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right text-slate-500 text-[11px]">
                  Scheduled appointments across all Vaidyas
                </td>
              </tr>

              <tr className="hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amber-500" /> Pharmacy Inventory Threshold
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">Low Stock Reorders</td>
                <td className="py-3.5 px-5 font-bold text-amber-600 dark:text-amber-400">
                  {stats.lowStockCount || 0} SKUs
                </td>
                <td className="py-3.5 px-5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Restock Queue
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right text-slate-500 text-[11px]">
                  Formulations below minimum reorder inventory point
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
