import React, { useState, useEffect } from 'react';
import { PlotProject } from '../types';
import { formatCurrency } from '../services/storageService';
import { X, Check, Landmark, ShieldCheck, Calculator } from 'lucide-react';

interface AdjustCombinedBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PlotProject;
  totalGrossDeposits: number;
  onSaveCombinedCharge: (charge: number, notes?: string) => void;
}

export const AdjustCombinedBalanceModal: React.FC<AdjustCombinedBalanceModalProps> = ({
  isOpen,
  onClose,
  project,
  totalGrossDeposits,
  onSaveCombinedCharge
}) => {
  const [chargeInput, setChargeInput] = useState<string>(
    project.totalCombinedBankCharge !== undefined ? String(project.totalCombinedBankCharge) : '0'
  );
  const [notes, setNotes] = useState<string>(project.combinedChargeNotes || '');

  useEffect(() => {
    if (isOpen) {
      setChargeInput(project.totalCombinedBankCharge !== undefined ? String(project.totalCombinedBankCharge) : '0');
      setNotes(project.combinedChargeNotes || 'The City Bank PLC account maintenance & ledger charges');
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const parsedCharge = parseFloat(chargeInput);
  const validCharge = isNaN(parsedCharge) ? 0 : Math.max(0, parsedCharge);
  const resultingNet = Math.max(0, totalGrossDeposits - validCharge);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCombinedCharge(validCharge, notes.trim());
    onClose();
  };

  const presetAmounts = [
    { label: '৳ 0 (None)', value: 0 },
    { label: '৳ 15.50 (SMS)', value: 15.5 },
    { label: '৳ 150.00 (Ledger)', value: 150 },
    { label: '৳ 230.50 (Tax/Fee)', value: 230.5 },
    { label: '৳ 500.00 (Maint)', value: 500 },
    { label: '৳ 1,000.00 (Annual)', value: 1000 }
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Adjust Combined Bank & Service Charge</h3>
              <p className="text-xs text-slate-400">Applied manually to total combined treasury balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Real-time Financial Breakdown */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Total Combined Gross Deposits:</span>
              <span className="font-bold text-white">{formatCurrency(totalGrossDeposits, project.symbol)}</span>
            </div>
            <div className="flex justify-between text-amber-400 border-t border-slate-800/80 pt-2">
              <span>Combined Bank & Service Charge:</span>
              <span className="font-bold">
                {validCharge > 0 ? `-${formatCurrency(validCharge, project.symbol)}` : '৳ 0'}
              </span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-2 text-sm">
              <span>Resulting Total Net Balance:</span>
              <span>{formatCurrency(resultingNet, project.symbol)}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Bank charges are deducted from the <strong>combined syndicate balance</strong> instead of individual member ledgers. All 11 members retain clean deposit records.
            </span>
          </div>

          {/* Charge Input with Decimal Support */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Manual Bank / Service Charge Amount (BDT)
              </label>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                Decimals supported (e.g. 15.50)
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                ৳
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={chargeInput}
                onChange={(e) => setChargeInput(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports decimal and fractional amounts (e.g. ৳ 15.50, ৳ 120.75, ৳ 250.25).
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetAmounts.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setChargeInput(String(preset.value))}
                  className={`px-2.5 py-1 text-[11px] rounded-lg border font-mono transition-colors ${
                    validCharge === preset.value
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Charge Reason / Bank Statement Reference
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. EBL ledger maintenance, SMS alert & bank excise duty"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-amber-950 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Combined Charge</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
