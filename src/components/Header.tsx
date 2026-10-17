import React from 'react';
import { Member, UserSession, PlotProject } from '../types';
import { formatCurrency } from '../services/storageService';
import { 
  Building2, 
  User, 
  LogOut, 
  LogIn, 
  Layers, 
  ReceiptText, 
  BellRing, 
  UsersRound, 
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  Share2
} from 'lucide-react';

interface HeaderProps {
  project: PlotProject;
  session: UserSession;
  activeMember?: Member;
  activeTab: 'dashboard' | 'transactions' | 'members' | 'reminders';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'members' | 'reminders') => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onEditMyProfile?: () => void;
  onOpenDepositForm: () => void;
  onOpenApprovalsQueue?: () => void;
  pendingApprovalsCount?: number;
  grossTotal: number;
  netTotal: number;
  pendingRemindersCount: number;
  isCloudSynced?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  session,
  activeMember,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onLogout,
  onEditMyProfile,
  onOpenDepositForm,
  onOpenApprovalsQueue,
  pendingApprovalsCount = 0,
  grossTotal,
  netTotal,
  pendingRemindersCount,
  isCloudSynced = true
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/40 text-slate-100">
      {/* Top Banner / Financial Ticker */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              {isCloudSynced ? 'Live Cloud Synced · Firebase Firestore' : 'Connecting to Live Database...'}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              11 Participating Members
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">
              Target: 2,000 BDT / Member / Month
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Gross Deposits:</span>
              <span className="font-semibold text-slate-100">{formatCurrency(grossTotal, project.symbol)}</span>
            </div>
            {project.totalCombinedBankCharge ? (
              <>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <span>Bank Charge:</span>
                  <span className="font-bold">-{formatCurrency(project.totalCombinedBankCharge, project.symbol)}</span>
                </div>
              </>
            ) : null}
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-medium">Total Net Balance:</span>
              <span className="font-semibold text-emerald-300">{formatCurrency(netTotal, project.symbol)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">
                {project.initiativeName}
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded">
                11-Member Joint Trust
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Collaborative Deposit Tracking & Member Ledger Portal
            </p>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ledger Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'members'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UsersRound className="w-3.5 h-3.5" />
            <span>11 Members</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
              activeTab === 'reminders'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Automated Reminders</span>
            {pendingRemindersCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 font-mono">
                {pendingRemindersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Buttons & User Session */}
        <div className="flex items-center gap-2.5">
          {/* Public Deposit Submission Google Form Button */}
          <button
            onClick={onOpenDepositForm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Open Google Form for Submitting Deposits & Get Shareable Link"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Deposit Form</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-700 font-mono hidden sm:inline">
              Share
            </span>
          </button>

          {/* Admin Pending Approvals Queue Button */}
          {session.role === 'admin' && pendingApprovalsCount > 0 && onOpenApprovalsQueue && (
            <button
              onClick={onOpenApprovalsQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer animate-pulse shadow-md"
              title={`${pendingApprovalsCount} Deposit Submissions Awaiting Verification`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Approvals</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono">
                {pendingApprovalsCount}
              </span>
            </button>
          )}

          {session.isLoggedIn ? (
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 pl-2 pr-3 py-1.5 rounded-xl">
              {activeMember?.avatar ? (
                <img
                  src={activeMember.avatar}
                  alt={session.memberName}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-white">
                  {session.memberName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left text-xs">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-medium text-slate-100 max-w-[120px] truncate">
                    {session.memberName}
                  </span>
                  {session.role === 'admin' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1 py-0.2 rounded border border-emerald-800">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-800/80">
                      MEMBER
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate block max-w-[120px]">
                  {session.email}
                </span>
              </div>

              <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-1.5">
                {onEditMyProfile && session.role === 'member' && (
                  <button
                    onClick={onEditMyProfile}
                    title="Update My Profile Details"
                    className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-800/50 rounded transition-colors text-xs flex items-center gap-0.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold hidden md:inline">My Profile</span>
                  </button>
                )}
                <button
                  onClick={onOpenAuthModal}
                  title="Switch User / Login Settings"
                  className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-0.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">Switch</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Log Out (Return to Login Approval)"
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Secure Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
