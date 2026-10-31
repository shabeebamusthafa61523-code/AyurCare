import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  UsersRound, 
  Users, 
  Phone, 
  Search, 
  Plus, 
  UserPlus, 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  History, 
  Edit2, 
  Trash2, 
  UserCheck, 
  User, 
  HeartPulse, 
  Activity, 
  X, 
  RefreshCw,
  Share2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Filter,
  CreditCard
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';
import PatientDetailsModal from '../components/PatientDetailsModal';
import PatientCardModal from '../components/PatientCardModal';

export default function FamilyPatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('shared'); // 'shared' (>=2 members), 'all', 'solo'
  const [sortBy, setSortBy] = useState('members-desc'); // 'members-desc', 'name-asc', 'phone-asc'
  
  // 360 Details Modal State
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState(null);
  const [selectedPatientForCard, setSelectedPatientForCard] = useState(null);

  // Add / Edit Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    prakriti: 'Unknown',
    dietHabit: 'Vegetarian',
    address: '',
    notes: ''
  });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {}
  });

  // Notification Toast / Message Banner
  const [actionNotice, setActionNotice] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setActionNotice({ message: msg, type });
    setTimeout(() => {
      setActionNotice(null);
    }, 4000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ptsRes, apptsRes] = await Promise.all([
        polyclinicService.getPatients(),
        polyclinicService.getAppointments().catch(() => ({ success: false, appointments: [] }))
      ]);

      if (ptsRes && ptsRes.success) {
        setPatients(ptsRes.patients || []);
      }
      if (apptsRes && apptsRes.success) {
        setAppointments(apptsRes.appointments || []);
      }
    } catch (err) {
      console.error('Error loading patients or appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to normalize phone numbers for accurate grouping
  const normalizePhone = (phoneStr) => {
    if (!phoneStr) return '';
    const digits = String(phoneStr).replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  };

  // Build Family Groups
  const familyGroups = useMemo(() => {
    const map = {};
    const todayStr = new Date().toISOString().split('T')[0];

    patients.forEach(pt => {
      const rawPhone = (pt.phone || '').trim();
      const normPhone = normalizePhone(rawPhone) || 'NO_PHONE';

      if (!map[normPhone]) {
        map[normPhone] = {
          key: normPhone,
          displayPhone: rawPhone || 'No Phone Number',
          normalizedPhone: normPhone,
          members: []
        };
      }

      // Calculate visits and today's activity for this patient
      const patientAppts = appointments.filter(a => {
        const aPatId = a.patientId?._id || a.patientId;
        return aPatId === pt._id || aPatId === pt.patientId;
      });

      const todayAppt = patientAppts.find(a => {
        const apptDate = a.date ? String(a.date).split('T')[0] : '';
        return apptDate === todayStr;
      });

      // Sort appointments to get latest visit
      const sortedAppts = [...patientAppts].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      const lastVisit = sortedAppts[0] || null;

      map[normPhone].members.push({
        ...pt,
        totalVisits: patientAppts.length,
        todayAppt: todayAppt || null,
        lastVisit: lastVisit || null
      });
    });

    return Object.values(map);
  }, [patients, appointments]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalGroups = familyGroups.length;
    const sharedGroups = familyGroups.filter(g => g.members.length >= 2);
    const soloGroups = familyGroups.filter(g => g.members.length === 1);
    const totalSharedMembers = sharedGroups.reduce((acc, g) => acc + g.members.length, 0);
    const maxFamilySize = familyGroups.length > 0 ? Math.max(...familyGroups.map(g => g.members.length)) : 0;

    return {
      totalGroups,
      sharedGroupsCount: sharedGroups.length,
      soloGroupsCount: soloGroups.length,
      totalSharedMembers,
      maxFamilySize
    };
  }, [familyGroups]);

  // Filtered and Sorted Groups
  const filteredGroups = useMemo(() => {
    let result = [...familyGroups];

    // Filter by Tab
    if (activeTab === 'shared') {
      result = result.filter(g => g.members.length >= 2);
    } else if (activeTab === 'solo') {
      result = result.filter(g => g.members.length === 1);
    }

    // Filter by Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(group => {
        const phoneMatch = group.displayPhone.toLowerCase().includes(q) || group.normalizedPhone.includes(q);
        const memberMatch = group.members.some(m => 
          (m.name || '').toLowerCase().includes(q) ||
          (m.patientId || '').toLowerCase().includes(q) ||
          (m.address || '').toLowerCase().includes(q)
        );
        return phoneMatch || memberMatch;
      });
    }

    // Sort
    if (sortBy === 'members-desc') {
      result.sort((a, b) => b.members.length - a.members.length);
    } else if (sortBy === 'phone-asc') {
      result.sort((a, b) => a.displayPhone.localeCompare(b.displayPhone));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => {
        const nameA = a.members[0]?.name || '';
        const nameB = b.members[0]?.name || '';
        return nameA.localeCompare(nameB);
      });
    }

    return result;
  }, [familyGroups, activeTab, searchTerm, sortBy]);

  // Open modal to add a member to a specific family group
  const handleOpenAddFamilyMember = (phoneToPrefill = '') => {
    setEditingPatientId(null);
    setMemberForm({
      name: '',
      phone: phoneToPrefill || '',
      email: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'O+',
      prakriti: 'Unknown',
      dietHabit: 'Vegetarian',
      address: '',
      notes: ''
    });
    setShowMemberModal(true);
  };

  // Open modal to edit existing patient
  const handleOpenEditPatient = (patient) => {
    setEditingPatientId(patient._id);
    setMemberForm({
      name: patient.name || '',
      phone: patient.phone || '',
      email: patient.email || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      bloodGroup: patient.bloodGroup || 'O+',
      prakriti: patient.prakriti || 'Unknown',
      dietHabit: patient.dietHabit || 'Vegetarian',
      address: patient.address || '',
      notes: patient.notes || ''
    });
    setShowMemberModal(true);
  };

  // Submit Member Form (Create or Update)
  const handleSubmitMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim()) {
      showNotification('Please enter the patient name.', 'error');
      return;
    }
    if (!memberForm.phone.trim()) {
      showNotification('Please enter the phone number.', 'error');
      return;
    }

    try {
      if (editingPatientId) {
        const res = await polyclinicService.updatePatient(editingPatientId, memberForm);
        if (res.success) {
          showNotification(`Patient "${memberForm.name}" updated successfully!`);
          setShowMemberModal(false);
          loadData();
        } else {
          showNotification(res.message || 'Failed to update patient.', 'error');
        }
      } else {
        const res = await polyclinicService.createPatient(memberForm);
        if (res.success) {
          showNotification(`Family member "${memberForm.name}" registered successfully!`);
          setShowMemberModal(false);
          loadData();
        } else {
          showNotification(res.message || 'Failed to register patient.', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving family member:', err);
      showNotification('An error occurred while saving. Please try again.', 'error');
    }
  };

  // Delete Patient
  const handleDeletePatient = (patient) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Patient Record',
      message: `Are you sure you want to delete "${patient.name}" (${patient.patientId || patient.phone})? This will unlink them from this family group.`,
      confirmText: 'Delete Member',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.deletePatient(patient._id);
          if (res.success) {
            showNotification(`Patient "${patient.name}" deleted.`);
            loadData();
          } else {
            showNotification(res.message || 'Failed to delete patient.', 'error');
          }
        } catch (err) {
          console.error('Error deleting patient:', err);
          showNotification('Error deleting patient record.', 'error');
        }
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm shadow-md transition-all ${
          actionNotice.type === 'error' 
            ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300' 
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {actionNotice.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            <span className="font-medium">{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1 rounded-lg hover:bg-black/5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
              <UsersRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Family Patient Directory
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Shared Numbers
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Patients grouped by shared phone number. View linked family members, clinical visits, and manage family accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh data"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenAddFamilyMember()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm shadow-emerald-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Family Member</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Shared Family Numbers</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <UsersRound className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.sharedGroupsCount}</div>
          <p className="text-xs text-slate-400 mt-1">Phone numbers with 2+ members</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Linked Family Members</span>
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalSharedMembers}</div>
          <p className="text-xs text-slate-400 mt-1">Patients in shared family groups</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Phone Accounts</span>
            <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Phone className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalGroups}</div>
          <p className="text-xs text-slate-400 mt-1">Distinct contact numbers in clinic</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Solo Patient Numbers</span>
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <User className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.soloGroupsCount}</div>
          <p className="text-xs text-slate-400 mt-1">Individual / solo phone accounts</p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('shared')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shared'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UsersRound className="w-3.5 h-3.5" />
            <span>Shared Families (2+)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {metrics.sharedGroupsCount}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All Phone Numbers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {metrics.totalGroups}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('solo')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'solo'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Solo Numbers (1)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {metrics.soloGroupsCount}
            </span>
          </button>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search phone number or member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="members-desc">Most Members First</option>
            <option value="phone-asc">Phone Number (A-Z)</option>
            <option value="name-asc">First Member Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Family Cards Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading family accounts and patients...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 mx-auto flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900">
            <UsersRound className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Family Groups Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
            {searchTerm 
              ? `No patient records match the search term "${searchTerm}". Try a different phone or name.`
              : activeTab === 'shared' 
                ? 'There are currently no patients sharing the same phone number. Click below to add a family member under an existing number.'
                : 'No patients found in this category.'}
          </p>
          <button
            onClick={() => handleOpenAddFamilyMember()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient / Family</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => {
            const totalFamilyVisits = group.members.reduce((acc, m) => acc + (m.totalVisits || 0), 0);
            const hasActiveToday = group.members.some(m => !!m.todayAppt);

            return (
              <div 
                key={group.key}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all"
              >
                {/* Family Header Banner */}
                <div className="p-4 sm:px-6 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-teal-50/20 dark:from-slate-800/50 dark:via-slate-800/30 dark:to-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-600/30">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
                          {group.displayPhone}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          group.members.length >= 2 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {group.members.length} {group.members.length === 1 ? 'Family Member' : 'Family Members'}
                        </span>
                        {hasActiveToday && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Active In Clinic Today
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>Total Family Visits: <strong className="text-slate-700 dark:text-slate-200">{totalFamilyVisits}</strong></span>
                        <span>•</span>
                        <span>Primary Contact: <strong className="text-slate-700 dark:text-slate-200">{group.members[0]?.name || 'N/A'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenAddFamilyMember(group.displayPhone)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-semibold transition-colors"
                      title="Add another family member under this phone number"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Member</span>
                    </button>
                  </div>
                </div>

                {/* Family Members Grid / Table */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {group.members.map((member, idx) => {
                    const isMale = String(member.gender).toLowerCase() === 'male';

                    return (
                      <div 
                        key={member._id || idx}
                        className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Member Identity & Prakriti */}
                        <div className="flex items-start sm:items-center space-x-3.5 min-w-[240px]">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${
                            isMale 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300' 
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}>
                            {(member.name || 'P')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                {member.name}
                              </span>
                              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {member.patientId || 'PAT-NEW'}
                              </span>
                              {idx === 0 && group.members.length > 1 && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                              <span>{member.age ? `${member.age} Yrs` : 'Age N/A'}</span>
                              <span>•</span>
                              <span>{member.gender || 'Unknown'}</span>
                              {member.prakriti && member.prakriti !== 'Unknown' && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                                    <Sparkles className="w-3 h-3" />
                                    {member.prakriti}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Clinical History & Visit Count */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Visits</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                              {member.totalVisits} {member.totalVisits === 1 ? 'Visit' : 'Visits'}
                            </span>
                          </div>

                          <div className="min-w-[140px]">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Consultation</span>
                            {member.lastVisit ? (
                              <div>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {new Date(member.lastVisit.date || member.lastVisit.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                                {member.lastVisit.doctor && (
                                  <span className="block text-[11px] text-slate-400 truncate max-w-[160px]">
                                    {member.lastVisit.doctor}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No past visits recorded</span>
                            )}
                          </div>

                          {/* Today's Token Status */}
                          <div className="min-w-[120px]">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Today's Token</span>
                            {member.todayAppt ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                Token #{member.todayAppt.tokenNumber || 'Active'} ({member.todayAppt.status || 'Queued'})
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No active token</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pt-2 md:pt-0">
                          {/* Patient Health ID Card */}
                          <button
                            onClick={() => setSelectedPatientForCard(member)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-semibold transition-colors border border-amber-200/80 dark:border-amber-800/80 cursor-pointer"
                            title="Generate & Print Patient Health Card"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Card</span>
                          </button>

                          {/* 360 History Modal Trigger */}
                          <button
                            onClick={() => setSelectedPatientForDetails(member)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-semibold transition-colors border border-teal-200/80 dark:border-teal-800/80"
                            title="View 360 Full Medical History"
                          >
                            <History className="w-3.5 h-3.5 text-teal-600" />
                            <span>360° History</span>
                          </button>

                          {/* Reception Token Quick Route */}
                          <button
                            onClick={() => navigate('/reception-queue', { state: { prefillPhone: member.phone, patientId: member._id } })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors border border-emerald-200/80 dark:border-emerald-800/80"
                            title="Issue Reception Queue Token"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden lg:inline">Token</span>
                          </button>

                          {/* Book Appointment Quick Route */}
                          <button
                            onClick={() => navigate('/appointments', { state: { patientId: member._id } })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-semibold transition-colors border border-sky-200/80 dark:border-sky-800/80"
                            title="Book Appointment"
                          >
                            <Calendar className="w-3.5 h-3.5 text-sky-600" />
                            <span className="hidden lg:inline">Appt</span>
                          </button>

                          {/* Edit Patient */}
                          <button
                            onClick={() => handleOpenEditPatient(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Edit Member Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Patient */}
                          <button
                            onClick={() => handleDeletePatient(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Patient Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register / Edit Family Member Modal */}
      {showMemberModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingPatientId ? 'Edit Family Member' : 'Register New Family Member'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {memberForm.phone ? `Linked to family phone: ${memberForm.phone}` : 'Enter patient & family contact info'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMemberModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitMember} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Linked Phone Banner */}
              {memberForm.phone && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Family Phone Number: <strong>{memberForm.phone}</strong></span>
                  </div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Shared Contact</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (Family Phone) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10 digit mobile number"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="125"
                    placeholder="e.g. 42"
                    value={memberForm.age}
                    onChange={(e) => setMemberForm({ ...memberForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prakriti (Ayurvedic Constitution)
                  </label>
                  <select
                    value={memberForm.prakriti}
                    onChange={(e) => setMemberForm({ ...memberForm, prakriti: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Unknown">Unknown / Pending Nadi Pariksha</option>
                    <option value="Vata">Vata</option>
                    <option value="Pitta">Pitta</option>
                    <option value="Kapha">Kapha</option>
                    <option value="Vata-Pitta">Vata-Pitta</option>
                    <option value="Pitta-Kapha">Pitta-Kapha</option>
                    <option value="Vata-Kapha">Vata-Kapha</option>
                    <option value="Tridoshic (Sama)">Tridoshic (Sama)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com (optional)"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="House No, Street, City"
                  value={memberForm.address}
                  onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Health History / Chief Complaints / Family Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g., Son of Suresh Kumar; prone to allergic rhinitis or migraine..."
                  value={memberForm.notes}
                  onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm shadow-emerald-600/20"
                >
                  {editingPatientId ? 'Update Details' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Patient Health ID Card Modal */}
      {selectedPatientForCard && (
        <PatientCardModal
          patient={selectedPatientForCard}
          onClose={() => setSelectedPatientForCard(null)}
        />
      )}

      {/* Patient 360 Full Medical History Modal */}
      <PatientDetailsModal
        isOpen={!!selectedPatientForDetails}
        patientId={selectedPatientForDetails?._id}
        initialPatient={selectedPatientForDetails}
        onClose={() => setSelectedPatientForDetails(null)}
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
