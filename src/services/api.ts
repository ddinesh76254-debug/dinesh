import { Department, Doctor, Patient, Appointment, AdminStats } from '../types.ts';

const API_BASE = '/api';

export const api = {
  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    const res = await fetch(`${API_BASE}/doctors`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getDoctorById(id: number): Promise<Doctor | null> {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async getDoctorsByDepartment(department: string): Promise<Doctor[]> {
    const res = await fetch(`${API_BASE}/doctors/department/${encodeURIComponent(department)}`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createDoctor(data: { doctor_name: string; department_id: number; specialization: string }): Promise<Doctor> {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to add doctor');
    }
    return json.data;
  },

  async updateDoctor(id: number, data: { doctor_name?: string; department_id?: number; specialization?: string }): Promise<Doctor> {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update doctor');
    }
    return json.data;
  },

  async deleteDoctor(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/doctors/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete doctor');
    }
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    const res = await fetch(`${API_BASE}/patients`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async createPatient(data: { name: string; date: string; address: string }): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create patient');
    }
    return json.data;
  },

  async deletePatient(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete patient');
    }
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const res = await fetch(`${API_BASE}/appointments`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getAppointmentById(id: number): Promise<Appointment | null> {
    const res = await fetch(`${API_BASE}/appointments/${id}`);
    const json = await res.json();
    return json.success ? json.data : null;
  },

  async createAppointment(data: {
    name?: string;
    patient_name?: string;
    date?: string;
    appointment_date?: string;
    address?: string;
    department?: string;
    doctor_id?: number;
    patient_id?: number;
  }): Promise<{ appointment_id: number; data: Appointment }> {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to schedule appointment');
    }
    return {
      appointment_id: json.appointment_id || json.data.id,
      data: json.data
    };
  },

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update appointment');
    }
    return json.data;
  },

  async deleteAppointment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete appointment');
    }
  },

  // Admin
  async loginAdmin(username: string, password: string):Promise<{ token: string; admin: { id: number; username: string } }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Invalid username or password');
    }
    return { token: json.token, admin: json.admin };
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    const json = await res.json();
    return json.success ? json.data : { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, pendingAppointments: 0 };
  },

  // Schema
  async getSchema(): Promise<string> {
    const res = await fetch(`${API_BASE}/schema`);
    const json = await res.json();
    return json.success ? json.schema : '';
  },

  async getHealth(): Promise<{ status: string; databaseEngine: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  }
};
