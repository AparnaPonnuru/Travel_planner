'use client';

import React from 'react';
import { Check, X, ArrowRight, TrendingDown, Footprints } from 'lucide-react';
import { ModificationResult } from '@/types/trip';

interface ChangePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: ModificationResult['appliedChanges'] | null;
  currency: string;
}

export default function ChangePreviewModal({
  isOpen,
  onClose,
  changes,
  currency
}: ChangePreviewModalProps) {
  if (!isOpen || !changes) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Changes Applied to Itinerary</h3>
              <p className="text-[11px] text-slate-500 font-medium">Dependency recalculation completed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium">
          {changes.summary}
        </p>

        {/* Itemized Diffs */}
        <div className="space-y-3">
          {changes.added.length > 0 && (
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">Added:</span>
              <ul className="list-disc list-inside mt-1 text-emerald-700 space-y-0.5 font-medium">
                {changes.added.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {changes.removed.length > 0 && (
            <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs">
              <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">Removed:</span>
              <ul className="list-disc list-inside mt-1 text-rose-700 space-y-0.5 font-medium">
                {changes.removed.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {changes.modified.length > 0 && (
            <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs">
              <span className="font-bold text-sky-800 uppercase tracking-wider text-[10px]">Adjusted Timing & Logistics:</span>
              <ul className="list-disc list-inside mt-1 text-sky-700 space-y-0.5 font-medium">
                {changes.modified.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Numbers Diffs */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-brand-600" />
              Budget Impact
            </span>
            <div className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <span>{currency} {changes.budgetBefore?.toLocaleString()}</span>
              <ArrowRight className="w-3 h-3 text-brand-600" />
              <span className="text-brand-600">{currency} {changes.budgetAfter?.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-cyan-600" />
              Walking Demand
            </span>
            <div className="text-xs font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <span>{changes.walkingBeforeKm || 4.5} km</span>
              <ArrowRight className="w-3 h-3 text-cyan-600" />
              <span className="text-cyan-700">{changes.walkingAfterKm || 3.2} km</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-md shadow-brand-500/20"
        >
          Acknowledge & Continue
        </button>

      </div>
    </div>
  );
}
