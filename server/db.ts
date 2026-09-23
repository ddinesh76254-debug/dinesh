import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface Department {
  id: number;
  department_name: string;
}

export interface Doctor {
  id: number;
  doctor_name: string;
  department_id: number;
  specialization: string;
  department_name?: string;
}

export interface Patient {
  id: number;
  name: string;
  date: string;
  address: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  status: 'Pending' | 'Approved' | 'Cancelled' | 'Completed';
  created_at: string;
  patient_name?: string;
  patient_address?: string;
  doctor_name?: string;
  specialization?: string;
  department_name?: string;
}

export interface Admin {
  id: number;
  username: string;
  password: string; // bcrypt hash
}

export interface DBState {
  departments: Department[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  admins: Admin[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'hospital_db.json');

// Initial seed data
const initialDepartments: Department[] = [
  { id: 1, department_name: 'Cardiology' },
  { id: 2, department_name: 'General Medicine' },
  { id: 3, department_name: 'Orthopedics' },
  { id: 4, department_name: 'Dermatology' },
  { id: 5, department_name: 'Pediatrics' },
  { id: 6, department_name: 'Neurology' },
  { id: 7, department_name: 'ENT' },
  { id: 8, department_name: 'Gynecology' },
  { id: 9, department_name: 'General Surgery' }
];

const initialDoctors: Doctor[] = [
  { id: 1, doctor_name: 'Dr. Arun', department_id: 1, specialization: 'Senior Interventional Cardiologist' },
  { id: 2, doctor_name: 'Dr. Priya', department_id: 1, specialization: 'Cardiac Electrophysiologist' },
  { id: 3, doctor_name: 'Dr. Sharma', department_id: 2, specialization: 'Senior Consultant Physician' },
  { id: 4, doctor_name: 'Dr. Ananya', department_id: 2, specialization: 'Internal Medicine Specialist' },
  { id: 5, doctor_name: 'Dr. Kumar', department_id: 3, specialization: 'Joint Replacement & Spine Surgeon' },
  { id: 6, doctor_name: 'Dr. Raj', department_id: 3, specialization: 'Sports Medicine & Arthroscopy Specialist' },
  { id: 7, doctor_name: 'Dr. Sneha', department_id: 4, specialization: 'Consultant Dermatologist & Cosmetologist' },
  { id: 8, doctor_name: 'Dr. Meera', department_id: 5, specialization: 'Senior Pediatrician & Neonatologist' },
  { id: 9, doctor_name: 'Dr. Divya', department_id: 6, specialization: 'Chief Neurologist & Stroke Specialist' },
  { id: 10, doctor_name: 'Dr. Vikram', department_id: 7, specialization: 'Head & Neck ENT Surgeon' },
  { id: 11, doctor_name: 'Dr. Kavita', department_id: 8, specialization: 'Obstetrician & Gynecologist Specialist' },
  { id: 12, doctor_name: 'Dr. Suresh', department_id: 9, specialization: 'Senior Laparoscopic & General Surgeon' }
];

const initialPatients: Patient[] = [
  { id: 1, name: 'Ramesh Patel', date: '2026-09-24', address: '124 MG Road, Indiranagar, Bengaluru', created_at: new Date().toISOString() },
  { id: 2, name: 'Sunita Rao', date: '2026-09-25', address: '45 Park Avenue, Adyar, Chennai', created_at: new Date().toISOString() },
  { id: 3, name: 'David Miller', date: '2026-09-26', address: '78 Jubilee Hills, Hyderabad', created_at: new Date().toISOString() },
  { id: 4, name: 'Farhan Khan', date: '2026-09-27', address: '12 Lake View Residency, Powai, Mumbai', created_at: new Date().toISOString() }
];

const initialAppointments: Appointment[] = [
  { id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2026-09-24', status: 'Approved', created_at: new Date().toISOString() },
  { id: 2, patient_id: 2, doctor_id: 5, appointment_date: '2026-09-25', status: 'Pending', created_at: new Date().toISOString() },
  { id: 3, patient_id: 3, doctor_id: 9, appointment_date: '2026-09-26', status: 'Approved', created_at: new Date().toISOString() },
  { id: 4, patient_id: 4, doctor_id: 2, appointment_date: '2026-09-27', status: 'Pending', created_at: new Date().toISOString() }
];

// Hash for 'admin123'
const defaultHashedPassword = bcrypt.hashSync('admin123', 10);
const initialAdmins: Admin[] = [
  { id: 1, username: 'admin', password: defaultHashedPassword }
];

class DatabaseService {
  private memoryDB: DBState;
  private mysqlPool: mysql.Pool | null = null;
  public isUsingMySQL: boolean = false;

  constructor() {
    this.memoryDB = this.loadFromFile();
    this.initMySQLConnection();
  }

  private loadFromFile(): DBState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (e) {
      console.warn('[Database] Initializing fresh database store');
    }

    const state: DBState = {
      departments: initialDepartments,
      doctors: initialDoctors,
      patients: initialPatients,
      appointments: initialAppointments,
      admins: initialAdmins
    };
    this.saveToFile(state);
    return state;
  }

  private saveToFile(state: DBState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Database Error] Failed saving database file:', e);
    }
  }

