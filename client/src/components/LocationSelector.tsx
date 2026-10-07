import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Check, ChevronDown, Sparkles, X, Plane, ArrowRight, Globe } from 'lucide-react';
import { POPULAR_LOCATIONS, type LocationItem } from '../data/locations';

interface LocationSelectorProps {
  label: string;
  icon?: 'pin' | 'plane';
  value: string;
  onChange: (formatted: string, details?: { country: string; state: string; place: string }) => void;
  placeholder?: string;
  popularChips?: string[];
}

export default function LocationSelector({
  label,
  icon = 'pin',
  value,
  onChange,
  placeholder = 'Select country, state, or place',
  popularChips = []
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<LocationItem>(POPULAR_LOCATIONS[0]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [customPlace, setCustomPlace] = useState('');
  const [viewMode, setViewMode] = useState<'search' | 'cascade'>('search');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [apiResults, setApiResults] = useState<{ place: string; state: string; country: string; countryCode: string; full: string }[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live OpenStreetMap Nominatim Geocoding API for every minor place, town and village
  useEffect(() => {
    const q = (searchQuery || '').trim();
    if (q.length < 2) {
      setApiResults([]);
      setIsSearchingApi(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8`, {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          const items: { place: string; state: string; country: string; countryCode: string; full: string }[] = [];
          for (const item of data) {
            const addr = item.address || {};
            const place = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || item.name || q;
            const state = addr.state || '';
            const country = addr.country || 'India';
            const countryCode = (addr.country_code || 'in').toUpperCase();
            const full = [place, state, country].filter(Boolean).join(', ');
            items.push({ place, state, country, countryCode, full });
          }
          setApiResults(items);
        }
      } catch {
        // Fallback to local POPULAR_LOCATIONS
      } finally {
        setIsSearchingApi(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combined and deduplicated search results
  const searchResults = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    const localResults: { place: string; state: string; country: string; countryCode: string; full: string }[] = [];

    for (const loc of POPULAR_LOCATIONS) {
      for (const st of loc.states) {
        if (st.name.toLowerCase().includes(q)) {
          localResults.push({
            place: st.name,
            state: st.name,
            country: loc.country,
            countryCode: loc.countryCode,
            full: `${st.name}, ${loc.country}`
          });
        }
        for (const pl of st.places) {
          if (pl.toLowerCase().includes(q)) {
            localResults.push({
              place: pl,
              state: st.name,
              country: loc.country,
              countryCode: loc.countryCode,
              full: `${pl}, ${st.name}, ${loc.country}`
            });
          }
        }
      }
      if (loc.country.toLowerCase().includes(q)) {
        localResults.push({
          place: loc.country,
          state: '',
          country: loc.country,
          countryCode: loc.countryCode,
          full: loc.country
        });
      }
    }

    // Merge local results + API results, deduplicated by name
    const seen = new Set<string>();
    const combined: { place: string; state: string; country: string; countryCode: string; full: string }[] = [];

    for (const r of [...localResults, ...apiResults]) {
      const key = `${r.place.toLowerCase().trim()}_${r.state.toLowerCase().trim()}`;
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(r);
      }
    }

    return combined.slice(0, 14);
  }, [searchQuery, apiResults]);

  const handleSelect = (place: string, state: string, country: string) => {
    let formatted = place;
    if (state && !place.includes(state)) {
      formatted = `${place}, ${state}`;
    }
    if (country && !formatted.includes(country)) {
      formatted = `${formatted}, ${country}`;
    }
    onChange(formatted, { country, state, place });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleApplyCascade = () => {
    const place = customPlace.trim() || selectedState || selectedCountry.country;
    handleSelect(place, selectedState, selectedCountry.country);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '11px', fontWeight: 700, color: '#181E4B',
        textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px'
      }}>
        {icon === 'pin' ? (
          <MapPin size={13} style={{ color: '#DF6951' }} />
        ) : (
          <Navigation size={13} style={{ color: '#F1A501' }} />
        )}
        {label}
      </label>

      {/* Input box */}
      <div
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#FAF6ED', border: isOpen ? '1.5px solid #DF6951' : '1px solid #ECE5D8',
          borderRadius: '14px', padding: '12px 14px', cursor: 'pointer',
          transition: 'all 0.2s', boxShadow: isOpen ? '0 0 0 3px rgba(223, 105, 81, 0.12)' : 'none'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {value ? (
            icon === 'plane' || (!value.includes('India') && value.includes(',')) ? (
              <Plane size={16} color="#DF6951" />
            ) : (
              <MapPin size={16} color="#DF6951" />
            )
          ) : (
            <Search size={16} color="#5E6282" />
          )}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', background: 'transparent',
            outline: 'none', fontSize: '14px', fontWeight: 600,
            color: '#181E4B'
          }}
        />
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchQuery('');
            }}
            style={{
              background: 'none', border: 'none', padding: '2px',
              cursor: 'pointer', color: '#5E6282'
            }}
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown size={14} style={{ color: '#5E6282', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {/* Quick Chips */}
      {popularChips.length > 0 && !isOpen && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {popularChips.map((chip) => {
            const isSelected = value.toLowerCase().includes(chip.toLowerCase());
            return (
              <button
                key={chip}
                type="button"
                onClick={() => onChange(chip)}
                style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px',
                  fontWeight: 600, border: '1px solid',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: isSelected ? '#DF6951' : '#FAF6ED',
                  color: isSelected ? '#fff' : '#181E4B',
                  borderColor: isSelected ? '#DF6951' : '#ECE5D8',
                }}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#FFFFFF', borderRadius: '18px',
          border: '1px solid #ECE5D8', boxShadow: '0 16px 40px -8px rgba(24, 30, 75, 0.16)',
          zIndex: 100, overflow: 'hidden', animation: 'dropdownFadeIn 0.2s ease-out'
        }}>
          {/* Header Mode Switcher */}
          <div style={{
            display: 'flex', borderBottom: '1px solid #ECE5D8',
            background: '#FAF6ED', padding: '6px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('search')}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '10px',
                border: 'none', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: viewMode === 'search' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'search' ? '#DF6951' : '#5E6282',
                boxShadow: viewMode === 'search' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Search size={12} /> Instant Search
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cascade')}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '10px',
                border: 'none', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                background: viewMode === 'cascade' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'cascade' ? '#DF6951' : '#5E6282',
                boxShadow: viewMode === 'cascade' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Sparkles size={12} /> Country & State Explorer
            </button>
          </div>

          {/* View Mode 1: Search Autocomplete */}
          {viewMode === 'search' && (
            <div style={{ padding: '12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#FAF6ED', borderRadius: '10px', padding: '8px 12px',
                marginBottom: '10px'
              }}>
                <Search size={14} style={{ color: '#5E6282' }} />
                <input
                  type="text"
                  placeholder="Search any place in India (e.g. Machilipatnam, Kerala...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchResults.length > 0) {
                        handleSelect(searchResults[0].place, searchResults[0].state, searchResults[0].country);
                      } else if (searchQuery.trim()) {
                        handleSelect(searchQuery.trim(), '', 'India');
                      }
                    }
                  }}
                  autoFocus
                  style={{
                    border: 'none', background: 'transparent', width: '100%',
                    outline: 'none', fontSize: '13px', color: '#181E4B', fontWeight: 500
                  }}
                />
                {isSearchingApi && (
                  <div style={{ fontSize: '10.5px', color: '#DF6951', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    Searching...
                  </div>
                )}
              </div>

              {/* Live search results or popular places list */}
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {searchQuery.trim().length > 0 && (
                  <div
                    onClick={() => handleSelect(searchQuery.trim(), '', 'India')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                      background: '#FFF2ED', border: '1px solid rgba(223, 105, 81, 0.3)', marginBottom: '8px',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#DF6951" />
                      <div>
                        <div style={{ fontWeight: 700, color: '#DF6951' }}>Use "{searchQuery.trim()}"</div>
                        <div style={{ fontSize: '11px', color: '#5E6282' }}>Custom destination or city</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#DF6951', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Select <ArrowRight size={12} />
                    </span>
                  </div>
                )}
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelect(item.place, item.state, item.country)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                        transition: 'background 0.15s', fontSize: '13px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FAF6ED'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '5px', background: '#ECE5D8',
                          color: '#181E4B', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px'
                        }}>
                          {item.countryCode}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, color: '#181E4B' }}>{item.place}</div>
                          <div style={{ fontSize: '11px', color: '#5E6282' }}>
                            {item.state ? `${item.state}, ` : ''}{item.country}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#DF6951', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        Select <ArrowRight size={12} />
                      </span>
                    </div>
                  ))
                ) : (
                  <div>
                    <div style={{
                      fontSize: '11px', fontWeight: 700, color: '#5E6282', padding: '4px 8px 8px',
                      textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <Sparkles size={13} color="#DF6951" /> Popular Tourist Spots
                    </div>
                    {[
                      { place: 'Munnar, Kerala', state: 'Kerala', country: 'India', countryCode: 'IN' },
                      { place: 'North Goa (Calangute)', state: 'Goa', country: 'India', countryCode: 'IN' },
                      { place: 'Jaipur & Udaipur', state: 'Rajasthan', country: 'India', countryCode: 'IN' },
                      { place: 'Manali & Solang', state: 'Himachal Pradesh', country: 'India', countryCode: 'IN' },
                      { place: 'Kyoto & Tokyo', state: 'Honshu', country: 'Japan', countryCode: 'JP' },
                      { place: 'Interlaken & Alps', state: 'Bernese Oberland', country: 'Switzerland', countryCode: 'CH' },
                      { place: 'Ubud & Seminyak', state: 'Bali', country: 'Indonesia', countryCode: 'ID' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelect(item.place, item.state, item.country)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: '10px', cursor: 'pointer',
                          transition: 'background 0.15s', fontSize: '12.5px',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FAF6ED'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '2px 6px', borderRadius: '5px', background: '#ECE5D8',
                            color: '#181E4B', fontSize: '10px', fontWeight: 700
                          }}>
                            {item.countryCode}
                          </span>
                          <span style={{ fontWeight: 600, color: '#181E4B' }}>{item.place}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#5E6282' }}>{item.country}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View Mode 2: Cascading Country -> State -> Place Dropdowns */}
          {viewMode === 'cascade' && (
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 1. Country Selection */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#5E6282', textTransform: 'uppercase' }}>
                  1. Country
                </label>
                <select
                  value={selectedCountry.country}
                  onChange={(e) => {
                    const found = POPULAR_LOCATIONS.find(c => c.country === e.target.value);
                    if (found) {
                      setSelectedCountry(found);
                      setSelectedState(found.states[0]?.name || '');
                      setCustomPlace('');
                    }
                  }}
                  style={{
                    width: '100%', marginTop: '4px', padding: '8px 10px',
                    borderRadius: '10px', border: '1px solid #ECE5D8',
                    background: '#FAF6ED', fontSize: '13px', fontWeight: 600,
                    color: '#181E4B', outline: 'none'
                  }}
                >
                  {POPULAR_LOCATIONS.map((c) => (
                    <option key={c.country} value={c.country}>
                      [{c.countryCode}] {c.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. State Selection */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#5E6282', textTransform: 'uppercase' }}>
                  2. State / Region
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setCustomPlace('');
                  }}
                  style={{
                    width: '100%', marginTop: '4px', padding: '8px 10px',
                    borderRadius: '10px', border: '1px solid #ECE5D8',
                    background: '#FAF6ED', fontSize: '13px', fontWeight: 600,
                    color: '#181E4B', outline: 'none'
                  }}
                >
                  <option value="">Select a State / Region</option>
                  {selectedCountry.states.map((st) => (
                    <option key={st.name} value={st.name}>
                      {st.name} ({st.places.length} places)
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Place / City Selection */}
              {selectedState && (
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#5E6282', textTransform: 'uppercase' }}>
                    3. Highlighted Place / City
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', maxHeight: '110px', overflowY: 'auto' }}>
                    {selectedCountry.states.find(s => s.name === selectedState)?.places.map((place) => {
                      const isSel = customPlace === place;
                      return (
                        <button
                          key={place}
                          type="button"
                          onClick={() => setCustomPlace(place)}
                          style={{
                            padding: '4px 10px', borderRadius: '14px', fontSize: '11px',
                            fontWeight: 600, border: '1px solid', cursor: 'pointer',
                            background: isSel ? '#DF6951' : '#FAF6ED',
                            color: isSel ? '#fff' : '#181E4B',
                            borderColor: isSel ? '#DF6951' : '#ECE5D8',
                          }}
                        >
                          {place}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Or type specific town / landmark..."
                    value={customPlace}
                    onChange={(e) => setCustomPlace(e.target.value)}
                    style={{
                      width: '100%', marginTop: '8px', padding: '7px 10px',
                      borderRadius: '8px', border: '1px solid #ECE5D8',
                      background: '#FAF6ED', fontSize: '12px', outline: 'none'
                    }}
                  />
                </div>
              )}

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApplyCascade}
                style={{
                  marginTop: '6px', padding: '10px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #DF6951, #F1A501)',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Check size={14} /> Apply Location
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
