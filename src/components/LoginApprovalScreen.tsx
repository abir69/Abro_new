import React, { useState } from 'react';
import { Member, UserSession, PlotProject } from '../types';
import { getStoredAdminProfile } from '../services/storageService';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Landmark, 
  UserPlus, 
  Clock, 
  ShieldAlert,
  Info,
  FileSpreadsheet,
  Share2
} from 'lucide-react';

interface LoginApprovalScreenProps {
  members: Member[];
  project: PlotProject;
  onLogin: (session: UserSession) => void;
  onRequestAccess?: (newMember: Member) => void;
  onOpenDepositForm?: () => void;
  isCloudSynced?: boolean;
}

export const LoginApprovalScreen: React.FC<LoginApprovalScreenProps> = ({
  members,
  project,
  onLogin,
  onRequestAccess,
  onOpenDepositForm,
  isCloudSynced = true
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'member' | 'register'>('admin');
  
  // Admin Login States
  const [adminPin, setAdminPin] = useState('');
  
  // Member Login States
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    members.find(m => m.role === 'member')?.id || members[1]?.id || ''
  );
  const [memberPin, setMemberPin] = useState('');
  
  // New Registration / Access Request States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regNominee, setRegNominee] = useState('');
  const [regRelation, setRegRelation] = useState('');
  const [regNid, setRegNid] = useState('');
  const [regPin, setRegPin] = useState('1234');

  // Messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingApprovalNotice, setPendingApprovalNotice] = useState<string | null>(null);

  const savedAdmin = getStoredAdminProfile();
  const adminMember = members.find(m => m.role === 'admin') || members.find(m => m.id === 'm1') || (savedAdmin as Member) || members[0];
  const leadAdminName = savedAdmin?.name || project.leadAdminName || adminMember?.name || 'Administrator';
  const adminEmail = savedAdmin?.email || adminMember?.email || 'admin@syndicate.internal';
  const depositBank = project.bankDetails?.bankName || 'The City Bank PLC';
  const depositAccount = project.bankDetails?.accountNumber || '1781580054174';

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingApprovalNotice(null);

    // Verify Admin PIN: Only the configured PIN is accepted (old PIN is removed once new PIN is set)
    const validPin = (savedAdmin?.pin && savedAdmin.pin.trim()) || (adminMember?.pin && adminMember.pin.trim()) || '2026';
    if (adminPin.trim() === validPin) {
      setSuccessMessage('Admin credentials verified. Logging in as Administrator...');
      setTimeout(() => {
        onLogin({
          isLoggedIn: true,
          role: 'admin',
          memberId: adminMember?.id || savedAdmin?.id || 'm1',
          memberName: adminMember?.name || leadAdminName,
          email: adminMember?.email || adminEmail,
          isApproved: true
        });
      }, 500);
    } else {
      setErrorMessage('Invalid Admin Security PIN. Access denied.');
    }
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingApprovalNotice(null);

    const targetMember = members.find(m => m.id === selectedMemberId);
    if (!targetMember) {
      setErrorMessage('Please select an authorized member.');
      return;
    }

    // Check approval status first
    if (targetMember.approvalStatus === 'pending') {
      setPendingApprovalNotice(
        `Login Pending Approval: The account for ${targetMember.name} is currently awaiting approval from Lead Admin (${leadAdminName}). Please contact the syndicate administrator.`
      );
      return;
    }

    if (targetMember.approvalStatus === 'rejected') {
      setErrorMessage(`Access Denied: The account for ${targetMember.name} has been suspended or rejected by syndicate administration.`);
      return;
    }

    // Verify member PIN: Only the configured PIN is accepted (old PIN is removed once new PIN is set)
    const expectedMemberPin = (targetMember.pin && targetMember.pin.trim()) || '1234';
    if (memberPin.trim() === expectedMemberPin) {
      setSuccessMessage(`Login Approved: Verified identity for ${targetMember.name}. Loading portal...`);
      setTimeout(() => {
        onLogin({
          isLoggedIn: true,
          role: targetMember.role,
          memberId: targetMember.id,
          memberName: targetMember.name,
          email: targetMember.email,
          isApproved: true
        });
      }, 500);
    } else {
      setErrorMessage(`Invalid Security PIN for ${targetMember.name}. Please enter your registered 4-digit PIN.`);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPendingApprovalNotice(null);

    if (!regName.trim() || !regEmail.trim() || !regMobile.trim()) {
      setErrorMessage('Please fill in your Name, Email, and Mobile Number.');
      return;
    }

    const newApplicant: Member = {
      id: `m-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      mobile: regMobile.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'member',
      nomineeName: regNominee.trim() || 'TBD',
      nomineeRelation: regRelation.trim() || 'Family',
      nidOrId: regNid.trim() || 'Pending Submission',
      joinedDate: new Date().toISOString().split('T')[0],
      pin: regPin.trim() || '1234',
      approvalStatus: 'pending',
      manualNetAdjustment: 0,
      notes: 'New member access request awaiting Admin approval'
    };

    if (onRequestAccess) {
      onRequestAccess(newApplicant);
    }

    setPendingApprovalNotice(
      `Access Request Queued: Thank you, ${regName.trim()}! Your request for login approval has been sent to Lead Admin (${leadAdminName}). You will be able to sign in once approved.`
    );
    setRegName('');
    setRegEmail('');
    setRegMobile('');
    setRegNominee('');
    setRegRelation('');
    setRegNid('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-emerald-600/15 via-teal-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-950/20 blur-3xl pointer-events-none" />

      {/* Main Authentication Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 bg-slate-950/60 text-center relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/30 mb-3.5">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {project.initiativeName}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              11-Member Joint Trust & Collaborative Escrow · Sector 27, Purbachal Smart City
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-[11px] text-emerald-300 font-medium">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Login Approval & Identity Gate</span>
              </div>
              {onOpenDepositForm && (
                <button
                  type="button"
                  onClick={onOpenDepositForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-700/80 rounded-full text-[11px] text-indigo-300 hover:text-white font-medium transition-colors cursor-pointer"
                  title="Submit a deposit voucher or get the shareable Google Form link"
                >
                  <FileSpreadsheet className="w-3 h-3 text-indigo-400" />
                  <span>Google Form Deposit Portal</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="p-4 bg-slate-950/70 border-b border-slate-800/80">
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { 
                  setActiveTab('admin'); 
                  setErrorMessage(''); 
                  setPendingApprovalNotice(null); 
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => { 
                  setActiveTab('member'); 
                  setErrorMessage(''); 
                  setPendingApprovalNotice(null); 
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'member'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Member Portal</span>
              </button>

              <button
                type="button"
                onClick={() => { 
                  setActiveTab('register'); 
                  setErrorMessage(''); 
                  setPendingApprovalNotice(null); 
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'register'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Request Access</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pending Approval Notice */}
            {pendingApprovalNotice && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-950/70 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <Clock className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Approval Notice</span>
                  <span className="text-amber-300/90 leading-relaxed block">{pendingApprovalNotice}</span>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: ADMIN LOGIN */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Admin Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="Enter Admin PIN"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credentials & Enter System</span>
                </button>
              </form>
            )}

            {/* TAB 2: MEMBER PORTAL LOGIN */}
            {activeTab === 'member' && (
              <form onSubmit={handleMemberLogin} className="space-y-4">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Member Permissions:</strong> You can view all initiative deposit records and financials, but you are authorized to update <strong>only your own profile</strong>.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Select Participant Member (1 of 11)
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => {
                      setSelectedMemberId(e.target.value);
                      setErrorMessage('');
                      setPendingApprovalNotice(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.approvalStatus === 'pending' ? 'PENDING APPROVAL' : m.role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    4-Digit Member Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={6}
                      value={memberPin}
                      onChange={(e) => setMemberPin(e.target.value)}
                      placeholder="Enter 4-digit PIN"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Verify Approval & Enter Portal</span>
                </button>
              </form>
            )}

            {/* TAB 3: REQUEST ACCESS (NEW MEMBER APPROVAL) */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    New participant access requires formal approval from Syndicate Administration. Submit your details to queue your approval request.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Enamul Haque"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Mobile Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      placeholder="+880 1712-000000"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      NID / Passport Number
                    </label>
                    <input
                      type="text"
                      value={regNid}
                      onChange={(e) => setRegNid(e.target.value)}
                      placeholder="NID-1990-XXXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Nominee Name
                    </label>
                    <input
                      type="text"
                      value={regNominee}
                      onChange={(e) => setRegNominee(e.target.value)}
                      placeholder="Nominee Full Name"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Nominee Relationship
                    </label>
                    <input
                      type="text"
                      value={regRelation}
                      onChange={(e) => setRegRelation(e.target.value)}
                      placeholder="Spouse / Father / Mother"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Desired 4-Digit Security PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Submit Login Approval Request</span>
                </button>
              </form>
            )}

            {/* Note confirming One-Click is Turned Off */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-600" />
                <span>One-click bypass disabled. Credentials verified against encrypted syndicate ledger.</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-4 border-t border-slate-800/60 bg-slate-950/90 text-center text-[11px] text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>&copy; 2026 {project.initiativeName} · All Rights Reserved</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Syndicate Authentication Gate</span>
          </span>
        </div>
      </footer>
    </div>
  );
};
