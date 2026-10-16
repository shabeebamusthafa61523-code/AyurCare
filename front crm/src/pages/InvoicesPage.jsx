import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Receipt, 
  Search, 
  Plus, 
  Eye, 
  Printer, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  CreditCard, 
  Stethoscope, 
  Sparkles, 
  Pill, 
  Activity, 
  X, 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  Tag, 
  Trash2,
  Edit2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const TABS = [
  { id: 'all', label: 'All Invoices', icon: Layers, desc: 'Consolidated clinic billing overview' },
  { id: 'consultation', label: 'Consultation', icon: Stethoscope, desc: 'Doctor & Vaidya consultations' },
  { id: 'therapy', label: 'Therapy', icon: Sparkles, desc: 'Panchakarma, Kriyas & treatment sessions' },
  { id: 'inventory', label: 'Inventory / Pharmacy', icon: Pill, desc: 'Aushadhi, medicines & dispensary sales' },
  { id: 'laboratory', label: 'Laboratory', icon: Activity, desc: 'Diagnostic tests & pathology services' }
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Paid' | 'Partially Paid' | 'Pending'

  // Modals
  const [viewInvoice, setViewInvoice] = useState(null);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fetchingActivity, setFetchingActivity] = useState(false);
  const [autoFetchNotice, setAutoFetchNotice] = useState('');

  // Create / Consolidate Invoice State
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [existingInvoiceForDate, setExistingInvoiceForDate] = useState(null);
  const [newItems, setNewItems] = useState([
    { description: 'Doctor Consultation Fee', category: 'Consultation', qty: 1, unitPrice: 500, amount: 500 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(500);
  const [paymentMode, setPaymentMode] = useState('UPI');

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {}
  });

  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, patRes, servRes] = await Promise.all([
        polyclinicService.getInvoices(),
        polyclinicService.getPatients(),
        polyclinicService.getServices()
      ]);
      if (invRes.success) setInvoices(invRes.invoices || []);
      if (patRes.success) setPatients(patRes.patients || []);
      if (servRes.success) setServices(servRes.services || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to test if an invoice item belongs to a specific category
  const itemMatchesCategory = (item, categoryType) => {
    if (!item) return false;
    const cat = (item.category || '').toLowerCase().trim();
    const desc = (item.description || '').toLowerCase().trim();

    if (categoryType === 'consultation') {
      if (cat.includes('consultation') || cat.includes('op') || cat.includes('doctor')) return true;
      if (cat.includes('therapy') || cat.includes('panchakarma') || cat.includes('pharmacy') || cat.includes('aushadh') || cat.includes('medicine') || cat.includes('lab')) return false;
      return desc.includes('consultation') || desc.includes('vaidya') || desc.includes('doctor') || desc.includes('opd') || desc.includes('review fee');
    }

    if (categoryType === 'therapy') {
      if (cat.includes('therapy') || cat.includes('panchakarma') || cat.includes('kriya') || cat.includes('package')) return true;
      if (cat.includes('consultation') || cat.includes('pharmacy') || cat.includes('aushadh') || cat.includes('medicine') || cat.includes('lab')) return false;
      return desc.includes('panchakarma') || desc.includes('therapy') || desc.includes('basti') || desc.includes('vasti') || desc.includes('shirodhara') || desc.includes('abhyanga') || desc.includes('kizhi') || desc.includes('swedana') || desc.includes('snehana') || desc.includes('nasya') || desc.includes('virechana') || desc.includes('vamana') || desc.includes('kriya') || desc.includes('massage') || desc.includes('treatment');
    }

    if (categoryType === 'inventory') {
      if (cat.includes('pharmacy') || cat.includes('aushadh') || cat.includes('medicine') || cat.includes('inventory') || cat.includes('dispensary') || cat.includes('consumable') || cat.includes('supply')) return true;
      if (cat.includes('consultation') || cat.includes('therapy') || cat.includes('panchakarma') || cat.includes('lab')) return false;
      return desc.includes('aushadhi') || desc.includes('kashayam') || desc.includes('kashaya') || desc.includes('gulika') || desc.includes('tailam') || desc.includes('thailam') || desc.includes('taila') || desc.includes('arishtam') || desc.includes('asavam') || desc.includes('asava') || desc.includes('churnam') || desc.includes('churna') || desc.includes('lehyam') || desc.includes('ghritam') || desc.includes('rasayana') || desc.includes('bhasma') || desc.includes('vati') || desc.includes('tablets') || desc.includes('tablet') || desc.includes('capsules') || desc.includes('capsule') || desc.includes('syrup') || desc.includes('ointment') || desc.includes('drops');
    }

    if (categoryType === 'laboratory') {
      if (cat.includes('lab') || cat.includes('diagnostic') || cat.includes('pathology')) return true;
      if (cat.includes('consultation') || cat.includes('therapy') || cat.includes('panchakarma') || cat.includes('pharmacy') || cat.includes('aushadh') || cat.includes('medicine')) return false;
      return desc.includes('lab test') || desc.includes('blood test') || desc.includes('urine test') || desc.includes('cbc') || desc.includes('lipid profile') || desc.includes('pathology') || desc.includes('diagnostic');
    }

    return true;
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: invoices.length, consultation: 0, therapy: 0, inventory: 0, laboratory: 0 };
    invoices.forEach(inv => {
      const items = inv.items || [];
      if (items.some(i => itemMatchesCategory(i, 'consultation'))) counts.consultation++;
      if (items.some(i => itemMatchesCategory(i, 'therapy'))) counts.therapy++;
      if (items.some(i => itemMatchesCategory(i, 'inventory'))) counts.inventory++;
      if (items.some(i => itemMatchesCategory(i, 'laboratory'))) counts.laboratory++;
    });
    return counts;
  }, [invoices]);

  // Project invoices into dedicated category bills when a specific tab is active
  const displayInvoices = useMemo(() => {
    const projected = invoices.map(inv => {
      if (activeTab === 'all') {
        return {
          ...inv,
          originalInvoice: inv,
          isCategoryBill: false,
          categoryTab: 'all',
          billTitle: 'Single Patient Daily Invoice',
          billType: 'Consolidated Daily Bill',
          billSubtitle: 'Combined Outpatient, Therapy & Pharmacy Billing',
          billCategory: 'All Categories',
          items: inv.items || []
        };
      }

      // Check if this invoice has items belonging to activeTab
      const tabItems = (inv.items || []).filter(i => itemMatchesCategory(i, activeTab));
      if (tabItems.length === 0) return null;

      const tabTotal = tabItems.reduce((acc, it) => acc + (Number(it.amount) || ((Number(it.qty) || 1) * (Number(it.unitPrice) || 0))), 0);
      const invoiceTotal = Number(inv.totalAmount) || tabTotal;
      const ratio = invoiceTotal > 0 ? (tabTotal / invoiceTotal) : 1;
      const tabDiscount = Math.round((Number(inv.discount) || 0) * ratio);
      const tabNet = Math.max(0, tabTotal - tabDiscount);

      let tabPaid = 0;
      let tabPending = tabNet;
      let tabStatus = 'Pending';

      if (inv.status === 'Paid') {
        tabPaid = tabNet;
        tabPending = 0;
        tabStatus = 'Paid';
      } else if (inv.status === 'Pending') {
        tabPaid = 0;
        tabPending = tabNet;
        tabStatus = 'Pending';
      } else {
        const paidRatio = Number(inv.netAmount) > 0 ? (Number(inv.paidAmount) / Number(inv.netAmount)) : 0;
        tabPaid = Math.round(tabNet * paidRatio);
        tabPending = Math.max(0, tabNet - tabPaid);
        tabStatus = tabPending <= 0 ? 'Paid' : (tabPaid > 0 ? 'Partially Paid' : 'Pending');
      }

      let billTitle = 'Patient Invoice';
      let billType = 'Clinical Bill';
      let billSubtitle = 'Ayurvedic Healthcare Services';
      let billCategory = 'Clinical Service';

      if (activeTab === 'inventory') {
        billTitle = 'Ayurvedic Pharmacy & Dispensary Bill';
        billType = 'Pharmacy Bill';
        billSubtitle = 'Aushadhi, Classical Formulations & Dispensary Medicines';
        billCategory = 'Aushadhi / Pharmacy';
      } else if (activeTab === 'consultation') {
        billTitle = 'Outpatient Consultation Bill';
        billType = 'Consultation Bill';
        billSubtitle = 'Vaidya OP Consultation & Clinical Examination';
        billCategory = 'Consultation';
      } else if (activeTab === 'therapy') {
        billTitle = 'Panchakarma Therapy Suite Bill';
        billType = 'Therapy Bill';
        billSubtitle = 'Panchakarma Detox, Kriyas & Treatment Protocols';
        billCategory = 'Panchakarma / Therapy';
      } else if (activeTab === 'laboratory') {
        billTitle = 'Laboratory Diagnostic Bill';
        billType = 'Laboratory Bill';
        billSubtitle = 'Diagnostic Pathology & Clinical Tests';
        billCategory = 'Laboratory';
      }

      return {
        ...inv,
        originalInvoice: inv,
        isCategoryBill: true,
        categoryTab: activeTab,
        billTitle,
        billType,
        billSubtitle,
        billCategory,
        items: tabItems,
        totalAmount: tabTotal,
        discount: tabDiscount,
        netAmount: tabNet,
        paidAmount: tabPaid,
        pendingAmount: tabPending,
        status: tabStatus
      };
    }).filter(Boolean);

    return projected.filter(inv => {
      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Paid' && inv.status !== 'Paid') return false;
        if (statusFilter === 'Pending' && inv.status !== 'Pending') return false;
        if (statusFilter === 'Partially Paid' && inv.status !== 'Partially Paid') return false;
      }

      // Search query
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const invNo = (inv.invoiceNo || '').toLowerCase();
        const patName = (inv.patientName || '').toLowerCase();
        const mode = (inv.paymentMode || '').toLowerCase();
        const hasItem = (inv.items || []).some(i => (i.description || '').toLowerCase().includes(term));
        return invNo.includes(term) || patName.includes(term) || mode.includes(term) || hasItem;
      }

      return true;
    });
  }, [invoices, activeTab, statusFilter, searchTerm]);

  // Tab-specific metrics strictly from displayInvoices
  const tabMetrics = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;

    displayInvoices.forEach(inv => {
      totalBilled += Number(inv.netAmount || inv.totalAmount || 0);
      totalPaid += Number(inv.paidAmount || 0);
      totalPending += Number(inv.pendingAmount || 0);
    });

    return {
      count: displayInvoices.length,
      totalBilled: Math.round(totalBilled),
      totalPaid: Math.round(totalPaid),
      totalPending: Math.round(totalPending)
    };
  }, [displayInvoices]);

  // Load data or existing single invoice for a given patient and date
  const loadPatientDataForDate = async (patientId, targetDate) => {
    if (!patientId) {
      resetNewItemsForTab(activeTab);
      setExistingInvoiceForDate(null);
      setAutoFetchNotice('');
      return;
    }

    // 1. Check if a single invoice ALREADY exists for this patient on this date
    const foundExisting = invoices.find(inv => {
      const invPatId = (inv.patient?._id || inv.patient || '').toString();
      if (invPatId !== patientId) return false;
      const invDateStr = new Date(inv.date || inv.createdAt).toISOString().split('T')[0];
      return invDateStr === targetDate;
    });

    if (foundExisting) {
      setExistingInvoiceForDate(foundExisting);
      setNewItems(foundExisting.items && foundExisting.items.length > 0 ? foundExisting.items.map(it => ({ ...it })) : []);
      setDiscount(foundExisting.discount || 0);
      setPaidAmount(foundExisting.paidAmount || 0);
      setPaymentMode(foundExisting.paymentMode || 'UPI');
      setAutoFetchNotice(`⚡ Existing single invoice (${foundExisting.invoiceNo}) loaded for ${targetDate}. Saving will consolidate into this date's invoice.`);
      return;
    }

    setExistingInvoiceForDate(null);

    // 2. Otherwise auto-fetch clinical procedures performed on this date for this patient
    try {
      setFetchingActivity(true);
      const res = await polyclinicService.getPatientById(patientId);
      if (res.success && res.history) {
        const { appointments, labTests, prescriptions, panchakarma } = res.history;
        const fetchedItems = [];

        // Consultations & services on this date
        if (appointments && appointments.length > 0) {
          appointments.forEach(appt => {
            const apptDateStr = new Date(appt.date).toISOString().split('T')[0];
            if (apptDateStr === targetDate || (appt.status === 'Completed' && appointments.length === 1)) {
              const desc = appt.serviceName 
                ? `Ayurvedic Service: ${appt.serviceName}${appt.serviceDuration ? ` (${appt.serviceDuration})` : ''} - Vaidya: ${appt.doctorName || 'Doctor'}`
                : `Vaidya Consultation - ${appt.doctorName || 'General Consultation'} (${new Date(appt.date).toLocaleDateString()})`;
              fetchedItems.push({
                description: desc,
                category: appt.serviceCategory || 'Consultation',
                qty: 1,
                unitPrice: appt.consultationFee || 500,
                amount: appt.consultationFee || 500
              });
            }
          });
        }

        // Therapies on this date
        if (panchakarma && panchakarma.length > 0) {
          panchakarma.forEach(pk => {
            const pkDateStr = new Date(pk.startDate || pk.createdAt).toISOString().split('T')[0];
            if (pkDateStr === targetDate) {
              fetchedItems.push({
                description: `Panchakarma Package: ${pk.therapyName} (${pk.totalSessions} Sessions)`,
                category: 'Panchakarma / Therapy',
                qty: 1,
                unitPrice: pk.packageCost || 1500,
                amount: pk.packageCost || 1500
              });
            }
          });
        }

        // Lab Tests on this date
        if (labTests && labTests.length > 0) {
          labTests.forEach(test => {
            const testDateStr = new Date(test.date || test.createdAt).toISOString().split('T')[0];
            if (testDateStr === targetDate) {
              fetchedItems.push({
                description: `Lab Test: ${test.testName} [${test.category || 'Pathology'}]`,
                category: 'Laboratory',
                qty: 1,
                unitPrice: test.cost || 500,
                amount: test.cost || 500
              });
            }
          });
        }

        // Prescriptions / Medicines on this date
        if (prescriptions && prescriptions.length > 0) {
          prescriptions.forEach(rx => {
            const rxDateStr = new Date(rx.date || rx.createdAt).toISOString().split('T')[0];
            if (rxDateStr === targetDate) {
              (rx.medicines || []).forEach(med => {
                fetchedItems.push({
                  description: `Aushadhi: ${med.name} (${med.dosage || '1 dose'})`,
                  category: 'Aushadhi / Pharmacy',
                  qty: 1,
                  unitPrice: 180,
                  amount: 180
                });
              });
            }
          });
        }

        if (fetchedItems.length > 0) {
          const relevantItems = activeTab === 'all' 
            ? fetchedItems 
            : fetchedItems.filter(i => itemMatchesCategory(i, activeTab));

          const finalItems = relevantItems.length > 0 ? relevantItems : fetchedItems;
          setNewItems(finalItems);
          const totalCalc = finalItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
          setPaidAmount(totalCalc);
          setAutoFetchNotice(`⚡ Auto-fetched ${finalItems.length} billable procedure(s) for ${targetDate}!`);
        } else {
          resetNewItemsForTab(activeTab);
          setAutoFetchNotice(`✨ New single invoice for ${targetDate}. Standard item loaded.`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingActivity(false);
    }
  };

  const handlePatientSelectInModal = (patientId) => {
    setSelectedPatient(patientId);
    loadPatientDataForDate(patientId, selectedDate);
  };

  const handleDateSelectInModal = (dateVal) => {
    setSelectedDate(dateVal);
    if (selectedPatient) {
      loadPatientDataForDate(selectedPatient, dateVal);
    }
  };

  const resetNewItemsForTab = (tab) => {
    if (tab === 'therapy') {
      setNewItems([{ description: 'Shirodhara Therapy Session (45 mins)', category: 'Panchakarma / Therapy', qty: 1, unitPrice: 1500, amount: 1500 }]);
      setPaidAmount(1500);
    } else if (tab === 'inventory') {
      setNewItems([{ description: 'Maharasnadi Kashayam (200ml)', category: 'Aushadhi / Pharmacy', qty: 1, unitPrice: 220, amount: 220 }]);
      setPaidAmount(220);
    } else if (tab === 'laboratory') {
      setNewItems([{ description: 'Complete Blood Count (CBC)', category: 'Laboratory', qty: 1, unitPrice: 400, amount: 400 }]);
      setPaidAmount(400);
    } else {
      setNewItems([{ description: 'General Doctor Consultation Fee', category: 'Consultation', qty: 1, unitPrice: 500, amount: 500 }]);
      setPaidAmount(500);
    }
  };

  const openCreateModal = (prefillPatientId = '', prefillDate = '') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDate = prefillDate || todayStr;
    setSelectedDate(targetDate);
    setSelectedPatient(prefillPatientId);
    setAutoFetchNotice('');
    setDiscount(0);
    setPaymentMode('UPI');
    setShowCreateModal(true);

    if (prefillPatientId) {
      loadPatientDataForDate(prefillPatientId, targetDate);
    } else {
      resetNewItemsForTab(activeTab);
      setExistingInvoiceForDate(null);
    }
  };

  const addItemRow = () => {
    let defaultCat = 'Consultation';
    if (activeTab === 'therapy') defaultCat = 'Panchakarma / Therapy';
    if (activeTab === 'inventory') defaultCat = 'Aushadhi / Pharmacy';
    if (activeTab === 'laboratory') defaultCat = 'Laboratory';

    setNewItems([...newItems, { description: '', category: defaultCat, qty: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItemRow = (idx) => {
    setNewItems(newItems.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx, field, val) => {
    const updated = [...newItems];
    updated[idx][field] = val;
    if (field === 'qty' || field === 'unitPrice') {
      const q = Number(field === 'qty' ? val : updated[idx].qty) || 1;
      const u = Number(field === 'unitPrice' ? val : updated[idx].unitPrice) || 0;
      updated[idx].amount = q * u;
    }
    setNewItems(updated);
  };

  const calculatedTotal = newItems.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const calculatedNet = Math.max(0, calculatedTotal - (Number(discount) || 0));

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please select a patient before issuing an invoice.');
      return;
    }

    const patObj = patients.find(p => p._id === selectedPatient);

    try {
      const res = await polyclinicService.createInvoice({
        patient: selectedPatient,
        patientName: patObj?.name || 'Patient',
        date: selectedDate,
        items: newItems,
        discount: Number(discount) || 0,
        paidAmount: Number(paidAmount) || 0,
        paymentMode
      });

      if (res.success) {
        setShowCreateModal(false);
        fetchData();
        setConfirmModal({
          isOpen: true,
          title: existingInvoiceForDate ? 'Daily Invoice Consolidated & Updated' : 'Single Daily Invoice Generated',
          message: `Single invoice (${res.invoice?.invoiceNo}) for ${patObj?.name} on ${selectedDate} saved successfully (Net: ₹${calculatedNet}).`,
          confirmText: 'Done',
          variant: 'success',
          onConfirm: () => {}
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handlePrint = (inv) => {
    setPrintInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDeleteInvoice = (inv) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Invoice',
      message: `Are you sure you want to delete invoice "${inv.invoiceNo}" for ${inv.patientName}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const targetId = inv.originalInvoice?._id || inv._id;
          await polyclinicService.deleteInvoice(targetId);
          fetchData();
        } catch (err) {
          alert(err.response?.data?.message || err.message || 'Failed to delete invoice');
        }
      }
    });
  };

  // Category badge styling helper
  const renderCategoryBadge = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('consultation')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Stethoscope className="w-2.5 h-2.5" /> Consultation
        </span>
      );
    }
    if (c.includes('therapy') || c.includes('panchakarma')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-2.5 h-2.5" /> Therapy
        </span>
      );
    }
    if (c.includes('pharmacy') || c.includes('aushadhi') || c.includes('medicine')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Pill className="w-2.5 h-2.5" /> Pharmacy
        </span>
      );
    }
    if (c.includes('lab') || c.includes('diagnostic')) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Activity className="w-2.5 h-2.5" /> Laboratory
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <Receipt className="w-2.5 h-2.5" /> Clinical Service
      </span>
    );
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Receipt className="w-3.5 h-3.5" /> Billing & Revenue Hub
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Patient Invoices
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            Categorized billing records with dedicated tabs for Consultation, Therapy, Pharmacy Inventory, and Diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchData}
            className="p-2.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded-2xl border border-emerald-700/60 transition"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg transition text-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                isActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Specific Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {activeTab === 'all' ? 'Total Invoices' : `${TABS.find(t => t.id === activeTab)?.label} Bills`}
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {tabMetrics.count}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Billed Revenue
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{tabMetrics.totalBilled.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Collected (Paid)
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{tabMetrics.totalPaid.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Outstanding (Pending)
          </span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{tabMetrics.totalPending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, patient, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          {['All', 'Paid', 'Partially Paid', 'Pending'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Invoices Table View */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {displayInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No Invoices Found</h3>
            <p className="mt-1">
              {activeTab === 'all'
                ? 'No invoices match your current filter.'
                : `No invoices recorded in the ${TABS.find(t => t.id === activeTab)?.label} category yet.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Itemized Services & Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {displayInvoices.map((inv) => (
                  <tr key={`${inv._id}-${inv.categoryTab || 'all'}`} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {inv.invoiceNo}
                        </span>
                        {inv.isCategoryBill && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                            {inv.billType}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(inv.date || inv.createdAt).toLocaleDateString()}
                      </div>
                      {inv.isCategoryBill ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {inv.billType}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Daily Invoice
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{inv.patientName}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {inv.isCategoryBill ? (
                          renderCategoryBadge(inv.billCategory)
                        ) : (
                          Array.from(new Set((inv.items || []).map(i => i.category || 'Consultation'))).map((c, idx) => (
                            <React.Fragment key={idx}>
                              {renderCategoryBadge(c)}
                            </React.Fragment>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-[240px]">
                      <div className="space-y-0.5 max-w-xs">
                        {(inv.items || []).map((it, idx) => (
                          <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                            <span className="font-medium">• {it.description}</span>
                            <span className="text-slate-400 ml-1">({it.qty} × ₹{it.unitPrice})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        {inv.paymentMode || 'Cash'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      ₹{(inv.netAmount || inv.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ₹{(inv.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      ₹{(inv.pendingAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : inv.status === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {inv.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 font-bold text-xs transition"
                          title="View Invoice Details"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => handlePrint(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60 shadow-xs transition"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>

                        {/* Hidden Edit & Delete on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                          <button
                            onClick={() => openCreateModal(
                              inv.patient?._id || inv.patient,
                              new Date(inv.date || inv.createdAt).toISOString().split('T')[0]
                            )}
                            className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60 transition"
                            title="Edit / Modify Invoice"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv)}
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition"
                            title="Delete Invoice"
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
        )}
      </div>

      {/* Interactive Invoice Details Modal */}
      {viewInvoice && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {viewInvoice.invoiceNo}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {viewInvoice.billTitle || 'Single Patient Daily Invoice'}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-400">Date: {new Date(viewInvoice.date || viewInvoice.createdAt).toLocaleDateString()}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    viewInvoice.isCategoryBill
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {viewInvoice.billType || 'Consolidated Daily Bill'}
                  </span>
                </div>
                {viewInvoice.billSubtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {viewInvoice.billSubtitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setViewInvoice(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewInvoice.isCategoryBill && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Showing isolated <strong>{viewInvoice.billType}</strong> for this patient.
                </span>
                <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                  Daily Ref: #{viewInvoice.invoiceNo}
                </span>
              </div>
            )}

            {/* Patient & Summary Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block font-medium">Billed To (Patient):</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{viewInvoice.patientName}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-medium">Payment Mode & Status:</span>
                <div className="mt-0.5 flex items-center justify-end gap-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{viewInvoice.paymentMode || 'Cash'}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    viewInvoice.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {viewInvoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {viewInvoice.isCategoryBill ? `${viewInvoice.billType} Items` : 'Itemized Breakdown'}
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(viewInvoice.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{it.description}</td>
                        <td className="py-2 px-3">{renderCategoryBadge(it.category)}</td>
                        <td className="py-2 px-3 text-center">{it.qty}</td>
                        <td className="py-2 px-3 text-right">₹{it.unitPrice}</td>
                        <td className="py-2 px-3 text-right font-bold">₹{it.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>₹{(viewInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
              {Number(viewInvoice.discount) > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>- ₹{viewInvoice.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <span>Net Amount:</span>
                <span>₹{(viewInvoice.netAmount || viewInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Paid Amount:</span>
                <span>₹{(viewInvoice.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Balance Due:</span>
                <span>₹{(viewInvoice.pendingAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewInvoice(null);
                  handlePrint(viewInvoice);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" /> Create Patient Invoice
                </h3>
                <p className="text-xs text-slate-400">Generate a billing invoice with itemized clinical services</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              {/* Patient & Date Selector (Single Invoice per Date) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Patient *
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => handlePatientSelectInModal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.phone}) {p.patientId ? `- ${p.patientId}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Date (Single Invoice per Day) *
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelectInModal(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Single Invoice Banner / Auto-fetch Indicator */}
              {existingInvoiceForDate ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
                  <Receipt className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <span className="font-bold">Existing Single Daily Invoice Found: </span>
                    Invoice <span className="font-mono font-bold bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-200">{existingInvoiceForDate.invoiceNo}</span> already exists for this patient on {selectedDate}. Adding or editing items below will consolidate directly into this day's invoice.
                  </div>
                </div>
              ) : autoFetchNotice ? (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{autoFetchNotice}</span>
                </div>
              ) : null}

              {/* Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Billed Items</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {newItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      {services.length > 0 && (
                        <select
                          onChange={(e) => {
                            const s = services.find(x => x._id === e.target.value);
                            if (s) {
                              updateItemRow(idx, 'description', s.name);
                              let cat = 'Consultation';
                              const sc = (s.category || '').toLowerCase();
                              if (sc.includes('therapy') || sc.includes('panchakarma')) cat = 'Panchakarma / Therapy';
                              else if (sc.includes('pharmacy') || sc.includes('aushadh') || sc.includes('medicine')) cat = 'Aushadhi / Pharmacy';
                              else if (sc.includes('lab') || sc.includes('diagnostic')) cat = 'Laboratory';
                              updateItemRow(idx, 'category', cat);
                              updateItemRow(idx, 'unitPrice', s.price);
                              updateItemRow(idx, 'amount', s.price * (Number(item.qty) || 1));
                            }
                          }}
                          className="w-full bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg px-2 py-1 text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold"
                        >
                          <option value="">-- Quick Select Clinic Service (with Fee) --</option>
                          {services.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.name} — ₹{s.price} ({s.duration}) [{s.category}]
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateItemRow(idx, 'description', e.target.value)}
                          placeholder="Item or treatment description..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                          list={`invoice-item-datalist-${idx}`}
                        />
                        <datalist id={`invoice-item-datalist-${idx}`}>
                          {services.map(s => (
                            <option key={s._id} value={s.name} label={`₹${s.price} (${s.category})`}>
                              {s.name} — ₹{s.price} ({s.category})
                            </option>
                          ))}
                        </datalist>
                        {newItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500">Category</label>
                          <select
                            value={item.category}
                            onChange={(e) => updateItemRow(idx, 'category', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="Consultation">Consultation</option>
                            <option value="Panchakarma / Therapy">Therapy</option>
                            <option value="Aushadhi / Pharmacy">Pharmacy</option>
                            <option value="Laboratory">Laboratory</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItemRow(idx, 'qty', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItemRow(idx, 'unitPrice', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Total (₹)</label>
                          <div className="font-bold text-xs pt-1 text-slate-800 dark:text-slate-200">
                            ₹{item.amount}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <label className="block text-slate-500 mb-0.5">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Paid Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-0.5">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black px-2 text-slate-900 dark:text-white">
                <span>Net Total: ₹{calculatedNet}</span>
                <span className="text-rose-600 text-xs font-semibold">
                  Due: ₹{Math.max(0, calculatedNet - (Number(paidAmount) || 0))}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Printable Invoice Receipt (Visible during window.print()) */}
      {printInvoice && (
        <div className="fixed inset-0 z-50 bg-white text-slate-900 p-8 print:block hidden overflow-y-auto" id="printable-invoice">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h1 className="text-2xl font-black text-emerald-900 uppercase">
                  {printInvoice.billTitle ? printInvoice.billTitle.toUpperCase() : 'AYURVEDIC CLINIC & HOSPITAL'}
                </h1>
                <p className="text-xs text-slate-500">
                  {printInvoice.billSubtitle || 'Holistic Care, Panchakarma Therapy & Clinical Dispensary'}
                </p>
                <p className="text-xs text-slate-500">Phone: +91 98470 12345 | billing@ayurvedichospital.com</p>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-emerald-700">{printInvoice.invoiceNo}</div>
                <div className="text-xs text-slate-500">Date: {new Date(printInvoice.date || printInvoice.createdAt).toLocaleDateString()}</div>
                {printInvoice.billType && (
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase border border-slate-200">
                    {printInvoice.billType}
                  </span>
                )}
              </div>
            </div>

            {/* Patient & Payment Mode */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border">
              <div>
                <span className="font-bold">Billed To (Patient):</span> {printInvoice.patientName}
              </div>
              <div>
                <span className="font-bold">Payment Method:</span> {printInvoice.paymentMode || 'Cash'} | <span className="font-bold">Status:</span> {printInvoice.status}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-bold text-sm text-emerald-950 mb-2 border-b pb-1">
                {printInvoice.isCategoryBill ? `${printInvoice.billType} - Itemized Billing` : 'Treatment & Itemized Billing'}
              </h3>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b text-slate-600">
                    <th className="py-1">#</th>
                    <th className="py-1">Description</th>
                    <th className="py-1">Category</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Unit Price</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(printInvoice.items || []).map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 font-bold">{idx + 1}</td>
                      <td className="py-2 font-bold text-slate-900">{it.description}</td>
                      <td className="py-2">{it.category}</td>
                      <td className="py-2 text-center">{it.qty}</td>
                      <td className="py-2 text-right">₹{it.unitPrice}</td>
                      <td className="py-2 text-right font-bold">₹{it.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="w-64 ml-auto text-xs space-y-1.5 pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{(printInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
              {Number(printInvoice.discount) > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount:</span>
                  <span>- ₹{printInvoice.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-slate-900 border-t pt-1">
                <span>Net Amount:</span>
                <span>₹{(printInvoice.netAmount || printInvoice.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Paid:</span>
                <span>₹{(printInvoice.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-700">
                <span>Due:</span>
                <span>₹{(printInvoice.pendingAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Footer / Signature */}
            <div className="flex justify-between items-end pt-12 border-t">
              <div className="text-[11px] text-slate-400">
                Thank you for choosing Ayurvedic Clinic & Hospital.
              </div>
              <div className="text-center text-xs">
                <div className="w-48 border-b border-slate-400 mb-1"></div>
                <span className="font-bold">
                  {printInvoice.categoryTab === 'inventory'
                    ? 'Ayurvedic Pharmacist / In-Charge'
                    : printInvoice.categoryTab === 'therapy'
                    ? 'Panchakarma Therapist'
                    : printInvoice.categoryTab === 'consultation'
                    ? 'Consulting Vaidya'
                    : 'Authorized Signatory'}
                </span>
              </div>
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
