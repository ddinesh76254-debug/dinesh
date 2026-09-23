import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Doctor, Patient, Appointment, AdminStats, Department } from '../types.ts';
import { 
  Users, Stethoscope, Calendar, Clock, Plus, Edit2, Trash2, 
  CheckCircle, XCircle, AlertCircle, RefreshCw, X, Save, Shield
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: { id: number; username: string };
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });

  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'patients'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Doctor Modal state
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorFormName, setDoctorFormName] = useState('');
  const [doctorFormDeptId, setDoctorFormDeptId] = useState<number>(1);
  const [doctorFormSpec, setDoctorFormSpec] = useState('');
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);

  // Load everything
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, deptsData, apptsData, docsData, ptsData] = await Promise.all([
        api.getAdminStats(),
        api.getDepartments(),
        api.getAppointments(),
        api.getDoctors(),
        api.getPatients()
      ]);

      setStats(statsData);
      setDepartments(deptsData);
      setAppointments(apptsData);
      setDoctors(docsData);
      setPatients(ptsData);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error loading dashboard data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Appointment Status Actions
  const handleUpdateAppointmentStatus = async (id: number, status: 'Approved' | 'Cancelled') => {
    try {
      await api.updateAppointmentStatus(id, status);
      triggerFeedback(`Appointment #${id} marked as ${status}.`);
      await loadDashboardData();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to update appointment status.', 'error');
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete appointment #${id}?`)) return;
    try {
      await api.deleteAppointment(id);
      triggerFeedback(`Appointment #${id} deleted.`);
      await loadDashboardData();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to delete appointment.', 'error');
    }
  };

  // Doctor CRUD
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorFormName('');
    setDoctorFormDeptId(departments[0]?.id || 1);
    setDoctorFormSpec('');
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDoctorFormName(doc.doctor_name);
    setDoctorFormDeptId(doc.department_id);
    setDoctorFormSpec(doc.specialization);
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorFormName.trim() || !doctorFormSpec.trim()) {
      triggerFeedback('Please provide doctor name and specialization.', 'error');
      return;
    }

    setIsSavingDoctor(true);
    try {
      if (editingDoctor) {
        await api.updateDoctor(editingDoctor.id, {
          doctor_name: doctorFormName.trim(),
          department_id: Number(doctorFormDeptId),
          specialization: doctorFormSpec.trim()
        });
        triggerFeedback(`Dr. ${doctorFormName.trim()} updated successfully!`);
      } else {
        await api.createDoctor({
          doctor_name: doctorFormName.trim(),
          department_id: Number(doctorFormDeptId),
          specialization: doctorFormSpec.trim()
        });
        triggerFeedback(`Dr. ${doctorFormName.trim()} added to hospital roster!`);
      }
      setIsDoctorModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to save doctor details.', 'error');
    } finally {
      setIsSavingDoctor(false);
    }
  };

  const handleDeleteDoctor = async (id: number, name: string) => {
    if (!window.confirm(`Delete ${name}? Any associated appointments will also be cleaned up.`)) return;
    try {
      await api.deleteDoctor(id);
      triggerFeedback(`${name} deleted from doctors roster.`);
      await loadDashboardData();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to delete doctor.', 'error');
    }
  };

  // Patient CRUD
  const handleDeletePatient = async (id: number, name: string) => {
    if (!window.confirm(`Delete patient file for ${name}? Associated appointments will also be removed.`)) return;
    try {
      await api.deletePatient(id);
      triggerFeedback(`Patient file #${id} deleted.`);
      await loadDashboardData();
    } catch (err: any) {
      triggerFeedback(err.message || 'Failed to delete patient.', 'error');
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Hospital Administration
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Active Session: <strong className="text-slate-700">{adminUser.username}</strong>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Operations Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 shadow-xs transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddDoctor}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-sky-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2.5 bg-white hover:bg-red-50 text-red-700 text-xs sm:text-sm font-semibold rounded-xl border border-red-200 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2.5">
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. Metric Cards Grid (Total Patients, Total Doctors, Total Appointments, Pending Appointments) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Patients
              </span>
              <span className="text-3xl font-black text-slate-900 tabular-nums">
                {stats.totalPatients}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Unique registered cases</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Doctors
              </span>
              <span className="text-3xl font-black text-slate-900 tabular-nums">
                {stats.totalDoctors}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Active faculty physicians</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Appointments
              </span>
              <span className="text-3xl font-black text-slate-900 tabular-nums">
                {stats.totalAppointments}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">All recorded consultations</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Pending Appointments
              </span>
              <span className="text-3xl font-black text-amber-600 tabular-nums">
                {stats.pendingAppointments}
              </span>
              <span className="text-[11px] text-amber-600 font-medium block mt-1">Awaiting approval</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Tab Controls for Tables */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments Management ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'doctors'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctors Roster ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'patients'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patients Directory ({patients.length})</span>
          </button>
        </div>

        {/* 2. Appointments Table Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">All Patient Appointments</h3>
                <p className="text-xs text-slate-500 mt-0.5">Admin approval or cancellation updates state in real time.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Patient Details</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Doctor</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                        No appointments found in the system.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-sky-700 tabular-nums">
                          #{apt.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{apt.patient_name}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{apt.patient_address}</div>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-800 tabular-nums whitespace-nowrap">
                          {apt.appointment_date}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-xs">
                            {apt.department_name}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">{apt.doctor_name}</div>
                          <div className="text-xs text-slate-500">{apt.specialization}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            apt.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {apt.status !== 'Approved' && (
                              <button
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'Approved')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                                title="Approve Appointment"
                              >
                                Approve
                              </button>
                            )}
                            {apt.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateAppointmentStatus(apt.id, 'Cancelled')}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 transition-colors cursor-pointer"
                                title="Cancel Appointment"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Appointment Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Doctors Table Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Physicians & Specialist Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage doctor appointments routing and department affiliations.</p>
              </div>
              <button
                onClick={handleOpenAddDoctor}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doctor</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Doctor Name</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Specialization / Clinical Focus</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-sky-700 tabular-nums">
                        #{doc.id}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {doc.doctor_name}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-xs">
                          {doc.department_name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 max-w-sm">
                        {doc.specialization}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditDoctor(doc)}
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Doctor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoctor(doc.id, doc.doctor_name)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Patients Table Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Registered Patients Files</h3>
                <p className="text-xs text-slate-500 mt-0.5">Demographics and intake records stored in the MySQL database.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Patient ID</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Registration Date</th>
                    <th className="px-5 py-3.5">Address</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                        No patient records found.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-sky-700 tabular-nums">
                          #{p.id}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {p.name}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 tabular-nums">
                          {p.date}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 max-w-sm">
                          {p.address}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDeletePatient(p.id, p.name)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Patient Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Doctor Modal: Add / Edit */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {editingDoctor ? `Edit Details: ${editingDoctor.doctor_name}` : 'Add New Hospital Doctor'}
              </h3>
              <button
                onClick={() => setIsDoctorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Doctor Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={doctorFormName}
                  onChange={(e) => setDoctorFormName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Clinical Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={doctorFormDeptId}
                  onChange={(e) => setDoctorFormDeptId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Specialization / Qualifications <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={doctorFormSpec}
                  onChange={(e) => setDoctorFormSpec(e.target.value)}
                  placeholder="e.g. Senior Pediatric Cardiologist, MBBS, MD, DM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDoctor}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingDoctor ? 'Update Doctor' : 'Save Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
