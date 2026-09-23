import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { dbService } from './server/db.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------
// Health & Diagnostic Endpoints
// -----------------------------------------------------
app.get('/api/health', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    databaseEngine: dbService.isUsingMySQL ? 'MySQL' : 'Persistent File Engine',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/schema', (req: Request, res: Response) => {
  try {
    const sqlPath = path.resolve(process.cwd(), 'database/hospital_management.sql');
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      return res.status(200).json({ success: true, schema: sql });
    }
    return res.status(404).json({ success: false, message: 'Schema file not found' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------------------------------
// 1. Departments API
// -----------------------------------------------------
app.get('/api/departments', async (req: Request, res: Response) => {
  try {
    const departments = await dbService.getDepartments();
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching departments', error: error.message });
  }
});

// -----------------------------------------------------
// 2. Doctor APIs
// -----------------------------------------------------
// GET /api/doctors/department/:department
app.get('/api/doctors/department/:department', async (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    if (!department) {
      return res.status(400).json({ success: false, message: 'Department is required' });
    }
    const doctors = await dbService.getDoctorsByDepartment(department);
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching doctors by department', error: error.message });
  }
});

// GET /api/doctors
app.get('/api/doctors', async (req: Request, res: Response) => {
  try {
    const doctors = await dbService.getDoctors();
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching doctors', error: error.message });
  }
});

// GET /api/doctors/:id
app.get('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid doctor ID' });

    const doctor = await dbService.getDoctorById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching doctor', error: error.message });
  }
});

// POST /api/doctors
app.post('/api/doctors', async (req: Request, res: Response) => {
  try {
    const { doctor_name, department_id, specialization } = req.body;

    if (!doctor_name || typeof doctor_name !== 'string' || doctor_name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name is required and must be at least 2 characters'
      });
    }

    if (!department_id) {
      return res.status(400).json({
        success: false,
        message: 'Department is required'
      });
    }

    if (!specialization || typeof specialization !== 'string' || specialization.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Specialization is required'
      });
    }

    const newDoctor = await dbService.createDoctor({
      doctor_name: doctor_name.trim(),
      department_id: Number(department_id),
      specialization: specialization.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: newDoctor
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating doctor', error: error.message });
  }
});

// PUT /api/doctors/:id
app.put('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid doctor ID' });

    const existing = await dbService.getDoctorById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const { doctor_name, department_id, specialization } = req.body;
    if (doctor_name && doctor_name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Doctor name must be at least 2 characters' });
    }

    const updated = await dbService.updateDoctor(id, {
      doctor_name: doctor_name ? doctor_name.trim() : undefined,
      department_id: department_id ? Number(department_id) : undefined,
      specialization: specialization ? specialization.trim() : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating doctor', error: error.message });
  }
});

// DELETE /api/doctors/:id
app.delete('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid doctor ID' });

    const existing = await dbService.getDoctorById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await dbService.deleteDoctor(id);
    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting doctor', error: error.message });
  }
});

// -----------------------------------------------------
// 3. Patient APIs
// -----------------------------------------------------
// GET /api/patients
app.get('/api/patients', async (req: Request, res: Response) => {
  try {
    const patients = await dbService.getPatients();
    res.status(200).json({ success: true, count: patients.length, data: patients });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching patients', error: error.message });
  }
});

// GET /api/patients/:id
app.get('/api/patients/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid patient ID' });

    const patient = await dbService.getPatientById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching patient', error: error.message });
  }
});

// POST /api/patients
app.post('/api/patients', async (req: Request, res: Response) => {
  try {
    const { name, date, address } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Patient name is required and must be at least 2 characters long'
      });
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date'
      });
    }

    const newPatient = await dbService.createPatient({
      name: name.trim(),
      date,
      address: address.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: newPatient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating patient', error: error.message });
  }
});

// PUT /api/patients/:id
app.put('/api/patients/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid patient ID' });

    const existing = await dbService.getPatientById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const { name, date, address } = req.body;
    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Patient name must be at least 2 characters' });
    }

    const updated = await dbService.updatePatient(id, {
      name: name ? name.trim() : undefined,
      date: date || undefined,
      address: address ? address.trim() : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating patient', error: error.message });
  }
});

