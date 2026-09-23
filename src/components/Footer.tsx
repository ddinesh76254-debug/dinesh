import React from 'react';
import { Plus, Phone, Mail, MapPin, Clock } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
  onOpenSchema: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenSchema }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Introduction */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold">
                <Plus className="w-5 h-5 stroke-[3]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                City Care Hospital
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Committed to providing world-class compassionate healthcare with transparent patient management and seamless digital appointments.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                24/7 Outpatient & Trauma
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                NABH Certified
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <button onClick={() => onNavClick('home')} className="hover:text-white transition-colors cursor-pointer">
                  Hospital Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('register')} className="hover:text-white transition-colors cursor-pointer">
                  Book Appointment
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('appointments')} className="hover:text-white transition-colors cursor-pointer">
                  Track Appointment
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('admin-login')} className="hover:text-white transition-colors cursor-pointer">
                  Administrator Login
                </button>
              </li>
              <li>
                <button onClick={onOpenSchema} className="hover:text-sky-400 text-sky-400 transition-colors cursor-pointer">
                  MySQL Database Schema
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Key Specialties
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>Cardiology & Catheterization</li>
              <li>Orthopedics & Joint Surgery</li>
              <li>Neurology & Acute Stroke</li>
              <li>Pediatrics & Neonatal Care</li>
              <li>Laparoscopic General Surgery</li>
            </ul>
          </div>

          {/* Hospital Contact Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Contact & Emergency
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-200">+91 (080) 4123-9999</span>
                  <span className="text-[11px] text-slate-500">24/7 Emergency Line</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">care@cityhospital.org</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>42 Health City Avenue, Medical District, Bengaluru - 560001</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; 2026 City Care Hospital Management System. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by Node.js, Express & MySQL</span>
            <span>REST API compliant</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
