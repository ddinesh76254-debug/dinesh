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

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
}
