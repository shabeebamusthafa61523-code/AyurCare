import express from 'express';
import {
  getPolyclinicDashboard,
  getPatients,
  createPatient,
  getPatientById,
  updatePatient,
  deletePatient,
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getEmrRecords,
  createEmrRecord,
  updateEmrRecord,
  deleteEmrRecord,
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
  dispensePrescription,
  getLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  getPharmacyItems,
  createPharmacyItem,
  updatePharmacyItem,
  deletePharmacyItem,
  getInvoices,
  createInvoice,
  deleteInvoice,
  getDoctorSchedules,
  createDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  getPanchakarmaBookings,
  createPanchakarmaBooking,
  updatePanchakarmaBooking,
  logPanchakarmaSession,
  deletePanchakarmaBooking,
  getClinicServices,
  createClinicService,
  updateClinicService,
  deleteClinicService
} from '../controllers/polyclinic.controller.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Secure all polyclinic routes with JWT authentication
router.use(protectRoute);

// Dashboard Overview
router.get('/dashboard', getPolyclinicDashboard);

// Patients
router.get('/patients', getPatients);
router.post('/patients', createPatient);
router.get('/patients/:id', getPatientById);
router.put('/patients/:id', updatePatient);
router.delete('/patients/:id', deletePatient);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);
router.patch('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// EMR / Consultation
router.get('/emr', getEmrRecords);
router.post('/emr', createEmrRecord);
router.put('/emr/:id', updateEmrRecord);
router.delete('/emr/:id', deleteEmrRecord);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);
router.put('/prescriptions/:id', updatePrescription);
router.delete('/prescriptions/:id', deletePrescription);
router.post('/prescriptions/:id/dispense', dispensePrescription);

// Laboratory
router.get('/lab-tests', getLabTests);
router.post('/lab-tests', createLabTest);
router.put('/lab-tests/:id', updateLabTest);
router.delete('/lab-tests/:id', deleteLabTest);

// Pharmacy & Inventory
router.get('/pharmacy', getPharmacyItems);
router.post('/pharmacy', createPharmacyItem);
router.put('/pharmacy/:id', updatePharmacyItem);
router.delete('/pharmacy/:id', deletePharmacyItem);

// Billing & Invoices
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);
router.delete('/invoices/:id', deleteInvoice);

// Doctors & Staff Schedules
router.get('/doctors', getDoctorSchedules);
router.post('/doctors', createDoctorSchedule);
router.put('/doctors/:id', updateDoctorSchedule);
router.delete('/doctors/:id', deleteDoctorSchedule);

// Follow-ups
router.get('/follow-ups', getFollowUps);
router.post('/follow-ups', createFollowUp);
router.put('/follow-ups/:id', updateFollowUp);
router.delete('/follow-ups/:id', deleteFollowUp);

// Panchakarma Therapy Suite
router.get('/panchakarma', getPanchakarmaBookings);
router.post('/panchakarma', createPanchakarmaBooking);
router.put('/panchakarma/:id', updatePanchakarmaBooking);
router.post('/panchakarma/:id/session', logPanchakarmaSession);
router.delete('/panchakarma/:id', deletePanchakarmaBooking);

// Clinic Services Management
router.get('/services', getClinicServices);
router.post('/services', createClinicService);
router.patch('/services/:id', updateClinicService);
router.put('/services/:id', updateClinicService);
router.delete('/services/:id', deleteClinicService);

export default router;
