'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  Users,
  Wallet,
  MapPin,
  Clock,
  Share2,
  Printer,
  History,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Navigation,
  Smartphone,
  Utensils,
  Hotel as HotelIcon,
  Trash2,
  Footprints,
  Train,
  Plane,
  Car,
  Compass,
  ArrowRight,
  RotateCcw,
  Building2
} from 'lucide-react';
import { TripSnapshot, ModificationResult, TransitLeg } from '@/types/trip';
import { getTransitAndNearbyOptions } from '@/lib/services/transitService';
import InteractiveMap from '@/components/Itinerary/InteractiveMap';
import AIAssistantChat from '@/components/Itinerary/AIAssistantChat';
import ChangePreviewModal from '@/components/Itinerary/ChangePreviewModal';
import VersionHistoryDrawer from '@/components/Itinerary/VersionHistoryDrawer';
import TravelModeModal from '@/components/Itinerary/TravelModeModal';
import PdfExportModal from '@/components/Itinerary/PdfExportModal';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tripId = resolvedParams.id;

  const [trip, setTrip] = useState<TripSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(1);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isTravelModeOpen, setIsTravelModeOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [changeDiff, setChangeDiff] = useState<ModificationResult['appliedChanges'] | null>(null);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [activeTransitTab, setActiveTransitTab] = useState<'outbound' | 'return'>('outbound');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      const data = await res.json();
      if (data.trip) {
        setTrip(data.trip);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const handleTripUpdated = (updatedTrip: TripSnapshot, changeResult?: ModificationResult['appliedChanges']) => {
    setTrip(updatedTrip);
    if (changeResult) {
      setChangeDiff(changeResult);
      setIsChangeModalOpen(true);
    }
    showToast('Itinerary and budget recalculated successfully!');
  };

  const handleFinalizeTrip = async () => {
    if (!trip) return;
    try {
      const res = await fetch(`/api/trips/${trip.id}/finalize`, { method: 'POST' });
      const data = await res.json();
      if (data.trip) {
        setTrip(data.trip);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('🎉 Trip Finalized! All arrangements and packing checklists are locked.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    if (!trip) return;
    const shareUrl = `${window.location.origin}/trip/share/${trip.shareId || trip.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Link copied to clipboard! Anyone with the link can view this trip.');
  };

  const toggleChecklistItem = (itemId: string) => {
    if (!trip) return;
    const updatedChecklist = trip.checklist.map(item =>
      item.id === itemId ? { ...item, isDone: !item.isDone } : item
    );
    setTrip({ ...trip, checklist: updatedChecklist });
    fetch(`/api/trips/${trip.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: updatedChecklist })
    }).catch(console.error);
  };

  const handleRemoveActivity = async (activityName: string) => {
    if (!trip) return;
    const instruction = `Remove ${activityName}`;
    try {
      const res = await fetch(`/api/trips/${trip.id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });
      const data = await res.json();
      if (data.trip) {
        handleTripUpdated(data.trip, data.appliedChanges);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#5E6282] space-y-3 flex-col bg-[#FFFDF9]">
        <div className="w-8 h-8 border-2 border-[#DF6951] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono">Loading bespoke itinerary...</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen pb-24 text-[#181E4B] bg-[#FFFDF9]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#181E4B] text-white font-bold text-xs shadow-xl animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TRIP HEADER (Crisp White & Cream Luxury Card) */}
      <section className="bg-white border-b border-[#ECE5D8] pt-8 pb-6 shadow-[0_2px_12px_rgba(24,30,75,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-[#5E6282] font-semibold">
                <span className="font-bold text-[#DF6951]">{trip.origin}</span>
                <span>→</span>
                <span className="font-bold text-[#181E4B]">{trip.destination}</span>
                <span>•</span>
                <span>{trip.startDate} to {trip.endDate}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#181E4B] tracking-tight">
                {trip.title}
              </h1>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#DF6951] hover:bg-[#d45840] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#DF6951]/25 transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Ask AI / Modify</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTravelModeOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF6ED] hover:bg-[#F3ECE0] text-[#181E4B] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#ECE5D8]"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#DF6951]" />
                <span>Travel Mode</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl bg-[#FAF6ED] hover:bg-[#F3ECE0] text-[#181E4B] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#ECE5D8]"
              >
                <Share2 className="w-3.5 h-3.5 text-[#5E6282]" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPdfOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF6ED] hover:bg-[#F3ECE0] text-[#181E4B] text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#ECE5D8]"
              >
                <Printer className="w-3.5 h-3.5 text-[#5E6282]" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVersionOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#FAF6ED] hover:bg-[#F3ECE0] text-[#181E4B] text-xs font-bold flex items-center gap-1 border border-[#ECE5D8]"
                title="Version History"
              >
                <History className="w-3.5 h-3.5 text-[#5E6282]" />
                <span>v{trip.version || 1}</span>
              </button>

              {trip.status !== 'finalized' ? (
                <button
                  type="button"
                  onClick={handleFinalizeTrip}
                  className="px-4 py-2 rounded-xl bg-[#F1A501] hover:bg-[#e29b00] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#F1A501]/25 transition-all hover:scale-105"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finalize Trip</span>
                </button>
              ) : (
                <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FINALIZED</span>
                </span>
              )}
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#DF6951] flex-shrink-0" />
              <div>
                <span className="text-[10px] text-[#5E6282] font-bold uppercase tracking-wider block">Duration</span>
                <span className="text-xs font-bold text-[#181E4B]">{trip.durationDays} Days • {trip.durationDays - 1} Nights</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] flex items-center gap-3">
              <Users className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
              <div>
                <span className="text-[10px] text-[#5E6282] font-bold uppercase tracking-wider block">Travelers</span>
                <span className="text-xs font-bold text-[#181E4B]">{trip.travelers.adults + trip.travelers.children} ({trip.travelers.partyType})</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] flex items-center gap-3">
              <Wallet className="w-4 h-4 text-[#F1A501] flex-shrink-0" />
              <div>
                <span className="text-[10px] text-[#5E6282] font-bold uppercase tracking-wider block">Estimated Cost</span>
                <span className="text-xs font-extrabold text-[#181E4B]">
                  {trip.budget.currency} {trip.budgetBreakdown.totalPlanned.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-[#5E6282] font-bold uppercase tracking-wider block">Budget Status</span>
                <span className={`text-xs font-bold ${trip.budgetBreakdown.status === 'within-budget' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {trip.budgetBreakdown.status === 'within-budget' ? 'Within Budget' : 'Over Budget'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* OVER-BUDGET ALERT (If applicable) */}
      {trip.budgetBreakdown.status === 'over-budget' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Budget Exceeded Alert: </span>
                <span>Plan is {trip.budget.currency} {(trip.budgetBreakdown.totalPlanned - trip.budget.total).toLocaleString()} over your target.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs whitespace-nowrap transition-colors"
            >
              Optimize to stay under {trip.budget.currency} {trip.budget.total.toLocaleString()}
            </button>
          </div>
        </div>
      )}

      {/* WORKSPACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: TIMELINE, BUDGET, CHECKLIST (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* PRE-TRIP LOGISTICS: OUTBOUND & RETURN CONNECTIVITY, STATIONS, TIMINGS & NEARBY EXCURSIONS */}
            {(() => {
              const computedTransit = getTransitAndNearbyOptions(trip.origin, trip.destination);
              
              // Ensure robust outbound & return leg data even if trip was previously saved without returnJourney
              const outboundLeg: TransitLeg = trip.transitOptions?.outbound || computedTransit.transitOptions.outbound || {
                direction: 'outbound',
                title: `Outbound Journey: ${trip.origin} → ${trip.destination}`,
                from: trip.origin,
                to: trip.destination,
                distanceKm: computedTransit.transitOptions.originToDestinationDistanceKm,
                guidance: {
                  whenToStart: `Reach ${trip.origin} station 45 mins before scheduled departure`,
                  whereToBoard: `${trip.origin} Junction / Main Platform 1 or 2`,
                  arrivalDetails: `Arrives at ${trip.destination} station. Pre-paid taxi booth at main exit.`
                },
                trains: trip.transitOptions?.availableTrains || computedTransit.transitOptions.availableTrains,
                flights: trip.transitOptions?.availableFlights || computedTransit.transitOptions.availableFlights,
                roadDetails: trip.transitOptions?.roadTravelDetails || computedTransit.transitOptions.roadTravelDetails
              };

              const computedReturn = computedTransit.transitOptions.returnJourney;
              const fallbackReturnTrains = computedReturn?.trains || trip.transitOptions?.availableTrains || [];
              const fallbackReturnFlights = computedReturn?.flights || trip.transitOptions?.availableFlights || [];
              const fallbackReturnRoad = computedReturn?.roadDetails || trip.transitOptions?.roadTravelDetails;
              const returnLeg: TransitLeg = trip.transitOptions?.returnJourney || computedReturn || {
                direction: 'return',
                title: `Return Journey: ${trip.destination} → ${trip.origin}`,
                from: trip.destination,
                to: trip.origin,
                distanceKm: outboundLeg.distanceKm || computedTransit.transitOptions.originToDestinationDistanceKm,
                guidance: {
                  whenToStart: `Complete hotel check-out 2 to 2.5 hours prior to departure time`,
                  whereToBoard: `${trip.destination} Railway Junction Platform 1 or 2`,
                  arrivalDetails: `Arrives back at ${trip.origin} Junction`,
                  checkOutBuffer: `Factor in 45 mins local transit buffer between your stay and station porch`
                },
                trains: fallbackReturnTrains,
                flights: fallbackReturnFlights,
                roadDetails: fallbackReturnRoad
              };

              const activeLeg = activeTransitTab === 'outbound' ? outboundLeg : returnLeg;
              const routeDistanceKm = activeLeg.distanceKm || computedTransit.transitOptions.originToDestinationDistanceKm;
              const destinationOverview = trip.destinationOverview || computedTransit.destinationOverview;

              return (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ECE5D8] shadow-[0_8px_24px_-4px_rgba(24,30,75,0.04)] space-y-5">
                  
                  {/* Top Bar with Route Distance & Best Season */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#ECE5D8] gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#DF6951] uppercase tracking-wider">
                        <Train className="w-3.5 h-3.5" />
                        <span>Pre-Trip Connectivity & Route Logistics</span>
                      </div>
                      <h2 className="text-xl font-bold font-serif text-[#181E4B] mt-0.5">
                        {activeTransitTab === 'outbound'
                          ? `${trip.origin} to ${trip.destination}`
                          : `${trip.destination} to ${trip.origin}`} ({routeDistanceKm} km)
                      </h2>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF6ED] border border-[#ECE5D8] text-[#181E4B] w-fit shrink-0">
                      🌤️ {destinationOverview.bestSeasonToVisit}
                    </span>
                  </div>

                  {/* DIRECTION TOGGLE (Outbound vs Return) */}
                  <div className="flex items-center p-1 bg-[#FAF6ED] rounded-2xl border border-[#ECE5D8] gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveTransitTab('outbound')}
                      className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        activeTransitTab === 'outbound'
                          ? 'bg-[#181E4B] text-white shadow-sm'
                          : 'text-[#5E6282] hover:text-[#181E4B]'
                      }`}
                    >
                      <Train className="w-3.5 h-3.5 text-[#DF6951]" />
                      <span>Outbound: {trip.origin} → {trip.destination}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTransitTab('return')}
                      className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        activeTransitTab === 'return'
                          ? 'bg-[#181E4B] text-white shadow-sm'
                          : 'text-[#5E6282] hover:text-[#181E4B]'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#F1A501]" />
                      <span>Return: {trip.destination} → {trip.origin}</span>
                    </button>
                  </div>

                  {/* DEPARTURE & BOARDING LOGISTICS GUIDANCE BOX */}
                  <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#F0E6D8] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#181E4B]">
                      <span className="flex items-center gap-1.5 text-[#DF6951]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{activeTransitTab === 'outbound' ? 'Outbound Departure Guidance' : 'Return Schedule & Station Guidance'}</span>
                      </span>
                      <span className="text-[10px] font-semibold text-[#5E6282]">
                        {activeLeg.from} → {activeLeg.to}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      {/* When to start */}
                      <div className="p-3 rounded-xl bg-white border border-[#ECE5D8] flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#FAF6ED] text-[#F1A501] flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-[#181E4B] text-[11px] uppercase tracking-wide">
                            {activeTransitTab === 'outbound' ? 'When to Start' : 'When to Leave Hotel'}
                          </div>
                          <div className="text-[#5E6282] mt-0.5 text-xs font-medium leading-snug">
                            {activeLeg.guidance.whenToStart}
                          </div>
                        </div>
                      </div>

                      {/* Where to board */}
                      <div className="p-3 rounded-xl bg-white border border-[#ECE5D8] flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#FFF2ED] text-[#DF6951] flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-[#181E4B] text-[11px] uppercase tracking-wide">
                            Where to Board
                          </div>
                          <div className="text-[#5E6282] mt-0.5 text-xs font-medium leading-snug">
                            {activeLeg.guidance.whereToBoard}
                          </div>
                        </div>
                      </div>

                      {/* Check-out buffer if return leg */}
                      {activeLeg.guidance.checkOutBuffer && (
                        <div className="p-3 rounded-xl bg-white border border-[#ECE5D8] flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-[#181E4B] text-[11px] uppercase tracking-wide">
                              Hotel Check-out Buffer
                            </div>
                            <div className="text-[#5E6282] mt-0.5 text-xs font-medium leading-snug">
                              {activeLeg.guidance.checkOutBuffer}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Arrival Details */}
                      <div className={`p-3 rounded-xl bg-white border border-[#ECE5D8] flex items-start gap-2.5 ${!activeLeg.guidance.checkOutBuffer ? 'md:col-span-2' : ''}`}>
                        <div className="w-7 h-7 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-[#181E4B] text-[11px] uppercase tracking-wide">
                            {activeTransitTab === 'outbound' ? 'Destination Arrival' : 'Return Arrival at Home'}
                          </div>
                          <div className="text-[#5E6282] mt-0.5 text-xs font-medium leading-snug">
                            {activeLeg.guidance.arrivalDetails}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Trains Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#181E4B]">
                      <span className="flex items-center gap-1.5">
                        <Train className="w-4 h-4 text-[#DF6951]" />
                        <span>
                          {activeTransitTab === 'outbound' ? 'Outbound Trains' : 'Return Trains'} ({activeLeg.trains.length} Direct)
                        </span>
                      </span>
                      <span className="text-[11px] text-[#5E6282]">Verified Schedules</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {activeLeg.trains.map((tr, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] hover:border-[#DF6951] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#181E4B] text-sm">
                                {tr.trainNumber} {tr.trainName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#DF6951] border border-[#ECE5D8]">
                                {tr.frequency}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#5E6282] font-medium">
                              {tr.originStation} ({tr.departureTime}) → {tr.destinationStation} ({tr.arrivalTime})
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                            <div>
                              <div className="font-mono text-xs font-bold text-[#181E4B]">{tr.duration}</div>
                              <div className="text-[10px] text-[#5E6282]">{tr.classes.join(', ')}</div>
                            </div>
                            <div className="font-extrabold text-[#DF6951] text-xs bg-white px-2.5 py-1.5 rounded-xl border border-[#ECE5D8]">
                              {tr.fareRange}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Flight & Road summary pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {activeLeg.flights?.[0] && (
                        <div className="p-3 rounded-2xl bg-white border border-[#ECE5D8] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-[#FFF2ED] text-[#DF6951] flex items-center justify-center">
                              <Plane className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-[#181E4B] block text-xs">
                                {activeLeg.flights[0].airline} {activeLeg.flights[0].flightNumber}
                              </span>
                              <span className="text-[10px] text-[#5E6282]">
                                {activeLeg.flights[0].duration}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-[#181E4B] text-xs">
                            {activeLeg.flights[0].fareRange}
                          </span>
                        </div>
                      )}

                      {activeLeg.roadDetails && (
                        <div className="p-3 rounded-2xl bg-white border border-[#ECE5D8] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-[#FAF6ED] text-[#F1A501] flex items-center justify-center">
                              <Car className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-[#181E4B] block text-xs">Road Drive</span>
                              <span className="text-[10px] text-[#5E6282]">
                                {activeLeg.roadDetails.estimatedDriveTime}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#5E6282]">
                            {activeLeg.roadDetails.tollEstimate}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nearby Places & Signature Excursions */}
                  <div className="pt-3 border-t border-[#ECE5D8] space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#181E4B]">
                      <span className="flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-[#14B8A6]" />
                        <span>Nearby Signature Clusters & Excursions</span>
                      </span>
                      <span className="text-[11px] text-[#5E6282]">Must-Visit</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {destinationOverview.signatureNearbyPlaces.map((pl, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[#181E4B] text-xs truncate">{pl.name}</span>
                            <span className="text-[10px] font-bold text-[#DF6951] bg-white px-2 py-0.5 rounded-full border border-[#ECE5D8] shrink-0">
                              {pl.distanceFromBaseKm} km ({pl.driveTime})
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5E6282] line-clamp-2 leading-tight">
                            {pl.highlight}
                          </p>
                          <div className="text-[10px] text-[#14B8A6] font-semibold">
                            ⏱️ {pl.bestTime}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Local Cuisine & Tips Chips */}
                  <div className="pt-2.5 border-t border-[#ECE5D8] flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-bold text-[#5E6282]">Regional Flavors:</span>
                    {destinationOverview.localCuisinePicks.map((food, fIdx) => (
                      <span key={fIdx} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-[#ECE5D8] text-[#181E4B]">
                        🍽️ {food}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })()}

            {/* Day Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedDayNum(null)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDayNum === null
                    ? 'bg-[#DF6951] text-white shadow-md shadow-[#DF6951]/25'
                    : 'bg-white text-[#181E4B] hover:bg-[#FAF6ED] border border-[#ECE5D8]'
                }`}
              >
                View Full Itinerary
              </button>
              {trip.days.map((day) => (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => setSelectedDayNum(day.dayNumber)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDayNum === day.dayNumber
                      ? 'bg-[#DF6951] text-white shadow-md shadow-[#DF6951]/25'
                      : 'bg-white text-[#181E4B] hover:bg-[#FAF6ED] border border-[#ECE5D8]'
                  }`}
                >
                  Day {day.dayNumber} • {day.baseCity.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* DAY DETAIL CARDS */}
            <div className="space-y-6">
              {(selectedDayNum ? trip.days.filter(d => d.dayNumber === selectedDayNum) : trip.days).map((day) => (
                <div
                  key={day.dayNumber}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ECE5D8] shadow-[0_8px_24px_-4px_rgba(24,30,75,0.04)] space-y-5"
                >
                  
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#ECE5D8] gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#DF6951]">
                        <span>Day {day.dayNumber}</span>
                        <span>•</span>
                        <span>{day.baseCity}</span>
                      </div>
                      <h2 className="text-xl font-bold font-serif text-[#181E4B] mt-0.5">{day.title}</h2>
                      <p className="text-xs text-[#5E6282] mt-0.5">{day.theme}</p>
                    </div>

                    {day.weatherForecast && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF6ED] border border-[#ECE5D8] text-xs">
                        <span className="text-base">{day.weatherForecast.icon}</span>
                        <div>
                          <div className="font-bold text-[#181E4B]">{day.weatherForecast.tempC}°C • {day.weatherForecast.condition}</div>
                          <div className="text-[10px] text-[#5E6282]">{day.weatherForecast.advice}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Day Stats */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] text-xs text-center">
                    <div>
                      <span className="text-[#5E6282] text-[10px] block font-medium">Walking</span>
                      <span className="font-bold text-[#181E4B] flex items-center justify-center gap-1 mt-0.5">
                        <Footprints className="w-3.5 h-3.5 text-[#14B8A6]" />
                        {day.stats?.walkingDistanceKm || 3.2} km
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5E6282] text-[10px] block font-medium">Transit</span>
                      <span className="font-bold text-[#181E4B] flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#DF6951]" />
                        {day.stats?.totalTravelTimeMinutes || 45}m
                      </span>
                    </div>
                    <div>
                      <span className="text-[#5E6282] text-[10px] block font-medium">Day Cost</span>
                      <span className="font-extrabold text-[#DF6951] mt-0.5 block">
                        {trip.budget.currency} {day.activities.reduce((s, a) => s + (a.estimatedCost || 0) * trip.travelers.adults, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">
                      Day Schedule
                    </div>

                    <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFE9DF]">
                      {day.activities.map((act) => (
                        <div
                          key={act.id}
                          className="relative p-3.5 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] hover:border-[#DF6951] transition-all space-y-2"
                        >
                          <div className="absolute -left-4 top-4 w-2 h-2 rounded-full bg-[#DF6951] ring-4 ring-white" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#DF6951] bg-white px-2 py-0.5 rounded border border-[#ECE5D8]">
                                {act.startTime} - {act.endTime}
                              </span>
                              <span className="text-[10px] text-[#5E6282]">({act.durationMinutes} mins)</span>
                            </div>

                            <span className="text-xs font-bold text-[#181E4B]">
                              {act.estimatedCost === 0 ? 'Free' : `${trip.budget.currency} ${act.estimatedCost.toLocaleString()}`}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-[#181E4B] text-sm">{act.name}</h4>
                            <p className="text-[11px] text-[#5E6282] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#DF6951] shrink-0" />
                              <span>{act.locationName}</span>
                              {act.openingHours && <span>• {act.openingHours}</span>}
                            </p>
                          </div>

                          <p className="text-xs text-[#5E6282] leading-snug">
                            {act.description}
                          </p>

                          {act.matchReason && (
                            <div className="p-1.5 rounded-xl bg-white border border-[#ECE5D8] text-[11px] text-[#181E4B] flex items-center gap-1.5 font-medium">
                              <Sparkles className="w-3 h-3 text-[#DF6951] shrink-0" />
                              <span className="truncate">{act.matchReason}</span>
                            </div>
                          )}

                          <div className="pt-1.5 border-t border-[#ECE5D8] flex items-center justify-between text-xs">
                            <button
                              type="button"
                              onClick={() => setIsChatOpen(true)}
                              className="text-[#5E6282] hover:text-[#DF6951] transition-colors flex items-center gap-1 text-[11px]"
                            >
                              <Sparkles className="w-3 h-3 text-[#DF6951]" />
                              <span>Ask AI</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveActivity(act.name)}
                              className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-[11px]"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meals */}
                  {day.meals && day.meals.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-600" />
                        <span>Curated Culinary Recommendations</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {day.meals.map((meal, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
                              {meal.type}
                            </span>
                            <div className="font-bold text-slate-900">{meal.restaurantName}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{meal.cuisine} • {meal.location}</div>
                            {meal.highlightDish && (
                              <div className="text-[10px] text-amber-800 font-semibold pt-1">
                                Must Try: {meal.highlightDish}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accommodation */}
                  {day.accommodation && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <HotelIcon className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Tonight&apos;s Accommodation</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{day.accommodation.name}</h4>
                            <span className="text-xs font-bold text-brand-600">★ {day.accommodation.rating || 4.5}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 font-medium">{day.accommodation.type} • {day.accommodation.location}</p>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{day.accommodation.rationale}</p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-xs font-extrabold text-slate-900">
                            {trip.budget.currency} {day.accommodation.costPerNight.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">per night</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* ITEMIZE BUDGET BREAKDOWN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Comprehensive Budget Breakdown</h3>
                  <p className="text-xs text-slate-500">Itemized expenses calculated with realistic supplier data & 8% contingency.</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-brand-600">
                    {trip.budget.currency} {trip.budgetBreakdown.totalPlanned.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Target: {trip.budget.currency} {trip.budget.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(trip.budgetBreakdown.categories).map(([key, item]) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {trip.budget.currency} {item.amount.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-cyan-500"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">{item.note}</p>
                  </div>
                ))}
              </div>

              {trip.budgetBreakdown.savingTips && trip.budgetBreakdown.savingTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <span className="text-xs font-bold text-amber-900">Intelligent Cost-Saving Recommendations:</span>
                  <ul className="text-xs text-amber-800 list-disc list-inside space-y-1 font-medium">
                    {trip.budgetBreakdown.savingTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CHECKLIST */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Smart Packing Checklist</h3>
                  <p className="text-xs text-slate-500">Tailored to {trip.destination} weather and your activities.</p>
                </div>
                <span className="text-xs font-mono text-brand-600 font-bold">
                  {trip.checklist.filter(c => c.isDone).length} / {trip.checklist.length} Completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trip.checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-colors ${
                      item.isDone
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-brand-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.isDone}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="mt-0.5 w-4 h-4 accent-brand-600 rounded cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className={`text-xs block ${item.isDone ? 'line-through text-slate-400' : 'text-slate-800 font-semibold'}`}>
                        {item.text}
                      </span>
                      {item.essential && (
                        <span className="text-[9px] uppercase font-bold text-rose-600 tracking-wider">Essential</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* AI DECISION EXPLANATIONS */}
            <div className="p-6 rounded-3xl bg-brand-50/70 border border-brand-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-800">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Autonomous AI Architecture Rationale</span>
              </div>
              <div className="space-y-2">
                {trip.aiExplanations.map((exp, idx) => (
                  <div key={idx} className="text-xs text-slate-700 flex items-start gap-2 font-medium">
                    <span className="text-brand-600 font-bold">•</span>
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY HERO IMAGE & ROUTE (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            
            {/* PREMIUM TRAVEL HERO IMAGE */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-[#ECE5D8] shadow-[0_12px_40px_-8px_rgba(24,30,75,0.10)] group">
              <div className="relative h-[480px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/travel-hero-sidebar.jpg"
                  alt={`${trip.destination} scenic travel landscape`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#181E4B]/80 via-[#181E4B]/20 to-transparent" />
                
                {/* Top badge */}
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-white/95 text-[#DF6951] backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    AI-Curated Journey
                  </span>
                </div>

                {/* Bottom content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                  <h3 className="text-2xl font-bold font-serif text-white leading-tight drop-shadow-lg">
                    {trip.destination}
                  </h3>
                  <p className="text-sm text-white/85 font-medium leading-snug max-w-[280px]">
                    Your {trip.days.length}-day adventure awaits — every route, stay & experience handpicked by AI.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
                      📍 {trip.origin} → {trip.destination}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
                      🗓️ {trip.days.length} Days
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20">
                      💰 {trip.budget.currency} {trip.budget.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Sequence Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#ECE5D8] shadow-[0_8px_24px_-4px_rgba(24,30,75,0.04)] space-y-4">
              <h3 className="font-bold text-[#181E4B] text-sm uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#DF6951]" />
                <span>Zero-Backtracking Route Plan</span>
              </h3>

              <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ECE5D8]">
                {trip.routeSegments.map((seg, idx) => (
                  <div key={idx} className="relative text-xs space-y-1">
                    <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-[#DF6951] ring-4 ring-white" />
                    <div className="font-bold text-[#181E4B]">{seg.from} → {seg.to}</div>
                    <div className="text-[11px] text-[#5E6282] font-medium">
                      {seg.distanceKm} km • {seg.estimatedTime} via {seg.mode}
                    </div>
                    {seg.notes && <p className="text-[10px] text-[#5E6282] italic">{seg.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Score Card */}
            <div className="bg-white p-5 rounded-3xl border border-[#ECE5D8] shadow-[0_8px_24px_-4px_rgba(24,30,75,0.04)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5E6282]">Trip Quality Index</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                  {trip.qualityScore?.overall || 'Excellent'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#ECE5D8]">
                  <span className="text-[#5E6282] text-[10px] block font-medium">Budget Fit</span>
                  <span className="font-bold text-[#181E4B]">{trip.qualityScore?.budgetFit || 'Optimal'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#ECE5D8]">
                  <span className="text-[#5E6282] text-[10px] block font-medium">Pacing</span>
                  <span className="font-bold text-[#181E4B]">{trip.qualityScore?.pace || 'Relaxed'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#ECE5D8]">
                  <span className="text-[#5E6282] text-[10px] block font-medium">Efficiency</span>
                  <span className="font-bold text-[#181E4B]">{trip.qualityScore?.efficiency || 'High'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#ECE5D8]">
                  <span className="text-[#5E6282] text-[10px] block font-medium">Constraints Met</span>
                  <span className="font-bold text-[#16A34A]">{trip.qualityScore?.constraintMatchRate || 100}%</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* DOCKED CONVERSATIONAL AI CHAT */}
      <AIAssistantChat
        trip={trip}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onTripUpdated={handleTripUpdated}
      />

      {/* CHANGE DIFF PREVIEW MODAL */}
      <ChangePreviewModal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        changes={changeDiff}
        currency={trip.budget.currency}
      />

      {/* VERSION HISTORY DRAWER */}
      <VersionHistoryDrawer
        isOpen={isVersionOpen}
        onClose={() => setIsVersionOpen(false)}
        tripId={trip.id}
        currentVersion={trip.version || 1}
        onRestore={(restored) => {
          setTrip(restored);
          showToast(`Restored to Version checkpoint!`);
        }}
      />

      {/* TRAVEL MODE MODAL */}
      <TravelModeModal
        isOpen={isTravelModeOpen}
        onClose={() => setIsTravelModeOpen(false)}
        trip={trip}
      />

      {/* PRINTABLE PDF MODAL */}
      <PdfExportModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        trip={trip}
      />

    </div>
  );
}
