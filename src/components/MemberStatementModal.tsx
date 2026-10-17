import React, { useState, useEffect } from 'react';
import { Member, Transaction, PlotProject } from '../types';
import { formatCurrency, formatDate, calculateMemberDueSummary } from '../services/storageService';
import { exportMemberStatementPDF, downloadMemberStatementHtml } from '../services/pdfExportService';
import { X, Printer, CheckCircle2, Building2, Edit3, Trash2, ShieldCheck, UserCheck, Calculator, AlertTriangle, Download, FileText } from 'lucide-react';

interface MemberStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  transactions: Transaction[];
  project: PlotProject;
  isAdmin?: boolean;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (txId: string) => void;
  onUpdateProject?: (updatedProject: PlotProject) => void;
}

export const MemberStatementModal: React.FC<MemberStatementModalProps> = ({
  isOpen,
  onClose,
  member,
  transactions,
  project,
  isAdmin = false,
  onEditTransaction,
  onDeleteTransaction,
  onUpdateProject
}) => {
  const [confirmDeleteTxId, setConfirmDeleteTxId] = useState<string | null>(null);

  // Edit Signatories State (Lead Admin & Syndicate Admin Name & Designation)
  const [isEditingSignatories, setIsEditingSignatories] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>(project.leadAdminName || 'Md. Minhazul Islam Abir');
  const [leadDesignation, setLeadDesignation] = useState<string>(project.leadAdminDesignation || 'Chief Administrator & Trustee');
  const [syndicateName, setSyndicateName] = useState<string>(project.syndicateAdminName || 'Dr. Tariqul Islam');
  const [syndicateDesignation, setSyndicateDesignation] = useState<string>(project.syndicateAdminDesignation || 'Syndicate Secretary & Treasury Auditor');
  const [savedToast, setSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLeadName(project.leadAdminName || 'Md. Minhazul Islam Abir');
      setLeadDesignation(project.leadAdminDesignation || 'Chief Administrator & Trustee');
      setSyndicateName(project.syndicateAdminName || 'Dr. Tariqul Islam');
      setSyndicateDesignation(project.syndicateAdminDesignation || 'Syndicate Secretary & Treasury Auditor');
      setIsEditingSignatories(false);
      setSavedToast(false);
    }
  }, [isOpen, project]);

  if (!isOpen || !member) return null;

  // Filter this member's deposits sorted chronologically for statement
  const memberTxs = transactions
    .filter(t => t.memberId === member.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const grossDeposited = memberTxs.reduce((sum, t) => sum + t.amount, 0);
  const dueSummary = calculateMemberDueSummary(member, transactions, project, 'October 2026');

  const handleExportPdf = () => {
    exportMemberStatementPDF({
      member,
      transactions,
      project,
      leadName,
      leadDesignation,
      syndicateName,
      syndicateDesignation
    });
  };

  const handleDownloadHtml = () => {
    downloadMemberStatementHtml({
      member,
      transactions,
      project,
      leadName,
      leadDesignation,
      syndicateName,
      syndicateDesignation
    });
  };

  const handleSaveSignatories = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedProject: PlotProject = {
      ...project,
      leadAdminName: leadName.trim() || 'Md. Minhazul Islam Abir',
      leadAdminDesignation: leadDesignation.trim() || 'Chief Administrator & Trustee',
      syndicateAdminName: syndicateName.trim() || 'Dr. Tariqul Islam',
      syndicateAdminDesignation: syndicateDesignation.trim() || 'Syndicate Secretary & Treasury Auditor'
    };

    if (onUpdateProject) {
      onUpdateProject(updatedProject);
    }
    setIsEditingSignatories(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div id="statement-print-modal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white print:static print:block">
      <style>{`
        @media print {
          /* Enforce ONLY showing selected member's statement in PDF/Print */
          body * {
            visibility: hidden !important;
          }
          #printable-statement,
          #printable-statement * {
            visibility: visible !important;
          }
          #printable-statement {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 20px !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: block !important;
          }
          #app-main-content,
          header,
          nav,
          main,
          footer,
          .print\\:hidden,
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[94vh] flex flex-col print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Toolbar - Hidden on Print */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-950/70 print:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-sm font-bold text-white block">Official Member Deposit Statement</span>
              <span className="text-xs text-slate-400 block">{member.name} · Selected Member Transaction Details</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Edit Lead & Syndicate Admin Button */}
            <button
              type="button"
              onClick={() => setIsEditingSignatories(!isEditingSignatories)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isEditingSignatories 
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEditingSignatories ? 'Close Admin Editor' : 'Edit Admin & Designation'}</span>
            </button>

            {/* Download Statement HTML / Offline */}
            <button
              onClick={handleDownloadHtml}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download standalone statement file for offline use"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download File</span>
            </button>

            {/* Export PDF Statement - Guaranteed Single Member Isolated Print */}
            <button
              onClick={handleExportPdf}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Generate and print/save clean single member PDF statement"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF Statement</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Edit Signatories Form Panel - Hidden on Print */}
        {isEditingSignatories && (
          <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 animate-fadeIn print:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Edit Lead Admin & Syndicate Admin Details on Statement
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSignatories(false)}
                className="text-slate-400 hover:text-slate-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSignatories} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Lead Admin Section */}
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      Lead Admin (Signatory 1)
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Lead Admin Name
                    </label>
                    <input
                      type="text"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="e.g. Md. Minhazul Islam Abir"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Lead Admin Designation
                    </label>
                    <input
                      type="text"
                      value={leadDesignation}
                      onChange={(e) => setLeadDesignation(e.target.value)}
                      placeholder="e.g. Chief Administrator & Trustee"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* 2. Syndicate Admin Section */}
                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">
                      Syndicate Admin (Signatory 2)
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Syndicate Admin Name
                    </label>
                    <input
                      type="text"
                      value={syndicateName}
                      onChange={(e) => setSyndicateName(e.target.value)}
                      placeholder="e.g. Dr. Tariqul Islam"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-medium mb-1">
                      Syndicate Admin Designation
                    </label>
                    <input
                      type="text"
                      value={syndicateDesignation}
                      onChange={(e) => setSyndicateDesignation(e.target.value)}
                      placeholder="e.g. Syndicate Secretary & Treasury Auditor"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 italic">
                  Changes will be saved and reflected on all statements and official printouts.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLeadName(project.leadAdminName || 'Md. Minhazul Islam Abir');
                      setLeadDesignation(project.leadAdminDesignation || 'Chief Administrator & Trustee');
                      setSyndicateName(project.syndicateAdminName || 'Dr. Tariqul Islam');
                      setSyndicateDesignation(project.syndicateAdminDesignation || 'Syndicate Secretary & Treasury Auditor');
                      setIsEditingSignatories(false);
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save & Update Statement</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Temporary Save Toast Notification */}
        {savedToast && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 p-2 text-center text-xs text-emerald-300 font-semibold animate-fadeIn print:hidden flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lead Admin & Syndicate Admin names and designations updated successfully!</span>
          </div>
        )}

        {/* Printable Statement Container */}
        <div id="printable-statement" className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-slate-900 print:bg-white print:p-6 print:text-black">
          {/* Statement Header */}
          <div className="border-b-2 border-emerald-500/80 print:border-black pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white print:text-black tracking-tight leading-tight">
                    {project.initiativeName}
                  </h1>
                  <span className="text-xs text-emerald-400 print:text-gray-700 font-medium">
                    11-Member Joint Trust Treasury
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-2">
                Deposit Bank: <strong className="text-white print:text-black">{project.bankDetails?.bankName || 'The City Bank PLC'}</strong> · Deposit Account: <strong className="font-mono text-emerald-400 print:text-black">{project.bankDetails?.accountNumber || '1781580054174'}</strong>
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="px-2.5 py-1 bg-emerald-950/80 print:bg-gray-100 text-emerald-300 print:text-black rounded-lg border border-emerald-800 print:border-black font-mono font-bold block mb-1">
                DEPOSIT LEDGER
              </span>
              <span className="text-slate-400 print:text-gray-600 block">Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-500 print:text-gray-500 text-[10px] font-mono block">STMT-ID: {member.id.toUpperCase()}-2026-REV</span>
            </div>
          </div>

          {/* Member Profile Details & Nominee Section */}
          <div className="bg-slate-950/60 print:bg-gray-50 p-4 rounded-xl border border-slate-800 print:border-gray-300 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500 print:ring-black"
              />
              <div>
                <span className="text-slate-400 print:text-gray-600 text-[10px] block uppercase font-semibold">Account Holder</span>
                <span className="font-bold text-white print:text-black text-sm block">{member.name}</span>
                <span className="text-slate-400 print:text-gray-700 text-[11px] font-mono block">{member.mobile}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-500 print:text-gray-600 text-[10px] block uppercase font-semibold">Account Status</span>
                <span className="font-semibold text-emerald-400 print:text-black">Active Contributor</span>
              </div>
              <div>
                <span className="text-slate-500 print:text-gray-600 text-[10px] block uppercase font-semibold">Nominee</span>
                <span className="text-slate-200 print:text-black font-medium">{member.nomineeName} ({member.nomineeRelation})</span>
              </div>
              {member.emergencyContactName && (
                <div>
                  <span className="text-slate-500 print:text-gray-600 text-[10px] block uppercase font-semibold">Emergency Contact</span>
                  <span className="text-slate-200 print:text-black font-medium">
                    {member.emergencyContactName} ({member.emergencyContactRelation || 'Contact'}) · {member.emergencyContactPhone || ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Transaction Statement Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider">
                Historical Monthly Installments
              </h3>
              <span className="text-xs text-slate-400 print:text-gray-600">
                Total Deposits: <strong className="text-white print:text-black">{memberTxs.length}</strong>
              </span>
            </div>

            <div className="border border-slate-800 print:border-black rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-black border-b border-slate-800 print:border-black">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Cycle / Month</th>
                    <th className="py-2.5 px-3 font-semibold">Channel</th>
                    <th className="py-2.5 px-3 font-semibold">Reference</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Deposit Credited</th>
                    <th className="py-2.5 px-3 font-semibold">Verification</th>
                    {isAdmin && <th className="py-2.5 px-3 font-semibold text-right print:hidden">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200 font-mono text-[11px]">
                  {memberTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                      <td className="py-2.5 px-3 text-slate-300 print:text-black font-mono text-[10px]">{formatDate(tx.date)}</td>
                      <td className="py-2.5 px-3 text-slate-200 print:text-black font-semibold font-sans">{tx.monthPeriod || 'Monthly Deposit'}</td>
                      <td className="py-2.5 px-3 text-slate-400 print:text-black font-sans">
                        <div>
                          <span className="font-medium text-slate-200 print:text-black">{tx.bankOrChannel || tx.method}</span>
                          <span className="block text-[10px] text-slate-400 print:text-gray-600 font-mono">
                            {tx.depositBank || 'The City Bank PLC'} · Acc: {tx.depositAccountNumber || '1781580054174'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 print:text-gray-700 font-mono text-[10px]">{tx.referenceNumber || 'N/A'}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 print:text-black font-bold font-mono">
                        {formatCurrency(tx.amount, project.symbol)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-400 print:bg-gray-100 print:text-black font-semibold">
                          {tx.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-right print:hidden font-sans">
                          {confirmDeleteTxId === tx.id ? (
                            <div className="flex items-center justify-end gap-1.5 animate-fadeIn">
                              <span className="text-[10px] text-rose-400 font-bold">Delete?</span>
                              <button
                                onClick={() => {
                                  if (onDeleteTransaction) onDeleteTransaction(tx.id);
                                  setConfirmDeleteTxId(null);
                                }}
                                className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmDeleteTxId(null)}
                                className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {onEditTransaction && (
                                <button
                                  onClick={() => {
                                    onClose();
                                    onEditTransaction(tx);
                                  }}
                                  title="Edit this deposit"
                                  className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteTransaction && (
                                <button
                                  onClick={() => setConfirmDeleteTxId(tx.id)}
                                  title="Delete this deposit"
                                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950/80 print:bg-gray-100 font-bold text-xs border-t-2 border-slate-700 print:border-black">
                  <tr>
                    <td colSpan={4} className="py-2.5 px-3 text-slate-300 print:text-black">
                      Total Verified Contributions
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 print:text-black">
                      {formatCurrency(grossDeposited, project.symbol)}
                    </td>
                    <td colSpan={isAdmin ? 2 : 1} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* March to Current Month (October) Due Calculation Block */}
            <div className="bg-slate-950/70 print:bg-gray-50 p-3.5 rounded-xl border border-slate-800 print:border-black/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block uppercase font-semibold">Evaluation Cycle</span>
                <span className="font-bold text-white print:text-black block text-xs mt-0.5">March to October 2026</span>
                <span className="text-[10px] text-slate-400 print:text-gray-500 font-mono block">{dueSummary.totalMonthsCount} Monthly Cycles</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block uppercase font-semibold">Required Contribution</span>
                <span className="font-bold text-white print:text-black block text-xs font-mono mt-0.5">{formatCurrency(dueSummary.totalExpected, project.symbol)}</span>
                <span className="text-[10px] text-slate-400 print:text-gray-500 block">{dueSummary.totalMonthsCount} × {formatCurrency(member.customMonthlyDeposit || project.monthlyPerMemberExpected, project.symbol)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block uppercase font-semibold">Verified Deposited</span>
                <span className="font-bold text-emerald-400 print:text-black block text-xs font-mono mt-0.5">{formatCurrency(dueSummary.totalDepositedForPeriod, project.symbol)}</span>
                <span className="text-[10px] text-emerald-400/90 print:text-gray-600 block">{dueSummary.clearedMonthsCount} of {dueSummary.totalMonthsCount} Months Cleared</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block uppercase font-semibold">Net Due Amount</span>
                <span className={`font-bold block text-xs font-mono mt-0.5 ${
                  dueSummary.totalDue === 0 ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-black font-extrabold'
                }`}>
                  {formatCurrency(dueSummary.totalDue, project.symbol)}
                </span>
                <span className={`text-[10px] font-semibold block truncate ${
                  dueSummary.totalDue === 0 ? 'text-emerald-400 print:text-black' : 'text-rose-400 print:text-black'
                }`}>
                  {dueSummary.totalDue === 0 ? '✓ Zero Due (All Cleared)' : `⚠️ Due: ${dueSummary.dueMonths.join(', ')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Central Audit & Escrow Declaration Banner */}
          <div className="p-3 bg-slate-950/70 print:bg-transparent rounded-xl border border-slate-800 print:border-black/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-black shrink-0" />
              <div>
                <span className="font-bold text-slate-200 print:text-black block text-[11px]">
                  CENTRAL ESCROW CERTIFICATION
                </span>
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">
                  All member deposits credited in full (100%). Central bank & service charges are settled manually on total combined treasury balance.
                </span>
              </div>
            </div>
            <div className="text-right shrink-0 pl-2">
              <span className="inline-block px-2 py-0.5 bg-emerald-950/80 print:bg-gray-200 text-emerald-300 print:text-black rounded border border-emerald-800 print:border-black font-mono text-[10px] font-bold">
                AUDITED & VERIFIED
              </span>
            </div>
          </div>

          {/* Institutional Signature Section: Lead Admin, Syndicate Admin, and Member */}
          <div className="pt-8 border-t border-slate-800 print:border-black grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* 1. Lead Admin Signatory */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="border-b border-slate-600 print:border-black w-48 pb-1 mb-1 text-center font-mono font-bold text-slate-200 print:text-black flex items-center justify-center gap-1.5">
                <span>{project.leadAdminName || leadName}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingSignatories(true)}
                  title="Edit Lead Admin Name & Designation"
                  className="text-slate-500 hover:text-emerald-400 transition-colors print:hidden p-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 print:text-gray-700 block text-center sm:text-left w-48 font-medium">
                {project.leadAdminDesignation || leadDesignation}
              </span>
              <span className="text-[10px] text-emerald-400 print:text-gray-600 block text-center sm:text-left w-48 font-mono">
                {project.initiativeName}
              </span>
            </div>

            {/* 2. Syndicate Admin Signatory */}
            <div className="flex flex-col items-center">
              <div className="border-b border-slate-600 print:border-black w-48 pb-1 mb-1 text-center font-mono font-bold text-slate-200 print:text-black flex items-center justify-center gap-1.5">
                <span>{project.syndicateAdminName || syndicateName}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingSignatories(true)}
                  title="Edit Syndicate Admin Name & Designation"
                  className="text-slate-500 hover:text-sky-400 transition-colors print:hidden p-0.5 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 print:text-gray-700 block text-center w-48 font-medium">
                {project.syndicateAdminDesignation || syndicateDesignation}
              </span>
              <span className="text-[10px] text-sky-400 print:text-gray-600 block text-center w-48 font-mono">
                Syndicate Treasury Board
              </span>
            </div>

            {/* 3. Member / Account Holder Signatory */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="border-b border-slate-600 print:border-black w-48 pb-1 mb-1 text-center font-mono text-slate-300 print:text-black">
                {member.name}
              </div>
              <span className="text-[10px] text-slate-400 print:text-gray-700 block text-center sm:text-right w-48 font-medium">
                Participating Contributor
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-500 block text-center sm:text-right w-48 font-mono">
                Member ID: {member.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
