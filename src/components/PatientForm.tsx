import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Doctor, Appointment } from '../types.ts';
import { User, Calendar, MapPin, Building2, Stethoscope, CheckCircle2, RotateCcw, ArrowRight, Printer, AlertCircle, Loader2 } from 'lucide-react';

interface PatientFormProps {
  initialDepartment?: string;
  initialDoctorId?: number;
  onAppointmentBooked?: (appointment: Appointment) => void;
  onViewAppointments?: () => void;
}

const DEPARTMENTS = [
  'Cardiology',
  'General Medicine',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
  'Neurology',
  'ENT',
  'Gynecology',
  'General Surgery'
];

export const PatientForm: React.FC<PatientFormProps> = ({
  initialDepartment = '',
  initialDoctorId,
  onAppointmentBooked,
  onViewAppointments
}) => {
  // Form state
  const [patientName, setPatientName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState(initialDepartment);
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId ? String(initialDoctorId) : '');

  // Dynamic doctor fetching state
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation & alerts
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingSuccess, setBookingSuccess] = useState<{
    appointmentId: number;
    patientName: string;
    doctorName: string;
    departmentName: string;
    date: string;
    status: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync initial department if changed from parent
  useEffect(() => {
    if (initialDepartment) {
      setDepartment(initialDepartment);
    }
  }, [initialDepartment]);

  // Dynamically fetch doctors from backend API whenever department changes
  useEffect(() => {
    if (!department) {
      setAvailableDoctors([]);
      setDoctorId('');
      return;
    }

    let isMounted = true;
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      setServerError(null);
      try {
        const docs = await api.getDoctorsByDepartment(department);
        if (isMounted) {
          setAvailableDoctors(docs);
          // If we had an initial doctor ID and it matches this department, preserve it
          if (initialDoctorId && docs.some(d => d.id === initialDoctorId)) {
            setDoctorId(String(initialDoctorId));
          } else {
            setDoctorId('');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load doctors:', err);
          setServerError('Could not fetch doctors for this department from the backend.');
        }
      } finally {
        if (isMounted) setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
    return () => {
      isMounted = false;
    };
  }, [department, initialDoctorId]);

  // Form Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patientName.trim()) {
      newErrors.patientName = 'Patient full name is required.';
    } else if (patientName.trim().length < 2) {
      newErrors.patientName = 'Patient name must be at least 2 characters.';
    }

    if (!appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required.';
    } else {
      const parsed = new Date(appointmentDate);
      if (isNaN(parsed.getTime())) {
        newErrors.appointmentDate = 'Please choose a valid appointment date.';
      }
    }

    if (!address.trim()) {
      newErrors.address = 'Residential address is required.';
    }

    if (!department) {
      newErrors.department = 'Please select a clinical department.';
    }

    if (!doctorId) {
      newErrors.doctorId = 'Please select an available doctor.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDoctor = availableDoctors.find(d => d.id === Number(doctorId));

      const payload = {
        name: patientName.trim(),
        date: appointmentDate,
        address: address.trim(),
        department,
        doctor_id: Number(doctorId),
        status: 'Pending'
      };

      const result = await api.createAppointment(payload);

      setBookingSuccess({
        appointmentId: result.appointment_id,
        patientName: patientName.trim(),
        doctorName: selectedDoctor?.doctor_name || result.data.doctor_name || 'Assigned Specialist',
        departmentName: department,
        date: appointmentDate,
        status: 'Pending'
      });

      if (onAppointmentBooked) {
        onAppointmentBooked(result.data);
      }

      // Reset form fields
      handleReset(false);
    } catch (err: any) {
      console.error('Booking error:', err);
      setServerError(err.message || 'Failed to submit registration. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = (clearSuccess = true) => {
    setPatientName('');
    setAppointmentDate(new Date().toISOString().split('T')[0]);
    setAddress('');
    setDepartment('');
    setDoctorId('');
    setAvailableDoctors([]);
    setErrors({});
    if (clearSuccess) {
      setBookingSuccess(null);
      setServerError(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="py-12 bg-slate-50 min-h-[calc(100vh-80px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 block">
            Online Scheduling
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Registration & Appointment
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
            Register your clinical visit. Specialist doctors are dynamically routed based on your selected department.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{serverError}</div>
          </div>
        )}

        {/* Booking Confirmation Slip */}
        {bookingSuccess && (
          <div className="mb-8 bg-emerald-50/90 border border-emerald-300 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950">
                  Appointment Successfully Booked!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700">
                  Your registration has been created in the hospital records.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Appointment ID
                </span>
                <span className="text-2xl font-black text-sky-600 tabular-nums">
                  #{bookingSuccess.appointmentId}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Approval Status
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  ● Pending Approval
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Patient Name
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {bookingSuccess.patientName}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Scheduled Date
                </span>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {bookingSuccess.date}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Department
                </span>
                <span className="text-sm font-semibold text-sky-700">
                  {bookingSuccess.departmentName}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Attending Doctor
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {bookingSuccess.doctorName}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Appointment Slip</span>
              </button>

              {onViewAppointments && (
                <button
                  type="button"
                  onClick={onViewAppointments}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Appointments Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Patient Registration Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* 1. Patient Name */}
            <div>
              <label htmlFor="patientName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Patient Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="patientName"
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    if (errors.patientName) setErrors(prev => ({ ...prev, patientName: '' }));
                  }}
                  placeholder="e.g. Ramesh Patel"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    errors.patientName 
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                      : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                  }`}
                />
              </div>
              {errors.patientName && (
                <p className="mt-1 text-xs text-red-600">{errors.patientName}</p>
              )}
            </div>

            {/* 2. Date */}
            <div>
              <label htmlFor="appointmentDate" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                2. Appointment Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  id="appointmentDate"
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    if (errors.appointmentDate) setErrors(prev => ({ ...prev, appointmentDate: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all tabular-nums ${
                    errors.appointmentDate 
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                      : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                  }`}
                />
              </div>
              {errors.appointmentDate && (
                <p className="mt-1 text-xs text-red-600">{errors.appointmentDate}</p>
              )}
            </div>

            {/* 3. Address */}
            <div>
              <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                3. Residential Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                  }}
                  placeholder="Street address, locality, city, pincode"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    errors.address 
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                      : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                  }`}
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-red-600">{errors.address}</p>
              )}
            </div>

            {/* 4. Doctor Department / Specialty */}
            <div>
              <label htmlFor="department" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                4. Doctor Department / Specialty <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    if (errors.department) setErrors(prev => ({ ...prev, department: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-white ${
                    errors.department 
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                      : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                  }`}
                >
                  <option value="">-- Choose Department / Clinical Specialty --</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="mt-1 text-xs text-red-600">{errors.department}</p>
              )}
            </div>

            {/* 5. Doctor Name (Dynamically Loaded based on Department) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="doctor" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  5. Doctor Name <span className="text-red-500">*</span>
                </label>
                {isLoadingDoctors && (
                  <span className="text-xs text-sky-600 font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Fetching doctors from database...
                  </span>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <select
                  id="doctor"
                  value={doctorId}
                  disabled={!department || isLoadingDoctors || availableDoctors.length === 0}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    if (errors.doctorId) setErrors(prev => ({ ...prev, doctorId: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
                    errors.doctorId 
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-300' 
                      : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-900'
                  }`}
                >
                  {!department ? (
                    <option value="">-- Select department first above --</option>
                  ) : isLoadingDoctors ? (
                    <option value="">Querying doctors from backend...</option>
                  ) : availableDoctors.length === 0 ? (
                    <option value="">No doctors currently available for this specialty</option>
                  ) : (
                    <>
                      <option value="">-- Choose Doctor ({availableDoctors.length} available) --</option>
                      {availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.doctor_name} — {doc.specialization}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              
              {errors.doctorId && (
                <p className="mt-1 text-xs text-red-600">{errors.doctorId}</p>
              )}

              <p className="mt-1.5 text-[11px] text-slate-500">
                Note: Doctor roster is queried dynamically via <code className="text-sky-600 bg-sky-50 px-1 py-0.5 rounded">/api/doctors/department/:dept</code> upon department selection.
              </p>
            </div>

            {/* 6 & 7. Submit and Reset Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Registration...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Registration & Book</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleReset(true)}
                className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Reset</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
