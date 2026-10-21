import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Shield, Search, Loader2, ChevronRight, User as UserIcon, 
  Mail, Briefcase, Folder, CheckCircle2, XCircle, Filter, Sparkles,
  Users, Sliders, CheckSquare, Square, Save, RefreshCw, Layers,
  Stethoscope, Wallet, PhoneCall, BarChart3, LayoutDashboard, Check, Zap, HelpCircle,
  Leaf, HeartPulse, FileText, Tag, Receipt, Clock, UserCog, Calendar, CreditCard,
  Building, ListCheck, Bell, Activity
} from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import { SIDEBAR_ALIASES } from '../components/Sidebar';

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const getApiEndpoint = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE.endsWith('/v1')) {
    return `${API_BASE}${cleanPath}`;
  }
  if (API_BASE.endsWith('/api')) {
    return `${API_BASE}/v1${cleanPath}`;
  }
  return `${API_BASE}/api/v1${cleanPath}`;
};

export const ALL_SYSTEM_MODULES = [
  // --- FRONT DESK & RECEPTION ---
  { label: 'Dashboard', path: '/polyclinic-dashboard', category: 'Front Desk & Reception', icon: LayoutDashboard, desc: 'Central Ayurvedic clinic & polyclinic overview KPI dashboard' },
  { label: 'Tokens & Queue', path: '/reception-queue', category: 'Front Desk & Reception', icon: Users, desc: 'Live patient OP token check-in, thermal printing & lounge TV display' },
  { label: 'Patients', path: '/patient-enquiries', category: 'Front Desk & Reception', icon: PhoneCall, desc: 'Patient enquiry CRM, registration & lead conversion management' },
  { label: 'Family', path: '/family-patients', category: 'Front Desk & Reception', icon: Users, desc: 'Family patient directories grouped by shared primary contact number' },
  { label: 'Appointments', path: '/appointments', category: 'Front Desk & Reception', icon: Calendar, desc: 'Doctor slot schedule & patient appointment booking calendar' },
  { label: 'Services', path: '/services', category: 'Front Desk & Reception', icon: HeartPulse, desc: 'Panchakarma treatments, consultation tariffs & session catalog' },

  // --- CLINICAL CARE & THERAPIES ---
  { label: 'Doctor Consultations', path: '/doctor-emr', category: 'Clinical Care & Therapies', icon: Stethoscope, desc: 'Doctor EMR, Nadi Pariksha, Prakriti, Doshic evaluation & clinical presets' },
  { label: 'Prescriptions', path: '/prescriptions', category: 'Clinical Care & Therapies', icon: FileText, desc: 'Ayurvedic e-prescriptions, Aushadha Kala, Anupana & dispensing' },
  { label: 'Therapy Sessions', path: '/panchakarma', category: 'Clinical Care & Therapies', icon: Sparkles, desc: 'Panchakarma therapies, Droni bed assignment & therapist progress tracking' },
  { label: 'Lab Reports', path: '/laboratory', category: 'Clinical Care & Therapies', icon: Activity, desc: 'Pathology & diagnostics lab tests, sample collection & test results' },

  // --- DISPENSARY, BILLING & FOLLOW-UP ---
  { label: 'Pharmacy Inventory', path: '/pharmacy-inventory', category: 'Dispensary & Billing', icon: Tag, desc: 'Classical herbal medicines, batch tracking, expiry & low-stock alerts' },
  { label: 'Invoices', path: '/invoices', category: 'Dispensary & Billing', icon: Receipt, desc: 'Daily OP consultation, therapy & pharmacy unified billing invoices' },
  { label: 'Follow-ups', path: '/patient-followups', category: 'Dispensary & Billing', icon: Clock, desc: 'Post-consultation follow-up scheduling, care plans & automated reminders' },

  // --- STAFF & CLINIC OPERATIONS ---
  { label: 'Doctors & Therapists', path: '/doctors-staff', category: 'Staff & Clinic Operations', icon: UserCog, desc: 'Doctor & therapist directory, duty roster & visiting fees' },
  { label: 'Staff Attendance', path: '/staff-attendance', category: 'Staff & Clinic Operations', icon: CheckCircle2, desc: 'Staff biometric / digital daily check-in attendance records' },
  { label: 'Leave Requests', path: '/leaves', category: 'Staff & Clinic Operations', icon: Calendar, desc: 'Staff leave applications, approval workflows & balance tracking' },
  { label: 'Staff Payslips', path: '/payslips', category: 'Staff & Clinic Operations', icon: CreditCard, desc: 'Hospital staff salary calculation & monthly payslip issuance' },
  { label: 'My Payslip', path: '/my-payslip', category: 'Staff & Clinic Operations', icon: FileText, desc: 'Personal confidential salary slip viewing for logged-in employee' },
  { label: 'Accounts & Expenses', path: '/accounts', category: 'Staff & Clinic Operations', icon: Wallet, desc: 'Daily clinic expenses, cash registers & operating ledger' },
  { label: 'Departments', path: '/departments', category: 'Staff & Clinic Operations', icon: Building, desc: 'Clinical & operational department hierarchy management' },
  { label: 'Users & Roles', path: '/users', category: 'Staff & Clinic Operations', icon: Users, desc: 'Staff accounts, role management & credentials' },
  { label: 'Role Permissions', path: '/permissions', category: 'Staff & Clinic Operations', icon: ShieldCheck, desc: 'Custom role-based sidebar access control & permissions configurator' },

  // --- ANALYTICS, TASKS & ALERTS ---
  { label: 'Hospital Reports', path: '/polyclinic-reports', category: 'Analytics, Tasks & Alerts', icon: BarChart3, desc: 'Comprehensive financial, clinical & patient turnover analytics' },
  { label: 'AI Health Insights', path: '/ai-report', category: 'Analytics, Tasks & Alerts', icon: Sparkles, desc: 'AI-assisted health summaries & clinical intelligence reports' },
  { label: 'Tasks', path: '/todo', category: 'Analytics, Tasks & Alerts', icon: ListCheck, desc: 'Staff operational daily task assignments & progress checklists' },
  { label: 'Notifications', path: '/notifications', category: 'Analytics, Tasks & Alerts', icon: Bell, desc: 'System-wide clinic alerts, doctor calls & patient queue notifications' }
];

