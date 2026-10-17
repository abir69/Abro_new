import React, { useState } from 'react';
import { Member, Transaction, PlotProject } from '../types';
import { formatCurrency, calculateMemberDueSummary } from '../services/storageService';
import { 
  Users, 
  Search, 
  Edit3, 
  Mail, 
  Phone, 
  Heart, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send,
  AlertTriangle,
  Eye,
  ShieldCheck,
  FileSpreadsheet,
  Lock
} from 'lucide-react';

interface MembersDirectoryProps {
  members: Member[];
  transactions: Transaction[];
  project: PlotProject;
  currentMonth: string;
  isAdmin: boolean;
  currentMemberId?: string;
  onSelectMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onViewMemberStatement: (member: Member) => void;
  onSendMemberReminder: (member: Member) => void;
  onOpenDepositForm?: (memberId?: string) => void;
}

export const MembersDirectory: React.FC<MembersDirectoryProps> = ({
  members,
  transactions,
  project,
  currentMonth,
  isAdmin,
  currentMemberId,
  onSelectMember,
  onEditMember,
  onViewMemberStatement,
  onSendMemberReminder,
  onOpenDepositForm
}) => {
  const [search, setSearch] = useState('');

  // Paid member IDs for current month
  const currentMonthTx = transactions.filter(t => t.monthPeriod === currentMonth);
  const paidMemberIds = new Set(currentMonthTx.map(t => t.memberId));

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile.includes(search) ||
    (m.nomineeName && m.nomineeName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Directory Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>11 Initiative Participants</span>
          </h2>
          <p className="text-xs text-slate-400">
            Total member deposit ledgers, monthly control, and contact directory
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member, phone, nominee..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {onOpenDepositForm && (
            <button
              onClick={() => onOpenDepositForm()}
              className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Google Form for Submitting Deposits (Auto-selects your account)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Deposit Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => {
          const memberTxs = transactions.filter(t => t.memberId === member.id);
          const memberGross = memberTxs.reduce((sum, t) => sum + t.amount, 0);
          const isPaid = paidMemberIds.has(member.id);
          const dueSummary = calculateMemberDueSummary(member, transactions, project, currentMonth);
          const isSelf = currentMemberId === member.id;
          const canEdit = isAdmin || isSelf;

          return (
            <div
              key={member.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-all flex flex-col justify-between shadow-sm relative group ${
                isSelf ? 'border-emerald-600/60 ring-1 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Photo, Name, Role */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div 
                    onClick={() => onSelectMember(member)}
                    className="flex items-center gap-3 cursor-pointer group/title"
                    title="Click to view total transaction history & monthly deposit controls"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 group-hover/title:ring-emerald-400 shadow-md shrink-0 transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white group-hover/title:text-emerald-400 group-hover/title:underline transition-colors">
                          {member.name}
                        </h3>
                        {member.role === 'admin' ? (
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-800">
                            ADMIN
                          </span>
                        ) : isSelf ? (
                          <span className="text-[9px] bg-emerald-900/60 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-700/80">
                            YOU
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover/title:text-slate-300 block">
                        {memberTxs.length} Deposits · Click to view history
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canEdit ? (
                      <button
                        onClick={() => onEditMember(member)}
                        title={isSelf ? "Update Your Profile Details" : "Edit Member Contact & Portfolio (Admin Authority)"}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        {isSelf && <span className="text-[10px] font-semibold text-emerald-400">Edit</span>}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1 font-mono">
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>View Only</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Information & Nominee */}
                <div className="space-y-1.5 text-xs text-slate-300 mb-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email:
                    </span>
                    <span className="text-slate-200 font-medium truncate max-w-[180px]">
                      {member.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Mobile / WA:
                    </span>
                    <span className="text-slate-200 font-mono">
                      {member.mobile}
                    </span>
                  </div>

                  {/* Role-based privacy protection: Nominee and Emergency Contact visible ONLY to Admin and Self */}
                  {(() => {
                    const canViewPrivateDetails = isAdmin || currentMemberId === member.id;
                    if (canViewPrivateDetails) {
                      return (
                        <>
                          {member.nomineeName && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                              <span className="text-slate-500 flex items-center gap-1.5">
                                <Heart className="w-3.5 h-3.5 text-rose-400" />
                                Nominee:
                              </span>
                              <span className="text-slate-200 font-medium truncate max-w-[170px]">
                                {member.nomineeName} ({member.nomineeRelation})
                              </span>
                            </div>
                          )}
                          {member.emergencyContactName && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                              <span className="text-slate-500 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                Emergency:
                              </span>
                              <span className="text-slate-200 font-medium truncate max-w-[170px]" title={`${member.emergencyContactName} (${member.emergencyContactRelation || 'Contact'}) - ${member.emergencyContactPhone || ''}`}>
                                {member.emergencyContactName} ({member.emergencyContactRelation || 'Contact'})
                              </span>
                            </div>
                          )}
                        </>
                      );
                    }
                    return (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                          Nominee & Emergency:
                        </span>
                        <span className="italic">Protected (Member & Admin Only)</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Clean Financial Breakdown for Member: Total Deposited, Due Amount (March to Current Month), and Month Status */}
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase font-semibold text-slate-400 block truncate">
                      Total Deposited
                    </span>
                    <span className="font-mono font-bold text-emerald-400 text-xs block mt-0.5 truncate">
                      {formatCurrency(memberGross, project.symbol)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      {memberTxs.length} Deposits
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border transition-all ${
                    dueSummary.totalDue === 0
                      ? 'bg-slate-950/80 border-slate-800'
                      : 'bg-rose-950/30 border-rose-800/80'
                  }`}>
                    <span className="text-[9px] uppercase font-semibold text-slate-400 block truncate" title="Due Amount calculated from March to current month">
                      Due (Mar–{currentMonth.split(' ')[0].slice(0, 3)})
                    </span>
                    <span className={`font-mono font-bold text-xs block mt-0.5 truncate ${
                      dueSummary.totalDue === 0 ? 'text-emerald-400' : 'text-rose-400 font-extrabold'
                    }`}>
                      {formatCurrency(dueSummary.totalDue, project.symbol)}
                    </span>
                    <span className={`text-[9px] block truncate font-medium ${
                      dueSummary.totalDue === 0 ? 'text-emerald-400' : 'text-rose-300'
                    }`}>
                      {dueSummary.totalDue === 0 ? '✓ 0 Due' : `${dueSummary.dueMonthsCount} Mo. Due`}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase font-semibold text-slate-400 block truncate">
                      {currentMonth.split(' ')[0]} Status
                    </span>
                    <div className="mt-0.5">
                      {isPaid ? (
                        <span className="text-emerald-400 font-semibold text-xs flex items-center gap-0.5 truncate">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          Cleared
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold text-xs flex items-center gap-0.5 truncate">
                          <Clock className="w-3 h-3 shrink-0" />
                          Pending
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {formatCurrency(member.customMonthlyDeposit || project.monthlyPerMemberExpected, project.symbol)}/mo
                    </span>
                  </div>
                </div>

                {/* Due Status Audit Strip */}
                {dueSummary.totalDue > 0 ? (
                  <div className="mb-3.5 px-2.5 py-1.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-center justify-between text-xs text-rose-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="font-semibold text-[11px] truncate">
                        Due: {dueSummary.dueMonths.join(', ')}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-rose-200 shrink-0 ml-1.5">
                      {formatCurrency(dueSummary.totalDue, project.symbol)}
                    </span>
                  </div>
                ) : (
                  <div className="mb-3.5 px-2.5 py-1 bg-emerald-950/30 border border-emerald-900/60 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-[11px]">March to {currentMonth.split(' ')[0]} Cleared</span>
                    </div>
                    <span className="font-mono text-emerald-400 text-xs font-semibold">0 Due</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectMember(member)}
                  className="flex-1 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>History & Monthly</span>
                </button>

                {/* Role-based Statement Privacy: Admin can view all; Member can view ONLY their own statement */}
                {(isAdmin || currentMemberId === member.id) ? (
                  <button
                    onClick={() => onViewMemberStatement(member)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2.5 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title={isAdmin ? `Export PDF statement for ${member.name}` : "Export my official statement"}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PDF Statement</span>
                  </button>
                ) : (
                  <div
                    className="bg-slate-950/60 text-slate-500 py-1.5 px-2 rounded-xl text-[11px] font-medium border border-slate-800/80 flex items-center justify-center gap-1 cursor-not-allowed opacity-60"
                    title="Confidential: Only this member and administrators can access this statement"
                  >
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Private</span>
                  </div>
                )}

                {onOpenDepositForm && (
                  <button
                    onClick={() => onOpenDepositForm(member.id)}
                    className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white py-1.5 px-2.5 rounded-xl text-xs font-medium border border-indigo-500/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    title={`Deposit for ${member.name}`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>
                )}

                {isAdmin && !isPaid && (
                  <button
                    onClick={() => onSendMemberReminder(member)}
                    className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
                    title={`Send WhatsApp & SMS reminder for ${currentMonth}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
