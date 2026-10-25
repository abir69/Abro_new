import { Member, Transaction, SyndicateExpense, PlotProject } from '../types';

export const INITIAL_PLOT_PROJECT: PlotProject = {
  initiativeName: 'Aristo Future Initiative',
  plotTitle: 'Joint Initiative Fund',
  sector: 'Collaborative Deposit & Savings Initiative',
  location: 'Dhaka, Bangladesh',
  plotSize: '11 Joint Participants',
  totalTargetPrice: 11000000,
  monthlyPerMemberExpected: 2000, // 2,000 BDT monthly contribution
  totalCombinedBankCharge: 0,
  combinedChargeNotes: 'The City Bank PLC ledger & account maintenance charge',
  leadAdminName: 'Md. Minhazul Islam Abir',
  leadAdminDesignation: 'Lead Admin & Chief Trustee',
  syndicateAdminName: 'Md. Mostak Ahmed',
  syndicateAdminDesignation: 'Syndicate Admin & Treasury Officer',
  currency: 'BDT',
  symbol: '৳',
  dueDayOfMonth: 10,
  bankDetails: {
    bankName: 'The City Bank PLC',
    accountName: 'Aristo Future Initiative (Joint Escrow)',
    accountNumber: '1781580054174',
    routingNumber: '225272654',
    branch: 'Principal Branch, Dhaka',
    mfsNumber: '+880 1712-992700 (Citytouch / bKash)'
  },
  adminPin: '2026',
  appTheme: 'emerald',
  fontFamily: 'inter',
  borderRadiusStyle: 'smooth',
  isMaintenanceMode: false,
  maintenanceMessage: 'Scheduled Syndicate Treasury Audit & Maintenance. Member access will resume shortly.',
  maintenanceEstimatedTime: 'October 17, 2026, 6:00 PM BST',
  maintenanceStartedAt: ''
};

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Md. Minhazul Islam Abir',
    email: 'miabir9927@gmail.com',
    mobile: '+880 1712-992700',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    nomineeName: 'Salma Begum',
    nomineeRelation: 'Mother',
    emergencyContactName: 'Kazi Farhana',
    emergencyContactRelation: 'Sister',
    emergencyContactPhone: '+880 1711-002233',
    nidOrId: 'NID-1992-748291039',
    joinedDate: '2025-01-10',
    pin: '2026',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Initiative Coordinator & Primary Custodian (Admin)'
  },
  {
    id: 'm2',
    name: 'Md. Mostak Ahmed',
    email: 'mostak.ahmed@gmail.com',
    mobile: '+880 1819-234567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Rasheda Ahmed',
    nomineeRelation: 'Spouse',
    emergencyContactName: 'Rasheda Ahmed',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+880 1819-998877',
    nidOrId: 'NID-1988-392810481',
    joinedDate: '2025-01-12',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm3',
    name: 'Md. Mahmudul Hasan',
    email: 'mahmudul.hasan@gmail.com',
    mobile: '+880 1914-567890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Fatema Hasan',
    nomineeRelation: 'Mother',
    emergencyContactName: 'Fatema Hasan',
    emergencyContactRelation: 'Mother',
    emergencyContactPhone: '+880 1914-112233',
    nidOrId: 'NID-1993-847291847',
    joinedDate: '2025-01-15',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm4',
    name: 'Naeem Hasan',
    email: 'naeem.hasan@gmail.com',
    mobile: '+880 1711-345678',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Farzana Naeem',
    nomineeRelation: 'Spouse',
    emergencyContactName: 'Farzana Naeem',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+880 1711-445566',
    nidOrId: 'NID-1985-182947192',
    joinedDate: '2025-01-15',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm5',
    name: 'Md. Mehedi Hasan Shawon',
    email: 'mehedi.shawon@gmail.com',
    mobile: '+880 1622-456789',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Roksana Begum',
    nomineeRelation: 'Mother',
    emergencyContactName: 'Roksana Begum',
    emergencyContactRelation: 'Mother',
    emergencyContactPhone: '+880 1622-778899',
    nidOrId: 'NID-1994-472918401',
    joinedDate: '2025-01-18',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm6',
    name: 'Md. Nadim Khan',
    email: 'nadim.khan@gmail.com',
    mobile: '+880 1833-567891',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Farida Khan',
    nomineeRelation: 'Mother',
    emergencyContactName: 'Farida Khan',
    emergencyContactRelation: 'Mother',
    emergencyContactPhone: '+880 1833-223344',
    nidOrId: 'NID-1991-382910482',
    joinedDate: '2025-01-20',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm7',
    name: 'Shamim Osman',
    email: 'shamim.osman@gmail.com',
    mobile: '+880 1922-678912',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Nasrin Sultana',
    nomineeRelation: 'Spouse',
    emergencyContactName: 'Nasrin Sultana',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+880 1922-556677',
    nidOrId: 'NID-1987-928471039',
    joinedDate: '2025-01-22',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm8',
    name: 'Naruttam Chandra Sarker',
    email: 'naruttam.sarker@gmail.com',
    mobile: '+880 1733-789023',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Anjali Sarker',
    nomineeRelation: 'Spouse',
    emergencyContactName: 'Anjali Sarker',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+880 1733-889900',
    nidOrId: 'NID-1990-284910382',
    joinedDate: '2025-01-25',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm9',
    name: 'Sukhen Chandra Mondal',
    email: 'sukhen.mondal@gmail.com',
    mobile: '+880 1844-890134',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Mita Mondal',
    nomineeRelation: 'Spouse',
    emergencyContactName: 'Mita Mondal',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+880 1844-334455',
    nidOrId: 'NID-1995-182930491',
    joinedDate: '2025-01-28',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm10',
    name: 'Didar-E-Mosnobi Rumi',
    email: 'didar.rumi@gmail.com',
    mobile: '+880 1933-901245',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Sultana Rumi',
    nomineeRelation: 'Spouse',
    emergencyContactName: 'Sultana Rumi',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+880 1933-667788',
    nidOrId: 'NID-1992-629104829',
    joinedDate: '2025-02-01',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  },
  {
    id: 'm11',
    name: 'Mehedi Hasan',
    email: 'mehedi.hasan11@gmail.com',
    mobile: '+880 1744-012356',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Fariha Hasan',
    nomineeRelation: 'Spouse',
    emergencyContactName: 'Fariha Hasan',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+880 1744-990011',
    nidOrId: 'NID-1989-729104820',
    joinedDate: '2025-02-05',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Syndicate Member & Participant'
  }
];

