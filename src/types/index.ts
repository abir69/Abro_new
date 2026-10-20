export type Role = 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  role: Role;
  shares?: number;
  nomineeName: string;
  nomineeRelation: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  nidOrId: string;
  joinedDate: string;
  pin: string; // 4-digit PIN for member login
  manualNetAdjustment?: number; // Manual bank charge or net adjustment applied by admin
  customMonthlyDeposit?: number; // Manually controlled monthly deposit amount (default 2000)
  approvalStatus?: 'approved' | 'pending' | 'rejected'; // Member login approval status
  notes?: string;
}

export type PaymentMethod = 
  | 'Bank Transfer' 
  | 'bKash / MFS' 
  | 'Nagad' 
  | 'Cheque' 
  | 'Direct Deposit' 
  | 'Wire Transfer' 
  | 'Cash';

export type TransactionStatus = 'Verified' | 'Cleared' | 'Pending Review' | 'Flagged';

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  amount: number; // Gross deposited
  deductionOrFee: number; // Manual bank / service charge (default 0)
  netAmount: number; // Net balance credited (editable directly by admin)
  manualNetOverride?: boolean;
  method: PaymentMethod;
  referenceNumber: string;
  bankOrChannel?: string;
  depositBank?: string; // Default: 'The City Bank PLC'
  depositAccountNumber?: string; // Default: '1781580054174'
  monthPeriod: string; // e.g. "March 2026", "October 2026"
  status: TransactionStatus;
  notes: string;
  receiptUrl?: string;
  depositorName?: string;
  depositorPhone?: string;
  submittedVia?: 'google_form' | 'admin_entry' | 'member_portal';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  editedBy?: string;
}

export interface SyndicateExpense {
  id: string;
  title: string;
  category: 'Land Vetting & Legal' | 'Mutation & Registry Advance' | 'Site Inspection & Soil Test' | 'Banking & Processing' | 'Buffer Reserve';
  amount: number;
  date: string;
  voucherNo: string;
  paidTo: string;
  approvedBy: string;
  notes: string;
}

export interface PlotProject {
  initiativeName: string;
  plotTitle: string;
  sector: string;
  location: string;
  plotSize: string; // e.g. "5.0 Katha / 3,600 Sq Ft"
  totalTargetPrice: number;
  monthlyPerMemberExpected: number;
  totalCombinedBankCharge?: number; // Manual bank and service charge on total combined balance
  combinedChargeNotes?: string;
  leadAdminName?: string;
  leadAdminDesignation?: string;
  syndicateAdminName?: string;
  syndicateAdminDesignation?: string;
  currency: string;
  symbol: string;
  dueDayOfMonth: number; // e.g. 10th of every month
  adminPin?: string; // 4-digit or custom security PIN for Admin login
  isMaintenanceMode?: boolean;
  maintenanceMessage?: string;
  maintenanceEstimatedTime?: string;
  maintenanceStartedAt?: string;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    branch: string;
    mfsNumber: string;
  };
  // Admin Custom Styling & Directives
  appTheme?: 'emerald' | 'indigo' | 'blue' | 'violet' | 'amber' | 'slate';
  fontFamily?: 'inter' | 'roboto' | 'outfit' | 'jakarta' | 'mono';
  borderRadiusStyle?: 'smooth' | 'rounded' | 'sharp';
  customLogoUrl?: string;
  customLogoIcon?: 'building' | 'landmark' | 'shield' | 'layers' | 'gem';
  badgeText?: string;
  headerNotice?: string;
  showHeaderNotice?: boolean;
  footerCopyright?: string;
  supportContactEmail?: string;
  supportContactPhone?: string;
  escrowDirectivesNotes?: string;
}

export type ThemeMode = 'dark' | 'light';

export interface ReminderLog {
  id: string;
  memberId: string;
  memberName: string;
  month: string;
  amountDue: number;
  channel: 'WhatsApp' | 'Email' | 'SMS' | 'Automated App Push';
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Queued';
  recipientContact: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  role: Role;
  memberId?: string;
  memberName?: string;
  email?: string;
  isApproved?: boolean;
}

export interface MonthDueItem {
  month: string;
  expected: number;
  deposited: number;
  due: number;
  isPaid: boolean;
  pendingApprovalAmount?: number;
  transactions: Transaction[];
}

export interface MemberDueSummary {
  evaluatedMonths: string[];
  totalMonthsCount: number;
  clearedMonthsCount: number;
  dueMonthsCount: number;
  totalExpected: number;
  totalDepositedForPeriod: number;
  totalDue: number;
  dueMonths: string[];
  monthlyBreakdown: MonthDueItem[];
  isAllCleared: boolean;
}
