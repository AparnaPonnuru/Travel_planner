import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Globe, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF7F0] border-t border-[#ECE5D8] pt-16 pb-12 text-[#5E6282] text-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#ECE5D8]">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#DF6951] flex items-center justify-center shadow-md shadow-[#DF6951]/25">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-bold font-serif text-[#181E4B] tracking-tight">Voyage<span className="text-[#DF6951]">AI</span></span>
            </Link>
            <p className="text-[#5E6282] text-sm leading-relaxed max-w-sm">
              The intelligent luxury travel designer. Creating bespoke, budget-protected, realistic holiday itineraries with real-time recalculation.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#DF6951] bg-[#DF6951]/10 px-3 py-1.5 rounded-full w-fit font-bold">
              <ShieldCheck className="w-4 h-4 text-[#DF6951]" />
              <span>Multi-Stage Autonomous Constraint Engine</span>
            </div>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="text-[#181E4B] font-bold text-xs uppercase tracking-wider mb-4">Destinations</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li><Link href="/destinations/kerala" className="hover:text-[#DF6951] transition-colors">Kerala, India</Link></li>
              <li><Link href="/destinations/goa" className="hover:text-[#DF6951] transition-colors">South Goa</Link></li>
              <li><Link href="/destinations/jaipur" className="hover:text-[#DF6951] transition-colors">Jaipur & Rajasthan</Link></li>
              <li><Link href="/destinations/tokyo" className="hover:text-[#DF6951] transition-colors">Tokyo & Kyoto</Link></li>
              <li><Link href="/destinations/swiss-alps" className="hover:text-[#DF6951] transition-colors">Swiss Alps</Link></li>
            </ul>
          </div>

          {/* Product Features */}
          <div>
            <h4 className="text-[#181E4B] font-bold text-xs uppercase tracking-wider mb-4">AI Platform</h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li><Link href="/plan" className="hover:text-[#DF6951] transition-colors flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#F1A501]" /> Plan My Trip</Link></li>
              <li><Link href="/trip/trip-kerala-flagship" className="hover:text-[#DF6951] transition-colors">Interactive Demo Trip</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#DF6951] transition-colors">Dependency Engine</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#DF6951] transition-colors">Saved Itineraries</Link></li>
              <li><Link href="/admin" className="hover:text-[#DF6951] transition-colors">System Telemetry</Link></li>
            </ul>
          </div>

          {/* Travel Intelligence */}
          <div>
            <h4 className="text-[#181E4B] font-bold text-xs uppercase tracking-wider mb-4">Architecture</h4>
            <p className="text-xs text-[#5E6282] leading-relaxed font-medium">
              Every route calculates realistic transit times, buffer periods, check-in deadlines, and itemized 8% budget cushions.
            </p>
            <div className="mt-4 pt-3 border-t border-[#ECE5D8] flex items-center gap-2 text-xs text-[#181E4B] font-medium">
              <Globe className="w-3.5 h-3.5 text-[#DF6951]" />
              <span>INR (₹) / USD ($) / EUR (€)</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5E6282] gap-4 font-medium">
          <p>© {new Date().getFullYear()} VoyageAI Technologies Inc. Engineered for discerning travelers.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#181E4B] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#181E4B] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#181E4B] cursor-pointer">API Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