// Preset Templates for quick clinical role assignment
export const ROLE_PRESETS = {
  'Full Access Admin': ALL_SYSTEM_MODULES.map(m => m.label),
  'Doctor / Vaidya': [
    'Dashboard', 'Appointments', 'Doctor Consultations', 'Prescriptions',
    'Therapy Sessions', 'Lab Reports', 'Follow-ups', 'My Payslip', 'Tasks', 'Notifications'
  ],
  'Receptionist': [
    'Dashboard', 'Tokens & Queue', 'Patients', 'Family', 'Appointments',
    'Services', 'Invoices', 'Follow-ups', 'Leave Requests', 'My Payslip', 'Notifications'
  ],
  'Panchakarma Therapist': [
    'Dashboard', 'Therapy Sessions', 'Appointments', 'Follow-ups',
    'Leave Requests', 'My Payslip', 'Tasks', 'Notifications'
  ],
  'Pharmacist': [
    'Dashboard', 'Pharmacy Inventory', 'Prescriptions', 'Invoices',
    'Leave Requests', 'My Payslip', 'Notifications'
  ],
  'Billing / Accounts': [
    'Dashboard', 'Invoices', 'Accounts & Expenses', 'Staff Payslips',
    'Hospital Reports', 'My Payslip', 'Notifications'
  ],
  'Hospital Operations Manager': [
    'Dashboard', 'Doctors & Therapists', 'Staff Attendance', 'Leave Requests',
    'Staff Payslips', 'Users & Roles', 'Role Permissions', 'Departments',
    'Hospital Reports', 'Tasks', 'Notifications'
  ]
};

