import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  PhoneCall, 
  Plus, 
  Search, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  ArrowRight,
  Filter,
  Activity,
  X,
  Edit2,
  Trash2,
  History,
  Users,
  FileText
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';
import PatientDetailsModal from '../components/PatientDetailsModal';

export default function PatientEnquiriesPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [selectedPatientForAppt, setSelectedPatientForAppt] = useState(null);
  const [showApptModal, setShowApptModal] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState(null);

  const [doctors, setDoctors] = useState([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {}
  });

  // New Patient Enquiry Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    age: '',
    bloodGroup: 'O+',
    prakriti: 'Unknown',
    dietHabit: 'Vegetarian',
    address: '',
    notes: '',
    status: 'New'
  });

  const [showPhoneDropdown, setShowPhoneDropdown] = useState(true);

  // Check if entered phone number matches any existing patients under ANY name
  const phoneMatches = useMemo(() => {
    const raw = (newPatient.phone || '').trim();
    const digits = raw.replace(/\D/g, '');
    if (!digits || digits.length < 4) return [];

    return patients.filter(p => {
      if (editingPatientId && p._id === editingPatientId) return false;
      const pDigits = (p.phone || '').replace(/\D/g, '');
      if (!pDigits) return false;
      return pDigits.includes(digits) || (digits.length >= 7 && pDigits.endsWith(digits.slice(-10)));
    });
  }, [patients, newPatient.phone, editingPatientId]);

  // Appointment Form State
  const [apptData, setApptData] = useState({
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM - 10:30 AM',
    consultationFee: 500,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getPatients();
      if (res.success) setPatients(res.patients);

      const docRes = await polyclinicService.getDoctors();
      if (docRes.success && docRes.doctors.length > 0) {
        setDoctors(docRes.doctors);
        setApptData(prev => ({ ...prev, doctor: docRes.doctors[0]?.doctor?._id || docRes.doctors[0]?._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      if (editingPatientId) {
        const res = await polyclinicService.updatePatient(editingPatientId, {
          ...newPatient,
          age: Number(newPatient.age) || 30
        });
        if (res.success) {
          setShowModal(false);
          setEditingPatientId(null);
          setNewPatient({
            name: '',
            phone: '',
            email: '',
            gender: 'Male',
            age: '',
            bloodGroup: 'O+',
            prakriti: 'Unknown',
            dietHabit: 'Vegetarian',
            address: '',
            notes: '',
            status: 'New'
          });
          fetchData();
        }
        return;
      }

      const res = await polyclinicService.createPatient({
        ...newPatient,
        age: Number(newPatient.age) || 30
      });
      if (res.success) {
        setShowModal(false);
        setNewPatient({
          name: '',
          phone: '',
          email: '',
          gender: 'Male',
          age: '',
          bloodGroup: 'O+',
          prakriti: 'Unknown',
          dietHabit: 'Vegetarian',
          address: '',
          notes: '',
          status: 'New'
        });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleOpenEditPatient = (patient) => {
    setEditingPatientId(patient._id);
    setNewPatient({
      name: patient.name || '',
      phone: patient.phone || '',
      email: patient.email || '',
      gender: patient.gender || 'Male',
      age: patient.age || '',
      bloodGroup: patient.bloodGroup || 'O+',
      prakriti: patient.prakriti || 'Unknown',
      dietHabit: patient.dietHabit || 'Vegetarian',
      address: patient.address || '',
      notes: patient.notes || '',
      status: patient.status || 'New'
    });
    setShowModal(true);
  };

  const handleDeletePatient = (patient) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Patient Record',
      message: `Are you sure you want to permanently delete patient profile for "${patient.name}"? This action cannot be undone.`,
      confirmText: 'Delete Patient',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.deletePatient(patient._id);
          if (res.success) {
            fetchData();
          } else {
            alert(res.message || 'Failed to delete patient');
          }
        } catch (err) {
          alert(err.message || 'Error deleting patient');
        }
      }
    });
  };

  const handleBookAppt = async (e) => {
    e.preventDefault();
    if (!selectedPatientForAppt) return;
    try {
      const selectedDoc = doctors.find(d => (d.doctor?._id || d._id) === apptData.doctor);
      const res = await polyclinicService.createAppointment({
        patient: selectedPatientForAppt._id,
        patientName: selectedPatientForAppt.name,
        patientPhone: selectedPatientForAppt.phone,
        doctor: apptData.doctor,
        doctorName: selectedDoc?.doctorName || 'Dr. General',
        specialization: selectedDoc?.specialization || 'General Medicine',
        date: apptData.date,
        timeSlot: apptData.timeSlot,
        consultationFee: Number(apptData.consultationFee) || 500,
        notes: apptData.notes,
        status: 'Scheduled'
      });
      if (res.success) {
        setShowApptModal(false);
        const pName = selectedPatientForAppt.name;
        setSelectedPatientForAppt(null);
        setConfirmModal({
          isOpen: true,
          title: 'Appointment Scheduled',
          message: `Appointment (Token #${res.appointment?.tokenNumber}) successfully booked for ${pName}!`,
          confirmText: 'Great!',
          variant: 'success',
          onConfirm: () => { fetchData(); }
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      setConfirmModal({
        isOpen: true,
        title: 'Booking Blocked',
        message: errMsg,
        confirmText: 'I Understand',
        variant: 'danger',
        onConfirm: () => {}
      });
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-500" /> Patient Enquiry & CRM
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Phone, WhatsApp, web & walk-in healthcare enquiries. Track lead conversion & book appointments.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPatientId(null);
            setNewPatient({
              name: '',
              phone: '',
              email: '',
              gender: 'Male',
              age: '',
              bloodGroup: 'O+',
              prakriti: 'Unknown',
              dietHabit: 'Vegetarian',
              address: '',
              notes: '',
              status: 'New'
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-sm transition text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register Patient Lead
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 p-3 rounded-2xl shadow-sm">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Search by Patient Name, Phone or ID (e.g. PAT-1001)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
            <thead className="uppercase bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Patient ID</th>
                <th className="py-3.5 px-4">Name & Phone</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Enquiry Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">Loading patient enquiries...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">No patient enquiries found matching criteria.</td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient._id} 
                    onClick={() => setSelectedPatientForDetails(patient)}
                    className="hover:bg-emerald-50/60 dark:hover:bg-slate-800/60 transition cursor-pointer group"
                    title="Click to view complete patient history, logs & follow-ups"
                  >
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                      {patient.patientId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {patient.name}
                      </span>
                      <div className="text-[11px] font-normal text-slate-400">{patient.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">{patient.age} Yrs / {patient.gender}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{patient.bloodGroup || 'O+'}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200/50 mr-1.5">
                        {patient.prakriti || 'Vata-Pitta'}
                      </span>
                      {patient.notes || 'General consultation'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatientForDetails(patient);
                          }}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-2.5 py-1.5 rounded-xl text-xs transition"
                          title="View complete clinical history & logs"
                        >
                          <Activity className="w-3.5 h-3.5 text-emerald-600" /> Full Logs
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatientForAppt(patient);
                            setShowApptModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold px-3 py-1.5 rounded-xl text-xs transition border border-emerald-200/80 dark:border-emerald-800/50"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Book Appt
                        </button>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditPatient(patient);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                            title="Edit Patient Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePatient(patient);
                            }}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                            title="Delete Patient Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Register New Patient Lead */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-lg w-full shadow-2xl my-auto max-h-[90vh] flex flex-col p-5 sm:p-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4.5 h-4.5 text-emerald-500" /> {editingPatientId ? 'Update Patient Lead Details' : 'Register New Patient Lead'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingPatientId ? 'Modify patient demographic information, Prakriti and notes.' : 'Record patient demographic information, contact details, and symptoms.'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreatePatient} className="flex flex-col flex-1 min-h-0 overflow-hidden pt-4">
              <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Patient Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="+91 9876543210"
                        value={newPatient.phone}
                        onChange={(e) => {
                          setNewPatient({ ...newPatient, phone: e.target.value });
                          setShowPhoneDropdown(true);
                        }}
                        onFocus={() => setShowPhoneDropdown(true)}
                        className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white transition ${
                          phoneMatches.length > 0
                            ? 'border-amber-400 ring-1 ring-amber-400/40 dark:border-amber-500'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                      {phoneMatches.length > 0 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          <Users className="w-2.5 h-2.5" /> {phoneMatches.length} existing record{phoneMatches.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Dropdown showing other patient profiles / history with this phone number */}
                    {showPhoneDropdown && phoneMatches.length > 0 && (
                      <div className="absolute left-0 right-0 sm:w-[360px] top-full mt-1.5 z-50 bg-white dark:bg-[#161d2b] border border-amber-300 dark:border-amber-700 rounded-2xl shadow-2xl p-2.5 space-y-2 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60 dark:border-amber-900/40">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                            <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Existing Patient History for {newPatient.phone}:</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPhoneDropdown(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Found {phoneMatches.length} profile(s) sharing this phone number under different or existing names:
                        </p>

                        <div className="space-y-1.5">
                          {phoneMatches.map(match => (
                            <div
                              key={match._id}
                              className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white">{match.name}</span>
                                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                      {match.patientId || 'PAT'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <span>{match.gender || 'Patient'}, {match.age || '—'} yrs</span>
                                    <span>•</span>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{match.prakriti || 'Tridoshic'}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedPatientForDetails(match._id)}
                                  className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition flex items-center gap-0.5 shrink-0"
                                >
                                  <FileText className="w-2.5 h-2.5" /> View History
                                </button>
                              </div>
                              {match.address && (
                                <div className="text-[10px] text-slate-500 truncate">
                                  Address: {match.address}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="pt-1.5 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Registering family member?</span>
                          <button
                            type="button"
                            onClick={() => setShowPhoneDropdown(false)}
                            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            Continue registration →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Age *</label>
                    <input 
                      type="number" 
                      required
                      placeholder="e.g. 35"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <select 
                      value={newPatient.gender}
                      onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                    <select 
                      value={newPatient.bloodGroup}
                      onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prakriti (Body Constitution)</label>
                    <select 
                      value={newPatient.prakriti}
                      onChange={(e) => setNewPatient({ ...newPatient, prakriti: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Unknown">Unknown / Pending Examination</option>
                      <option value="Vata">Vata</option>
                      <option value="Pitta">Pitta</option>
                      <option value="Kapha">Kapha</option>
                      <option value="Vata-Pitta">Vata-Pitta</option>
                      <option value="Pitta-Kapha">Pitta-Kapha</option>
                      <option value="Vata-Kapha">Vata-Kapha</option>
                      <option value="Tridosha / Sama">Tridosha / Sama</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dietary Habit</label>
                    <select 
                      value={newPatient.dietHabit}
                      onChange={(e) => setNewPatient({ ...newPatient, dietHabit: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Vegan">Vegan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Enquiry Notes</label>
                  <textarea 
                    rows="2"
                    placeholder="Record symptoms or patient request details..."
                    value={newPatient.notes}
                    onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {editingPatientId ? 'Save Changes' : 'Save Patient Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Convert to Appointment */}
      {showApptModal && selectedPatientForAppt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl max-w-md w-full shadow-2xl my-auto max-h-[90vh] flex flex-col p-5 sm:p-6">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-emerald-500" /> Book Consultation Appointment
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Patient: <span className="font-bold text-slate-900 dark:text-white">{selectedPatientForAppt.name}</span> ({selectedPatientForAppt.phone})
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowApptModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleBookAppt} className="flex flex-col flex-1 min-h-0 overflow-hidden pt-4">
              <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Doctor *</label>
                  <select 
                    value={apptData.doctor}
                    onChange={(e) => setApptData({ ...apptData, doctor: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    {doctors.map(d => (
                      <option key={d._id} value={d.doctor?._id || d._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {d.doctorName} ({d.specialization}) - Fee: ₹{d.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
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
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 mt-3">
                <button 
                  type="button" 
                  onClick={() => setShowApptModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition shadow-md shadow-emerald-500/20"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Patient 360 Full Details & Logs Modal */}
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
