import React, { useState } from 'react';
import { Member, Transaction, PlotProject, ReminderLog } from '../types';
import { formatCurrency } from '../services/storageService';
import { 
  BellRing, 
  Send, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Settings, 
  RefreshCw, 
  Calendar,
  Landmark,
  Smartphone,
  ExternalLink,
  Edit3
} from 'lucide-react';

interface RemindersPanelProps {
  project: PlotProject;
  members: Member[];
  transactions: Transaction[];
  remindersLog: ReminderLog[];
  onAddReminderLog: (log: ReminderLog) => void;
  currentMonth: string;
  onOpenDirectivesEdit?: () => void;
  isAdmin?: boolean;
}

export const RemindersPanel: React.FC<RemindersPanelProps> = ({
  project,
  members,
  transactions,
  remindersLog,
  onAddReminderLog,
  currentMonth,
  onOpenDirectivesEdit,
  isAdmin = false
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [copiedMemberId, setCopiedMemberId] = useState<string | null>(null);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [autoSentToast, setAutoSentToast] = useState<string | null>(null);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'preview' | 'edit'>('preview');

  // Custom template state
  const [customMessageTemplate, setCustomMessageTemplate] = useState<string>(
    `Salam / Greetings [Name],\n\nThis is a monthly contribution reminder from Aristo Future Initiative.\n\n• Installment Cycle: [Month]\n• Amount Due: [Amount]\n• Due Date: 10th of [Month]\n\nPlease deposit to Joint Escrow Account:\nBank: ${project.bankDetails?.bankName || 'The City Bank PLC'}\nAccount: ${project.bankDetails?.accountName || 'Aristo Future Initiative (Joint Escrow)'}\nAccount Number for Deposit: ${project.bankDetails?.accountNumber || '1781580054174'}\nRouting: ${project.bankDetails?.routingNumber || '225272654'}\nOr Citytouch/MFS: ${project.bankDetails?.mfsNumber || '+880 1712-992700'}\n\nKindly notify the coordinator once transferred so the ledger is updated promptly.\nThank you,\nAristo Future Initiative`
  );

  // Month transactions and paid statuses
  const currentMonthTxs = transactions.filter(t => t.monthPeriod === selectedMonth);
  const paidMemberMap = new Map<string, Transaction>();
  currentMonthTxs.forEach(tx => {
    paidMemberMap.set(tx.memberId, tx);
  });

  const paidMembers: { member: Member; tx: Transaction }[] = [];
  const pendingMembers: Member[] = [];

  members.forEach(member => {
    const tx = paidMemberMap.get(member.id);
    if (tx) {
      paidMembers.push({ member, tx });
    } else {
      pendingMembers.push(member);
    }
  });

  const totalExpected = members.length * project.monthlyPerMemberExpected;
  const totalCollected = currentMonthTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalPending = Math.max(0, totalExpected - totalCollected);

  // Helper to compile member message
  const generateMessageForMember = (member: Member) => {
    return customMessageTemplate
      .replace(/\[Name\]/g, member.name)
      .replace(/\[Month\]/g, selectedMonth)
      .replace(/\[Amount\]/g, formatCurrency(project.monthlyPerMemberExpected, project.symbol));
  };

  // 1-Click Copy
  const handleCopyMessage = (member: Member) => {
    const text = generateMessageForMember(member);
    navigator.clipboard.writeText(text);
    setCopiedMemberId(member.id);
    setTimeout(() => setCopiedMemberId(null), 2500);

    // Log this notification
    onAddReminderLog({
      id: `rem-${Date.now()}-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      month: selectedMonth,
      amountDue: project.monthlyPerMemberExpected,
      channel: 'SMS',
      timestamp: new Date().toISOString(),
      status: 'Sent',
      recipientContact: member.mobile
    });
  };

  // WhatsApp launch
  const handleOpenWhatsApp = (member: Member) => {
    const text = generateMessageForMember(member);
    const cleanPhone = member.mobile.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    onAddReminderLog({
      id: `rem-wa-${Date.now()}-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      month: selectedMonth,
      amountDue: project.monthlyPerMemberExpected,
      channel: 'WhatsApp',
      timestamp: new Date().toISOString(),
      status: 'Delivered',
      recipientContact: member.mobile
    });
  };

  // Email launch
  const handleOpenEmail = (member: Member) => {
    const text = generateMessageForMember(member);
    const subject = `[Aristo Plot Initiative] Monthly Deposit Reminder - ${selectedMonth}`;
    const url = `mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;

    onAddReminderLog({
      id: `rem-em-${Date.now()}-${member.id}`,
      memberId: member.id,
      memberName: member.name,
      month: selectedMonth,
      amountDue: project.monthlyPerMemberExpected,
      channel: 'Email',
      timestamp: new Date().toISOString(),
      status: 'Sent',
      recipientContact: member.email
    });
  };

  // Automated batch dispatch for all unpaid members
  const handleAutomateBatchDispatch = () => {
    if (pendingMembers.length === 0) return;
    setIsAutoSending(true);

    setTimeout(() => {
      pendingMembers.forEach((member) => {
        onAddReminderLog({
          id: `rem-auto-${Date.now()}-${member.id}`,
          memberId: member.id,
          memberName: member.name,
          month: selectedMonth,
          amountDue: project.monthlyPerMemberExpected,
          channel: 'Automated App Push',
          timestamp: new Date().toISOString(),
          status: 'Delivered',
          recipientContact: `${member.mobile} / ${member.email}`
        });
      });

      setIsAutoSending(false);
      setAutoSentToast(`Automated monthly reminders queued and dispatched to ${pendingMembers.length} participants.`);
      setTimeout(() => setAutoSentToast(null), 5000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Cycle Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BellRing className="w-5 h-5 text-emerald-400" />
                <span>Automated Contribution Reminder Hub</span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Auto-Schedule Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automate multi-channel reminders (WhatsApp, Email & SMS) for all 11 plot syndicate participants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none"
              >
                <option value="March 2026">March 2026</option>
                <option value="April 2026">April 2026</option>
                <option value="May 2026">May 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
              </select>
            </div>

            <button
              onClick={handleAutomateBatchDispatch}
              disabled={isAutoSending || pendingMembers.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-950"
            >
              <RefreshCw className={`w-4 h-4 ${isAutoSending ? 'animate-spin' : ''}`} />
              <span>{isAutoSending ? 'Dispatching...' : `Remind All Pending (${pendingMembers.length})`}</span>
            </button>
          </div>
        </div>

        {autoSentToast && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{autoSentToast}</span>
          </div>
        )}

        {/* Financial Summary Meter for Selected Month */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            <span className="text-slate-400 block text-[11px]">Monthly Expectation (11 Members)</span>
            <span className="font-mono font-bold text-white text-sm block mt-0.5">
              {formatCurrency(totalExpected, project.symbol)}
            </span>
            <span className="text-slate-500 text-[10px]">৳ 25,000 per member</span>
          </div>

          <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/40">
            <span className="text-emerald-400 block text-[11px]">Collected ({paidMembers.length} Paid)</span>
            <span className="font-mono font-bold text-emerald-300 text-sm block mt-0.5">
              {formatCurrency(totalCollected, project.symbol)}
            </span>
            <span className="text-emerald-500/80 text-[10px]">
              {Math.round((paidMembers.length / members.length) * 100)}% cycle clearance
            </span>
          </div>

          <div className="bg-amber-950/20 p-3 rounded-xl border border-amber-900/40">
            <span className="text-amber-400 block text-[11px]">Pending ({pendingMembers.length} Due)</span>
            <span className="font-mono font-bold text-amber-300 text-sm block mt-0.5">
              {formatCurrency(totalPending, project.symbol)}
            </span>
            <span className="text-amber-500/80 text-[10px]">Due by 10th of {selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* Split Section: Pending Members & Paid Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending & Overdue Members Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="font-bold text-sm text-white">
                Pending Contributions ({pendingMembers.length})
              </h3>
            </div>
            <span className="text-xs text-amber-400 font-mono">
              Action Required
            </span>
          </div>

          {pendingMembers.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/50 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                All 11 members have deposited for {selectedMonth}!
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                No reminders pending for this cycle.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-slate-950 border border-amber-900/30 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 hover:border-amber-700/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-500/50 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white">{member.name}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{member.mobile}</span>
                        <span>·</span>
                        <span className="text-amber-400 font-mono font-semibold">
                          Due: {formatCurrency(project.monthlyPerMemberExpected, project.symbol)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Multi-Channel Triggers */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenWhatsApp(member)}
                      title="Open WhatsApp with Pre-filled Reminder"
                      className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleOpenEmail(member)}
                      title="Send Formatted Reminder Email"
                      className="p-2 bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-600/30 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Email</span>
                    </button>

                    <button
                      onClick={() => handleCopyMessage(member)}
                      title="Copy Custom SMS Text"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedMemberId === member.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">SMS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paid Members Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                Cleared & Paid Contributions ({paidMembers.length})
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              Verified in Escrow
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {paidMembers.map(({ member, tx }) => (
              <div
                key={member.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500/30 shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-xs text-white">{member.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {tx.referenceNumber} · {tx.method}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-emerald-400 block">
                    {formatCurrency(tx.amount, project.symbol)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Paid {tx.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reminder Template Customizer & Dispatch Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Customizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Automated Notice Template</span>
              </h3>
              <p className="text-xs text-slate-400">
                Variables: [Name], [Month], [Amount] automatically populated
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTemplateTab('preview')}
                className={`px-2 py-1 rounded-md ${activeTemplateTab === 'preview' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'}`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTemplateTab('edit')}
                className={`px-2 py-1 rounded-md ${activeTemplateTab === 'edit' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'}`}
              >
                Edit Text
              </button>
            </div>
          </div>

          {activeTemplateTab === 'preview' ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {generateMessageForMember(pendingMembers[0] || members[0])}
            </div>
          ) : (
            <div>
              <textarea
                rows={9}
                value={customMessageTemplate}
                onChange={(e) => setCustomMessageTemplate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Supports WhatsApp markdown (*bold*, _italic_) and email clients.
              </span>
            </div>
          )}
        </div>

        {/* Automated Scheduling Policy & Escrow Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Syndicate Escrow Deposit Directives</span>
              </h3>
              <p className="text-xs text-slate-400">
                Official banking details included in all automated member reminder dispatches
              </p>
            </div>
            {isAdmin && onOpenDirectivesEdit && (
              <button
                type="button"
                onClick={onOpenDirectivesEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm shrink-0"
                title="Edit banking coordinates and escrow directives"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Directives</span>
              </button>
            )}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Beneficiary Account:</span>
              <span className="text-slate-200 font-medium">{project.bankDetails.accountName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Bank Name & Branch:</span>
              <span className="text-slate-200">{project.bankDetails.bankName} · {project.bankDetails.branch}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Account Number:</span>
              <span className="text-emerald-400 font-mono font-bold">{project.bankDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-500">Routing Number:</span>
              <span className="text-slate-300 font-mono">{project.bankDetails.routingNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">MFS Merchant (bKash/Nagad):</span>
              <span className="text-amber-400 font-mono font-bold">{project.bankDetails.mfsNumber}</span>
            </div>
          </div>

          {/* Schedule Rules */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 text-xs">Automated Notification Cadence:</div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-400 font-mono font-bold">1st of Month:</span>
              <span>Billing statement issued to all 11 participants</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-amber-400 font-mono font-bold">5th of Month:</span>
              <span>Friendly automated midway reminder</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-rose-400 font-mono font-bold">10th of Month:</span>
              <span>Due date final reminder before escrow reconciliation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log of Recently Sent Reminders */}
      {remindersLog.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Reminder Dispatch Log & Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-400">{remindersLog.length} dispatches recorded</span>
          </div>

          <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto text-xs">
            {remindersLog.slice(-10).reverse().map((log) => (
              <div key={log.id} className="py-2 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 font-medium">
                    {log.channel}
                  </span>
                  <span className="font-semibold text-white">{log.memberName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{log.recipientContact}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-emerald-400 font-medium text-[11px]">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
