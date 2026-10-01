'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16 bg-[#f8fafc] text-slate-800">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-brand-600 uppercase">Architecture & Methodology</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900">How VoyageAI Works</h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
          A multi-stage logistics agent that calculates real geography, realistic travel times, and financial safety cushions.
        </p>
      </div>

      {/* 4 Steps */}
      <div className="space-y-8">
        
        {/* Step 1 */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-2 text-center md:text-left">
            <span className="text-5xl font-extrabold font-display text-brand-200">01</span>
          </div>
          <div className="md:col-span-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Stage 1 — Requirement Parser</span>
            <h2 className="text-2xl font-bold font-display text-slate-900">Tell us about your trip (Form or Natural Speech)</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Use our 10-step wizard or type natural language like: 
              <span className="italic text-brand-700"> &quot;Plan a 5-day Kerala trip for 3 people from Hyderabad with a budget of ₹60,000.&quot;</span> 
              Our engine parses hard constraints and classifies soft preferences.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-2 text-center md:text-left">
            <span className="text-5xl font-extrabold font-display text-cyan-200">02</span>
          </div>
          <div className="md:col-span-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">Stage 2 — Route & Physical Realism Engine</span>
            <h2 className="text-2xl font-bold font-display text-slate-900">Multi-stage logistics & zero backtracking</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              We sequence cities linearly (e.g. Kochi → Munnar → Alleppey) to eliminate backtracking. Each stop calculates real coordinates, opening hours, afternoon tea breaks, and transit buffers.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-2 text-center md:text-left">
            <span className="text-5xl font-extrabold font-display text-amber-200">03</span>
          </div>
          <div className="md:col-span-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Stage 3 — Dependency Recalculation</span>
            <h2 className="text-2xl font-bold font-display text-slate-900">Intelligent modifications via conversation</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              When you say <span className="text-brand-700 italic">&quot;Remove the houseboat and add Munnar&quot;</span> or <span className="text-brand-700 italic">&quot;Make Day 2 relaxed&quot;</span>, our recalculator cascades through hotel nights, road transfers, daily schedules, and the budget with a clear diff.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-2 text-center md:text-left">
            <span className="text-5xl font-extrabold font-display text-purple-200">04</span>
          </div>
          <div className="md:col-span-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Stage 4 — Finalization & Travel Companion</span>
            <h2 className="text-2xl font-bold font-display text-slate-900">Finalize, export PDF, and Travel Mode</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Lock your plan into finalized status, export high-resolution PDFs, share public links with friends, or switch into high-contrast Travel Mode on your phone during the journey.
            </p>
          </div>
        </div>

      </div>

      <div className="text-center pt-4">
        <Link
          href="/plan"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Experience the Agent Yourself</span>
        </Link>
      </div>

    </div>
  );
}
