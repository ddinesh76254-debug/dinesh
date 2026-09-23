import React from 'react';
import { Heart, Activity, Bone, Sparkles, Baby, Brain, Ear, Flower2, Scissors, ArrowRight } from 'lucide-react';

interface DepartmentsSectionProps {
  onSelectDepartment: (deptName: string) => void;
}

const DEPARTMENTS = [
  {
    name: 'Cardiology',
    icon: Heart,
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    desc: 'Advanced cardiac diagnosis, catheterization, coronary angioplasty, heart failure clinic, and pacemaker implants.'
  },
  {
    name: 'General Medicine',
    icon: Activity,
    color: 'text-sky-600 bg-sky-50 border-sky-100',
    desc: 'Primary patient care, acute illness management, chronic condition monitoring, and preventative health screenings.'
  },
  {
    name: 'Orthopedics',
    icon: Bone,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    desc: 'Comprehensive bone and joint solutions, robotic total knee/hip replacement, sports medicine, and spine surgery.'
  },
  {
    name: 'Dermatology',
    icon: Sparkles,
    color: 'text-purple-600 bg-purple-50 border-purple-100',
    desc: 'Clinical dermatology, pediatric skin care, allergy testing, laser therapies, and advanced cosmetic dermatology.'
  },
  {
    name: 'Pediatrics',
    icon: Baby,
    color: 'text-teal-600 bg-teal-50 border-teal-100',
    desc: 'Comprehensive child healthcare, neonatal intensive care (NICU), childhood vaccination, and pediatric growth tracking.'
  },
  {
    name: 'Neurology',
    icon: Brain,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    desc: 'Expert care for neurological disorders, acute stroke intervention, epilepsy diagnosis, migraine care, and EEG.'
  },
  {
    name: 'ENT',
    icon: Ear,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    desc: 'Comprehensive ear, nose, throat diagnostics, microscopic ear surgery, endoscopic sinus care, and hearing assessment.'
  },
  {
    name: 'Gynecology',
    icon: Flower2,
    color: 'text-pink-600 bg-pink-50 border-pink-100',
    desc: 'Women’s health, high-risk obstetrics, prenatal ultrasound, minimally invasive laparoscopic surgery, and fertility.'
  },
  {
    name: 'General Surgery',
    icon: Scissors,
    color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    desc: 'Advanced minimally invasive laparoscopy, abdominal surgery, trauma surgery, hernia repairs, and day-care procedures.'
  }
];

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({ onSelectDepartment }) => {
  return (
    <section id="departments-section" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2 block">
            Specialized Care Centers
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinical Departments & Medical Faculties
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Equipped with state-of-the-art diagnostic medical devices, intensive care units, and experienced clinical faculties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.name}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${dept.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {dept.desc}
                  </p>
                </div>

                <button
                  onClick={() => onSelectDepartment(dept.name)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Select & Book Doctor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
