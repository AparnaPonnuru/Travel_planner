'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const DESTINATIONS = [
  {
    slug: 'kerala',
    name: 'Kerala, India',
    tagline: "God's Own Country • Backwaters, Spice Hills & Ancient Temples",
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    budgetGuide: '₹40,000 - ₹75,000 for 5 days',
    bestTime: 'October to March',
    vibe: 'Serene & Lush'
  },
  {
    slug: 'goa',
    name: 'South Goa, India',
    tagline: 'Portuguese Heritage, White Sands & Coastal Sunset Shacks',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    budgetGuide: '₹35,000 - ₹65,000 for 4 days',
    bestTime: 'November to February',
    vibe: 'Coastal & Bohemian'
  },
  {
    slug: 'jaipur',
    name: 'Jaipur & Udaipur, Rajasthan',
    tagline: 'Royal Fortresses, Amber Palaces & Vibrant Artisanal Bazaars',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
    budgetGuide: '₹50,000 - ₹90,000 for 6 days',
    bestTime: 'October to March',
    vibe: 'Imperial & Historic'
  },
  {
    slug: 'tokyo',
    name: 'Tokyo & Kyoto, Japan',
    tagline: 'Shinto Shrines, High-Speed Shinkansen & Michelin Gastronomy',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    budgetGuide: '$1,800 - $3,000 for 7 days',
    bestTime: 'Spring (Sakura) & Autumn',
    vibe: 'Sacred & Modern'
  },
  {
    slug: 'swiss-alps',
    name: 'Swiss Alps, Switzerland',
    tagline: 'Snow-Capped Summits, Alpine Cogwheel Trains & Crystal Lakes',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
    budgetGuide: '€1,600 - €2,800 for 6 days',
    bestTime: 'Dec - Feb / Jun - Aug',
    vibe: 'Alpine & Crisp'
  }
];

export default function DestinationsDirectoryPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-[#f8fafc] text-slate-800">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">Curated Portfolios</span>
        <h1 className="text-4xl font-extrabold font-display text-slate-900">Explore Destinations</h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          Discover verified travel guides, climate patterns, and realistic budget expectations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DESTINATIONS.map((dest) => (
          <Link
            key={dest.slug}
            href={`/destinations/${dest.slug}`}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover overflow-hidden group flex flex-col justify-between transition-all"
          >
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold uppercase tracking-wider block">{dest.vibe}</span>
                <h3 className="text-xl font-bold leading-snug">{dest.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{dest.tagline}</p>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Typical Budget</span>
                  <span className="font-bold text-brand-600">{dest.budgetGuide}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-medium">Best Season</span>
                  <span className="font-bold text-slate-800">{dest.bestTime}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
                <span>View Comprehensive Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
