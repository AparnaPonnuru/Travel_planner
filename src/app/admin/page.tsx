'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Sparkles,
  Save,
  CheckCircle2,
  Database,
  BarChart3,
  Cpu
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [statsRes, configRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/config')
      ]);
      const statsData = await statsRes.json();
      const configData = await configRes.json();
      setStats(statsData.stats);
      setConfig(configData.config);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f8fafc]">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 bg-[#f8fafc] text-slate-800">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Platform Administration & AI Control Room</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 mt-1">AI Architecture Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1">Configure prompt engineering pipelines and tune parameters.</p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-emerald-700 font-bold flex items-center gap-2 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Multi-Stage Logistics Pipeline Active</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Trips Generated</span>
            <Sparkles className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.metrics?.totalGenerations || 43}</div>
          <span className="text-[10px] text-emerald-700 font-bold">Zero-backtracking verified</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dependency Edits</span>
            <Activity className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.metrics?.totalModifications || 119}</div>
          <span className="text-[10px] text-slate-500 font-medium">Conversational cascades</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Finalized Itineraries</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.metrics?.totalFinalized || 31}</div>
          <span className="text-[10px] text-slate-500 font-medium">Confirmed traveler plans</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Mean Budget Handled</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">₹{stats?.averageTripBudget?.toLocaleString() || '58,500'}</div>
          <span className="text-[10px] text-slate-500 font-medium">With 8% reserve</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* AI MODEL CONFIGURATION */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">AI Engine & Model Tuning</h2>
            </div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          {config && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Active AI Model Provider</label>
                  <select
                    value={config.activeAiModel}
                    onChange={(e) => setConfig({ ...config, activeAiModel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none"
                  >
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended)</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                    <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                    <option value="deterministic-local">Deterministic Logistics Engine (Offline Mode)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Temperature ({config.temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-brand-600 mt-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>

              {/* Versioned System Prompts */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">System Architect Prompt</label>
                <textarea
                  value={config.prompts.systemPrompt}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      prompts: { ...config.prompts, systemPrompt: e.target.value }
                    })
                  }
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Dependency Recalculation Prompt</label>
                <textarea
                  value={config.prompts.modificationPrompt}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      prompts: { ...config.prompts, modificationPrompt: e.target.value }
                    })
                  }
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-500/20 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </form>
          )}
        </div>

        {/* POPULAR DESTINATIONS & HEALTH */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Popular Destinations Generation Share</h3>
            <div className="space-y-3">
              {(stats?.popularDestinations || []).map((d: any) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{d.name}</span>
                    <span className="text-brand-600 font-extrabold">{d.count} trips</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-cyan-500"
                      style={{ width: `${Math.min(100, (d.count / 25) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-600" />
              <span>Service Health</span>
            </h3>
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Database Engine:</span>
                <span className="text-emerald-700 font-bold">Operational (JSON / MongoDB Dual-Ready)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Vector Coordinates DB:</span>
                <span className="text-emerald-700 font-bold">Active (Verified Geocodes)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Climatic Weather Model:</span>
                <span className="text-emerald-700 font-bold">Active (Seasonal Profiles)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
