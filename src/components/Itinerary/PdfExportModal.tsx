'use client';

import React from 'react';
import { TripSnapshot } from '@/types/trip';
import { Printer, Download, X, Compass, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripSnapshot;
}

export default function PdfExportModal({
  isOpen,
  onClose,
  trip
}: PdfExportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Control Toolbar (Hidden when printing) */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-brand-500/30 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Document Container */}
      <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 max-w-4xl w-full my-8 shadow-2xl space-y-8 font-sans">
        
        {/* PDF Cover Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>VoyageAI Precision Travel Dossier</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">{trip.title}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {trip.origin} → {trip.destination} • {trip.startDate} to {trip.endDate} ({trip.durationDays} Days • {trip.durationDays - 1} Nights)
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase font-bold text-slate-500">Total Budget</div>
            <div className="text-2xl font-bold text-emerald-700">
              {trip.budget.currency} {trip.budgetBreakdown.totalPlanned.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500">Includes 8% Contingency Reserve</span>
          </div>
        </div>

        {/* Trip Overview Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Travelers</span>
            <span className="font-bold text-slate-900">{trip.travelers.adults + trip.travelers.children} ({trip.travelers.partyType})</span>
          </div>
          <div>
            <span className="text-slate-500 block">Travel Style</span>
            <span className="font-bold text-slate-900 capitalize">{trip.travelStyles.slice(0, 2).join(', ')}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Primary Transit</span>
            <span className="font-bold text-slate-900 capitalize">{trip.transportPreferences.primary}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Route Sequence</span>
            <span className="font-bold text-slate-900">{trip.routeSequence.join(' → ')}</span>
          </div>
        </div>

        {/* Budget Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b pb-1">
            Itemized Budget Allocation
          </h3>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-1.5">Category</th>
                <th className="py-1.5">Estimated Cost</th>
                <th className="py-1.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(trip.budgetBreakdown.categories).map(([key, val]) => (
                <tr key={key}>
                  <td className="py-2 font-semibold capitalize text-slate-800">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td className="py-2 font-mono text-slate-900">
                    {trip.budget.currency} {val.amount.toLocaleString()} ({val.percentage}%)
                  </td>
                  <td className="py-2 text-slate-600">{val.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Day-by-Day Itinerary */}
        <div className="space-y-6 pt-4 border-t">
          <h3 className="font-bold text-base text-slate-900 uppercase tracking-wider">
            Day-by-Day Detailed Schedule
          </h3>

          {trip.days.map((day) => (
            <div key={day.dayNumber} className="border rounded-xl p-5 space-y-3 break-inside-avoid">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Day {day.dayNumber} • {day.baseCity}
                  </span>
                  <h4 className="font-bold text-base text-slate-900">{day.title}</h4>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>{day.date} • {day.weatherForecast?.tempC}°C {day.weatherForecast?.condition}</span>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-2 pt-1">
                {day.activities.map((act) => (
                  <div key={act.id} className="text-xs flex gap-3 items-start">
                    <span className="font-mono font-bold text-slate-700 w-16 flex-shrink-0">
                      {act.startTime}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">{act.name}</span>
                      <p className="text-slate-600 text-[11px] mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Day Meals & Hotel */}
              <div className="pt-2 border-t text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="font-bold text-slate-800">Meals: </span>
                  {day.meals.map(m => `${m.type}: ${m.restaurantName}`).join(' | ')}
                </div>
                {day.accommodation && (
                  <div>
                    <span className="font-bold text-slate-800">Stay: </span>
                    {day.accommodation.name} ({day.accommodation.location})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Smart Packing Checklist */}
        <div className="space-y-3 pt-4 border-t break-inside-avoid">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b pb-1">
            Essential Pre-Trip Checklist
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {trip.checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-slate-700">
                <span className="w-3.5 h-3.5 border rounded flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-700 space-y-1 break-inside-avoid">
          <span className="font-bold text-slate-900 block">Emergency & Tourist Helpline Contacts</span>
          <p>National Emergency: 112 | Tourist Police: 1363 | Medical Ambulance: 108 | Railway Inquiry: 139</p>
        </div>

      </div>

    </div>
  );
}
