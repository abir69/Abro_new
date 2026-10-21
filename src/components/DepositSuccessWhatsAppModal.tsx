import React, { useState, useEffect } from 'react';
import { Transaction, Member, PlotProject } from '../types';
import { formatCurrency, formatDate, formatWhatsAppPhone, generateDepositCongratsMessage } from '../services/storageService';
import { 
  X, 
  CheckCircle2, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Receipt, 
  Smartphone, 
  User, 
  Calendar, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DepositSuccessWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  member: Member | null;
  project: PlotProject;
  onViewReceipt?: (tx: Transaction) => void;
  onAddReminderLog?: (log: any) => void;
}

export const DepositSuccessWhatsAppModal: React.FC<DepositSuccessWhatsAppModalProps> = ({
  isOpen,
  onClose,
  transaction,
  member,
  project,
  onViewReceipt,
  onAddReminderLog
}) => {
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (transaction && member) {
      const depositBank = transaction.depositBank || project.bankDetails?.bankName || 'The City Bank PLC';
      const depositAccountNumber = transaction.depositAccountNumber || project.bankDetails?.accountNumber || '1781580054174';
      const msg = generateDepositCongratsMessage(
        member.name,
        transaction.amount,
        transaction.monthPeriod,
        transaction.referenceNumber,
        transaction.bankOrChannel || transaction.method,
        transaction.date,
        project.symbol,
        depositBank,
        depositAccountNumber
      );
      setCustomMessage(msg);
      setIsCopied(false);
    }
  }, [transaction, member, project]);

  if (!isOpen || !transaction || !member) return null;

  const cleanPhone = formatWhatsAppPhone(member.mobile);
  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleWhatsAppClick = () => {
    if (onAddReminderLog) {
      onAddReminderLog({
        id: `rem-wa-${Date.now()}-${member.id}`,
        memberId: member.id,
        memberName: member.name,
        month: transaction.monthPeriod,
        amountDue: transaction.amount,
        channel: 'WhatsApp Congratulations',
        timestamp: new Date().toISOString(),
        status: 'Delivered',
        recipientContact: member.mobile
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Top Celebration Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                    Deposit Verified
                  </span>
                  <span className="text-[11px] text-emerald-100 font-mono">
                    {formatDate(transaction.date)}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-tight mt-0.5">
                  Congratulations Deposit Received! 🎉
                </h2>
                <p className="text-xs text-emerald-100">
                  Send instant WhatsApp acknowledgment to {member.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/60 hover:border-rose-300 transition-all cursor-pointer shadow-sm flex items-center gap-1 font-semibold text-xs shrink-0 ml-1"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span className="font-bold text-xs">Close</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Member Card Summary */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/50"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-950 text-emerald-300 ring-2 ring-emerald-500/50 flex items-center justify-center font-bold text-base">
                  {member.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{member.name}</h3>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {member.role.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  <span>{member.mobile}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Credited Amount</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {formatCurrency(transaction.amount, project.symbol)}
              </span>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Cycle Month</span>
              <span className="text-white font-medium">{transaction.monthPeriod}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Reference ID</span>
              <span className="text-emerald-400 font-bold truncate block">{transaction.referenceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Channel</span>
              <span className="text-slate-300 truncate block">{transaction.bankOrChannel || transaction.method}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Deposit Bank</span>
              <span className="text-white font-medium truncate block">{transaction.depositBank || 'The City Bank PLC'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-500 block uppercase font-sans">Deposit Account Number</span>
              <span className="text-emerald-400 font-bold tracking-wider block">{transaction.depositAccountNumber || '1781580054174'}</span>
            </div>
          </div>

          {/* WhatsApp Message Composer / Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                <span>WhatsApp Message Preview (Editable)</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none selection:bg-emerald-800"
                placeholder="Write custom message to member..."
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-mono bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
                wa.me/{cleanPhone}
              </div>
            </div>
          </div>

          {/* Notice info */}
          <div className="bg-emerald-950/25 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              Clicking <strong>Send on WhatsApp</strong> opens WhatsApp Web or App with this personalized congratulations note preloaded for <strong>{member.name}</strong> ({member.mobile}).
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onViewReceipt && (
              <button
                onClick={() => {
                  onClose();
                  onViewReceipt(transaction);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Receipt</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Done
            </button>

            {/* Direct WhatsApp Link Button */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-950 hover:shadow-emerald-900"
            >
              {/* WhatsApp SVG Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
              </svg>
              <span>Send WhatsApp Congratulation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
