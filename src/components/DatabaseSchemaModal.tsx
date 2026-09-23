import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Database, Copy, Check, X, FileCode, Server, Terminal } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({ isOpen, onClose }) => {
  const [schemaSql, setSchemaSql] = useState('');
  const [copied, setCopied] = useState(false);
  const [health, setHealth] = useState<{ status: string; databaseEngine: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getSchema().then(setSchemaSql).catch(() => setSchemaSql('-- Schema file ready at /database/hospital_management.sql'));
      api.getHealth().then(setHealth).catch(() => null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                MySQL Relational Database Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Database: <code className="text-sky-700 font-semibold">hospital_management</code> &nbsp;•&nbsp; Active Engine: <span className="font-semibold text-emerald-700">{health?.databaseEngine || 'MySQL / Fallback'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied SQL!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Relational Mapping Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Schema Foreign Key Relationships
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs">
                <span className="font-bold text-sky-900 block mb-1">Department &rarr; Doctors</span>
                <p className="text-slate-600 leading-relaxed">
                  One department has many doctors. Doctors reference <code className="text-sky-700 font-semibold">department_id</code> with ON DELETE CASCADE.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
                <span className="font-bold text-purple-900 block mb-1">Patient &rarr; Appointments</span>
                <p className="text-slate-600 leading-relaxed">
                  One patient can have multiple appointments. Appointments reference <code className="text-purple-700 font-semibold">patient_id</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-900 block mb-1">Doctor &rarr; Appointments</span>
                <p className="text-slate-600 leading-relaxed">
                  One doctor attends multiple appointments. Appointments reference <code className="text-emerald-700 font-semibold">doctor_id</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Setup Terminal Quick Reference */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Import command in MySQL Terminal</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <p><span className="text-slate-500"># 1. Start MySQL CLI</span></p>
              <p className="text-emerald-400">$ mysql -u root -p</p>
              <p className="mt-2"><span className="text-slate-500"># 2. Import database and seed data</span></p>
              <p className="text-emerald-400">mysql&gt; SOURCE database/hospital_management.sql;</p>
            </div>
          </div>

          {/* SQL Code Block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                database/hospital_management.sql
              </span>
              <span className="text-[11px] text-slate-400">
                5 Tables: departments, doctors, patients, appointments, admins
              </span>
            </div>
            <pre className="bg-slate-900 text-sky-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-72 border border-slate-800">
              <code>{schemaSql || '-- Loading schema definition...'}</code>
            </pre>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Target Database: MySQL 8.0 / MariaDB 10.5+</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
