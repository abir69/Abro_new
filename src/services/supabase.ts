import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Member, Transaction, PlotProject } from '../types';

export const DEFAULT_SUPABASE_URL = 'https://fjxsnkbdiofxxjiqmexy.supabase.co';
const STORAGE_KEY_SUPABASE_ANON_KEY = 'aristo_supabase_anon_key';
const STORAGE_KEY_SUPABASE_URL = 'aristo_supabase_url';

/**
 * Returns the current Supabase URL from environment or stored settings
 */
export function getSupabaseUrl(): string {
  try {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      return envUrl.trim();
    }
    const stored = localStorage.getItem(STORAGE_KEY_SUPABASE_URL);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Ignore localStorage errors
  }
  return DEFAULT_SUPABASE_URL;
}

/**
 * Updates stored Supabase URL if user sets a custom endpoint
 */
export function setStoredSupabaseUrl(url: string): void {
  try {
    if (!url || url.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    }
    cachedClient = null;
  } catch (e) {
    console.error('Error saving Supabase URL:', e);
  }
}

/**
 * Returns the Supabase anon / public API key from environment or local storage
 */
export function getSupabaseAnonKey(): string {
  try {
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim().length > 0 && !envKey.includes('your-supabase-anon-key')) {
      return envKey.trim();
    }
    const stored = localStorage.getItem(STORAGE_KEY_SUPABASE_ANON_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Ignore localStorage errors
  }
  return '';
}

/**
 * Saves the Supabase anon key to local storage
 */
export function setStoredSupabaseAnonKey(key: string): void {
  try {
    if (!key || key.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY_SUPABASE_ANON_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY_SUPABASE_ANON_KEY, key.trim());
    }
    cachedClient = null;
  } catch (e) {
    console.error('Error saving Supabase anon key:', e);
  }
}

/**
 * Checks whether Supabase has both a valid URL and an anon key configured
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && url.startsWith('http') && key && key.length > 10);
}

// Client singleton instance
let cachedClient: SupabaseClient | null = null;
let lastClientKey: string = '';

export function getSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return null;
  }

  const cacheKey = `${url}:${key}`;
  if (cachedClient && lastClientKey === cacheKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    lastClientKey = cacheKey;
    return cachedClient;
  } catch (err) {
    console.error('[Supabase] Client initialization error:', err);
    return null;
  }
}

export interface SupabaseHealthResult {
  reachable: boolean;
  authenticated: boolean;
  message: string;
  url: string;
  hasKey: boolean;
  latencyMs?: number;
  tablesStatus?: {
    members: boolean;
    transactions: boolean;
    plot_project: boolean;
  };
}

/**
 * Tests live connection to the Supabase instance
 */
export async function testSupabaseHealth(): Promise<SupabaseHealthResult> {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  const startTime = Date.now();

  // 1. First test HTTP endpoint reachability
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: key ? { apikey: key } : {}
    });
    const latencyMs = Date.now() - startTime;

    if (!key) {
      return {
        reachable: true,
        authenticated: false,
        url,
        hasKey: false,
        latencyMs,
        message: 'Supabase URL is live and reachable. Anon API key is required to perform database queries.'
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        reachable: true,
        authenticated: false,
        url,
        hasKey: true,
        latencyMs,
        message: 'Supabase reached, but the provided Anon Key was rejected (Unauthorized). Please check your key.'
      };
    }

    // 2. Client query test
    const client = getSupabaseClient();
    if (!client) {
      return {
        reachable: true,
        authenticated: false,
        url,
        hasKey: true,
        latencyMs,
        message: 'Could not construct Supabase client.'
      };
    }

    const tablesStatus = {
      members: false,
      transactions: false,
      plot_project: false
    };

    // Test tables existence
    try {
      const { error: mErr } = await client.from('members').select('id', { count: 'exact', head: true });
      tablesStatus.members = !mErr;
    } catch {}

    try {
      const { error: tErr } = await client.from('transactions').select('id', { count: 'exact', head: true });
      tablesStatus.transactions = !tErr;
    } catch {}

    try {
      const { error: pErr } = await client.from('plot_project').select('id', { count: 'exact', head: true });
      tablesStatus.plot_project = !pErr;
    } catch {}

    const tablesFound = Object.values(tablesStatus).filter(Boolean).length;

    return {
      reachable: true,
      authenticated: true,
      url,
      hasKey: true,
      latencyMs,
      tablesStatus,
      message: tablesFound === 3
        ? `Connected to Supabase (${latencyMs}ms). All 3 tables (members, transactions, plot_project) are ready!`
        : tablesFound > 0
        ? `Connected to Supabase (${latencyMs}ms). Found ${tablesFound} of 3 tables. Run migration SQL for full sync.`
        : `Connected to Supabase (${latencyMs}ms). Database tables not created yet. Click "Run SQL Script" in Supabase.`
    };
  } catch (err: any) {
    return {
      reachable: false,
      authenticated: false,
      url,
      hasKey: Boolean(key),
      message: `Failed to reach Supabase: ${err?.message || 'Network error'}`
    };
  }
}

