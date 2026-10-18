import React, { useState } from 'react';
import { PlotProject } from '../types';
import { Wrench, AlertTriangle, CheckCircle2, X, ShieldAlert, Clock, Sparkles } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PlotProject;
  onSaveMaintenance: (updatedProject: PlotProject) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveMaintenance
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(!!project.isMaintenanceMode);
  const [message, setMessage] = useState<string>(
    project.maintenanceMessage || 'Scheduled Syndicate Treasury Audit & Maintenance. Member access will resume shortly.'
  );
  const [estimatedTime, setEstimatedTime] = useState<string>(
    project.maintenanceEstimatedTime || 'October 17, 2026, 6:00 PM BST'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlotProject = {
      ...project,
      isMaintenanceMode: isEnabled,
      maintenanceMessage: message.trim(),
      maintenanceEstimatedTime: estimatedTime.trim(),
      maintenanceStartedAt: isEnabled ? (project.maintenanceStartedAt || new Date().toISOString()) : ''
    };
    onSaveMaintenance(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isEnabled ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40' : 'bg-slate-800 text-slate-300'
            }`}>
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>System Maintenance Mode</span>
                {isEnabled && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Control public/member access during audits & updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Status Toggle Switch */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-white block">
                Maintenance Mode Status
              </span>
              <p className="text-xs text-slate-400">
                {isEnabled 
                  ? 'Active: Non-admin members will see the maintenance screen.'
                  : 'Disabled: All members have normal access to their portals.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isEnabled && (
            <div className="bg-amber-950/40 border border-amber-800/60 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-200 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-amber-300">Admin Privilege Notice:</strong>
                As an administrator, you will still have full access to view, audit, and edit all data. Non-admin members will be prevented from accessing member portals until you disable this mode.
              </div>
            </div>
          )}

          {/* Announcement Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Maintenance Announcement Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Scheduled Treasury Audit & Maintenance in progress..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Displayed prominently on the lock screen to all visiting members
            </span>
          </div>

          {/* Estimated Resumption Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Estimated Resumption Time</span>
            </label>
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. Today at 6:00 PM BST / Oct 18, 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono placeholder-slate-500"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                isEnabled
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Maintenance Mode</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
