'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Wallet, Sparkles, CheckCircle2, ArrowRight, Compass } from 'lucide-react';

const DESTINATION_DATA: Record<string, any> = {
  kerala: {
    name: 'Kerala',
    country: 'India',
    title: "Kerala — God's Own Country",
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80',
    description: 'A coastal sanctuary defined by serene backwater canal networks, rolling emerald Western Ghats tea plantations in Munnar, historic Portuguese colonial quarters in Fort Kochi, and ancient Vedic temple traditions.',
    bestSeason: 'October through March (Pleasant dry winter, 27°C - 30°C)',
    typicalBudget: '₹45,000 - ₹70,000 for 5 Days (3 people)',
    highlights: [
      'Chottanikkara Temple pre-dawn Vedic pooja',
      'Fort Kochi 14th-century Chinese fishing nets & spice bazaars',
      'Lockhart Estate tea factory processing & plantation ridge walks',
      'Private motorized thatched Shikara canal cruise in Alleppey',
      'Authentic banana-leaf Sadya feast with 18 traditional curries'
    ],
    samplePlanId: 'trip-kerala-flagship',
    routeExample: 'Kochi → Munnar Hill Station → Alleppey Backwaters'
  },
  goa: {
    name: 'South Goa',
    country: 'India',
    title: 'South Goa — Coastal Heritage & Serenity',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80',
    description: 'Unlike the crowded northern strips, South Goa offers pristine palm-fringed sands, baroque 16th-century Portuguese cathedrals in Old Goa, pastel mansions in Fontainhas Latin Quarter, and fresh coastal dining.',
    bestSeason: 'November through February (Clear skies, gentle sea breeze)',
    typicalBudget: '₹35,000 - ₹55,000 for 4 Days (2 people)',
    highlights: [
      'Palolem Beach kayaking & dolphin spotting at dawn',
      'Fontainhas Latin Quarter architectural heritage walk',
      'Basilica of Bom Jesus & Se Cathedral UNESCO monuments',
      'Sunset seafood dining at authentic coastal beach shacks'
    ],
    routeExample: 'Panaji Latin Quarter → Old Goa Heritage → Palolem Crescent'
  },
  jaipur: {
    name: 'Jaipur & Udaipur',
    country: 'India',
    title: 'Rajasthan — Imperial Fortresses & Lakes',
    heroImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80',
    description: 'Immerse yourself in Rajasthan’s royal grandeur. From the pink sandstone facades and mirror halls of Amber Palace to the serene lakeside heritage havelis of Udaipur.',
    bestSeason: 'October through March (Crisp royal winter)',
    typicalBudget: '₹55,000 - ₹85,000 for 5 Days (2 people)',
    highlights: [
      'Amber Fort Sheesh Mahal (Hall of Mirrors) exploration',
      'Johari Bazaar gemstone, blue pottery, and bandhani textiles',
      'Private sunset boat cruise on Lake Pichola in Udaipur',
      'Traditional Rajasthani royal banquet with Dal Baati Churma'
    ],
    routeExample: 'Jaipur Pink City → Amer Fort → Udaipur Lake Pichola'
  }
};

export default function DestinationSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug.toLowerCase();

  const dest = DESTINATION_DATA[slug] || DESTINATION_DATA['kerala'];

  const handlePlanThis = () => {
    sessionStorage.setItem('voyage_draft_trip', JSON.stringify({ destination: dest.name }));
    router.push('/plan');
  };

  return (
    <div className="min-h-screen pb-24 text-slate-800 bg-[#f8fafc]">
      
      {/* Hero Banner */}
      <div className="relative h-[440px] w-full overflow-hidden">
        <img
          src={dest.heroImage}
          alt={dest.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        
        <div className="absolute bottom-10 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-brand-300" />
            <span>Destination Dossier</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight">
            {dest.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed font-medium">
            {dest.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Curated Highlights */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
              <h2 className="text-xl font-bold font-display text-slate-900">Must-Experience Highlights</h2>
              <div className="space-y-3">
                {dest.highlights.map((h: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Typical Route Architecture */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
              <h2 className="text-xl font-bold font-display text-slate-900">Recommended Route Sequence</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our logistics engine organizes this region linearly to eliminate backtracking:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-brand-700 text-sm">
                {dest.routeExample}
              </div>
            </div>

            {/* Flagship Demo Link if Kerala */}
            {dest.samplePlanId && (
              <div className="p-6 rounded-3xl bg-brand-50 border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Inspect Live Verified Kerala Itinerary</h3>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">Explore the exact 5-day route, budget breakdown, and conversational editor.</p>
                </div>
                <Link
                  href={`/trip/${dest.samplePlanId}`}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs whitespace-nowrap transition-colors shadow-sm"
                >
                  View Sample Plan
                </Link>
              </div>
            )}

          </div>

          {/* Right Sidebar: Quick Facts & CTA */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-5">
              <h3 className="font-bold text-slate-900 text-base">Travel Logistics Overview</h3>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <span className="text-slate-400 block font-semibold">Best Season to Visit</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{dest.bestSeason}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Typical Cost Guidance</span>
                  <span className="font-bold text-brand-600 mt-0.5 block">{dest.typicalBudget}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Transit Strategy</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">Train / Flight to Gateway + AC Taxi Circuit</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlanThis}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Build {dest.name} Itinerary with AI</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
