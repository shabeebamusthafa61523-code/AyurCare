import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Stethoscope, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  X, 
  Shield, 
  Phone, 
  Mail,
  Sparkles,
  Droplet,
  Search,
  Table,
  LayoutGrid,
  Edit2,
  Trash2
} from 'lucide-react';
import { polyclinicService } from '../services/polyclinicService';
import ConfirmationModal from '../components/ConfirmationModal';

const AYUR_SPECIALIZATIONS = [
  'Kayachikitsa (Ayurvedic General Medicine)',
  'Panchakarma (Detoxification & Purification)',
  'Shalya Tantra (Marma & Ksharasutra)',
  'Shalakya Tantra (ENT & Ophthalmology)',
  'Prasuti Tantra & Stri Roga (Ayurvedic Gynaecology)',
  'Kaumarbhritya (Ayurvedic Paediatrics)',
  'Swasthavritta & Yoga (Lifestyle & Preventive Care)',
  'Abhyanga, Kizhi & Shirodhara (Panchakarma Therapy)',
  'Aushadha Shala (Ayurvedic Pharmacy & Dispensary)'
];

const STAFF_TYPES = [
  'Vaidya (Ayurvedic Physician)',
  'Panchakarma Therapist',
  'Ayurvedic Pharmacist',
  'Care Coordinator'
];

