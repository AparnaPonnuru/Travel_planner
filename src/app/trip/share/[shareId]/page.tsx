'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { TripSnapshot } from '@/types/trip';
import InteractiveMap from '@/components/Itinerary/InteractiveMap';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ShareTripPage({ params }: { params: Promise<{ shareId: string }> }) {
  const resolvedParams = use(params);
  const shareId = resolvedParams.shareId;

  const [trip, setTrip] = useState<TripSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trips/${shareId}`)
      .then(res => res.json())
      .then(data => {
        if (data.trip) setTrip(data.trip);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f8fafc]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-[#f8fafc]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Trip Not Found or Private</h2>
        <p className="text-slate-500 text-sm mb-6">This shared itinerary is unavailable or has expired.</p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs">
          Return to VoyageAI
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 text-slate-800 bg-[#f8fafc]">
      
      {/* Header */}
      <section className="bg-white border-b border-slate-200/80 pt-10 pb-8 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Public Shared Itinerary</span>
            </div>

            <Link
              href="/plan"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <span>Plan a Trip Like This</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            {trip.title}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {trip.origin} → {trip.destination} • {trip.startDate} to {trip.endDate} ({trip.durationDays} Days)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 text-[10px] block font-medium">Travelers</span>
              <span className="font-bold text-slate-900">{trip.travelers.adults + trip.travelers.children} ({trip.travelers.partyType})</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 text-[10px] block font-medium">Estimated Cost</span>
              <span className="font-extrabold text-brand-600">
                {trip.budget.currency} {trip.budgetBreakdown?.totalPlanned?.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 text-[10px] block font-medium">Pace</span>
              <span className="font-bold text-slate-800 capitalize">{trip.travelStyles.slice(0, 2).join(' + ')}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 text-[10px] block font-medium">Status</span>
              <span className="font-bold text-emerald-700 uppercase">{trip.status}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Itinerary Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 space-y-6">
            {trip.days.map((day) => (
              <div key={day.dayNumber} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase">Day {day.dayNumber} • {day.baseCity}</span>
                    <h3 className="text-lg font-bold text-slate-900">{day.title}</h3>
                  </div>
                  {day.weatherForecast && (
                    <span className="text-xs text-slate-600 font-medium">{day.weatherForecast.icon} {day.weatherForecast.tempC}°C</span>
                  )}
                </div>

                <div className="space-y-3">
                  {day.activities.map((act) => (
                    <div key={act.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-brand-700 font-bold">{act.startTime} - {act.endTime}</span>
                        <span className="text-slate-500 font-medium">{act.locationName}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{act.name}</h4>
                      <p className="text-xs text-slate-600 font-medium">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <InteractiveMap days={trip.days} />
          </div>

        </div>
      </div>

    </div>
  );
}
