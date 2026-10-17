import React, { useState, useEffect } from 'react';
import { Member, Transaction, PlotProject, PaymentMethod } from '../types';
import { formatCurrency, INITIATIVE_CYCLES } from '../services/storageService';
import { 
  X, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  AlertCircle, 
  Clock, 
  Landmark, 
  User, 
  Calendar, 
  DollarSign, 
  Receipt, 
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface GoogleFormDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  project: PlotProject;
  preselectedMemberId?: string;
  onSubmitDeposit: (txData: Partial<Transaction>) => void;
}

export const GoogleFormDepositModal: React.FC<GoogleFormDepositModalProps> = ({
  isOpen,
  onClose,
  members,
  project,
  preselectedMemberId,
  onSubmitDeposit
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    preselectedMemberId || members[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('2000');
  const [monthPeriod, setMonthPeriod] = useState<string>('October 2026');
  const [method, setMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [depositorName, setDepositorName] = useState<string>('');
  const [depositorPhone, setDepositorPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  
  // States for link copying & submission response
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedTxRef, setSubmittedTxRef] = useState<string>('');
  const [submittedMemberName, setSubmittedMemberName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (preselectedMemberId) {
      setSelectedMemberId(preselectedMemberId);
    }
  }, [preselectedMemberId]);

  if (!isOpen) return null;

  const depositBank = project.bankDetails?.bankName || 'The City Bank PLC';
  const depositAccount = project.bankDetails?.accountNumber || '1781580054174';
  const depositAccountName = project.bankDetails?.accountName || 'Aristo Future Initiative (Joint Escrow)';
  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Generate shareable link
  const currentBaseUrl = window.location.origin + window.location.pathname;
  const generalShareLink = `${currentBaseUrl}?form=deposit`;
  const memberSpecificShareLink = selectedMemberId 
    ? `${currentBaseUrl}?form=deposit&member=${selectedMemberId}`
    : generalShareLink;

  const handleCopyLink = (linkToCopy: string) => {
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Assalamu Alaikum. Please submit your monthly deposit voucher for ${project.initiativeName} using this Google Form:
${memberSpecificShareLink}

Official Initiative Bank Details:
Bank: ${depositBank}
A/C No: ${depositAccount}
A/C Name: ${depositAccountName}

Your deposit will be automatically credited to your account upon Admin approval.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setReceiptUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedMember) {
      setErrorMessage('Please select a member.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please enter a valid deposit amount.');
      return;
    }

    const generatedRef = referenceNumber.trim() 
      ? referenceNumber.trim() 
      : `CITY-FORM-${Date.now().toString().slice(-6)}`;

    const newTxPayload: Partial<Transaction> = {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      amount: numericAmount,
      deductionOrFee: 0,
      netAmount: numericAmount,
      date,
      monthPeriod,
      method,
      referenceNumber: generatedRef,
      bankOrChannel: method === 'Bank Transfer' ? depositBank : `${method} (${depositBank})`,
      depositBank,
      depositAccountNumber: depositAccount,
      status: 'Pending Review', // Crucial: Queued for Admin Verification!
      submittedVia: 'google_form',
      depositorName: depositorName.trim() || selectedMember.name,
      depositorPhone: depositorPhone.trim() || selectedMember.mobile,
      receiptUrl: receiptUrl.trim() || undefined,
      notes: notes.trim() ? `[Google Form] ${notes.trim()}` : '[Submitted via Deposit Form]',
      createdAt: new Date().toISOString()
    };

    onSubmitDeposit(newTxPayload);

    setSubmittedTxRef(generatedRef);
    setSubmittedMemberName(selectedMember.name);
    setIsSubmitted(true);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setReferenceNumber('');
    setNotes('');
    setReceiptUrl('');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-auto max-h-[94vh] flex flex-col">
        {/* Google Form Aesthetic Header Banner */}
        <div className="h-28 bg-gradient-to-r from-emerald-700 via-teal-600 to-indigo-800 relative flex items-center justify-between px-6 overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10">
            <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-emerald-200 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-400/40 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              Public Deposit Portal · Google Form
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Initiative Deposit Submission Form
            </h2>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 text-white/80 hover:text-white p-2 rounded-full hover:bg-black/20 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Shareable Link Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-300">
            <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-white">Shareable Link:</span>
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {generalShareLink}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyLink(memberSpecificShareLink)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Copy shareable link to clipboard"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Form Link'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Share via WhatsApp"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-900/60 flex-1">
          {isSubmitted ? (
            /* SUBMISSION SUCCESS CONFIRMATION (Google Form Response Recorded) */
            <div className="bg-slate-950 border border-emerald-800/80 rounded-2xl p-6 sm:p-8 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Your response has been recorded!</h3>
                <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you. Your deposit for <strong className="text-emerald-400 font-semibold">{submittedMemberName}</strong> has been automatically logged and queued for <strong className="text-white">Admin Approval</strong>.
                </p>
              </div>

              {/* Submission Summary Ticket */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-mono text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Transaction Ref:</span>
                  <span className="text-emerald-400 font-bold">{submittedTxRef}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Contribution Cycle:</span>
                  <span className="text-white">{monthPeriod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-white font-bold">{formatCurrency(parseFloat(amount) || 2000, project.symbol)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Deposit Bank:</span>
                  <span className="text-white">{depositBank}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-slate-400">Verification Status:</span>
                  <span className="bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1 font-sans font-semibold">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Pending Admin Verification
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit another response</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Done & Close Form
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form Description Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 relative border-t-4 border-t-emerald-500 space-y-3">
                <h3 className="text-base font-bold text-white">
                  Monthly Installment Deposit Portal
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Anyone (member, relative, or depositor) can submit deposit slips here. Submissions are automatically routed to the member's profile and queued for verification by Lead Admin (Md. Minhazul Islam Abir).
                </p>

                {/* Default Deposit Bank Card */}
                <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-3.5 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans">
                    <Landmark className="w-4 h-4" />
                    <span>Official Initiative Bank for Deposits</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px]">BANK NAME</span>
                      <strong className="text-white text-xs">{depositBank}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ACCOUNT NUMBER</span>
                      <strong className="text-emerald-300 text-xs tracking-wider">{depositAccount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ACCOUNT TITLE</span>
                      <span className="text-slate-200">{depositAccountName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">ROUTING & BRANCH</span>
                      <span className="text-slate-200">{project.bankDetails?.routingNumber || '225272654'} · Principal</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-rose-400 font-semibold pt-1">
                  * Indicates required question
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* QUESTION 1: Select Member */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  1. Select Syndicate Member <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Select which of the 11 initiative participants this deposit is for.
                </p>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
                  required
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.mobile}) - {m.role.toUpperCase()}
                    </option>
                  ))}
                </select>

                {selectedMember && (
                  <div className="flex items-center gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 text-xs mt-2">
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/50"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block">{selectedMember.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {selectedMember.email} · Nominee: {selectedMember.nomineeName || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* QUESTION 2: Deposit Amount */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  2. Deposit Amount (BDT) <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Standard expected contribution is 2,000 BDT. Decimals are supported (e.g. 2000.50).
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="2000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* QUESTION 3: Contribution Cycle / Month */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  3. Contribution Cycle / Month <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Which monthly cycle is being settled?
                </p>
                <select
                  value={monthPeriod}
                  onChange={(e) => setMonthPeriod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  required
                >
                  {INITIATIVE_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {cycle} {cycle === 'October 2026' ? '(Current Month)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* QUESTION 4: Payment Channel */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  4. Payment Channel & Method <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  How was the deposit remitted to The City Bank PLC?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Bank Transfer',
                    'bKash / MFS',
                    'Nagad',
                    'Direct Deposit',
                    'Cheque',
                    'Cash'
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m as PaymentMethod)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                        method === m
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUESTION 5: Transaction ID / Bank Reference */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  5. Transaction ID / Bank Deposit Slip Number <span className="text-rose-400">*</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Enter the City Bank deposit slip reference number, Citytouch TrxID, or MFS transaction ID.
                </p>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. CITY-DEP-994821 or 9K204L"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* QUESTION 6: Deposit Date */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  6. Deposit Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* QUESTION 7: Depositor Contact */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  7. Depositor Name & Mobile Number (If deposited by someone else)
                </label>
                <p className="text-[11px] text-slate-400">
                  Leave blank if the member paid directly, or provide depositor's contact info.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={depositorName}
                    onChange={(e) => setDepositorName(e.target.value)}
                    placeholder="Depositor Name (optional)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="tel"
                    value={depositorPhone}
                    onChange={(e) => setDepositorPhone(e.target.value)}
                    placeholder="Depositor Phone (optional)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* QUESTION 8: Upload Slip Proof */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  8. Attach Bank Slip Photo / Screenshot (Proof of Payment)
                </label>
                <p className="text-[11px] text-slate-400">
                  Upload an image of your bank deposit voucher, counter slip, or mobile banking confirmation.
                </p>
                
                {receiptUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-700/80 bg-slate-900 max-h-48 flex items-center justify-center p-2">
                    <img
                      src={receiptUrl}
                      alt="Slip Preview"
                      className="max-h-44 object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setReceiptUrl('')}
                      className="absolute top-2 right-2 bg-slate-950/80 hover:bg-rose-900 text-white p-1 rounded-md text-xs transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-900/50 hover:bg-slate-900">
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs text-slate-300 font-medium">Click to upload deposit voucher image</span>
                    <span className="text-[10px] text-slate-500">Supports JPG, PNG, Screenshots</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* QUESTION 9: Remarks */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-2.5">
                <label className="block text-xs font-bold text-slate-100">
                  9. Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid via The City Bank PLC Principal Branch counter"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Deposit Form</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