export default function DoctorsStaffPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Form State for Adding Vaidya / Therapist
  const [form, setForm] = useState({
    doctorName: '',
    staffType: 'Vaidya (Ayurvedic Physician)',
    gender: 'Female',
    qualification: 'BAMS, MD (Ayurveda)',
    specialization: 'Kayachikitsa & Panchakarma',
    consultationFee: 500,
    honorariumType: 'Percentage',
    honorariumRate: 70,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: ['09:00 AM - 01:00 PM', '04:00 PM - 07:30 PM']
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
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await polyclinicService.getDoctors();
      if (res.success) setDoctors(res.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setForm(prev => {
      const exists = prev.availableDays.includes(day);
      const availableDays = exists
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays };
    });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      if (editingStaffId) {
        const res = await polyclinicService.updateDoctorSchedule(editingStaffId, form);
        if (res.success) {
          setShowAddModal(false);
          const name = form.doctorName;
          setEditingStaffId(null);
          setForm({
            doctorName: '',
            staffType: 'Vaidya (Ayurvedic Physician)',
            gender: 'Female',
            qualification: 'BAMS, MD (Ayurveda)',
            specialization: 'Kayachikitsa & Panchakarma',
            consultationFee: 500,
            honorariumType: 'Percentage',
            honorariumRate: 70,
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            timeSlots: ['09:00 AM - 01:00 PM', '04:00 PM - 07:30 PM']
          });
          fetchDoctors();
          setConfirmModal({
            isOpen: true,
            title: 'Staff Profile Updated',
            message: `Staff member "${name}" profile was updated successfully.`,
            confirmText: 'Great!',
            variant: 'success',
            onConfirm: () => {}
          });
        }
        return;
      }

      const res = await polyclinicService.createDoctorSchedule(form);
      if (res.success) {
        setShowAddModal(false);
        const name = form.doctorName;
        setForm({
          doctorName: '',
          staffType: 'Vaidya (Ayurvedic Physician)',
          gender: 'Female',
          qualification: 'BAMS, MD (Ayurveda)',
          specialization: 'Kayachikitsa & Panchakarma',
          consultationFee: 500,
          honorariumType: 'Percentage',
          honorariumRate: 70,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          timeSlots: ['09:00 AM - 01:00 PM', '04:00 PM - 07:30 PM']
        });
        fetchDoctors();
        setConfirmModal({
          isOpen: true,
          title: 'Ayurvedic Practitioner Registered',
          message: `Staff member "${name}" registered successfully!`,
          confirmText: 'Great!',
          variant: 'success',
          onConfirm: () => {}
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleOpenEditStaff = (staff) => {
    setEditingStaffId(staff._id);
    setForm({
      doctorName: staff.doctorName || '',
      staffType: staff.staffType || 'Vaidya (Ayurvedic Physician)',
      gender: staff.gender || 'Female',
      qualification: staff.qualification || 'BAMS, MD (Ayurveda)',
      specialization: staff.specialization || 'Kayachikitsa & Panchakarma',
      consultationFee: staff.consultationFee || 500,
      honorariumType: staff.honorariumType || 'Percentage',
      honorariumRate: staff.honorariumRate || 70,
      availableDays: staff.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: staff.timeSlots || ['09:00 AM - 01:00 PM', '04:00 PM - 07:30 PM']
    });
    setShowAddModal(true);
  };

  const handleDeleteStaff = (staff) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Staff Member',
      message: `Are you sure you want to remove ${staff.doctorName}? This action cannot be undone.`,
      confirmText: 'Delete Staff',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await polyclinicService.deleteDoctorSchedule(staff._id);
          if (res.success) {
            fetchDoctors();
          } else {
            alert(res.message || 'Failed to delete staff member');
          }
        } catch (err) {
          alert(err.message || 'Error deleting staff member');
        }
      }
    });
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = (doc.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.qualification || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || doc.staffType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Vaidya & Therapist Directory
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Vaidyas & Panchakarma Therapists Directory
          </h1>
          <p className="text-emerald-200/80 text-xs mt-1">
            Manage Ayurvedic physicians (BAMS/MD), Panchakarma therapists (male & female for traditional modesty), dispensary pharmacists, and duty rosters.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingStaffId(null);
            setForm({
              doctorName: '',
              staffType: 'Vaidya (Ayurvedic Physician)',
              gender: 'Female',
              qualification: 'BAMS, MD (Ayurveda)',
              specialization: 'Kayachikitsa & Panchakarma',
              consultationFee: 500,
              honorariumType: 'Percentage',
              honorariumRate: 70,
              availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              timeSlots: ['09:00 AM - 01:00 PM', '04:00 PM - 07:30 PM']
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-4 py-2.5 rounded-2xl shadow-lg transition text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Practitioner / Staff
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111622] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search practitioner, qualification, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto">
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

          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Vaidya (Ayurvedic Physician)', 'Panchakarma Therapist', 'Ayurvedic Pharmacist'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  typeFilter === type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {type === 'All' ? 'All Staff' : type.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Content */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Staff Members Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || typeFilter !== 'All' 
              ? 'No practitioners match your search filters.' 
              : 'Add your Vaidyas and therapists to configure appointment scheduling.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Practitioner / Staff</th>
                  <th className="py-3 px-4">Role & Category</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Duty Days & Schedule</th>
                  <th className="py-3 px-4">Consultation Fee</th>
                  <th className="py-3 px-4">Honorarium</th>
                  <th className="py-3 px-4">Gender Modality</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredDoctors.map((item) => (
                  <tr key={item._id} className="group hover:bg-emerald-50/40 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.doctorName}</div>
                          <div className="text-[11px] text-slate-500">{item.qualification || 'BAMS, MD Ayu'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.staffType || 'Vaidya'}
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-[200px]">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{item.specialization}</span>
                    </td>
                    <td className="py-3 px-4 min-w-[180px]">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(item.availableDays || []).map(day => (
                          <span key={day} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {day.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                      {item.timeSlots && item.timeSlots.length > 0 && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{item.timeSlots.join(', ')}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.consultationFee ? `₹${item.consultationFee}` : 'Package Included'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                        {item.honorariumRate ? `${item.honorariumRate}% (${item.honorariumType || 'Share'})` : 'Fixed / Salary'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-600 dark:text-slate-400 text-xs">
                        {item.gender || 'Any'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditStaff(item)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(item)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Staff Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {item.staffType || 'Vaidya'}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {item.doctorName}
                  </h3>
                  <p className="text-xs text-slate-400">{item.qualification || 'BAMS, MD Ayu'}</p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Specialization:</span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5">{item.specialization}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultation Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.consultationFee ? `₹${item.consultationFee}` : 'Included in Package'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gender Modality:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.gender || 'Any'}</span>
                </div>
              </div>

              {/* Available Days */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Duty Days:</span>
                <div className="flex flex-wrap gap-1">
                  {(item.availableDays || []).map(day => (
                    <span key={day} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {day.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111622] rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" /> {editingStaffId ? 'Update Practitioner / Staff Profile' : 'Register Ayurvedic Practitioner / Staff'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name & Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arya Warrier (BAMS, MD) / Rahul K."
                  value={form.doctorName}
                  onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Staff Role *</label>
                  <select
                    value={form.staffType}
                    onChange={(e) => setForm({ ...form, staffType: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {STAFF_TYPES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. BAMS, MD (Ayu) / DAPT / B.Pharm Ayu"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={form.consultationFee}
                    onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ayurvedic Specialization</label>
                <select
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {AYUR_SPECIALIZATIONS.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duty Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        form.availableDays.includes(day)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingStaffId ? 'Save Changes' : 'Register Practitioner'}
                </button>
              </div>
            </form>
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
