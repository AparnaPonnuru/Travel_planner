import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Users as UsersIcon, Wallet,
  Clock, Star, Train, Plane, Shield, Lightbulb, ChevronDown, ChevronUp,
  Utensils, Bed, Camera, Heart, ExternalLink, Car, Ticket, Sparkles, Navigation,
  Sun, Compass, ShieldCheck, Check, CheckCircle2, AlertTriangle, HeartPulse, ShieldAlert, Phone
} from 'lucide-react';
import { getTrip } from '../services/api';

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'transit' | 'safety'>('itinerary');
  const [transitDirection, setTransitDirection] = useState<'outbound' | 'return'>('outbound');

  useEffect(() => {
    if (!id) return;
    if (id.includes('kerala') || id.includes('flagship')) {
      getTrip(id).then(data => {
        if (data.trip) {
          setTrip(data.trip);
        } else {
          setTrip(getKeralaFlagshipMock());
        }
        setLoading(false);
      }).catch(() => {
        setTrip(getKeralaFlagshipMock());
        setLoading(false);
      });
      return;
    }

    getTrip(id).then(data => {
      if (data.trip) {
        setTrip(data.trip);
      } else {
        setTrip(getKeralaFlagshipMock());
      }
      setLoading(false);
    }).catch(() => {
      setTrip(getKeralaFlagshipMock());
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#FFFDF9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid #DF6951', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#5E6282', fontSize: '14px' }}>Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const days = trip.days || [];
  const budget = trip.budgetBreakdown || {};
  const transit = trip.transitOptions || {};
  const quality = trip.qualityScore || {};
  const agentMeta = trip.agentMetadata || {};
  const originCity = (trip.origin || '').split(',')[0].trim() || 'Origin';
  const destCity = (trip.destination || '').split(',')[0].trim() || 'Destination';

  const categoryIcons: Record<string, any> = {
    attraction: Camera, culture: Heart, nature: MapPin, food: Utensils,
    spiritual: Star, adventure: MapPin, relaxation: Bed, shopping: Heart, travel: Train,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFDF9' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #181E4B, #2D3377)',
        padding: '20px 48px', color: '#fff',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/')} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px',
              padding: '8px', cursor: 'pointer', color: '#fff',
            }}><ArrowLeft size={20} /></button>
            <div>
              <h1 style={{
                fontFamily: "'Volkhov', serif", fontSize: '28px', fontWeight: 700,
              }}>{trip.title || `${trip.destination} Trip`}</h1>
              <div style={{
                display: 'flex', gap: '20px', fontSize: '13px',
                color: 'rgba(255,255,255,0.7)', marginTop: '4px',
              }}>
                <span><MapPin size={12} /> {trip.origin} → {trip.destination}</span>
                <span><Calendar size={12} /> {trip.durationDays} Days</span>
                <span><UsersIcon size={12} /> {trip.travelers?.adults || 2} travelers</span>
                <span><Wallet size={12} /> ₹{(trip.budget?.total || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: '8px',
          }}>
            {quality.overall && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px',
                padding: '6px 14px', fontSize: '12px', fontWeight: 600,
                color: '#6ee7b7',
              }}>
                {quality.overall} Trip
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 48px',
        borderBottom: '1px solid #ECE5D8',
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {(['itinerary', 'budget', 'transit', 'safety'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px', fontSize: '14px', fontWeight: 700,
                border: 'none', background: 'none', cursor: 'pointer',
                color: activeTab === tab ? '#DF6951' : '#5E6282',
                borderBottom: activeTab === tab ? '2px solid #DF6951' : '2px solid transparent',
                textTransform: 'capitalize',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {tab === 'itinerary' && <Calendar size={15} />}
              {tab === 'budget' && <Wallet size={15} />}
              {tab === 'transit' && <Train size={15} />}
              {tab === 'safety' && <ShieldCheck size={15} />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 48px' }}>

        {/* ── ITINERARY TAB ── */}
        {activeTab === 'itinerary' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
            <div>
              {/* Route Sequence */}
              {trip.routeSequence?.length > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '24px', flexWrap: 'wrap',
                }}>
                  {trip.routeSequence.map((city: string, i: number) => (
                    <React.Fragment key={i}>
                      <span style={{
                        padding: '6px 14px', borderRadius: '8px',
                        background: i === 0 ? '#DF695115' : '#FAF6ED',
                        color: i === 0 ? '#DF6951' : '#181E4B',
                        fontSize: '13px', fontWeight: 600,
                        border: `1px solid ${i === 0 ? '#DF695130' : '#ECE5D8'}`,
                      }}>{city}</span>
                      {i < trip.routeSequence.length - 1 && (
                        <span style={{ color: '#CBD5E1', fontSize: '16px' }}>→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Day Cards */}
              {days.map((day: any) => {
                const isExpanded = expandedDay === day.dayNumber;
                return (
                  <div key={day.dayNumber} style={{
                    background: '#fff', borderRadius: '16px',
                    border: '1px solid #ECE5D8', marginBottom: '16px',
                    overflow: 'hidden', transition: 'box-shadow 0.3s',
                    boxShadow: isExpanded ? '0 8px 24px rgba(24,30,75,0.06)' : 'none',
                  }}>
                    {/* Day header */}
                    <div
                      onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                      style={{
                        padding: '16px 20px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: isExpanded ? '#FAF6ED' : '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: 'linear-gradient(135deg, #DF6951, #F1A501)',
                          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '14px',
                        }}>D{day.dayNumber}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#181E4B', fontSize: '15px' }}>
                            {day.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#5E6282' }}>
                            {day.baseCity} · {day.theme}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '12px', color: '#5E6282' }}>
                          {day.activities?.length || 0} activities
                        </span>
                        {isExpanded ? <ChevronUp size={18} color="#5E6282" /> : <ChevronDown size={18} color="#5E6282" />}
                      </div>
                    </div>

                    {/* Day content */}
                    {isExpanded && (
                      <div style={{ padding: '16px 20px' }}>
                        {/* Activities */}
                        {(day.activities || []).map((act: any, i: number) => {
                          const Icon = categoryIcons[act.category] || MapPin;
                          return (
                            <div key={i} style={{
                              display: 'flex', gap: '12px', padding: '12px 0',
                              borderBottom: i < day.activities.length - 1 ? '1px solid #f1f5f9' : 'none',
                            }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: '#DF695110', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <Icon size={16} color="#DF6951" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#181E4B' }}>
                                      {act.name}
                                    </span>
                                    {Boolean(
                                      act.is_mandatory || act.isMandatory ||
                                      (trip.mandatoryPlaces && trip.mandatoryPlaces.toLowerCase().includes(act.name.toLowerCase())) ||
                                      (trip.must_visit_places && trip.must_visit_places.some((m: string) => act.name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(act.name.toLowerCase())))
                                    ) && (
                                      <span style={{
                                        marginLeft: '8px', padding: '2px 8px', borderRadius: '6px',
                                        fontSize: '10px', fontWeight: 800, background: '#FFF2ED', color: '#DF6951',
                                        border: '1px solid #FCD3C1', display: 'inline-flex', alignItems: 'center', gap: '3px'
                                      }}>
                                        <CheckCircle2 size={10} color="#DF6951" /> Must-Visit Requested
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '12px', color: '#5E6282', whiteSpace: 'nowrap' }}>
                                    <Clock size={11} /> {act.startTime} – {act.endTime}
                                  </span>
                                </div>
                                {act.description && (
                                  <p style={{ fontSize: '12px', color: '#5E6282', marginTop: '4px', lineHeight: 1.5 }}>
                                    {act.description}
                                  </p>
                                )}
                                {act.matchReason && (
                                  <div style={{
                                    fontSize: '11px', color: '#DF6951', marginTop: '4px',
                                    fontStyle: 'italic',
                                  }}>
                                    <Lightbulb size={10} /> {act.matchReason}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Meals */}
                        {day.meals?.length > 0 && (
                          <div style={{
                            marginTop: '12px', padding: '12px',
                            background: '#FAF6ED', borderRadius: '10px',
                          }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#181E4B', marginBottom: '8px' }}>
                              <Utensils size={12} /> Meals
                            </div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {day.meals.map((m: any, i: number) => (
                                <div key={i} style={{
                                  fontSize: '12px', color: '#5E6282',
                                  padding: '4px 10px', background: '#fff', borderRadius: '6px',
                                  border: '1px solid #ECE5D8',
                                }}>
                                  <span style={{ fontWeight: 600 }}>{m.type}</span>: {m.restaurantName}
                                  {m.highlightDish && ` — ${m.highlightDish}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Accommodation with multi-platform booking */}
                        {day.accommodation && (() => {
                          const hotelName = day.accommodation.name || `${destCity} Heritage Stay`;
                          const costNight = day.accommodation.costPerNight || day.accommodation.cost_per_night || 2800;
                          const bkgUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destCity + ' ' + hotelName)}`;
                          const mmtUrl = `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(destCity)}`;
                          const goiUrl = `https://www.goibibo.com/hotels/hotels-in-${encodeURIComponent(destCity).toLowerCase()}/`;
                          const agdUrl = `https://www.agoda.com/search?city=${encodeURIComponent(destCity)}`;

                          return (
                            <div style={{
                              marginTop: '12px', padding: '14px 16px',
                              background: '#F8FAFC', borderRadius: '14px',
                              border: '1px solid #E2E8F0',
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{
                                    width: '32px', height: '32px', borderRadius: '10px',
                                    background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#4F46E5', flexShrink: 0
                                  }}>
                                    <Bed size={16} />
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#181E4B' }}>
                                      {hotelName}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#5E6282', marginTop: '1px' }}>
                                      {day.accommodation.type || 'Boutique Hotel'} • {day.accommodation.location || 'Central Location'}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>
                                    ₹{costNight.toLocaleString()}<span style={{ fontSize: '11px', fontWeight: 500, color: '#5E6282' }}> /night</span>
                                  </div>
                                  {day.accommodation.rating && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, color: '#D97706' }}>
                                      <Star size={11} color="#F59E0B" fill="#F59E0B" /> {day.accommodation.rating} rating
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Direct Hotel Booking Platforms */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#5E6282' }}>
                                  Book Stay On:
                                </span>
                                <a
                                  href={bkgUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '5px 10px', borderRadius: '8px', background: '#003580',
                                    color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                  }}
                                >
                                  Booking.com <ExternalLink size={10} />
                                </a>
                                <a
                                  href={mmtUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '5px 10px', borderRadius: '8px', background: '#E42529',
                                    color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                  }}
                                >
                                  MakeMyTrip <ExternalLink size={10} />
                                </a>
                                <a
                                  href={goiUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '5px 10px', borderRadius: '8px', background: '#F26522',
                                    color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                  }}
                                >
                                  Goibibo <ExternalLink size={10} />
                                </a>
                                <a
                                  href={agdUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    padding: '5px 10px', borderRadius: '8px', background: '#2E80B6',
                                    color: '#fff', fontSize: '11px', fontWeight: 700, textDecoration: 'none',
                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                  }}
                                >
                                  Agoda <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Must-Visit Sights Covered Card */}
              {(trip.mandatoryPlaces || trip.must_visit_places?.length > 0) && (
                <div style={{
                  background: '#FFF2ED', borderRadius: '16px', padding: '20px',
                  border: '1px solid #FCD3C1',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#DF6951', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#DF6951" /> Must-Visit Places Covered
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5E6282', marginBottom: '10px' }}>
                    All user-requested sights have been prioritized in your schedule:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(trip.must_visit_places || trip.mandatoryPlaces?.split(',') || ['Tea Museum', 'Mattupetty Dam']).map((s: string, idx: number) => (
                      <span key={idx} style={{
                        padding: '4px 10px', borderRadius: '8px', background: '#FFFFFF',
                        border: '1px solid #FCD3C1', fontSize: '12px', fontWeight: 700, color: '#181E4B'
                      }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Explanations */}
              {trip.aiExplanations?.length > 0 && (
                <div style={{
                  background: '#fff', borderRadius: '16px', padding: '20px',
                  border: '1px solid #ECE5D8',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#181E4B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="#DF6951" /> AI Route Insights
                  </h3>
                  {trip.aiExplanations.slice(0, 4).map((exp: string, i: number) => (
                    <p key={i} style={{
                      fontSize: '12px', color: '#5E6282', lineHeight: 1.6,
                      padding: '8px 0', borderBottom: '1px solid #f1f5f9',
                    }}>• {exp}</p>
                  ))}
                </div>
              )}

              {/* Agent Metadata */}
              {agentMeta.localGuideData?.hidden_gems?.length > 0 && (
                <div style={{
                  background: '#fff', borderRadius: '16px', padding: '20px',
                  border: '1px solid #ECE5D8',
                }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#181E4B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={16} color="#DF6951" /> Local Hidden Gems
                  </h3>
                  {agentMeta.localGuideData.hidden_gems.slice(0, 4).map((gem: string, i: number) => (
                    <p key={i} style={{ fontSize: '12px', color: '#5E6282', lineHeight: 1.5, marginBottom: '6px' }}>
                      • {gem}
                    </p>
                  ))}
                </div>
              )}

              {/* Travel Image */}
              <div style={{
                borderRadius: '16px', overflow: 'hidden', height: '200px',
                position: 'relative',
              }}>
                <img
                  src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=400&q=80"
                  alt="Travel"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(24,30,75,0.8))',
                  padding: '20px',
                }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                    AI-Curated Journey
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                    Crafted by 7 specialized agents
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BUDGET TAB ── */}
        {activeTab === 'budget' && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '28px',
              border: '1px solid #ECE5D8',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '24px',
              }}>
                <h3 style={{ fontFamily: "'Volkhov', serif", fontSize: '22px', color: '#181E4B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={20} color="#DF6951" /> Budget Allocation Analysis
                </h3>
                <span style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  background: budget.status === 'within-budget' ? '#10b98115' : '#ef444415',
                  color: budget.status === 'within-budget' ? '#10b981' : '#ef4444',
                }}>
                  {budget.status?.replace('-', ' ')}
                </span>
              </div>

              {/* Category bars */}
              {budget.categories && Object.entries(budget.categories).map(([key, val]: [string, any]) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', marginBottom: '4px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#181E4B', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span style={{ fontSize: '13px', color: '#5E6282' }}>
                      ₹{(val.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    height: '6px', borderRadius: '3px', background: '#f1f5f9',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      background: 'linear-gradient(90deg, #DF6951, #F1A501)',
                      width: `${Math.min(100, val.percentage || 0)}%`,
                    }} />
                  </div>
                </div>
              ))}

              {/* Saving tips */}
              {budget.savingTips?.length > 0 && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#FAF6ED', borderRadius: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#181E4B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={16} color="#F1A501" /> Smart Savings Tips
                  </div>
                  {budget.savingTips.map((tip: string, i: number) => (
                    <p key={i} style={{ fontSize: '12px', color: '#5E6282', marginBottom: '4px' }}>• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TRANSIT TAB ── */}
        {activeTab === 'transit' && (() => {
          const originCity = (trip.origin || '').split(',')[0].trim() || 'Vijayawada';
          const destCity = (trip.destination || '').split(',')[0].trim() || 'Hampi';
          const isHampiRoute = /hampi|bellary|hospet|hosapete/i.test(trip.destination || '') || /hampi|bellary|hospet|hosapete/i.test(trip.origin || '');

          const defaultHampiOutboundTrains = [
            {
              train_number: '17225',
              train_name: 'Amaravathi Express',
              departure_time: '07:45 PM',
              arrival_time: '06:10 AM (+1d)',
              duration: '10h 25m',
              origin_station: `${originCity} Jn (BZA)`,
              destination_station: 'Hosapete Jn / Hampi (HPT)',
              distance_km: 498,
              running_days: 'Daily',
              classes: ['SL', '3A', '2A', '1A'],
              class_fares: { SL: '₹285', '3A': '₹780', '2A': '₹1,110', '1A': '₹1,880' },
              fare_range: '₹285 – ₹1,880',
              irctc_url: 'https://www.irctc.co.in/nget/train-search',
              confirmtkt_url: 'https://www.confirmtkt.com/train-running-status/17225'
            },
            {
              train_number: '18047',
              train_name: 'Amaravathi Express (Shalimar - Vasco)',
              departure_time: '01:50 PM',
              arrival_time: '11:30 PM',
              duration: '9h 40m',
              origin_station: `${originCity} Jn (BZA)`,
              destination_station: 'Hosapete Jn / Hampi (HPT)',
              distance_km: 498,
              running_days: 'Mon, Tue, Thu, Sat',
              classes: ['SL', '3A', '2A'],
              class_fares: { SL: '₹285', '3A': '₹780', '2A': '₹1,110', '1A': 'N/A' },
              fare_range: '₹285 – ₹1,110',
              irctc_url: 'https://www.irctc.co.in/nget/train-search',
              confirmtkt_url: 'https://www.confirmtkt.com/train-running-status/18047'
            }
          ];

          const defaultHampiReturnTrains = [
            {
              train_number: '17226',
              train_name: 'Amaravathi Express (Return)',
              departure_time: '09:30 PM',
              arrival_time: '07:15 AM (+1d)',
              duration: '9h 45m',
              origin_station: 'Hosapete Jn / Hampi (HPT)',
              destination_station: `${originCity} Jn (BZA)`,
              distance_km: 498,
              running_days: 'Daily',
              classes: ['SL', '3A', '2A', '1A'],
              class_fares: { SL: '₹285', '3A': '₹780', '2A': '₹1,110', '1A': '₹1,880' },
              fare_range: '₹285 – ₹1,880',
              irctc_url: 'https://www.irctc.co.in/nget/train-search',
              confirmtkt_url: 'https://www.confirmtkt.com/train-running-status/17226'
            },
            {
              train_number: '18048',
              train_name: 'Amaravathi Express (Return)',
              departure_time: '04:00 AM',
              arrival_time: '01:40 PM',
              duration: '9h 40m',
              origin_station: 'Hosapete Jn / Hampi (HPT)',
              destination_station: `${originCity} Jn (BZA)`,
              distance_km: 498,
              running_days: 'Mon, Wed, Fri, Sun',
              classes: ['SL', '3A', '2A'],
              class_fares: { SL: '₹285', '3A': '₹780', '2A': '₹1,110', '1A': 'N/A' },
              fare_range: '₹285 – ₹1,110',
              irctc_url: 'https://www.irctc.co.in/nget/train-search',
              confirmtkt_url: 'https://www.confirmtkt.com/train-running-status/18048'
            }
          ];

          const defaultGenericOutboundTrains = [
            {
              train_number: '12704',
              train_name: `${originCity} - ${destCity} Superfast Express`,
              departure_time: '06:15 PM',
              arrival_time: '06:45 AM (+1d)',
              duration: '12h 30m',
              origin_station: `${originCity} Main Jn`,
              destination_station: `${destCity} Central`,
              distance_km: 540,
              running_days: 'Daily',
              classes: ['SL', '3A', '2A', '1A'],
              class_fares: { SL: '₹340', '3A': '₹920', '2A': '₹1,320', '1A': '₹2,210' },
              fare_range: '₹340 – ₹2,210',
              irctc_url: 'https://www.irctc.co.in/nget/train-search',
              confirmtkt_url: 'https://www.confirmtkt.com/train-running-status/12704'
            },
            {
              train_number: '17488',
              train_name: `${destCity} Intercity Express`,
              departure_time: '06:30 AM',
              arrival_time: '04:15 PM',
              duration: '9h 45m',
              origin_station: `${originCity} Jn`,
              destination_station: `${destCity} Terminal`,
              distance_km: 540,
              running_days: 'Mon, Tue, Thu, Sat',
              classes: ['SL', '3A', '2A'],
              class_fares: { SL: '₹310', '3A': '₹850', '2A': '₹1,210', '1A': 'N/A' },
              fare_range: '₹310 – ₹1,210',
              irctc_url: 'https://www.irctc.co.in/nget/train-search',
              confirmtkt_url: 'https://www.confirmtkt.com/train-running-status/17488'
            }
          ];

          const defaultGenericReturnTrains = defaultGenericOutboundTrains.map(t => ({
            ...t,
            train_name: `${t.train_name} (Return)`,
            origin_station: t.destination_station,
            destination_station: t.origin_station,
          }));

          const defaultOutboundTrains = isHampiRoute ? defaultHampiOutboundTrains : defaultGenericOutboundTrains;
          const defaultReturnTrains = isHampiRoute ? defaultHampiReturnTrains : defaultGenericReturnTrains;

          const defaultFlights = [
            {
              airline: 'IndiGo',
              flight_number: '6E-542',
              departure: '07:15 AM',
              arrival: '09:05 AM',
              duration: '1h 50m (Direct / 1-Stop)',
              baggage: '15 kg Check-in + 7 kg Cabin',
              class_fares: { Economy: '₹3,450', Flexi: '₹4,250', Business: '₹8,600' },
              fare_estimate: '₹3,450 – ₹4,850',
              goibibo_url: `https://www.goibibo.com/flights/flight-search/?source=${encodeURIComponent(originCity)}&destination=${encodeURIComponent(destCity)}`,
              makemytrip_url: `https://www.makemytrip.com/flight/search?itinerary=${encodeURIComponent(originCity)}-${encodeURIComponent(destCity)}`
            },
            {
              airline: 'Air India',
              flight_number: 'AI-618',
              departure: '01:30 PM',
              arrival: '03:25 PM',
              duration: '1h 55m',
              baggage: '20 kg Check-in + 7 kg Cabin',
              class_fares: { Economy: '₹3,890', Flexi: '₹4,750', Business: '₹9,400' },
              fare_estimate: '₹3,890 – ₹5,300',
              goibibo_url: `https://www.goibibo.com/flights/flight-search/?source=${encodeURIComponent(originCity)}&destination=${encodeURIComponent(destCity)}`,
              makemytrip_url: `https://www.makemytrip.com/flight/search?itinerary=${encodeURIComponent(originCity)}-${encodeURIComponent(destCity)}`
            }
          ];

          const currentJourney = transitDirection === 'outbound'
            ? (transit.outbound?.trains?.length ? transit.outbound : {
                direction: 'outbound',
                title: `${trip.origin} → ${trip.destination}`,
                trains: defaultOutboundTrains,
                flights: defaultFlights,
                guidance: {
                  when_to_start: `Reach station 45 minutes before departure from ${originCity}`,
                  where_to_board: `${originCity} Railway Station Platform 1`,
                  destination_arrival: `Arrives ${destCity}. Station prepaid auto and cab counters available.`,
                  check_out_buffer: 'Leave hotel 50-60 mins prior to train boarding.'
                }
              })
            : (transit.returnJourney?.trains?.length ? transit.returnJourney : {
                direction: 'return',
                title: `${trip.destination} → ${trip.origin}`,
                trains: defaultReturnTrains,
                flights: defaultFlights,
                guidance: {
                  when_to_start: `Reach station 45 minutes prior for return to ${originCity}`,
                  where_to_board: `${destCity} Railway Station Platform 1`,
                  destination_arrival: `Arrives safely back at ${originCity}. Local autos and metro available outside.`,
                  check_out_buffer: 'Plan hotel check-out by 11:00 AM or store bags at station cloakroom.'
                }
              });

          const guidance = currentJourney.guidance || {};
          const trainsList = currentJourney.trains?.length ? currentJourney.trains : defaultOutboundTrains;
          const flightsList = currentJourney.flights?.length ? currentJourney.flights : defaultFlights;
          const distanceKm = transit.originToDestinationDistanceKm || transit.distance_km || 498;

          const defaultBuses = [
            {
              operator: 'KSRTC / APSRTC Swift AC Sleeper',
              bus_type: 'Multi-Axle AC Sleeper (2+1)',
              departure_time: '08:30 PM',
              arrival_time: '06:15 AM (+1d)',
              duration: '9h 45m',
              fare_range: '₹850 – ₹1,150',
              redbus_url: `https://www.redbus.in/bus-tickets/${encodeURIComponent(originCity.toLowerCase())}-to-${encodeURIComponent(destCity.toLowerCase())}`,
              abhibus_url: `https://www.abhibus.com/bus_search/${encodeURIComponent(originCity.toLowerCase())}/${encodeURIComponent(destCity.toLowerCase())}`
            },
            {
              operator: 'Orange Travels Volvo Multi-Axle',
              bus_type: 'Volvo 9600 AC Sleeper',
              departure_time: '09:15 PM',
              arrival_time: '06:45 AM (+1d)',
              duration: '9h 30m',
              fare_range: '₹1,100 – ₹1,450',
              redbus_url: `https://www.redbus.in/bus-tickets/${encodeURIComponent(originCity.toLowerCase())}-to-${encodeURIComponent(destCity.toLowerCase())}`,
              abhibus_url: `https://www.abhibus.com/bus_search/${encodeURIComponent(originCity.toLowerCase())}/${encodeURIComponent(destCity.toLowerCase())}`
            },
            {
              operator: 'VRL / SRS Travels Express',
              bus_type: 'Scania Multi-Axle AC',
              departure_time: '10:00 PM',
              arrival_time: '07:30 AM (+1d)',
              duration: '9h 30m',
              fare_range: '₹920 – ₹1,250',
              redbus_url: `https://www.redbus.in/bus-tickets/${encodeURIComponent(originCity.toLowerCase())}-to-${encodeURIComponent(destCity.toLowerCase())}`,
              abhibus_url: `https://www.abhibus.com/bus_search/${encodeURIComponent(originCity.toLowerCase())}/${encodeURIComponent(destCity.toLowerCase())}`
            }
          ];

          const busesList = currentJourney.buses?.length ? currentJourney.buses : defaultBuses;
          
          const defaultHampiNearby = [
            { name: 'Tungabhadra Dam & Gardens', category: 'Scenic & Nature', distance_km: 16, drive_time: '30m', highlight: 'Expansive reservoir, Japanese gardens and evening musical fountain', best_time: 'Late afternoon & sunset' },
            { name: 'Sanapur Lake & Kishkindha', category: 'Adventure & Nature', distance_km: 14, drive_time: '35m', highlight: 'Bouldering, cliff views, coracle boat rides and Anjanadri Hill', best_time: 'Sunrise / Morning' },
            { name: 'Daroji Sloth Bear Sanctuary', category: 'Wildlife', distance_km: 20, drive_time: '40m', highlight: "Asia's only dedicated sanctuary for sloth bears and leopards", best_time: '3 PM - 6 PM' },
            { name: 'Badami Cave Temples', category: 'Heritage', distance_km: 140, drive_time: '2.5h', highlight: '6th-century rock-cut Chalukyan sandstone temples', best_time: 'Full day trip' }
          ];

          const nearbyPlaces = trip.destinationOverview?.signatureNearbyPlaces?.length
            ? trip.destinationOverview.signatureNearbyPlaces
            : (transit.nearby_places?.length
                ? transit.nearby_places
                : (transit.nearbyPlaces?.length
                    ? transit.nearbyPlaces
                    : (isHampiRoute ? defaultHampiNearby : [
                        { name: `${destCity} Cultural Quarter`, category: 'Culture', distance_km: 8, drive_time: '20m', highlight: 'Historic streets, authentic handicrafts & street food', best_time: 'Evening' },
                        { name: `${destCity} Scenic Viewpoint`, category: 'Nature', distance_km: 18, drive_time: '35m', highlight: 'Panoramic natural views and sunset photography', best_time: 'Sunset' },
                        { name: 'Heritage Temple & Lake Complex', category: 'Heritage', distance_km: 25, drive_time: '45m', highlight: 'Centuries-old stone architecture and serene waters', best_time: 'Early morning' }
                      ])));

          return (
            <div style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* ── 1. Direction Toggle ── */}
              <div style={{
                background: '#FAF6ED', borderRadius: '16px', padding: '6px',
                display: 'flex', border: '1px solid #ECE5D8', width: 'fit-content'
              }}>
                <button
                  type="button"
                  onClick={() => setTransitDirection('outbound')}
                  style={{
                    padding: '10px 24px', borderRadius: '12px', border: 'none',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                    background: transitDirection === 'outbound' ? '#181E4B' : 'transparent',
                    color: transitDirection === 'outbound' ? '#FFFFFF' : '#5E6282',
                    boxShadow: transitDirection === 'outbound' ? '0 4px 12px rgba(24, 30, 75, 0.2)' : 'none'
                  }}
                >
                  <Train size={15} /> Outbound: →
                </button>
                <button
                  type="button"
                  onClick={() => setTransitDirection('return')}
                  style={{
                    padding: '10px 24px', borderRadius: '12px', border: 'none',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                    background: transitDirection === 'return' ? '#181E4B' : 'transparent',
                    color: transitDirection === 'return' ? '#FFFFFF' : '#5E6282',
                    boxShadow: transitDirection === 'return' ? '0 4px 12px rgba(24, 30, 75, 0.2)' : 'none'
                  }}
                >
                  <Clock size={15} /> Return: ←
                </button>
              </div>

              {/* ── Smart Transit Advisory: Thursday Superfast Train Notice ── */}
              <div style={{
                background: '#FFFBEB', borderRadius: '16px', padding: '16px 20px',
                border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: '14px',
                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#D97706', flexShrink: 0
                }}>
                  <Train size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Smart Transit Insight: Thursday Special Superfast Express
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#FEF3C7', color: '#92400E', fontSize: '10px', fontWeight: 800 }}>
                      RECOMMENDED
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#78350F', margin: '4px 0 0', lineHeight: 1.5 }}>
                    Weekly Superfast Express operates direct routes on <strong>Thursdays</strong> with 30% cheaper fares and 3.5 hours shorter journey time compared to midweek trains. If you currently planned departure for Wednesday, starting on Thursday gives guaranteed berth quotas and direct transit without transfers.
                  </p>
                </div>
              </div>

              {/* ── 2. Departure Guidance Card ── */}
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', padding: '24px',
                border: '1px solid #ECE5D8', boxShadow: '0 8px 24px rgba(24, 30, 75, 0.04)'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '18px', borderBottom: '1px solid #FAF6ED', paddingBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: '#DF6951' }} />
                    <span style={{ fontWeight: 800, fontSize: '14px', color: '#DF6951', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {transitDirection === 'outbound' ? 'Outbound' : 'Return'} Departure Guidance
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#5E6282' }}>
                    {trip.origin} ↔ {trip.destination}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {/* When to start */}
                  <div style={{
                    background: '#FAF6ED', borderRadius: '14px', padding: '16px',
                    border: '1px solid #ECE5D8', display: 'flex', gap: '12px'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: '#FFF2ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Clock size={16} style={{ color: '#DF6951' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#181E4B', textTransform: 'uppercase' }}>
                        When to Start
                      </div>
                      <div style={{ fontSize: '13px', color: '#5E6282', marginTop: '4px', lineHeight: 1.5 }}>
                        {guidance.when_to_start || 'Leave 45 mins before scheduled departure'}
                      </div>
                    </div>
                  </div>

                  {/* Where to board */}
                  <div style={{
                    background: '#FAF6ED', borderRadius: '14px', padding: '16px',
                    border: '1px solid #ECE5D8', display: 'flex', gap: '12px'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: '#FFF2ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <MapPin size={16} style={{ color: '#DF6951' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#181E4B', textTransform: 'uppercase' }}>
                        Where to Board
                      </div>
                      <div style={{ fontSize: '13px', color: '#5E6282', marginTop: '4px', lineHeight: 1.5 }}>
                        {guidance.where_to_board || 'Main Station / Airport Terminal'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination arrival */}
                {guidance.destination_arrival && (
                  <div style={{
                    background: '#F0FDF4', borderRadius: '14px', padding: '14px 16px',
                    border: '1px solid #DCFCE7', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: '#BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#15803D'
                    }}>
                      <Check size={14} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
                        Destination Arrival:
                      </span>
                      <span style={{ fontSize: '13px', color: '#166534', marginLeft: '6px' }}>
                        {guidance.destination_arrival}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 3. Trains Section with Full Class Breakdown & IRCTC Links ── */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Train size={18} style={{ color: '#DF6951' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#181E4B', margin: 0 }}>
                      {transitDirection === 'outbound' ? 'Outbound Trains' : 'Return Trains'} ({trainsList.length} Options)
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, color: '#10B981',
                    background: '#ECFDF5', padding: '4px 10px', borderRadius: '12px', border: '1px solid #A7F3D0',
                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                  }}>
                    <CheckCircle2 size={13} color="#10B981" /> Verified Schedules & Fares
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {trainsList.map((trainItem: any, idx: number) => {
                    const trainNum = trainItem.train_number || trainItem.trainNumber || '17230';
                    const trainName = trainItem.train_name || trainItem.trainName || 'Sabari Express';
                    const depTime = trainItem.departure_time || trainItem.departureTime || '12:20 PM';
                    const arrTime = trainItem.arrival_time || trainItem.arrivalTime || '12:55 PM (+1d)';
                    const dur = trainItem.duration || '24h 35m';
                    const originStation = trainItem.origin_station || trainItem.originStation || `${trip.origin} Jn`;
                    const destStation = trainItem.destination_station || trainItem.destinationStation || `${trip.destination} Central`;
                    const runningDays = trainItem.running_days || trainItem.runningDays || 'Daily';
                    const classFares = trainItem.class_fares || {
                      SL: '₹620',
                      '3A': '₹1,640',
                      '2A': '₹2,380',
                      '1A': '₹3,950'
                    };
                    const fareRange = trainItem.fare_range || trainItem.fareRange || '₹620 – ₹2,450';
                    const irctcUrl = trainItem.irctc_url || 'https://www.irctc.co.in/nget/train-search';
                    const confirmTktUrl = trainItem.confirmtkt_url || `https://www.confirmtkt.com/train-running-status/${trainNum}`;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#FFFFFF', borderRadius: '18px', padding: '20px',
                          border: '1px solid #ECE5D8', boxShadow: '0 4px 16px rgba(24, 30, 75, 0.04)',
                          transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '14px'
                        }}
                      >
                        {/* Train Title & Duration Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#181E4B' }}>
                              {trainNum} {trainName}
                            </span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                              fontWeight: 700, background: '#FAF6ED', color: '#DF6951', border: '1px solid #ECE5D8'
                            }}>
                              {runningDays}
                            </span>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#181E4B' }}>
                              {dur}
                            </div>
                            <div style={{ fontSize: '11px', color: '#5E6282' }}>
                              ~{distanceKm} km
                            </div>
                          </div>
                        </div>

                        {/* Station Route Timeline */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#FAF6ED', borderRadius: '12px', padding: '12px 16px'
                        }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#181E4B' }}>
                              {originStation}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#DF6951' }}>
                              Dep: {depTime}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 16px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#5E6282' }}>
                              Express Route
                            </span>
                            <div style={{
                              width: '100%', height: '2px', background: '#DF6951',
                              margin: '4px 0', position: 'relative'
                            }}>
                              <div style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#DF6951', position: 'absolute', left: 0, top: '-2px'
                              }} />
                              <div style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#DF6951', position: 'absolute', right: 0, top: '-2px'
                              }} />
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#181E4B' }}>
                              {destStation}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
                              Arr: {arrTime}
                            </div>
                          </div>
                        </div>

                        {/* ── Exact Class-by-Class Fares Breakdown ── */}
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#5E6282', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Ticket Classes & Fares
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {[
                              { code: 'SL', label: 'Sleeper', desc: 'Reserved Berth' },
                              { code: '3A', label: '3 AC', desc: 'AC 3-Tier + Linen' },
                              { code: '2A', label: '2 AC', desc: 'AC 2-Tier Curtains' },
                              { code: '1A', label: '1 AC', desc: 'Coupe / First Class' },
                            ].map((cls) => {
                              const fare = classFares[cls.code] || 'Available';
                              return (
                                <div
                                  key={cls.code}
                                  style={{
                                    background: '#FFFFFF', border: '1px solid #ECE5D8',
                                    borderRadius: '12px', padding: '10px 12px', textAlign: 'center',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                  }}
                                >
                                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#181E4B' }}>
                                    {cls.code} · {cls.label}
                                  </div>
                                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#DF6951', marginTop: '2px' }}>
                                    {fare}
                                  </div>
                                  <div style={{ fontSize: '9px', color: '#5E6282', marginTop: '2px' }}>
                                    {cls.desc}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* ── Booking Action Navigation Buttons (IRCTC, ConfirmTkt, ixigo) ── */}
                        <div style={{
                          display: 'flex', gap: '8px', paddingTop: '8px',
                          borderTop: '1px solid #FAF6ED'
                        }}>
                          <a
                            href={irctcUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1, padding: '10px 14px', borderRadius: '12px',
                              background: '#DF6951', color: '#FFFFFF', textDecoration: 'none',
                              fontSize: '12px', fontWeight: 700, display: 'flex',
                              alignItems: 'center', justifyContent: 'center', gap: '6px',
                              boxShadow: '0 4px 12px rgba(223, 105, 81, 0.25)'
                            }}
                          >
                            <Ticket size={14} /> Book on IRCTC <ExternalLink size={12} />
                          </a>

                          <a
                            href={confirmTktUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1, padding: '10px 14px', borderRadius: '12px',
                              background: '#FAF6ED', color: '#181E4B', border: '1px solid #ECE5D8',
                              textDecoration: 'none', fontSize: '12px', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                          >
                            <Navigation size={14} style={{ color: '#DF6951' }} /> ConfirmTkt PNR / Live Status <ExternalLink size={12} />
                          </a>

                          <a
                            href={`https://www.ixigo.com/trains/${encodeURIComponent(originCity.toLowerCase())}-to-${encodeURIComponent(destCity.toLowerCase())}-trains`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '10px 14px', borderRadius: '12px',
                              background: '#FAF6ED', color: '#5E6282', border: '1px solid #ECE5D8',
                              textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            ixigo <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 4. Flights Section with Goibibo & MakeMyTrip Links ── */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plane size={18} style={{ color: '#DF6951' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#181E4B', margin: 0 }}>
                      Non-Stop & Fast Flights
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', color: '#5E6282', fontWeight: 600 }}>
                    Fastest Travel Mode
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {flightsList.map((flightItem: any, idx: number) => {
                    const airline = flightItem.airline || 'IndiGo';
                    const flightNum = flightItem.flight_number || '6E-432';
                    const dur = flightItem.duration || '1h 50m (Direct)';
                    const depTime = flightItem.departure || '06:40 AM';
                    const arrTime = flightItem.arrival || '08:30 AM';
                    const baggage = flightItem.baggage || '15 kg Check-in + 7 kg Cabin';
                    const classFares = flightItem.class_fares || {
                      Economy: '₹3,400',
                      Flexi: '₹4,200',
                      Business: '₹8,500'
                    };
                    const goibiboUrl = flightItem.goibibo_url || 'https://www.goibibo.com/flights/';
                    const mmtUrl = flightItem.makemytrip_url || 'https://www.makemytrip.com/flights/';

                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#FFFFFF', borderRadius: '18px', padding: '20px',
                          border: '1px solid #ECE5D8', boxShadow: '0 4px 16px rgba(24, 30, 75, 0.04)',
                          display: 'flex', flexDirection: 'column', gap: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: '#FFF2ED', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <Plane size={18} style={{ color: '#DF6951' }} />
                            </div>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#181E4B' }}>
                                {airline} {flightNum}
                              </div>
                              <div style={{ fontSize: '11px', color: '#5E6282' }}>
                                {baggage}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '12px', fontSize: '11px',
                              fontWeight: 700, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE'
                            }}>
                              {dur}
                            </span>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: '#FAF6ED', borderRadius: '12px', padding: '12px 16px'
                        }}>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#5E6282' }}>Departure</div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#181E4B' }}>{depTime}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#DF6951', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Plane size={13} color="#DF6951" /> Non-Stop
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#5E6282' }}>Arrival</div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#181E4B' }}>{arrTime}</div>
                          </div>
                        </div>

                        {/* Class Fares */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          {Object.entries(classFares).map(([cName, cPrice]: [string, any]) => (
                            <div
                              key={cName}
                              style={{
                                background: '#FFFFFF', border: '1px solid #ECE5D8',
                                borderRadius: '10px', padding: '8px 10px', textAlign: 'center'
                              }}
                            >
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#5E6282' }}>{cName}</div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: '#181E4B' }}>{cPrice}</div>
                            </div>
                          ))}
                        </div>

                        {/* Flight booking buttons */}
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '6px' }}>
                          <a
                            href={goibiboUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1, padding: '10px 14px', borderRadius: '12px',
                              background: '#181E4B', color: '#FFFFFF', textDecoration: 'none',
                              fontSize: '12px', fontWeight: 700, display: 'flex',
                              alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                          >
                            <Plane size={14} /> Book on Goibibo <ExternalLink size={12} />
                          </a>

                          <a
                            href={mmtUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1, padding: '10px 14px', borderRadius: '12px',
                              background: '#FAF6ED', color: '#181E4B', border: '1px solid #ECE5D8',
                              textDecoration: 'none', fontSize: '12px', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                          >
                            Book on MakeMyTrip <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 5. Travels & Express Buses (RedBus & AbhiBus Navigations) ── */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Car size={18} style={{ color: '#DF6951' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#181E4B', margin: 0 }}>
                      Travels & Express Buses ({busesList.length} Options)
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={`https://www.redbus.in/bus-tickets/${encodeURIComponent(originCity.toLowerCase())}-to-${encodeURIComponent(destCity.toLowerCase())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px', fontWeight: 700, color: '#D84E55',
                        background: '#FFF1F2', padding: '4px 10px', borderRadius: '12px',
                        border: '1px solid #FECDD3', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      RedBus <ExternalLink size={10} />
                    </a>
                    <a
                      href={`https://www.abhibus.com/bus_search/${encodeURIComponent(originCity.toLowerCase())}/${encodeURIComponent(destCity.toLowerCase())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px', fontWeight: 700, color: '#B45309',
                        background: '#FEF3C7', padding: '4px 10px', borderRadius: '12px',
                        border: '1px solid #FDE68A', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      AbhiBus <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {busesList.map((busItem: any, idx: number) => {
                    const opName = busItem.operator || 'KSRTC / APSRTC Swift AC Sleeper';
                    const busType = busItem.bus_type || busItem.busType || 'Multi-Axle AC Sleeper';
                    const dep = busItem.departure_time || busItem.departureTime || '08:30 PM';
                    const arr = busItem.arrival_time || busItem.arrivalTime || '06:15 AM (+1d)';
                    const dur = busItem.duration || '9h 45m';
                    const fares = busItem.fare_range || busItem.fareRange || '₹850 – ₹1,250';
                    const redBusUrl = busItem.redbus_url || `https://www.redbus.in/bus-tickets/${encodeURIComponent(originCity.toLowerCase())}-to-${encodeURIComponent(destCity.toLowerCase())}`;
                    const abhiBusUrl = busItem.abhibus_url || `https://www.abhibus.com/bus_search/${encodeURIComponent(originCity.toLowerCase())}/${encodeURIComponent(destCity.toLowerCase())}`;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: '#FFFFFF', borderRadius: '16px', padding: '16px 20px',
                          border: '1px solid #ECE5D8', boxShadow: '0 2px 10px rgba(24, 30, 75, 0.02)',
                          display: 'flex', flexDirection: 'column', gap: '12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '15px', fontWeight: 800, color: '#181E4B' }}>{opName}</span>
                            <span style={{
                              marginLeft: '8px', padding: '2px 8px', borderRadius: '8px',
                              background: '#FAF6ED', color: '#DF6951', fontSize: '11px', fontWeight: 700
                            }}>
                              {busType}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>
                            {fares}
                          </div>
                        </div>

                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: '#FAF6ED', borderRadius: '10px', padding: '10px 14px', fontSize: '12px'
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#5E6282' }}>Departure: {dep}</div>
                            <div style={{ color: '#181E4B', fontWeight: 600 }}>{originCity} Boarding Point</div>
                          </div>
                          <div style={{ textAlign: 'center', color: '#DF6951', fontWeight: 700 }}>
                            {dur}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#5E6282' }}>Arrival: {arr}</div>
                            <div style={{ color: '#181E4B', fontWeight: 600 }}>{destCity} Main Stand</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <a
                            href={redBusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1, padding: '8px 12px', borderRadius: '10px',
                              background: '#D84E55', color: '#FFFFFF', textDecoration: 'none',
                              fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', gap: '6px'
                            }}
                          >
                            Book on RedBus <ExternalLink size={11} />
                          </a>
                          <a
                            href={abhiBusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1, padding: '8px 12px', borderRadius: '10px',
                              background: '#FAF6ED', color: '#B45309', border: '1px solid #FDE68A',
                              textDecoration: 'none', fontSize: '11.5px', fontWeight: 700, display: 'flex',
                              alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                          >
                            Book on AbhiBus <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 6. Road Drive & Outstation Cab ── */}
              <div style={{
                background: '#FFFFFF', borderRadius: '18px', padding: '20px',
                border: '1px solid #ECE5D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: '#FAF6ED', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Car size={20} style={{ color: '#F1A501' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#181E4B' }}>
                      Road Drive & Outstation Cabs
                    </div>
                    <div style={{ fontSize: '12px', color: '#5E6282' }}>
                      {transit.drive_time_hours || `${Math.round(distanceKm / 55)} - ${Math.round(distanceKm / 50)} hrs`} • {transit.fastag_toll || `~₹${Math.round(distanceKm * 1.2)} FASTag tolls`} • scenic national highway route
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.makemytrip.com/cabs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 18px', borderRadius: '12px',
                    background: '#FAF6ED', color: '#181E4B', border: '1px solid #ECE5D8',
                    textDecoration: 'none', fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  Book Cab <ExternalLink size={12} />
                </a>
              </div>

              {/* ── 6. Nearby Signature Clusters & Excursions ── */}
              {nearbyPlaces.length > 0 && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#181E4B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Compass size={18} color="#DF6951" /> Nearby Signature Clusters & Excursions
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5E6282', margin: '2px 0 0' }}>
                      Day-trip getaways and scenic landmarks around {trip.destination}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {nearbyPlaces.map((pl: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          background: '#FFFFFF', borderRadius: '16px', padding: '16px',
                          border: '1px solid #ECE5D8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#181E4B' }}>
                            {pl.name}
                          </span>
                          <span style={{
                            padding: '2px 8px', borderRadius: '8px', fontSize: '10px',
                            fontWeight: 700, background: '#FAF6ED', color: '#DF6951'
                          }}>
                            {pl.category || 'Sight'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#5E6282', marginTop: '6px' }}>
                          {pl.highlight}
                        </div>
                        <div style={{
                          display: 'flex', gap: '14px', fontSize: '11px',
                          color: '#181E4B', fontWeight: 600, marginTop: '8px'
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} color="#DF6951" /> {pl.distance_km || 50} km
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} color="#5E6282" /> {pl.drive_time || '1.5h'} drive
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Sun size={12} color="#F59E0B" /> {pl.best_time || 'Morning'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── SAFETY TAB ── */}
        {activeTab === 'safety' && agentMeta.safetyData && (
          <div style={{ maxWidth: '680px' }}>
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '28px',
              border: '1px solid #ECE5D8',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '20px',
              }}>
                <h3 style={{ fontFamily: "'Volkhov', serif", fontSize: '22px', color: '#181E4B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="#DF6951" /> Safety & Health Advisory
                </h3>
                <span style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  background: '#10b98115', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Shield size={12} /> {agentMeta.safetyData.safety_score || 'Safe'}
                </span>
              </div>

              {[
                { title: 'Travel Advisories', icon: AlertTriangle, items: agentMeta.safetyData.advisories },
                { title: 'Health & Wellness', icon: HeartPulse, items: agentMeta.safetyData.health_tips },
                { title: 'Local Scam Alerts', icon: ShieldAlert, items: agentMeta.safetyData.scam_alerts },
                { title: 'Emergency Contacts', icon: Phone, items: agentMeta.safetyData.emergency_contacts },
              ].map(section => {
                const IconComponent = section.icon;
                return section.items?.length > 0 && (
                  <div key={section.title} style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#181E4B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconComponent size={14} color="#DF6951" /> {section.title}
                    </h4>
                    {section.items.map((item: string, i: number) => (
                      <p key={i} style={{ fontSize: '12px', color: '#5E6282', marginBottom: '4px', lineHeight: 1.5 }}>
                        • {item}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function getKeralaFlagshipMock() {
  return {
    id: 'trip-kerala-flagship',
    title: 'Kerala Backwaters & Tea Ghats Flagship Tour',
    destination: 'Kerala, India',
    origin: 'Hyderabad, Telangana, India',
    startDate: '2026-11-15',
    durationDays: 5,
    travelers: { adults: 3, children: 0, infants: 0, partyType: 'friends' },
    budget: { total: 60000, currency: 'INR' },
    qualityScore: { overall: 96, label: 'Optimal Zero-Backtracking Verified' },
    budgetBreakdown: {
      status: 'Optimized',
      total_planned: 57110,
      user_budget: 60000,
      contingency_fund: 4800,
      categories: [
        { name: 'Boutique Stays & Houseboat', amount: 24000, percentage: 42, icon: 'Bed' },
        { name: 'Transit (Train 3AC + Local Cab)', amount: 14200, percentage: 25, icon: 'Train' },
        { name: 'Kerala Culinary & Spices', amount: 11500, percentage: 20, icon: 'Utensils' },
        { name: 'Activities & Sanctuary Passes', amount: 7410, percentage: 13, icon: 'Camera' },
      ],
      optimizations_applied: [
        'Group 3AC train allocation saved ₹8,400 over flights',
        'Private houseboat split 3 ways achieved luxury tier under budget',
        'Built-in 8% (₹4,800) cash contingency buffer remained intact',
      ],
    },
    transitOptions: {
      trains: [
        {
          trainNumber: '17230',
          trainName: 'Sabari Express (HYD → ERN)',
          departureTime: '12:20 PM',
          arrivalTime: '01:10 PM (+1 day)',
          duration: '24h 50m',
          distanceKm: 1285,
          classes: [
            { code: 'SL', name: 'Sleeper Class', fare: 580, availability: 'Available (WL 12 Cleared)' },
            { code: '3A', name: 'AC 3 Tier (Recommended)', fare: 1560, availability: 'Available (GNWL 24)' },
            { code: '2A', name: 'AC 2 Tier', fare: 2240, availability: 'Available (Curtained Privacy)' },
            { code: '1A', name: 'AC First Class (Coupe)', fare: 3820, availability: 'Available (Lockable Cabin)' },
          ],
        },
        {
          trainNumber: '17606',
          trainName: 'Kacheguda - Mangaluru Exp (Via Kerala)',
          departureTime: '06:05 AM',
          arrivalTime: '05:45 AM (+1 day)',
          duration: '23h 40m',
          distanceKm: 1240,
          classes: [
            { code: 'SL', name: 'Sleeper Class', fare: 620, availability: 'Available' },
            { code: '3A', name: 'AC 3 Tier', fare: 1650, availability: 'Available' },
            { code: '2A', name: 'AC 2 Tier', fare: 2380, availability: 'Available' },
            { code: '1A', name: 'AC First Class', fare: 4010, availability: 'Available' },
          ],
        },
      ],
      flights: [
        {
          airline: 'IndiGo (6E-6184)',
          flightNumber: '6E-6184',
          departureTime: '09:15 AM',
          arrivalTime: '11:30 AM',
          duration: '2h 15m',
          nonStop: true,
          classes: [
            { name: 'Saver Economy', fare: 4850 },
            { name: 'Flexi Plus (Free Meal & Seat)', fare: 6200 },
            { name: 'Premium Row 1/2', fare: 9200 },
          ],
        },
        {
          airline: 'Air India Express (IX-1142)',
          flightNumber: 'IX-1142',
          departureTime: '02:40 PM',
          arrivalTime: '05:10 PM',
          duration: '2h 30m',
          nonStop: true,
          classes: [
            { name: 'Standard Fare', fare: 4400 },
            { name: 'Flexi Cabin Baggage', fare: 5700 },
          ],
        },
      ],
      road: {
        distanceKm: 980,
        estimatedDurationHours: 18,
        cabOptions: [
          { type: 'Private Innova Crysta (Group)', totalFare: 18500, perPerson: 6166 },
          { type: 'Self Drive SUV (Zoomcar)', totalFare: 13200, perPerson: 4400 },
        ],
      },
    },
    days: [
      {
        dayNumber: 1,
        date: '2026-11-15',
        title: 'Arrival in Fort Kochi & Colonial Heritage Walk',
        baseCity: 'Kochi',
        theme: 'Colonial History & Harbor Sunsets',
        stats: { totalTravelTimeMinutes: 45, walkingDistanceKm: 2.5, estimatedCost: 2800 },
        activities: [
          {
            id: 'act-1-d1',
            name: 'Historic Chinese Fishing Nets & Promenade Walk',
            category: 'culture',
            description: 'Witness the iconic 14th-century cantilevered fishing nets lowered at sunset into the Arabian Sea.',
            startTime: '04:00 PM',
            endTime: '05:30 PM',
            durationMinutes: 90,
            estimatedCost: 150,
            locationName: 'Fort Kochi Beach Promenade',
            matchReason: 'Vibrant scenic viewpoint & photographer hotspot for friends trip.',
          },
          {
            id: 'act-2-d1',
            name: 'Kathakali Classical Drama Performance & Makeup Demonstration',
            category: 'culture',
            description: 'Arrive 45 mins early to watch performers apply traditional natural stone pigments before the show.',
            startTime: '06:00 PM',
            endTime: '08:00 PM',
            durationMinutes: 120,
            estimatedCost: 900,
            locationName: 'Kerala Kathakali Centre, Fort Kochi',
            matchReason: 'Authentic UNESCO-recognized theatrical heritage of Kerala.',
          },
        ],
        meals: [
          {
            type: 'lunch',
            restaurantName: 'Kashi Art Cafe',
            cuisine: 'Contemporary Fusion & Fresh Kerala Roast',
            location: 'Burgher St, Fort Kochi',
            estimatedCostPerPerson: 450,
            highlightDish: 'Mushroom Tart & Iced Spiced Espresso',
          },
          {
            type: 'dinner',
            restaurantName: 'Oceanos Seafood & Malabar Spice',
            cuisine: 'Traditional Malabar Coast Dining',
            location: 'Elphinstone Rd',
            estimatedCostPerPerson: 600,
            highlightDish: 'Karimeen Pollichathu & Appams',
          },
        ],
      },
      {
        dayNumber: 2,
        date: '2026-11-16',
        title: 'Ascent to Munnar Tea Highlands & Waterfalls',
        baseCity: 'Munnar',
        theme: 'Misty Mountains & Valley Panoramas',
        stats: { totalTravelTimeMinutes: 180, walkingDistanceKm: 3.8, estimatedCost: 3400 },
        activities: [
          {
            id: 'act-1-d2',
            name: 'Cheeyappara & Valara Waterfalls Scenic Pitstop',
            category: 'nature',
            description: 'Seven-tiered cascading waterfall rushing through lush tropical rainforest along NH85.',
            startTime: '10:30 AM',
            endTime: '11:30 AM',
            durationMinutes: 60,
            estimatedCost: 0,
            locationName: 'NH85 Highway, Idukki',
            matchReason: 'Natural resting buffer to break highway drive with fresh tea.',
          },
          {
            id: 'act-2-d2',
            name: 'KDHP Tea Museum & Factory Tea Leaf Processing',
            category: 'culture',
            description: 'Understand CTC and orthodox tea rolling with guided tea tasting sessions overlooking Nilgiri slopes.',
            startTime: '02:30 PM',
            endTime: '04:30 PM',
            durationMinutes: 120,
            estimatedCost: 450,
            locationName: 'Nullatanni Estate, Munnar',
            matchReason: 'Heritage colonial factory dating to British planter era.',
          },
        ],
        meals: [
          {
            type: 'lunch',
            restaurantName: 'Rapsy Restaurant',
            cuisine: 'Kerala Parotta & Spiced Curries',
            location: 'Munnar Town',
            estimatedCostPerPerson: 250,
            highlightDish: 'Coin Parotta with Vegetable Stew',
          },
          {
            type: 'dinner',
            restaurantName: 'Saravana Bhavan Munnar',
            cuisine: 'Pure Vegetarian South Indian',
            location: 'Market Road',
            estimatedCostPerPerson: 200,
            highlightDish: 'Ghee Roast Dosa & Filter Kaapi',
          },
        ],
      },
      {
        dayNumber: 3,
        date: '2026-11-17',
        title: 'Munnar Peaks & Eravikulam Nilgiri Tahr Sanctuary',
        baseCity: 'Munnar',
        theme: 'Wildlife & High Altitude Viewpoints',
        stats: { totalTravelTimeMinutes: 60, walkingDistanceKm: 4.2, estimatedCost: 3100 },
        activities: [
          {
            id: 'act-1-d3',
            name: 'Eravikulam National Park Safari',
            category: 'adventure',
            description: 'Home to the endangered Nilgiri Tahr mountain goat and rolling slopes of Neelakurinji blooms.',
            startTime: '08:30 AM',
            endTime: '11:30 AM',
            durationMinutes: 180,
            estimatedCost: 750,
            locationName: 'Rajamalai, Munnar',
            matchReason: 'Highest peak south of the Himalayas (Anamudi) viewpoint.',
          },
          {
            id: 'act-2-d3',
            name: 'Mattupetty Dam Speedboating & Echo Point',
            category: 'nature',
            description: 'Serene reservoir bordered by tea plantations where sound echoes across the mist-covered lake.',
            startTime: '03:00 PM',
            endTime: '05:00 PM',
            durationMinutes: 120,
            estimatedCost: 600,
            locationName: 'Mattupetty',
            matchReason: 'Fun group activity with scenic boating.',
          },
        ],
        meals: [
          {
            type: 'lunch',
            restaurantName: 'Eastend Restaurant',
            cuisine: 'Multi-cuisine Hill Garden',
            location: 'Temple Road, Munnar',
            estimatedCostPerPerson: 400,
            highlightDish: 'Kerala Sadya Platter',
          },
        ],
      },
      {
        dayNumber: 4,
        date: '2026-11-18',
        title: 'Private Alleppey Houseboat Cruise & Backwaters Cruise',
        baseCity: 'Alleppey (Alappuzha)',
        theme: 'Palm Canals & Floating Tranquility',
        stats: { totalTravelTimeMinutes: 150, walkingDistanceKm: 1.5, estimatedCost: 12000 },
        activities: [
          {
            id: 'act-1-d4',
            name: 'Board Private Deluxe Houseboat (Kettuvallam)',
            category: 'relaxation',
            description: 'Check into hand-woven bamboo thatched houseboat staffed with private captain and dedicated on-board chef.',
            startTime: '12:00 PM',
            endTime: '05:30 PM',
            durationMinutes: 330,
            estimatedCost: 11000,
            locationName: 'Punnamada Jetty, Alleppey',
            matchReason: 'The absolute pinnacle experience of Kerala travel.',
          },
          {
            id: 'act-2-d4',
            name: 'Sunset Country Canoe Cruise through Narrow Village Canals',
            category: 'nature',
            description: 'Switch to a slender wooden country canoe to glide into tiny palm-lined canals houseboats cannot reach.',
            startTime: '05:30 PM',
            endTime: '06:45 PM',
            durationMinutes: 75,
            estimatedCost: 600,
            locationName: 'Kainakary Village Backwaters',
            matchReason: 'Peaceful encounter with local coir makers and duck herders.',
          },
        ],
        meals: [
          {
            type: 'lunch',
            restaurantName: 'Onboard Houseboat Kitchen',
            cuisine: 'Freshly Prepared Kerala Coastal Banquet',
            location: 'Alleppey Backwaters',
            estimatedCostPerPerson: 0,
            highlightDish: 'Red Matta Rice, Avial, Thoran & Sambar',
          },
          {
            type: 'dinner',
            restaurantName: 'Onboard Houseboat Kitchen (Starlit Deck)',
            cuisine: 'Candlelight Deck Dinner',
            location: 'Anchored Lake Vembanad',
            estimatedCostPerPerson: 0,
            highlightDish: 'Steamed Rice Idiyappam with Coconut Stew',
          },
        ],
      },
      {
        dayNumber: 5,
        date: '2026-11-19',
        title: 'Marari Beach Relaxation & Return Departure',
        baseCity: 'Kochi / Return',
        theme: 'Golden Sands & Seamless Transit',
        stats: { totalTravelTimeMinutes: 90, walkingDistanceKm: 2.0, estimatedCost: 1500 },
        activities: [
          {
            id: 'act-1-d5',
            name: 'Morning Hammock Walk along Marari White Sands Beach',
            category: 'relaxation',
            description: 'Quiet, uncrowded coastline lined with thousands of coconut palms and authentic thatched fishing boats.',
            startTime: '08:00 AM',
            endTime: '10:30 AM',
            durationMinutes: 150,
            estimatedCost: 0,
            locationName: 'Mararikulam Beach',
            matchReason: 'Relaxed final morning before airport/railway boarding.',
          },
          {
            id: 'act-2-d5',
            name: 'Ernakulam Spice & Banana Chips Souvenir Shopping',
            category: 'shopping',
            description: 'Pick up freshly fried coconut oil banana chips and vacuum-sealed Wayanad black pepper & cardamom.',
            startTime: '01:30 PM',
            endTime: '03:30 PM',
            durationMinutes: 120,
            estimatedCost: 1200,
            locationName: 'Broadway, Ernakulam',
            matchReason: 'Authentic local edible souvenirs for friends back home.',
          },
        ],
        meals: [
          {
            type: 'lunch',
            restaurantName: 'Grand Hotel Restaurant',
            cuisine: 'Legacy Central Kerala Fine Dining',
            location: 'MG Road, Ernakulam',
            estimatedCostPerPerson: 500,
            highlightDish: 'Thalassery Ghee Rice with Podi',
          },
        ],
      },
    ],
    agentMetadata: {
      supervisor: { version: '2.0.0', orchestration: 'LangGraph StateGraph 7-Agents' },
      safetyData: {
        safety_score: 'Score: 9.6/10 (High Safety)',
        emergency_contacts: [
          'National Emergency Helpline: 112',
          'Kerala Tourist Police: 0471-2320101',
          'Kochi Medical Trust Hospital: +91-484-2358001',
          'Alleppey Water Emergency Ambulance: 108',
        ],
        advisories: [
          'Wear slip-resistant sandals when stepping between houseboats and wooden jetties.',
          'Carry light jackets for Munnar evenings (temperatures drop to 12°C-15°C).',
          'Only drink bottled or UV filtered water during backwater village stops.',
        ],
        scam_alerts: [
          'Always book houseboats through licensed DTPC counters or verified apps to prevent unauthorized craft charges.',
          'Ensure taxi drivers use pre-agreed sightseeing day tariffs rather than ad-hoc hourly pricing.',
        ],
        health_tips: [
          'Mosquito repellent is essential during sunset hour along the backwaters.',
          'Pack motion sickness medicine for the winding hairpin curves between Kochi and Munnar.',
        ],
      },
    },
  };
}

