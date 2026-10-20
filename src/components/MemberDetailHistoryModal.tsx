import React, { useState } from 'react';
import { Member, Transaction, PlotProject, TransactionStatus } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  calculateMemberDueSummary, 
  INITIATIVE_CYCLES 
} from '../services/storageService';
import { 
  X, 
  Printer, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  Landmark, 
  Mail, 
  Phone, 
  Heart, 
  Save, 
  SlidersHorizontal,
  AlertTriangle,
  ExternalLink,
  Calculator,
  FileText,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface MemberDetailHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  transactions: Transaction[];
  project: PlotProject;
  isAdmin: boolean;
  currentMemberId?: string;
  currentMonth?: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
  onAddNewDepositForMember: (memberId: string, monthPeriod?: string, amount?: number) => void;
  onUpdateMemberMonthlyTarget: (memberId: string, targetAmount: number) => void;
  onOpenEditProfile: (member: Member) => void;
  onOpenPrintStatement: (member: Member) => void;
  onSaveTransaction?: (txData: Partial<Transaction>) => void;
  onSendWhatsAppCongrats?: (tx: Transaction) => void;
}

const ALL_CYCLES = [
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026'
];

export const MemberDetailHistoryModal: React.FC<MemberDetailHistoryModalProps> = ({
  isOpen,
  onClose,
  member,
  transactions,
  project,
  isAdmin,
  currentMemberId,
  currentMonth = 'October 2026',
  onEditTransaction,
  onDeleteTransaction,
  onAddNewDepositForMember,
  onUpdateMemberMonthlyTarget,
  onOpenEditProfile,
  onOpenPrintStatement,
  onSaveTransaction,
  onSendWhatsAppCongrats
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'monthly_control'>('history');
  const [editingTargetAmount, setEditingTargetAmount] = useState<number>(2000);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  
  // Interactive Confirmation & Inline Editing States (100% functional without window.confirm)
  const [confirmDeleteTxId, setConfirmDeleteTxId] = useState<string | null>(null);
  const [inlineEditingMonth, setInlineEditingMonth] = useState<string | null>(null);
  const [inlineEditValues, setInlineEditValues] = useState<{
    txId: string;
    amount: number;
    referenceNumber: string;
    bankOrChannel: string;
    status: TransactionStatus;
  } | null>(null);

  if (!isOpen || !member) return null;

  const effectiveCurrentMonth = currentMonth || 'October 2026';
  const currentExpectedMonthly = member.customMonthlyDeposit || project.monthlyPerMemberExpected || 2000;

  const canViewPrivateDetails = isAdmin || currentMemberId === member.id;

  // Filter this member's transactions sorted descending
  const memberTxs = transactions
    .filter(t => t.memberId === member.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Clean member calculations: No bank/service charge deduction on member
  const totalDeposited = memberTxs.reduce((sum, t) => sum + t.amount, 0);

  // Calculate Due Summary from March to Current Month across all months
  const dueSummary = calculateMemberDueSummary(member, transactions, project, effectiveCurrentMonth);

  // Map transactions by month for the monthly deposit control
  const txByMonth = new Map<string, Transaction>();
  memberTxs.forEach(t => {
    if (t.monthPeriod && !txByMonth.has(t.monthPeriod)) {
      txByMonth.set(t.monthPeriod, t);
    }
  });

  const handleSaveTarget = () => {
    onUpdateMemberMonthlyTarget(member.id, editingTargetAmount);
    setIsEditingTarget(false);
  };

  const handleStartInlineEdit = (cycleMonth: string, tx: Transaction) => {
    setInlineEditingMonth(cycleMonth);
    setInlineEditValues({
      txId: tx.id,
      amount: tx.amount,
      referenceNumber: tx.referenceNumber,
      bankOrChannel: tx.bankOrChannel || 'Eastern Bank PLC',
      status: tx.status
    });
    setConfirmDeleteTxId(null);
  };

  const handleSaveInlineEdit = () => {
    if (!inlineEditValues) return;
    const targetTx = memberTxs.find(t => t.id === inlineEditValues.txId);
    if (!targetTx) return;

    const payload: Partial<Transaction> = {
      ...targetTx,
      id: inlineEditValues.txId,
      amount: Number(inlineEditValues.amount),
      netAmount: Number(inlineEditValues.amount),
      referenceNumber: inlineEditValues.referenceNumber.trim(),
      bankOrChannel: inlineEditValues.bankOrChannel.trim(),
      status: inlineEditValues.status,
      updatedAt: new Date().toISOString()
    };

    if (onSaveTransaction) {
      onSaveTransaction(payload);
    } else {
      onEditTransaction(payload as Transaction);
    }

    setInlineEditingMonth(null);
    setInlineEditValues(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col my-auto">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3.5">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{member.name}</h3>
                {member.role === 'admin' ? (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800 font-mono">
                    ADMIN
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    PARTICIPANT
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2.5 mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {member.mobile}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  {member.email}
                </span>
                {canViewPrivateDetails ? (
                  member.nomineeName && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Heart className="w-3 h-3 text-rose-400" />
                        Nominee: {member.nomineeName} ({member.nomineeRelation})
                      </span>
                    </>
                  )
                ) : (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-500 italic">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Nominee: Protected (Private)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isAdmin || currentMemberId === member.id) ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenPrintStatement(member);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Export single member PDF statement"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF Statement</span>
              </button>
            ) : (
              <div
                className="bg-slate-950/70 border border-slate-800 text-slate-400 text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1.5"
                title="Data Security: Only this member or admin can export this statement"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Confidential</span>
              </div>
            )}

            {(isAdmin || currentMemberId === member.id) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEditProfile(member);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentMemberId === member.id ? 'Edit My Profile' : 'Edit Profile'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Scrollable Body for Member Profile */}
        <div className="overflow-y-auto flex-1 min-h-0 flex flex-col">
          {/* Emergency Contact & Privacy Protection Strip */}
          <div className="bg-slate-950/90 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            {canViewPrivateDetails ? (
              <>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">Emergency Contact:</span>
                  <span className="font-semibold text-white">
                    {member.emergencyContactName 
                      ? `${member.emergencyContactName} (${member.emergencyContactRelation || 'Emergency'}) · ${member.emergencyContactPhone || 'No Phone'}`
                      : 'Not configured'}
                  </span>
                </div>
                {member.nomineeName && (
                  <>
                    <span className="text-slate-700 hidden sm:inline">|</span>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="text-slate-400 text-[11px]">Nominee:</span>
                      <span className="font-semibold text-slate-200">
                        {member.nomineeName} ({member.nomineeRelation})
                      </span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Nominee and Emergency Contact details are protected by role privacy rules (Account Holder & Admin Only).</span>
              </div>
            )}
          </div>

          {canViewPrivateDetails && (
            <button
              onClick={() => {
                onClose();
                onOpenEditProfile(member);
              }}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
            >
              Update Emergency Details
            </button>
          )}
        </div>

        {/* Financial KPI Banner for Member (Clean: No bank charge deductions on individual member) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/80 border-b border-slate-800 text-xs">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Deposited</span>
            <span className="text-base font-bold font-mono text-emerald-400 block mt-0.5">
              {formatCurrency(totalDeposited, project.symbol)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{memberTxs.length} verified deposits</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cycle Status</span>
            <span className="text-base font-bold font-mono text-white block mt-0.5">
              {dueSummary.clearedMonthsCount} / {dueSummary.totalMonthsCount} Months
            </span>
            <span className={`text-[10px] font-semibold ${
              dueSummary.isAllCleared ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {dueSummary.isAllCleared ? 'March – Oct Cleared' : `${dueSummary.dueMonthsCount} Months Pending`}
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Monthly Target</span>
            {isEditingTarget ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={editingTargetAmount}
                  onChange={(e) => setEditingTargetAmount(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                />
                <button
                  onClick={handleSaveTarget}
                  className="p-1 bg-emerald-600 text-white rounded text-[10px] hover:bg-emerald-500"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsEditingTarget(false)}
                  className="p-1 bg-slate-800 text-slate-400 rounded text-[10px]"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-base font-bold font-mono text-white">
                  {formatCurrency(currentExpectedMonthly, project.symbol)}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingTargetAmount(currentExpectedMonthly);
                      setIsEditingTarget(true);
                    }}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                  >
                    Adjust
                  </button>
                )}
              </div>
            )}
            <span className="text-[10px] text-slate-500">Per monthly cycle</span>
          </div>

          {/* KPI 4: DUE AMOUNT (MARCH TO CURRENT MONTH) */}
          <div className={`p-3 rounded-xl border transition-all ${
            dueSummary.totalDue === 0
              ? 'bg-slate-900 border-slate-800'
              : 'bg-rose-950/40 border-rose-800'
          }`}>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block truncate" title="Due amount calculated from March to current month">
              Due Amount (March – Oct)
            </span>
            <span className={`text-base font-bold font-mono block mt-0.5 ${
              dueSummary.totalDue === 0 ? 'text-emerald-400' : 'text-rose-400 font-black'
            }`}>
              {formatCurrency(dueSummary.totalDue, project.symbol)}
            </span>
            <span className={`text-[10px] block truncate font-medium ${
              dueSummary.totalDue === 0 ? 'text-emerald-400' : 'text-rose-300'
            }`}>
              {dueSummary.totalDue === 0
                ? '✓ All 8 Months Cleared (0 Due)'
                : `⚠️ ${dueSummary.dueMonthsCount} Mo. Due (${dueSummary.dueMonths.join(', ')})`}
            </span>
          </div>
        </div>

        {/* MARCH TO CURRENT MONTH DUE AUDIT & CALCULATION BANNER */}
        <div className="bg-slate-950 border-b border-slate-800 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Due Amount Calculation (March to {effectiveCurrentMonth})</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                    {dueSummary.totalMonthsCount} Months Evaluated
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Formula: Target ({dueSummary.totalMonthsCount} × {formatCurrency(currentExpectedMonthly, project.symbol)} = {formatCurrency(dueSummary.totalExpected, project.symbol)}) − Deposited ({formatCurrency(dueSummary.totalDepositedForPeriod, project.symbol)}) = Due Amount
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {dueSummary.totalDue === 0 ? (
                <div className="px-3 py-1 bg-emerald-950/90 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-800 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>March–Oct Due: ৳ 0 (Fully Cleared)</span>
                </div>
              ) : (
                <div className="px-3 py-1 bg-rose-950/90 text-rose-300 font-bold text-xs rounded-xl border border-rose-800 flex items-center gap-1.5 shadow-sm animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Total Due: {formatCurrency(dueSummary.totalDue, project.symbol)} ({dueSummary.dueMonthsCount} Months Overdue)</span>
                </div>
              )}
            </div>
          </div>

          {/* All Months Calculation Strip (Calculate All Month from March to Current) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {dueSummary.monthlyBreakdown.map((item) => (
              <div
                key={item.month}
                className={`p-2 rounded-xl border transition-all text-center flex flex-col justify-between ${
                  item.isPaid
                    ? 'bg-slate-900/90 border-slate-800/80 hover:border-emerald-500/40'
                    : 'bg-rose-950/40 border-rose-900 hover:border-rose-700'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-200 block truncate" title={item.month}>
                    {item.month.replace(' 2026', '')}
                  </span>
                  <span className="text-[9px] text-slate-500 block font-mono">
                    Tgt: {formatCurrency(item.expected, project.symbol)}
                  </span>
                </div>

                <div className="mt-1.5 pt-1.5 border-t border-slate-800/80">
                  {item.isPaid ? (
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 font-mono block">
                        {formatCurrency(item.deposited, project.symbol)}
                      </span>
                      <span className="text-[9px] text-emerald-400/90 font-medium flex items-center justify-center gap-0.5 mt-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Cleared
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 font-mono block">
                        Due: {formatCurrency(item.due, project.symbol)}
                      </span>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => onAddNewDepositForMember(member.id, item.month, item.due || currentExpectedMonthly)}
                          className="mt-1 text-[9px] bg-rose-600 hover:bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer w-full transition-colors flex items-center justify-center gap-0.5"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Pay Due</span>
                        </button>
                      ) : (
                        <span className="text-[9px] text-rose-400 font-semibold flex items-center justify-center gap-0.5 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          Pending
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Selector (Sticky when scrolling through profile) */}
        <div className="sticky top-0 z-20 flex items-center border-y border-slate-800 bg-slate-950/95 backdrop-blur-md px-5 pt-2.5 gap-2 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Total Transaction History ({memberTxs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly_control')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'monthly_control'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manually Control Monthly Deposits</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono border border-emerald-800">
              Active Control
            </span>
          </button>
        </div>

        {/* TAB 1: TOTAL TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-5 space-y-3 flex-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>All recorded deposits for {member.name}. You can edit or delete any transaction.</span>
              {isAdmin && (
                <button
                  onClick={() => onAddNewDepositForMember(member.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Deposit</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Installment</th>
                    <th className="py-2.5 px-3">Reference No</th>
                    <th className="py-2.5 px-3">Channel / Bank</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    {isAdmin && (
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {memberTxs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        No transactions recorded for this member yet.
                      </td>
                    </tr>
                  ) : (
                    memberTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                        <td className="py-3 px-3 font-sans font-medium text-white whitespace-nowrap">
                          {tx.monthPeriod}
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-semibold whitespace-nowrap">
                          {tx.referenceNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-sans whitespace-nowrap">
                          <div>
                            <span className="font-medium text-slate-200 block">{tx.bankOrChannel || tx.method}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {tx.depositBank || 'The City Bank PLC'} · Acc: {tx.depositAccountNumber || '1781580054174'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white whitespace-nowrap">
                          {formatCurrency(tx.amount, project.symbol)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-sans">
                          <span className="text-emerald-400 font-medium text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {tx.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-3 text-right whitespace-nowrap font-sans">
                            {confirmDeleteTxId === tx.id ? (
                              <div className="flex items-center justify-end gap-1.5 animate-fadeIn">
                                <span className="text-[11px] text-rose-400 font-bold">Delete?</span>
                                <button
                                  onClick={() => {
                                    onDeleteTransaction(tx.id);
                                    setConfirmDeleteTxId(null);
                                  }}
                                  className="px-2 py-1 text-[11px] bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shadow transition-colors cursor-pointer"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteTxId(null)}
                                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {onSendWhatsAppCongrats && (
                                  <button
                                    onClick={() => onSendWhatsAppCongrats(tx)}
                                    title="Send WhatsApp congratulations message to this member"
                                    className="px-2 py-1 text-[11px] bg-emerald-950/80 hover:bg-[#25D366] text-emerald-300 hover:text-slate-950 font-bold rounded-lg flex items-center gap-1 transition-all border border-emerald-800/80 hover:border-[#25D366] cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
                                    </svg>
                                    <span>WhatsApp</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onEditTransaction(tx)}
                                  title="Edit this transaction data"
                                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg flex items-center gap-1 transition-colors font-medium border border-slate-700 hover:border-emerald-500 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-emerald-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteTxId(tx.id)}
                                  title="Delete this transaction"
                                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-lg flex items-center gap-1 transition-colors font-medium border border-slate-700 hover:border-rose-500 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-400" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MANUALLY CONTROL MONTHLY DEPOSITS */}
        {activeTab === 'monthly_control' && (
          <div className="p-4 sm:p-5 space-y-4 flex-1">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <span>Monthly Contribution Schedule & Direct Controls</span>
                </h4>
                <p className="text-slate-400 mt-0.5 text-[11px]">
                  Manually review, edit, or delete monthly deposits for {member.name}. Deleting a deposit clears the record and marks that month as pending.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                  dueSummary.totalDue === 0 
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/40 border-rose-800 text-rose-300 font-bold'
                }`}>
                  <span className="text-[11px] font-mono">March–{effectiveCurrentMonth.split(' ')[0]} Due:</span>
                  <span className="font-bold font-mono">
                    {formatCurrency(dueSummary.totalDue, project.symbol)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px]">Cycle Target:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency(currentExpectedMonthly, project.symbol)} / month
                  </span>
                </div>
              </div>
            </div>

            {/* Grid of Months */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ALL_CYCLES.map((cycleMonth) => {
                const tx = txByMonth.get(cycleMonth);
                const isPaid = !!tx;
                const isInlineEditing = inlineEditingMonth === cycleMonth && inlineEditValues;
                const isConfirmingDelete = tx && confirmDeleteTxId === tx.id;

                return (
                  <div
                    key={cycleMonth}
                    className={`p-4 rounded-xl border transition-all ${
                      isInlineEditing
                        ? 'bg-slate-950 border-emerald-500/80 shadow-lg'
                        : isConfirmingDelete
                        ? 'bg-rose-950/30 border-rose-800/80 shadow-lg'
                        : isPaid
                        ? 'bg-slate-950/70 border-emerald-900/40 hover:border-emerald-700/60'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* INLINE EDIT MODE FOR THIS MONTH */}
                    {isInlineEditing ? (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5" />
                            Editing {cycleMonth} Deposit
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (tx) onEditTransaction(tx);
                              setInlineEditingMonth(null);
                            }}
                            className="text-[11px] text-slate-400 hover:text-emerald-400 underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Full Dialog</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Amount (BDT)</label>
                            <input
                              type="number"
                              value={inlineEditValues.amount}
                              onChange={(e) => setInlineEditValues({
                                ...inlineEditValues,
                                amount: Number(e.target.value)
                              })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Status</label>
                            <select
                              value={inlineEditValues.status}
                              onChange={(e) => setInlineEditValues({
                                ...inlineEditValues,
                                status: e.target.value as TransactionStatus
                              })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Verified">Verified</option>
                              <option value="Cleared">Cleared</option>
                              <option value="Pending Review">Pending Review</option>
                              <option value="Flagged">Flagged</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Bank / Channel</label>
                            <input
                              type="text"
                              value={inlineEditValues.bankOrChannel}
                              onChange={(e) => setInlineEditValues({
                                ...inlineEditValues,
                                bankOrChannel: e.target.value
                              })}
                              placeholder="e.g. Eastern Bank PLC"
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Reference No.</label>
                            <input
                              type="text"
                              value={inlineEditValues.referenceNumber}
                              onChange={(e) => setInlineEditValues({
                                ...inlineEditValues,
                                referenceNumber: e.target.value
                              })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setInlineEditingMonth(null);
                              setInlineEditValues(null);
                            }}
                            className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveInlineEdit}
                            className="px-4 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 shadow transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    ) : isConfirmingDelete ? (
                      /* INLINE CONFIRMATION FOR DELETING THIS MONTH'S DEPOSIT */
                      <div className="space-y-2.5 animate-fadeIn">
                        <div className="flex items-start gap-2 text-rose-300 text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">
                              Delete deposit for {cycleMonth}?
                            </span>
                            <span className="text-[11px] text-rose-400/80">
                              This will remove the {formatCurrency(tx.amount, project.symbol)} record and set {cycleMonth} back to pending.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-900/50">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTxId(null)}
                            className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteTransaction(tx.id);
                              setConfirmDeleteTxId(null);
                            }}
                            className="px-3.5 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center gap-1 shadow transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Yes, Delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* REGULAR DISPLAY MODE FOR THIS MONTH */
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{cycleMonth}</span>
                            {isPaid ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/80 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Paid
                              </span>
                            ) : dueSummary.evaluatedMonths.includes(cycleMonth) ? (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.2 rounded border border-rose-800/80 flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                Overdue ({formatCurrency(currentExpectedMonthly, project.symbol)})
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                Upcoming
                              </span>
                            )}
                          </div>

                          {isPaid ? (
                            <div className="text-[11px] text-slate-400 font-mono mt-1">
                              <span className="text-white font-bold">{formatCurrency(tx.amount, project.symbol)}</span>
                              <span className="text-slate-500 block text-[10px]">
                                {tx.bankOrChannel || 'Bank Transfer'} · Ref: {tx.referenceNumber}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[11px] font-mono mt-1">
                              <span className={dueSummary.evaluatedMonths.includes(cycleMonth) ? "text-rose-400 font-bold" : "text-slate-500"}>
                                Expected: {formatCurrency(currentExpectedMonthly, project.symbol)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions for this Month */}
                        <div className="flex items-center gap-1.5">
                          {isPaid ? (
                            <>
                              {onSendWhatsAppCongrats && (
                                <button
                                  type="button"
                                  onClick={() => onSendWhatsAppCongrats(tx)}
                                  title="Send WhatsApp congratulations message"
                                  className="p-1.5 text-emerald-400 hover:text-white bg-slate-800 hover:bg-[#25D366] rounded-lg transition-all border border-slate-700 hover:border-[#25D366] cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
                                  </svg>
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleStartInlineEdit(cycleMonth, tx)}
                                  title="Edit this month's deposit"
                                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg flex items-center gap-1 transition-colors font-medium border border-slate-700 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3 text-emerald-400" />
                                  <span>Edit</span>
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteTxId(tx.id)}
                                  title="Delete this month's deposit"
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-rose-900/50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          ) : (
                            isAdmin && (
                              <button
                                type="button"
                                onClick={() => onAddNewDepositForMember(member.id, cycleMonth, currentExpectedMonthly)}
                                className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Deposit {formatCurrency(currentExpectedMonthly, project.symbol)}</span>
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