export default function PermissionsPage() {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'matrix', 'modules'
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'configured', 'unconfigured', 'superadmin'

  // Selected User State for In-Page Configurator
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [moduleSearch, setModuleSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savingUser, setSavingUser] = useState(false);

  // Role Matrix State
  const [selectedRolePreset, setSelectedRolePreset] = useState('Doctor / Vaidya');

  const getAuthHeaders = useCallback(() => {
    const rawToken = localStorage.getItem('token');
    const cleanToken = rawToken ? rawToken.replace(/"/g, '') : '';
    return { 'Authorization': cleanToken.startsWith('Bearer ') ? cleanToken : `Bearer ${cleanToken}` };
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiEndpoint('/users'), {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const uList = Array.isArray(data.data) ? data.data : [];
        setUsers(uList);

        if (uList.length > 0) {
          // If URL param provided, select that specific user
          let userToSelect = null;
          if (routeUserId) {
            userToSelect = uList.find(u => String(u._id || u.id) === String(routeUserId));
          }
          if (!userToSelect) {
            userToSelect = selectedUser 
              ? (uList.find(u => String(u._id || u.id) === String(selectedUser._id || selectedUser.id)) || uList[0])
              : uList[0];
          }

          if (userToSelect) {
            setSelectedUser(userToSelect);
            setIsSuperAdmin(Boolean(userToSelect.isSuperAdmin || userToSelect.role === 'superadmin'));
            setUserPermissions(Array.isArray(userToSelect.permissions) ? userToSelect.permissions : []);
          }
        }
      } else {
        showToast(data.message || "Failed to load users", "error");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Error loading users.", "error");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, showToast, routeUserId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle user selection in-page
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsSuperAdmin(Boolean(user.isSuperAdmin || user.role === 'superadmin'));
    setUserPermissions(Array.isArray(user.permissions) ? user.permissions : []);
  };

  // Check if a specific module is granted for the currently selected user
  const isModuleChecked = (item) => {
    if (isSuperAdmin) return true;
    const pathLower = item.path.toLowerCase().trim();
    const labelLower = item.label.toLowerCase().trim();
    const aliases = (SIDEBAR_ALIASES[pathLower] || []).map(a => a.toLowerCase().trim());

    return userPermissions.some(p => {
      const pLower = String(p).toLowerCase().trim();
      return pLower === labelLower || pLower === pathLower || aliases.includes(pLower);
    });
  };

  // Toggle permission for a single module
  const togglePermission = (item) => {
    if (isSuperAdmin) return;
    const checked = isModuleChecked(item);
    const pathLower = item.path.toLowerCase().trim();
    const labelLower = item.label.toLowerCase().trim();
    const aliases = (SIDEBAR_ALIASES[pathLower] || []).map(a => a.toLowerCase().trim());

    if (checked) {
      // Remove all instances of this module, path, and aliases
      setUserPermissions(prev => prev.filter(p => {
        const pLower = String(p).toLowerCase().trim();
        return pLower !== labelLower && pLower !== pathLower && !aliases.includes(pLower);
      }));
    } else {
      // Add standard label and path
      setUserPermissions(prev => Array.from(new Set([...prev, item.label, item.path])));
    }
  };

  // Apply a role template preset
  const applyPreset = (presetName) => {
    const list = ROLE_PRESETS[presetName] || [];
    const expandedList = [];
    list.forEach(label => {
      const mod = ALL_SYSTEM_MODULES.find(m => m.label.toLowerCase() === label.toLowerCase());
      if (mod) {
        expandedList.push(mod.label, mod.path);
      } else {
        expandedList.push(label);
      }
    });
    setUserPermissions(Array.from(new Set(expandedList)));
    showToast(`Applied preset: ${presetName}`, "info");
  };

  const selectAllCategoryModules = () => {
    const expanded = [];
    filteredModules.forEach(m => {
      expanded.push(m.label, m.path);
    });
    setUserPermissions(prev => Array.from(new Set([...prev, ...expanded])));
  };

  const deselectAllCategoryModules = () => {
    const targetPaths = new Set(filteredModules.map(m => m.path.toLowerCase().trim()));
    const targetLabels = new Set(filteredModules.map(m => m.label.toLowerCase().trim()));

    setUserPermissions(prev => prev.filter(p => {
      const pLower = String(p).toLowerCase().trim();
      return !targetPaths.has(pLower) && !targetLabels.has(pLower);
    }));
  };

  // Save permissions directly from page
  const handleSaveUserPermissions = async () => {
    if (!selectedUser) return;
    setSavingUser(true);
    try {
      const userId = selectedUser._id || selectedUser.id;

      // Expand and normalize permissions to guarantee both label and path are stored
      const cleanPermissionsToSave = Array.from(new Set(
        userPermissions.flatMap(p => {
          const pLower = String(p).toLowerCase().trim();
          const matchedMod = ALL_SYSTEM_MODULES.find(m => {
            const mLabelLower = m.label.toLowerCase().trim();
            const mPathLower = m.path.toLowerCase().trim();
            const aliases = (SIDEBAR_ALIASES[mPathLower] || []).map(a => a.toLowerCase().trim());
            return pLower === mLabelLower || pLower === mPathLower || aliases.includes(pLower);
          });
          if (matchedMod) {
            return [matchedMod.label, matchedMod.path];
          }
          return [p];
        })
      ));

      const res = await fetch(getApiEndpoint(`/users/${userId}/permissions`), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permissions: cleanPermissionsToSave,
          isSuperAdmin: isSuperAdmin
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Permissions updated successfully for ${selectedUser.name}!`, "success");
        // Update local user state
        setUsers(prev => prev.map(u => (u._id || u.id) === userId ? { ...u, permissions: cleanPermissionsToSave, isSuperAdmin } : u));
        setSelectedUser(prev => prev ? { ...prev, permissions: cleanPermissionsToSave, isSuperAdmin } : null);

        // If updating the currently logged-in user, update localStorage & notify sidebar immediately
        const loggedInUserStr = localStorage.getItem('user');
        if (loggedInUserStr) {
          try {
            const loggedIn = JSON.parse(loggedInUserStr);
            const loggedInId = String(loggedIn.id || loggedIn._id || '');
            const targetId = String(userId);
            if (loggedInId && targetId && loggedInId === targetId) {
              const updatedLoggedIn = {
                ...loggedIn,
                permissions: cleanPermissionsToSave,
                isSuperAdmin: isSuperAdmin,
                role: isSuperAdmin ? 'superadmin' : loggedIn.role
              };
              localStorage.setItem('user', JSON.stringify(updatedLoggedIn));
              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new CustomEvent('permissionsUpdated', { detail: updatedLoggedIn }));
            }
          } catch (e) {}
        }
      } else {
        showToast(data.message || "Failed to update permissions.", "error");
      }
    } catch (err) {
      console.error("Error saving permissions:", err);
      showToast("Error saving permissions.", "error");
    } finally {
      setSavingUser(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q || 
        (u.name || '').toLowerCase().includes(q) || 
        (u.email || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterType === 'configured') return Array.isArray(u.permissions) && u.permissions.length > 0;
      if (filterType === 'unconfigured') return !u.permissions || u.permissions.length === 0;
      if (filterType === 'superadmin') return Boolean(u.isSuperAdmin || u.role === 'superadmin');
      return true;
    });
  }, [users, search, filterType]);

  const categories = useMemo(() => {
    const set = new Set(ALL_SYSTEM_MODULES.map(m => m.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredModules = useMemo(() => {
    return ALL_SYSTEM_MODULES.filter(m => {
      const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
      const matchSearch = !moduleSearch || 
        m.label.toLowerCase().includes(moduleSearch.toLowerCase()) || 
        m.desc.toLowerCase().includes(moduleSearch.toLowerCase()) ||
        m.path.toLowerCase().includes(moduleSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, moduleSearch]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Clinical Permissions...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-900/50">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Role Permissions &amp; Sidebar Access Controls
            </h1>
            <p className="text-xs font-medium text-emerald-200/80 mt-1">
              Select an employee on the left to configure their active sidebar modules, clinical privileges, and administrative access.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <div className="px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-slate-200">
            <span className="text-white font-extrabold">{users.length}</span> Total Staff
          </div>
          <div className="px-3.5 py-2 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-500/30 text-emerald-300">
            <span className="text-emerald-200 font-extrabold">{users.filter(u => u.permissions && u.permissions.length > 0).length}</span> Configured
          </div>
          <div className="px-3.5 py-2 bg-teal-500/20 backdrop-blur-md rounded-xl border border-teal-500/30 text-teal-300">
            <span className="text-teal-200 font-extrabold">{ALL_SYSTEM_MODULES.length}</span> Clinical Modules
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'users', label: 'Employee Access Manager', icon: Users },
            { id: 'matrix', label: 'Clinical Role Presets', icon: Sliders },
            { id: 'modules', label: 'All 26 Clinic Modules', icon: Layers }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition cursor-pointer"
          title="Refresh User Data"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* TAB 1: IN-PAGE 2-COLUMN SPLIT VIEW (USER SELECTOR ON LEFT, PERMISSION SELECTOR ON RIGHT) */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (4 Cols): Employee Selection Roster List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users size={14} /> Select Employee ({filteredUsers.length})
                </h3>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff by name, email, role..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'configured', 'unconfigured', 'superadmin'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                      filterType === type
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Employee Scrollable Roster List */}
              <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No users found matching filter.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedUser && (selectedUser._id || selectedUser.id) === (u._id || u.id);
                    const isSA = Boolean(u.isSuperAdmin || u.role === 'superadmin');
                    const permCount = Array.isArray(u.permissions) ? u.permissions.length : 0;

                    return (
                      <div
                        key={u._id || u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.role || 'Staff'} • {u.department || 'General'}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {isSA ? (
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              Admin
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              {permCount > 0 ? `${permCount} Allowed` : 'Default'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (8 Cols): IN-PAGE PERMISSION SELECTION & CONFIGURATION PANEL */}
          <div className="lg:col-span-8 space-y-4">
            {selectedUser ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
                
                {/* Header Banner for Selected User */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                      {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        {selectedUser.name}
                        {isSuperAdmin && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                            Super Admin
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedUser.email} • Role: <strong className="text-slate-700 dark:text-slate-300">{selectedUser.role || 'Staff'}</strong> • Dept: <strong className="text-slate-700 dark:text-slate-300">{selectedUser.department || 'General'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Super Admin Toggle Button */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1 justify-end">
                        <Sparkles size={12} className="text-amber-500" /> Super Admin
                      </p>
                      <p className="text-[9px] text-slate-400">Full unrestricted sidebar access</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSuperAdmin(!isSuperAdmin)}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                        isSuperAdmin 
                          ? 'bg-amber-500 text-slate-950 shadow-xs' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isSuperAdmin ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Quick Preset Buttons Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Clinical Role Presets</label>
                    <span className="text-[11px] text-slate-400">Click any preset to auto-populate matching sidebar modules</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(ROLE_PRESETS).map(pKey => (
                      <button
                        key={pKey}
                        type="button"
                        onClick={() => applyPreset(pKey)}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl transition border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                      >
                        {pKey}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filters & Module Search inside Right Panel */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative flex-1 w-full">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={moduleSearch}
                        onChange={(e) => setModuleSearch(e.target.value)}
                        placeholder="Search system module permissions..."
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={selectAllCategoryModules}
                        disabled={isSuperAdmin}
                        className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 transition cursor-pointer disabled:opacity-50"
                      >
                        Select All Filtered
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllCategoryModules}
                        disabled={isSuperAdmin}
                        className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
                      >
                        Clear Filtered
                      </button>
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                          selectedCategory === cat
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IN-PAGE CHECKBOX MODULE GRID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Category: <strong className="text-slate-900 dark:text-white">{selectedCategory}</strong> ({filteredModules.length} Modules)</span>
                    <span>
                      {isSuperAdmin 
                        ? 'All Granted (Super Admin Enabled)' 
                        : `${ALL_SYSTEM_MODULES.filter(m => isModuleChecked(m)).length} / ${ALL_SYSTEM_MODULES.length} Granted`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800/80 p-3 rounded-2xl bg-slate-50/40 dark:bg-slate-900/40">
                    {filteredModules.map((item) => {
                      const isChecked = isModuleChecked(item);
                      const IconComponent = item.icon || Layers;
                      return (
                        <div 
                          key={item.path}
                          onClick={() => togglePermission(item)}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                            isChecked 
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500/60 shadow-xs' 
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300'
                          }`}
                        >
                          <div className="min-w-0 pr-3 flex items-start gap-2.5">
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                              isChecked 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              <IconComponent size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                                <span className="text-[10px] font-mono text-slate-400">{item.path}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.desc}</p>
                            </div>
                          </div>
                          <div className="shrink-0 pt-1">
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SAVE BUTTON BAR IN-PAGE */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Configuring for: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{selectedUser.name}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveUserPermissions}
                    disabled={savingUser}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {savingUser ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>Save Permissions</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Select an employee from the left column roster to view & configure their permissions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Clinical Role Presets & Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-emerald-500" /> Clinical Role Access Presets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a clinical role template below to preview default accessible modules in the hospital workflow.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {Object.keys(ROLE_PRESETS).map(presetKey => (
                <button
                  key={presetKey}
                  onClick={() => setSelectedRolePreset(presetKey)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedRolePreset === presetKey
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {presetKey}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {ALL_SYSTEM_MODULES.map(m => {
                const isGranted = (ROLE_PRESETS[selectedRolePreset] || []).includes(m.label);
                return (
                  <div 
                    key={m.label} 
                    className={`p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                      isGranted 
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-900 dark:text-emerald-200' 
                        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {isGranted ? (
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{m.label}</p>
                      <p className="text-[10px] opacity-75 truncate">{m.path}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: All 26 Clinic Modules Directory */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SYSTEM_MODULES.map((m, i) => {
              const IconComp = m.icon || Layers;
              return (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {m.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{m.path}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <IconComp size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{m.label}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
