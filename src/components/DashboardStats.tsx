import React from 'react';
import { Member, Transaction, PlotProject } from '../types';
import { formatCurrency } from '../services/storageService';
import { 
  DollarSign, 
  TrendingUp, 
  Landmark, 
  ShieldCheck, 
  PlusCircle, 
  BellRing, 
  FileSpreadsheet, 
  ArrowUpRight,
  Users,
  CheckCircle2,
  Clock,
  Edit3
} from 'lucide-react';

interface DashboardStatsProps {
  project: PlotProject;
  members: Member[];
  transactions: Transaction[];
  currentMonth: string;
  onOpenNewTransaction: () => void;
  onNavigateToTab: (tab: 'dashboard' | 'transactions' | 'members' | 'reminders') => void;
  onExportLedger: () => void;
  isAdmin: boolean;
  onSelectMember?: (member: Member) => void;
  onOpenAdjustCombinedModal?: () => void;
  onOpenDepositForm?: () => void;
  onOpenApprovalsQueue?: () => void;
  pendingApprovalsCount?: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  project,
  members,
  transactions,
  currentMonth,
  onOpenNewTransaction,
  onNavigateToTab,
  onExportLedger,
  isAdmin,
  onSelectMember,
  onOpenAdjustCombinedModal,
  onOpenDepositForm,
  onOpenApprovalsQueue,
  pendingApprovalsCount = 0
}) => {
  // Aggregate Financial Calculations (No expenses, bank charges applied to total combined balance)
  const totalGrossDeposits = transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);
  const totalCombinedBankCharge = project.totalCombinedBankCharge || 0;
  const totalCombinedNetBalance = Math.max(0, totalGrossDeposits - totalCombinedBankCharge);

  // Current Month Dues Evaluation
  const currentMonthTx = transactions.filter(tx => tx.monthPeriod === currentMonth);
  const paidMemberIds = new Set(currentMonthTx.map(tx => tx.memberId));
  const paidCount = members.filter(m => paidMemberIds.has(m.id)).length;
  const pendingMembers = members.filter(m => !paidMemberIds.has(m.id));

  // Monthly Breakdown Data for Visual Trend (March to October 2026)
  const monthsList = [
    'March 2026', 
    'April 2026', 
    'May 2026', 
    'June 2026', 
    'July 2026', 
    'August 2026', 
    'September 2026', 
    'October 2026'
  ];
  const monthlyData = monthsList.map(month => {
    const txs = transactions.filter(t => t.monthPeriod === month);
    const gross = txs.reduce((sum, t) => sum + t.amount, 0);
    return { month, gross, count: txs.length };
  });

  // Individual Member Summaries (Clean: 100% of member deposits without per-member bank charges)
  const memberSummaries = members.map(m => {
    const memberTxs = transactions.filter(t => t.memberId === m.id);
    const mGross = memberTxs.reduce((sum, t) => sum + t.amount, 0);
    const isPaidCurrentMonth = paidMemberIds.has(m.id);

    return {
      member: m,
      gross: mGross,
      isPaidCurrentMonth,
      txCount: memberTxs.length
    };
  }).sort((a, b) => b.gross - a.gross);

  return (
    <div className="space-y-6">
      {/* Executive Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Total Combined */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Gross Deposits
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatCurrency(totalGrossDeposits, project.symbol)}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{transactions.length} Verified Deposits</span>
            <span>·</span>
            <span>11 Members Combined</span>
          </div>
        </div>

        {/* KPI 2: Total Net Balance Combined */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-800/60 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Total Combined Net Balance
            </span>
            <div className="flex items-center gap-1.5">
              {isAdmin && onOpenAdjustCombinedModal && (
                <button
                  onClick={onOpenAdjustCombinedModal}
                  title="Manually adjust combined bank charges on net balance"
                  className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded-lg text-[10px] font-semibold border border-emerald-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Adjust</span>
                </button>
              )}
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 tracking-tight">
            {formatCurrency(totalCombinedNetBalance, project.symbol)}
          </div>
          <div className="mt-2 text-xs text-slate-300 flex items-center justify-between">
            <span>In Escrow · After Combined Bank Charges</span>
            {totalCombinedBankCharge > 0 && (
              <span className="text-amber-400 font-mono text-[11px]">
                -{formatCurrency(totalCombinedBankCharge, project.symbol)} charge
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Combined Bank & Service Charges */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Combined Bank & Service Charges
            </span>
            <div className="flex items-center gap-1.5">
              {isAdmin && onOpenAdjustCombinedModal && (
                <button
                  onClick={onOpenAdjustCombinedModal}
                  title="Edit Combined Bank & Service Charge"
                  className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-[10px] font-semibold border border-amber-500/40 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Charge</span>
                </button>
              )}
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tracking-tight">
            {totalCombinedBankCharge > 0 ? `-${formatCurrency(totalCombinedBankCharge, project.symbol)}` : '৳ 0'}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span className="truncate max-w-[200px]" title={project.combinedChargeNotes}>
              {project.combinedChargeNotes || 'Applied manually on combined net balance'}
            </span>
          </div>
        </div>

        {/* KPI 4: Current Month Collection Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {currentMonth} Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {paidCount} / {members.length}
            </div>
            <span className="text-xs font-mono font-medium text-emerald-400">
              {Math.round((paidCount / members.length) * 100)}% Cleared
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            {pendingMembers.length > 0 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pendingMembers.length} Overdue / Due
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                100% Cleared (All 11 Paid)
              </span>
            )}
            <button
              onClick={() => onNavigateToTab('reminders')}
              className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] underline cursor-pointer"
            >
              Reminders
            </button>
          </div>
        </div>
      </div>

      {/* Initiative Treasury & Deposit Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Initiative Treasury & Contribution Summary</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                March – October 2026 Cleared
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All 11 participating members contribute 2,000 BDT monthly. Total accumulated gross deposits: <strong className="text-white font-mono">{formatCurrency(totalGrossDeposits, project.symbol)}</strong>. Net treasury balance: <strong className="text-emerald-400 font-mono">{formatCurrency(totalCombinedNetBalance, project.symbol)}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenDepositForm && (
              <button
                onClick={onOpenDepositForm}
                className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Submit deposit voucher via Google Form or get shareable link"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                <span>Submit Deposit Form</span>
              </button>
            )}

            {isAdmin && pendingApprovalsCount > 0 && onOpenApprovalsQueue && (
              <button
                onClick={onOpenApprovalsQueue}
                className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all animate-pulse shadow-md cursor-pointer"
                title={`${pendingApprovalsCount} Submissions awaiting admin verification`}
              >
                <Clock className="w-4 h-4" />
                <span>Approvals Queue ({pendingApprovalsCount})</span>
              </button>
            )}

            {isAdmin && onOpenAdjustCombinedModal && (
              <button
                onClick={onOpenAdjustCombinedModal}
                className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Landmark className="w-4 h-4" />
                <span>Adjust Bank Charge</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={onOpenNewTransaction}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Record Deposit</span>
              </button>
            )}
            <button
              onClick={onExportLedger}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cycle Span</span>
            <span className="font-bold text-white font-mono mt-0.5 block">8 Months (Mar - Oct)</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% on schedule</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Per Member Rate</span>
            <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
              {formatCurrency(project.monthlyPerMemberExpected, project.symbol)} / month
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Clean rate (no fees)</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Combined Bank Charge</span>
            <span className="font-bold text-amber-300 font-mono mt-0.5 block">
              {totalCombinedBankCharge > 0 ? `-${formatCurrency(totalCombinedBankCharge, project.symbol)}` : '৳ 0'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">On total balance</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Next Cycle Due</span>
            <span className="font-bold text-white font-mono mt-0.5 block">November 10, 2026</span>
            <span className="text-[10px] text-slate-400 font-mono">10th of every month</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Monthly Breakdown & Member Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Trajectory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Monthly Deposit Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400">Total verified deposits across all collection cycles</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">8 Cycles Tracked</span>
          </div>

          <div className="space-y-3.5">
            {monthlyData.map((item) => {
              const maxGross = Math.max(...monthlyData.map(m => m.gross)) || 1;
              const grossBarWidth = Math.round((item.gross / maxGross) * 100);
              return (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.month}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-emerald-400 font-bold">{formatCurrency(item.gross, project.symbol)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${grossBarWidth}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                    <span>{item.count} deposits (11 members)</span>
                    <span className="text-emerald-400">Verified & Cleared</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 11 Members Contribution Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>11 Members Deposit Ledger</span>
              </h3>
              <p className="text-xs text-slate-400">Accumulated deposits per participating member</p>
            </div>
            <button
              onClick={() => onNavigateToTab('members')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[380px] overflow-y-auto pr-1">
            {memberSummaries.map(({ member, gross, isPaidCurrentMonth, txCount }, idx) => (
              <div 
                key={member.id} 
                onClick={() => onSelectMember && onSelectMember(member)}
                className="py-2.5 px-2 flex items-center justify-between gap-3 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors group"
                title="Click to view total transaction history & monthly deposit controls"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-slate-500 w-4 text-center">
                    {idx + 1}
                  </span>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-emerald-400 shrink-0 transition-all"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 group-hover:underline truncate transition-colors">
                        {member.name}
                      </span>
                      {member.role === 'admin' && (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.2 rounded border border-emerald-800 font-mono">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{member.mobile}</span>
                      <span>·</span>
                      <span>{txCount} Deposits · Click to view</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-emerald-400">
                    {formatCurrency(gross, project.symbol)}
                  </div>
                  <div className="text-[11px] flex items-center justify-end gap-1.5">
                    {isPaidCurrentMonth ? (
                      <span className="text-emerald-400 font-medium text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Oct Cleared
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium text-[10px] flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        Oct Due
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
