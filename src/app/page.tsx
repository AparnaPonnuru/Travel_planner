'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Calendar,
  Users,
  Wallet,
  MapPin,
  Play,
  CheckCircle2,
  Clock,
  Repeat,
  ChevronRight,
  Plane,
  Star,
  ShieldCheck,
  Search,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  // Floating search bar state
  const [destination, setDestination] = useState('Kerala');
  const [tripStyle, setTripStyle] = useState('Relaxed & Nature');
  const [duration, setDuration] = useState('5 Days');
  const [party, setParty] = useState('3 People');
  const [budget, setBudget] = useState('₹60,000');

  // Natural prompt state
  const [naturalPrompt, setNaturalPrompt] = useState(
    'Plan a 5-day Kerala trip for 3 people from Hyderabad with a budget of ₹60,000. We like nature, beaches, temples and good food.'
  );
  // Generation loading overlay
  const [isParsing, setIsParsing] = useState(false);
  const [isGeneratingDirect, setIsGeneratingDirect] = useState(false);
  const [genStageText, setGenStageText] = useState('Initializing AI travel architect...');

  const handleLaunchPlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingDirect(true);
    setGenStageText(`Designing custom ${destination} journey...`);

    const stages = [
      `Sequencing ${destination} highlights (0km backtracking)...`,
      `Balancing ${budget} budget with 8% safety cushion...`,
      `Matching boutique stays for ${party}...`,
      'Finalizing your precision travel blueprint...'
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < stages.length) {
        setGenStageText(stages[stageIdx]);
        stageIdx++;
      }
    }, 500);

    const config = {
      destination: destination || 'Kerala',
      origin: 'Hyderabad',
      startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      durationDays: parseInt(duration) || 5,
      travelers: {
        adults: parseInt(party) || (party.includes('Couple') ? 2 : party.includes('Solo') ? 1 : 3),
        children: 0,
        infants: 0,
        partyType: party.includes('Solo') ? 'solo' : party.includes('Couple') ? 'couple' : party.includes('Family') ? 'family' : 'friends',
        customNotes: ''
      },
      budget: {
        tier: 'moderate',
        total: parseInt(budget.replace(/\D/g, '')) || 60000,
        currency: 'INR',
        includesTravelToOrigin: true,
        contingencyPercent: 8
      },
      travelStyles: ['relaxed', 'nature', 'food-focused'],
      interests: ['beaches', 'nature', 'culture', 'food'],
      accommodationPreference: {
        type: 'hotel',
        features: ['central-location', 'cleanliness']
      },
      transportPreferences: {
        primary: 'flight',
        local: 'local taxi',
        priority: 'balanced'
      },
      specialRequirements: {
        hardConstraints: ['Optimal daylight pacing', 'Vegetarian food options'],
        softPreferences: [`${tripStyle} pacing`, 'Scenic views']
      }
    };

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      clearInterval(interval);
      const data = await res.json();
      if (data.trip?.id) {
        router.push(`/trip/${data.trip.id}`);
      } else {
        router.push('/plan');
      }
    } catch (err) {
      clearInterval(interval);
      router.push('/plan');
    }
  };

  const handleNaturalPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalPrompt.trim()) return;

    setIsParsing(true);
    setGenStageText('Parsing requirements & constraints...');
    setIsGeneratingDirect(true);

    try {
      const parseRes = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalPrompt })
      });
      const parseData = await parseRes.json();
      const cfg = parseData.parsedConfig;

      if (cfg && cfg.destination) {
        setGenStageText(`Generating ${cfg.destination} trip blueprint...`);
        const tripRes = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: cfg.destination,
            origin: cfg.origin || 'Hyderabad',
            startDate: cfg.startDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            durationDays: cfg.durationDays || 5,
            travelers: cfg.travelers || { adults: 2, children: 0, infants: 0, partyType: 'couple' },
            budget: cfg.budget || { tier: 'moderate', total: 50000, currency: 'INR', contingencyPercent: 8 },
            travelStyles: cfg.travelStyles || ['relaxed'],
            interests: cfg.interests || ['nature'],
            specialRequirements: cfg.specialRequirements || { hardConstraints: [], softPreferences: [] }
          })
        });
        const tripData = await tripRes.json();
        if (tripData.trip?.id) {
          router.push(`/trip/${tripData.trip.id}`);
          return;
        }
      }
      router.push('/plan');
    } catch (err) {
      router.push('/plan');
    } finally {
      setIsParsing(false);
    }
  };

  const activityPills = [
    { name: 'Houseboat Cruise', people: '84 travelers going', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80', tag: 'Kerala' },
    { name: 'Palolem Sunset Kayak', people: '62 travelers going', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80', tag: 'Goa' },
    { name: 'Amber Palace Mirrors', people: '95 travelers going', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=400&q=80', tag: 'Jaipur' },
    { name: 'Munnar Tea Slopes', people: '48 travelers going', image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=400&q=80', tag: 'Munnar' }
  ];

  const popularTrips = [
    {
      title: 'Kerala Highlights & Backwaters',
      category: 'Relaxed & Nature',
      days: '5 Days • 4 Nights',
      people: '3 People',
      price: '₹60,000',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      rating: '4.95',
      reviews: '342',
      href: '/trip/trip-kerala-flagship',
      flagship: true
    },
    {
      title: 'South Goa Bohemian Escape',
      category: 'Coastal Romance',
      days: '4 Days • 3 Nights',
      people: '2 People',
      price: '₹42,000',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      rating: '4.88',
      reviews: '210',
      href: '/destinations/goa'
    },
    {
      title: 'Royal Rajasthan Heritage Circuit',
      category: 'Culture & Palaces',
      days: '6 Days • 5 Nights',
      people: '4 People',
      price: '₹75,000',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
      rating: '4.92',
      reviews: '189',
      href: '/destinations/jaipur'
    },
    {
      title: 'Tokyo & Kyoto Shinto Odyssey',
      category: 'Urban & Zen',
      days: '7 Days • 6 Nights',
      people: '2 People',
      price: '$2,400',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      rating: '4.97',
      reviews: '420',
      href: '/destinations/tokyo'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#FFFDF9] text-[#181E4B] selection:bg-[#DF6951] selection:text-white overflow-hidden">
      
      {/* Decorative Soft Background Glows (Jadoo & Travelopia aesthetic) */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-[#FFF1DA]/70 via-[#FFF8EB]/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 left-[-100px] w-[450px] h-[450px] bg-gradient-to-tr from-[#E6F4F1]/60 via-[#F0FAF7]/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-[-80px] w-[500px] h-[500px] bg-[#FFF2ED]/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Instant Generation Loading Overlay */}
      {isGeneratingDirect && (
        <div className="fixed inset-0 z-50 bg-[#181E4B]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#ECE5D8] text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF2ED] text-[#DF6951] flex items-center justify-center mx-auto shadow-md shadow-[#DF6951]/20">
              <Sparkles className="w-8 h-8 animate-spin-slow text-[#DF6951]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#DF6951] uppercase tracking-widest block mb-1">
                Autonomous Travel Architect
              </span>
              <h3 className="text-xl font-bold font-serif text-[#181E4B]">
                Crafting Your Itinerary
              </h3>
              <p className="text-xs text-[#5E6282] mt-2 font-medium">
                {genStageText}
              </p>
            </div>
            <div className="w-full bg-[#FAF6ED] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#DF6951] to-[#F1A501] h-full w-full animate-pulse" />
            </div>
            <p className="text-[10px] text-[#5E6282]">Zero backtracking • Verified hotels • Budget defended</p>
          </div>
        </div>
      )}

      {/* HERO SECTION (Jadoo style bold editorial headline & Travelopia visual flow) */}
      <section className="relative pt-6 pb-12 lg:pt-10 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              {/* Vibrant uppercase subhead badge */}
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-[#DF6951] uppercase">
                  Best Destinations & Bespoke AI Journeys
                </span>
              </div>

              {/* Jadoo-inspired Master Heading with brush underline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-[#181E4B] leading-[1.15] tracking-tight">
                Travel, enjoy <br className="hidden sm:inline" />
                and <span className="brush-underline text-[#181E4B]">live a new</span> <br className="hidden sm:inline" />
                and full life.
              </h1>

              {/* Crisp, light 2-line description (no text walls) */}
              <p className="text-sm sm:text-base text-[#5E6282] max-w-lg mx-auto lg:mx-0 font-normal leading-relaxed">
                Smart itinerary design pairing your dream vibe with verified routes, realistic buffers, and protected budgets.
              </p>

              {/* Two iconic CTA buttons: Golden Amber button + Coral Play Demo */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2">
                <Link
                  href="/plan"
                  className="px-8 py-4 rounded-2xl font-bold text-white bg-[#F1A501] hover:bg-[#e29b00] shadow-[0_12px_28px_-6px_rgba(241,165,1,0.45)] hover:shadow-[0_16px_32px_-6px_rgba(241,165,1,0.55)] transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Design My Trip</span>
                </Link>

                <Link
                  href="/trip/trip-kerala-flagship"
                  className="group flex items-center gap-3 py-2 px-3 rounded-full hover:bg-white/80 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#DF6951] text-white flex items-center justify-center shadow-lg shadow-[#DF6951]/35 group-hover:scale-110 group-hover:shadow-[#DF6951]/50 transition-all duration-300">
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-bold text-[#181E4B] group-hover:text-[#DF6951] transition-colors">
                      Play Flagship Demo
                    </span>
                    <span className="text-[11px] text-[#5E6282]">5-Day Kerala Tour</span>
                  </div>
                </Link>
              </div>

              {/* Quick Inspiration Pills */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs">
                <span className="text-[#5E6282] font-medium mr-1">Trending:</span>
                {[
                  { label: '🌴 Kerala Backwaters', dest: 'Kerala', style: 'Relaxed & Nature' },
                  { label: '🏖️ South Goa', dest: 'Goa', style: 'Coastal Romance' },
                  { label: '🏛️ Royal Jaipur', dest: 'Jaipur', style: 'Culture & Palaces' },
                  { label: '🏔️ Munnar Hills', dest: 'Munnar', style: 'Misty Peaks' }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDestination(item.dest);
                      setTripStyle(item.style);
                    }}
                    className="px-3 py-1.5 rounded-full bg-white border border-[#EBE6DC] text-[#181E4B] hover:border-[#DF6951] hover:text-[#DF6951] transition-colors shadow-xs font-medium cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Right: Dynamic Travel Collage (Travelopia & Jadoo aesthetic) */}
            <div className="lg:col-span-5 relative">
              
              <div className="relative mx-auto max-w-[440px]">
                
                {/* Background decorative blob */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#FFF1DA] to-[#FFE7DE] rounded-[48px] -rotate-2 -z-10" />

                {/* Main Hero Image with stylish asymmetric curves */}
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=85"
                    alt="Traveler enjoying backwaters"
                    className="w-full h-[460px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181E4B]/70 via-transparent to-transparent" />
                  
                  {/* Overlay Destination Badge */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DF6951] text-white inline-block mb-2 shadow-md">
                      Flagship Itinerary
                    </span>
                    <h3 className="text-xl font-bold font-serif leading-tight">Kerala Backwaters & Tea Ghats</h3>
                    <p className="text-xs text-white/90 mt-1">₹60,000 Total • 3 Travelers • 5 Days</p>
                  </div>
                </div>

                {/* Floating Card 1: Flight / Route Badge (Top-Right) */}
                <div className="absolute -top-4 -right-4 sm:-right-6 bg-white p-3.5 rounded-2xl shadow-[0_16px_36px_-6px_rgba(24,30,75,0.12)] border border-[#F0EBE1] flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF2ED] text-[#DF6951] flex items-center justify-center">
                    <Plane className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#181E4B]">HYD → COK Flight</div>
                    <div className="text-[10px] text-[#5E6282]">09:15 AM • On-Time Transit</div>
                  </div>
                </div>

                {/* Floating Card 2: Rating Pill (Bottom-Left) */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white py-3 px-4 rounded-2xl shadow-[0_16px_36px_-6px_rgba(24,30,75,0.12)] border border-[#F0EBE1] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF6E6] text-[#F1A501] flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-[#F1A501]" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#181E4B]">4.95 / 5 Rating</div>
                    <div className="text-[10px] text-[#5E6282]">1,280+ Curated Trips</div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FLOATING BOOKING & PLANNER WIDGET (Travellian & Travelopia Style) */}
      <section className="relative z-20 -mt-4 mb-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_-12px_rgba(24,30,75,0.08)] border border-[#EFE9DF]">
          
          <form onSubmit={handleLaunchPlan} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            
            {/* Field 1: Destination */}
            <div className="p-3 rounded-2xl hover:bg-[#FAF6ED] transition-colors border border-transparent hover:border-[#EBE4D5]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#DF6951] mb-1">
                Destination
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#DF6951] flex-shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where to? (e.g. Kerala)"
                  className="w-full bg-transparent text-sm font-bold text-[#181E4B] focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Field 2: Trip Style */}
            <div className="p-3 rounded-2xl hover:bg-[#FAF6ED] transition-colors border border-transparent hover:border-[#EBE4D5]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6282] mb-1">
                Travel Style
              </label>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#F1A501] flex-shrink-0" />
                <select
                  value={tripStyle}
                  onChange={(e) => setTripStyle(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-[#181E4B] focus:outline-none cursor-pointer"
                >
                  <option value="Relaxed & Nature">Relaxed & Nature</option>
                  <option value="Coastal Romance">Coastal Romance</option>
                  <option value="Culture & Palaces">Culture & Palaces</option>
                  <option value="Adventure & Trails">Adventure & Trails</option>
                </select>
              </div>
            </div>

            {/* Field 3: Duration */}
            <div className="p-3 rounded-2xl hover:bg-[#FAF6ED] transition-colors border border-transparent hover:border-[#EBE4D5]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6282] mb-1">
                Duration
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-[#181E4B] focus:outline-none cursor-pointer"
                >
                  <option value="3 Days">3 Days</option>
                  <option value="4 Days">4 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="10 Days">10 Days</option>
                </select>
              </div>
            </div>

            {/* Field 4: Travelers & Budget */}
            <div className="p-3 rounded-2xl hover:bg-[#FAF6ED] transition-colors border border-transparent hover:border-[#EBE4D5]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5E6282] mb-1">
                Party & Budget
              </label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#DF6951] flex-shrink-0" />
                <select
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-[#181E4B] focus:outline-none cursor-pointer"
                >
                  <option value="1 Solo">1 Solo Traveler</option>
                  <option value="2 People">2 People (Couple)</option>
                  <option value="3 People">3 People (Group)</option>
                  <option value="4 People">4 People (Family)</option>
                </select>
              </div>
            </div>

            {/* Action CTA: Terracotta Coral Button */}
            <div>
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-[#DF6951] hover:bg-[#d45840] shadow-[0_10px_24px_-4px_rgba(223,105,81,0.45)] hover:shadow-[0_14px_28px_-4px_rgba(223,105,81,0.55)] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Build Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

        </div>
      </section>

      {/* TRAVETOPIA ACTIVITY CARDS: "SPEND YOUR VACATION WITH OUR ACTIVITIES" */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-[#DF6951] uppercase">
                Curated Moments
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#181E4B] mt-1">
                Spend your vacation with our activities
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-xs font-bold text-[#DF6951] hover:text-[#c54d36] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              Explore all places <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards Grid with custom Travelopia curved corners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activityPills.map((act, i) => (
              <div
                key={i}
                onClick={() => {
                  setDestination(act.tag);
                  handleLaunchPlan();
                }}
                className="group bg-white rounded-3xl rounded-tr-[44px] p-3 border border-[#EFEAE0] shadow-sm hover:shadow-[0_16px_36px_-6px_rgba(24,30,75,0.08)] transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="relative h-44 w-full rounded-2xl rounded-tr-[36px] overflow-hidden mb-3.5">
                  <img
                    src={act.image}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-[#181E4B]">
                    {act.tag}
                  </span>
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold text-[#181E4B] text-base group-hover:text-[#DF6951] transition-colors">
                    {act.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#5E6282] mt-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-[#DF6951]" />
                    <span>{act.people}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* TOP DESTINATIONS / POPULAR ITINERARIES (Jadoo Style) */}
      <section className="py-16 bg-[#FAF7F0] border-y border-[#ECE5D8] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#DF6951] uppercase">
              Top Selling
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#181E4B]">
              Top Destinations & Ready Itineraries
            </h2>
            <p className="text-sm text-[#5E6282]">
              Fully mapped with verified hotels, zero-backtracking routes, and budget cushions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTrips.map((trip, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[28px] border border-[#ECE5D8] shadow-sm hover:shadow-[0_20px_40px_-8px_rgba(24,30,75,0.1)] overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181E4B]/60 via-transparent to-transparent" />
                  
                  {trip.flagship && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#DF6951] text-white shadow-md">
                      Flagship Demo
                    </span>
                  )}

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#181E4B] flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#F1A501] text-[#F1A501]" />
                    <span>{trip.rating}</span>
                  </div>

                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-xs font-medium text-white/80 block">{trip.category}</span>
                    <span className="text-sm font-bold">{trip.days}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-[#181E4B] text-base leading-snug group-hover:text-[#DF6951] transition-colors">
                      {trip.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-[#5E6282] mt-2 font-medium">
                      <span>{trip.people}</span>
                      <span className="text-[#DF6951] font-extrabold text-sm">{trip.price}</span>
                    </div>
                  </div>

                  <Link
                    href={trip.href}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold bg-[#FAF6ED] hover:bg-[#DF6951] text-[#181E4B] hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Explore Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3-STEP FLOW: ZERO TEXT CLUTTER, PURE VISUAL LOGIC (Jadoo Easy Steps) */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left 3 Steps */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#DF6951] uppercase">
                  Easy and Fast
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#181E4B] mt-1 leading-tight">
                  Book Your Next Trip in 3 Easy Steps
                </h2>
              </div>

              <div className="space-y-6">
                
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F1A501] text-white flex items-center justify-center shadow-lg shadow-[#F1A501]/30 flex-shrink-0">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#181E4B]">1. Choose Destination & Vibe</h3>
                    <p className="text-xs text-[#5E6282] leading-relaxed mt-1">
                      Pick where you want to go, set your budget limit, and select your travel pace in 30 seconds.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#DF6951] text-white flex items-center justify-center shadow-lg shadow-[#DF6951]/30 flex-shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#181E4B]">2. Real-Time Precision Scheduling</h3>
                    <p className="text-xs text-[#5E6282] leading-relaxed mt-1">
                      Our engine checks opening hours, sequences spots to avoid backtracking, and guards an 8% cash cushion.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#14B8A6] text-white flex items-center justify-center shadow-lg shadow-[#14B8A6]/30 flex-shrink-0">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#181E4B]">3. Take It Live on the Road</h3>
                    <p className="text-xs text-[#5E6282] leading-relaxed mt-1">
                      Access interactive vector maps, weather forecasts, packing checklists, and 1-tap Google Maps directions.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Card Mockup (Jadoo Trip Card with Heart & Progress) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-[0_20px_50px_-10px_rgba(24,30,75,0.12)] border border-[#ECE5D8]">
                
                <div className="relative h-44 rounded-2xl overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80"
                    alt="Trip to Greece or Kerala"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm">
                    <Heart className="w-4 h-4 text-[#DF6951] fill-[#DF6951]" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#181E4B]">Trip to Kerala Backwaters</h3>
                    <p className="text-xs text-[#5E6282] mt-0.5">14-19 Dec | by VoyageAI Concierge</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-7 h-7 rounded-full bg-[#FAF6ED] flex items-center justify-center text-sm">🌿</span>
                    <span className="w-7 h-7 rounded-full bg-[#FAF6ED] flex items-center justify-center text-sm">🛶</span>
                    <span className="w-7 h-7 rounded-full bg-[#FAF6ED] flex items-center justify-center text-sm">☕</span>
                    <span className="text-[11px] text-[#5E6282] font-semibold ml-auto">24 activities mapped</span>
                  </div>

                  <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#5E6282]">
                      <Users className="w-3.5 h-3.5 text-[#DF6951]" />
                      <span>3 people going</span>
                    </div>
                    <span className="text-xs font-bold text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-full">
                      ₹60,000 Budget Guarded
                    </span>
                  </div>
                </div>

                {/* Floating "Ongoing status" mini-pill */}
                <div className="absolute -bottom-5 -right-5 bg-white p-3 rounded-2xl shadow-xl border border-[#ECE5D8] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E6F4F1] text-[#14B8A6] flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="text-[10px] text-[#5E6282] uppercase tracking-wider font-bold">Status</div>
                    <div className="text-xs font-bold text-[#181E4B]">All Routes Optimized</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* NATURAL LANGUAGE SPEECH / PROMPT BAR (Clean, Spacious & Intuitive) */}
      <section className="py-14 bg-[#FAF7F0] border-t border-[#ECE5D8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-bold tracking-widest text-[#DF6951] uppercase block mb-1">
            Prefer Free Typing?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#181E4B] mb-6">
            Describe Your Trip in Plain English
          </h2>

          <form onSubmit={handleNaturalPlan} className="bg-white p-3 sm:p-4 rounded-3xl border border-[#ECE5D8] shadow-card flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
              <Sparkles className="w-5 h-5 text-[#DF6951] flex-shrink-0" />
              <input
                type="text"
                value={naturalPrompt}
                onChange={(e) => setNaturalPrompt(e.target.value)}
                placeholder="e.g. Plan a 5-day Kerala trip for 3 people with ₹60k budget..."
                className="w-full bg-transparent text-sm font-medium text-[#181E4B] focus:outline-none placeholder:text-slate-400 py-1"
              />
            </div>
            <button
              type="submit"
              disabled={isParsing}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-[#DF6951] hover:bg-[#d45840] text-white text-xs font-bold shadow-md shadow-[#DF6951]/30 transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isParsing ? 'Structuring...' : (
                <>
                  <span>Auto Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

        </div>
      </section>

      {/* BOTTOM CTA CALLOUT (Warm Jadoo Luxury Banner) */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#DF6951] via-[#FA7436] to-[#F1A501] rounded-[36px] p-8 sm:p-14 text-white text-center shadow-[0_24px_48px_-12px_rgba(223,105,81,0.35)] relative overflow-hidden">
            
            {/* Subtle decorative circles */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight max-w-xl mx-auto">
              Ready to experience travel planning without the stress?
            </h2>
            <p className="text-white/90 text-sm sm:text-base max-w-md mx-auto mt-3 font-normal">
              Join thousands of travelers who let VoyageAI design, sequence, and guard their holidays.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                href="/plan"
                className="px-8 py-3.5 rounded-2xl font-bold text-[#181E4B] bg-white hover:bg-[#FFFDF9] shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-100"
              >
                <Sparkles className="w-4 h-4 text-[#DF6951]" />
                <span>Start Free Planner</span>
              </Link>
              <Link
                href="/trip/trip-kerala-flagship"
                className="px-6 py-3.5 rounded-2xl font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-colors"
              >
                Inspect Kerala Flagship Plan
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
