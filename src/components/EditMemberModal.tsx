import React, { useState, useEffect } from 'react';
import { Member, Transaction } from '../types';
import { formatCurrency, formatDate } from '../services/storageService';
import { 
  X, 
  Check, 
  Camera, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Heart, 
  Trash2, 
  Edit3, 
  ReceiptText, 
  SlidersHorizontal,
  CheckCircle2,
  Plus,
  AlertCircle,
  Loader2,
  RotateCcw,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSaveMember: (updatedMember: Member) => void;
  isAdmin: boolean;
  currentMemberId?: string;
  transactions?: Transaction[];
  onDeleteTransaction?: (txId: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onAddNewDeposit?: (memberId: string) => void;
  projectSymbol?: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
];

/**
 * Client-side Canvas Image Compressor & Square-Cropper.
 * Transforms photos (up to 15MB) into lightweight 256x256 Web-safe JPEGs (~15-25KB).
 * Prevents localStorage QuotaExceededError and Firestore 1MB document size limits!
 */
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, WebP).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unable to parse image. Please try another photo.'));
      img.onload = () => {
        try {
          const targetDim = 256;
          const canvas = document.createElement('canvas');
          canvas.width = targetDim;
          canvas.height = targetDim;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }
          // Square center-crop
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;

          // Fill dark slate background in case of transparent PNG
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, targetDim, targetDim);

          // Draw cropped and scaled
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetDim, targetDim);

          // High-efficiency JPEG at 0.85 quality (~15-25KB)
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSaveMember,
  isAdmin,
  currentMemberId,
  transactions = [],
  onDeleteTransaction,
  onEditTransaction,
  onAddNewDeposit,
  projectSymbol = '৳'
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'transactions'>('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatar, setAvatar] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [nidOrId, setNidOrId] = useState('');
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [pin, setPin] = useState('1234');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [imageTab, setImageTab] = useState<'preset' | 'url' | 'file'>('file');
  const [confirmDeleteTxId, setConfirmDeleteTxId] = useState<string | null>(null);

  // Image upload and optimization states
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSizeNote, setImageSizeNote] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setMobile(member.mobile);
      setAvatar(member.avatar);
      setNomineeName(member.nomineeName || '');
      setNomineeRelation(member.nomineeRelation || '');
      setEmergencyContactName(member.emergencyContactName || '');
      setEmergencyContactRelation(member.emergencyContactRelation || '');
      setEmergencyContactPhone(member.emergencyContactPhone || '');
      setNidOrId(member.nidOrId || '');
      setNotes(member.notes || '');
      setRole(member.role);
      setApprovalStatus(member.approvalStatus || 'approved');
      setPin(member.pin || '1234');
      setCustomUrlInput(member.avatar || '');
      setImageError(null);
      setImageSizeNote(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const isSelf = currentMemberId === member.id;
  const isAuthorized = isAdmin || isSelf;

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Profile Update Restricted</h3>
          <p className="text-xs text-slate-300 mb-4 leading-relaxed">
            Syndicate rules permit members to update <strong>only their own profile</strong>. You can view {member.name}'s information and financial records in view-only mode, but cannot edit their profile.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Filter transactions for this member
  const memberTxs = transactions
    .filter(t => t.memberId === member.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const memberGross = memberTxs.reduce((sum, t) => sum + t.amount, 0);
  const memberNet = memberTxs.reduce((sum, t) => sum + (t.netAmount !== undefined ? t.netAmount : t.amount), 0) + (member.manualNetAdjustment || 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);
    setIsProcessingImage(true);
    setImageSizeNote(null);

    try {
      const compressedDataUrl = await compressImageFile(file);
      setAvatar(compressedDataUrl);
      setCustomUrlInput('');
      const approxKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setImageSizeNote(`Optimized (${approxKb} KB)`);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setImageError(err?.message || 'Could not process image file. Please try another photo.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setImageError(null);
      setImageSizeNote('Custom URL set');
    }
  };

  const handleSetInitialsAvatar = () => {
    const fallbackName = name.trim() || member.name;
    const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=059669&color=fff&size=256&bold=true`;
    setAvatar(initialsUrl);
    setCustomUrlInput(initialsUrl);
    setImageError(null);
    setImageSizeNote('Clean Monogram Set');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !mobile.trim()) {
      return;
    }

    // Determine the exact avatar to persist:
    // If user entered a URL in the Image URL tab, prioritize it directly!
    let finalAvatar = avatar.trim();
    if (imageTab === 'url' && customUrlInput.trim()) {
      finalAvatar = customUrlInput.trim();
    }
    if (!finalAvatar) {
      finalAvatar = member.avatar || PRESET_AVATARS[0];
    }

    const updated: Member = {
      ...member,
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      avatar: finalAvatar,
      nomineeName: nomineeName.trim(),
      nomineeRelation: nomineeRelation.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactRelation: emergencyContactRelation.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      nidOrId: nidOrId.trim(),
      notes: notes.trim(),
      role: isAdmin ? role : member.role,
      approvalStatus: isAdmin ? approvalStatus : (member.approvalStatus || 'approved'),
      pin: pin.trim() || member.pin
    };

    onSaveMember(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={avatar || member.avatar}
              alt={name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/60 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{member.name}</h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {member.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">Edit member profile details & manage deposit transactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/50 hover:border-rose-400 transition-all cursor-pointer shadow-sm flex items-center gap-1 font-semibold text-xs shrink-0"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold text-xs">Close</span>
          </button>
        </div>

        {/* Tab Switcher: Profile vs Member Transactions */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-5 pt-2 gap-2 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Information</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`pb-2.5 px-3 font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Manage Deposits & Transactions</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-emerald-300 font-bold ml-1">
              {memberTxs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Profile Information */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Avatar Preview & Selection */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={avatar || PRESET_AVATARS[0]}
                      alt={name}
                      onError={(e) => {
                        // Fallback gracefully to UI Avatars initials
                        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || member.name)}&background=059669&color=fff&size=256`;
                        (e.target as HTMLImageElement).src = fallback;
                      }}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500 shrink-0 shadow-lg bg-slate-800"
                    />
                    {isProcessingImage && (
                      <div className="absolute inset-0 bg-slate-950/80 rounded-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">Member Profile Picture</span>
                      {imageSizeNote && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {imageSizeNote}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Choose a photo, preset, or paste a link. Photos are automatically compressed for cloud sync.
                    </p>
                  </div>
                </div>

                {/* Reset or Monogram Quick Actions */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleSetInitialsAvatar}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Generate clean monogram avatar with your initials"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Use Initials</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar(member.avatar);
                      setCustomUrlInput(member.avatar);
                      setImageSizeNote(null);
                      setImageError(null);
                    }}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Revert to previously saved picture"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Source Tabs */}
              <div className="flex items-center gap-1 text-xs border-b border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setImageTab('file')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    imageTab === 'file' 
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('preset')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    imageTab === 'preset' 
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Preset Avatars</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    imageTab === 'url' 
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>

              {/* TAB 1: File Upload with Automatic Compression */}
              {imageTab === 'file' && (
                <div className="pt-1">
                  <label className="flex flex-col sm:flex-row items-center justify-center gap-3 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-4 cursor-pointer transition-all bg-slate-950/40 hover:bg-emerald-950/10 group">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isProcessingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                      ) : (
                        <Upload className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-semibold text-slate-200 block group-hover:text-emerald-300 transition-colors">
                        {isProcessingImage ? 'Optimizing photo for cloud storage...' : 'Click or tap to choose a photo'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Supports JPEG, PNG, WebP (camera photos are auto-cropped & compressed to &lt; 25KB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isProcessingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* TAB 2: Preset Gallery */}
              {imageTab === 'preset' && (
                <div className="pt-1 space-y-2">
                  <div className="grid grid-cols-6 sm:grid-cols-6 gap-2.5">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAvatar(url);
                          setCustomUrlInput(url);
                          setImageSizeNote(null);
                          setImageError(null);
                        }}
                        className={`relative rounded-full overflow-hidden p-0.5 border-2 transition-all cursor-pointer ${
                          avatar === url ? 'border-emerald-400 ring-2 ring-emerald-500/50 scale-105' : 'border-transparent hover:border-slate-600 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${i + 1}`} className="w-10 h-10 rounded-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Custom URL with Auto-Sync */}
              {imageTab === 'url' && (
                <div className="pt-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomUrlInput(val);
                        if (val.trim().startsWith('http://') || val.trim().startsWith('https://') || val.trim().startsWith('data:')) {
                          setAvatar(val.trim());
                        }
                      }}
                      placeholder="https://images.unsplash.com/... or web image link"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Tip: Direct URLs ending with .jpg, .png or Unsplash portrait links work best.
                  </span>
                </div>
              )}

              {/* Error Banner */}
              {imageError && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>

            {/* Member Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Email and Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address (Contribution Reminders)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Mobile / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+880 1712-..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Nominee Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nominee Full Name
                </label>
                <input
                  type="text"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                  placeholder="e.g. Salma Begum"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nominee Relationship
                </label>
                <input
                  type="text"
                  value={nomineeRelation}
                  onChange={(e) => setNomineeRelation(e.target.value)}
                  placeholder="e.g. Spouse / Mother / Son"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-rose-900/40 space-y-2.5">
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">Emergency Contact (Strictly Confidential)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Designated contact for urgent syndicate matters, medical, or legal verification. Only you and Lead Admin can view these details.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Kazi Farhana"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={emergencyContactRelation}
                    onChange={(e) => setEmergencyContactRelation(e.target.value)}
                    placeholder="e.g. Sister / Brother"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+880 17..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* National ID & Login PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  NID / Passport Number
                </label>
                <input
                  type="text"
                  value={nidOrId}
                  onChange={(e) => setNidOrId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Security PIN (Login)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 tracking-wider focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Setting a new PIN replaces the old PIN completely.
                </span>
              </div>
            </div>

            {/* Admin Role Toggle */}
            {isAdmin && (
              <>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Initiative Role</span>
                    <span className="text-[11px] text-slate-400 block">
                      Admins have full ledger editing & reminder dispatch authority
                    </span>
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Login Approval Status</span>
                    <span className="text-[11px] text-slate-400 block">
                      Controls member portal login approval & authorization
                    </span>
                  </div>
                  <select
                    value={approvalStatus}
                    onChange={(e) => setApprovalStatus(e.target.value as 'approved' | 'pending' | 'rejected')}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Remarks / Portfolio Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Planning Lead, Accounts Auditor"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            </div>

            {/* Sticky Submit Bar */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Member Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Manage Deposits & Functional Delete Transaction Button */}
        {activeTab === 'transactions' && (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Gross Deposited</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {formatCurrency(memberGross, projectSymbol)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{memberTxs.length} monthly installments</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Net Balance Credited</span>
                <span className="text-base font-bold font-mono text-emerald-300 mt-0.5 block">
                  {formatCurrency(Math.round(memberNet), projectSymbol)}
                </span>
                <span className="text-[10px] text-slate-400">Escrow Balance</span>
              </div>
            </div>

            {/* Notice / Action Header */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ReceiptText className="w-4 h-4 text-emerald-400" />
                <span>Transaction History for {member.name}</span>
              </span>

              {isAdmin && onAddNewDeposit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAddNewDeposit(member.id);
                  }}
                  className="bg-emerald-600/90 hover:bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Deposit</span>
                </button>
              )}
            </div>

            {/* Transactions List */}
            {memberTxs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs border border-slate-800 rounded-xl bg-slate-950/40">
                No deposit transactions recorded for {member.name} yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {memberTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{tx.monthPeriod}</span>
                        <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                          {tx.referenceNumber}
                        </span>
                        <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/80 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-2">
                        <span>{formatDate(tx.date)}</span>
                        <span>·</span>
                        <span>{tx.method}</span>
                        {tx.bankOrChannel && (
                          <>
                            <span>·</span>
                            <span className="text-slate-500">{tx.bankOrChannel}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-white text-xs">
                          {formatCurrency(tx.amount, projectSymbol)}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          Net: {formatCurrency(tx.netAmount !== undefined ? tx.netAmount : tx.amount, projectSymbol)}
                        </div>
                      </div>

                      {/* Admin Actions: Edit & Functional Delete Button */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                          {onEditTransaction && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onEditTransaction(tx);
                              }}
                              title="Edit transaction details"
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center gap-1 transition-colors text-[11px] border border-slate-700"
                            >
                              <Edit3 className="w-3 h-3 text-emerald-400" />
                              <span>Edit</span>
                            </button>
                          )}

                          {confirmDeleteTxId === tx.id ? (
                            <div className="flex items-center gap-1.5 animate-fadeIn">
                              <span className="text-[10px] text-rose-400 font-bold">Delete?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onDeleteTransaction) onDeleteTransaction(tx.id);
                                  setConfirmDeleteTxId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold shadow cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteTxId(null)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTxId(tx.id)}
                              title="Delete / Void this transaction"
                              className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg flex items-center gap-1 transition-colors text-[11px] border border-rose-800/80 hover:border-rose-600 font-semibold cursor-pointer shadow-sm"
                            >
                              <Trash2 className="w-3 h-3 text-rose-400 hover:text-white" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Close footer for Tab 2 */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
