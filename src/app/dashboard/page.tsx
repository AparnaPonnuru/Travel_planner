'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Sparkles,
  ArrowRight,
  Copy,
  Trash2,
  Plus,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { TripSnapshot } from '@/types/trip';

export default function UserDashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'finalized' | 'generated'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      setTrips(data.trips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this itinerary?')) {
      await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      setTrips(trips.filter(t => t.id !== id));
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch(`/api/trips/${id}/duplicate`, { method: 'POST' });
    const data = await res.json();
    if (data.trip) {
      setTrips([data.trip, ...trips]);
      router.push(`/trip/${data.trip.id}`);
    }
  };

  const handleCopyShare = (trip: TripSnapshot) => {
    const shareUrl = `${window.location.origin}/trip/share/${trip.shareId || trip.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(trip.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredTrips = activeTab === 'all'
    ? trips
    : trips.filter(t => t.status === activeTab);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 bg-[#f8fafc] text-slate-800">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <Bookmark className="w-4 h-4" />
            <span>Traveler Concierge Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 mt-1">My Saved Journeys</h1>
          <p className="text-xs text-slate-500 mt-1">Access, modify, duplicate, or share your personalized AI travel plans.</p>
        </div>

        <Link
          href="/plan"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a New Trip</span>
        </Link>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'all', label: `All Trips (${trips.length})` },
          { id: 'generated', label: 'Active Drafts' },
          { id: 'finalized', label: 'Finalized & Locked' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-50 text-brand-700 border border-brand-300'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading your itineraries...</div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-card space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Trips Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Your next adventure starts here. Tell our AI where you want to go and get a precision itinerary in seconds.
          </p>
          <Link
            href="/plan"
            className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
          >
            Plan My First Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600">
                    {trip.destination}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    trip.status === 'finalized'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-brand-50 text-brand-700 border border-brand-200'
                  }`}>
                    {trip.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{trip.title}</h3>
                <p className="text-xs text-slate-500 font-medium">{trip.origin} → {trip.destination}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-medium">Duration</span>
                    <span className="font-bold text-slate-800">{trip.durationDays} Days</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-medium">Travelers</span>
                    <span className="font-bold text-slate-800">{trip.travelers.adults + trip.travelers.children}</span>
                  </div>
                  <div className="col-span-2 p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-medium">Estimated Budget</span>
                    <span className="font-bold text-brand-600">
                      {trip.budget.currency} {trip.budgetBreakdown?.totalPlanned?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/trip/${trip.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>View Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCopyShare(trip)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Copy Shareable Link"
                  >
                    {copiedId === trip.id ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(trip.id)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Duplicate Itinerary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(trip.id)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600"
                    title="Delete Itinerary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
