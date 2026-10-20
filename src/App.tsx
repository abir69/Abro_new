/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Member, 
  Transaction, 
  PlotProject, 
  ReminderLog, 
  UserSession,
  ThemeMode
} from './types';
import { 
  getStoredMembers, 
  saveStoredMembers, 
  getStoredTransactions, 
  saveStoredTransactions, 
  getStoredProject, 
  saveStoredProject, 
  getStoredReminders, 
  saveStoredReminders, 
  getStoredSession, 
  saveStoredSession, 
  formatCurrency,
  getStoredTheme,
  saveStoredTheme,
  saveStoredAdminProfile,
  getStoredAdminProfile,
  applyThemeAndStyles
} from './services/storageService';

import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { LedgerTable } from './components/LedgerTable';
import { MembersDirectory } from './components/MembersDirectory';
import { RemindersPanel } from './components/RemindersPanel';
import { TransactionModal } from './components/TransactionModal';
import { EditMemberModal } from './components/EditMemberModal';
import { AuthModal } from './components/AuthModal';
import { MemberStatementModal } from './components/MemberStatementModal';
import { ReceiptVoucherModal } from './components/ReceiptVoucherModal';
import { AdjustCombinedBalanceModal } from './components/AdjustCombinedBalanceModal';
import { MemberDetailHistoryModal } from './components/MemberDetailHistoryModal';
import { DepositSuccessWhatsAppModal } from './components/DepositSuccessWhatsAppModal';
import { GoogleFormDepositModal } from './components/GoogleFormDepositModal';
import { DepositApprovalsModal } from './components/DepositApprovalsModal';
import { LoginApprovalScreen } from './components/LoginApprovalScreen';
import { AdminPanelModal } from './components/AdminPanelModal';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { MaintenanceModal } from './components/MaintenanceModal';
import { 
  initializeFirestoreDataIfEmpty,
  subscribeToMembers,
  subscribeToTransactions,
  subscribeToProject,
  subscribeToReminders,
  saveMemberToCloud,
  saveTransactionToCloud,
  deleteTransactionFromCloud,
  saveProjectToCloud,
  saveReminderToCloud
} from './services/firebase';

import { 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Building2,
  Layers,
  ReceiptText,
  UsersRound,
  BellRing,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUp,
  Settings,
  Smartphone,
  ShieldAlert,
  Plus
} from 'lucide-react';

