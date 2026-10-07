import React, { useState, useEffect } from 'react';
import {
  Compass,
  Train,
  Calendar,
  Wallet,
  Utensils,
  ShieldCheck,
  Check,
  Plane,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import type { AgentEvent } from '../services/api';

interface AgentVisualizerProps {
  events: AgentEvent[];
  isRunning: boolean;
  destination?: string;
  origin?: string;
}

interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  color: string;
  bgLight: string;
}

const TRAVEL_STAGES: StepConfig[] = [
  {
    id: 'research',
    title: 'Destination Discovery',
    description: 'Scouting signature monuments & sights',
    icon: Compass,
    color: '#0891B2',
    bgLight: '#ECFEFF',
  },
  {
    id: 'transit',
    title: 'Transit & Route Network',
    description: 'Evaluating express trains, buses & flights',
    icon: Train,
    color: '#D97706',
    bgLight: '#FFFBEB',
  },
  {
    id: 'itinerary',
    title: 'Day-by-Day Journey Pacing',
    description: 'Scheduling morning, afternoon & sunset plans',
    icon: Calendar,
    color: '#059669',
    bgLight: '#ECFDF5',
  },
  {
    id: 'budget',
    title: 'Smart Budget Allocation',
    description: 'Balancing stay, transport & dining expenses',
    icon: Wallet,
    color: '#E11D48',
    bgLight: '#FFF1F2',
  },
  {
    id: 'local_guide',
    title: 'Hidden Gems & Dining',
    description: 'Curating authentic eateries & secret viewpoints',
    icon: Utensils,
    color: '#7C3AED',
    bgLight: '#F5F3FF',
  },
  {
    id: 'safety',
    title: 'Safety Advisory & Essentials',
    description: 'Compiling health tips & emergency contacts',
    icon: ShieldCheck,
    color: '#0D9488',
    bgLight: '#F0FDFA',
  },
];

const TRAVEL_TIPS = [
  'Grouping monuments geographically saves up to 40% in local transit time.',
  'Early morning temple and fort visits give the clearest lighting and coolest weather.',
  'Traditional regional thali lunches provide the most complete authentic local culinary experience.',
  'Always reserve a 8-10% contingency reserve for spontaneous boat rides and local handicrafts.',
  'Carrying a lightweight scarf or shawl is recommended for entering active cultural sanctums.',
];

