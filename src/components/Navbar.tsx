'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, MapPin, Bookmark, Menu, X, User, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Only fetch once on initial mount, not on every page transition
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []); // Run once on mount

  const navLinks = [
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'AI Trip Planner', href: '/plan', icon: Sparkles, highlight: true },
    { label: 'Destinations', href: '/destinations', icon: MapPin },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Saved Trips', href: '/dashboard', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#F0EBE1] shadow-[0_2px_12px_rgba(24,30,75,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Jadoo & Travellian refined style */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#DF6951] flex items-center justify-center shadow-lg shadow-[#DF6951]/25 group-hover:scale-105 transition-transform duration-300">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tight font-serif text-[#181E4B]">Voyage</span>
              <span className="text-2xl font-extrabold text-[#DF6951]">AI</span>
            </div>
            <p className="text-[9px] text-[#5E6282] tracking-wider uppercase font-semibold">Luxury Travel Designer</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#DF6951] bg-[#DF6951]/10 font-semibold'
                    : 'text-[#181E4B] hover:text-[#DF6951] hover:bg-[#FAF6ED]'
                } ${link.highlight && !isActive ? 'text-[#DF6951] font-semibold' : ''}`}
              >
                {link.icon && <link.icon className={`w-3.5 h-3.5 ${link.highlight ? 'text-[#DF6951]' : 'text-slate-400'}`} />}
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/admin"
            className="px-3 py-1.5 text-xs text-[#5E6282] hover:text-[#181E4B] flex items-center gap-1 rounded-full hover:bg-slate-100 transition-colors"
            title="Admin AI Settings"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Admin</span>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs text-[#181E4B] font-semibold transition-colors shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-[#DF6951]/10 text-[#DF6951] flex items-center justify-center font-bold text-xs">
                {currentUser.name?.[0] || 'U'}
              </div>
              <span className="max-w-[100px] truncate">{currentUser.name?.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-[#181E4B] hover:text-[#DF6951] px-3 py-2 transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-slate-400" />
              Sign In
            </Link>
          )}

          <Link
            href="/plan"
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#F1A501] hover:bg-[#e29b00] shadow-[0_10px_20px_-4px_rgba(241,165,1,0.4)] hover:shadow-[0_14px_24px_-4px_rgba(241,165,1,0.5)] transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Design My Trip</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/plan"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Plan
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-base font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-900"
            >
              Admin Dashboard
            </Link>
            {currentUser ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-brand-600 font-semibold"
              >
                Logged in as {currentUser.name}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-slate-700 font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
