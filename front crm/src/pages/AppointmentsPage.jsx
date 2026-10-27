import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, Stethoscope, CheckCircle2, User, Plus, Search, Filter, Phone, MessageSquare, AlertCircle, X, Sparkles, Table, LayoutGrid, Edit2, Trash2 } from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';
import PatientDetailsModal from '../components/PatientDetailsModal';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedPatientIdForDetails, setSelectedPatientIdForDetails] = useState(null);

  // Book Appointment Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingApptId, setEditingApptId] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [apptData, setApptData] = useState({
    doctor: '',
    service: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM - 10:30 AM',
    consultationFee: 600,
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

  useEffect(() => {
    fetchAppointments();
    fetchPatientsAndDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getAppointments();
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientsAndDoctors = async () => {
    try {
      const pRes = await polyclinicService.getPatients();
      if (pRes.success) setPatients(pRes.patients);

      const dRes = await polyclinicService.getDoctors();
      if (dRes.success && dRes.doctors.length > 0) {
        setDoctors(dRes.doctors);
        const firstDoc = dRes.doctors[0];
        setApptData(prev => ({
          ...prev,
          doctor: firstDoc.doctor?._id || firstDoc._id,
          consultationFee: prev.consultationFee || firstDoc.consultationFee || 500
        }));
      }

      const sRes = await polyclinicService.getServices();
      if (sRes.success && sRes.services) {
        setServices(sRes.services.filter(s => s.status !== 'Inactive'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDoctorChange = (docId) => {
    const doc = doctors.find(d => (d.doctor?._id || d._id) === docId);
    setApptData(prev => ({
      ...prev,
      doctor: docId,
      consultationFee: prev.service ? prev.consultationFee : (doc?.consultationFee || 500)
    }));
  };

  const handleServiceChange = (serviceId) => {
    const selectedS = services.find(s => s._id === serviceId);
    if (selectedS) {
      setApptData(prev => ({
        ...prev,
        service: serviceId,
        consultationFee: selectedS.price
      }));
    } else {
      const doc = doctors.find(d => (d.doctor?._id || d._id) === apptData.doctor);
      setApptData(prev => ({
        ...prev,
        service: '',
        consultationFee: doc?.consultationFee || 500
      }));
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setConfirmModal({
        isOpen: true,
        title: 'Patient Required',
        message: 'Please select a patient to book an appointment.',
        confirmText: 'OK',
        variant: 'warning',
        onConfirm: () => {}
      });
      return;
    }

    const patient = patients.find(p => p._id === selectedPatientId);
    const selectedDoc = doctors.find(d => (d.doctor?._id || d._id) === apptData.doctor);
    const selectedS = services.find(s => s._id === apptData.service);

    try {
      const payload = {
        patient: selectedPatientId,
        patientName: patient?.name,
        patientPhone: patient?.phone,
        doctor: apptData.doctor,
        doctorName: selectedDoc?.doctorName || 'Dr. General',
        specialization: selectedDoc?.specialization || 'General Medicine',
        service: apptData.service || null,
        serviceName: selectedS?.name || '',
        serviceCategory: selectedS?.category || '',
        serviceDuration: selectedS?.duration || '',
        servicePrice: Number(apptData.consultationFee) || 0,
        appointmentType: selectedS?.category?.includes('Panchakarma') ? 'Panchakarma Therapy Session' : 'Doctor Consultation',
        date: apptData.date,
        timeSlot: apptData.timeSlot,
        consultationFee: Number(apptData.consultationFee) || 500,
        notes: apptData.notes,
        status: 'Scheduled'
      };

      let res;
      if (editingApptId) {
        res = await polyclinicService.updateAppointment(editingApptId, payload);
      } else {
        res = await polyclinicService.createAppointment(payload);
      }

      if (res.success) {
        setShowBookModal(false);
        const wasEditing = Boolean(editingApptId);
        setEditingApptId(null);
        setSelectedPatientId('');
        fetchAppointments();
        setConfirmModal({
          isOpen: true,
          title: wasEditing ? 'Appointment Updated' : 'Appointment Confirmed',
          message: wasEditing 
            ? `Appointment details for ${patient?.name || 'patient'} updated successfully.` 
            : `Appointment ${res.appointment?.appointmentNo} (Token #${res.appointment?.tokenNumber}) successfully scheduled for ${patient?.name}.`,
          confirmText: 'Great!',
          variant: 'success',
          onConfirm: () => {}
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setConfirmModal({
        isOpen: true,
        title: 'Action Blocked',
        message: errorMsg,
        confirmText: 'I Understand',
        variant: 'danger',
        onConfirm: () => {}
      });
    }
  };

  const handleOpenEditModal = (appt) => {
    setEditingApptId(appt._id);
    setSelectedPatientId(appt.patient?._id || appt.patient || '');
    setApptData({
      doctor: appt.doctor?._id || appt.doctor || '',
      service: appt.service?._id || appt.service || '',
      date: appt.date ? new Date(appt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      timeSlot: appt.timeSlot || '10:00 AM - 10:30 AM',
      consultationFee: appt.consultationFee || 600,
      notes: appt.notes || ''
    });
    setShowBookModal(true);
  };

  const handleDeleteAppt = (appt) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Appointment',
      message: `Are you sure you want to delete appointment (Token #${appt.tokenNumber || 1}) for ${appt.patientName}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await polyclinicService.deleteAppointment(appt._id);
          fetchAppointments();
        } catch (err) {
          alert(err.response?.data?.message || err.message || 'Failed to delete appointment');
        }
      }
    });
  };

  const requestStatusChange = (appt, newStatus) => {
    setConfirmModal({
      isOpen: true,
      title: `Update Appointment Status`,
      message: `Are you sure you want to change status of ${appt.patientName} (Token #${appt.tokenNumber || 1}) to "${newStatus}"?`,
      confirmText: `Change to ${newStatus}`,
      variant: newStatus === 'Completed' ? 'success' : 'warning',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.updateAppointmentStatus(appt._id, newStatus);
          if (res.success) fetchAppointments();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  const requestReminder = (appt) => {
    setConfirmModal({
      isOpen: true,
      title: `Send WhatsApp Reminder`,
      message: `Send WhatsApp appointment reminder to ${appt.patientName} (${appt.patientPhone}) for ${appt.timeSlot} with ${appt.doctorName}?`,
      confirmText: `Send WhatsApp Reminder`,
      variant: 'primary',
      onConfirm: () => {}
    });
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterStatus === 'All') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" /> Vaidya OP Appointments & Slot Scheduling
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Schedule Ayurvedic doctor consultations, Panchakarma therapy review slots, token numbers, and WhatsApp reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBookModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition text-xs"
          >
            <Plus className="w-4 h-4" /> Book OP Slot
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Table View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800/80">
            {['All', 'Scheduled', 'Checked-In', 'In-Consultation', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterStatus === status 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List / Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8">
          No appointments found for selected filter.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
              <thead className="uppercase bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Token &amp; ID</th>
                  <th className="py-3.5 px-4 font-bold">Patient Details</th>
                  <th className="py-3.5 px-4 font-bold">Doctor / Vaidya</th>
                  <th className="py-3.5 px-4 font-bold">Treatment / Service</th>
                  <th className="py-3.5 px-4 font-bold">Date &amp; Time Slot</th>
                  <th className="py-3.5 px-4 font-bold">Fee (₹)</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredAppointments.map((appt) => (
                  <tr key={appt._id} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/40 font-mono">
                        #{appt.tokenNumber || 1}
                      </span>
                      {appt.appointmentNo && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{appt.appointmentNo}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div 
                        onClick={() => setSelectedPatientIdForDetails(appt.patient)}
                        className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer hover:underline"
                        title="Click to view full patient history"
                      >
                        {appt.patientName} &rarr;
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {appt.patientPhone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{appt.doctorName}</div>
                      <div className="text-[10px] text-slate-400">{appt.specialization || 'Ayurvedic Medicine'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {appt.serviceName ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-semibold">
                          <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{appt.serviceName}</span>
                          {appt.serviceDuration && <span className="text-[10px] text-slate-400 font-normal">({appt.serviceDuration})</span>}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">General Consultation</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {new Date(appt.date).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{appt.timeSlot}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        ₹{appt.consultationFee}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                        appt.status === 'Checked-In' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50' :
                        appt.status === 'In-Consultation' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50' :
                        appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50' :
                        appt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50' :
                        'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => requestReminder(appt)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                          title="WhatsApp Reminder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {appt.status === 'Scheduled' && (
                          <>
                            <button
                              onClick={() => requestStatusChange(appt, 'Checked-In')}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px] transition"
                            >
                              Check In
                            </button>
                            <button
                              onClick={() => requestStatusChange(appt, 'Cancelled')}
                              className="px-1.5 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-[10px] transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {appt.status === 'Checked-In' && (
                          <button
                            onClick={() => requestStatusChange(appt, 'In-Consultation')}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[10px] transition"
                          >
                            Call Cabin
                          </button>
                        )}

                        {appt.status === 'In-Consultation' && (
                          <button
                            onClick={() => requestStatusChange(appt, 'Completed')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition"
                          >
                            Complete
                          </button>
                        )}

                        {/* Hidden Edit & Delete on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(appt)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60 transition"
                            title="Edit Appointment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppt(appt)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 transition"
                            title="Delete Appointment"
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
        /* Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((appt) => (
            <div key={appt._id} className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                    TOKEN #{appt.tokenNumber || 1}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    appt.status === 'Checked-In' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50' :
                    appt.status === 'In-Consultation' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50' :
                    appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50' :
                    appt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50' :
                    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>

                <div>
                  <h3 
                    onClick={() => setSelectedPatientIdForDetails(appt.patient)}
                    className="font-bold text-slate-900 dark:text-white text-base hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer hover:underline flex items-center justify-between"
                    title="Click to view complete clinical history & follow-ups"
                  >
                    <span>{appt.patientName}</span>
                    <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">View Logs &rarr;</span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {appt.patientPhone}</p>
                </div>

                {appt.serviceName && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 truncate">{appt.serviceName}</span>
                    {appt.serviceDuration && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">({appt.serviceDuration})</span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Doctor:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{appt.doctorName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Slot:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{appt.timeSlot}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fee:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{appt.consultationFee}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => requestReminder(appt)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition border border-emerald-200/50 dark:border-emerald-900/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Reminder
                </button>

                {appt.status === 'Scheduled' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => requestStatusChange(appt, 'Checked-In')}
                      className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl transition"
                    >
                      Check In
                    </button>
                    <button
                      onClick={() => requestStatusChange(appt, 'Cancelled')}
                      className="text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2 py-1.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {appt.status === 'Checked-In' && (
                  <button
                    onClick={() => requestStatusChange(appt, 'In-Consultation')}
                    className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl transition"
                  >
                    Consult Doctor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Book Appointment */}
      {showBookModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-md w-full shadow-2xl my-auto max-h-[90vh] flex flex-col p-5 sm:p-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" /> {editingApptId ? 'Edit Appointment' : 'Book New Appointment'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingApptId ? 'Update date, time slot, doctor or treatment details.' : 'Select patient, doctor, and slot to schedule appointments or consultation sessions.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBookModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleBookSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden pt-4">
              <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Patient *</label>
                  <select 
                    required
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- Choose Registered Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {p.name} ({p.phone}) - {p.patientId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Treatment / Service
                    </label>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <select 
                    value={apptData.service}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- General Vaidya Consultation (Default: ₹500) --</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {s.name} — ₹{s.price} ({s.duration}) [{s.category}]
                      </option>
                    ))}
                  </select>

                  {apptData.service && (() => {
                    const s = services.find(x => x._id === apptData.service);
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Doctor *</label>
                  <select 
                    value={apptData.doctor}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    {doctors.map(d => (
                      <option key={d._id} value={d.doctor?._id || d._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {d.doctorName} ({d.specialization}) - ₹{d.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Appointment Date *</label>
                    <input 
                      type="date" 
                      required
                      value={apptData.date}
                      onChange={(e) => setApptData({ ...apptData, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                    <select 
                      value={apptData.timeSlot}
                      onChange={(e) => setApptData({ ...apptData, timeSlot: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="09:00 AM - 09:30 AM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">09:00 AM - 09:30 AM</option>
                      <option value="10:00 AM - 10:30 AM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">10:00 AM - 10:30 AM</option>
                      <option value="11:00 AM - 11:30 AM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">11:00 AM - 11:30 AM</option>
                      <option value="04:00 PM - 04:30 PM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">04:00 PM - 04:30 PM</option>
                      <option value="05:00 PM - 05:30 PM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">05:00 PM - 05:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultation Fee (₹)</label>
                  <input 
                    type="number"
                    value={apptData.consultationFee}
                    onChange={(e) => setApptData({ ...apptData, consultationFee: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-3">
                <button 
                  type="button" 
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition shadow-md shadow-emerald-500/20"
                >
                  {editingApptId ? 'Save Changes' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
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
