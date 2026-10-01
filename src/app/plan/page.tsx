'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Wallet,
  CheckCircle2,
  Users,
  Compass,
  Plane,
  Hotel as HotelIcon,
  ShieldCheck,
  Check
} from 'lucide-react';
import { TravelStyle, PartyType, TransportType, AccommodationType } from '@/types/trip';

export default function StreamlinedPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autofill = searchParams.get('autofill');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form State
  const [destination, setDestination] = useState('Kerala');
  const [origin, setOrigin] = useState('Hyderabad');
  const [durationDays, setDurationDays] = useState(5);
  const [startDate, setStartDate] = useState('2026-12-12');

  // Travelers & Budget
  const [adults, setAdults] = useState(3);
  const [partyType, setPartyType] = useState<PartyType>('friends');
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'premium' | 'luxury'>('moderate');
  const [totalBudget, setTotalBudget] = useState(60000);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR'>('INR');

  // Style & Interests
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>(['relaxed', 'nature', 'food-focused']);
  const [interests, setInterests] = useState<string[]>(['beaches', 'nature', 'temples', 'food']);

  // Accommodation & Transit
  const [stayType, setStayType] = useState<AccommodationType>('hotel');
  const [primaryTransport, setPrimaryTransport] = useState<TransportType>('flight');
  const [specialNotes, setSpecialNotes] = useState('Pre-dawn temple pooja visit, vegetarian culinary focus');

  // Loading animation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStageIndex, setGenStageIndex] = useState(0);

  const generationStages = [
    'Sequencing destinations (0km backtracking)...',
    'Checking optimal daylight activities & opening hours...',
    'Estimating realistic travel buffers & transit...',
    'Allocating boutique stays & heritage hotels...',
    'Balancing budget with 8% contingency safety net...',
    'Finalizing verified itinerary...'
  ];

  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem('voyage_draft_trip');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.destination) setDestination(draft.destination);
        if (draft.origin) setOrigin(draft.origin);
        if (draft.durationDays) setDurationDays(draft.durationDays);
        if (draft.travelers?.adults) setAdults(draft.travelers.adults);
        if (draft.travelers?.partyType) setPartyType(draft.travelers.partyType);
        if (draft.budget?.total) setTotalBudget(draft.budget.total);
        if (draft.budget?.currency) setCurrency(draft.budget.currency);
        if (draft.travelStyles?.length) setTravelStyles(draft.travelStyles);
        if (draft.interests?.length) setInterests(draft.interests);
      }
    } catch (e) {}
  }, [autofill]);

  const toggleStyle = (style: TravelStyle) => {
    if (travelStyles.includes(style)) {
      setTravelStyles(travelStyles.filter(s => s !== style));
    } else {
      setTravelStyles([...travelStyles, style]);
    }
  };

  const handleGenerateTrip = async () => {
    setIsGenerating(true);
    setGenStageIndex(0);

    const interval = setInterval(() => {
      setGenStageIndex(prev => {
        if (prev < generationStages.length - 1) return prev + 1;
        return prev;
      });
    }, 500);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          origin,
          startDate,
          durationDays,
          travelers: {
            adults,
            children: 0,
            infants: 0,
            partyType,
            customNotes: ''
          },
          budget: {
            tier: budgetTier,
            total: totalBudget,
            currency,
            includesTravelToOrigin: true,
            contingencyPercent: 8
          },
          travelStyles,
          interests,
          accommodationPreference: {
            type: stayType,
            features: ['central-location', 'cleanliness']
          },
          transportPreferences: {
            primary: primaryTransport,
            local: 'local taxi',
            priority: 'balanced'
          },
          specialRequirements: {
            hardConstraints: specialNotes ? [specialNotes] : [],
            softPreferences: ['Balanced daylight pace', 'Scenic photo halts']
          }
        })
      });

      clearInterval(interval);
      const data = await res.json();
      if (data.trip?.id) {
        sessionStorage.removeItem('voyage_draft_trip');
        router.push(`/trip/${data.trip.id}`);
      } else {
        alert(data.error || 'Failed to generate itinerary. Please try again.');
        setIsGenerating(false);
      }
    } catch (err) {
      clearInterval(interval);
      alert('Error connecting with planner engine.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto bg-[#FFFDF9] text-[#181E4B]">
      
      {/* Loading Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-[#181E4B]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#ECE5D8] text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF2ED] text-[#DF6951] flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8 animate-spin-slow text-[#DF6951]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#DF6951] uppercase tracking-widest block mb-1">
                Autonomous Travel Architect
              </span>
              <h3 className="text-xl font-bold font-serif text-[#181E4B]">
                Crafting Your {destination} Journey
              </h3>
              <p className="text-xs text-[#5E6282] mt-2 font-medium">
                {generationStages[genStageIndex]}
              </p>
            </div>
            <div className="w-full bg-[#FAF6ED] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#DF6951] to-[#F1A501] h-full transition-all duration-300"
                style={{ width: `${Math.round(((genStageIndex + 1) / generationStages.length) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#5E6282]">Verified stays • 0km backtracking • 8% contingency safety net</p>
          </div>
        </div>
      )}

      {/* Wizard Header (Clean, Compact, Minimal Text) */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#5E6282]">
          <span className="font-bold text-[#DF6951]">Step {currentStep} of {totalSteps}</span>
          <span className="font-semibold text-[#181E4B]">
            {currentStep === 1 && 'Where & When'}
            {currentStep === 2 && 'Travelers & Budget'}
            {currentStep === 3 && 'Style & Stays'}
          </span>
          <span className="font-mono">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#EFE9DF] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#DF6951] to-[#F1A501] transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Interactive Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECE5D8] shadow-[0_12px_36px_-8px_rgba(24,30,75,0.06)] min-h-[420px] flex flex-col justify-between">
        
        {/* STEP 1: WHERE & WHEN */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#DF6951] uppercase tracking-wider">Destination & Dates</span>
              <h2 className="text-2xl font-bold font-serif text-[#181E4B] mt-0.5">Where and when are you traveling?</h2>
            </div>

            {/* Destination Input + Quick Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#181E4B]">Destination</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#DF6951] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kerala, Goa, Jaipur, Tokyo, Swiss Alps"
                  className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#181E4B] font-bold focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Kerala', 'South Goa', 'Jaipur & Udaipur', 'Tokyo', 'Swiss Alps', 'Bali'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDestination(d)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      destination === d
                        ? 'bg-[#DF6951] text-white border-[#DF6951] shadow-xs'
                        : 'bg-[#FAF6ED] text-[#181E4B] border-[#ECE5D8] hover:border-[#DF6951]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Departure City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181E4B]">Starting City (Origin)</label>
              <div className="relative">
                <Plane className="w-4 h-4 text-[#F1A501] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Hyderabad, Bangalore, Delhi, Mumbai, London"
                  className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#181E4B] font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181E4B]">Trip Length</label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 10].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      durationDays === d
                        ? 'bg-[#DF6951] text-white border-[#DF6951] shadow-xs'
                        : 'bg-[#FAF6ED] text-[#181E4B] border-[#ECE5D8] hover:border-[#DF6951]'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: TRAVELERS & BUDGET */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#DF6951] uppercase tracking-wider">Party & Budget</span>
              <h2 className="text-2xl font-bold font-serif text-[#181E4B] mt-0.5">Who is going and what&apos;s your budget?</h2>
            </div>

            {/* Party Type Cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181E4B]">Travel Party</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'solo', label: 'Solo', icon: '🎒', defaultCount: 1 },
                  { id: 'couple', label: 'Couple', icon: '💑', defaultCount: 2 },
                  { id: 'friends', label: 'Friends', icon: '👯', defaultCount: 3 },
                  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', defaultCount: 4 }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPartyType(p.id as PartyType);
                      setAdults(p.defaultCount);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      partyType === p.id
                        ? 'bg-[#DF6951] text-white border-[#DF6951] shadow-xs'
                        : 'bg-[#FAF6ED] text-[#181E4B] border-[#ECE5D8] hover:border-[#DF6951]'
                    }`}
                  >
                    <div className="text-xl mb-1">{p.icon}</div>
                    <div className="text-xs font-bold">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Input & Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#181E4B]">Estimated Budget ({currency})</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Wallet className="w-4 h-4 text-[#F1A501] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    step={5000}
                    className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#181E4B] font-extrabold focus:outline-none"
                  />
                </div>
                <div className="flex gap-1">
                  {(['INR', 'USD', 'EUR'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`px-3 py-3 rounded-2xl text-xs font-bold border ${
                        currency === curr
                          ? 'bg-[#181E4B] text-white border-[#181E4B]'
                          : 'bg-[#FAF6ED] text-[#181E4B] border-[#ECE5D8]'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-[#5E6282]">Includes 8% unallocated emergency reserve.</p>
            </div>

            {/* Travel Vibe Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181E4B]">Travel Vibe</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'relaxed', label: 'Relaxed 🌊' },
                  { id: 'nature', label: 'Nature 🌿' },
                  { id: 'cultural', label: 'Heritage 🏛️' },
                  { id: 'food-focused', label: 'Foodie 🍜' },
                  { id: 'adventure', label: 'Adventure 🧗' },
                  { id: 'spiritual', label: 'Spiritual 🪷' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStyle(s.id as TravelStyle)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      travelStyles.includes(s.id as TravelStyle)
                        ? 'bg-[#DF6951] text-white border-[#DF6951]'
                        : 'bg-[#FAF6ED] text-[#181E4B] border-[#ECE5D8]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: STAYS & TRAVEL MODE */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-[#DF6951] uppercase tracking-wider">Stays & Preferences</span>
              <h2 className="text-2xl font-bold font-serif text-[#181E4B] mt-0.5">How would you like to stay & travel?</h2>
            </div>

            {/* Stay Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181E4B]">Accommodation Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hotel', label: 'Boutique Hotel', icon: '🏨' },
                  { id: 'resort', label: 'Luxury Resort', icon: '🌴' },
                  { id: 'homestay', label: 'Heritage Homestay', icon: '🏡' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStayType(st.id as AccommodationType)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      stayType === st.id
                        ? 'bg-[#DF6951] text-white border-[#DF6951] shadow-xs'
                        : 'bg-[#FAF6ED] text-[#181E4B] border-[#ECE5D8] hover:border-[#DF6951]'
                    }`}
                  >
                    <div className="text-xl mb-1">{st.icon}</div>
                    <div className="text-xs font-bold">{st.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Transport */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181E4B]">Transit Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'flight', label: 'Flight + Cab' },
                  { id: 'train', label: 'Train + Cab' },
                  { id: 'rental car', label: 'Rental Car' }
                ].map((tr) => (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => setPrimaryTransport(tr.id as TransportType)}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      primaryTransport === tr.id
                        ? 'bg-[#DF6951] text-white border-[#DF6951] shadow-xs'
                        : 'bg-[#FAF6ED] text-[#181E4B] border-[#ECE5D8] hover:border-[#DF6951]'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Wishes (Optional, Compact) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#181E4B]">Special Wishes (Optional)</label>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Vegetarian dining, early morning pooja, sea view room"
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl px-4 py-2.5 text-xs text-[#181E4B] focus:outline-none"
              />
            </div>

            {/* Summary preview pill */}
            <div className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#ECE5D8] flex items-center justify-between text-xs">
              <div className="font-semibold text-[#181E4B]">
                {durationDays} Days in {destination} for {adults} ({currency} {totalBudget.toLocaleString()})
              </div>
              <span className="text-[11px] font-bold text-[#14B8A6] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready
              </span>
            </div>

          </div>
        )}

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#ECE5D8]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2.5 rounded-2xl border border-[#ECE5D8] hover:bg-[#FAF6ED] text-xs font-bold text-[#181E4B] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-3 rounded-2xl bg-[#DF6951] hover:bg-[#d45840] text-white text-xs font-bold shadow-md shadow-[#DF6951]/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerateTrip}
              className="px-7 py-3.5 rounded-2xl bg-[#F1A501] hover:bg-[#e29b00] text-white text-xs font-bold shadow-[0_10px_24px_-4px_rgba(241,165,1,0.4)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Generate My Itinerary</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
