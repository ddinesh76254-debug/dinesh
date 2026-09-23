import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import { Doctor, Appointment } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { DepartmentsSection } from './components/DepartmentsSection.tsx';
import { DoctorsSection } from './components/DoctorsSection.tsx';
import { PatientForm } from './components/PatientForm.tsx';
import { AppointmentDirectory } from './components/AppointmentDirectory.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(undefined);

  // Global state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);

  // Admin authentication state
  const [adminUser, setAdminUser] = useState<{ id: number; username: string } | null>(() => {
    try {
      const stored = localStorage.getItem('hms_admin_user');
      const token = localStorage.getItem('hms_admin_token');
      if (stored && token) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading admin session:', e);
    }
    return null;
  });

  // Fetch initial doctors & appointments
  const refreshDoctors = async () => {
    try {
      const docs = await api.getDoctors();
      setDoctors(docs);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const refreshAppointments = async () => {
    setIsLoadingAppointments(true);
    try {
      const appts = await api.getAppointments();
      setAppointments(appts);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  useEffect(() => {
    refreshDoctors();
    refreshAppointments();
  }, []);

  // Department click on Home page
  const handleSelectDepartment = (deptName: string) => {
    setSelectedDepartment(deptName);
    setSelectedDoctorId(undefined);
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Doctor click on Home page
  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDepartment(doc.department_name || '');
    setSelectedDoctorId(doc.id);
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Appointment booked callback
  const handleAppointmentBooked = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  // Admin Login & Logout
  const handleLoginSuccess = (admin: { id: number; username: string }) => {
    setAdminUser(admin);
    setCurrentTab('admin-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('hms_admin_token');
    localStorage.removeItem('hms_admin_user');
    setAdminUser(null);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminLoggedIn={Boolean(adminUser)}
        onLogout={handleAdminLogout}
        onOpenSchema={() => setIsSchemaModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <Hero
              onBookClick={() => {
                setSelectedDepartment('');
                setSelectedDoctorId(undefined);
                setCurrentTab('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreClick={() => {
                const el = document.getElementById('departments-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <DepartmentsSection onSelectDepartment={handleSelectDepartment} />

            <DoctorsSection
              doctors={doctors}
              onSelectDoctor={handleSelectDoctor}
            />

            {/* Hospital Contact & Facility Information */}
            <section className="py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 block">
                    Campus & Accessibility
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Visit City Care Hospital
                  </h2>
                  <p className="mt-2 text-slate-600 text-sm">
                    State-of-the-art facilities equipped with ICU, diagnostic lab, 24/7 emergency pharmacy, and ample parking.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg mb-4">
                      🏥
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 text-base">Emergency & Trauma Center</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      24-hour dedicated trauma team with advanced cardiac life support (ACLS) ambulances on standby.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-sky-700">
                      Emergency: +91 (080) 4123-9999
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
                      📍
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 text-base">Hospital Address</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      42 Health City Avenue, Medical District, Bengaluru - 560001, Karnataka, India.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700">
                      Metro Station: 200m away
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
                      ⏰
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 text-base">OPD Consultation Hours</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Mon – Sat: 8:00 AM – 8:00 PM<br />
                      Sunday: 9:00 AM – 2:00 PM (Emergency 24/7)
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-700">
                      Inpatient Visiting: 4 PM - 7 PM
                    </div>
                  </div>
                </div>

                <div className="mt-10 text-center">
                  <button
                    onClick={() => {
                      setSelectedDepartment('');
                      setSelectedDoctorId(undefined);
                      setCurrentTab('register');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-sky-600/20 cursor-pointer"
                  >
                    Schedule Your Appointment Now &rarr;
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {currentTab === 'register' && (
          <PatientForm
            initialDepartment={selectedDepartment}
            initialDoctorId={selectedDoctorId}
            onAppointmentBooked={handleAppointmentBooked}
            onViewAppointments={() => {
              setCurrentTab('appointments');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'appointments' && (
          <AppointmentDirectory
            appointments={appointments}
            isLoading={isLoadingAppointments}
            onRefresh={refreshAppointments}
            onNewBookingClick={() => {
              setSelectedDepartment('');
              setSelectedDoctorId(undefined);
              setCurrentTab('register');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'admin-dashboard' && (
          adminUser ? (
            <AdminDashboard
              adminUser={adminUser}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setCurrentTab('home')}
            />
          )
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavClick={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSchema={() => setIsSchemaModalOpen(true)}
      />

      {/* Database Schema Viewer Modal */}
      <DatabaseSchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />
    </div>
  );
}
