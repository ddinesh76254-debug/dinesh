import React from 'react';
import { Calendar, PhoneCall, Award, Users, Stethoscope, ChevronRight } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreClick }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-white py-12 md:py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Introduction & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 text-sky-800 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
              NABH & JCI Accredited Medical Center
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Leading Healthcare with <span className="text-sky-600">Compassion</span> and Clinical Excellence
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              City Care Hospital provides multi-specialty inpatient and outpatient care with over 50+ specialized physicians across Cardiology, Neurology, Orthopedics, and Emergency Medicine. Schedule your appointment instantly online.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onBookClick}
                className="px-6 py-3.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Online</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreClick}
                className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 transition-all cursor-pointer"
              >
                Explore Specialties
              </button>
            </div>

            {/* Quick Proof Metrics (Adjacent to Claim) */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">98.6%</div>
                <div className="text-xs text-slate-500 font-medium">Patient Satisfaction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">24 / 7</div>
                <div className="text-xs text-slate-500 font-medium">Emergency Care</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">9</div>
                <div className="text-xs text-slate-500 font-medium">Clinical Departments</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-slate-100">
              <img
                src="/src/assets/images/hospital_hero_banner_1790178358702.jpg"
                alt="City Care Hospital Modern Medical Lobby"
                className="w-full h-80 sm:h-96 object-cover object-center transform hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Overlay card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">24/7 Emergency Line</div>
                    <div className="text-sm font-bold text-slate-900">+91 (080) 4123-9999</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Always Open
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
