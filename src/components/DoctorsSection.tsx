import React from 'react';
import { Doctor } from '../types.ts';
import { Stethoscope, Calendar, ArrowRight } from 'lucide-react';

interface DoctorsSectionProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

// Map doctor images if available
const DOCTOR_PORTRAITS: Record<string, string> = {
  'Dr. Arun': '/src/assets/images/doctor_arun_portrait_1790178371410.jpg',
  'Dr. Priya': '/src/assets/images/doctor_priya_portrait_1790178385453.jpg'
};

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({ doctors, onSelectDoctor }) => {
  // Take top 6 or all doctors
  const displayDoctors = doctors.slice(0, 6);

  return (
    <section id="doctors-section" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 block">
              Consultant Specialists
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Distinguished Medical Faculty
            </h2>
            <p className="mt-2 text-slate-600 text-sm max-w-xl">
              Board-certified practitioners with international training and decades of combined clinical expertise.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing {displayDoctors.length} of {doctors.length} doctors
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDoctors.map((doc) => {
            const imageSrc = DOCTOR_PORTRAITS[doc.doctor_name];
            const initials = doc.doctor_name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Portrait or styled initials container */}
                  <div className="h-56 bg-slate-100 overflow-hidden relative border-b border-slate-100">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={doc.doctor_name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700">
                        <div className="w-16 h-16 rounded-full bg-white shadow-xs flex items-center justify-center text-xl font-bold text-sky-800 mb-2">
                          {initials}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Board Certified</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-sky-700 shadow-xs border border-white/50">
                      {doc.department_name || 'Specialist'}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      {doc.doctor_name}
                    </h3>
                    <div className="text-xs font-semibold text-sky-600 mb-2">
                      {doc.department_name}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {doc.specialization}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectDoctor(doc)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-sky-600/20"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book with {doc.doctor_name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