/**
 * Pushes the syndicate records to Supabase tables
 */
export async function syncSyndicateDataToSupabase(
  members: Member[],
  transactions: Transaction[],
  project: PlotProject
): Promise<{ success: boolean; syncedMembers: number; syncedTransactions: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedMembers: 0,
      syncedTransactions: 0,
      error: 'Supabase client is not configured. Please supply your Anon Key.'
    };
  }

  try {
    // 1. Sync Project
    const projectPayload = {
      id: 'aristo_plot_main',
      initiative_name: project.initiativeName,
      plot_title: project.plotTitle,
      sector: project.sector,
      location: project.location,
      plot_size: project.plotSize,
      total_target_price: project.totalTargetPrice,
      monthly_per_member_expected: project.monthlyPerMemberExpected,
      total_combined_bank_charge: project.totalCombinedBankCharge,
      combined_charge_notes: project.combinedChargeNotes,
      lead_admin_name: project.leadAdminName,
      lead_admin_designation: project.leadAdminDesignation,
      syndicate_admin_name: project.syndicateAdminName,
      syndicate_admin_designation: project.syndicateAdminDesignation,
      currency: project.currency,
      symbol: project.symbol,
      due_day_of_month: project.dueDayOfMonth,
      bank_details: project.bankDetails,
      admin_pin: project.adminPin,
      app_theme: project.appTheme,
      font_family: project.fontFamily,
      border_radius_style: project.borderRadiusStyle,
      is_maintenance_mode: project.isMaintenanceMode,
      maintenance_message: project.maintenanceMessage,
      maintenance_estimated_time: project.maintenanceEstimatedTime,
      maintenance_started_at: project.maintenanceStartedAt,
      support_contact_email: project.supportContactEmail,
      support_contact_phone: project.supportContactPhone,
      badge_text: project.badgeText,
      custom_logo_icon: project.customLogoIcon,
      custom_logo_url: project.customLogoUrl,
      escrow_directives_notes: project.escrowDirectivesNotes,
      footer_copyright: project.footerCopyright,
      updated_at: new Date().toISOString()
    };

    const { error: projErr } = await client.from('plot_project').upsert(projectPayload, { onConflict: 'id' });
    if (projErr) {
      console.warn('[Supabase] Project upsert error:', projErr);
    }

    // 2. Sync Members
    const membersPayload = members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email || null,
      mobile: m.mobile || null,
      avatar: m.avatar || null,
      role: m.role || 'member',
      nominee_name: m.nomineeName || null,
      nominee_relation: m.nomineeRelation || null,
      emergency_contact_name: m.emergencyContactName || null,
      emergency_contact_relation: m.emergencyContactRelation || null,
      emergency_contact_phone: m.emergencyContactPhone || null,
      nid_or_id: m.nidOrId || null,
      joined_date: m.joinedDate || null,
      pin: m.pin || '1234',
      approval_status: m.approvalStatus || 'approved',
      manual_net_adjustment: m.manualNetAdjustment || 0,
      custom_monthly_deposit: m.customMonthlyDeposit || null,
      notes: m.notes || null,
      updated_at: new Date().toISOString()
    }));

    const { error: memErr } = await client.from('members').upsert(membersPayload, { onConflict: 'id' });
    if (memErr) {
      throw new Error(`Members sync failed: ${memErr.message}`);
    }

    // 3. Sync Transactions
    const txPayload = transactions.map(t => ({
      id: t.id,
      member_id: t.memberId,
      member_name: t.memberName,
      date: t.date,
      amount: t.amount,
      deduction_or_fee: t.deductionOrFee || 0,
      net_amount: t.netAmount,
      method: t.method || 'Bank Transfer',
      reference_number: t.referenceNumber || null,
      deposit_bank: t.depositBank || 'The City Bank PLC',
      deposit_account_number: t.depositAccountNumber || '1781580054174',
      bank_or_channel: t.bankOrChannel || 'The City Bank PLC',
      month_period: t.monthPeriod,
      status: t.status || 'Verified',
      notes: t.notes || null,
      receipt_url: t.receiptUrl || null,
      depositor_name: t.depositorName || null,
      depositor_phone: t.depositorPhone || null,
      submitted_via: t.submittedVia || null,
      verified_at: t.verifiedAt || null,
      verified_by: t.verifiedBy || null,
      rejection_reason: t.rejectionReason || null,
      updated_at: new Date().toISOString()
    }));

    const { error: txErr } = await client.from('transactions').upsert(txPayload, { onConflict: 'id' });
    if (txErr) {
      throw new Error(`Transactions sync failed: ${txErr.message}`);
    }

    return {
      success: true,
      syncedMembers: membersPayload.length,
      syncedTransactions: txPayload.length
    };
  } catch (err: any) {
    console.error('[Supabase] Sync error:', err);
    return {
      success: false,
      syncedMembers: 0,
      syncedTransactions: 0,
      error: err?.message || 'Sync failed'
    };
  }
}

