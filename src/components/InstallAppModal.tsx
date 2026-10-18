import React, { useState, useEffect } from 'react';
import { PlotProject } from '../types';
import { 
  ArrowLeft, 
  Smartphone, 
  Download, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle2, 
  ShieldCheck, 
  Laptop, 
  X
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PlotProject;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const [canPrompt, setCanPrompt] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('android');

  useEffect(() => {
    // Detect OS
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    if ((window as any).deferredInstallPrompt) {
      setCanPrompt(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredInstallPrompt = e;
      setCanPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalled(true);
        (window as any).deferredInstallPrompt = null;
        setCanPrompt(false);
      }
    } else {
      // Show platform guide
      if (platform === 'ios') {
        alert('To install on iPhone/iPad: Tap the Share button at bottom, then choose "Add to Home Screen".');
      } else {
        alert('To install: Tap browser menu (⋮) at top right and select "Install app" or "Add to Home screen".');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Top Header with Back Button */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Return back to previous view"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back</span>
          </button>

          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Install App</span>
          </span>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* App Info Box */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            {project.customLogoUrl ? (
              <img
                src={project.customLogoUrl}
                alt={project.initiativeName}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 flex items-center justify-center shadow-md">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-white truncate">
                {project.initiativeName}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {project.sector || 'Joint Deposit & Ledger Portal'}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Fast, Standalone & Offline Ready</span>
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {installed && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Application has been installed to your home screen!</span>
            </div>
          )}

          {/* Install Trigger Button */}
          <div>
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{canPrompt ? 'Install App to Home Screen' : 'Install / Add to Home Screen'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Works like a native app without requiring an App Store download.
            </p>
          </div>

          {/* Platform Tab Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Installation Instructions
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPlatform('android')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-colors ${
                  platform === 'android' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Android
              </button>
              <button
                type="button"
                onClick={() => setPlatform('ios')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-colors ${
                  platform === 'ios' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                iPhone/iPad
              </button>
              <button
                type="button"
                onClick={() => setPlatform('desktop')}
                className={`py-1.5 px-2 rounded-lg font-medium transition-colors ${
                  platform === 'desktop' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Desktop
              </button>
            </div>

            {/* Platform Specific Steps */}
            <div className="mt-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
              {platform === 'ios' && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">1</span>
                    <span>Open in <strong>Safari</strong> browser.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">2</span>
                    <span className="flex items-center gap-1">
                      Tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 text-sky-400 inline" /> at the bottom toolbar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">3</span>
                    <span className="flex items-center gap-1">
                      Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />.
                    </span>
                  </div>
                </>
              )}

              {platform === 'android' && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">1</span>
                    <span>Open in <strong>Chrome</strong> browser.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">2</span>
                    <span className="flex items-center gap-1">
                      Tap the three dots menu <MoreVertical className="w-3.5 h-3.5 text-slate-400 inline" /> at the top right.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">3</span>
                    <span>Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</span>
                  </div>
                </>
              )}

              {platform === 'desktop' && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">1</span>
                    <span className="flex items-center gap-1">
                      In Chrome or Edge, click the <strong>Install</strong> icon <Laptop className="w-3.5 h-3.5 text-emerald-400 inline" /> in the address bar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0 mt-0.5">2</span>
                    <span>Click <strong>Install</strong> to add to your desktop taskbar/dock.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Back Button */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/60">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application</span>
          </button>

          <span className="text-[11px] text-slate-500">
            PWA Progressive Web App
          </span>
        </div>
      </div>
    </div>
  );
};
