'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [homeCity, setHomeCity] = useState('Hyderabad');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, homeCity, currency })
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-[#FFFDF9] text-[#181E4B]">
      <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-md w-full border border-[#ECE5D8] shadow-[0_12px_36px_-8px_rgba(24,30,75,0.06)] space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#DF6951] flex items-center justify-center mx-auto shadow-md shadow-[#DF6951]/25">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold font-serif text-[#181E4B]">Create Traveler Account</h1>
          <p className="text-xs text-[#5E6282] font-medium">Save custom itineraries and access multi-version history</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#181E4B]">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Aarav Sharma"
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-2.5 text-xs text-[#181E4B] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#181E4B]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@domain.com"
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-2.5 text-xs text-[#181E4B] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#181E4B]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-2.5 text-xs text-[#181E4B] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#181E4B]">Home City</label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] rounded-2xl px-3 py-2 text-xs text-[#181E4B] font-medium focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#181E4B]">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] rounded-2xl px-3 py-2 text-xs text-[#181E4B] font-medium focus:outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#DF6951] hover:bg-[#d45840] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#DF6951]/25 transition-all mt-2 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-[#5E6282] font-medium">
          Already registered?{' '}
          <Link href="/login" className="text-[#DF6951] font-bold hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
