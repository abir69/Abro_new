import React from 'react';
import { Transaction, Member, PlotProject } from '../types';
import { formatCurrency, formatDate } from '../services/storageService';
import { X, Printer, CheckCircle2, Building2, ShieldCheck, Download } from 'lucide-react';

interface ReceiptVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  member?: Member;
  project: PlotProject;
  onSendWhatsAppCongrats?: (tx: Transaction) => void;
  isAdmin?: boolean;
  currentMemberId?: string;
}

export const ReceiptVoucherModal: React.FC<ReceiptVoucherModalProps> = ({
  isOpen,
  onClose,
  transaction,
  member,
  project,
  onSendWhatsAppCongrats,
  isAdmin,
  currentMemberId
}) => {
  if (!isOpen || !transaction) return null;

  // Role-based security: Admins can view/print all vouchers; regular members can ONLY view/download their own vouchers
  const isAuthorized = isAdmin || (!!currentMemberId && transaction.memberId === currentMemberId);

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Voucher Access Restricted</h3>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Data Security Policy: Syndicate members are strictly authorized to view and print/download <strong>only their own personal deposit vouchers</strong>. Financial vouchers belonging to other members are confidential.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh] text-slate-100 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 print:hidden">
          <span className="text-xs font-bold text-slate-300">Syndicate Deposit Voucher</span>
          <div className="flex items-center gap-2">
            {onSendWhatsAppCongrats && (
              <button
                onClick={() => onSendWhatsAppCongrats(transaction)}
                className="px-2.5 py-1 text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-slate-950 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Send WhatsApp congratulations to member"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Body */}
        <div className="p-6 space-y-5 bg-slate-900 text-slate-100 print:bg-white print:text-black">
          {/* Top Brand & Badge */}
          <div className="flex items-start justify-between border-b border-slate-800 print:border-black pb-4">
            <div>
              <h3 className="font-bold text-sm text-white print:text-black">
                {project.initiativeName}
              </h3>
              <p className="text-[11px] text-slate-400 print:text-gray-600">
                11-Member Joint Trust Treasury
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-mono block">Voucher No:</span>
              <span className="text-xs font-bold font-mono text-emerald-400 print:text-black block">
                {transaction.referenceNumber}
              </span>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="bg-slate-950 print:bg-gray-100 p-4 rounded-xl border border-slate-800 print:border-gray-300 text-center space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500 print:text-gray-600 block">
              Verified Gross Deposit
            </span>
            <div className="text-2xl font-bold font-mono text-white print:text-black">
              {formatCurrency(transaction.amount, project.symbol)}
            </div>
            <div className="text-xs text-emerald-400 print:text-emerald-700 font-mono flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Net Balance Credit: {formatCurrency(transaction.netAmount, project.symbol)}</span>
              {transaction.deductionOrFee > 0 && (
                <span className="text-slate-500 font-mono text-[10px]">
                  (Bank Charge: -{formatCurrency(transaction.deductionOrFee, project.symbol)})
                </span>
              )}
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs divide-y divide-slate-800/80 print:divide-gray-300">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 print:text-gray-600">Participant:</span>
              <span className="font-semibold text-white print:text-black">{transaction.memberName}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 print:text-gray-600">Deposit Date:</span>
              <span className="font-mono text-slate-200 print:text-black">{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 print:text-gray-600">Contribution Cycle:</span>
              <span className="text-slate-200 print:text-black">{transaction.monthPeriod}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 print:text-gray-600">Payment Channel:</span>
              <span className="text-slate-200 print:text-black">{transaction.method}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 print:text-gray-600">Deposit Bank:</span>
              <span className="font-semibold text-white print:text-black">
                {transaction.depositBank || project.bankDetails?.bankName || 'The City Bank PLC'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 print:text-gray-600">Account Number for Deposit:</span>
              <span className="font-mono font-bold text-emerald-400 print:text-black">
                {transaction.depositAccountNumber || project.bankDetails?.accountNumber || '1781580054174'}
              </span>
            </div>
            {transaction.bankOrChannel && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 print:text-gray-600">Bank / Gateway:</span>
                <span className="text-slate-200 print:text-black">{transaction.bankOrChannel}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400 print:text-gray-600">Verification Status:</span>
              <span className="text-emerald-400 print:text-emerald-700 font-semibold">{transaction.status}</span>
            </div>
            {transaction.notes && (
              <div className="pt-2 text-[11px] text-slate-400 print:text-gray-600 italic">
                "{transaction.notes}"
              </div>
            )}
          </div>

          {/* Signatory block */}
          <div className="pt-4 border-t border-slate-800 print:border-black flex items-center justify-between text-[11px] text-slate-400 print:text-black">
            <span>{project.leadAdminDesignation || 'Escrow Custodian'}: {project.leadAdminName || 'Md. Minhazul Islam Abir'}</span>
            <span className="text-emerald-400 print:text-black font-medium">Digitally Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
