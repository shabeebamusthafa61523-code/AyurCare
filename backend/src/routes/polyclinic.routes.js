import express from 'express';
import {
  getPolyclinicDashboard,
  getPatients,
  createPatient,
  getPatientById,
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getEmrRecords,
  createEmrRecord,
  getPrescriptions,
  createPrescription,
  getLabTests,
  createLabTest,
  updateLabTest,
  getPharmacyItems,
  createPharmacyItem,
  updatePharmacyItem,
  getInvoices,
  createInvoice,
  getDoctorSchedules,
  createDoctorSchedule,
  updateDoctorSchedule,
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  getPanchakarmaBookings,
  createPanchakarmaBooking,
  updatePanchakarmaBooking,
  logPanchakarmaSession,
  deletePanchakarmaBooking
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

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);

// EMR / Consultation
router.get('/emr', getEmrRecords);
router.post('/emr', createEmrRecord);

// Prescriptions
router.get('/prescriptions', getPrescriptions);
router.post('/prescriptions', createPrescription);

// Laboratory
router.get('/lab-tests', getLabTests);
router.post('/lab-tests', createLabTest);
router.put('/lab-tests/:id', updateLabTest);

// Pharmacy & Inventory
router.get('/pharmacy', getPharmacyItems);
router.post('/pharmacy', createPharmacyItem);
router.put('/pharmacy/:id', updatePharmacyItem);

// Billing & Invoices
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);

// Doctors & Staff Schedules
router.get('/doctors', getDoctorSchedules);
router.post('/doctors', createDoctorSchedule);
router.put('/doctors/:id', updateDoctorSchedule);

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

export default router;
