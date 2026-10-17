import React, { useState, useMemo } from 'react';
import { Member, Transaction, PlotProject } from '../types';
import { formatCurrency, formatDate } from '../services/storageService';
import { 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  Plus, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  ArrowUpDown,
  Check
} from 'lucide-react';

interface LedgerTableProps {
  project: PlotProject;
  members: Member[];
  transactions: Transaction[];
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onExportCSV: () => void;
  onSelectMember?: (member: Member) => void;
  onSendWhatsAppCongrats?: (transaction: Transaction) => void;
  onOpenDepositForm?: () => void;
  onApproveTransaction?: (transaction: Transaction) => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  project,
  members,
  transactions,
  isAdmin,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
  onViewReceipt,
  onExportCSV,
  onSelectMember,
  onSendWhatsAppCongrats,
  onOpenDepositForm,
  onApproveTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'memberName'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [confirmDeleteTxId, setConfirmDeleteTxId] = useState<string | null>(null);

  // Month periods present in records
  const availableMonths = useMemo(() => {
    const set = new Set(transactions.map(t => t.monthPeriod));
    return Array.from(set).filter(Boolean);
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.bankOrChannel && tx.bankOrChannel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMember = selectedMemberFilter === 'ALL' || tx.memberId === selectedMemberFilter;
      const matchesMonth = selectedMonthFilter === 'ALL' || tx.monthPeriod === selectedMonthFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || tx.status === selectedStatusFilter;

      return matchesSearch && matchesMember && matchesMonth && matchesStatus;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      }
      if (sortField === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      if (sortField === 'memberName') {
        const comp = a.memberName.localeCompare(b.memberName);
        return sortOrder === 'desc' ? -comp : comp;
      }
      return 0;
    });
  }, [transactions, searchTerm, selectedMemberFilter, selectedMonthFilter, selectedStatusFilter, sortField, sortOrder]);

  // Calculated totals for current filter
  const filteredGross = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const filteredFees = filteredTransactions.reduce((acc, t) => acc + (t.deductionOrFee || 0), 0);
  const filteredNet = filteredTransactions.reduce((acc, t) => acc + t.netAmount, 0);

  const toggleSort = (field: 'date' | 'amount' | 'memberName') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Initiative Deposit Ledger</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-400">
                Audit trail of all 11 participant deposits, banking references, and net pool allocations
              </p>
              <span className="text-[10px] bg-emerald-950/90 text-emerald-300 font-mono font-medium px-2 py-0.5 rounded-full border border-emerald-800">
                Deposit Bank: {project.bankDetails?.bankName || 'The City Bank PLC'} · Acc: {project.bankDetails?.accountNumber || '1781580054174'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDepositForm && (
              <button
                onClick={onOpenDepositForm}
                className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Submit bank deposit voucher via Google Form"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                <span>Submit Deposit Form</span>
              </button>
            )}

            <button
              onClick={onExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Deposit</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member, ref, bank..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Member Filter */}
          <div>
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All 11 Members</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Month Period Filter */}
          <div>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Collection Cycles</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Cleared">Cleared</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Dynamic Filter Ticker */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Showing {filteredTransactions.length} of {transactions.length} records</span>
            {(selectedMemberFilter !== 'ALL' || selectedMonthFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMemberFilter('ALL');
                  setSelectedMonthFilter('ALL');
                  setSelectedStatusFilter('ALL');
                }}
                className="text-emerald-400 hover:underline text-[11px]"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div>
              <span className="text-slate-500">Filtered Gross: </span>
              <span className="font-semibold text-white">{formatCurrency(filteredGross, project.symbol)}</span>
            </div>
            <div>
              <span className="text-slate-500">Fees: </span>
              <span className="text-amber-400">{formatCurrency(filteredFees, project.symbol)}</span>
            </div>
            <div>
              <span className="text-slate-500">Filtered Net: </span>
              <span className="font-semibold text-emerald-400">{formatCurrency(filteredNet, project.symbol)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Content: Mobile Card Feed (< md) and Desktop Data Table (>= md) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Mobile View: High-Density Touch Friendly Cards */}
        <div className="md:hidden divide-y divide-slate-800/90">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactions match the selected filters.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const member = members.find(m => m.id === tx.memberId);
              return (
                <div key={tx.id} className="p-4 space-y-3 hover:bg-slate-850/40 transition-colors">
                  {/* Card Top: Member & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      onClick={() => member && onSelectMember && onSelectMember(member)}
                      className="flex items-center gap-2.5 cursor-pointer min-w-0"
                    >
                      {member?.avatar ? (
                        <img
                          src={member.avatar}
                          alt={tx.memberName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {tx.memberName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-white truncate block">
                          {tx.memberName}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 truncate">
                          <span>{formatDate(tx.date)}</span>
                          <span>·</span>
                          <span className="text-emerald-400">{tx.monthPeriod}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {tx.status === 'Verified' && (
                        <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      )}
                      {tx.status === 'Cleared' && (
                        <span className="text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-teal-400" />
                          <span>Cleared</span>
                        </span>
                      )}
                      {tx.status === 'Pending Review' && (
                        <span className="text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 text-[10px] animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {tx.status === 'Flagged' && (
                        <span className="text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Flagged</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 font-mono text-center">
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">Gross</span>
                      <span className="text-xs font-bold text-white block mt-0.5">
                        {formatCurrency(tx.amount, project.symbol)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">Fee</span>
                      <span className="text-xs text-amber-400 block mt-0.5">
                        {tx.deductionOrFee > 0 ? `-${formatCurrency(tx.deductionOrFee, project.symbol)}` : '৳ 0'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-400 block">Net Balance</span>
                      <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                        {formatCurrency(tx.netAmount !== undefined ? tx.netAmount : tx.amount, project.symbol)}
                      </span>
                    </div>
                  </div>

                  {/* Reference & Channel */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="truncate">
                      {tx.method} · {tx.depositBank || 'The City Bank PLC'}
                    </span>
                    <span className="text-slate-300 font-semibold truncate ml-2">
                      Ref: {tx.referenceNumber}
                    </span>
                  </div>

                  {/* Touch Friendly Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1 border-t border-slate-800/60">
                    {isAdmin && tx.status === 'Pending Review' && onApproveTransaction && (
                      <button
                        onClick={() => onApproveTransaction(tx)}
                        className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {isAdmin && onSendWhatsAppCongrats && (
                      <button
                        onClick={() => onSendWhatsAppCongrats(tx)}
                        className="px-2 py-1 text-xs bg-emerald-950/80 hover:bg-[#25D366] text-emerald-300 hover:text-slate-950 font-bold rounded-lg flex items-center gap-1 transition-all border border-emerald-800/80 cursor-pointer"
                      >
                        <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
                        </svg>
                        <span>WhatsApp</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewReceipt(tx)}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 border border-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Receipt</span>
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onOpenEditModal(tx)}
                          className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg flex items-center gap-1 border border-slate-700 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                          <span>Edit</span>
                        </button>

                        {confirmDeleteTxId === tx.id ? (
                          <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-700 px-2 py-0.5 rounded-lg animate-fadeIn">
                            <span className="text-[10px] text-rose-300 font-bold">Delete?</span>
                            <button
                              onClick={() => {
                                onDeleteTransaction(tx.id);
                                setConfirmDeleteTxId(null);
                              }}
                              className="text-[10px] text-white bg-rose-600 hover:bg-rose-500 px-2 py-0.5 rounded font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteTxId(null)}
                              className="text-[10px] text-slate-300 hover:text-white px-1.5 py-0.5 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteTxId(tx.id)}
                            className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-lg flex items-center gap-1 border border-slate-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
                            <span>Delete</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Data Table (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px]">
                <th 
                  onClick={() => toggleSort('date')}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('memberName')}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Participant Member</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Cycle / Month</th>
                <th 
                  onClick={() => toggleSort('amount')}
                  className="py-3.5 px-4 font-semibold text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Gross Deposited</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold text-right">Bank Charge</th>
                <th className="py-3.5 px-4 font-semibold text-right">Net Balance</th>
                <th className="py-3.5 px-4 font-semibold">Payment Channel & Ref</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const member = members.find(m => m.id === tx.memberId);
                  return (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-400">
                        {formatDate(tx.date)}
                      </td>

                      {/* Member */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div 
                          onClick={() => member && onSelectMember && onSelectMember(member)}
                          className="flex items-center gap-2.5 cursor-pointer group/mem"
                          title="Click to view total transaction history & monthly deposit controls"
                        >
                          {member?.avatar ? (
                            <img
                              src={member.avatar}
                              alt={tx.memberName}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700 group-hover/mem:ring-emerald-400 shrink-0 transition-all"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold text-xs">
                              {tx.memberName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-100 group-hover/mem:text-emerald-400 group-hover/mem:underline block transition-colors">
                              {tx.memberName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {member?.mobile || ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cycle */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-medium">
                        {tx.monthPeriod}
                      </td>

                      {/* Gross Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-white">
                        {formatCurrency(tx.amount, project.symbol)}
                      </td>

                      {/* Bank / Service Charge */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono text-amber-400 text-xs">
                        {tx.deductionOrFee > 0 ? `-${formatCurrency(tx.deductionOrFee, project.symbol)}` : '৳ 0'}
                      </td>

                      {/* Net Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(tx.netAmount !== undefined ? tx.netAmount : tx.amount, project.symbol)}
                      </td>

                      {/* Payment Method & Ref */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-200">
                              {tx.method}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono font-medium">
                              {tx.depositBank || 'The City Bank PLC'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {tx.referenceNumber}
                            {` · Acc: ${tx.depositAccountNumber || '1781580054174'}`}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.status === 'Verified' && (
                          <span className="text-emerald-400 font-medium flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        )}
                        {tx.status === 'Cleared' && (
                          <span className="text-teal-400 font-medium flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                            <span>Cleared</span>
                          </span>
                        )}
                        {tx.status === 'Pending Review' && (
                          <span className="text-amber-400 font-medium flex items-center gap-1.5 text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {tx.status === 'Flagged' && (
                          <span className="text-rose-400 font-medium flex items-center gap-1.5 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Flagged</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Admin Approve for Pending Submissions */}
                          {isAdmin && tx.status === 'Pending Review' && onApproveTransaction && (
                            <button
                              onClick={() => onApproveTransaction(tx)}
                              title="Approve and credit this pending deposit"
                              className="px-2 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Send WhatsApp Congratulation - STRICTLY ADMIN ONLY */}
                          {isAdmin && onSendWhatsAppCongrats && (
                            <button
                              onClick={() => onSendWhatsAppCongrats(tx)}
                              title={`Send WhatsApp Congratulations to ${tx.memberName}`}
                              className="px-2 py-1 text-[11px] bg-emerald-950/80 hover:bg-[#25D366] text-emerald-300 hover:text-slate-950 font-bold rounded-lg flex items-center gap-1 transition-all border border-emerald-800/80 hover:border-[#25D366] cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.087-.179.182-.077.357.101.174.452.747.969 1.208.666.593 1.228.777 1.402.864.173.087.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.563c.173.087.289.13.332.202.043.073.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.399C8.406 21.493 10.145 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.61 0-3.11-.476-4.377-1.293l-.314-.205-2.937.83.805-2.861-.219-.327C4.12 14.869 3.6 13.484 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
                              </svg>
                              <span>WhatsApp</span>
                            </button>
                          )}

                          <button
                            onClick={() => onViewReceipt(tx)}
                            title="View Receipt Slip"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => onOpenEditModal(tx)}
                                title="Edit Deposit"
                                className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg flex items-center gap-1 transition-colors font-medium border border-slate-700 hover:border-emerald-500 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3 text-emerald-400 group-hover:text-white" />
                                <span>Edit</span>
                              </button>

                              {confirmDeleteTxId === tx.id ? (
                                <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-700 px-2 py-0.5 rounded-lg animate-fadeIn">
                                  <span className="text-[10px] text-rose-300 font-bold">Delete?</span>
                                  <button
                                    onClick={() => {
                                      onDeleteTransaction(tx.id);
                                      setConfirmDeleteTxId(null);
                                    }}
                                    className="text-[10px] text-white bg-rose-600 hover:bg-rose-500 px-1.5 py-0.5 rounded font-bold cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteTxId(null)}
                                    className="text-[10px] text-slate-300 hover:text-white px-1 py-0.5 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteTxId(tx.id)}
                                  title="Delete/Void Deposit"
                                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white rounded-lg flex items-center gap-1 transition-colors font-medium border border-slate-700 hover:border-rose-500 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-400 group-hover:text-white" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
