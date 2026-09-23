import React from 'react';
import { Plus, Database, Shield, CalendarCheck, UserPlus, Home } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  onOpenSchema: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdminLoggedIn,
  onLogout,
  onOpenSchema
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Zone 1: Brand Wordmark */}
          <button 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-lg group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/30 group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                City Care Hospital
              </span>
              <span className="block text-[11px] font-medium text-slate-500 tracking-wider uppercase">
                Management System
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'home'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('register')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'register'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => setCurrentTab('appointments')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'appointments'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setCurrentTab(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab.startsWith('admin')
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSchema}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Inspect MySQL Schema and Database Structure"
            >
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span>Database (MySQL)</span>
            </button>

            {isAdminLoggedIn ? (
              <button
                onClick={onLogout}
                className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('register')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-sm shadow-sky-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Book Appointment
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