/**
 * Returns SQL setup script content
 */
export function getSupabaseSqlMigrationScript(): string {
  return `-- ARISTO FUTURE INITIATIVE - SUPABASE SCHEMA SETUP
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/fjxsnkbdiofxxjiqmexy/sql

CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    mobile TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'member',
    nominee_name TEXT,
    nominee_relation TEXT,
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_phone TEXT,
    nid_or_id TEXT,
    joined_date TEXT,
    pin TEXT DEFAULT '1234',
    approval_status TEXT DEFAULT 'approved',
    manual_net_adjustment NUMERIC DEFAULT 0,
    custom_monthly_deposit NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    date TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 2000,
    deduction_or_fee NUMERIC DEFAULT 0,
    net_amount NUMERIC NOT NULL DEFAULT 2000,
    method TEXT DEFAULT 'Bank Transfer',
    reference_number TEXT,
    deposit_bank TEXT DEFAULT 'The City Bank PLC',
    deposit_account_number TEXT DEFAULT '1781580054174',
    bank_or_channel TEXT DEFAULT 'The City Bank PLC',
    month_period TEXT NOT NULL,
    status TEXT DEFAULT 'Verified',
    notes TEXT,
    receipt_url TEXT,
    depositor_name TEXT,
    depositor_phone TEXT,
    submitted_via TEXT,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plot_project (
    id TEXT PRIMARY KEY,
    initiative_name TEXT NOT NULL DEFAULT 'Aristo Future Initiative',
    plot_title TEXT DEFAULT 'Joint Initiative Fund',
    sector TEXT DEFAULT 'Collaborative Deposit & Savings Initiative',
    location TEXT DEFAULT 'Dhaka, Bangladesh',
    plot_size TEXT DEFAULT '11 Joint Participants',
    total_target_price NUMERIC DEFAULT 11000000,
    monthly_per_member_expected NUMERIC DEFAULT 2000,
    total_combined_bank_charge NUMERIC DEFAULT 0,
    combined_charge_notes TEXT,
    lead_admin_name TEXT DEFAULT 'Md. Minhazul Islam Abir',
    lead_admin_designation TEXT DEFAULT 'Lead Admin & Chief Trustee',
    syndicate_admin_name TEXT DEFAULT 'Md. Mostak Ahmed',
    syndicate_admin_designation TEXT DEFAULT 'Syndicate Admin & Treasury Officer',
    currency TEXT DEFAULT 'BDT',
    symbol TEXT DEFAULT '৳',
    due_day_of_month INTEGER DEFAULT 10,
    bank_details JSONB,
    admin_pin TEXT DEFAULT '2026',
    app_theme TEXT DEFAULT 'emerald',
    font_family TEXT DEFAULT 'inter',
    border_radius_style TEXT DEFAULT 'smooth',
    is_maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    maintenance_estimated_time TEXT,
    maintenance_started_at TEXT,
    support_contact_email TEXT,
    support_contact_phone TEXT,
    badge_text TEXT,
    custom_logo_icon TEXT,
    custom_logo_url TEXT,
    escrow_directives_notes TEXT,
    footer_copyright TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reminders (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    channel TEXT DEFAULT 'WhatsApp',
    recipient TEXT NOT NULL,
    month_period TEXT NOT NULL,
    status TEXT DEFAULT 'Sent',
    delivery_status TEXT DEFAULT 'Delivered',
    message_preview TEXT,
    triggered_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plot_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on members" ON public.members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on plot_project" ON public.plot_project FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);
`;
}
