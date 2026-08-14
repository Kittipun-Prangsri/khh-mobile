import { Router } from 'express';
import {
  getHosxpPatientByHnOrCid,
  getHosxpPatientList,
  getHosxpPatientMedicalHistory,
  getHosxpAppointments,
  getHosxpAppointmentsByHn,
  getHosxpAppointmentById,
  getHosxpMissedFollowUps,
  getHosxpNcdRegistry,
  getHosxpNcdRegistryStats,
} from '../services/hosxpService.js';

const router: Router = Router();

// Test HOSxP Database Connection
router.get('/test-connection', async (req, res) => {
  try {
    const appointments = await getHosxpAppointments(5);
    const count = Array.isArray(appointments) ? appointments.length : appointments.appointments.length;
    res.json({
      status: 'success',
      message: '⚡ เชื่อมต่อฐานข้อมูล HOSxP สำเร็จ!',
      sampleAppointmentsCount: count,
      sampleAppointments: appointments,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: '❌ ไม่สามารถเชื่อมต่อฐานข้อมูล HOSxP ได้',
      error: error.message,
    });
  }
});

// Get Paginated Patient List directly from HOSxP `patient` table
router.get('/patients-list', async (req, res) => {
  try {
    const search = String(req.query.search || '');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await getHosxpPatientList(search, page, limit);
    res.json({ status: 'success', ...data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Search Patient by HN or CID in HOSxP `patient` table
router.get('/patients/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const patient = await getHosxpPatientByHnOrCid(query);
    if (!patient) {
      return res.status(404).json({ status: 'not_found', message: `ไม่พบข้อมูล HN/CID: ${query} ใน HOSxP` });
    }
    res.json({ status: 'success', patient });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Medical Treatment History for a specific patient from HOSxP (`ovst` + `opdscreen` + `vn_stat`)
router.get('/patients/:hn/history', async (req, res) => {
  try {
    const { hn } = req.params;
    const history = await getHosxpPatientMedicalHistory(hn);
    res.json({ status: 'success', hn, historyCount: history.length, history });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get Appointments for a specific patient by HN from HOSxP `oapp`
router.get('/patients/:hn/appointments', async (req, res) => {
  try {
    const { hn } = req.params;
    const limit = Number(req.query.limit) || 20;
    const data: any = await getHosxpAppointmentsByHn(hn, limit);
    const appointments = Array.isArray(data) ? data : data.appointments;
    res.json({ status: 'success', hn, count: appointments.length, appointments });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Query Appointments from HOSxP `oapp`
router.get('/appointments', async (req, res) => {
  try {
    const search = String(req.query.search || '');
    const startDate = String(req.query.startDate || '');
    const endDate = String(req.query.endDate || '');
    const hn = String(req.query.hn || '');
    const clinic = req.query.clinic !== undefined ? String(req.query.clinic) : undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const data = await getHosxpAppointments({ search, startDate, endDate, hn, clinic, page, limit });
    if (Array.isArray(data)) {
      res.json({ status: 'success', count: data.length, appointments: data });
    } else {
      res.json({ status: 'success', ...data });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Query Single Appointment Detail by ID from HOSxP `oapp`
router.get('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await getHosxpAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ status: 'not_found', message: `ไม่พบนัดหมาย ID: ${id}` });
    }
    res.json({ status: 'success', appointment });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Query NCDs Missed Follow-ups and calculate overdue days from HOSxP
router.get('/follow-ups', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const daysInterval = Number(req.query.daysInterval) || 60;
    const tasks = await getHosxpMissedFollowUps(limit, daysInterval);
    res.json({ status: 'success', count: tasks.length, tasks });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Query DM/HT Patient Registry & Treatment Monitoring Data
router.get('/registry', async (req, res) => {
  try {
    const clinic = String(req.query.clinic || 'all');
    const controlStatus = (req.query.controlStatus as any) || 'all';
    const search = String(req.query.search || '');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const data = await getHosxpNcdRegistry({ clinic, controlStatus, search, page, limit });
    res.json({ status: 'success', ...data });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Query DM/HT Registry Summary Statistics and Control Rates
router.get('/registry/stats', async (req, res) => {
  try {
    const stats = await getHosxpNcdRegistryStats();
    res.json({ status: 'success', stats });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
