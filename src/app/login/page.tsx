'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@voyage.ai');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'user' | 'admin') => {
    const demoEmail = role === 'admin' ? 'admin@voyage.ai' : 'demo@voyage.ai';
    const demoPass = 'Password123!';
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass })
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Authentication error');
      }
    } catch (e) {
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
          <h1 className="text-2xl font-extrabold font-serif text-[#181E4B]">Welcome Back</h1>
          <p className="text-xs text-[#5E6282] font-medium">Access your private itineraries and AI concierge</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181E4B]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-2.5 text-xs text-[#181E4B] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#181E4B]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#FAF6ED] border border-[#ECE5D8] focus:border-[#DF6951] rounded-2xl pl-11 pr-4 py-2.5 text-xs text-[#181E4B] font-medium focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#DF6951] hover:bg-[#d45840] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#DF6951]/25 transition-all cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-2 border-t border-[#ECE5D8] space-y-2 text-center">
          <span className="text-[10px] text-[#5E6282] block uppercase font-bold tracking-wider">1-Click Instant Demo Login</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('user')}
              className="flex-1 py-2.5 rounded-2xl bg-[#FAF6ED] hover:bg-[#DF6951] text-[#181E4B] hover:text-white text-xs font-bold border border-[#ECE5D8] transition-all cursor-pointer"
            >
              Traveler Demo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex-1 py-2.5 rounded-2xl bg-[#FAF6ED] hover:bg-[#181E4B] text-[#181E4B] hover:text-white text-xs font-bold border border-[#ECE5D8] transition-all cursor-pointer"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#5E6282] font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#DF6951] font-bold hover:underline">
            Create Free Account
          </Link>
        </div>

      </div>
    </div>
  );
}
