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
  syndicateAdminName: 'Dr. Tariqul Islam',
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
  }
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
    nidOrId: 'NID-1992-748291039',
    joinedDate: '2025-01-10',
    pin: '2026',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Initiative Coordinator & Primary Custodian'
  },
  {
    id: 'm2',
    name: 'Dr. Tariqul Islam',
    email: 'tariqul.islam.dr@gmail.com',
    mobile: '+880 1819-234567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Dr. Ayesha Tariq',
    nomineeRelation: 'Spouse',
    nidOrId: 'NID-1988-392810481',
    joinedDate: '2025-01-12',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Advisory Committee Member'
  },
  {
    id: 'm3',
    name: 'Syeda Nusrat Jahan',
    email: 'nusrat.jahan.arch@gmail.com',
    mobile: '+880 1914-567890',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Syed Anwar Jahan',
    nomineeRelation: 'Father',
    nidOrId: 'NID-1993-847291847',
    joinedDate: '2025-01-15',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Planning Lead'
  },
  {
    id: 'm4',
    name: 'Kamrul Hassan',
    email: 'kamrul.hassan.fin@gmail.com',
    mobile: '+880 1711-345678',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Farhana Kamrul',
    nomineeRelation: 'Spouse',
    nidOrId: 'NID-1985-182947192',
    joinedDate: '2025-01-15',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Internal Accounts Reviewer'
  },
  {
    id: 'm5',
    name: 'Mahmudur Rahman',
    email: 'mahmud.rahman.dev@gmail.com',
    mobile: '+880 1622-456789',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Roksana Mahmud',
    nomineeRelation: 'Mother',
    nidOrId: 'NID-1994-472918401',
    joinedDate: '2025-01-18',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Technical & System Coordinator'
  },
  {
    id: 'm6',
    name: 'Nafisa Chowdhury',
    email: 'nafisa.chowdhury.law@gmail.com',
    mobile: '+880 1833-567891',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Barrister Iftekhar Chowdhury',
    nomineeRelation: 'Brother',
    nidOrId: 'NID-1991-382910482',
    joinedDate: '2025-01-20',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Legal & Documentation Advisor'
  },
  {
    id: 'm7',
    name: 'Engr. Rezaul Karim',
    email: 'engr.rezaul.karim@gmail.com',
    mobile: '+880 1922-678912',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Nasrin Karim',
    nomineeRelation: 'Spouse',
    nidOrId: 'NID-1987-928471039',
    joinedDate: '2025-01-22',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Infrastructure Specialist'
  },
  {
    id: 'm8',
    name: 'Zubair Ahmed',
    email: 'zubair.ahmed.biz@gmail.com',
    mobile: '+880 1733-789023',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Tasnim Zubair',
    nomineeRelation: 'Spouse',
    nidOrId: 'NID-1990-284910382',
    joinedDate: '2025-01-25',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Procurement Specialist'
  },
  {
    id: 'm9',
    name: 'Farhan Kabir',
    email: 'farhan.kabir.mkt@gmail.com',
    mobile: '+880 1844-890134',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Laila Kabir',
    nomineeRelation: 'Mother',
    nidOrId: 'NID-1995-182930491',
    joinedDate: '2025-01-28',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Communications Coordinator'
  },
  {
    id: 'm10',
    name: 'Shakil Anwar',
    email: 'shakil.anwar.bd@gmail.com',
    mobile: '+880 1933-901245',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Shaila Anwar',
    nomineeRelation: 'Sister',
    nidOrId: 'NID-1992-629104829',
    joinedDate: '2025-02-01',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Member Relations Liaison'
  },
  {
    id: 'm11',
    name: 'Tanvir Hossain',
    email: 'tanvir.hossain.mgt@gmail.com',
    mobile: '+880 1744-012356',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    role: 'member',
    nomineeName: 'Fariha Tanvir',
    nomineeRelation: 'Spouse',
    nidOrId: 'NID-1989-729104820',
    joinedDate: '2025-02-05',
    pin: '1234',
    approvalStatus: 'approved',
    manualNetAdjustment: 0,
    notes: 'Operations Coordinator'
  }
];

// No expenses in the initiative!
export const INITIAL_EXPENSES: SyndicateExpense[] = [];

// Months list from March to October 2026
const MONTHS_MARCH_TO_OCTOBER = [
  { month: 'March 2026', prefix: '2026-03' },
  { month: 'April 2026', prefix: '2026-04' },
  { month: 'May 2026', prefix: '2026-05' },
  { month: 'June 2026', prefix: '2026-06' },
  { month: 'July 2026', prefix: '2026-07' },
  { month: 'August 2026', prefix: '2026-08' },
  { month: 'September 2026', prefix: '2026-09' },
  { month: 'October 2026', prefix: '2026-10' }
];

// Generate 2000 BDT deposits from March to October for all 11 members (No fee charge on member deposits)
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
      amount: 2000, // 2,000 BDT deposit as requested
      deductionOrFee: 0, // Fee charge removed for members
      netAmount: 2000, // Clean Net balance 2,000 BDT
      method,
      referenceNumber: `CITY-${mObj.month.slice(0, 3).toUpperCase()}${date.slice(2, 4)}-${(100 + memIdx + mIdx * 11)}`,
      depositBank: 'The City Bank PLC',
      depositAccountNumber: '1781580054174',
      bankOrChannel: method === 'Bank Transfer' ? 'The City Bank PLC' : method === 'bKash / MFS' ? 'bKash to City Bank' : 'The City Bank PLC',
      monthPeriod: mObj.month,
      status: 'Verified' as const,
      notes: `${mObj.month} monthly contribution (2,000 BDT) deposited to The City Bank PLC (Acc: 1781580054174)`,
      createdAt: `${date}T10:00:00Z`
    };
  });
});
