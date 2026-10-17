import React, { useState, useEffect } from 'react';
import { Member, Transaction, PaymentMethod, TransactionStatus, PlotProject } from '../types';
import { formatCurrency } from '../services/storageService';
import { X, Check, DollarSign, Calendar, FileText, Landmark, Hash, AlertCircle, Edit2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Partial<Transaction>) => void;
  members: Member[];
  project: PlotProject;
  editingTransaction?: Transaction | null;
  adminName?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  project,
  editingTransaction,
  adminName = 'Md. Minhazul Islam Abir'
}) => {
  const [memberId, setMemberId] = useState<string>(members[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(2000);
  const [deductionOrFee, setDeductionOrFee] = useState<number>(0); // Fee removed by default
  const [netAmount, setNetAmount] = useState<number>(2000); // Fully editable net balance!
  const [isManualNetOverride, setIsManualNetOverride] = useState<boolean>(false);
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [depositBank, setDepositBank] = useState<string>('The City Bank PLC');
  const [depositAccountNumber, setDepositAccountNumber] = useState<string>('1781580054174');
  const [bankOrChannel, setBankOrChannel] = useState<string>('The City Bank PLC');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [monthPeriod, setMonthPeriod] = useState<string>('October 2026');
  const [status, setStatus] = useState<TransactionStatus>('Verified');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingTransaction) {
      setMemberId(editingTransaction.memberId);
      setDate(editingTransaction.date);
      setAmount(editingTransaction.amount);
      setDeductionOrFee(editingTransaction.deductionOrFee || 0);
      setNetAmount(editingTransaction.netAmount !== undefined ? editingTransaction.netAmount : editingTransaction.amount);
      setIsManualNetOverride(editingTransaction.manualNetOverride || false);
      setMethod(editingTransaction.method);
      setDepositBank(editingTransaction.depositBank || project.bankDetails?.bankName || 'The City Bank PLC');
      setDepositAccountNumber(editingTransaction.depositAccountNumber || project.bankDetails?.accountNumber || '1781580054174');
      setBankOrChannel(editingTransaction.bankOrChannel || 'The City Bank PLC');
      setReferenceNumber(editingTransaction.referenceNumber);
      setMonthPeriod(editingTransaction.monthPeriod);
      setStatus(editingTransaction.status);
      setNotes(editingTransaction.notes || '');
    } else {
      // Default new transaction values (2000 BDT, 0 fee)
      setMemberId(members[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setAmount(2000);
      setDeductionOrFee(0);
      setNetAmount(2000);
      setIsManualNetOverride(false);
      setMethod('Bank Transfer');
      setDepositBank(project.bankDetails?.bankName || 'The City Bank PLC');
      setDepositAccountNumber(project.bankDetails?.accountNumber || '1781580054174');
      setBankOrChannel('The City Bank PLC');
      setReferenceNumber(`CITY-TX-${Date.now().toString().slice(-6)}`);
      setMonthPeriod('October 2026');
      setStatus('Verified');
      setNotes('Monthly contribution deposit (2,000 BDT)');
    }
    setError('');
  }, [editingTransaction, isOpen, members, project]);

  if (!isOpen) return null;

  // Handle amount change
  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    setNetAmount(newAmount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) {
      setError('Please select a member.');
      return;
    }
    if (!amount || amount <= 0) {
      setError('Deposit amount must be greater than zero.');
      return;
    }
    if (!referenceNumber.trim()) {
      setError('Please enter a transaction reference or slip number.');
      return;
    }

    const selectedMember = members.find(m => m.id === memberId);

    const payload: Partial<Transaction> = {
      memberId,
      memberName: selectedMember?.name || 'Unknown Member',
      date,
      amount: Number(amount),
      deductionOrFee: Number(deductionOrFee) || 0,
      netAmount: Number(netAmount),
      manualNetOverride: isManualNetOverride,
      method,
      depositBank: depositBank.trim() || 'The City Bank PLC',
      depositAccountNumber: depositAccountNumber.trim() || '1781580054174',
      bankOrChannel,
      referenceNumber: referenceNumber.trim(),
      monthPeriod,
      status,
      notes,
      updatedAt: new Date().toISOString(),
      editedBy: adminName
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-white">
              {editingTransaction ? 'Edit Deposit (Admin)' : 'Record New Deposit'}
            </h3>
            <p className="text-xs text-slate-400">
              {editingTransaction ? `Editing Ref: ${editingTransaction.referenceNumber}` : 'Record deposit with editable net balance & manual bank charges'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Participant Member (1 of 11)
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.mobile})
                </option>
              ))}
            </select>
          </div>

          {/* Default Deposit Bank & Account Number for Deposit */}
          <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wide flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                Deposit Bank & Account
              </span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                Default Account
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">
                  Default Bank
                </label>
                <input
                  type="text"
                  value={depositBank}
                  onChange={(e) => {
                    setDepositBank(e.target.value);
                    if (bankOrChannel === 'The City Bank PLC' || !bankOrChannel) {
                      setBankOrChannel(e.target.value);
                    }
                  }}
                  placeholder="The City Bank PLC"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-medium mb-1">
                  Account Number for Deposit
                </label>
                <input
                  type="text"
                  value={depositAccountNumber}
                  onChange={(e) => setDepositAccountNumber(e.target.value)}
                  placeholder="1781580054174"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
            <p className="text-[10px] text-emerald-400/80 font-mono">
              Official: The City Bank PLC · Deposit Acc: 1781580054174
            </p>
          </div>

          {/* Deposit Amount (100% Credited to Member Ledger) */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Deposit Amount ({project.symbol})
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                100% Credited: {formatCurrency(amount, project.symbol)}
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="2000"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Bank & service charges are maintained separately on total combined balance. No deduction is made from member ledger.
            </p>
          </div>

          {/* Date & Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Deposit Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Installment Cycle / Month
              </label>
              <select
                value={monthPeriod}
                onChange={(e) => setMonthPeriod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
          </div>

          {/* Method and Channel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Payment Channel
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="bKash / MFS">bKash / MFS</option>
                <option value="Nagad">Nagad</option>
                <option value="Direct Deposit">Direct Deposit</option>
                <option value="Cheque">Cheque</option>
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Bank / Gateway Name
              </label>
              <input
                type="text"
                value={bankOrChannel}
                onChange={(e) => setBankOrChannel(e.target.value)}
                placeholder="e.g. Eastern Bank PLC, BRAC Bank"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Reference Number & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Ref / Voucher Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. CITY-TRX-2026-99"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Audit Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Verified">Verified</option>
                <option value="Cleared">Cleared</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Flagged">Flagged</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Auditor Notes / Memorandum
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirmed on joint escrow statement page 4."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Save Deposit Changes' : 'Confirm & Post Deposit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
