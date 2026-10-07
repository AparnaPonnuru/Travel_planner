import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ArrowLeft, MapPin, Calendar, Users,
  Compass, Star, ShieldCheck, Wallet, Plane, Plus, Minus, Check, Heart,
  Play, Clock, Repeat, ChevronRight, Search, Activity, Cpu, ShieldAlert,
  Car, Train, CheckCircle2, Bed, Utensils, Trees, Mountain, Landmark, Leaf
} from 'lucide-react';
import AgentVisualizer from '../components/AgentVisualizer';
import LocationSelector from '../components/LocationSelector';
import CalendarDatePicker from '../components/CalendarDatePicker';
import { createTripStream, parseNaturalLanguage, type AgentEvent } from '../services/api';

type PartyType = 'solo' | 'couple' | 'friends' | 'family';
type CurrencyType = 'INR' | 'USD' | 'EUR';
type TravelStyle = 'relaxed' | 'nature' | 'cultural' | 'food-focused' | 'adventure' | 'spiritual';
type AccommodationType = 'hotel' | 'resort' | 'homestay';
type TransitPreference = 'flight' | 'train' | 'rental';

export default function HomePage() {
  const navigate = useNavigate();

  // ─── Floating Quick-Planner Bar State (From Landing Page) ───
  const [quickDestination, setQuickDestination] = useState('Kerala, India');
  const [quickStyle, setQuickStyle] = useState('Relaxed & Nature');
  const [quickDuration, setQuickDuration] = useState('5 Days');
  const [quickParty, setQuickParty] = useState('3 People (Group)');

  // ─── Natural Language Prompt State ───
  const [naturalPrompt, setNaturalPrompt] = useState(
    'Plan a 5-day Kerala trip for 3 people from Hyderabad with a budget of ₹60,000. We love nature, beaches, temples and local culinary experiences.'
  );
  const [isParsingNL, setIsParsingNL] = useState(false);

  // ─── Detailed 3-Step Wizard State ───
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Where & When
  const [destination, setDestination] = useState('Kerala, India');
  const [origin, setOrigin] = useState('Hyderabad, Telangana, India');
  const [durationDays, setDurationDays] = useState(5);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0]
  );

  // Step 2: Party & Budget
  const [partyType, setPartyType] = useState<PartyType>('friends');
  // Dynamic Friends config
  const [friendsCount, setFriendsCount] = useState(3);
  const [friendsVibe, setFriendsVibe] = useState('Chill Reunion');
  // Dynamic Family config
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [infants, setInfants] = useState(0);
  const [seniors, setSeniors] = useState(0);
  // Couple config
  const [coupleOccasion, setCoupleOccasion] = useState('Romantic Getaway');
  // Budget
  const [totalBudget, setTotalBudget] = useState(60000);
  const [currency, setCurrency] = useState<CurrencyType>('INR');
  // Travel vibes
  const [travelStyles, setTravelStyles] = useState<TravelStyle[]>(['relaxed', 'nature']);

  // Step 3: Stays & Preferences
  const [stayType, setStayType] = useState<AccommodationType>('hotel');
  const [transitPref, setTransitPref] = useState<TransitPreference>('train');
  const [mandatoryPlaces, setMandatoryPlaces] = useState('Mattupetty Dam, Tea Museum');
  const [specialWishes, setSpecialWishes] = useState('Pre-dawn temple pooja visit, authentic vegetarian culinary focus');

  // Generation & Streaming State
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentEvents, setAgentEvents] = useState<AgentEvent[]>([]);
  const [genStageText, setGenStageText] = useState('');

  // ─── Helper Functions ───
  const getTotalTravelers = () => {
    if (partyType === 'solo') return 1;
    if (partyType === 'couple') return 2;
    if (partyType === 'friends') return friendsCount;
    if (partyType === 'family') return adults + children + infants + seniors;
    return 3;
  };

  const getTravelersSummaryText = () => {
    if (partyType === 'solo') return '1 Solo Explorer';
    if (partyType === 'couple') return `2 Adults (${coupleOccasion})`;
    if (partyType === 'friends') return `${friendsCount} Friends (${friendsVibe})`;
    if (partyType === 'family') {
      const parts = [`${adults} Adults`];
      if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
      if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
      if (seniors > 0) parts.push(`${seniors} Senior${seniors > 1 ? 's' : ''}`);
      return parts.join(', ');
    }
    return `${getTotalTravelers()} Travelers`;
  };

  const toggleStyle = (style: TravelStyle) => {
    setTravelStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const scrollToPlanner = (targetDestination?: string, targetDuration?: number) => {
    if (targetDestination) {
      setDestination(targetDestination);
      setQuickDestination(targetDestination);
    }
    if (targetDuration) {
      setDurationDays(targetDuration);
    }
    const elem = document.getElementById('planner-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDestination(quickDestination);
    const parsedDays = parseInt(quickDuration) || 5;
    setDurationDays(parsedDays);
    if (quickParty.includes('Solo')) setPartyType('solo');
    else if (quickParty.includes('Couple')) setPartyType('couple');
    else if (quickParty.includes('Family')) setPartyType('family');
    else setPartyType('friends');

    scrollToPlanner(quickDestination, parsedDays);
  };

  const handleNaturalPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalPrompt.trim()) return;

    setIsParsingNL(true);
    try {
      const result = await parseNaturalLanguage(naturalPrompt);
      const cfg = result.parsedConfig;
      if (cfg) {
        if (cfg.destination) setDestination(cfg.destination);
        if (cfg.origin) setOrigin(cfg.origin);
        if (cfg.duration_days || cfg.durationDays) setDurationDays(cfg.duration_days || cfg.durationDays);
        if (cfg.budget?.total) setTotalBudget(cfg.budget.total);
        if (cfg.travelers?.party_type) setPartyType(cfg.travelers.party_type);
        if (cfg.travelers?.adults) setAdults(cfg.travelers.adults);
      }
      scrollToPlanner(cfg?.destination || destination);
    } catch {
      scrollToPlanner();
    } finally {
      setIsParsingNL(false);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setAgentEvents([]);
    setGenStageText('Synthesizing your bespoke journey...');

    const hardConstraints: string[] = [];
    const softPreferences: string[] = [specialWishes];

    if (partyType === 'family') {
      if (seniors > 0) {
        hardConstraints.push(`Includes ${seniors} senior citizen(s): require elevator access, ground floor rooms, and slow walking pace`);
      }
      if (infants > 0 || children > 0) {
        softPreferences.push(`Family with kids: include child-friendly rest breaks and safe food options`);
      }
    } else if (partyType === 'friends') {
      softPreferences.push(`Friends trip (${friendsVibe}): include vibrant social spots and group photo viewpoints`);
    } else if (partyType === 'couple') {
      softPreferences.push(`Couple occasion (${coupleOccasion}): prioritize scenic sunset dinners and boutique experiences`);
    }

    if (mandatoryPlaces.trim()) {
      hardConstraints.push(`MANDATORY MUST-VISIT ATTRACTIONS: The itinerary MUST explicitly schedule and cover these places: ${mandatoryPlaces}`);
    }

    const payload = {
      destination,
      origin,
      startDate,
      durationDays,
      mandatoryPlaces: mandatoryPlaces.trim(),
      must_visit_places: mandatoryPlaces.split(',').map(s => s.trim()).filter(Boolean),
      travelers: {
        adults: partyType === 'family' ? adults : (partyType === 'friends' ? friendsCount : (partyType === 'couple' ? 2 : 1)),
        children: partyType === 'family' ? children : 0,
        infants: partyType === 'family' ? infants : 0,
        party_type: partyType,
      },
      budget: {
        tier: totalBudget > 100000 ? ('luxury' as const) : totalBudget > 40000 ? ('moderate' as const) : ('budget' as const),
        total: totalBudget,
        currency,
        contingency_percent: 8,
      },
      travelStyles,
      interests: travelStyles,
      accommodationPreference: {
        type: stayType,
      },
      transportPreferences: {
        primary: transitPref,
        local: 'local taxi & cab',
      },
      specialRequirements: {
        hardConstraints,
        softPreferences,
      },
    };

    createTripStream(
      payload,
      (event) => {
        setAgentEvents(prev => [...prev, event]);
        setGenStageText(event.message);
      },
      (trip) => {
        const tripId = trip._id || trip.id;
        if (tripId) {
          navigate(`/trip/${tripId}`);
        }
      },
      (error) => {
        setGenStageText(`Error: ${error}`);
        setIsGenerating(false);
      },
      () => {
        // Stream complete
      }
    );
  };

  // ─── Data Collections ───
  const activityPills = [
    {
      name: 'Houseboat Cruise',
      tag: 'Water',
      people: '100+ travelers going',
      dest: 'Alleppey, Kerala',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Palolem Sunset Kayak',
      tag: 'Beach',
      people: '80+ travelers going',
      dest: 'South Goa, India',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Amber Palace Mirrors',
      tag: 'Heritage',
      people: '150+ travelers going',
      dest: 'Jaipur, Rajasthan',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Munnar Tea Slopes',
      tag: 'Hill Station',
      people: '120+ travelers going',
      dest: 'Munnar, Kerala',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const popularTrips = [
    {
      title: 'Kerala Highlights & Backwaters',
      category: 'Backwaters & Spice Ghats',
      days: '5 Days • 4 Nights',
      people: '3 People',
      price: '₹60,000',
      rating: '4.93',
      flagship: true,
      dest: 'Kerala, India',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'South Goa Bohemian Escape',
      category: 'Coastal Romance',
      days: '4 Days • 3 Nights',
      people: '2 People',
      price: '₹42,000',
      rating: '4.88',
      dest: 'South Goa, India',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Royal Rajasthan Heritage Circuit',
      category: 'Culture & Palaces',
      days: '6 Days • 5 Nights',
      people: '4 People',
      price: '₹75,000',
      rating: '4.92',
      dest: 'Jaipur & Udaipur, India',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Tokyo & Kyoto Shinto Odyssey',
      category: 'Urban & Zen High-Speed',
      days: '7 Days • 6 Nights',
      people: '2 People',
      price: '$2,400',
      rating: '4.97',
      dest: 'Tokyo & Kyoto, Japan',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF9', color: '#181E4B', position: 'relative', overflowX: 'hidden' }}>
      
      {/* ─── Soft Decorative Background Glows ─── */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '550px', height: '550px',
        background: 'radial-gradient(circle, rgba(255, 241, 218, 0.7) 0%, rgba(255, 248, 235, 0.2) 60%, transparent 100%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', top: '400px', left: '-100px', width: '450px', height: '450px',
        background: 'radial-gradient(circle, rgba(230, 244, 241, 0.6) 0%, rgba(240, 250, 247, 0.2) 60%, transparent 100%)',
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ─── Top Navigation Bar (Jadoo & Travellian style) ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, width: '100%',
        backgroundColor: 'rgba(255, 253, 249, 0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0EBE1',
        boxShadow: '0 2px 12px rgba(24, 30, 75, 0.04)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '0 24px', height: '80px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Brand Logo */}
          <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '16px',
              background: '#DF6951', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(223, 105, 81, 0.25)', color: '#fff',
            }}>
              <Compass size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', lineHeight: 1 }}>
                <span style={{ fontFamily: "'Volkhov', serif", fontSize: '24px', fontWeight: 700, color: '#181E4B' }}>Voyage</span>
                <span style={{ fontFamily: "'Volkhov', serif", fontSize: '24px', fontWeight: 800, color: '#DF6951' }}>AI</span>
              </div>
              <p style={{ fontSize: '9px', color: '#5E6282', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, margin: 0, marginTop: '2px' }}>
                Luxury Travel Designer
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => {
              const el = document.getElementById('activities-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} style={{
              background: 'transparent', border: 'none', padding: '8px 16px', borderRadius: '20px',
              fontSize: '14px', fontWeight: 500, color: '#181E4B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Compass size={14} color="#DF6951" /> Explore
            </button>

            <button onClick={() => scrollToPlanner()} style={{
              background: 'rgba(223, 105, 81, 0.1)', border: 'none', padding: '8px 16px', borderRadius: '20px',
              fontSize: '14px', fontWeight: 600, color: '#DF6951', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Sparkles size={14} /> AI Trip Planner
            </button>

            <button onClick={() => {
              const el = document.getElementById('destinations-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} style={{
              background: 'transparent', border: 'none', padding: '8px 16px', borderRadius: '20px',
              fontSize: '14px', fontWeight: 500, color: '#181E4B', cursor: 'pointer',
            }}>
              Destinations
            </button>

            <button onClick={() => {
              const el = document.getElementById('how-it-works-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} style={{
              background: 'transparent', border: 'none', padding: '8px 16px', borderRadius: '20px',
              fontSize: '14px', fontWeight: 500, color: '#181E4B', cursor: 'pointer',
            }}>
              How It Works
            </button>

            <button onClick={() => navigate('/login')} style={{
              background: 'transparent', border: 'none', padding: '8px 16px', borderRadius: '20px',
              fontSize: '14px', fontWeight: 600, color: '#181E4B', cursor: 'pointer',
            }}>
              Sign In
            </button>

            {/* Golden Amber CTA button */}
            <button onClick={() => scrollToPlanner()} style={{
              padding: '12px 26px', borderRadius: '14px',
              background: '#F1A501', color: '#fff', fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 10px 20px -4px rgba(241, 165, 1, 0.45)',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'transform 0.2s',
            }}>
              <Sparkles size={15} />
              <span>Design My Trip</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ─── HERO SECTION (Matching Image 2) ─── */}
      <section style={{ position: 'relative', paddingTop: '32px', paddingBottom: '48px', zIndex: 10 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{
            display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '48px', alignItems: 'center',
          }}>
            
            {/* Left Hero Content */}
            <div>
              {/* Vibrant Uppercase Subhead Badge */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{
                  fontSize: '13px', fontWeight: 800, letterSpacing: '0.12em',
                  color: '#DF6951', textTransform: 'uppercase',
                }}>
                  BEST DESTINATIONS & BESPOKE AI JOURNEYS
                </span>
              </div>

              {/* Master Headline with Brush Underline */}
              <h1 style={{
                fontFamily: "'Volkhov', Georgia, serif", fontSize: '56px', fontWeight: 700,
                color: '#181E4B', lineHeight: '1.15', margin: 0, letterSpacing: '-0.02em',
              }}>
                Travel, enjoy <br />
                and <span className="brush-underline">live a new</span> <br />
                and full life.
              </h1>

              {/* Crisp Description */}
              <p style={{
                fontSize: '16px', color: '#5E6282', marginTop: '20px', marginBottom: '28px',
                lineHeight: '1.6', maxWidth: '520px',
              }}>
                Smart itinerary design paired to your dream vibe with verified routes, real-time fares, and protected contingencies.
              </p>

              {/* CTAs: Golden Amber Button + Coral Play Demo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <button onClick={() => scrollToPlanner()} style={{
                  padding: '16px 36px', borderRadius: '16px',
                  background: '#F1A501', color: '#fff', fontSize: '15px', fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 12px 28px -6px rgba(241, 165, 1, 0.45)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <Sparkles size={16} />
                  <span>Design My Trip</span>
                </button>

                <div onClick={() => navigate('/trip/trip-kerala-flagship')} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                  padding: '8px 16px', borderRadius: '40px',
                  transition: 'background 0.2s',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: '#DF6951', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(223, 105, 81, 0.35)',
                  }}>
                    <Play size={18} fill="#fff" style={{ transform: 'translateX(2px)' }} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#181E4B' }}>
                      Play Flagship Demo
                    </span>
                    <span style={{ fontSize: '12px', color: '#5E6282' }}>
                      5-Day Kerala Tour
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Inspiration Pills */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                marginTop: '32px', fontSize: '12px',
              }}>
                <span style={{ color: '#5E6282', fontWeight: 600, marginRight: '4px' }}>Trending:</span>
                {[
                  { label: 'Kerala Backwaters', dest: 'Kerala, India' },
                  { label: 'South Goa Beaches', dest: 'South Goa, India' },
                  { label: 'Royal Jaipur Heritage', dest: 'Jaipur & Udaipur, India' },
                  { label: 'Munnar Hills & Tea Ghats', dest: 'Munnar, Kerala, India' },
                ].map((item, idx) => (
                  <button key={idx} onClick={() => scrollToPlanner(item.dest)} style={{
                    background: '#fff', border: '1px solid #EBE6DC', borderRadius: '20px',
                    padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: '#181E4B',
                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(24, 30, 75, 0.04)',
                  }}>
                    {item.label}
                  </button>
                ))}
              </div>

            </div>

            {/* Right: Dynamic Travel Collage (Matching Image 2) */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative', maxWidth: '440px', margin: '0 auto' }}>
                
                {/* Background Decorative Blob */}
                <div style={{
                  position: 'absolute', inset: '-12px',
                  background: 'linear-gradient(135deg, #FFF1DA, #FFE7DE)',
                  borderRadius: '48px', transform: 'rotate(-2deg)', zIndex: 0,
                }} />

                {/* Main Hero Card with Asymmetric Curves */}
                <div style={{
                  position: 'relative', borderRadius: '40px', overflow: 'hidden',
                  boxShadow: '0 24px 60px rgba(24, 30, 75, 0.14)',
                  border: '4px solid #fff', background: '#fff', zIndex: 1,
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=85"
                    alt="Kerala Houseboat on Backwaters"
                    style={{ width: '100%', height: '460px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 40%, rgba(24, 30, 75, 0.8) 100%)',
                  }} />

                  {/* Overlay Destination Badge */}
                  <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', color: '#fff' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      background: '#DF6951', color: '#fff', display: 'inline-block', marginBottom: '8px',
                    }}>
                      Flagship Itinerary
                    </span>
                    <h3 style={{
                      fontFamily: "'Volkhov', serif", fontSize: '22px', fontWeight: 700,
                      color: '#fff', margin: 0, lineHeight: 1.2,
                    }}>
                      Kerala Backwaters & Tea Ghats
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', margin: '4px 0 0' }}>
                      ₹60,000 Total • 3 Travelers • 5 Days
                    </p>
                  </div>
                </div>

                {/* Floating Card 1: Flight / Route Badge (Top-Right) */}
                <div style={{
                  position: 'absolute', top: '-16px', right: '-20px',
                  background: '#fff', padding: '12px 18px', borderRadius: '18px',
                  boxShadow: '0 16px 36px rgba(24, 30, 75, 0.12)', border: '1px solid #F0EBE1',
                  display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2,
                  animation: 'float 4s ease-in-out infinite',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '12px',
                    background: '#FFF2ED', color: '#DF6951',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Plane size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#181E4B' }}>HYD → COK Flight</div>
                    <div style={{ fontSize: '11px', color: '#5E6282' }}>09:15 AM • On-Time Transit</div>
                  </div>
                </div>

                {/* Floating Card 2: Rating Pill (Bottom-Left) */}
                <div style={{
                  position: 'absolute', bottom: '-20px', left: '-20px',
                  background: '#fff', padding: '12px 18px', borderRadius: '20px',
                  boxShadow: '0 16px 36px rgba(24, 30, 75, 0.12)', border: '1px solid #F0EBE1',
                  display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2,
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: '#FEF6E6', color: '#F1A501',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Star size={20} fill="#F1A501" />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#181E4B' }}>4.95 / 5 Rating</div>
                    <div style={{ fontSize: '11px', color: '#5E6282' }}>1,280+ Curated Trips</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── FLOATING BOOKING & QUICK-PLANNER WIDGET (Matching Image 2) ─── */}
      <section style={{ position: 'relative', zIndex: 20, maxWidth: '1180px', margin: '-10px auto 48px', padding: '0 24px' }}>
        <div style={{
          background: '#fff', borderRadius: '28px', padding: '20px 28px',
          boxShadow: '0 20px 50px -10px rgba(24, 30, 75, 0.08)',
          border: '1px solid #EFE9DF',
        }}>
          <form onSubmit={handleQuickBarSubmit} style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1.1fr 0.9fr 1.2fr 1fr', gap: '16px', alignItems: 'center',
          }}>
            
            {/* Field 1: Destination */}
            <div style={{
              padding: '10px 14px', borderRadius: '16px', background: '#FAF6ED',
              border: '1px solid #ECE5D8',
            }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#DF6951', letterSpacing: '0.08em', marginBottom: '4px' }}>
                DESTINATION
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#DF6951" />
                <input
                  type="text"
                  value={quickDestination}
                  onChange={(e) => setQuickDestination(e.target.value)}
                  placeholder="Where to? (e.g. Kerala)"
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '14px', fontWeight: 700, color: '#181E4B',
                  }}
                />
              </div>
            </div>

            {/* Field 2: Travel Style */}
            <div style={{
              padding: '10px 14px', borderRadius: '16px', background: '#FAF6ED',
              border: '1px solid #ECE5D8',
            }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#5E6282', letterSpacing: '0.08em', marginBottom: '4px' }}>
                TRAVEL STYLE
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={16} color="#F1A501" />
                <select
                  value={quickStyle}
                  onChange={(e) => setQuickStyle(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '14px', fontWeight: 700, color: '#181E4B', cursor: 'pointer',
                  }}
                >
                  <option value="Relaxed & Nature">Relaxed & Nature</option>
                  <option value="Coastal Romance">Coastal Romance</option>
                  <option value="Culture & Palaces">Culture & Palaces</option>
                  <option value="Adventure & Trails">Adventure & Trails</option>
                  <option value="Spiritual & Heritage">Spiritual & Heritage</option>
                </select>
              </div>
            </div>

            {/* Field 3: Duration */}
            <div style={{
              padding: '10px 14px', borderRadius: '16px', background: '#FAF6ED',
              border: '1px solid #ECE5D8',
            }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#5E6282', letterSpacing: '0.08em', marginBottom: '4px' }}>
                DURATION
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="#14B8A6" />
                <select
                  value={quickDuration}
                  onChange={(e) => setQuickDuration(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '14px', fontWeight: 700, color: '#181E4B', cursor: 'pointer',
                  }}
                >
                  <option value="3 Days">3 Days</option>
                  <option value="4 Days">4 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="10 Days">10 Days</option>
                </select>
              </div>
            </div>

            {/* Field 4: Party & Budget */}
            <div style={{
              padding: '10px 14px', borderRadius: '16px', background: '#FAF6ED',
              border: '1px solid #ECE5D8',
            }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#5E6282', letterSpacing: '0.08em', marginBottom: '4px' }}>
                PARTY & BUDGET
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#DF6951" />
                <select
                  value={quickParty}
                  onChange={(e) => setQuickParty(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    fontSize: '14px', fontWeight: 700, color: '#181E4B', cursor: 'pointer',
                  }}
                >
                  <option value="1 Solo">1 Solo Traveler</option>
                  <option value="2 People (Couple)">2 People (Couple)</option>
                  <option value="3 People (Group)">3 People (Group)</option>
                  <option value="4 People (Family)">4 People (Family)</option>
                </select>
              </div>
            </div>

            {/* Action CTA: Terracotta Coral Button */}
            <div>
              <button
                type="submit"
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: '18px',
                  background: '#DF6951', color: '#fff', fontSize: '14px', fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 10px 24px -4px rgba(223, 105, 81, 0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <span>Build Journey</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </form>
        </div>
      </section>

      {/* ─── INTERACTIVE 3-STEP MULTI-AGENT PLANNER STUDIO (#planner-section) ─── */}
      <section id="planner-section" style={{
        maxWidth: '1280px', margin: '0 auto 80px', padding: '0 24px', position: 'relative', zIndex: 20,
      }}>
        <div style={{
          background: '#fff', borderRadius: '36px', padding: '40px',
          boxShadow: '0 24px 64px rgba(24, 30, 75, 0.08)',
          border: '1px solid #EFEAE0',
        }}>
          
          {/* Header of the Planner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid #F0ECE4', paddingBottom: '24px', marginBottom: '32px',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#FAF6ED', padding: '4px 12px', borderRadius: '20px',
                border: '1px solid #ECE5D8', fontSize: '11px', fontWeight: 800, color: '#DF6951',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
              }}>
                <Sparkles size={13} /> Bespoke Multi-Agent Travel Studio
              </div>
              <h2 style={{
                fontFamily: "'Volkhov', serif", fontSize: '32px', fontWeight: 700,
                color: '#181E4B', margin: 0,
              }}>
                Bespoke Trip Designer
              </h2>
              <p style={{ fontSize: '13px', color: '#5E6282', margin: '4px 0 0' }}>
                Country-State-City Cascades • Dynamic Family & Friends Party Sizing • Zero-Backtracking Logistics
              </p>
            </div>

            {/* Step Indicators */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#DF6951', marginBottom: '6px' }}>
                Step {currentStep} of {totalSteps}: {
                  currentStep === 1 ? 'Where & When' : currentStep === 2 ? 'Party & Budget' : 'Stays & Transport'
                }
              </div>
              <div style={{
                width: '160px', height: '8px', borderRadius: '999px',
                background: '#EFE9DF', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', background: 'linear-gradient(90deg, #DF6951, #F1A501)',
                  width: `${(currentStep / totalSteps) * 100}%`, transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          </div>

          {/* ─── STEP 1: WHERE & WHEN ─── */}
          {currentStep === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Left: Destination & Origin Selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#DF6951', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    1. Destination Place (Country, State & City)
                  </label>
                  <LocationSelector
                    label="Destination Location"
                    value={destination}
                    onChange={setDestination}
                    placeholder="Select or search destination..."
                  />
                  {/* Quick popular chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {['Kerala, India', 'South Goa, India', 'Jaipur & Udaipur, India', 'Manali, India', 'Tokyo, Japan', 'Swiss Alps', 'Bali'].map(p => (
                      <button key={p} type="button" onClick={() => setDestination(p)} style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                        background: destination === p ? '#DF6951' : '#FAF6ED',
                        color: destination === p ? '#fff' : '#181E4B',
                        border: '1px solid #ECE5D8', cursor: 'pointer',
                      }}>{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#F1A501', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    2. Starting City / Origin
                  </label>
                  <LocationSelector
                    label="Origin Starting City"
                    value={origin}
                    onChange={setOrigin}
                    placeholder="Select or search departure city..."
                  />
                  {/* Quick origin chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {['Hyderabad, Telangana, India', 'Bangalore, Karnataka, India', 'Delhi, India', 'Mumbai, Maharashtra, India', 'Chennai, Tamil Nadu, India'].map(o => (
                      <button key={o} type="button" onClick={() => setOrigin(o)} style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                        background: origin === o ? '#F1A501' : '#FAF6ED',
                        color: origin === o ? '#fff' : '#181E4B',
                        border: '1px solid #ECE5D8', cursor: 'pointer',
                      }}>{o.split(',')[0]}</button>
                    ))}
                  </div>
                </div>

                {/* 3. Must-Visit Places (Mandatory Sights) */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#DF6951', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} color="#DF6951" /> 3. Must-Visit Places (Mandatory Sights)
                    </span>
                    <span style={{ fontSize: '10px', color: '#5E6282', fontWeight: 600, textTransform: 'none' }}>Guaranteed Inclusion</span>
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#FAF6ED', border: '1px solid #ECE5D8',
                    borderRadius: '14px', padding: '12px 14px'
                  }}>
                    <MapPin size={16} color="#DF6951" />
                    <input
                      type="text"
                      value={mandatoryPlaces}
                      onChange={(e) => setMandatoryPlaces(e.target.value)}
                      placeholder="e.g. Tea Museum, Mattupetty Dam, Echo Point, Virupaksha..."
                      style={{
                        flex: 1, border: 'none', background: 'transparent',
                        fontSize: '13px', fontWeight: 600, color: '#181E4B', outline: 'none'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: '#5E6282', margin: '6px 0 0' }}>
                    Separate places with commas. Our itinerary engine guarantees these attractions will be scheduled into your day plans.
                  </p>
                </div>
              </div>

              {/* Right: Duration & Dates (Interactive Calendar Date Range Picker) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#181E4B', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Select Dates & Trip Length
                  </label>
                  <CalendarDatePicker
                    startDate={startDate}
                    endDate={endDate}
                    durationDays={durationDays}
                    onDatesChange={(newStart, newEnd, newDays) => {
                      setStartDate(newStart);
                      setEndDate(newEnd);
                      setDurationDays(newDays);
                    }}
                  />
                </div>

                {/* Special Thursday Train Advisory Card */}
                <div style={{
                  background: '#FFFBEB', borderRadius: '14px', padding: '12px 14px',
                  border: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: '10px'
                }}>
                  <Train size={16} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: '12px' }}>
                    <div style={{ fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Smart Transit Insight: Special Train Runs on Thursdays</span>
                    </div>
                    <p style={{ color: '#78350F', margin: '3px 0 6px', fontSize: '11px', lineHeight: 1.4 }}>
                      Direct Superfast Express runs every Thursday with confirmed berth quotas and 3.5h faster travel. If your schedule is flexible, starting on Thursday offers optimal express connectivity.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(startDate || new Date().toISOString().split('T')[0]);
                        const dayOfWeek = d.getDay();
                        const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
                        d.setDate(d.getDate() + daysUntilThursday);
                        const nextThu = d.toISOString().split('T')[0];
                        const dEnd = new Date(d);
                        dEnd.setDate(d.getDate() + (durationDays - 1));
                        setStartDate(nextThu);
                        setEndDate(dEnd.toISOString().split('T')[0]);
                      }}
                      style={{
                        background: '#D97706', color: '#fff', border: 'none',
                        borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <span>Shift Departure to Thursday</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      width: '100%', padding: '16px', borderRadius: '16px',
                      background: '#DF6951', color: '#fff', fontSize: '15px', fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 8px 24px rgba(223, 105, 81, 0.3)',
                    }}
                  >
                    <span>Continue to Party & Budget</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ─── STEP 2: PARTY & BUDGET ─── */}
          {currentStep === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              {/* Left: Dynamic Party Types */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#DF6951', letterSpacing: '0.08em' }}>
                  Who is Traveling?
                </label>
                
                {/* 4 Party Type Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {(['solo', 'couple', 'friends', 'family'] as PartyType[]).map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPartyType(pt)}
                      style={{
                        padding: '12px 6px', borderRadius: '14px', textTransform: 'capitalize',
                        fontSize: '13px', fontWeight: 700,
                        border: partyType === pt ? '2px solid #DF6951' : '1px solid #EAE4D7',
                        background: partyType === pt ? '#FFF2ED' : '#FAF6ED',
                        color: partyType === pt ? '#DF6951' : '#181E4B',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {pt === 'solo' && <><Users size={14} /> Solo</>}
                        {pt === 'couple' && <><Heart size={14} /> Couple</>}
                        {pt === 'friends' && <><Sparkles size={14} /> Friends</>}
                        {pt === 'family' && <><Users size={14} /> Family</>}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Dynamic Configuration per Party Type */}
                <div style={{
                  background: '#FAF6ED', borderRadius: '20px', padding: '20px',
                  border: '1px solid #ECE5D8',
                }}>
                  {partyType === 'family' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#181E4B', marginBottom: '4px' }}>
                        Family Members Breakdown
                      </div>
                      
                      {/* Adults */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#181E4B' }}>Adults (18+ yrs)</div>
                          <div style={{ fontSize: '11px', color: '#5E6282' }}>Standard seating & activities</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{adults}</span>
                          <button type="button" onClick={() => setAdults(adults + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>+</button>
                        </div>
                      </div>

                      {/* Children */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#181E4B' }}>Children (5-17 yrs)</div>
                          <div style={{ fontSize: '11px', color: '#5E6282' }}>Kid-friendly dining & themes</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{children}</span>
                          <button type="button" onClick={() => setChildren(children + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>+</button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#181E4B' }}>Infants (0-4 yrs)</div>
                          <div style={{ fontSize: '11px', color: '#5E6282' }}>Crib/stroller accessible</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button type="button" onClick={() => setInfants(Math.max(0, infants - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{infants}</span>
                          <button type="button" onClick={() => setInfants(infants + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>+</button>
                        </div>
                      </div>

                      {/* Seniors */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#181E4B' }}>Seniors (60+ yrs)</div>
                          <div style={{ fontSize: '11px', color: '#5E6282' }}>Elevator rooms & gentle pacing</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button type="button" onClick={() => setSeniors(Math.max(0, seniors - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{seniors}</span>
                          <button type="button" onClick={() => setSeniors(seniors + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>+</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {partyType === 'friends' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#181E4B' }}>Number of Friends</div>
                          <div style={{ fontSize: '11px', color: '#5E6282' }}>Group ticket & villa planning</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button type="button" onClick={() => setFriendsCount(Math.max(2, friendsCount - 1))} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>-</button>
                          <span style={{ fontSize: '14px', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>{friendsCount}</span>
                          <button type="button" onClick={() => setFriendsCount(friendsCount + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #D5CEBF', cursor: 'pointer', fontWeight: 700 }}>+</button>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#181E4B', marginBottom: '8px' }}>Trip Vibe</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {['Chill Reunion', 'Adventure Squad', 'Nightlife & Social', 'Road Trip Crew', 'Food Crawlers'].map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setFriendsVibe(v)}
                              style={{
                                padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                background: friendsVibe === v ? '#DF6951' : '#fff',
                                color: friendsVibe === v ? '#fff' : '#181E4B',
                                border: '1px solid #D5CEBF', cursor: 'pointer',
                              }}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {partyType === 'couple' && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#181E4B', marginBottom: '8px' }}>Occasion</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {['Romantic Getaway', 'Honeymoon', 'Anniversary', 'Weekend Escape'].map(occ => (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => setCoupleOccasion(occ)}
                            style={{
                              padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                              background: coupleOccasion === occ ? '#DF6951' : '#fff',
                              color: coupleOccasion === occ ? '#fff' : '#181E4B',
                              border: '1px solid #D5CEBF', cursor: 'pointer',
                            }}
                          >{occ}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {partyType === 'solo' && (
                    <div style={{ fontSize: '12px', color: '#5E6282', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={13} color="#DF6951" /> Solo itinerary optimized for personal safety, boutique stays, and self-guided flexible pacing.
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Budget Slider & Travel Styles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#DF6951', letterSpacing: '0.08em' }}>
                      Total Budget ({currency})
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['INR', 'USD', 'EUR'] as CurrencyType[]).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          style={{
                            padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                            background: currency === c ? '#181E4B' : '#FAF6ED',
                            color: currency === c ? '#fff' : '#5E6282',
                            border: '1px solid #ECE5D8', cursor: 'pointer',
                          }}
                        >{c}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '28px', fontWeight: 800, color: '#181E4B', fontFamily: "'Volkhov', serif",
                    marginBottom: '10px',
                  }}>
                    {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '€'}{totalBudget.toLocaleString()}
                  </div>

                  <input
                    type="range"
                    min="15000"
                    max="300000"
                    step="5000"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#DF6951', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5E6282', marginTop: '4px' }}>
                    <span>Budget (₹15k)</span>
                    <span>Moderate (₹60k)</span>
                    <span>Luxury (₹3L+)</span>
                  </div>
                </div>

                {/* Travel Vibes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#181E4B', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Travel Styles & Interests
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(['relaxed', 'nature', 'cultural', 'food-focused', 'adventure', 'spiritual'] as TravelStyle[]).map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        style={{
                          padding: '8px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 600,
                          textTransform: 'capitalize',
                          background: travelStyles.includes(style) ? '#181E4B' : '#FAF6ED',
                          color: travelStyles.includes(style) ? '#fff' : '#181E4B',
                          border: '1px solid #ECE5D8', cursor: 'pointer',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {style === 'relaxed' && <><Compass size={13} /> Relaxed</>}
                          {style === 'nature' && <><Trees size={13} /> Nature</>}
                          {style === 'cultural' && <><Landmark size={13} /> Cultural</>}
                          {style === 'food-focused' && <><Utensils size={13} /> Foodie</>}
                          {style === 'adventure' && <><Mountain size={13} /> Adventure</>}
                          {style === 'spiritual' && <><Star size={13} /> Spiritual</>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      padding: '16px 24px', borderRadius: '16px', background: '#FAF6ED',
                      border: '1px solid #ECE5D8', color: '#181E4B', fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    style={{
                      flex: 1, padding: '16px', borderRadius: '16px', background: '#DF6951',
                      color: '#fff', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}
                  >
                    <span>Continue to Stays & Transport</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ─── STEP 3: STAYS & PREFERENCES ─── */}
          {currentStep === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#DF6951', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Accommodation Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {(['hotel', 'resort', 'homestay'] as AccommodationType[]).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStayType(st)}
                        style={{
                          padding: '14px', borderRadius: '16px', textTransform: 'capitalize',
                          fontWeight: 700, fontSize: '13px',
                          border: stayType === st ? '2px solid #DF6951' : '1px solid #EAE4D7',
                          background: stayType === st ? '#FFF2ED' : '#FAF6ED',
                          color: stayType === st ? '#DF6951' : '#181E4B',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {st === 'hotel' && <><Bed size={15} /> Hotel</>}
                          {st === 'resort' && <><Compass size={15} /> Resort</>}
                          {st === 'homestay' && <><MapPin size={15} /> Homestay</>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#DF6951', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Primary Transport Preference
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {(['train', 'flight', 'rental'] as TransitPreference[]).map(tp => (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setTransitPref(tp)}
                        style={{
                          padding: '14px', borderRadius: '16px', textTransform: 'capitalize',
                          fontWeight: 700, fontSize: '13px',
                          border: transitPref === tp ? '2px solid #DF6951' : '1px solid #EAE4D7',
                          background: transitPref === tp ? '#FFF2ED' : '#FAF6ED',
                          color: transitPref === tp ? '#DF6951' : '#181E4B',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {tp === 'train' && <><Train size={15} /> Train</>}
                          {tp === 'flight' && <><Plane size={15} /> Flight</>}
                          {tp === 'rental' && <><Car size={15} /> Road / Cab</>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#181E4B', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Special Wishes or Constraints
                  </label>
                  <textarea
                    rows={3}
                    value={specialWishes}
                    onChange={(e) => setSpecialWishes(e.target.value)}
                    placeholder="e.g. Vegetarian food preferences, morning temple visits, balcony view..."
                    style={{
                      width: '100%', padding: '14px', borderRadius: '16px',
                      background: '#FAF6ED', border: '1px solid #ECE5D8',
                      fontSize: '13px', color: '#181E4B', outline: 'none', resize: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Right: Summary & Action */}
              <div style={{
                background: '#FAF6ED', borderRadius: '24px', padding: '24px',
                border: '1px solid #ECE5D8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#181E4B', margin: '0 0 16px' }}>
                    Journey Blueprint Review
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5E6282' }}>Destination:</span>
                      <span style={{ fontWeight: 700, color: '#181E4B' }}>{destination}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5E6282' }}>Origin:</span>
                      <span style={{ fontWeight: 700, color: '#181E4B' }}>{origin}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5E6282' }}>Dates & Duration:</span>
                      <span style={{ fontWeight: 700, color: '#181E4B' }}>{durationDays} Days (From {startDate})</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5E6282' }}>Party Size:</span>
                      <span style={{ fontWeight: 700, color: '#DF6951' }}>{getTravelersSummaryText()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5E6282' }}>Budget Target:</span>
                      <span style={{ fontWeight: 800, color: '#14B8A6' }}>₹{totalBudget.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#5E6282' }}>Transport & Stay:</span>
                      <span style={{ fontWeight: 700, color: '#181E4B', textTransform: 'capitalize' }}>{transitPref} + {stayType}</span>
                    </div>
                    {mandatoryPlaces.trim() && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ color: '#5E6282' }}>Must-Visit Sights:</span>
                        <span style={{ fontWeight: 700, color: '#DF6951', textAlign: 'right', maxWidth: '200px' }}>{mandatoryPlaces}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    style={{
                      width: '100%', padding: '18px', borderRadius: '18px',
                      background: 'linear-gradient(135deg, #DF6951, #F1A501)',
                      color: '#fff', fontSize: '16px', fontWeight: 800,
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 12px 32px rgba(223, 105, 81, 0.4)',
                    }}
                  >
                    <Sparkles size={18} />
                    <span>Generate Bespoke Travel Blueprint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      width: '100%', marginTop: '8px', padding: '10px', borderRadius: '12px',
                      background: 'transparent', border: 'none', color: '#5E6282',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Edit Party or Budget
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ─── AGENT VISUALIZER OVERLAY (While Generating) ─── */}
      {isGenerating && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(24, 30, 75, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{ maxWidth: '640px', width: '100%' }}>
            <AgentVisualizer
              events={agentEvents}
              isRunning={isGenerating}
              destination={destination}
              origin={origin}
            />
          </div>
        </div>
      )}

      {/* ─── SECTION: CURATED MOMENTS / SPEND YOUR VACATION (Matching Image 2) ─── */}
      <section id="activities-section" style={{ padding: '48px 0', position: 'relative' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', color: '#DF6951', textTransform: 'uppercase' }}>
                CURATED MOMENTS
              </span>
              <h2 style={{
                fontFamily: "'Volkhov', serif", fontSize: '36px', fontWeight: 700,
                color: '#181E4B', margin: '4px 0 0',
              }}>
                Spend your vacation with our activities
              </h2>
            </div>
            <div onClick={() => scrollToPlanner()} style={{
              fontSize: '13px', fontWeight: 700, color: '#DF6951', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span>Explore all plans</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* 4 Custom Curved Activity Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {activityPills.map((act, i) => (
              <div
                key={i}
                onClick={() => scrollToPlanner(act.dest)}
                style={{
                  background: '#fff', borderRadius: '28px', borderTopRightRadius: '48px',
                  padding: '14px', border: '1px solid #EFEAE0',
                  boxShadow: '0 4px 16px rgba(24, 30, 75, 0.04)',
                  cursor: 'pointer', transition: 'transform 0.3s',
                }}
              >
                <div style={{
                  position: 'relative', height: '180px', width: '100%',
                  borderRadius: '20px', borderTopRightRadius: '36px', overflow: 'hidden', marginBottom: '14px',
                }}>
                  <img
                    src={act.image}
                    alt={act.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                    background: 'rgba(255, 255, 255, 0.9)', color: '#181E4B',
                  }}>
                    {act.tag}
                  </span>
                </div>
                <div style={{ padding: '0 6px 8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#181E4B', margin: 0 }}>
                    {act.name}
                  </h3>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
                    color: '#5E6282', marginTop: '6px', fontWeight: 500,
                  }}>
                    <Users size={13} color="#DF6951" />
                    <span>{act.people}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── SECTION: TOP SELLING / READY ITINERARIES (Matching Image 2) ─── */}
      <section id="destinations-section" style={{
        padding: '64px 0', background: '#FAF7F0', borderTop: '1px solid #ECE5D8', borderBottom: '1px solid #ECE5D8',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', color: '#DF6951', textTransform: 'uppercase' }}>
              TOP SELLING
            </span>
            <h2 style={{
              fontFamily: "'Volkhov', serif", fontSize: '36px', fontWeight: 700,
              color: '#181E4B', margin: '6px 0 10px',
            }}>
              Top Destinations & Ready Itineraries
            </h2>
            <p style={{ fontSize: '14px', color: '#5E6282', margin: 0 }}>
              Fully mapped AI-verified routes with zero-backtracking curves and budget cushions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {popularTrips.map((trip, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff', borderRadius: '28px', border: '1px solid #ECE5D8',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  boxShadow: '0 6px 20px rgba(24, 30, 75, 0.05)',
                  transition: 'transform 0.3s',
                }}
              >
                <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={trip.image}
                    alt={trip.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 50%, rgba(24, 30, 75, 0.7) 100%)',
                  }} />

                  {trip.flagship && (
                    <span style={{
                      position: 'absolute', top: '12px', left: '12px',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 800,
                      background: '#DF6951', color: '#fff',
                    }}>
                      Flagship Demo
                    </span>
                  )}

                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'rgba(255, 255, 255, 0.92)', padding: '3px 8px', borderRadius: '14px',
                    fontSize: '11px', fontWeight: 800, color: '#181E4B',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <Star size={12} fill="#F1A501" color="#F1A501" />
                    <span>{trip.rating}</span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', color: '#fff' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', display: 'block' }}>{trip.category}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{trip.days}</span>
                  </div>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#181E4B', lineHeight: 1.3, margin: 0 }}>
                      {trip.title}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px' }}>
                      <span style={{ color: '#5E6282' }}>{trip.people}</span>
                      <span style={{ color: '#DF6951', fontWeight: 800, fontSize: '14px' }}>{trip.price}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (trip.flagship) {
                        navigate('/trip/trip-kerala-flagship');
                      } else {
                        scrollToPlanner(trip.dest);
                      }
                    }}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '12px',
                      background: '#FAF6ED', color: '#181E4B', fontSize: '12px', fontWeight: 700,
                      border: '1px solid #ECE5D8', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'background 0.2s',
                    }}
                  >
                    <span>Explore Itinerary</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── SECTION: EASY AND FAST / 3 EASY STEPS (Matching Image 2) ─── */}
      <section id="how-it-works-section" style={{ padding: '80px 0', position: 'relative' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            
            {/* Left Steps */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', color: '#DF6951', textTransform: 'uppercase' }}>
                EASY AND FAST
              </span>
              <h2 style={{
                fontFamily: "'Volkhov', serif", fontSize: '38px', fontWeight: 700,
                color: '#181E4B', margin: '8px 0 32px', lineHeight: 1.2,
              }}>
                Book Your Next Trip in 3 Easy Steps
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: '#F1A501', color: '#fff', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(241, 165, 1, 0.3)',
                  }}>
                    <Compass size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#181E4B', margin: 0 }}>
                      1. Choose Destination & Vibe
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5E6282', margin: '4px 0 0', lineHeight: 1.5 }}>
                      Pick where you want to go, set your budget limit, and select your party size in 30 seconds.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: '#DF6951', color: '#fff', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(223, 105, 81, 0.3)',
                  }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#181E4B', margin: 0 }}>
                      2. Real-Time Precision Scheduling
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5E6282', margin: '4px 0 0', lineHeight: 1.5 }}>
                      Our engine divides transit hours, reserve cushions and avoids backtracking with built-in 8% buffer.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    background: '#14B8A6', color: '#fff', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(20, 184, 166, 0.3)',
                  }}>
                    <Plane size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#181E4B', margin: 0 }}>
                      3. Take It Live on the Road
                    </h3>
                    <p style={{ fontSize: '13px', color: '#5E6282', margin: '4px 0 0', lineHeight: 1.5 }}>
                      Access interactive route maps, weather forecasts, packing checklists, and 1-tap Google Maps directions.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Card Mockup (Matching Image 2) */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                position: 'relative', width: '100%', maxWidth: '380px',
                background: '#fff', borderRadius: '32px', padding: '20px',
                boxShadow: '0 24px 60px rgba(24, 30, 75, 0.1)', border: '1px solid #ECE5D8',
              }}>
                <div style={{
                  position: 'relative', height: '180px', borderRadius: '22px',
                  overflow: 'hidden', marginBottom: '16px',
                }}>
                  <img
                    src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80"
                    alt="Kerala Backwaters"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Heart size={16} color="#DF6951" fill="#DF6951" />
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#181E4B', margin: 0 }}>
                    Trip to Kerala Backwaters
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5E6282', margin: '4px 0 12px' }}>
                    14-19 Dec • by VoyageAI Concierge
                  </p>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: '#5E6282' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Leaf size={12} color="#059669" /> Nature</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Compass size={12} color="#0891B2" /> Boating</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Trees size={12} color="#D97706" /> Tea Gardens</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#181E4B' }}>24 spots</span>
                  </div>

                  <div style={{
                    marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F0ECE4',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ fontSize: '12px', color: '#5E6282', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} color="#DF6951" />
                      <span>3 people going</span>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, color: '#14B8A6',
                      background: 'rgba(20, 184, 166, 0.1)', padding: '4px 10px', borderRadius: '12px',
                    }}>
                      ₹57,110 / ₹60,000 Optimized
                    </span>
                  </div>
                </div>

                {/* Floating Status Pill */}
                <div style={{
                  position: 'absolute', bottom: '-20px', right: '-20px',
                  background: '#fff', padding: '12px 18px', borderRadius: '18px',
                  boxShadow: '0 12px 30px rgba(24, 30, 75, 0.12)', border: '1px solid #ECE5D8',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: '#E6F4F1', color: '#14B8A6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px',
                  }}>
                    <Check size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#5E6282', textTransform: 'uppercase' }}>STATUS</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#181E4B' }}>All Routes Optimized</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION: NATURAL LANGUAGE INPUT (Matching Image 2) ─── */}
      <section style={{ padding: '60px 0', background: '#FAF7F0', borderTop: '1px solid #ECE5D8' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em', color: '#DF6951', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            PREFER FREE TYPING?
          </span>
          <h2 style={{
            fontFamily: "'Volkhov', serif", fontSize: '32px', fontWeight: 700,
            color: '#181E4B', margin: '0 0 24px',
          }}>
            Describe Your Trip in Plain English
          </h2>

          <form onSubmit={handleNaturalPlan} style={{
            background: '#fff', padding: '12px 16px', borderRadius: '24px',
            border: '1px solid #ECE5D8', boxShadow: '0 10px 30px rgba(24, 30, 75, 0.05)',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <Sparkles size={20} color="#DF6951" style={{ flexShrink: 0, marginLeft: '8px' }} />
            <input
              type="text"
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              placeholder="e.g. Plan a 5-day Kerala trip for 3 people with ₹60k budget..."
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                fontSize: '14px', fontWeight: 500, color: '#181E4B',
              }}
            />
            <button
              type="submit"
              disabled={isParsingNL}
              style={{
                padding: '12px 28px', borderRadius: '16px', background: '#DF6951', color: '#fff',
                fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 6px 16px rgba(223, 105, 81, 0.3)',
              }}
            >
              <span>{isParsingNL ? 'Parsing...' : 'Auto Plan'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

        </div>
      </section>

      {/* ─── SECTION: BOTTOM CTA CALLOUT (Matching Image 2) ─── */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #DF6951 0%, #FA7436 50%, #F1A501 100%)',
            borderRadius: '36px', padding: '56px 40px', textAlign: 'center', color: '#fff',
            boxShadow: '0 24px 48px -12px rgba(223, 105, 81, 0.35)', position: 'relative', overflow: 'hidden',
          }}>
            
            <h2 style={{
              fontFamily: "'Volkhov', serif", fontSize: '40px', fontWeight: 700,
              margin: '0 auto 12px', maxWidth: '640px', lineHeight: 1.2,
            }}>
              Ready to experience travel planning without the stress?
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', margin: '0 auto 32px', maxWidth: '520px' }}>
              Join thousands of travelers who let VoyageAI design, sequence, and guard their holidays.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => scrollToPlanner()}
                style={{
                  padding: '16px 36px', borderRadius: '18px', background: '#fff', color: '#181E4B',
                  fontSize: '15px', fontWeight: 800, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Sparkles size={16} color="#DF6951" />
                <span>Start Free Planner</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/trip/trip-kerala-flagship')}
                style={{
                  padding: '16px 28px', borderRadius: '18px',
                  background: 'rgba(255, 255, 255, 0.18)', border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Inspect Kerala Flagship Plan
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FOOTER (Matching Image 2) ─── */}
      <footer style={{
        background: '#FAF7F0', borderTop: '1px solid #ECE5D8', padding: '64px 0 32px', color: '#5E6282',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: '48px',
            borderBottom: '1px solid #ECE5D8', paddingBottom: '48px',
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '14px', background: '#DF6951',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Compass size={20} />
                </div>
                <span style={{ fontFamily: "'Volkhov', serif", fontSize: '22px', fontWeight: 700, color: '#181E4B' }}>
                  Voyage<span style={{ color: '#DF6951' }}>AI</span>
                </span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.6, maxWidth: '340px', margin: '0 0 16px' }}>
                The intelligent luxury travel designer. Creating bespoke, budget-protected, realistic holiday itineraries with real-time recalculation.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(223, 105, 81, 0.1)', color: '#DF6951', padding: '6px 12px',
                borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              }}>
                <ShieldCheck size={14} />
                <span>Multi-Agent Autonomous Service Active</span>
              </div>
            </div>

            {/* Destinations */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#181E4B', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                DESTINATIONS
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontWeight: 500 }}>
                <li onClick={() => scrollToPlanner('Kerala, India')} style={{ cursor: 'pointer' }}>Kerala, India</li>
                <li onClick={() => scrollToPlanner('South Goa, India')} style={{ cursor: 'pointer' }}>South Goa</li>
                <li onClick={() => scrollToPlanner('Jaipur & Rajasthan, India')} style={{ cursor: 'pointer' }}>Jaipur & Rajasthan</li>
                <li onClick={() => scrollToPlanner('Tokyo & Kyoto, Japan')} style={{ cursor: 'pointer' }}>Tokyo & Kyoto</li>
                <li onClick={() => scrollToPlanner('Swiss Alps')} style={{ cursor: 'pointer' }}>Swiss Alps</li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#181E4B', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                AI PLATFORM
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontWeight: 500 }}>
                <li onClick={() => scrollToPlanner()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#DF6951' }}>
                  <Sparkles size={12} /> Plan My Trip
                </li>
                <li onClick={() => navigate('/trip/trip-kerala-flagship')} style={{ cursor: 'pointer' }}>Interactive Demo Trip</li>
                <li style={{ cursor: 'pointer' }}>Dependency Engine</li>
                <li style={{ cursor: 'pointer' }}>Saved Itineraries</li>
                <li style={{ cursor: 'pointer' }}>System Telemetry</li>
              </ul>
            </div>

            {/* Architecture */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#181E4B', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                ARCHITECTURE
              </h4>
              <p style={{ fontSize: '12px', lineHeight: 1.6, margin: '0 0 16px' }}>
                Every route calculates realistic transit times, buffer periods, check-in deadlines, and itemized 8% budget cushions.
              </p>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#181E4B' }}>
                INR (₹) / USD ($) / EUR (€) Multi-Currency
              </div>
            </div>

          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: '32px', fontSize: '12px',
          }}>
            <p style={{ margin: 0 }}>© {new Date().getFullYear()} VoyageAI Technologies Inc. Engineered for discerning travelers.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>API Status: All 7 Agents Online</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
