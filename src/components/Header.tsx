import React from 'react';
import { Member, UserSession, PlotProject, ThemeMode } from '../types';
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
  Share2,
  Sun,
  Moon,
  Wrench,
  AlertTriangle
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
  onOpenMaintenanceModal?: () => void;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
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
  onOpenMaintenanceModal,
  themeMode,
  onToggleThemeMode,
  pendingApprovalsCount = 0,
  grossTotal,
  netTotal,
  pendingRemindersCount,
  isCloudSynced = true
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/40 text-slate-100">
      {/* Top Banner / Financial Ticker */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 px-3 sm:px-4 py-1.5 text-xs text-slate-300 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-max sm:min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              {isCloudSynced ? 'Live Cloud Synced · Firebase' : 'Connecting Cloud...'}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden md:inline">
              11 Participating Members
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden lg:inline">
              Target: 2,000 BDT / Member / Month
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-slate-400">Gross:</span>
              <span className="font-semibold text-slate-100">{formatCurrency(grossTotal, project.symbol)}</span>
            </div>
            {project.totalCombinedBankCharge ? (
              <>
                <span className="text-slate-700">·</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <span>Charge:</span>
                  <span className="font-bold">-{formatCurrency(project.totalCombinedBankCharge, project.symbol)}</span>
                </div>
              </>
            ) : null}
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-emerald-400 font-medium">Net Treasury:</span>
              <span className="font-semibold text-emerald-300">{formatCurrency(netTotal, project.symbol)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30 shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white font-sans truncate">
                {project.initiativeName}
              </h1>
              <span className="hidden sm:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded shrink-0">
                11 Members
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              Deposit Tracking & Member Ledger Portal
            </p>
          </div>
        </div>

        {/* Tab Links (Hidden on small mobile screens where bottom bar is used) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Public Deposit Submission Google Form Button */}
          <button
            onClick={onOpenDepositForm}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Open Google Form for Submitting Deposits & Get Shareable Link"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deposit Form</span>
            <span className="sm:hidden font-medium">Deposit</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-700 font-mono hidden md:inline">
              Share
            </span>
          </button>

          {/* Admin Pending Approvals Queue Button */}
          {session.role === 'admin' && pendingApprovalsCount > 0 && onOpenApprovalsQueue && (
            <button
              onClick={onOpenApprovalsQueue}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer animate-pulse shadow-md"
              title={`${pendingApprovalsCount} Deposit Submissions Awaiting Verification`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Approvals</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono">
                {pendingApprovalsCount}
              </span>
            </button>
          )}

          {/* Admin Maintenance Mode Control */}
          {session.role === 'admin' && onOpenMaintenanceModal && (
            <button
              onClick={onOpenMaintenanceModal}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                project.isMaintenanceMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500 hover:text-slate-950 font-bold animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Configure or Toggle System Maintenance Mode"
            >
              {project.isMaintenanceMode ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Maintenance ON</span>
                  <span className="sm:hidden">Maint</span>
                </>
              ) : (
                <>
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline">Maintenance</span>
                </>
              )}
            </button>
          )}

          {/* Theme Mode Toggle (Light / Dark) */}
          <button
            onClick={onToggleThemeMode}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme mode"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-400" />
            )}
          </button>

          {session.isLoggedIn ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 border border-slate-800 pl-1.5 sm:pl-2 pr-2 sm:pr-3 py-1 sm:py-1.5 rounded-xl">
              {activeMember?.avatar ? (
                <img
                  src={activeMember.avatar}
                  alt={session.memberName}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
                />
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-white">
                  {session.memberName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left text-xs">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-medium text-slate-100 max-w-[75px] sm:max-w-[120px] truncate">
                    {session.memberName?.split(' ')[0] || session.memberName}
                  </span>
                  {session.role === 'admin' ? (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1 py-0.2 rounded border border-emerald-800">
                      ADMIN
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] text-slate-400 truncate hidden sm:block max-w-[120px]">
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