// No expenses in the initiative!
export const INITIAL_EXPENSES: SyndicateExpense[] = [];

// Initiative cycles from March to October 2026
export const MONTHS_MARCH_TO_OCTOBER = [
  { month: 'March 2026', prefix: '2026-03' },
  { month: 'April 2026', prefix: '2026-04' },
  { month: 'May 2026', prefix: '2026-05' },
  { month: 'June 2026', prefix: '2026-06' },
  { month: 'July 2026', prefix: '2026-07' },
  { month: 'August 2026', prefix: '2026-08' },
  { month: 'September 2026', prefix: '2026-09' },
  { month: 'October 2026', prefix: '2026-10' }
];

export const DEFAULT_DEPOSIT_BANK = 'The City Bank PLC';
export const DEFAULT_DEPOSIT_ACCOUNT = '1781580054174';

// Generate 2,000 BDT regular verified syndicate deposits from March to October for all 11 exact members
export const INITIAL_TRANSACTIONS: Transaction[] = MONTHS_MARCH_TO_OCTOBER.flatMap((mObj, mIdx) => {
  return INITIAL_MEMBERS.map((member, memIdx) => {
    const day = (5 + ((memIdx * 2) % 6)).toString().padStart(2, '0');
    const date = `${mObj.prefix}-${day}`;
    const txId = `tx-${mObj.month.slice(0, 3).toLowerCase()}-${member.id}`;
    
    // Channels
    const methods: Transaction['method'][] = ['Bank Transfer', 'bKash / MFS', 'Direct Deposit', 'Bank Transfer', 'Nagad'];
    const method = methods[(memIdx + mIdx) % methods.length];
    
    return {
      id: txId,
      memberId: member.id,
      memberName: member.name,
      date,
      amount: 2000,
      deductionOrFee: 0,
      netAmount: 2000,
      method,
      referenceNumber: `CITY-${mObj.month.slice(0, 3).toUpperCase()}${date.slice(2, 4)}-${(100 + memIdx + mIdx * 11)}`,
      depositBank: DEFAULT_DEPOSIT_BANK,
      depositAccountNumber: DEFAULT_DEPOSIT_ACCOUNT,
      bankOrChannel: method === 'Bank Transfer' ? DEFAULT_DEPOSIT_BANK : method === 'bKash / MFS' ? 'bKash to City Bank' : DEFAULT_DEPOSIT_BANK,
      monthPeriod: mObj.month,
      status: 'Verified' as const,
      notes: `${mObj.month} monthly contribution (2,000 BDT) deposited to ${DEFAULT_DEPOSIT_BANK} (Acc: ${DEFAULT_DEPOSIT_ACCOUNT})`,
      createdAt: `${date}T10:00:00Z`
    };
  });
});
