import React, { useState } from 'react';
import { Transaction, Member, PlotProject } from '../types';
import { formatCurrency, formatDate } from '../services/storageService';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  Check, 
  FileText, 
  Calendar, 
  Landmark, 
  Phone, 
  User, 
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface DepositApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTransactions: Transaction[];
  members: Member[];
  project: PlotProject;
  onApproveDeposit: (transaction: Transaction) => void;
  onRejectDeposit: (transactionId: string, reason?: string) => void;
  onDeleteSubmission: (transactionId: string) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onSendWhatsAppCongrats?: (transaction: Transaction) => void;
}

export const DepositApprovalsModal: React.FC<DepositApprovalsModalProps> = ({
  isOpen,
  onClose,
  pendingTransactions,
  members,
  project,
  onApproveDeposit,
  onRejectDeposit,
  onDeleteSubmission,
  onViewReceipt,
  onSendWhatsAppCongrats
}) => {
  const [rejectingTxId, setRejectingTxId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmReject = (txId: string) => {
    onRejectDeposit(txId, rejectionReason.trim() || 'Details could not be verified with bank statement');
    setRejectingTxId(null);
    setRejectionReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Deposit Approvals Queue</h3>
                <span className="text-xs bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-800">
                  {pendingTransactions.length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verify submissions made through Google Form or public deposit vouchers before crediting to member ledgers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/50 hover:border-rose-400 transition-all cursor-pointer shadow-sm flex items-center gap-1 font-semibold text-xs shrink-0"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold text-xs">Close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {pendingTransactions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">All Deposits Verified</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There are no pending deposit submissions awaiting approval. New responses submitted via the Google Form will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTransactions.map((tx) => {
                const member = members.find(m => m.id === tx.memberId);

                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Member & Submission Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <img
                          src={member?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={tx.memberName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40 shadow shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{tx.memberName}</h4>
                            <span className="text-[10px] bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800/80 font-mono font-medium">
                              Pending Review
                            </span>
                            {tx.submittedVia === 'google_form' && (
                              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800 font-mono">
                                via Google Form
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {member?.mobile} · {member?.email}
                          </span>
                        </div>
                      </div>

                      {/* Financial info pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-sans">CYCLE</span>
                          <span className="text-white font-bold">{tx.monthPeriod}</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-sans">AMOUNT</span>
                          <span className="text-emerald-400 font-bold">{formatCurrency(tx.amount, project.symbol)}</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-sans">REFERENCE ID</span>
                          <span className="text-slate-200 truncate block">{tx.referenceNumber}</span>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-sans">CHANNEL & DATE</span>
                          <span className="text-slate-300 block text-[11px] truncate">
                            {tx.method} · {formatDate(tx.date)}
                          </span>
                        </div>
                      </div>

                      {/* Depositor & Notes */}
                      {(tx.depositorName || tx.notes) && (
                        <div className="text-[11px] text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {tx.depositorName && (
                            <span>
                              Deposited By: <strong className="text-white">{tx.depositorName}</strong> {tx.depositorPhone ? `(${tx.depositorPhone})` : ''}
                            </span>
                          )}
                          {tx.notes && (
                            <span className="text-slate-400 italic">
                              "{tx.notes}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 shrink-0">
                      {tx.receiptUrl && (
                        <button
                          onClick={() => setPreviewSlipUrl(tx.receiptUrl || null)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium flex items-center gap-1 transition-colors border border-slate-700 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Slip</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onApproveDeposit(tx)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all cursor-pointer"
                          title="Verify and credit deposit to member ledger"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Credit</span>
                        </button>

                        <button
                          onClick={() => setRejectingTxId(rejectingTxId === tx.id ? null : tx.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                          title="Reject or Flag deposit"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteSubmission(tx.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
                          title="Delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {rejectingTxId === tx.id && (
                        <div className="w-full mt-2 p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl space-y-2 text-xs">
                          <label className="block text-[11px] text-rose-300 font-semibold">
                            Reason for Rejection:
                          </label>
                          <input
                            type="text"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. TrxID not matched in City Bank statement"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setRejectingTxId(null)}
                              className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleConfirmReject(tx.id)}
                              className="px-2.5 py-1 text-[11px] bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg"
                            >
                              Confirm Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Lead Admin: <strong className="text-white font-mono">{project.leadAdminName || 'Md. Minhazul Islam Abir'}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Slip Image Fullscreen Zoom Modal */}
      {previewSlipUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
            <button
              onClick={() => setPreviewSlipUrl(null)}
              className="absolute top-3 right-3 bg-slate-950 text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewSlipUrl}
              alt="Deposit Slip Preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
