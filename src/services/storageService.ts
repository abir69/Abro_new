import { Member, Transaction, SyndicateExpense, PlotProject, ReminderLog, UserSession, MemberDueSummary, MonthDueItem, ThemeMode } from '../types';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS, INITIAL_EXPENSES, INITIAL_PLOT_PROJECT } from '../data/initialData';

const STORAGE_KEYS = {
  MEMBERS: 'aristo_initiative_v3_members',
  ADMIN_PROFILE: 'aristo_initiative_v3_admin_profile',
  TRANSACTIONS: 'aristo_initiative_v3_transactions',
  EXPENSES: 'aristo_initiative_v3_expenses',
  PROJECT: 'aristo_initiative_v3_project',
  REMINDERS: 'aristo_initiative_v3_reminders',
  SESSION: 'aristo_initiative_v3_session',
  THEME: 'aristo_theme_mode'
};

export const getStoredTheme = (): ThemeMode => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    return (raw === 'light' || raw === 'dark') ? raw : 'dark';
  } catch {
    return 'dark';
  }
};

export const saveStoredTheme = (theme: ThemeMode): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
};

/**
 * Direct permanent persistence for Lead Admin profile
 */
export const getStoredAdminProfile = (): Partial<Member> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveStoredAdminProfile = (admin: Member): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(admin));
  } catch (e) {
    console.error('Error saving admin profile to localStorage:', e);
  }
};

export const getStoredMembers = (): Member[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const savedAdmin = getStoredAdminProfile();
    
    if (!raw) {
      const initial = INITIAL_MEMBERS.map(m => {
        if ((m.id === 'm1' || m.role === 'admin') && savedAdmin) {
          return { ...m, ...savedAdmin, id: m.id, role: 'admin' as const };
        }
        return m;
      });
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initial));
      return initial;
    }
    const parsed: Member[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_MEMBERS;
    }

    return parsed.map(m => {
      // If this is the admin member, guarantee that savedAdmin profile fields override defaults
      if ((m.id === 'm1' || m.role === 'admin') && savedAdmin) {
        return {
          ...savedAdmin,
          ...m,
          id: m.id,
          role: 'admin' as const
        };
      }
      return m;
    });
  } catch (e) {
    console.error('Error loading members:', e);
    return INITIAL_MEMBERS;
  }
};

export const saveStoredMembers = (members: Member[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    const admin = members.find(m => m.id === 'm1' || m.role === 'admin');
    if (admin) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(admin));
    }
  } catch (e) {
    console.error('Error saving members:', e);
  }
};

export const DEFAULT_DEPOSIT_BANK = 'The City Bank PLC';
export const DEFAULT_DEPOSIT_ACCOUNT = '1781580054174';

export const getStoredTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed: Transaction[] = JSON.parse(raw);
    return parsed.map(tx => ({
      ...tx,
      memberName: tx.memberName === 'Abir Mia' ? 'Md. Minhazul Islam Abir' : tx.memberName,
      depositBank: tx.depositBank || DEFAULT_DEPOSIT_BANK,
      depositAccountNumber: tx.depositAccountNumber || DEFAULT_DEPOSIT_ACCOUNT,
      bankOrChannel: (tx.bankOrChannel && tx.bankOrChannel.includes('Eastern')) 
        ? DEFAULT_DEPOSIT_BANK 
        : (tx.bankOrChannel || DEFAULT_DEPOSIT_BANK)
    }));
  } catch (e) {
    console.error('Error loading transactions:', e);
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

// No expenses in the initiative!
export const getStoredExpenses = (): SyndicateExpense[] => {
  return [];
};

export const saveStoredExpenses = (_expenses: SyndicateExpense[]) => {
  // No-op: expenses are disabled
};

export const getStoredProject = (): PlotProject => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECT);
    const savedAdmin = getStoredAdminProfile();
    
    if (!raw) {
      const initial: PlotProject = {
        ...INITIAL_PLOT_PROJECT,
        leadAdminName: savedAdmin?.name || INITIAL_PLOT_PROJECT.leadAdminName
      };
      localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const existingBank = parsed.bankDetails || {};
    const bankName = (existingBank.bankName && !existingBank.bankName.includes('Eastern'))
      ? existingBank.bankName
      : DEFAULT_DEPOSIT_BANK;
    const accountNumber = (existingBank.accountNumber && existingBank.accountNumber !== '104-120-9988771')
      ? existingBank.accountNumber
      : DEFAULT_DEPOSIT_ACCOUNT;

    const leadAdminName = parsed.leadAdminName || savedAdmin?.name || INITIAL_PLOT_PROJECT.leadAdminName;

    return {
      ...INITIAL_PLOT_PROJECT,
      ...parsed,
      leadAdminName,
      bankDetails: {
        ...INITIAL_PLOT_PROJECT.bankDetails,
        ...existingBank,
        bankName,
        accountNumber
      }
    };
  } catch (e) {
    console.error('Error loading project:', e);
    return INITIAL_PLOT_PROJECT;
  }
};

export const saveStoredProject = (project: PlotProject) => {
  localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
  if (project.leadAdminName) {
    const savedAdmin = getStoredAdminProfile();
    if (savedAdmin) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify({
        ...savedAdmin,
        name: project.leadAdminName,
        email: project.supportContactEmail || savedAdmin.email,
        mobile: project.supportContactPhone || savedAdmin.mobile
      }));
    }
  }
};

export const getStoredReminders = (): ReminderLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredReminders = (reminders: ReminderLog[]) => {
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
};