export default function AgentVisualizer({
  events,
  isRunning,
  destination = 'Your Destination',
  origin = 'Your Origin',
}: AgentVisualizerProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TRAVEL_TIPS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const getStageStatus = (stageId: string): 'pending' | 'active' | 'done' => {
    const stageEvents = events.filter((e: any) => {
      const step = (e.step || '').toLowerCase();
      const agent = (e.agent_name || e.agent || '').toLowerCase();
      const msg = (e.message || '').toLowerCase();
      if (stageId === 'research') return step.includes('research') || agent.includes('research') || msg.includes('sights') || msg.includes('monuments');
      if (stageId === 'transit') return step.includes('transit') || agent.includes('transit') || msg.includes('transit') || msg.includes('train');
      if (stageId === 'itinerary') return step.includes('itinerary') || agent.includes('itinerary') || msg.includes('itinerary') || msg.includes('pacing');
      if (stageId === 'budget') return step.includes('budget') || agent.includes('budget') || msg.includes('budget') || msg.includes('spending');
      if (stageId === 'local_guide') return step.includes('local') || agent.includes('local') || step.includes('guide') || msg.includes('hidden gems') || msg.includes('culinary');
      if (stageId === 'safety') return step.includes('safety') || agent.includes('safety') || msg.includes('safety') || msg.includes('advisories');
      return false;
    });

    if (!stageEvents.length) return 'pending';
    const last = stageEvents[stageEvents.length - 1];
    const status = (last.status || '').toLowerCase();
    if (status === 'done' || status === 'completed') return 'done';
    if (status === 'thinking' || status === 'working' || status === 'running' || status === 'active') return 'active';
    return 'pending';
  };

  const completedCount = TRAVEL_STAGES.filter((s) => getStageStatus(s.id) === 'done').length;
  const activeCount = TRAVEL_STAGES.filter((s) => getStageStatus(s.id) === 'active').length;
  
  // Real percentage: Each done stage adds ~16.6%, active adds 8.3%.
  const rawProgress = Math.round((completedCount * 16.66) + (activeCount * 8.33));
  const progressPercent = Math.min(100, Math.max(isRunning ? 12 : 0, rawProgress));

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF6ED 100%)',
        borderRadius: '24px',
        padding: '20px 22px',
        border: '1px solid #ECE5D8',
        boxShadow: '0 24px 64px rgba(24, 30, 75, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '620px',
        maxHeight: 'min(86vh, 680px)',
        overflowY: 'auto',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ── 1. Compact Flight & Journey Route Header ── */}
      <div
        style={{
          background: '#181E4B',
          borderRadius: '16px',
          padding: '14px 18px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#DF6951',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <Sparkles size={13} />
              <span>Curating Your Bespoke Journey</span>
            </div>
            <h2
              style={{
                fontFamily: "'Volkhov', serif",
                fontSize: '18px',
                fontWeight: 700,
                margin: '4px 0 0',
                color: '#FFFFFF',
              }}
            >
              {origin.split(',')[0]} → {destination.split(',')[0]}
            </h2>
          </div>

          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plane
              size={20}
              color="#F1A501"
              style={{
                animation: isRunning ? 'flightBob 2s ease-in-out infinite' : 'none',
              }}
            />
          </div>
        </div>

        {/* Progress bar line */}
        <div style={{ marginTop: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10.5px',
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.75)',
              marginBottom: '5px',
            }}
          >
            <span>Journey Blueprint Synthesis</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div
            style={{
              height: '5px',
              borderRadius: '5px',
              background: 'rgba(255, 255, 255, 0.18)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: '5px',
                background: 'linear-gradient(90deg, #DF6951, #F1A501)',
                width: `${progressPercent}%`,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── 2. Playful Cartoon Travel Adventure Scene (Bus & Hills Animation) ── */}
      <div
        style={{
          background: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 55%, #86EFAC 55%, #4ADE80 100%)',
          borderRadius: '16px',
          height: '100px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #BAE6FD',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
          flexShrink: 0,
        }}
      >
        {/* Animated Sun */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '24px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#FBBF24',
            boxShadow: '0 0 16px #F59E0B',
            animation: 'sunGlow 3s ease-in-out infinite alternate',
          }}
        />

        {/* Drifting Clouds */}
        <div className="cartoon-cloud cloud-1" style={{ top: '10px' }} />
        <div className="cartoon-cloud cloud-2" style={{ top: '24px' }} />

        {/* Road Surface */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '28px',
            background: '#334155',
            borderTop: '2px solid #64748B',
          }}
        >
          {/* Animated road dashed line */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: 0,
              right: 0,
              height: '3px',
              backgroundImage: 'repeating-linear-gradient(90deg, #F8FAFC 0px, #F8FAFC 16px, transparent 16px, transparent 32px)',
              animation: 'roadStripes 0.6s linear infinite',
            }}
          />
        </div>

        {/* Animated Cartoon Travel Bus / Camper Van */}
        <div
          style={{
            position: 'absolute',
            bottom: '14px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'vanBob 0.6s ease-in-out infinite alternate',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Roof Luggage Rack with colorful bags */}
          <div style={{ display: 'flex', gap: '3px', marginBottom: '-2px', zIndex: 2 }}>
            <div style={{ width: '14px', height: '8px', background: '#EF4444', borderRadius: '2px', border: '1px solid #B91C1C' }} />
            <div style={{ width: '18px', height: '9px', background: '#F59E0B', borderRadius: '3px', border: '1px solid #D97706' }} />
            <div style={{ width: '12px', height: '7px', background: '#3B82F6', borderRadius: '2px', border: '1px solid #1D4ED8' }} />
          </div>

          {/* Van Body */}
          <div
            style={{
              width: '84px',
              height: '36px',
              background: '#0284C7',
              borderRadius: '8px 12px 4px 4px',
              position: 'relative',
              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              overflow: 'hidden',
              border: '2px solid #0369A1',
            }}
          >
            {/* White top half */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '18px',
                background: '#FFFFFF',
                display: 'flex',
                gap: '4px',
                padding: '3px 6px',
                alignItems: 'center',
              }}
            >
              {/* Windows */}
              <div style={{ width: '16px', height: '11px', background: '#7DD3FC', borderRadius: '2px', border: '1px solid #38BDF8' }} />
              <div style={{ width: '16px', height: '11px', background: '#7DD3FC', borderRadius: '2px', border: '1px solid #38BDF8' }} />
              <div style={{ width: '18px', height: '11px', background: '#7DD3FC', borderRadius: '2px 6px 2px 2px', border: '1px solid #38BDF8' }} />
            </div>

            {/* Coral accent stripe */}
            <div style={{ position: 'absolute', top: '18px', left: 0, right: 0, height: '4px', background: '#DF6951' }} />

            {/* Headlight beam */}
            <div
              style={{
                position: 'absolute',
                right: '2px',
                bottom: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FEF08A',
                boxShadow: '0 0 8px #FDE047',
              }}
            />
          </div>

          {/* Wheels with spin animation */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '68px',
              marginTop: '-6px',
              zIndex: 3,
            }}
          >
            <div className="cartoon-wheel">
              <div className="wheel-hub" />
            </div>
            <div className="cartoon-wheel">
              <div className="wheel-hub" />
            </div>
          </div>
        </div>

        {/* Travel destination caption overlay */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '12px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            borderRadius: '8px',
            padding: '2px 8px',
            fontSize: '9.5px',
            fontWeight: 800,
            color: '#181E4B',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Compass size={11} color="#DF6951" />
          <span>Voyage AI Roadtrip Engine Active</span>
        </div>
      </div>

      {/* ── 3. Compact 2-Column Stages Progress Grid (Clean SVG Icons) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', flexShrink: 0 }}>
        {TRAVEL_STAGES.map((stage) => {
          const status = getStageStatus(stage.id);
          const isDone = status === 'done';
          const isActive = status === 'active';
          const IconComponent = stage.icon;

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '12px',
                background: isActive ? '#FFFFFF' : isDone ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)',
                border: `1.5px solid ${isActive ? stage.color : isDone ? '#A7F3D0' : '#ECE5D8'}`,
                boxShadow: isActive ? `0 4px 12px ${stage.color}18` : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {/* Stage Icon */}
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '10px',
                  background: isDone ? '#ECFDF5' : isActive ? stage.bgLight : '#FAF6ED',
                  border: `1px solid ${isDone ? '#A7F3D0' : isActive ? stage.color + '40' : '#ECE5D8'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDone ? '#059669' : isActive ? stage.color : '#8A8FA3',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <Check size={15} strokeWidth={3} />
                ) : (
                  <IconComponent size={15} />
                )}
              </div>

              {/* Title & Status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: isDone ? '#181E4B' : isActive ? stage.color : '#5E6282',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {stage.title}
                </div>
                <div
                  style={{
                    fontSize: '9.5px',
                    color: isDone ? '#059669' : isActive ? stage.color : '#94A3B8',
                    fontWeight: 700,
                    marginTop: '1px',
                  }}
                >
                  {isDone ? 'Completed' : isActive ? 'Active...' : 'Queued'}
                </div>
              </div>

              {/* Spinner / Status Dot */}
              {isActive && (
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: `2px solid ${stage.color}`,
                    borderTopColor: 'transparent',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── 4. Rotating Travel Tips Carousel (Entertains user while waiting) ── */}
      <div
        style={{
          background: '#FAF6ED',
          borderRadius: '12px',
          padding: '10px 14px',
          border: '1px solid #ECE5D8',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            background: '#FFF2ED',
            border: '1px solid #DF695125',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DF6951',
            flexShrink: 0,
          }}
        >
          <Lightbulb size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '9px',
              fontWeight: 800,
              color: '#DF6951',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Travel Insight
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#181E4B',
              fontWeight: 600,
              lineHeight: 1.35,
              marginTop: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {TRAVEL_TIPS[tipIndex]}
          </div>
        </div>
      </div>

      {/* ── CSS Animations & Cartoon Keyframes ── */}
      <style>{`
        @keyframes flightBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(3deg); }
        }
        @keyframes sunGlow {
          0% { transform: scale(0.95); opacity: 0.9; }
          100% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes vanBob {
          0% { transform: translateX(-50%) translateY(0); }
          100% { transform: translateX(-50%) translateY(-2px); }
        }
        @keyframes roadStripes {
          0% { transform: translateX(0); }
          100% { transform: translateX(-32px); }
        }
        @keyframes wheelSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes cloudDrift {
          0% { transform: translateX(-60px); }
          100% { transform: translateX(650px); }
        }

        .cartoon-cloud {
          position: absolute;
          width: 48px;
          height: 16px;
          background: #FFFFFF;
          border-radius: 20px;
          opacity: 0.85;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }
        .cloud-1 {
          animation: cloudDrift 14s linear infinite;
        }
        .cloud-2 {
          animation: cloudDrift 20s linear infinite;
          animation-delay: -7s;
          opacity: 0.65;
          transform: scale(0.8);
        }

        .cartoon-wheel {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1E293B;
          border: 2px solid #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: wheelSpin 0.5s linear infinite;
        }
        .wheel-hub {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #E2E8F0;
        }
      `}</style>
    </div>
  );
}
