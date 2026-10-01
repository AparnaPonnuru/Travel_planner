'use client';

import React, { useState } from 'react';
import { TripSnapshot } from '@/types/trip';
import { Compass, Navigation, MapPin, X, ShieldCheck, Clock } from 'lucide-react';

interface TravelModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripSnapshot;
}

export default function TravelModeModal({
  isOpen,
  onClose,
  trip
}: TravelModeModalProps) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const currentDay = trip.days[currentDayIndex] || trip.days[0];
  const nextActivity = currentDay.activities[0] || null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-800 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Travel Mode Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold border border-brand-200">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider">Travel Mode</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-600 text-white animate-pulse">
                Live On-Trip
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{trip.destination} • Day {currentDay.dayNumber} of {trip.durationDays}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto w-full py-6 space-y-6 flex-1">
        
        {/* Day Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {trip.days.map((d, idx) => (
            <button
              key={d.dayNumber}
              type="button"
              onClick={() => setCurrentDayIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                currentDayIndex === idx
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Day {d.dayNumber} • {d.baseCity.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* UP NEXT HERO CARD */}
        {nextActivity && (
          <div className="p-6 rounded-3xl bg-white border-2 border-brand-400 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-brand-600 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Up Next on Schedule
              </span>
              <span className="bg-brand-50 px-2 py-0.5 rounded border border-brand-200">{nextActivity.startTime}</span>
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">{nextActivity.name}</h3>
              <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>{nextActivity.locationName}</span>
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
              {nextActivity.description}
            </p>

            <div className="pt-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  nextActivity.name + ', ' + nextActivity.locationName + ', ' + currentDay.baseCity
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 transition-all text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Get GPS Directions (Google Maps)</span>
              </a>
            </div>
          </div>
        )}

        {/* Accommodation for the Night */}
        {currentDay.accommodation && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tonight&apos;s Hotel</div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{currentDay.accommodation.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{currentDay.accommodation.location}</p>
              </div>
              <span className="text-xs font-bold text-brand-600">★ {currentDay.accommodation.rating || '4.6'}</span>
            </div>
          </div>
        )}

        {/* Emergency Information */}
        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
          <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Emergency Contacts & Local Helplines</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-rose-100">
              <span className="text-slate-500 text-[10px] block font-medium">National Emergency</span>
              <span className="font-bold text-slate-900">112</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-rose-100">
              <span className="text-slate-500 text-[10px] block font-medium">Tourist Police Helpline</span>
              <span className="font-bold text-slate-900">1363</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-rose-100">
              <span className="text-slate-500 text-[10px] block font-medium">Medical Ambulance</span>
              <span className="font-bold text-slate-900">108</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-rose-100">
              <span className="text-slate-500 text-[10px] block font-medium">Railway Helpline</span>
              <span className="font-bold text-slate-900">139</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-2xl mx-auto w-full pt-4 border-t border-slate-200 text-center">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100"
        >
          Exit Travel Mode
        </button>
      </div>

    </div>
  );
}