export const getStoredSession = (): UserSession => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) {
      const parsed: UserSession = JSON.parse(raw);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') {
        const savedAdmin = getStoredAdminProfile();
        if (parsed.role === 'admin' && savedAdmin && savedAdmin.name) {
          parsed.memberName = savedAdmin.name;
          if (savedAdmin.email) parsed.email = savedAdmin.email;
        }
        return parsed;
      }
    }
  } catch {}
  // Default to non-logged in so login approval gatekeeper is required before loading app
  return {
    isLoggedIn: false,
    role: 'member',
    isApproved: false
  };
};

export const saveStoredSession = (session: UserSession) => {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
};

export const resetAllDataToDefault = () => {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(INITIAL_PLOT_PROJECT));
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
};

// Formatter utilities with full decimal precision support
export const formatCurrency = (amount: number, symbol = '৳') => {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  const hasDecimals = !Number.isInteger(num);
  return `${symbol} ${num.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const formatWhatsAppPhone = (phone: string): string => {
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('01') && digits.length === 11) {
    digits = '88' + digits;
  }
  return digits;
};

export const generateDepositCongratsMessage = (
  memberName: string,
  amount: number,
  monthPeriod: string,
  referenceNumber: string,
  bankOrChannel?: string,
  dateStr?: string,
  symbol = '৳',
  depositBank = DEFAULT_DEPOSIT_BANK,
  depositAccountNumber = DEFAULT_DEPOSIT_ACCOUNT
): string => {
  const formattedDate = dateStr ? formatDate(dateStr) : formatDate(new Date().toISOString());
  const formattedAmount = formatCurrency(amount, symbol);
  return `🎉 Congratulations ${memberName}!

Your monthly deposit of ${formattedAmount} for ${monthPeriod} has been successfully received & credited to the Aristo Future Initiative joint ledger.

📋 Deposit Receipt Summary:
• Member: ${memberName}
• Amount: ${formattedAmount}
• Cycle: ${monthPeriod}
• Deposit Bank: ${depositBank}
• Account Number: ${depositAccountNumber}
• Channel: ${bankOrChannel || depositBank}
• Ref No: ${referenceNumber}
• Date: ${formattedDate}

Thank you for your dedicated contribution towards the joint initiative!
— Aristo Future Initiative`;
};

// Initiative cycles definition starting from March 2026
export const INITIATIVE_START_MONTH = 'March 2026';

export const INITIATIVE_CYCLES = [
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026'
];

/**
 * Returns all month periods starting from March 2026 up to the specified current month.
 */
export const getMonthsFromMarchToCurrent = (currentMonth = 'October 2026'): string[] => {
  const startIndex = INITIATIVE_CYCLES.indexOf(INITIATIVE_START_MONTH);
  const currentIndex = INITIATIVE_CYCLES.indexOf(currentMonth);

  if (currentIndex >= 0 && currentIndex >= (startIndex >= 0 ? startIndex : 0)) {
    return INITIATIVE_CYCLES.slice(startIndex >= 0 ? startIndex : 0, currentIndex + 1);
  }

  // Fallback default: March 2026 to October 2026 (8 months)
  return [
    'March 2026',
    'April 2026',
    'May 2026',
    'June 2026',
    'July 2026',
    'August 2026',
    'September 2026',
    'October 2026'
  ];
};

/**
 * Calculates due amount from March to the current month for a member.
 * Calculates every month individually (expected vs deposited vs due) and returns a complete audit summary.
 */
export const calculateMemberDueSummary = (
  member: Member,
  transactions: Transaction[],
  project: PlotProject,
  currentMonth = 'October 2026'
): MemberDueSummary => {
  const evaluatedMonths = getMonthsFromMarchToCurrent(currentMonth);
  // Only consider active deposits for this member
  const memberTxs = transactions.filter(
    t => t.memberId === member.id && t.status !== 'Flagged'
  );

  const monthlyExpected = member.customMonthlyDeposit || project.monthlyPerMemberExpected || 2000;

  const monthlyBreakdown: MonthDueItem[] = evaluatedMonths.map(month => {
    // Match month by monthPeriod
    const matchingTxs = memberTxs.filter(t => {
      if (!t.monthPeriod) return false;
      return t.monthPeriod.trim().toLowerCase() === month.trim().toLowerCase();
    });

    const verifiedTxs = matchingTxs.filter(t => t.status === 'Verified' || t.status === 'Cleared');
    const pendingTxs = matchingTxs.filter(t => t.status === 'Pending Review');

    const deposited = verifiedTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const pendingApprovalAmount = pendingTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const due = Math.max(0, monthlyExpected - deposited);
    const isPaid = deposited >= monthlyExpected;

    return {
      month,
      expected: monthlyExpected,
      deposited,
      due,
      isPaid,
      pendingApprovalAmount,
      transactions: matchingTxs
    };
  });

  const totalExpected = monthlyBreakdown.reduce((sum, item) => sum + item.expected, 0);
  const totalDepositedForPeriod = monthlyBreakdown.reduce((sum, item) => sum + item.deposited, 0);
  const totalDue = monthlyBreakdown.reduce((sum, item) => sum + item.due, 0);
  const dueMonths = monthlyBreakdown.filter(item => item.due > 0).map(item => item.month);
  const clearedMonthsCount = monthlyBreakdown.filter(item => item.isPaid).length;

  return {
    evaluatedMonths,
    totalMonthsCount: evaluatedMonths.length,
    clearedMonthsCount,
    dueMonthsCount: dueMonths.length,
    totalExpected,
    totalDepositedForPeriod,
    totalDue,
    dueMonths,
    monthlyBreakdown,
    isAllCleared: totalDue === 0
  };
};
