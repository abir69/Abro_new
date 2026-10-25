-- ==============================================================================
-- ARISTO FUTURE INITIATIVE - SUPABASE DATABASE SCHEMA MIGRATION
-- Database URL: https://fjxsnkbdiofxxjiqmexy.supabase.co
-- ==============================================================================

-- 1. Members Table (11 Joint Syndicate Members & Administration)
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

-- 2. Transactions Table (Monthly Regular Syndicate Deposits & Approvals Queue)
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

-- 3. Project Configuration Table (Treasury & Syndicate Settings)
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

-- 4. Reminders Audit Table
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

-- 5. Enable Row Level Security (RLS) & Grant Public Anon Access
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plot_project ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Allow anon read/write access for web application operations
CREATE POLICY "Allow public read access on members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on members" ON public.members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on plot_project" ON public.plot_project FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on plot_project" ON public.plot_project FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on reminders" ON public.reminders FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on reminders" ON public.reminders FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_member_id ON public.transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_month_period ON public.transactions(month_period);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
