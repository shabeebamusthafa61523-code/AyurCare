import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Sparkles, 
  Clock, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  X, 
  Tag, 
  Filter,
  DollarSign,
  Layers,
  HeartPulse,
  Activity,
  AlertCircle,
  Table,
  LayoutGrid,
  FileText,
  Printer,
  User,
  Phone,
  RefreshCw,
  Eye,
  Receipt,
  Calendar,
  CreditCard
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const CATEGORIES = [
  'All',
  'Consultation',
  'Panchakarma Therapy',
  'Kriya / External Treatment',
  'Wellness & Rejuvenation',
  'Diagnostics & Lab'
];

const DURATION_PRESETS = [
  '15 mins',
  '30 mins',
  '45 mins',
  '60 mins',
  '75 mins',
  '90 mins',
  '120 mins'
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Primary Tab State ('catalog' | 'invoices')
  const [mainTab, setMainTab] = useState('catalog');

  // Service Invoices State
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('All'); // Show only invoice for selected services
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null); // View invoice modal

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Panchakarma Therapy',
    price: '',
    duration: '45 mins',
    description: '',
    status: 'Active'
  });
  const [submitting, setSubmitting] = useState(false);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    variant: 'danger',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchServices();
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (mainTab === 'invoices') {
      fetchInvoices();
    }
  }, [mainTab]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getServices();
      if (res.success && res.services) {
        setServices(res.services);
      }
    } catch (err) {
      console.error('Failed to load clinic services:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const res = await polyclinicService.getInvoices();
      if (res.success && res.invoices) {
        setInvoices(res.invoices);
      }
    } catch (err) {
      console.error('Failed to load clinic invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Panchakarma Therapy',
      price: '',
      duration: '45 mins',
      description: '',
      status: 'Active'
    });
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      category: service.category || 'Panchakarma Therapy',
      price: service.price !== undefined ? service.price : '',
      duration: service.duration || '45 mins',
      description: service.description || '',
      status: service.status || 'Active'
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.price === '' || !formData.duration) {
      alert('Please fill all required fields (Name, Category, Price, and Duration).');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        duration: formData.duration.trim(),
        description: formData.description.trim(),
        status: formData.status
      };

      if (editingService) {
        const res = await polyclinicService.updateService(editingService._id, payload);
        if (res.success) {
          setShowModal(false);
          fetchServices();
        }
      } else {
        const res = await polyclinicService.createService(payload);
        if (res.success) {
          setShowModal(false);
          fetchServices();
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (service) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Service',
      message: `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await polyclinicService.deleteService(service._id);
          fetchServices();
        } catch (err) {
          alert(err.response?.data?.message || err.message || 'Delete failed');
        }
      }
    });
  };

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = 
        (service.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = 
        selectedCategory === 'All' || service.category === selectedCategory;
      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Active' ? (service.status === 'Active' || !service.status) : service.status === 'Inactive');
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, searchQuery, selectedCategory, statusFilter]);

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter(s => s.status === 'Active' || !s.status).length;
    const inactive = services.filter(s => s.status === 'Inactive').length;
    const consultations = services.filter(s => s.category === 'Consultation').length;
    const panchakarma = services.filter(s => s.category === 'Panchakarma Therapy').length;
    const wellness = services.filter(s => !['Consultation', 'Panchakarma Therapy'].includes(s.category)).length;
    return { total, active, inactive, consultations, panchakarma, wellness };
  }, [services]);

  const isPharmacyOrLabItem = (item) => {
    if (!item) return false;
    const cat = (item.category || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    // Check Pharmacy / Medicine / Aushadhi
    if (
      cat.includes('pharmacy') ||
      cat.includes('aushadhi') ||
      cat.includes('medicine') ||
      cat.includes('drug') ||
      desc.startsWith('aushadhi:') ||
      desc.startsWith('medicine:') ||
      desc.includes('(medicine)')
    ) {
      return true;
    }

    // Check Laboratory / Pathology / Diagnostics
    if (
      cat.includes('laboratory') ||
      cat.includes('lab') ||
      cat.includes('diagnostic') ||
      cat.includes('pathology') ||
      desc.startsWith('lab test:') ||
      desc.startsWith('diagnostic:') ||
      desc.includes('[pathology]')
    ) {
      return true;
    }

    return false;
  };

  // Only show clinical service invoices (Consultations, Panchakarma, Kriyas, Packages)
  // Completely excludes pharmacy and laboratory bills
  const onlyServiceInvoices = useMemo(() => {
    return invoices
      .filter(inv => {
        const items = inv.items || [];
        // Must contain at least one clinical service/treatment item (not pharmacy or lab)
        return items.some(item => !isPharmacyOrLabItem(item));
      })
      .map(inv => {
        // Strip out any pharmacy or lab line items from the service invoice
        const serviceItems = (inv.items || []).filter(item => !isPharmacyOrLabItem(item));
        const isPureServiceInvoice = serviceItems.length === (inv.items || []).length;

        const serviceTotal = serviceItems.reduce(
          (sum, it) => sum + (Number(it.amount) || ((Number(it.qty) || 1) * (Number(it.unitPrice) || 0))),
          0
        );

        const netAmount = isPureServiceInvoice 
          ? Number(inv.netAmount || inv.totalAmount || serviceTotal) 
          : serviceTotal;
        const paidAmount = isPureServiceInvoice 
          ? Number(inv.paidAmount || 0) 
          : Math.min(Number(inv.paidAmount || 0), netAmount);
        const pendingAmount = Math.max(0, netAmount - paidAmount);
        const status = pendingAmount <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partially Paid' : (inv.status || 'Pending'));

        return {
          ...inv,
          items: serviceItems,
          totalAmount: serviceTotal,
          netAmount,
          paidAmount,
          pendingAmount,
          status
        };
      });
  }, [invoices]);

  const serviceFilteredInvoicesList = useMemo(() => {
    if (selectedServiceFilter === 'All') return onlyServiceInvoices;
    const target = selectedServiceFilter.toLowerCase().trim();
    return onlyServiceInvoices.filter(inv => 
      (inv.items || []).some(item => 
        (item.description || '').toLowerCase().includes(target) ||
        (item.category || '').toLowerCase().includes(target)
      )
    );
  }, [onlyServiceInvoices, selectedServiceFilter]);

  const invoiceStats = useMemo(() => {
    const list = serviceFilteredInvoicesList;
    const total = list.length;
    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;

    list.forEach(inv => {
      const net = Number(inv.netAmount || inv.totalAmount || 0);
      const paid = Number(inv.paidAmount || 0);
      const pending = Number(inv.pendingAmount !== undefined ? inv.pendingAmount : Math.max(0, net - paid));
      totalBilled += net;
      totalPaid += paid;
      totalPending += pending;
    });

    const paidCount = list.filter(inv => inv.status === 'Paid').length;
    const partialCount = list.filter(inv => inv.status === 'Partially Paid').length;
    const pendingCount = list.filter(inv => inv.status === 'Pending' || inv.status === 'Unpaid').length;

    return {
      total,
      totalBilled,
      totalPaid,
      totalPending,
      paidCount,
      partialCount,
      pendingCount
    };
  }, [serviceFilteredInvoicesList]);

  const filteredInvoices = useMemo(() => {
    return serviceFilteredInvoicesList.filter(inv => {
      // Status Filter
      if (invoiceStatusFilter !== 'All') {
        if (invoiceStatusFilter === 'Pending') {
          if (inv.status !== 'Pending' && inv.status !== 'Unpaid') return false;
        } else if (inv.status !== invoiceStatusFilter) {
          return false;
        }
      }

      // Search Query
      if (invoiceSearch.trim()) {
        const q = invoiceSearch.toLowerCase();
        const invNo = (inv.invoiceNo || '').toLowerCase();
        const patName = (inv.patientName || inv.patient?.name || '').toLowerCase();
        const patPhone = (inv.patient?.phone || '').toLowerCase();
        const patId = (inv.patient?.patientId || '').toLowerCase();
        const itemMatch = (inv.items || []).some(item => 
          (item.description || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q)
        );

        return invNo.includes(q) || patName.includes(q) || patPhone.includes(q) || patId.includes(q) || itemMatch;
      }

      return true;
    });
  }, [serviceFilteredInvoicesList, invoiceStatusFilter, invoiceSearch]);

  const getItemCategoryColor = (cat) => {
    switch (cat) {
      case 'Consultation':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Panchakarma / Therapy':
      case 'Panchakarma Therapy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Therapy Package':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'Aushadhi / Pharmacy':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Laboratory':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Consultation':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Panchakarma Therapy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Wellness & Rejuvenation':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Kriya / External Treatment':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Diagnostics & Lab':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            {mainTab === 'catalog' ? (
              <>
                <Sparkles className="w-6 h-6 text-emerald-500" />
                Clinic Services &amp; Treatments
              </>
            ) : (
              <>
                <Receipt className="w-6 h-6 text-emerald-500" />
                Service Invoices &amp; Patient Billing
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {mainTab === 'catalog'
              ? 'Configure consultation fees, Panchakarma therapy durations, and pricing across appointment & token counters.'
              : 'Review clinical treatment & service invoices (Panchakarma, Consultations, Therapies). Pure pharmacy and laboratory bills are excluded.'
            }
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {mainTab === 'catalog' ? (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl transition shadow-lg shadow-emerald-600/25 text-xs sm:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Service
            </button>
          ) : (
            <button
              onClick={fetchInvoices}
              disabled={loadingInvoices}
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold px-4 py-2.5 rounded-2xl transition text-xs sm:text-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingInvoices ? 'animate-spin' : ''}`} />
              Refresh Invoices
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Navigation Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setMainTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            mainTab === 'catalog'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Services Catalog</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            mainTab === 'catalog' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
          }`}>
            {services.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            mainTab === 'invoices'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-slate-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Service Invoices</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            mainTab === 'invoices' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
          }`}>
            {onlyServiceInvoices.length}
          </span>
        </button>
      </div>

      {/* Services Catalog Tab Content */}
      {mainTab === 'catalog' ? (
        <>
          {/* KPI Stats including Active and Inactive Services counts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Services */}
        <div 
          onClick={() => { setStatusFilter('All'); setSelectedCategory('All'); }}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
            statusFilter === 'All' && selectedCategory === 'All'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20' 
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Click to view all registered services"
        >
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Services</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Active Services */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'All' : 'Active')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
            statusFilter === 'Active' 
              ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Click to filter Active services"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Active</p>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Inactive Services */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Inactive' ? 'All' : 'Inactive')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
            statusFilter === 'Inactive' 
              ? 'border-rose-500 ring-2 ring-rose-500/20' 
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Click to filter Inactive services"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Inactive</p>
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.inactive}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertCircle className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Consultations */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'Consultation' ? 'All' : 'Consultation')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
            selectedCategory === 'Consultation' 
              ? 'border-blue-500 ring-2 ring-blue-500/20' 
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Click to filter Consultations"
        >
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Consultations</p>
            <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.consultations}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Activity className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Panchakarma Therapies */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'Panchakarma Therapy' ? 'All' : 'Panchakarma Therapy')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
            selectedCategory === 'Panchakarma Therapy' 
              ? 'border-teal-500 ring-2 ring-teal-500/20' 
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Click to filter Panchakarma therapies"
        >
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Panchakarma</p>
            <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{stats.panchakarma}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <HeartPulse className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Wellness & Other */}
        <div 
          onClick={() => setSelectedCategory(selectedCategory === 'Wellness & Rejuvenation' ? 'All' : 'Wellness & Rejuvenation')}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
            selectedCategory === 'Wellness & Rejuvenation' 
              ? 'border-amber-500 ring-2 ring-amber-500/20' 
              : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
          title="Click to filter Wellness & other services"
        >
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Wellness &amp; Kriya</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.wellness}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services by name, category, or treatment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto shrink-0 text-xs">
            {['All', 'Active', 'Inactive'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  statusFilter === st
                    ? st === 'Active'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : st === 'Inactive'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {st === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
                {st === 'Inactive' && <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />}
                {st} {st === 'All' ? `(${stats.total})` : st === 'Active' ? `(${stats.active})` : `(${stats.inactive})`}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-end sm:self-auto shrink-0">
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
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">Category:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services List / Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-semibold">Loading clinic services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Services Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' 
              ? 'No clinic services match your active filters. Try adjusting your search term.' 
              : 'No clinic services have been configured yet. Click the button below to add your first service.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Service
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
              <thead className="uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Treatment / Service Name</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Duration</th>
                  <th className="py-3.5 px-4 font-bold">Standard Fee (₹)</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredServices.map(service => (
                  <tr key={service._id} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {service.name}
                      </div>
                      {service.description && (
                        <div className="text-[11px] text-slate-400 max-w-md line-clamp-1 mt-0.5">
                          {service.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl text-xs font-semibold">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {service.duration || '30 mins'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        ₹{Number(service.price).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        service.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {service.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => {
                            setSelectedServiceFilter(service.name);
                            setMainTab('invoices');
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition cursor-pointer"
                          title={`Show only invoices for ${service.name}`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {/* Hidden Edit & Delete on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60 transition cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(service => (
            <div
              key={service._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(service.category)}`}>
                    {service.category}
                  </span>
                  
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    service.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    {service.status || 'Active'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Duration & Price Badges */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{service.duration || '30 mins'}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium mr-1">Fee:</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{Number(service.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => {
                    setSelectedServiceFilter(service.name);
                    setMainTab('invoices');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition cursor-pointer flex items-center gap-1"
                  title={`Show only invoices for ${service.name}`}
                >
                  <FileText className="w-3.5 h-3.5" /> Invoices
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer"
                    title="Edit Service"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      ) : (
        /* Service Invoices Tab Content */
        <div className="space-y-6">
          {/* Invoice KPI Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Invoices */}
            <div
              onClick={() => { setInvoiceStatusFilter('All'); setInvoiceSearch(''); }}
              className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
                invoiceStatusFilter === 'All' && !invoiceSearch
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              title="Click to view all service invoices"
            >
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Invoices</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{invoiceStats.total}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{invoiceStats.paidCount} fully cleared</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            {/* Total Billed Revenue */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Billed</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{invoiceStats.totalBilled.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Gross service billings</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Total Collected */}
            <div
              onClick={() => setInvoiceStatusFilter('Paid')}
              className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
                invoiceStatusFilter === 'Paid'
                  ? 'border-teal-500 ring-2 ring-teal-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              title="Click to filter Paid invoices"
            >
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Amount Collected</p>
                <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
                  ₹{invoiceStats.totalPaid.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">{invoiceStats.paidCount} cleared receipts</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Pending Balance */}
            <div
              onClick={() => setInvoiceStatusFilter('Pending')}
              className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition shadow-sm flex items-center justify-between cursor-pointer ${
                invoiceStatusFilter === 'Pending'
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
              title="Click to filter Pending invoices"
            >
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Receivables</p>
                <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  ₹{invoiceStats.totalPending.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-rose-500 font-semibold mt-0.5">{invoiceStats.pendingCount + invoiceStats.partialCount} outstanding</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search, Service Filter & Status Filters */}
          <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by patient name, phone, invoice #, or treatment service..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Service Filter Dropdown (Show only invoice for selected services) */}
              <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-500" /> Service:
                </label>
                <select
                  value={selectedServiceFilter}
                  onChange={(e) => setSelectedServiceFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="All">All Services &amp; Treatments</option>
                  {services.map(s => (
                    <option key={s._id} value={s.name}>
                      {s.name} — ₹{s.price} ({s.duration}) [{s.category}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start lg:self-auto shrink-0 text-xs">
                {['All', 'Paid', 'Partially Paid', 'Pending'].map(st => (
                  <button
                    key={st}
                    onClick={() => setInvoiceStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      invoiceStatusFilter === st
                        ? st === 'Paid'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : st === 'Partially Paid'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : st === 'Pending'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {st === 'Paid' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
                    {st === 'Partially Paid' && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
                    {st === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />}
                    {st} {st === 'All' ? `(${invoiceStats.total})` : st === 'Paid' ? `(${invoiceStats.paidCount})` : st === 'Partially Paid' ? `(${invoiceStats.partialCount})` : `(${invoiceStats.pendingCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Service Filter Banner if a specific service is selected */}
            {selectedServiceFilter !== 'All' && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Showing invoices containing selected service: <strong className="font-bold underline">{selectedServiceFilter}</strong> ({filteredInvoices.length} invoices found)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedServiceFilter('All')}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-600 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  Clear Service Filter
                </button>
              </div>
            )}
          </div>

          {/* Invoices Table View */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Invoice # &amp; Date</th>
                    <th className="py-3 px-4">Patient Details</th>
                    <th className="py-3 px-4 min-w-[280px]">Services &amp; Treatments Taken</th>
                    <th className="py-3 px-4">Net Amount</th>
                    <th className="py-3 px-4">Paid / Balance</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan="8" className="text-center py-14 text-slate-400">
                        <div className="w-7 h-7 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="font-semibold">Loading patient service invoices...</span>
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-14 text-slate-400">
                        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-50" />
                        <p className="font-bold text-slate-600 dark:text-slate-400">No service invoices found.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedServiceFilter !== 'All' 
                            ? `No invoices recorded containing "${selectedServiceFilter}".` 
                            : 'No patient invoices match your current search or filter criteria.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const patientObj = typeof inv.patient === 'object' && inv.patient !== null ? inv.patient : null;
                      const patientName = inv.patientName || patientObj?.name || 'Patient';
                      const patientPhone = patientObj?.phone || inv.patientPhone || '';
                      const patientId = patientObj?.patientId || '';
                      const items = inv.items || [];

                      return (
                        <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                          {/* Invoice # & Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span 
                              onClick={() => setSelectedInvoiceForView(inv)}
                              className="font-bold font-mono text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer block"
                              title="Click to View Invoice"
                            >
                              {inv.invoiceNo}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(inv.date || inv.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Patient Details */}
                          <td className="py-3.5 px-4 min-w-[180px]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {patientName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                  {patientName}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                  {patientPhone && (
                                    <span className="flex items-center gap-0.5">
                                      <Phone className="w-2.5 h-2.5" /> {patientPhone}
                                    </span>
                                  )}
                                  {patientId && (
                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-500">
                                      {patientId}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Services Taken */}
                          <td className="py-3.5 px-4">
                            {items.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">No line items</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 max-w-md">
                                {items.map((item, idx) => {
                                  const isMatched = selectedServiceFilter !== 'All' && (
                                    (item.description || '').toLowerCase().includes(selectedServiceFilter.toLowerCase()) ||
                                    (item.category || '').toLowerCase().includes(selectedServiceFilter.toLowerCase())
                                  );

                                  return (
                                    <div
                                      key={idx}
                                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] transition ${
                                        isMatched
                                          ? 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-500'
                                          : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60'
                                      }`}
                                    >
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${getItemCategoryColor(item.category)}`}>
                                        {item.category || 'Service'}
                                      </span>
                                      <span className={`truncate max-w-[170px] ${isMatched ? 'font-black text-emerald-900 dark:text-emerald-100' : 'font-semibold text-slate-800 dark:text-slate-200'}`} title={item.description}>
                                        {item.description}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        (x{item.qty || 1} • ₹{item.amount || item.unitPrice})
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>

                          {/* Net Amount */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900 dark:text-white text-sm">
                            ₹{(inv.netAmount || inv.totalAmount || 0).toLocaleString('en-IN')}
                          </td>

                          {/* Paid / Balance */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                              Paid: ₹{(inv.paidAmount || 0).toLocaleString('en-IN')}
                            </span>
                            {inv.pendingAmount > 0 ? (
                              <span className="text-rose-500 font-semibold text-[11px] block mt-0.5">
                                Due: ₹{inv.pendingAmount.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Nil Balance</span>
                            )}
                          </td>

                          {/* Payment Mode */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {inv.paymentMode || 'Cash'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900/40'
                                : inv.status === 'Partially Paid'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900/40'
                                : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900/40'
                            }`}>
                              {inv.status === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                              {inv.status}
                            </span>
                          </td>

                          {/* Actions: View Invoice & Print Receipt */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedInvoiceForView(inv)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl transition font-bold text-xs cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
                                title="View Full Invoice Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => setSelectedInvoiceForReceipt(inv)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition font-bold text-xs cursor-pointer"
                                title="Print Thermal / A4 Receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal (Add / Edit) */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-lg w-full shadow-2xl my-auto max-h-[90vh] flex flex-col p-5 sm:p-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  {editingService ? 'Edit Clinic Service' : 'Add New Clinic Service'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Specify treatment name, category, price, and duration for consultation and token counters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden pt-4">
              <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Service / Treatment Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Shirodhara with Ksheerabala Tailam"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Panchakarma Therapy">Panchakarma Therapy</option>
                      <option value="Kriya / External Treatment">Kriya / External Treatment</option>
                      <option value="Wellness & Rejuvenation">Wellness & Rejuvenation</option>
                      <option value="Diagnostics & Lab">Diagnostics & Lab</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Price and Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1"
                        placeholder="1200"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Duration *
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        required
                        placeholder="e.g., 45 mins"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      
                      {/* Duration Quick Presets */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                        {DURATION_PRESETS.map(preset => (
                          <button
                            type="button"
                            key={preset}
                            onClick={() => setFormData({ ...formData, duration: preset })}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition shrink-0 cursor-pointer ${
                              formData.duration === preset
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description &amp; Clinical Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of herbal oils used, indications, Droni bed requirements, or patient prep..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Service Invoice Receipt Modal */}
      {selectedInvoiceForReceipt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-xl w-full shadow-2xl my-auto max-h-[92vh] flex flex-col p-5 sm:p-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-emerald-500" /> Service Invoice &amp; Treatment Receipt
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Official billing slip for clinical therapies and patient services.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedInvoiceForReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body (Printable Area) */}
            <div className="overflow-y-auto pr-1 pt-4 space-y-4 flex-1">
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-4">
                
                {/* Hospital Header */}
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    🌿 AYURVEDIC CLINIC &amp; PANCHAKARMA HOSPITAL
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Holistic Healing • Kayachikitsa • Panchakarma Shodhana • Aushadhi Shala
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    GSTIN / Reg: AYUR-KL-2026-889 • Phone: +91 483 2742111
                  </p>
                </div>

                {/* Invoice Meta Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoice Number</span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {selectedInvoiceForReceipt.invoiceNo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date &amp; Time</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(selectedInvoiceForReceipt.date || selectedInvoiceForReceipt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Billed Patient</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedInvoiceForReceipt.patientName || selectedInvoiceForReceipt.patient?.name || 'Patient'}
                    </span>
                    {(selectedInvoiceForReceipt.patient?.phone || selectedInvoiceForReceipt.patientPhone) && (
                      <p className="text-[10px] text-slate-400">
                        {selectedInvoiceForReceipt.patient?.phone || selectedInvoiceForReceipt.patientPhone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedInvoiceForReceipt.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : selectedInvoiceForReceipt.status === 'Partially Paid'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {selectedInvoiceForReceipt.status}
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-2.5">Service / Treatment</th>
                        <th className="p-2.5 text-center">Qty</th>
                        <th className="p-2.5 text-right">Rate (₹)</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(selectedInvoiceForReceipt.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/50 dark:hover:bg-slate-800/20">
                          <td className="p-2.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {item.description}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.category || 'General Service'}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                            {item.qty || 1}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700 dark:text-slate-300">
                            ₹{item.unitPrice || 0}
                          </td>
                          <td className="p-2.5 text-right font-bold font-mono text-slate-900 dark:text-white">
                            ₹{item.amount || ((item.qty || 1) * (item.unitPrice || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Calculations */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      ₹{selectedInvoiceForReceipt.totalAmount || selectedInvoiceForReceipt.netAmount}
                    </span>
                  </div>
                  {Number(selectedInvoiceForReceipt.discount) > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Discount:</span>
                      <span className="font-semibold font-mono">-₹{selectedInvoiceForReceipt.discount}</span>
                    </div>
                  )}
                  {Number(selectedInvoiceForReceipt.tax) > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>GST / Tax:</span>
                      <span className="font-semibold font-mono">+₹{selectedInvoiceForReceipt.tax}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span>Net Payable:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{(selectedInvoiceForReceipt.netAmount || selectedInvoiceForReceipt.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold">
                    <span>Amount Paid ({selectedInvoiceForReceipt.paymentMode || 'Cash'}):</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{(selectedInvoiceForReceipt.paidAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {Number(selectedInvoiceForReceipt.pendingAmount) > 0 && (
                    <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-black">
                      <span>Balance Due:</span>
                      <span className="font-mono">₹{selectedInvoiceForReceipt.pendingAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Footer Note */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-center text-[10px] text-slate-400 italic">
                  Thank you for visiting. May Lord Dhanwanthari bless you with Swastha &amp; longevity.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-3">
              <span className="text-xs text-slate-400">
                Mode: <strong className="text-slate-700 dark:text-slate-300">{selectedInvoiceForReceipt.paymentMode || 'Cash'}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedInvoiceForReceipt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button 
                  type="button" 
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* View Invoice Details Modal */}
      {selectedInvoiceForView && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-2xl w-full shadow-2xl my-auto max-h-[92vh] flex flex-col p-5 sm:p-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Invoice #{selectedInvoiceForView.invoiceNo}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedInvoiceForView.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900/40'
                        : selectedInvoiceForView.status === 'Partially Paid'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900/40'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900/40'
                    }`}>
                      {selectedInvoiceForView.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Billed on {new Date(selectedInvoiceForView.date || selectedInvoiceForView.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={() => setSelectedInvoiceForView(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto pr-1 pt-4 space-y-4 flex-1">
              {/* Patient & Invoice Quick Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Patient Information Card */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-emerald-500" /> Patient Details
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm shrink-0">
                      {(selectedInvoiceForView.patientName || selectedInvoiceForView.patient?.name || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedInvoiceForView.patientName || selectedInvoiceForView.patient?.name || 'Patient'}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {(selectedInvoiceForView.patient?.phone || selectedInvoiceForView.patientPhone) && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {selectedInvoiceForView.patient?.phone || selectedInvoiceForView.patientPhone}
                          </span>
                        )}
                        {selectedInvoiceForView.patient?.patientId && (
                          <span className="bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold">
                            {selectedInvoiceForView.patient?.patientId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedInvoiceForView.patient?.address && (
                    <p className="text-[11px] text-slate-400 italic">
                      {selectedInvoiceForView.patient.address}
                    </p>
                  )}
                </div>

                {/* Payment Overview Card */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Payment &amp; Settlement
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Payment Mode</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedInvoiceForView.paymentMode || 'Cash'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Net Billed</span>
                      <span className="font-black font-mono text-slate-900 dark:text-white">
                        ₹{(selectedInvoiceForView.netAmount || selectedInvoiceForView.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Amount Paid</span>
                      <span className="font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ₹{(selectedInvoiceForView.paidAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Balance Due</span>
                      <span className={`font-black font-mono ${
                        Number(selectedInvoiceForView.pendingAmount) > 0 ? 'text-rose-500' : 'text-slate-400'
                      }`}>
                        ₹{(selectedInvoiceForView.pendingAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Treatments / Services Table */}
              <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-100/80 dark:bg-slate-800/60 px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Services &amp; Treatments Rendered ({(selectedInvoiceForView.items || []).length})
                  </span>
                  {selectedServiceFilter !== 'All' && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Filtered Service: {selectedServiceFilter}
                    </span>
                  )}
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200/60 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Service / Treatment</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {(selectedInvoiceForView.items || []).map((item, idx) => {
                      const isHighlighted = selectedServiceFilter !== 'All' && (
                        (item.description || '').toLowerCase().includes(selectedServiceFilter.toLowerCase()) ||
                        (item.category || '').toLowerCase().includes(selectedServiceFilter.toLowerCase())
                      );

                      return (
                        <tr 
                          key={idx} 
                          className={`transition ${isHighlighted ? 'bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/20'}`}
                        >
                          <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {item.description}
                            </span>
                            {isHighlighted && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5 mt-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Selected Service Match
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getItemCategoryColor(item.category)}`}>
                              {item.category || 'Service'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                            {item.qty || 1}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            ₹{(item.unitPrice || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                            ₹{(item.amount || ((item.qty || 1) * (item.unitPrice || 0))).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown Summary Box */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Services Total:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                    ₹{(selectedInvoiceForView.totalAmount || selectedInvoiceForView.netAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                {Number(selectedInvoiceForView.discount) > 0 && (
                  <div className="flex justify-between text-rose-500 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{Number(selectedInvoiceForView.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(selectedInvoiceForView.tax) > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Applicable Tax / GST:</span>
                    <span className="font-mono font-bold">+₹{Number(selectedInvoiceForView.tax).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span>Net Payable Amount:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">
                    ₹{(selectedInvoiceForView.netAmount || selectedInvoiceForView.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1">
                  <span className="text-emerald-700 dark:text-emerald-300">Paid Amount ({selectedInvoiceForView.paymentMode || 'Cash'}):</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{(selectedInvoiceForView.paidAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                {Number(selectedInvoiceForView.pendingAmount) > 0 && (
                  <div className="flex justify-between font-black text-xs text-rose-600 dark:text-rose-400">
                    <span>Balance Pending Due:</span>
                    <span className="font-mono">
                      ₹{Number(selectedInvoiceForView.pendingAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-3">
              <button 
                type="button" 
                onClick={() => setSelectedInvoiceForView(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    const inv = selectedInvoiceForView;
                    setSelectedInvoiceForView(null);
                    setSelectedInvoiceForReceipt(inv);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Receipt View
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
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