export default function App() {
  // Primary State
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [project, setProject] = useState<PlotProject>(getStoredProject());
  const [remindersLog, setRemindersLog] = useState<ReminderLog[]>([]);
  const [session, setSession] = useState<UserSession>(getStoredSession());
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // UI Tabs & Modals (Purely deposit & member oriented)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'members' | 'reminders'>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [selectedStatementMember, setSelectedStatementMember] = useState<Member | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  const [isAdjustCombinedModalOpen, setIsAdjustCombinedModalOpen] = useState(false);

  const [isMemberHistoryModalOpen, setIsMemberHistoryModalOpen] = useState(false);
  const [selectedHistoryMember, setSelectedHistoryMember] = useState<Member | null>(null);

  // Google Form Deposit & Admin Approvals Queue Modals
  const [isGoogleFormModalOpen, setIsGoogleFormModalOpen] = useState(false);
  const [isApprovalsModalOpen, setIsApprovalsModalOpen] = useState(false);
  const [preselectedFormMemberId, setPreselectedFormMemberId] = useState<string | undefined>(undefined);

  // WhatsApp Congratulations Modal State
  const [isWhatsAppCongratsModalOpen, setIsWhatsAppCongratsModalOpen] = useState(false);
  const [whatsAppCongratsTx, setWhatsAppCongratsTx] = useState<Transaction | null>(null);
  const [whatsAppCongratsMember, setWhatsAppCongratsMember] = useState<Member | null>(null);

  // Theme & Admin Panel Customization States
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme());
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelTab, setAdminPanelTab] = useState<'appearance' | 'branding' | 'directives' | 'maintenance' | 'footer'>('appearance');

  const handleOpenAdminPanel = (tab: 'appearance' | 'branding' | 'directives' | 'maintenance' | 'footer' = 'appearance') => {
    setAdminPanelTab(tab);
    setIsAdminPanelOpen(true);
  };

  const handleToggleThemeMode = () => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    saveStoredTheme(nextMode);
    if (nextMode === 'light') {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from LocalStorage and connect real-time Firestore listeners
  useEffect(() => {
    // 0. Synchronize Theme mode class
    const storedTheme = getStoredTheme();
    if (storedTheme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
    }

    // 1. Instant local render
    const initialMembers = getStoredMembers();
    const initialTxs = getStoredTransactions();
    const initialProject = getStoredProject();
    const initialReminders = getStoredReminders();
    const initialSession = getStoredSession();

    setMembers(initialMembers);
    setTransactions(initialTxs);
    setProject(initialProject);
    setRemindersLog(initialReminders);
    setSession(initialSession);

    // Synchronize initial theme, font, and border radius to DOM
    applyThemeAndStyles(initialProject.appTheme, initialProject.fontFamily, initialProject.borderRadiusStyle);

    // 2. Check for shareable link query parameters: ?form=deposit&member=m1
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('form') === 'deposit' || searchParams.has('deposit')) {
        setIsGoogleFormModalOpen(true);
        const memberParam = searchParams.get('member');
        if (memberParam) {
          setPreselectedFormMemberId(memberParam);
        }
      }
    } catch {
      // Ignore URL parsing errors
    }

    // 3. Ensure cloud collections are seeded and connect live Firestore onSnapshot listeners
    initializeFirestoreDataIfEmpty().then(() => {
      setIsCloudSynced(true);
    });

    const unsubMembers = subscribeToMembers((liveMembers) => {
      if (liveMembers && liveMembers.length > 0) {
        setMembers(liveMembers);
        saveStoredMembers(liveMembers);
        setIsCloudSynced(true);
      }
    });

    const unsubTransactions = subscribeToTransactions((liveTxs) => {
      setTransactions(liveTxs);
      saveStoredTransactions(liveTxs);
      setIsCloudSynced(true);
    });

    const unsubProject = subscribeToProject((liveProj) => {
      if (liveProj) {
        setProject(liveProj);
        saveStoredProject(liveProj);
        applyThemeAndStyles(liveProj.appTheme, liveProj.fontFamily, liveProj.borderRadiusStyle);
        setIsCloudSynced(true);
      }
    });

    const unsubReminders = subscribeToReminders((liveReminders) => {
      setRemindersLog(liveReminders);
      saveStoredReminders(liveReminders);
    });

    return () => {
      unsubMembers();
      unsubTransactions();
      unsubProject();
      unsubReminders();
    };
  }, []);

  // Reactive synchronizer: whenever project appearance changes, update classes globally
  useEffect(() => {
    applyThemeAndStyles(project.appTheme, project.fontFamily, project.borderRadiusStyle);
  }, [project.appTheme, project.fontFamily, project.borderRadiusStyle]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Synchronize state changes to LocalStorage
  const updateMembers = (newMembers: Member[]) => {
    setMembers(newMembers);
    saveStoredMembers(newMembers);
  };

  const updateTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    saveStoredTransactions(newTransactions);
  };

  const updateReminders = (newReminders: ReminderLog[]) => {
    setRemindersLog(newReminders);
    saveStoredReminders(newReminders);
  };

  const updateSession = (newSession: UserSession) => {
    setSession(newSession);
    saveStoredSession(newSession);
  };

  // Pure Financial Calculations (Bank charges applied to combined treasury balance)
  const grossTotal = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [transactions]);

  const netTotal = useMemo(() => {
    const combinedCharge = project.totalCombinedBankCharge || 0;
    return Math.max(0, grossTotal - combinedCharge);
  }, [grossTotal, project.totalCombinedBankCharge]);

  // Pending deposits awaiting Admin Approval
  const pendingTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'Pending Review');
  }, [transactions]);

  // Current Month calculation for automated reminders
  const currentMonth = 'October 2026';
  const currentMonthTxs = transactions.filter(t => t.monthPeriod === currentMonth);
  const paidMemberIds = new Set(currentMonthTxs.map(t => t.memberId));
  const pendingRemindersCount = members.filter(m => !paidMemberIds.has(m.id)).length;

  const activeMember = members.find(m => m.id === session.memberId) || members[0];
  const isAdmin = session.role === 'admin';

  // Open WhatsApp Congratulations acknowledgment dialog
  const handleOpenWhatsAppCongrats = (tx: Transaction) => {
    const targetMember = members.find(m => m.id === tx.memberId) || null;
    setWhatsAppCongratsTx(tx);
    setWhatsAppCongratsMember(targetMember);
    setIsWhatsAppCongratsModalOpen(true);
  };

  // Transaction CRUD Handlers (Synchronized to Live Cloud Database)
  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    const targetId = txData.id || editingTransaction?.id;
    if (targetId) {
      // Update existing
      let updatedTxObj: Transaction | null = null;
      const updated = transactions.map(t => {
        if (t.id === targetId) {
          updatedTxObj = {
            ...t,
            ...txData,
            id: t.id,
            updatedAt: new Date().toISOString()
          } as Transaction;
          return updatedTxObj;
        }
        return t;
      });
      updateTransactions(updated);
      if (updatedTxObj) {
        saveTransactionToCloud(updatedTxObj).catch(err => console.error('[Firestore] Tx update error:', err));
      }
      const ref = txData.referenceNumber || editingTransaction?.referenceNumber || targetId;
      showToast(`Transaction ${ref} updated and synced live.`);
    } else {
      // Create new
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        memberId: txData.memberId || members[0].id,
        memberName: txData.memberName || members[0].name,
        date: txData.date || new Date().toISOString().split('T')[0],
        amount: txData.amount || project.monthlyPerMemberExpected,
        deductionOrFee: 0,
        netAmount: txData.amount || project.monthlyPerMemberExpected,
        method: txData.method || 'Bank Transfer',
        depositBank: txData.depositBank || project.bankDetails?.bankName || 'The City Bank PLC',
        depositAccountNumber: txData.depositAccountNumber || project.bankDetails?.accountNumber || '1781580054174',
        referenceNumber: txData.referenceNumber || `CITY-TX-${Date.now().toString().slice(-6)}`,
        bankOrChannel: txData.bankOrChannel || 'The City Bank PLC',
        monthPeriod: txData.monthPeriod || currentMonth,
        status: txData.status || 'Verified',
        notes: txData.notes || '',
        createdAt: new Date().toISOString(),
        editedBy: session.memberName
      };
      updateTransactions([newTx, ...transactions]);
      saveTransactionToCloud(newTx).catch(err => console.error('[Firestore] Tx create error:', err));
      showToast(`New deposit of ${formatCurrency(newTx.amount, project.symbol)} recorded and synced to cloud.`);

      // Automatic trigger: Launch WhatsApp congratulations acknowledgment modal right after deposit!
      const targetMember = members.find(m => m.id === newTx.memberId) || null;
      setWhatsAppCongratsTx(newTx);
      setWhatsAppCongratsMember(targetMember);
      setIsWhatsAppCongratsModalOpen(true);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    const target = transactions.find(t => t.id === transactionId);
    const updated = transactions.filter(t => t.id !== transactionId);
    updateTransactions(updated);
    deleteTransactionFromCloud(transactionId).catch(err => console.error('[Firestore] Tx delete error:', err));
    showToast(`Transaction ${target?.referenceNumber || transactionId} deleted from cloud.`);
  };

  // Open Deposit Form with automatic selection of logged-in member
  const handleOpenDepositForm = (memberIdOverride?: string) => {
    const targetId = memberIdOverride || (session.isLoggedIn && session.memberId ? session.memberId : preselectedFormMemberId || members[0]?.id);
    if (targetId) {
      setPreselectedFormMemberId(targetId);
    }
    setIsGoogleFormModalOpen(true);
  };

  // Google Form Deposit Submission Handler (Synced to Firestore for real-time Admin review across devices)
  const handleGoogleFormDepositSubmit = (txData: Partial<Transaction>) => {
    const newTx: Transaction = {
      id: `tx-form-${Date.now()}`,
      memberId: txData.memberId || members[0]?.id || 'm1',
      memberName: txData.memberName || members[0]?.name || 'Member',
      date: txData.date || new Date().toISOString().split('T')[0],
      amount: txData.amount || project.monthlyPerMemberExpected || 2000,
      deductionOrFee: 0,
      netAmount: txData.amount || project.monthlyPerMemberExpected || 2000,
      method: txData.method || 'Bank Transfer',
      depositBank: txData.depositBank || 'The City Bank PLC',
      depositAccountNumber: txData.depositAccountNumber || '1781580054174',
      referenceNumber: txData.referenceNumber || `CITY-FORM-${Date.now().toString().slice(-6)}`,
      bankOrChannel: txData.bankOrChannel || 'The City Bank PLC',
      monthPeriod: txData.monthPeriod || currentMonth,
      status: 'Pending Review', // Crucial: Awaiting Admin Approval
      notes: txData.notes || '[Google Form Deposit]',
      receiptUrl: txData.receiptUrl,
      depositorName: txData.depositorName,
      depositorPhone: txData.depositorPhone,
      submittedVia: 'google_form',
      createdAt: new Date().toISOString()
    };
    updateTransactions([newTx, ...transactions]);
    saveTransactionToCloud(newTx).catch(err => console.error('[Firestore] Form submit error:', err));
    showToast(`Deposit submitted for ${newTx.memberName}. Synced live & awaiting Admin Approval.`);
  };

  // Admin Approval for Pending Deposits (Synced live)
  const handleApproveDeposit = (tx: Transaction) => {
    const approvedTx: Transaction = {
      ...tx,
      status: 'Verified' as const,
      verifiedAt: new Date().toISOString(),
      verifiedBy: session.memberName || project.leadAdminName || 'Md. Minhazul Islam Abir'
    };
    const updated = transactions.map(t => t.id === tx.id ? approvedTx : t);
    updateTransactions(updated);
    saveTransactionToCloud(approvedTx).catch(err => console.error('[Firestore] Approve error:', err));
    showToast(`Deposit for ${tx.memberName} (${formatCurrency(tx.amount, project.symbol)}) approved and credited across all devices!`);

    // Prompt WhatsApp congratulations dialog for Admin
    const targetMember = members.find(m => m.id === tx.memberId) || null;
    setWhatsAppCongratsTx(approvedTx);
    setWhatsAppCongratsMember(targetMember);
    setIsWhatsAppCongratsModalOpen(true);
  };

  // Admin Rejection for Flagged Submissions (Synced live)
  const handleRejectDeposit = (txId: string, reason?: string) => {
    let rejectedTxObj: Transaction | null = null;
    const updated = transactions.map(t => {
      if (t.id === txId) {
        rejectedTxObj = {
          ...t,
          status: 'Flagged' as const,
          rejectionReason: reason || 'Details could not be verified with bank'
        };
        return rejectedTxObj;
      }
      return t;
    });
    updateTransactions(updated);
    if (rejectedTxObj) {
      saveTransactionToCloud(rejectedTxObj).catch(err => console.error('[Firestore] Reject error:', err));
    }
    showToast('Deposit submission rejected and flagged in live database.');
  };

  // Member Registration / Access Request Handler (Synced live)
  const handleRequestAccess = (newMember: Member) => {
    const updated = [...members, newMember];
    updateMembers(updated);
    saveMemberToCloud(newMember).catch(err => console.error('[Firestore] Member request access error:', err));
    showToast(`Access request received for ${newMember.name}. Synced to Admin live.`);
  };

  // Member CRUD Handler (Email, Mobile, Display Image, Nominee, Notes - Synced live)
  const handleSaveMember = (updatedMember: Member) => {
    const updated = members.map(m => m.id === updatedMember.id ? updatedMember : m);
    updateMembers(updated);
    saveMemberToCloud(updatedMember).catch(err => console.error('[Firestore] Save member error:', err));
    
    // If admin profile is updated, keep project lead admin, pin & contact in sync so it NEVER reverts on logout or reload
    if (updatedMember.id === 'm1' || updatedMember.role === 'admin') {
      saveStoredAdminProfile(updatedMember);
      const updatedProject: PlotProject = {
        ...project,
        leadAdminName: updatedMember.name,
        adminPin: updatedMember.pin || project.adminPin,
        supportContactEmail: updatedMember.email || project.supportContactEmail,
        supportContactPhone: updatedMember.mobile || project.supportContactPhone,
        maintenanceStartedAt: project.isMaintenanceMode ? (project.maintenanceStartedAt || new Date().toISOString()) : ''
      };
      setProject(updatedProject);
      saveStoredProject(updatedProject);
      saveProjectToCloud(updatedProject).catch(err => console.error('[Firestore] Project admin update err:', err));
    }

    // If the active user updated themselves, update session name/email too
    if (session.memberId === updatedMember.id || session.role === 'admin') {
      updateSession({
        ...session,
        memberName: updatedMember.name,
        email: updatedMember.email,
        role: updatedMember.role
      });
    }
    showToast(`Member profile for ${updatedMember.name} updated live in database.`);
  };

  // Combined Bank & Service Charge Handler (Manual adjustment on total combined net balance with decimal support)
  const handleSaveCombinedBankCharge = (charge: number, notes?: string) => {
    const updatedProject = {
      ...project,
      totalCombinedBankCharge: charge,
      combinedChargeNotes: notes || project.combinedChargeNotes,
      maintenanceStartedAt: project.isMaintenanceMode ? (project.maintenanceStartedAt || new Date().toISOString()) : ''
    };
    setProject(updatedProject);
    saveStoredProject(updatedProject);
    saveProjectToCloud(updatedProject).catch(err => console.error('[Firestore] Save project charge error:', err));
    showToast(`Combined bank charge of ${formatCurrency(charge, project.symbol)} applied live across all devices.`);
  };

  // Update Project Initiative & Statement Signatories
  const handleUpdateProject = (updatedProject: PlotProject, newAdminPin?: string) => {
    const pinToUse = (newAdminPin && newAdminPin.trim()) || (updatedProject.adminPin && updatedProject.adminPin.trim()) || project.adminPin;
    const sanitizedProject: PlotProject = {
      ...updatedProject,
      adminPin: pinToUse,
      maintenanceStartedAt: updatedProject.isMaintenanceMode 
        ? (updatedProject.maintenanceStartedAt || new Date().toISOString()) 
        : ''
    };
    setProject(sanitizedProject);
    saveStoredProject(sanitizedProject);
    saveProjectToCloud(sanitizedProject).catch(err => console.error('[Firestore] Update project error:', err));
    applyThemeAndStyles(sanitizedProject.appTheme, sanitizedProject.fontFamily, sanitizedProject.borderRadiusStyle);

    // CRITICAL: Synchronize admin member profile AND PIN so old PIN is permanently removed
    const adminMember = members.find(m => m.id === 'm1' || m.role === 'admin');
    if (adminMember) {
      const updatedAdmin: Member = {
        ...adminMember,
        pin: pinToUse || adminMember.pin || '2026',
        name: sanitizedProject.leadAdminName || adminMember.name,
        email: sanitizedProject.supportContactEmail || adminMember.email,
        mobile: sanitizedProject.supportContactPhone || adminMember.mobile
      };
      saveStoredAdminProfile(updatedAdmin);
      const updatedMembers = members.map(m => m.id === adminMember.id ? updatedAdmin : m);
      setMembers(updatedMembers);
      saveStoredMembers(updatedMembers);
      saveMemberToCloud(updatedAdmin).catch(err => console.error('[Firestore] Sync admin member error:', err));
      if (session.role === 'admin') {
        updateSession({
          ...session,
          memberName: updatedAdmin.name,
          email: updatedAdmin.email
        });
      }
    }
    showToast('Syndicate settings, styling, and admin security PIN saved successfully.');
  };

  // Dedicated Admin PIN setup handler: replaces old PIN permanently across database and storage
  const handleSaveAdminPin = (newPin: string) => {
    if (!newPin.trim()) return;
    const cleanPin = newPin.trim();
    const adminMember = members.find(m => m.id === 'm1' || m.role === 'admin');
    if (adminMember) {
      const updatedAdmin: Member = {
        ...adminMember,
        pin: cleanPin
      };
      saveStoredAdminProfile(updatedAdmin);
      const updatedMembers = members.map(m => m.id === adminMember.id ? updatedAdmin : m);
      setMembers(updatedMembers);
      saveStoredMembers(updatedMembers);
      saveMemberToCloud(updatedAdmin).catch(err => console.error('[Firestore] Update admin PIN err:', err));

      const updatedProject: PlotProject = {
        ...project,
        adminPin: cleanPin
      };
      setProject(updatedProject);
      saveStoredProject(updatedProject);
      saveProjectToCloud(updatedProject).catch(err => console.error('[Firestore] Update project PIN err:', err));

      showToast('Admin Security PIN updated successfully. Previous PIN has been permanently removed.');
    }
  };

  // Select Member & Open Total Transaction History
  const handleSelectMember = (member: Member) => {
    setSelectedHistoryMember(member);
    setIsMemberHistoryModalOpen(true);
  };

  // Add new deposit specifically for this member and selected month
  const handleAddNewDepositForMember = (memberId: string, monthPeriod?: string, amount?: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const targetMonth = monthPeriod || 'October 2026';
    const targetAmount = amount || member.customMonthlyDeposit || project.monthlyPerMemberExpected || 2000;
    
    setEditingTransaction({
      id: '',
      memberId: member.id,
      memberName: member.name,
      date: new Date().toISOString().split('T')[0],
      amount: targetAmount,
      deductionOrFee: 0,
      netAmount: targetAmount,
      method: 'Bank Transfer',
      depositBank: 'The City Bank PLC',
      depositAccountNumber: '1781580054174',
      referenceNumber: `CITY-${targetMonth.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      bankOrChannel: 'The City Bank PLC',
      monthPeriod: targetMonth,
      status: 'Verified',
      notes: `${targetMonth} monthly contribution (${targetAmount} BDT) to The City Bank PLC (Acc: 1781580054174)`,
      createdAt: new Date().toISOString()
    });
    setIsTxModalOpen(true);
  };

  // Manually update a member's expected monthly contribution target
  const handleUpdateMemberMonthlyTarget = (memberId: string, targetAmount: number) => {
    const targetMember = members.find(m => m.id === memberId);
    if (targetMember) {
      const updatedMem = { ...targetMember, customMonthlyDeposit: targetAmount };
      const updated = members.map(m => m.id === memberId ? updatedMem : m);
      updateMembers(updated);
      saveMemberToCloud(updatedMem).catch(err => console.error(err));
      showToast(`Monthly contribution target for ${targetMember.name} set to ${formatCurrency(targetAmount, project.symbol)}/month.`);
    }
  };

  // Reminders Handler
  const handleAddReminderLog = (newLog: ReminderLog) => {
    updateReminders([newLog, ...remindersLog]);
    saveReminderToCloud(newLog).catch(err => console.error('[Firestore] Save reminder error:', err));
  };

  // Statement Viewing & Downloading Handler (Requests 4 & 5: Member can only view/download their own statement)
  const handleViewMemberStatement = (targetMember: Member) => {
    if (!isAdmin && session.memberId && targetMember.id !== session.memberId) {
      showToast('Confidentiality: You are authorized to view and download only your personal statement.');
      const ownProfile = members.find(m => m.id === session.memberId);
      if (ownProfile) {
        setSelectedStatementMember(ownProfile);
        setIsStatementModalOpen(true);
      }
      return;
    }
    setSelectedStatementMember(targetMember);
    setIsStatementModalOpen(true);
  };

  // CSV Ledger Exporter with Data Confidentiality Protection
  const handleExportCSV = () => {
    if (!isAdmin) {
      if (!session.memberId) {
        showToast('Security Alert: You are not authorized to download ledger records.');
        return;
      }
      const myMember = members.find(m => m.id === session.memberId);
      const myTxs = transactions.filter(t => t.memberId === session.memberId);

      if (myTxs.length === 0) {
        showToast('No verified transaction records available for your account.');
        return;
      }

      const headers = ['Date', 'Cycle', 'Reference', 'Member Name', 'Gross Amount', 'Payment Method', 'Channel/Bank', 'Status', 'Notes'];
      const rows = myTxs.map(t => [
        t.date,
        t.monthPeriod,
        t.referenceNumber,
        `"${myMember?.name || t.memberName}"`,
        t.amount,
        t.method,
        `"${t.bankOrChannel || ''}"`,
        t.status,
        `"${t.notes || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Aristo_Personal_Statement_${(myMember?.name || 'Member').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Your personal deposit records downloaded as CSV.');
      return;
    }

    const headers = ['Date', 'Cycle', 'Reference', 'Member Name', 'Member Phone', 'Gross Amount', 'Payment Method', 'Channel/Bank', 'Status', 'Notes'];
    const rows = transactions.map(t => {
      const member = members.find(m => m.id === t.memberId);
      return [
        t.date,
        t.monthPeriod,
        t.referenceNumber,
        `"${t.memberName}"`,
        `"${member?.mobile || ''}"`,
        t.amount,
        t.method,
        `"${t.bankOrChannel || ''}"`,
        t.status,
        `"${t.notes || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aristo_Syndicate_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ledger CSV export completed.');
  };

  // Download Standalone Single-File index.html
  const handleDownloadStandaloneHtml = async () => {
    if (!isAdmin) {
      showToast('Security Alert: Only syndicate administration can export standalone bundle.');
      return;
    }
    try {
      const response = await fetch('/standalone.html');
      const htmlText = await response.text();
      const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'index.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded standalone index.html for single-file deployment.');
    } catch (err) {
      console.error(err);
      showToast('Error exporting standalone index.html');
    }
  };

  // Maintenance Mode Gatekeeper (Request 8): If maintenance mode is active and user is not admin, show maintenance screen
  if (project.isMaintenanceMode && session.role !== 'admin') {
    return (
      <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white theme-${project.appTheme || 'emerald'} font-family-${project.fontFamily || 'inter'} radius-${project.borderRadiusStyle || 'smooth'}`}>
        <MaintenanceScreen
          project={project}
          themeMode={themeMode}
          onToggleThemeMode={handleToggleThemeMode}
          onOpenAdminAuth={() => {
            setIsAuthModalOpen(true);
          }}
        />

        {/* Admin Login Modal during maintenance mode */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          members={members}
          currentSession={session}
          onLogin={updateSession}
          project={project}
        />
      </div>
    );
  }

  // Gatekeeper: Require login approval before loading the app
  if (!session.isLoggedIn) {
    return (
      <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white theme-${project.appTheme || 'emerald'} font-family-${project.fontFamily || 'inter'} radius-${project.borderRadiusStyle || 'smooth'}`}>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-[80] bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LoginApprovalScreen
          members={members}
          project={project}
          onLogin={updateSession}
          onRequestAccess={handleRequestAccess}
          onOpenDepositForm={() => handleOpenDepositForm()}
          isCloudSynced={isCloudSynced}
        />

        {/* Public Google Form Deposit Modal with Shareable Link */}
        <GoogleFormDepositModal
          isOpen={isGoogleFormModalOpen}
          onClose={() => setIsGoogleFormModalOpen(false)}
          members={members}
          project={project}
          preselectedMemberId={preselectedFormMemberId}
          onSubmitDeposit={handleGoogleFormDepositSubmit}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white theme-${project.appTheme || 'emerald'} font-family-${project.fontFamily || 'inter'} radius-${project.borderRadiusStyle || 'smooth'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[80] bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace & Navigation Shell (Completely Hidden on Print / PDF Export) */}
      <div id="app-main-content" className="flex-1 flex flex-col print:hidden">
        {/* Main App Navigation Header */}
        <Header
          project={project}
          session={session}
          activeMember={activeMember}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={() => {
            updateSession({ isLoggedIn: false, role: 'member' });
            showToast('Signed out of session. Login approval required to re-enter.');
          }}
          onEditMyProfile={() => {
            if (session.memberId) {
              const myProfile = members.find(m => m.id === session.memberId);
              if (myProfile) {
                setEditingMember(myProfile);
                setIsEditMemberModalOpen(true);
              }
            }
          }}
          onOpenApprovalsQueue={() => setIsApprovalsModalOpen(true)}
          onOpenMaintenanceModal={() => handleOpenAdminPanel('maintenance')}
          onOpenAdminPanel={() => handleOpenAdminPanel('appearance')}
          onViewMyStatement={() => {
            const myProfile = members.find(m => m.id === session.memberId);
            if (myProfile) {
              setSelectedStatementMember(myProfile);
              setIsStatementModalOpen(true);
            }
          }}
          themeMode={themeMode}
          onToggleThemeMode={handleToggleThemeMode}
          pendingApprovalsCount={pendingTransactions.length}
          grossTotal={grossTotal}
          netTotal={netTotal}
          pendingRemindersCount={pendingRemindersCount}
          isCloudSynced={isCloudSynced}
        />

        {/* Admin Maintenance Mode Active Notification Bar */}
        {project.isMaintenanceMode && session.role === 'admin' && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-300 px-4 py-2.5 text-xs font-semibold flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span>System Maintenance Mode is currently ACTIVE. Public and non-admin member access is halted.</span>
            </div>
            <button
              onClick={() => handleOpenAdminPanel('maintenance')}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Configure Maintenance
            </button>
          </div>
        )}

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6 pb-24 sm:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardStats
            project={project}
            members={members}
            transactions={transactions}
            currentMonth={currentMonth}
            onOpenNewTransaction={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onNavigateToTab={setActiveTab}
            onExportLedger={handleExportCSV}
            isAdmin={isAdmin}
            onSelectMember={handleSelectMember}
            onOpenAdjustCombinedModal={() => setIsAdjustCombinedModalOpen(true)}
            onOpenDepositForm={() => handleOpenDepositForm()}
            onOpenApprovalsQueue={() => setIsApprovalsModalOpen(true)}
            pendingApprovalsCount={pendingTransactions.length}
          />
        )}

        {activeTab === 'transactions' && (
          <LedgerTable
            project={project}
            members={members}
            transactions={transactions}
            isAdmin={isAdmin}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsTxModalOpen(true);
            }}
            onOpenEditModal={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onViewReceipt={(tx) => {
              if (!isAdmin && session.memberId && tx.memberId !== session.memberId) {
                showToast('Data Security: You are authorized to view and download only your personal deposit receipts.');
                return;
              }
              setSelectedReceiptTx(tx);
              setIsReceiptModalOpen(true);
            }}
            onExportCSV={handleExportCSV}
            onViewMemberStatement={handleViewMemberStatement}
            currentMemberId={session.memberId}
            onSelectMember={handleSelectMember}
            onSendWhatsAppCongrats={isAdmin ? handleOpenWhatsAppCongrats : undefined}
            onOpenDepositForm={() => handleOpenDepositForm()}
            onApproveTransaction={handleApproveDeposit}
          />
        )}

        {activeTab === 'members' && (
          <MembersDirectory
            members={members}
            transactions={transactions}
            project={project}
            currentMonth={currentMonth}
            isAdmin={isAdmin}
            currentMemberId={session.memberId}
            onSelectMember={handleSelectMember}
            onEditMember={(member) => {
              setEditingMember(member);
              setIsEditMemberModalOpen(true);
            }}
            onViewMemberStatement={handleViewMemberStatement}
            onSendMemberReminder={(_member) => {
              setActiveTab('reminders');
            }}
            onOpenDepositForm={handleOpenDepositForm}
          />
        )}

        {activeTab === 'reminders' && (
          isAdmin ? (
            <RemindersPanel
              project={project}
              members={members}
              transactions={transactions}
              remindersLog={remindersLog}
              onAddReminderLog={handleAddReminderLog}
              currentMonth={currentMonth}
              onOpenDirectivesEdit={() => handleOpenAdminPanel('directives')}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto my-12">
              <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-white mb-2">Admin Authority Required</h2>
              <p className="text-xs text-slate-400 mb-4">
                Automated payment reminders and dispatch logs are restricted to Syndicate Administration.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          )
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb friendly on all smartphones) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around text-[10px] shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'transactions' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>Ledger</span>
        </button>

        {/* Restored Mobile Deposit Button (Elevated Center Quick Action) */}
        <button
          onClick={() => {
            if (isAdmin) {
              setIsAddModalOpen(true);
            } else {
              handleOpenDepositForm();
            }
          }}
          className="flex flex-col items-center gap-0.5 py-0.5 px-2 rounded-lg text-emerald-400 hover:text-emerald-300 transition-transform active:scale-95 cursor-pointer"
          title={isAdmin ? "Record New Deposit" : "Submit Monthly Deposit"}
        >
          <div className="w-8 h-8 -mt-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950 border-2 border-slate-950">
            <Plus className="w-5 h-5 font-bold" />
          </div>
          <span className="font-bold text-emerald-400 text-[10px]">Deposit</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors ${
            activeTab === 'members' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UsersRound className="w-4 h-4" />
          <span>11 Members</span>
        </button>

        {isAdmin ? (
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg transition-colors relative ${
              activeTab === 'reminders' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <BellRing className="w-4 h-4" />
              {pendingRemindersCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-500 text-slate-950 rounded-full font-bold text-[8px] flex items-center justify-center font-mono">
                  {pendingRemindersCount}
                </span>
              )}
            </div>
            <span>Reminders</span>
          </button>
        ) : (
          <button
            onClick={() => {
              const myProfile = members.find(m => m.id === session.memberId);
              if (myProfile) {
                setSelectedStatementMember(myProfile);
                setIsStatementModalOpen(true);
              }
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            title="View and download my statement"
          >
            <ReceiptText className="w-4 h-4 text-emerald-400" />
            <span>My Statement</span>
          </button>
        )}
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 px-4 text-xs text-slate-500 pb-20 sm:pb-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">{project.initiativeName}</span>
            <span>·</span>
            <span>{project.footerCopyright || `© 2026 ${project.initiativeName} · All Rights Reserved`}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {isAdmin && (
              <>
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                  title="Export complete application as a single standalone index.html with CDN scripts and live Firestore"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export Single-File</span>
                </button>
                <span>·</span>
                <button
                  onClick={handleExportCSV}
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Download CSV backup of syndicate ledger"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup CSV</span>
                </button>
              </>
            )}
            <span>·</span>
            {/* Back to Top Navigation (Request 9) */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Smooth scroll back to top of page"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
            {isAdmin && (
              <>
                <span>·</span>
                <button
                  onClick={() => handleOpenAdminPanel('appearance')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin Panel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        members={members}
        currentSession={session}
        onLogin={updateSession}
        project={project}
      />

      {/* Google Form Public Deposit Submission Modal with Shareable Link */}
      <GoogleFormDepositModal
        isOpen={isGoogleFormModalOpen}
        onClose={() => setIsGoogleFormModalOpen(false)}
        members={members}
        project={project}
        preselectedMemberId={preselectedFormMemberId}
        onSubmitDeposit={handleGoogleFormDepositSubmit}
      />

      {/* Admin Deposit Approvals Queue Modal */}
      <DepositApprovalsModal
        isOpen={isApprovalsModalOpen}
        onClose={() => setIsApprovalsModalOpen(false)}
        pendingTransactions={pendingTransactions}
        members={members}
        project={project}
        onApproveDeposit={handleApproveDeposit}
        onRejectDeposit={handleRejectDeposit}
        onDeleteSubmission={handleDeleteTransaction}
        onViewReceipt={(tx) => {
          setSelectedReceiptTx(tx);
          setIsReceiptModalOpen(true);
        }}
        onSendWhatsAppCongrats={isAdmin ? handleOpenWhatsAppCongrats : undefined}
      />

      {/* Record or Edit Deposit Modal (Rendered with high z-index z-[70]) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        members={members}
        project={project}
        editingTransaction={editingTransaction}
        adminName={session.memberName}
      />

      {/* Functional Edit Member Profile & Delete Transaction modal */}
      <EditMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => {
          setIsEditMemberModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSaveMember={handleSaveMember}
        isAdmin={isAdmin}
        currentMemberId={session.memberId}
        transactions={transactions}
        onDeleteTransaction={handleDeleteTransaction}
        onEditTransaction={(tx) => {
          setEditingTransaction(tx);
          setIsTxModalOpen(true);
        }}
        onAddNewDeposit={(memId) => handleAddNewDepositForMember(memId)}
        projectSymbol={project.symbol}
      />

      <MemberStatementModal
        isOpen={isStatementModalOpen}
        onClose={() => {
          setIsStatementModalOpen(false);
          setSelectedStatementMember(null);
        }}
        member={selectedStatementMember}
        transactions={transactions}
        project={project}
        isAdmin={isAdmin}
        currentMemberId={session.memberId}
        onEditTransaction={(tx) => {
          setEditingTransaction(tx);
          setIsTxModalOpen(true);
        }}
        onDeleteTransaction={handleDeleteTransaction}
        onUpdateProject={handleUpdateProject}
      />

      {/* Combined Bank & Service Charge Modal (Applied to total combined balance) */}
      <AdjustCombinedBalanceModal
        isOpen={isAdjustCombinedModalOpen}
        onClose={() => setIsAdjustCombinedModalOpen(false)}
        project={project}
        totalGrossDeposits={grossTotal}
        onSaveCombinedCharge={handleSaveCombinedBankCharge}
      />

      <ReceiptVoucherModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceiptTx(null);
        }}
        transaction={selectedReceiptTx}
        member={members.find(m => m.id === selectedReceiptTx?.memberId)}
        project={project}
        isAdmin={isAdmin}
        currentMemberId={session.memberId}
        onSendWhatsAppCongrats={isAdmin ? handleOpenWhatsAppCongrats : undefined}
      />

      {/* Total Transaction History & Direct Monthly Deposit Controls */}
      <MemberDetailHistoryModal
        isOpen={isMemberHistoryModalOpen}
        onClose={() => {
          setIsMemberHistoryModalOpen(false);
          setSelectedHistoryMember(null);
        }}
        member={selectedHistoryMember}
        transactions={transactions}
        project={project}
        isAdmin={isAdmin}
        currentMonth={currentMonth}
        onEditTransaction={(tx) => {
          setEditingTransaction(tx);
          setIsTxModalOpen(true);
        }}
        onDeleteTransaction={handleDeleteTransaction}
        onAddNewDepositForMember={handleAddNewDepositForMember}
        onUpdateMemberMonthlyTarget={handleUpdateMemberMonthlyTarget}
        onOpenEditProfile={(mem) => {
          setEditingMember(mem);
          setIsEditMemberModalOpen(true);
        }}
        onOpenPrintStatement={(mem) => {
          setSelectedStatementMember(mem);
          setIsStatementModalOpen(true);
        }}
        onSaveTransaction={handleSaveTransaction}
        onSendWhatsAppCongrats={isAdmin ? handleOpenWhatsAppCongrats : undefined}
      />

      {/* Post-Deposit WhatsApp Congratulations Acknowledgment Modal */}
      <DepositSuccessWhatsAppModal
        isOpen={isWhatsAppCongratsModalOpen}
        onClose={() => {
          setIsWhatsAppCongratsModalOpen(false);
          setWhatsAppCongratsTx(null);
          setWhatsAppCongratsMember(null);
        }}
        transaction={whatsAppCongratsTx}
        member={whatsAppCongratsMember}
        project={project}
        onViewReceipt={(tx) => {
          setSelectedReceiptTx(tx);
          setIsReceiptModalOpen(true);
        }}
        onAddReminderLog={handleAddReminderLog}
      />

      {/* Admin Control & Styling Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        project={project}
        onSaveProject={handleUpdateProject}
        themeMode={themeMode}
        onToggleThemeMode={handleToggleThemeMode}
        initialTab={adminPanelTab}
        onExportStandaloneHtml={handleDownloadStandaloneHtml}
        onExportCSV={handleExportCSV}
        adminMember={members.find(m => m.id === 'm1' || m.role === 'admin')}
        onSaveAdminPin={handleSaveAdminPin}
      />
    </div>
  );
}
