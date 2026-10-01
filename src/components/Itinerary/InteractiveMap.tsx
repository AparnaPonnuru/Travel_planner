'use client';

import React, { useEffect, useState } from 'react';
import { Activity, DayItinerary } from '@/types/trip';
import { Navigation, Compass } from 'lucide-react';

interface InteractiveMapProps {
  days: DayItinerary[];
  selectedDayNumber?: number | null;
  activeActivityId?: string | null;
  onSelectActivity?: (activity: Activity) => void;
}

export default function InteractiveMap({
  days,
  selectedDayNumber,
  activeActivityId,
  onSelectActivity
}: InteractiveMapProps) {
  const [activeDay, setActiveDay] = useState<number | null>(selectedDayNumber ?? null);

  useEffect(() => {
    setActiveDay(selectedDayNumber ?? null);
  }, [selectedDayNumber]);

  const allActivities = days.flatMap(d => d.activities.map(a => ({ ...a, dayNumber: d.dayNumber })));
  const visibleActivities = activeDay
    ? allActivities.filter(a => a.dayNumber === activeDay)
    : allActivities;

  const validCoords = visibleActivities.filter(a => a.coordinates?.lat && a.coordinates?.lng);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-card flex flex-col">
      
      {/* Map Control Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200 pointer-events-auto flex items-center gap-2 text-xs shadow-sm">
          <Navigation className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          <span className="font-bold text-slate-800">
            {activeDay ? `Day ${activeDay} Route` : 'Full Journey Route'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">({visibleActivities.length} Stops)</span>
        </div>

        {/* Day Filter Pills */}
        <div className="bg-white/95 p-1 rounded-xl border border-slate-200 pointer-events-auto flex items-center gap-1 shadow-sm overflow-x-auto max-w-[260px]">
          <button
            type="button"
            onClick={() => setActiveDay(null)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              activeDay === null
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {days.map(d => (
            <button
              key={d.dayNumber}
              type="button"
              onClick={() => setActiveDay(d.dayNumber)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                activeDay === d.dayNumber
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              D{d.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Styled Clean Light Map Canvas */}
      <div className="relative flex-1 bg-[#f1f5f9] overflow-hidden flex items-center justify-center">
        
        {/* Clean Map Grid */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Compass Rose */}
        <div className="absolute bottom-6 right-6 opacity-15 pointer-events-none">
          <Compass className="w-24 h-24 text-slate-500 animate-spin-slow" />
        </div>

        {/* SVG Route Visualizer */}
        <svg className="w-full h-full p-12 pointer-events-auto" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="routeLineGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="markerShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
          </defs>

          {(() => {
            const minLat = Math.min(...validCoords.map(c => c.coordinates.lat)) - 0.05;
            const maxLat = Math.max(...validCoords.map(c => c.coordinates.lat)) + 0.05;
            const minLng = Math.min(...validCoords.map(c => c.coordinates.lng)) - 0.05;
            const maxLng = Math.max(...validCoords.map(c => c.coordinates.lng)) + 0.05;

            const latSpan = Math.max(0.1, maxLat - minLat);
            const lngSpan = Math.max(0.1, maxLng - minLng);

            const points = visibleActivities.map((act, index) => {
              const x = 80 + ((act.coordinates.lng - minLng) / lngSpan) * 640;
              const y = 80 + ((maxLat - act.coordinates.lat) / latSpan) * 340;
              return { ...act, x, y, index };
            });

            const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

            return (
              <g>
                {points.length > 1 && (
                  <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="url(#routeLineGradLight)"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {points.map((p) => {
                  const isSelected = activeActivityId === p.id;
                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer group"
                      onClick={() => onSelectActivity && onSelectActivity(p)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 16 : 11}
                        fill={isSelected ? '#e0f2fe' : '#ffffff'}
                        stroke={isSelected ? '#0284c7' : '#0ea5e9'}
                        strokeWidth="2.5"
                        filter="url(#markerShadow)"
                      />

                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 6 : 4.5}
                        fill={isSelected ? '#0284c7' : '#0ea5e9'}
                      />

                      <g transform={`translate(${p.x + 12}, ${p.y - 12})`}>
                        <rect
                          x="0"
                          y="0"
                          width={p.name.length * 6.5 + 24}
                          height="22"
                          rx="6"
                          fill="#ffffff"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          filter="url(#markerShadow)"
                        />
                        <text
                          x="6"
                          y="15"
                          fill="#0f172a"
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="sans-serif"
                        >
                          D{p.dayNumber} • {p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 px-3 py-2 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1 shadow-sm font-semibold pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span>Sequenced Destination Stops</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-cyan-500" />
            <span>Optimal Road & Rail Transfers</span>
          </div>
        </div>

      </div>

    </div>
  );
}
