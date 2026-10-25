import React from 'react';
import { PlotProject, ThemeMode } from '../types';
import { Wrench, ShieldAlert, Clock, Building2, Phone, Mail, LogIn, Sun, Moon, CheckCircle2 } from 'lucide-react';

interface MaintenanceScreenProps {
  project: PlotProject;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  onOpenAdminAuth: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  project,
  themeMode,
  onToggleThemeMode,
  onOpenAdminAuth
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              A
            </div>
            <div>
              <span className="font-bold text-sm text-white block">
                {project.initiativeName}
              </span>
              <span className="text-[11px] text-emerald-400 block font-medium">
                11-Member Joint Trust Treasury · Sector 27 Purbachal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleThemeMode}
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>

            <button
              onClick={onOpenAdminAuth}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Administrator login bypass during maintenance"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Announcement Box */}
      <main className="max-w-xl mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-amber-500 rounded-full shadow-lg shadow-amber-500" />

          {/* Animated Wrench / Shield Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner animate-pulse">
            <Wrench className="w-8 h-8" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Maintenance Mode Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Scheduled Syndicate Treasury Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              {project.maintenanceMessage || 
                'The Aristo Future Plot Initiative portal is currently undergoing scheduled treasury reconciliation, financial audit, and system maintenance.'}
            </p>
          </div>

          {/* Estimated Resumption Time */}
          {project.maintenanceEstimatedTime && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 inline-flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5 font-sans font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Estimated Completion:
              </span>
              <strong className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                {project.maintenanceEstimatedTime}
              </strong>
            </div>
          )}

          {/* Bank & Trust Security Notice */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Deposit Bank Status:
              </span>
              <span className="text-emerald-400 font-mono font-medium">Active & Operational</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>
                Bank: <strong className="text-slate-200">{project.bankDetails.bankName}</strong>
              </div>
              <div>
                Account Number: <strong className="font-mono text-emerald-400">{project.bankDetails.accountNumber}</strong>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                Bank transactions and direct branch deposits are recorded as normal. Member portal access will resume immediately upon audit completion.
              </div>
            </div>
          </div>

          {/* Administrator / Trustee Contacts */}
          <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
            <span className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Direct Syndicate Administration Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/60">
                <span className="font-bold text-slate-200 text-xs block">
                  {project.leadAdminName || 'Md. Minhazul Islam Abir'}
                </span>
                <span className="text-[10px] text-emerald-400 block">
                  {project.leadAdminDesignation || 'Chief Administrator & Trustee'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/60">
                <span className="font-bold text-slate-200 text-xs block">
                  {project.syndicateAdminName || 'Md. Mostak Ahmed'}
                </span>
                <span className="text-[10px] text-sky-400 block">
                  {project.syndicateAdminDesignation || 'Syndicate Secretary & Treasury Auditor'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Login Trigger */}
          <div className="pt-2">
            <button
              onClick={onOpenAdminAuth}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
            >
              <span>Administrator or Trustee? Login to bypass maintenance</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        Aristo Future Plot Initiative · Official 11-Member Joint Trust Treasury · Dhaka, Bangladesh
      </footer>
    </div>
  );
};
