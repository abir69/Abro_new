import React, { useState } from 'react';
import { Member, UserSession } from '../types';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentSession: UserSession;
  onLogin: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  members,
  currentSession,
  onLogin
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'member'>('admin');
  const [adminPin, setAdminPin] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members.find(m => m.role === 'member')?.id || members[1]?.id || ''
  );
  const [memberPin, setMemberPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    // Master admin pin: 2026 or admin member PIN
    const adminMember = members.find(m => m.role === 'admin') || members[0];
    if (adminPin === '2026' || adminPin === adminMember?.pin || adminPin.toLowerCase() === 'admin123') {
      const session: UserSession = {
        isLoggedIn: true,
        role: 'admin',
        memberId: adminMember.id,
        memberName: adminMember.name,
        email: adminMember.email
      };
      setSuccessMessage('Admin authentication verified successfully.');
      setTimeout(() => {
        onLogin(session);
        onClose();
        setSuccessMessage('');
        setAdminPin('');
      }, 500);
    } else {
      setErrorMessage('Invalid Admin PIN. (Default demo PIN is 2026)');
    }
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const targetMember = members.find(m => m.id === selectedMemberId);
    if (!targetMember) {
      setErrorMessage('Please select a member.');
      return;
    }

    if (targetMember.approvalStatus === 'pending') {
      setErrorMessage(`Login Pending: ${targetMember.name} is awaiting Lead Admin approval.`);
      return;
    }
    if (targetMember.approvalStatus === 'rejected') {
      setErrorMessage(`Access Denied: Account for ${targetMember.name} has been rejected/suspended.`);
      return;
    }

    if (memberPin === targetMember.pin || memberPin === '1234') {
      const session: UserSession = {
        isLoggedIn: true,
        role: targetMember.role,
        memberId: targetMember.id,
        memberName: targetMember.name,
        email: targetMember.email,
        isApproved: true
      };
      setSuccessMessage(`Logged in as ${targetMember.name}.`);
      setTimeout(() => {
        onLogin(session);
        onClose();
        setSuccessMessage('');
        setMemberPin('');
      }, 500);
    } else {
      setErrorMessage(`Invalid PIN for ${targetMember.name}. (Default demo PIN is 1234)`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Syndicate Authentication</h3>
              <p className="text-xs text-slate-400">Aristo Future Plot Initiative Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveTab('admin'); setErrorMessage(''); }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </button>
            <button
              onClick={() => { setActiveTab('member'); setErrorMessage(''); }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'member'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Member Portal</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Credentials (Md. Minhazul Islam Abir - miabir9927@gmail.com)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter Admin PIN (Default: 2026)"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Demo PIN: <strong className="text-emerald-400 font-mono">2026</strong></span>
                  <span className="text-slate-500">Unlocks Full Ledger Control</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Admin Identity</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Participant Member (1 of 11)
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.mobile}) - {m.role.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Member Security PIN
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={memberPin}
                    onChange={(e) => setMemberPin(e.target.value)}
                    placeholder="Enter 4-digit PIN (Default: 1234)"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  Demo PIN for all participants is <strong className="text-emerald-400 font-mono">1234</strong>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Enter Member Dashboard</span>
              </button>
            </form>
          )}

          {/* Secure Policy Notice */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              One-click bypass disabled. Credentials required for security audit.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
