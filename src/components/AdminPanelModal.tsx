import React, { useState, useEffect } from 'react';
import { PlotProject, ThemeMode, Member } from '../types';
import { applyThemeAndStyles } from '../services/storageService';
import { 
  X, 
  Check, 
  Settings, 
  Sun, 
  Moon, 
  Palette, 
  Type, 
  Building2, 
  Landmark, 
  Wrench, 
  ShieldCheck, 
  Download, 
  Save, 
  Sparkles,
  Smartphone,
  Info,
  Clock,
  Layers,
  Shield,
  Gem,
  KeyRound,
  RotateCcw
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PlotProject;
  onSaveProject: (updated: PlotProject, newAdminPin?: string) => void;
  themeMode: ThemeMode;
  onToggleThemeMode: () => void;
  initialTab?: 'appearance' | 'branding' | 'directives' | 'maintenance' | 'footer';
  onExportStandaloneHtml?: () => void;
  onExportCSV?: () => void;
  adminMember?: Member | null;
  onSaveAdminPin?: (newPin: string) => void;
  onRestoreOriginalData?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProject,
  themeMode,
  onToggleThemeMode,
  initialTab = 'appearance',
  onExportStandaloneHtml,
  onExportCSV,
  adminMember,
  onSaveAdminPin,
  onRestoreOriginalData
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'branding' | 'directives' | 'maintenance' | 'footer'>(initialTab);

  // Appearance States
  const [selectedTheme, setSelectedTheme] = useState<'emerald' | 'indigo' | 'blue' | 'violet' | 'amber' | 'slate'>(
    project.appTheme || 'emerald'
  );
  const [selectedFont, setSelectedFont] = useState<'inter' | 'roboto' | 'outfit' | 'jakarta' | 'mono'>(
    project.fontFamily || 'inter'
  );
  const [selectedRadius, setSelectedRadius] = useState<'smooth' | 'rounded' | 'sharp'>(
    project.borderRadiusStyle || 'smooth'
  );

  // Branding States
  const [initiativeName, setInitiativeName] = useState(project.initiativeName || 'Aristo Future Initiative');
  const [sector, setSector] = useState(project.sector || 'Collaborative Deposit & Savings Initiative');
  const [location, setLocation] = useState(project.location || 'Dhaka, Bangladesh');
  const [badgeText, setBadgeText] = useState(project.badgeText || '11 Members');
  const [logoIcon, setLogoIcon] = useState<'building' | 'landmark' | 'shield' | 'layers' | 'gem'>(
    project.customLogoIcon || 'building'
  );
  const [customLogoUrl, setCustomLogoUrl] = useState(project.customLogoUrl || '');

  // Escrow Directives States (Request 3)
  const [accountName, setAccountName] = useState(project.bankDetails?.accountName || '');
  const [bankName, setBankName] = useState(project.bankDetails?.bankName || '');
  const [branch, setBranch] = useState(project.bankDetails?.branch || '');
  const [accountNumber, setAccountNumber] = useState(project.bankDetails?.accountNumber || '');
  const [routingNumber, setRoutingNumber] = useState(project.bankDetails?.routingNumber || '');
  const [mfsNumber, setMfsNumber] = useState(project.bankDetails?.mfsNumber || '');
  const [escrowNotes, setEscrowNotes] = useState(project.escrowDirectivesNotes || '');

  // Maintenance Mode States (Request 8)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(!!project.isMaintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    project.maintenanceMessage || 'Scheduled Syndicate Treasury Audit & Maintenance. Member access will resume shortly.'
  );
  const [maintenanceEstimatedTime, setMaintenanceEstimatedTime] = useState(
    project.maintenanceEstimatedTime || 'October 17, 2026, 6:00 PM BST'
  );

  // Header & Footer States
  const [leadAdminName, setLeadAdminName] = useState(project.leadAdminName || '');
  const [leadAdminDesignation, setLeadAdminDesignation] = useState(project.leadAdminDesignation || 'Lead Admin & Chief Trustee');
  const [syndicateAdminName, setSyndicateAdminName] = useState(project.syndicateAdminName || '');
  const [syndicateAdminDesignation, setSyndicateAdminDesignation] = useState(project.syndicateAdminDesignation || 'Syndicate Admin & Treasury Officer');
  const [footerCopyright, setFooterCopyright] = useState(project.footerCopyright || `© 2026 ${project.initiativeName} · All Rights Reserved`);
  const [supportEmail, setSupportEmail] = useState(project.supportContactEmail || 'miabir9927@gmail.com');
  const [supportPhone, setSupportPhone] = useState(project.supportContactPhone || '+880 1712-992700');
  const [adminPin, setAdminPin] = useState(adminMember?.pin || '2026');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedTheme(project.appTheme || 'emerald');
      setSelectedFont(project.fontFamily || 'inter');
      setSelectedRadius(project.borderRadiusStyle || 'smooth');
      setInitiativeName(project.initiativeName || 'Aristo Future Initiative');
      setSector(project.sector || 'Collaborative Deposit & Savings Initiative');
      setLocation(project.location || 'Dhaka, Bangladesh');
      setBadgeText(project.badgeText || '11 Members');
      setLogoIcon(project.customLogoIcon || 'building');
      setCustomLogoUrl(project.customLogoUrl || '');
      setAccountName(project.bankDetails?.accountName || '');
      setBankName(project.bankDetails?.bankName || '');
      setBranch(project.bankDetails?.branch || '');
      setAccountNumber(project.bankDetails?.accountNumber || '');
      setRoutingNumber(project.bankDetails?.routingNumber || '');
      setMfsNumber(project.bankDetails?.mfsNumber || '');
      setEscrowNotes(project.escrowDirectivesNotes || '');
      setIsMaintenanceMode(!!project.isMaintenanceMode);
      setMaintenanceMessage(project.maintenanceMessage || 'Scheduled Syndicate Treasury Audit & Maintenance. Member access will resume shortly.');
      setMaintenanceEstimatedTime(project.maintenanceEstimatedTime || 'October 17, 2026, 6:00 PM BST');
      setLeadAdminName(project.leadAdminName || '');
      setLeadAdminDesignation(project.leadAdminDesignation || 'Lead Admin & Chief Trustee');
      setSyndicateAdminName(project.syndicateAdminName || '');
      setSyndicateAdminDesignation(project.syndicateAdminDesignation || 'Syndicate Admin & Treasury Officer');
      setFooterCopyright(project.footerCopyright || `© 2026 ${project.initiativeName} · All Rights Reserved`);
      setSupportEmail(project.supportContactEmail || 'miabir9927@gmail.com');
      setSupportPhone(project.supportContactPhone || '+880 1712-992700');
      setAdminPin(project.adminPin || adminMember?.pin || '2026');
    }
  }, [isOpen, project, initialTab, adminMember]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Revert preview to saved project styles if dismissed without saving
    applyThemeAndStyles(project.appTheme, project.fontFamily, project.borderRadiusStyle);
    onClose();
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pinToSet = adminPin.trim() || project.adminPin || adminMember?.pin || '2026';
    const updated: PlotProject = {
      ...project,
      initiativeName: initiativeName.trim() || project.initiativeName,
      sector: sector.trim() || project.sector,
      location: location.trim() || project.location,
      badgeText: badgeText.trim() || '11 Members',
      appTheme: selectedTheme,
      fontFamily: selectedFont,
      borderRadiusStyle: selectedRadius,
      customLogoIcon: logoIcon,
      customLogoUrl: customLogoUrl.trim(),
      adminPin: pinToSet,
      bankDetails: {
        ...project.bankDetails,
        accountName: accountName.trim() || project.bankDetails.accountName,
        bankName: bankName.trim() || project.bankDetails.bankName,
        branch: branch.trim() || project.bankDetails.branch,
        accountNumber: accountNumber.trim() || project.bankDetails.accountNumber,
        routingNumber: routingNumber.trim() || project.bankDetails.routingNumber,
        mfsNumber: mfsNumber.trim() || project.bankDetails.mfsNumber
      },
      escrowDirectivesNotes: escrowNotes.trim(),
      isMaintenanceMode,
      maintenanceMessage: maintenanceMessage.trim(),
      maintenanceEstimatedTime: maintenanceEstimatedTime.trim(),
      maintenanceStartedAt: isMaintenanceMode ? (project.maintenanceStartedAt || new Date().toISOString()) : '',
      leadAdminName: leadAdminName.trim() || project.leadAdminName,
      leadAdminDesignation: leadAdminDesignation.trim(),
      syndicateAdminName: syndicateAdminName.trim(),
      syndicateAdminDesignation: syndicateAdminDesignation.trim(),
      footerCopyright: footerCopyright.trim(),
      supportContactEmail: supportEmail.trim(),
      supportContactPhone: supportPhone.trim()
    };

    applyThemeAndStyles(selectedTheme, selectedFont, selectedRadius);

    if (onSaveAdminPin && pinToSet) {
      onSaveAdminPin(pinToSet);
    }

    onSaveProject(updated, pinToSet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[94vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Admin Control & Style Panel</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                  Lead Admin
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Customize app theme, fonts, styling, logo, directives, and maintenance mode
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/50 hover:border-rose-400 transition-all cursor-pointer shadow-sm flex items-center gap-1 font-semibold text-xs shrink-0"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold text-xs">Close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-2 sm:p-3 bg-slate-950/90 border-b border-slate-800/80 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme & Style</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'branding'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Logo & Branding</span>
            </button>

            <button
              onClick={() => setActiveTab('directives')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'directives'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Escrow Directives</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'maintenance'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance Mode</span>
              {isMaintenanceMode && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('footer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'footer'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Profile & Backup</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: THEME & STYLES */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Light / Dark Mode Toggle */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {themeMode === 'dark' ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span>Theme Display Mode</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Currently in <strong className="text-emerald-400 capitalize">{themeMode} Mode</strong>. Switch between sleek dark theme and crisp daylight high-contrast theme.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleThemeMode}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {themeMode === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Switch to Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-sky-400" />
                      <span>Switch to Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Accent Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'emerald', name: 'Emerald Green', color: 'bg-emerald-500', desc: 'Syndicate Classic' },
                    { id: 'indigo', name: 'Royal Indigo', color: 'bg-indigo-500', desc: 'Trust & Modern' },
                    { id: 'blue', name: 'Ocean Blue', color: 'bg-sky-500', desc: 'Corporate Crisp' },
                    { id: 'violet', name: 'Deep Violet', color: 'bg-violet-500', desc: 'Premium Royal' },
                    { id: 'amber', name: 'Warm Amber', color: 'bg-amber-500', desc: 'Golden Treasury' },
                    { id: 'slate', name: 'Monochrome Slate', color: 'bg-slate-400', desc: 'Minimalist' }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(theme.id as any);
                        applyThemeAndStyles(theme.id, selectedFont, selectedRadius);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedTheme === theme.id
                          ? 'border-emerald-500 bg-slate-950/90 ring-1 ring-emerald-500/50'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${theme.color} shrink-0`} />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">{theme.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{theme.desc}</span>
                      </div>
                      {selectedTheme === theme.id && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography / Font Family */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Typography & Font Family
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'inter', name: 'Inter (Modern Sans)', sample: 'Clean, high-legibility interface typography' },
                    { id: 'roboto', name: 'Roboto (Neutral Sans)', sample: 'Structured standard Android & Web styling' },
                    { id: 'jakarta', name: 'Plus Jakarta Sans', sample: 'Executive, modern corporate presentation' },
                    { id: 'outfit', name: 'Outfit (Geometric)', sample: 'Contemporary premium geometric headings' },
                    { id: 'mono', name: 'Space Mono (Financial)', sample: 'Numeric ledger & treasury font' }
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        setSelectedFont(font.id as any);
                        applyThemeAndStyles(selectedTheme, font.id, selectedRadius);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedFont === font.id
                          ? 'border-emerald-500 bg-slate-950/90 ring-1 ring-emerald-500/50'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{font.name}</span>
                        {selectedFont === font.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400 block leading-tight">{font.sample}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Corner & Container Styling */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Card Border Radius Style
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'smooth', label: 'Smooth (rounded-xl)', preview: 'rounded-xl' },
                    { id: 'rounded', label: 'Modern (rounded-2xl)', preview: 'rounded-2xl' },
                    { id: 'sharp', label: 'Crisp (rounded-md)', preview: 'rounded-md' }
                  ].map((rad) => (
                    <button
                      key={rad.id}
                      type="button"
                      onClick={() => {
                        setSelectedRadius(rad.id as any);
                        applyThemeAndStyles(selectedTheme, selectedFont, rad.id);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedRadius === rad.id
                          ? 'border-emerald-500 bg-slate-950/90 ring-1 ring-emerald-500/50'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-xs font-semibold text-white block">{rad.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANDING & LOGO */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Initiative Name
                </label>
                <input
                  type="text"
                  value={initiativeName}
                  onChange={(e) => setInitiativeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. Aristo Future Initiative"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Sector / Focus
                  </label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Collaborative Savings Initiative"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Location / Region
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Dhaka, Bangladesh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Header Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 11 Members"
                />
              </div>

              {/* Logo Icon Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Logo Icon (Default Brand Icon)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'building', name: 'Building', icon: Building2 },
                    { id: 'landmark', name: 'Treasury', icon: Landmark },
                    { id: 'shield', name: 'Shield', icon: Shield },
                    { id: 'layers', name: 'Ledger', icon: Layers },
                    { id: 'gem', name: 'Aristo Gem', icon: Gem }
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLogoIcon(item.id as any)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          logoIcon === item.id
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 ring-1 ring-emerald-500/50'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Logo Image URL */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/logo.png"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  If provided, replaces the vector icon with your custom corporate logo image.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: SYNDICATE ESCROW DEPOSIT DIRECTIVES (Request 3) */}
          {activeTab === 'directives' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <Landmark className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Syndicate Escrow Deposit Directives:</strong> These official banking coordinates are dispatched to members in automated contribution notices, receipts, and Google Form vouchers.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Beneficiary Account Name *
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Aristo Future Initiative (Joint Escrow)"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. The City Bank PLC"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Principal Branch, Dhaka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="1781580054174"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="225272654"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  MFS Merchant / Personal bKash or Nagad Channel
                </label>
                <input
                  type="text"
                  value={mfsNumber}
                  onChange={(e) => setMfsNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+880 1712-992700 (bKash Merchant / Personal)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Additional Escrow Instructions & Deposit Notes
                </label>
                <textarea
                  rows={2}
                  value={escrowNotes}
                  onChange={(e) => setEscrowNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter remarks to include in payment instructions, e.g., 'Please include your Member ID in deposit slip remarks.'"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MAINTENANCE MODE (Request 8) */}
          {activeTab === 'maintenance' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-white block">
                    Maintenance Mode Status
                  </span>
                  <p className="text-xs text-slate-400">
                    {isMaintenanceMode 
                      ? 'Active: Public & regular member access is halted. Only Admin can log in.' 
                      : 'Disabled: All members and participants have regular access.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isMaintenanceMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Public Maintenance Announcement Message
                </label>
                <textarea
                  rows={3}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="The portal is undergoing scheduled maintenance..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Estimated Resumption Time
                </label>
                <input
                  type="text"
                  value={maintenanceEstimatedTime}
                  onChange={(e) => setMaintenanceEstimatedTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. October 17, 2026, 6:00 PM BST"
                />
              </div>
            </div>
          )}

          {/* TAB 5: ADMIN PROFILE, BACKUP & SIGNATORIES */}
          {activeTab === 'footer' && (
            <div className="space-y-4">
              {/* Admin Profile Overview Notice */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Lead Admin Profile & Syndicate Signatories</h4>
                  <p className="text-[11px] text-slate-400">
                    Changes made here synchronize immediately to cloud Firestore, local storage, and the member profile so your credentials and information never reset.
                  </p>
                </div>
              </div>

              {/* Data Export & Restoration Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {onExportStandaloneHtml && (
                  <button
                    type="button"
                    onClick={onExportStandaloneHtml}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">Export Standalone HTML</span>
                      <span className="text-[10px] text-slate-400 block">Single offline HTML file</span>
                    </div>
                  </button>
                )}

                {onExportCSV && (
                  <button
                    type="button"
                    onClick={onExportCSV}
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-all cursor-pointer flex items-center gap-2.5"
                  >
                    <Download className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">Download CSV Backup</span>
                      <span className="text-[10px] text-slate-400 block">Full transactions ledger</span>
                    </div>
                  </button>
                )}

                {onRestoreOriginalData && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Restore original authentic syndicate data? This will synchronize the 11 original members, plot initiative specs, and verified deposits.')) {
                        onRestoreOriginalData();
                        onClose();
                      }
                    }}
                    className="p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/40 text-left transition-all cursor-pointer flex items-center gap-2.5 group"
                    title="Restore authentic syndicate plot initiative data"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-400 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
                    <div>
                      <span className="text-xs font-bold text-rose-300 block">Restore Old Data</span>
                      <span className="text-[10px] text-rose-400/80 block">Sync original 11 members</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Signatories & Support Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Lead Admin Name
                  </label>
                  <input
                    type="text"
                    value={leadAdminName}
                    onChange={(e) => setLeadAdminName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Lead Admin Designation
                  </label>
                  <input
                    type="text"
                    value={leadAdminDesignation}
                    onChange={(e) => setLeadAdminDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Support Contact Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Support Contact Phone
                  </label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Admin Security PIN (Login Credentials) */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <label className="text-xs font-bold text-white block">
                    Admin Security PIN (Login Access)
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="text"
                    maxLength={10}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter Admin PIN"
                    className="w-full sm:w-64 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-400">
                    Configures authentication for Syndicate Administrator access.
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mt-1">
                  Security Rule: When a new PIN is saved, the previous PIN is permanently removed and cannot be used for login anymore.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Footer Copyright Notice
                </label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={(e) => setFooterCopyright(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
