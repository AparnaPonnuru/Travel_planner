'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ExplorePage() {
  const categories = [
    {
      title: 'Serene Nature & Backwaters',
      dest: 'Kerala, India',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      badge: 'Nature & Spiritual',
      href: '/trip/trip-kerala-flagship'
    },
    {
      title: 'Coastal Bohemian Escapes',
      dest: 'South Goa',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      badge: 'Beaches & Heritage',
      href: '/destinations/goa'
    },
    {
      title: 'Imperial Palaces & Fortresses',
      dest: 'Jaipur & Udaipur',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
      badge: 'Royal Rajasthan',
      href: '/destinations/jaipur'
    },
    {
      title: 'Ancient Shrines & Modern Metros',
      dest: 'Tokyo & Kyoto',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
      badge: 'Japan Expeditions',
      href: '/destinations/tokyo'
    }
  ];

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-[#f8fafc] text-slate-800">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">Inspirational Portfolios</span>
        <h1 className="text-4xl font-extrabold font-display text-slate-900">Explore Travel Curations</h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
          Sample itineraries designed with zero-backtracking logistics, certified hotels, and genuine cultural immersion.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((c, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover overflow-hidden flex flex-col justify-between group transition-all">
            <div className="relative h-60 w-full overflow-hidden">
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-800 border border-slate-200 backdrop-blur-md">
                {c.badge}
              </span>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-xs text-brand-300 font-bold block">{c.dest}</span>
                <h3 className="text-base font-bold">{c.title}</h3>
              </div>
            </div>

            <div className="p-5 pt-3">
              <Link
                href={c.href}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-brand-600 text-slate-800 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Inspect Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
