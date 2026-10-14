import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

const results = [];

function recordTest(suite, testName, passed, details = '', error = null) {
  results.push({ suite, testName, passed, details, error: error ? (error.message || String(error)) : null });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${suite}] ${testName} ${details ? '(' + details + ')' : ''}`);
  if (error && !passed) {
    console.error('   -> Error:', error.message || error);
  }
}

async function runQA() {
  console.log('=====================================================');
  console.log('   🚀 AYURVEDIC CLINIC CRM - COMPREHENSIVE QA SUITE  ');
  console.log('=====================================================\n');

  let token = '';
  let testPatientId = '';
  let testAppointmentId = '';
  let testEmrId = '';
  let testPrescriptionId = '';
  let testPanchakarmaId = '';
  let testPharmacyItemId = '';
  let testInvoiceId = '';

  // -------------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & SECURITY
  // -------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@polyclinic.com', password: 'Admin@123' })
    });
    const data = await res.json();
    if (res.status === 200 && data.token) {
      token = data.token;
      recordTest('AUTH', 'Login with valid credentials', true, `Token length: ${token.length}`);
    } else {
      recordTest('AUTH', 'Login with valid credentials', false, `Status: ${res.status}`);
    }
  } catch (err) {
    recordTest('AUTH', 'Login with valid credentials', false, '', err);
  }

  // Invalid password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@polyclinic.com', password: 'WrongPassword999' })
    });
    if (res.status === 400 || res.status === 401) {
      recordTest('AUTH', 'Reject invalid password', true, `Status: ${res.status}`);
    } else {
      recordTest('AUTH', 'Reject invalid password', false, `Unexpected status: ${res.status}`);
    }
  } catch (err) {
    recordTest('AUTH', 'Reject invalid password', false, '', err);
  }

  // Missing token protection
  try {
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/patients`);
    if (res.status === 401) {
      recordTest('SECURITY', 'Reject unauthenticated requests to protected endpoints', true, 'HTTP 401 Unauthorized');
    } else {
      recordTest('SECURITY', 'Reject unauthenticated requests to protected endpoints', false, `Got status: ${res.status}`);
    }
  } catch (err) {
    recordTest('SECURITY', 'Reject unauthenticated requests to protected endpoints', false, '', err);
  }

  // Malformed token
  try {
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/patients`, {
      headers: { Authorization: 'Bearer this-is-a-garbage-token-123' }
    });
    if (res.status === 401 || res.status === 403) {
      recordTest('SECURITY', 'Reject malformed JWT token', true, `HTTP ${res.status}`);
    } else {
      recordTest('SECURITY', 'Reject malformed JWT token', false, `Got status: ${res.status}`);
    }
  } catch (err) {
    recordTest('SECURITY', 'Reject malformed JWT token', false, '', err);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // -------------------------------------------------------------------
  // SUITE 2: PATIENTS & ENQUIRIES
  // -------------------------------------------------------------------
  const patientPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
  try {
    const newPatient = {
      name: 'QA Test Patient ' + Date.now().toString().slice(-4),
      phone: patientPhone,
      email: `testpatient_${Date.now()}@example.com`,
      age: 38,
      gender: 'Female',
      address: '108 Ayurvedic Lane, Calicut',
      prakriti: 'Vata-Pitta',
      bloodGroup: 'B+',
      medicalHistory: 'Chronic migraine, acidity and stress-induced insomnia',
      allergies: 'None reported'
    };
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/patients`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newPatient)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.data?._id || data._id)) {
      testPatientId = data.data?._id || data._id;
      recordTest('PATIENTS', 'Create new Patient with Prakriti & Medical History', true, `Patient ID: ${testPatientId}`);
    } else {
      recordTest('PATIENTS', 'Create new Patient with Prakriti & Medical History', false, JSON.stringify(data));
    }
  } catch (err) {
    recordTest('PATIENTS', 'Create new Patient with Prakriti & Medical History', false, '', err);
  }

  // Fetch patient list & check if new patient appears
  try {
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/patients`, { headers: authHeaders });
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.data || []);
    const found = list.some(p => String(p._id) === String(testPatientId) || p.phone === patientPhone);
    recordTest('PATIENTS', 'Retrieve patient list containing newly created patient', found, `Total patients: ${list.length}`);
  } catch (err) {
    recordTest('PATIENTS', 'Retrieve patient list containing newly created patient', false, '', err);
  }

  // Fetch single patient by ID
  if (testPatientId) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/polyclinic/patients/${testPatientId}`, { headers: authHeaders });
      const data = await res.json();
      const patient = data.data || data;
      if (res.status === 200 && patient && (patient.phone === patientPhone || patient.name)) {
        recordTest('PATIENTS', 'Get Patient by ID with full details', true, `Name: ${patient.name}`);
      } else {
        recordTest('PATIENTS', 'Get Patient by ID with full details', false, `Status: ${res.status}`);
      }
    } catch (err) {
      recordTest('PATIENTS', 'Get Patient by ID with full details', false, '', err);
    }
  }

  // Patient validation: missing required fields
  try {
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/patients`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ age: 25 }) // missing name and phone
    });
    if (res.status === 400 || res.status === 422) {
      recordTest('PATIENTS', 'Validation: Reject patient creation with missing required fields', true, `HTTP ${res.status}`);
    } else {
      recordTest('PATIENTS', 'Validation: Reject patient creation with missing required fields', false, `Unexpected HTTP ${res.status}`);
    }
  } catch (err) {
    recordTest('PATIENTS', 'Validation: Reject patient creation with missing required fields', false, '', err);
  }

  // -------------------------------------------------------------------
  // SUITE 3: APPOINTMENTS & RECEPTION QUEUE
  // -------------------------------------------------------------------
  try {
    const apptPayload = {
      patientId: testPatientId || undefined,
      patientName: 'QA Test Patient',
      patientPhone: patientPhone,
      doctorName: 'Dr. Ramesh Namboothiri (BAMS, MD)',
      department: 'Kayachikitsa (Internal Medicine)',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '10:30 AM',
      consultationType: 'First Consultation',
      tokenNumber: Math.floor(100 + Math.random() * 899),
      status: 'Scheduled',
      reason: 'Chronic migraine and digestive issues'
    };
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/appointments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(apptPayload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.data?._id || data._id)) {
      testAppointmentId = data.data?._id || data._id;
      recordTest('APPOINTMENTS', 'Book new Appointment with token and department', true, `Appt ID: ${testAppointmentId}`);
    } else {
      recordTest('APPOINTMENTS', 'Book new Appointment with token and department', false, JSON.stringify(data));
    }
  } catch (err) {
    recordTest('APPOINTMENTS', 'Book new Appointment with token and department', false, '', err);
  }

  // Update appointment status lifecycle
  if (testAppointmentId) {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/polyclinic/appointments/${testAppointmentId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: 'In-Consultation' })
      });
      const data = await res.json();
      if (res.status === 200 && (data.data?.status === 'In-Consultation' || data.status === 'In-Consultation' || data.success)) {
        recordTest('APPOINTMENTS', 'Update Appointment status (Scheduled -> In-Consultation)', true);
      } else {
        recordTest('APPOINTMENTS', 'Update Appointment status (Scheduled -> In-Consultation)', false, `Status: ${res.status}`);
      }
    } catch (err) {
      recordTest('APPOINTMENTS', 'Update Appointment status (Scheduled -> In-Consultation)', false, '', err);
    }
  }

  // -------------------------------------------------------------------
  // SUITE 4: DOCTOR EMR & CONSULTATION
  // -------------------------------------------------------------------
  try {
    const emrPayload = {
      patientId: testPatientId || undefined,
      patientName: 'QA Test Patient',
      doctorName: 'Dr. Ramesh Namboothiri (BAMS, MD)',
      appointmentId: testAppointmentId || undefined,
      consultationDate: new Date().toISOString().split('T')[0],
      chiefComplaints: 'Severe throbbing headache in temporal area, bloating after evening meals, disturbed sleep',
      vitals: {
        bloodPressure: '120/80 mmHg',
        pulseRate: '74 bpm',
        weight: '62 kg',
        temperature: '98.4 F'
      },
      ayurvedicExamination: {
        nadi: 'Vata-Pitta Kapha Sama',
        jihwa: 'Sama (Mild coating at base)',
        mutra: 'Prakrita (Normal)',
        mala: 'Vibandha (Occasional constipation)',
        drik: 'Normal',
        akriti: 'Madhyama'
      },
      diagnosis: 'Shirashoola (Vata-Pitta dominant migraine) with Agnimandya',
      treatmentPlan: 'Deepana-Pachana for 3 days followed by Nasya and Shirodhara',
      notes: 'Advised avoiding curd at night, fermented food, and prolonged screen time'
    };
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/emr`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(emrPayload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.data?._id || data._id)) {
      testEmrId = data.data?._id || data._id;
      recordTest('EMR', 'Create comprehensive Ayurvedic EMR Record (Nadi, Jihwa, Vitals, Diagnosis)', true, `EMR ID: ${testEmrId}`);
    } else {
      recordTest('EMR', 'Create comprehensive Ayurvedic EMR Record', false, JSON.stringify(data));
    }
  } catch (err) {
    recordTest('EMR', 'Create comprehensive Ayurvedic EMR Record', false, '', err);
  }

  // -------------------------------------------------------------------
  // SUITE 5: PRESCRIPTIONS
  // -------------------------------------------------------------------
  try {
    const rxPayload = {
      patientId: testPatientId || undefined,
      patientName: 'QA Test Patient',
      doctorName: 'Dr. Ramesh Namboothiri (BAMS, MD)',
      date: new Date().toISOString().split('T')[0],
      medicines: [
        {
          name: 'Amruthotharam Kashayam',
          form: 'Kashayam',
          dosage: '15ml with 45ml boiled lukewarm water',
          frequency: 'Twice daily before food (Empty stomach)',
          duration: '14 days',
          instructions: 'Take at 6:30 AM and 6:30 PM'
        },
        {
          name: 'Dhanwantharam Gulika',
          form: 'Gulika (Tablet)',
          dosage: '1 tablet crushed in Kashayam',
          frequency: 'Twice daily with Kashayam',
          duration: '14 days',
          instructions: 'Crush before mixing'
        },
        {
          name: 'Ksheerabala Tailam (101 Avartana)',
          form: 'Tailam (Drops)',
          dosage: '4 drops per nostril',
          frequency: 'Morning empty stomach',
          duration: '7 days',
          instructions: 'Pratimarsa Nasya after warm towel fomentation'
        }
      ],
      dietaryAdvice: 'Follow Pathya: Warm, light, freshly prepared meals. Avoid spicy, sour, fried and refrigerated food.',
      nextReviewDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
    };
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/prescriptions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(rxPayload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.data?._id || data._id)) {
      testPrescriptionId = data.data?._id || data._id;
      recordTest('PRESCRIPTIONS', 'Issue Classical Ayurvedic Prescription with dosage, timing and Pathya', true, `Rx ID: ${testPrescriptionId}`);
    } else {
      recordTest('PRESCRIPTIONS', 'Issue Classical Ayurvedic Prescription', false, JSON.stringify(data));
    }
  } catch (err) {
    recordTest('PRESCRIPTIONS', 'Issue Classical Ayurvedic Prescription', false, '', err);
  }

  // -------------------------------------------------------------------
  // SUITE 6: PANCHAKARMA THERAPY SUITE
  // -------------------------------------------------------------------
  try {
    const pkPayload = {
      patientId: testPatientId || undefined,
      patientName: 'QA Test Patient',
      patientPhone: patientPhone,
      therapyName: 'Shirodhara with Ksheerabala Tailam',
      therapyCategory: 'Shiro Chikitsa / Panchakarma',
      doctorName: 'Dr. Ramesh Namboothiri (BAMS, MD)',
      therapistName: 'Suresh Kumar (Senior Therapist)',
      startDate: new Date().toISOString().split('T')[0],
      totalSessions: 7,
      completedSessions: 0,
      sessionDurationMinutes: 45,
      costPerSession: 1800,
      totalAmount: 12600,
      status: 'In Progress',
      treatmentRoom: 'Dhara Room 2',
      clinicalNotes: 'Targeting stress, chronic headache and Pitta-Vata aggravation'
    };
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/panchakarma`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(pkPayload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.data?._id || data._id)) {
      testPanchakarmaId = data.data?._id || data._id;
      recordTest('PANCHAKARMA', 'Book 7-Session Panchakarma Therapy Course', true, `PK ID: ${testPanchakarmaId}`);
    } else {
      recordTest('PANCHAKARMA', 'Book 7-Session Panchakarma Therapy Course', false, JSON.stringify(data));
    }
  } catch (err) {
    recordTest('PANCHAKARMA', 'Book 7-Session Panchakarma Therapy Course', false, '', err);
  }

  // Log a Panchakarma session
  if (testPanchakarmaId) {
    try {
      const sessionData = {
        sessionNumber: 1,
        date: new Date().toISOString().split('T')[0],
        therapist: 'Suresh Kumar',
        oilUsed: 'Ksheerabala Tailam (500ml)',
        patientPulseBefore: '76 bpm',
        patientPulseAfter: '68 bpm',
        patientFeedback: 'Felt deep mental relaxation; tension in temples visibly reduced.',
        therapistNotes: 'Session completed smoothly without complications.'
      };
      const res = await fetch(`${BASE_URL}/api/v1/polyclinic/panchakarma/${testPanchakarmaId}/session`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(sessionData)
      });
      const data = await res.json();
      if (res.status === 200 && (data.success || data.data)) {
        recordTest('PANCHAKARMA', 'Log Therapy Session #1 with pre/post vitals and feedback', true);
      } else {
        recordTest('PANCHAKARMA', 'Log Therapy Session #1 with pre/post vitals and feedback', false, `Status: ${res.status}`);
      }
    } catch (err) {
      recordTest('PANCHAKARMA', 'Log Therapy Session #1 with pre/post vitals and feedback', false, '', err);
    }
  }

  // -------------------------------------------------------------------
  // SUITE 7: PHARMACY & INVENTORY
  // -------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/pharmacy`, { headers: authHeaders });
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.data || []);
    if (res.status === 200 && items.length > 0) {
      recordTest('PHARMACY', 'Fetch Classical Ayurvedic Pharmacy Inventory', true, `Total stock items: ${items.length}`);
      testPharmacyItemId = items[0]._id;
    } else {
      recordTest('PHARMACY', 'Fetch Classical Ayurvedic Pharmacy Inventory', false, `Count: ${items.length}`);
    }
  } catch (err) {
    recordTest('PHARMACY', 'Fetch Classical Ayurvedic Pharmacy Inventory', false, '', err);
  }

  // Add new medicine item to Pharmacy
  try {
    const newMed = {
      itemName: 'QA Test Brahmi Ghritam',
      category: 'Ghritam',
      batchNumber: 'BG-QA-' + Math.floor(1000 + Math.random() * 9000),
      manufacturer: 'Kottakkal Arya Vaidya Sala',
      stockQuantity: 50,
      unit: 'bottle (150g)',
      unitPrice: 280,
      expiryDate: '2028-12-31',
      dosageForm: 'Ghritam (Medicated Ghee)',
      indications: 'Memory enhancement, stress relief, Pitta-Vata disorders'
    };
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/pharmacy`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newMed)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.data?._id || data._id)) {
      recordTest('PHARMACY', 'Add new Classical Ayurvedic Medicine into Inventory', true, `Batch: ${newMed.batchNumber}`);
    } else {
      recordTest('PHARMACY', 'Add new Classical Ayurvedic Medicine into Inventory', false, JSON.stringify(data));
    }
  } catch (err) {
    recordTest('PHARMACY', 'Add new Classical Ayurvedic Medicine into Inventory', false, '', err);
  }

  // -------------------------------------------------------------------
  // SUITE 8: BILLING & INVOICING
  // -------------------------------------------------------------------
  try {
    const invoicePayload = {
      patientId: testPatientId || undefined,
      patientName: 'QA Test Patient',
      patientPhone: patientPhone,
      invoiceDate: new Date().toISOString().split('T')[0],
      items: [
        { description: 'Ayurvedic Doctor Consultation (Kayachikitsa)', quantity: 1, unitPrice: 500, amount: 500 },
        { description: 'Shirodhara Therapy (Session 1 of 7)', quantity: 1, unitPrice: 1800, amount: 1800 },
        { description: 'Amruthotharam Kashayam (200ml)', quantity: 2, unitPrice: 145, amount: 290 },
        { description: 'Dhanwantharam Gulika (100 Tabs)', quantity: 1, unitPrice: 160, amount: 160 }
      ],
      subTotal: 2750,
      taxPercent: 5,
      taxAmount: 137.5,
      discountAmount: 150,
      grandTotal: 2737.5,
      paidAmount: 2737.5,
      balanceAmount: 0,
      paymentMethod: 'UPI / Google Pay',
      paymentStatus: 'Paid',
      notes: 'Consultation + Therapy + Medicines packaged invoice'
    };
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/invoices`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(invoicePayload)
    });
    const data = await res.json();
    if ((res.status === 200 || res.status === 201) && (data.data?._id || data._id)) {
      testInvoiceId = data.data?._id || data._id;
      recordTest('BILLING', 'Create itemized Ayurvedic clinic invoice with Consultation, Therapy, and Medicines', true, `Invoice ID: ${testInvoiceId}`);
    } else {
      recordTest('BILLING', 'Create itemized Ayurvedic clinic invoice', false, JSON.stringify(data));
    }
  } catch (err) {
    recordTest('BILLING', 'Create itemized Ayurvedic clinic invoice', false, '', err);
  }

  // -------------------------------------------------------------------
  // SUITE 9: CLINIC DASHBOARD METRICS
  // -------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/dashboard`, { headers: authHeaders });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data) {
      const { stats } = data.data;
      recordTest('DASHBOARD', 'Retrieve live clinic dashboard aggregated statistics', true, 
        `Patients: ${stats?.totalPatients || 0}, Appts: ${stats?.todayAppointments || 0}, Active Therapies: ${stats?.activePanchakarma || 0}`);
    } else {
      recordTest('DASHBOARD', 'Retrieve live clinic dashboard aggregated statistics', false, `Status: ${res.status}`);
    }
  } catch (err) {
    recordTest('DASHBOARD', 'Retrieve live clinic dashboard aggregated statistics', false, '', err);
  }

  // -------------------------------------------------------------------
  // SUITE 10: DOCTORS SCHEDULE
  // -------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/polyclinic/doctors`, { headers: authHeaders });
    const data = await res.json();
    const docs = Array.isArray(data) ? data : (data.data || []);
    if (res.status === 200) {
      recordTest('DOCTORS', 'Retrieve Ayurvedic doctors roster & consultation hours', true, `Doctors found: ${docs.length}`);
    } else {
      recordTest('DOCTORS', 'Retrieve Ayurvedic doctors roster & consultation hours', false, `Status: ${res.status}`);
    }
  } catch (err) {
    recordTest('DOCTORS', 'Retrieve Ayurvedic doctors roster & consultation hours', false, '', err);
  }

  // -------------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------------
  console.log('\n=====================================================');
  console.log('                 QA TEST SUITE SUMMARY               ');
  console.log('=====================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed          : ${passed} ✅`);
  console.log(`Failed          : ${failed} ❌`);
  console.log(`Success Rate    : ${((passed / total) * 100).toFixed(1)}%`);
  console.log('=====================================================\n');

  if (failed > 0) {
    console.log('Failed tests details:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`- [${r.suite}] ${r.testName}: ${r.details || r.error}`);
    });
  }
}

runQA();
