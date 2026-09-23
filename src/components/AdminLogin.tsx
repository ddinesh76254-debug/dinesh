import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Shield, Lock, User, AlertCircle, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (admin: { id: number; username: string }) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.loginAdmin(username.trim(), password);
      localStorage.setItem('hms_admin_token', response.token);
      localStorage.setItem('hms_admin_user', JSON.stringify(response.admin));
      onLoginSuccess(response.admin);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="py-16 bg-gradient-to-b from-sky-50/70 to-slate-100 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md">
        
        {/* Brand Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Shield className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hospital Admin Portal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Sign in to manage doctors, patient files, and appointment approvals.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-username" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  required
                />
              </div>
            </div>

            {/* Quick Demo Credentials Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Default Demo Credentials:</span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  User: <code className="text-sky-700 font-bold">admin</code> / Pass: <code className="text-sky-700 font-bold">admin123</code>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-100 hover:bg-sky-200 rounded-md transition-colors cursor-pointer"
              >
                Auto Fill
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:bg-sky-400 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                &larr; Return to Hospital Homepage
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