  private async initMySQLConnection() {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.DB_NAME || 'hospital_management';

    if (host && user) {
      try {
        const pool = mysql.createPool({
          host,
          user,
          password,
          database,
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: 2000
        });
        const conn = await pool.getConnection();
        console.log(`[Database] Connected successfully to MySQL: ${database} on ${host}`);
        conn.release();
        this.mysqlPool = pool;
        this.isUsingMySQL = true;
      } catch (err: any) {
        console.log(`[Database Note] MySQL server (${host}) not responding (${err.code || err.message}). Using persistent local hospital database engine.`);
        this.isUsingMySQL = false;
      }
    } else {
      console.log(`[Database] Using persistent local hospital database engine.`);
    }
  }

  // --- Departments ---
  async getDepartments(): Promise<Department[]> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [rows] = await this.mysqlPool.query('SELECT * FROM departments ORDER BY department_name ASC');
      return rows as Department[];
    }
    return [...this.memoryDB.departments].sort((a, b) => a.department_name.localeCompare(b.department_name));
  }

  async getDepartmentById(id: number): Promise<Department | null> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [rows]: any = await this.mysqlPool.query('SELECT * FROM departments WHERE id = ?', [id]);
      return rows[0] || null;
    }
    return this.memoryDB.departments.find(d => d.id === id) || null;
  }

  // --- Doctors ---
  async getDoctors(): Promise<Doctor[]> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [rows]: any = await this.mysqlPool.query(`
        SELECT d.id, d.doctor_name, d.department_id, d.specialization, dept.department_name
        FROM doctors d
        JOIN departments dept ON d.department_id = dept.id
        ORDER BY d.doctor_name ASC
      `);
      return rows as Doctor[];
    }
    return this.memoryDB.doctors.map(doc => {
      const dept = this.memoryDB.departments.find(d => d.id === doc.department_id);
      return {
        ...doc,
        department_name: dept ? dept.department_name : 'Unknown'
      };
    }).sort((a, b) => a.doctor_name.localeCompare(b.doctor_name));
  }

  async getDoctorById(id: number): Promise<Doctor | null> {
    const all = await this.getDoctors();
    return all.find(d => d.id === id) || null;
  }

  async getDoctorsByDepartment(deptIdentifier: string): Promise<Doctor[]> {
    const all = await this.getDoctors();
    const isNum = !isNaN(Number(deptIdentifier));
    if (isNum) {
      const deptId = Number(deptIdentifier);
      return all.filter(d => d.department_id === deptId);
    }
    const cleanName = deptIdentifier.trim().toLowerCase();
    return all.filter(d => (d.department_name || '').toLowerCase() === cleanName);
  }

  async createDoctor(data: { doctor_name: string; department_id: number; specialization: string }): Promise<Doctor> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [result]: any = await this.mysqlPool.query(
        'INSERT INTO doctors (doctor_name, department_id, specialization) VALUES (?, ?, ?)',
        [data.doctor_name, data.department_id, data.specialization]
      );
      const inserted = await this.getDoctorById(result.insertId);
      return inserted!;
    }

    const nextId = this.memoryDB.doctors.length > 0 
      ? Math.max(...this.memoryDB.doctors.map(d => d.id)) + 1 
      : 1;
    const newDoc: Doctor = {
      id: nextId,
      doctor_name: data.doctor_name,
      department_id: data.department_id,
      specialization: data.specialization
    };
    this.memoryDB.doctors.push(newDoc);
    this.saveToFile(this.memoryDB);
    const dept = this.memoryDB.departments.find(d => d.id === newDoc.department_id);
    return { ...newDoc, department_name: dept?.department_name || 'General' };
  }

  async updateDoctor(id: number, data: { doctor_name?: string; department_id?: number; specialization?: string }): Promise<Doctor | null> {
    if (this.isUsingMySQL && this.mysqlPool) {
      await this.mysqlPool.query(
        'UPDATE doctors SET doctor_name = COALESCE(?, doctor_name), department_id = COALESCE(?, department_id), specialization = COALESCE(?, specialization) WHERE id = ?',
        [data.doctor_name || null, data.department_id || null, data.specialization || null, id]
      );
      return this.getDoctorById(id);
    }

    const index = this.memoryDB.doctors.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.memoryDB.doctors[index] = {
      ...this.memoryDB.doctors[index],
      doctor_name: data.doctor_name || this.memoryDB.doctors[index].doctor_name,
      department_id: data.department_id || this.memoryDB.doctors[index].department_id,
      specialization: data.specialization || this.memoryDB.doctors[index].specialization
    };
    this.saveToFile(this.memoryDB);
    return this.getDoctorById(id);
  }

  async deleteDoctor(id: number): Promise<boolean> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [res]: any = await this.mysqlPool.query('DELETE FROM doctors WHERE id = ?', [id]);
      return res.affectedRows > 0;
    }

    const initialLen = this.memoryDB.doctors.length;
    this.memoryDB.doctors = this.memoryDB.doctors.filter(d => d.id !== id);
    // Cascade delete appointments with this doctor
    this.memoryDB.appointments = this.memoryDB.appointments.filter(a => a.doctor_id !== id);
    this.saveToFile(this.memoryDB);
    return this.memoryDB.doctors.length < initialLen;
  }

  // --- Patients ---
  async getPatients(): Promise<Patient[]> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [rows] = await this.mysqlPool.query('SELECT * FROM patients ORDER BY created_at DESC');
      return rows as Patient[];
    }
    return [...this.memoryDB.patients].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getPatientById(id: number): Promise<Patient | null> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [rows]: any = await this.mysqlPool.query('SELECT * FROM patients WHERE id = ?', [id]);
      return rows[0] || null;
    }
    return this.memoryDB.patients.find(p => p.id === id) || null;
  }

  async createPatient(data: { name: string; date: string; address: string }): Promise<Patient> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [result]: any = await this.mysqlPool.query(
        'INSERT INTO patients (name, date, address, created_at) VALUES (?, ?, ?, NOW())',
        [data.name, data.date, data.address]
      );
      const inserted = await this.getPatientById(result.insertId);
      return inserted!;
    }

    const nextId = this.memoryDB.patients.length > 0 
      ? Math.max(...this.memoryDB.patients.map(p => p.id)) + 1 
      : 1;
    const newPatient: Patient = {
      id: nextId,
      name: data.name,
      date: data.date,
      address: data.address,
      created_at: new Date().toISOString()
    };
    this.memoryDB.patients.push(newPatient);
    this.saveToFile(this.memoryDB);
    return newPatient;
  }

  async updatePatient(id: number, data: { name?: string; date?: string; address?: string }): Promise<Patient | null> {
    if (this.isUsingMySQL && this.mysqlPool) {
      await this.mysqlPool.query(
        'UPDATE patients SET name = COALESCE(?, name), date = COALESCE(?, date), address = COALESCE(?, address) WHERE id = ?',
        [data.name || null, data.date || null, data.address || null, id]
      );
      return this.getPatientById(id);
    }

    const index = this.memoryDB.patients.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.memoryDB.patients[index] = {
      ...this.memoryDB.patients[index],
      name: data.name || this.memoryDB.patients[index].name,
      date: data.date || this.memoryDB.patients[index].date,
      address: data.address || this.memoryDB.patients[index].address
    };
    this.saveToFile(this.memoryDB);
    return this.memoryDB.patients[index];
  }

  async deletePatient(id: number): Promise<boolean> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [res]: any = await this.mysqlPool.query('DELETE FROM patients WHERE id = ?', [id]);
      return res.affectedRows > 0;
    }

    const initLen = this.memoryDB.patients.length;
    this.memoryDB.patients = this.memoryDB.patients.filter(p => p.id !== id);
    this.memoryDB.appointments = this.memoryDB.appointments.filter(a => a.patient_id !== id);
    this.saveToFile(this.memoryDB);
    return this.memoryDB.patients.length < initLen;
  }

  // --- Appointments ---
  async getAppointments(): Promise<Appointment[]> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [rows]: any = await this.mysqlPool.query(`
        SELECT 
          a.id, a.patient_id, a.doctor_id, a.appointment_date, a.status, a.created_at,
          p.name AS patient_name, p.address AS patient_address,
          d.doctor_name, d.specialization,
          dept.department_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN departments dept ON d.department_id = dept.id
        ORDER BY a.created_at DESC
      `);
      return rows as Appointment[];
    }

    return this.memoryDB.appointments.map(apt => {
      const patient = this.memoryDB.patients.find(p => p.id === apt.patient_id);
      const doctor = this.memoryDB.doctors.find(d => d.id === apt.doctor_id);
      const dept = doctor ? this.memoryDB.departments.find(dep => dep.id === doctor.department_id) : null;

      return {
        ...apt,
        patient_name: patient ? patient.name : 'Unknown Patient',
        patient_address: patient ? patient.address : '',
        doctor_name: doctor ? doctor.doctor_name : 'Unknown Doctor',
        specialization: doctor ? doctor.specialization : '',
        department_name: dept ? dept.department_name : 'General'
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getAppointmentById(id: number): Promise<Appointment | null> {
    const list = await this.getAppointments();
    return list.find(a => a.id === id) || null;
  }

  async createAppointment(data: { patient_id: number; doctor_id: number; appointment_date: string; status?: string }): Promise<Appointment> {
    const validStatus = (['Pending', 'Approved', 'Cancelled', 'Completed'].includes(data.status || '') 
      ? data.status 
      : 'Pending') as Appointment['status'];

    if (this.isUsingMySQL && this.mysqlPool) {
      const [res]: any = await this.mysqlPool.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, created_at) VALUES (?, ?, ?, ?, NOW())',
        [data.patient_id, data.doctor_id, data.appointment_date, validStatus]
      );
      const inserted = await this.getAppointmentById(res.insertId);
      return inserted!;
    }

    const nextId = this.memoryDB.appointments.length > 0 
      ? Math.max(...this.memoryDB.appointments.map(a => a.id)) + 1 
      : 1;

    const newApt: Appointment = {
      id: nextId,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      appointment_date: data.appointment_date,
      status: validStatus,
      created_at: new Date().toISOString()
    };

    this.memoryDB.appointments.push(newApt);
    this.saveToFile(this.memoryDB);
    const populated = await this.getAppointmentById(nextId);
    return populated || newApt;
  }

  async updateAppointment(id: number, data: { status?: string; appointment_date?: string; doctor_id?: number }): Promise<Appointment | null> {
    if (this.isUsingMySQL && this.mysqlPool) {
      await this.mysqlPool.query(
        'UPDATE appointments SET status = COALESCE(?, status), appointment_date = COALESCE(?, appointment_date), doctor_id = COALESCE(?, doctor_id) WHERE id = ?',
        [data.status || null, data.appointment_date || null, data.doctor_id || null, id]
      );
      return this.getAppointmentById(id);
    }

    const index = this.memoryDB.appointments.findIndex(a => a.id === id);
    if (index === -1) return null;

    if (data.status) {
      this.memoryDB.appointments[index].status = data.status as Appointment['status'];
    }
    if (data.appointment_date) {
      this.memoryDB.appointments[index].appointment_date = data.appointment_date;
    }
    if (data.doctor_id) {
      this.memoryDB.appointments[index].doctor_id = data.doctor_id;
    }
    this.saveToFile(this.memoryDB);
    return this.getAppointmentById(id);
  }

  async deleteAppointment(id: number): Promise<boolean> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [res]: any = await this.mysqlPool.query('DELETE FROM appointments WHERE id = ?', [id]);
      return res.affectedRows > 0;
    }

    const initLen = this.memoryDB.appointments.length;
    this.memoryDB.appointments = this.memoryDB.appointments.filter(a => a.id !== id);
    this.saveToFile(this.memoryDB);
    return this.memoryDB.appointments.length < initLen;
  }

  // --- Admin & Stats ---
  async getAdminByUsername(username: string): Promise<Admin | null> {
    if (this.isUsingMySQL && this.mysqlPool) {
      const [rows]: any = await this.mysqlPool.query('SELECT * FROM admins WHERE username = ?', [username]);
      return rows[0] || null;
    }
    return this.memoryDB.admins.find(a => a.username.toLowerCase() === username.trim().toLowerCase()) || null;
  }

  async getStats() {
    const patients = await this.getPatients();
    const doctors = await this.getDoctors();
    const appointments = await this.getAppointments();
    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      pendingAppointments
    };
  }
}

export const dbService = new DatabaseService();
