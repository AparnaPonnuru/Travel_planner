'use client';

import React, { useState, useEffect } from 'react';
import { History, X, RotateCcw, Clock } from 'lucide-react';
import { TripSnapshot, TripVersionItem } from '@/types/trip';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  currentVersion: number;
  onRestore: (restoredTrip: TripSnapshot) => void;
}

export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  tripId,
  currentVersion,
  onRestore
}: VersionHistoryDrawerProps) {
  const [versions, setVersions] = useState<TripVersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch(`/api/trips/${tripId}/versions`)
        .then(res => res.json())
        .then(data => {
          setVersions(data.versions || []);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, tripId, currentVersion]);

  const handleRestoreVersion = async (vNum: number) => {
    if (confirm(`Restore itinerary to Version ${vNum}? Current uncommitted modifications will be saved as a new version.`)) {
      setIsRestoring(true);
      try {
        const res = await fetch(`/api/trips/${tripId}/restore/${vNum}`, {
          method: 'POST'
        });
        const data = await res.json();
        if (data.trip) {
          onRestore(data.trip);
          onClose();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsRestoring(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Itinerary Version History</h3>
              <p className="text-[11px] text-slate-500 font-medium">Current Active: Version {currentVersion}</p>
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

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading version checkpoints...</div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No previous versions found.</div>
          ) : (
            versions.map((ver) => {
              const isCurrent = ver.versionNumber === currentVersion;
              return (
                <div
                  key={ver.versionNumber}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-brand-50/70 border-brand-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">Version {ver.versionNumber}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-600 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                    {ver.changeSummary || 'Itinerary update'}
                  </p>

                  {!isCurrent && (
                    <div className="pt-3 mt-3 border-t border-slate-200/80 flex justify-end">
                      <button
                        type="button"
                        disabled={isRestoring}
                        onClick={() => handleRestoreVersion(ver.versionNumber)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-brand-600 text-slate-700 hover:text-white border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore this version</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