// DELETE /api/patients/:id
app.delete('/api/patients/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid patient ID' });

    const existing = await dbService.getPatientById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await dbService.deletePatient(id);
    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting patient', error: error.message });
  }
});

// -----------------------------------------------------
// 4. Appointment APIs
// -----------------------------------------------------
// GET /api/appointments
app.get('/api/appointments', async (req: Request, res: Response) => {
  try {
    const appointments = await dbService.getAppointments();
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
});

// GET /api/appointments/:id
app.get('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid appointment ID' });

    const appointment = await dbService.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(200).json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching appointment', error: error.message });
  }
});

// POST /api/appointments
app.post('/api/appointments', async (req: Request, res: Response) => {
  try {
    const {
      name,
      patient_name,
      date,
      appointment_date,
      address,
      department,
      doctor,
      doctor_id,
      patient_id,
      status = 'Pending'
    } = req.body;

    const finalName = (name || patient_name || '').trim();
    const finalDate = date || appointment_date;
    const finalAddress = (address || '').trim();

    let targetPatientId = patient_id ? Number(patient_id) : null;

    if (!targetPatientId) {
      if (!finalName || finalName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Patient name is required and must be at least 2 characters long'
        });
      }

      if (!finalDate) {
        return res.status(400).json({
          success: false,
          message: 'Appointment date is required'
        });
      }

      const parsedDate = new Date(finalDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date'
        });
      }

      if (!finalAddress) {
        return res.status(400).json({
          success: false,
          message: 'Address is required'
        });
      }

      const newPatient = await dbService.createPatient({
        name: finalName,
        date: finalDate,
        address: finalAddress
      });
      targetPatientId = newPatient.id;
    }

    let targetDoctorId = doctor_id ? Number(doctor_id) : null;
    if (!targetDoctorId && doctor) {
      if (!isNaN(Number(doctor))) {
        targetDoctorId = Number(doctor);
      } else {
        const doctors = await dbService.getDoctors();
        const found = doctors.find(d => d.doctor_name.toLowerCase() === doctor.trim().toLowerCase());
        if (found) targetDoctorId = found.id;
      }
    }

    if (!targetDoctorId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid doctor'
      });
    }

    const doctorRecord = await dbService.getDoctorById(targetDoctorId);
    if (!doctorRecord) {
      return res.status(400).json({
        success: false,
        message: 'Selected doctor does not exist'
      });
    }

    const newAppointment = await dbService.createAppointment({
      patient_id: targetPatientId,
      doctor_id: targetDoctorId,
      appointment_date: finalDate,
      status
    });

    const populated = await dbService.getAppointmentById(newAppointment.id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment_id: newAppointment.id,
      data: populated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error creating appointment', error: error.message });
  }
});

// PUT /api/appointments/:id
app.put('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid appointment ID' });

    const existing = await dbService.getAppointmentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const { status, appointment_date, doctor_id } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Cancelled', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = await dbService.updateAppointment(id, {
      status,
      appointment_date,
      doctor_id: doctor_id ? Number(doctor_id) : undefined
    });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error updating appointment', error: error.message });
  }
});

// DELETE /api/appointments/:id
app.delete('/api/appointments/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid appointment ID' });

    const existing = await dbService.getAppointmentById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await dbService.deleteAppointment(id);
    res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error deleting appointment', error: error.message });
  }
});

// -----------------------------------------------------
// 5. Admin APIs
// -----------------------------------------------------
// POST /api/admin/login
app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const admin = await dbService.getAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        username: admin.username
      },
      token: 'jwt-auth-' + Date.now()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error during admin login', error: error.message });
  }
});

// GET /api/admin/stats
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    const stats = await dbService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
});

// -----------------------------------------------------
// Setup Vite or Static File Serving
// -----------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Hospital Management System running at:`);
    console.log(` http://localhost:${PORT}`);
    console.log(` Database: ${dbService.isUsingMySQL ? 'MySQL' : 'Persistent Local Engine'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
