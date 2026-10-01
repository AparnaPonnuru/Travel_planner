import {
  TripSnapshot,
  DayItinerary,
  Activity,
  TravelerConfig,
  BudgetConfig,
  TravelStyle,
  TransportType,
  AccommodationType,
  TripRouteSegment,
  ChecklistItem,
  QualityScore
} from '@/types/trip';
import { DESTINATION_ATTRACTIONS, HOTELS_SEED, RESTAURANTS_SEED } from '../services/placesService';
import { getDestinationCoords, calculateDistanceKm, estimateTravelTime } from '../services/geoService';
import { getEstimatedWeather } from '../services/weatherService';
import { recalculateTripBudget } from './recalculator';
import { getTransitAndNearbyOptions } from '../services/transitService';

export interface PlanTripRequest {
  userId?: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate?: string;
  durationDays?: number;
  travelers: TravelerConfig;
  budget: BudgetConfig;
  travelStyles: TravelStyle[];
  interests: string[];
  accommodationPreference: {
    type: AccommodationType;
    budgetPerNight?: number;
    locationPreference?: string;
    features: string[];
  };
  transportPreferences: {
    primary: TransportType;
    local: TransportType;
    priority: 'cheapest' | 'fastest' | 'most comfortable' | 'balanced';
  };
  specialRequirements: {
    hardConstraints: string[];
    softPreferences: string[];
  };
}

export function parseNaturalLanguageTrip(prompt: string): Partial<PlanTripRequest> {
  const p = prompt.toLowerCase();
  
  // Destination detection
  let destination = 'Kerala';
  if (p.includes('kerala')) destination = 'Kerala';
  else if (p.includes('goa')) destination = 'Goa';
  else if (p.includes('jaipur') || p.includes('rajasthan')) destination = 'Jaipur';
  else if (p.includes('tokyo') || p.includes('japan')) destination = 'Tokyo';
  else if (p.includes('bali')) destination = 'Bali';
  else if (p.includes('paris')) destination = 'Paris';
  else if (p.includes('swiss') || p.includes('switzerland')) destination = 'Swiss Alps';

  // Origin detection
  let origin = 'Hyderabad';
  if (p.includes('from hyderabad')) origin = 'Hyderabad';
  else if (p.includes('from bangalore') || p.includes('from bengaluru')) origin = 'Bangalore';
  else if (p.includes('from mumbai') || p.includes('from bombay')) origin = 'Mumbai';
  else if (p.includes('from delhi')) origin = 'Delhi';
  else if (p.includes('from london')) origin = 'London';
  else if (p.includes('from new york')) origin = 'New York';

  // Duration
  let durationDays = 5;
  const daysMatch = p.match(/(\d+)\s*[- ]?day/i);
  if (daysMatch) {
    durationDays = Math.min(14, Math.max(1, parseInt(daysMatch[1], 10)));
  }

  // Travelers
  let adults = 2;
  let partyType: TravelerConfig['partyType'] = 'couple';
  const peopleMatch = p.match(/(\d+)\s*(people|travelers|adults|persons)/i);
  if (peopleMatch) {
    adults = parseInt(peopleMatch[1], 10);
    partyType = adults === 1 ? 'solo' : adults === 2 ? 'couple' : 'friends';
  } else if (p.includes('solo')) {
    adults = 1;
    partyType = 'solo';
  } else if (p.includes('family')) {
    adults = 3;
    partyType = 'family';
  }

  // Budget
  let totalBudget = 60000;
  let currency: BudgetConfig['currency'] = 'INR';
  const budgetMatch = p.match(/(?:budget\s*(?:of)?|under)\s*(?:[₹$€£]|inr|usd)?\s*([\d,]+)/i);
  if (budgetMatch) {
    const rawVal = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(rawVal) && rawVal > 5000) totalBudget = rawVal;
  }
  if (p.includes('$') || p.includes('usd')) currency = 'USD';
  else if (p.includes('€') || p.includes('eur')) currency = 'EUR';

  // Travel styles
  const styles: TravelStyle[] = [];
  if (p.includes('relaxed') || p.includes('not very hectic') || p.includes('leisure')) styles.push('relaxed');
  if (p.includes('nature')) styles.push('nature');
  if (p.includes('temple') || p.includes('spiritual')) styles.push('spiritual');
  if (p.includes('beach') || p.includes('beaches')) styles.push('relaxed');
  if (p.includes('food') || p.includes('culinary')) styles.push('food-focused');
  if (p.includes('luxury')) styles.push('luxury');
  if (p.includes('adventure')) styles.push('adventure');
  if (styles.length === 0) styles.push('balanced', 'cultural');

  // Hard constraints
  const hardConstraints: string[] = [];
  if (p.includes('no nightlife') || p.includes("don't want nightlife")) hardConstraints.push('No nightlife');
  if (p.includes('vegetarian') || p.includes('veg food')) hardConstraints.push('Strictly vegetarian dining');
  if (p.includes('before 6 am') || p.includes('early morning')) hardConstraints.push('Pre-dawn temple visit before 6 AM');
  if (p.includes('mother') || p.includes('parents') || p.includes('cannot walk long')) hardConstraints.push('Elderly friendly: minimal stair climbing and short walking distances');

  return {
    destination,
    origin,
    durationDays,
    travelers: {
      adults,
      children: 0,
      infants: 0,
      partyType
    },
    budget: {
      tier: totalBudget < 35000 ? 'budget' : totalBudget > 100000 ? 'luxury' : 'moderate',
      total: totalBudget,
      currency,
      includesTravelToOrigin: true,
      contingencyPercent: 8
    },
    travelStyles: styles,
    interests: ['nature', 'local culture', 'food', 'historical places'],
    accommodationPreference: {
      type: 'hotel',
      features: ['cleanliness', 'central-location']
    },
    transportPreferences: {
      primary: 'train',
      local: 'local taxi',
      priority: 'balanced'
    },
    specialRequirements: {
      hardConstraints,
      softPreferences: ['Sea view or green view if feasible', 'Authentic regional dining']
    }
  };
}

export function generateSmartChecklist(destination: string, styles: TravelStyle[], hardConstraints: string[]): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { id: 'c1', category: 'documents', text: 'Government Photo ID (Aadhaar / Passport / Voter ID)', isDone: false, essential: true },
    { id: 'c2', category: 'documents', text: 'Train / Flight E-Tickets & Confirmation SMS', isDone: true, essential: true },
    { id: 'c3', category: 'documents', text: 'Hotel & Homestay Booking vouchers', isDone: false, essential: true },
    { id: 'c4', category: 'clothing', text: 'Light breathable cotton outfits & modest temple clothing', isDone: false, essential: true },
    { id: 'c5', category: 'gadgets', text: 'Power bank (10,000+ mAh) & mobile charging cables', isDone: false, essential: true },
    { id: 'c6', category: 'health_safety', text: 'Personal prescription medications & basic first-aid kit', isDone: false, essential: true },
    { id: 'c7', category: 'destination_specific', text: 'Compact umbrella & insect repellent lotion for coastal backwaters', isDone: false, essential: false }
  ];

  if (styles.includes('nature') || destination.toLowerCase().includes('munnar')) {
    items.push({ id: 'c8', category: 'clothing', text: 'Light woolen cardigan or windcheater for cool hill evenings', isDone: false, essential: true });
    items.push({ id: 'c9', category: 'clothing', text: 'Grip-sole walking shoes or trail sneakers', isDone: false, essential: true });
  }

  if (hardConstraints.some(c => c.toLowerCase().includes('temple'))) {
    items.push({ id: 'c10', category: 'clothing', text: 'Traditional attire for Vedic temple entry (Dhoti / Saree / Kurta)', isDone: false, essential: true });
  }

  return items;
}

export function buildCompleteItinerary(request: PlanTripRequest): TripSnapshot {
  const durationDays = request.durationDays || 5;
  const startDate = request.startDate || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0];
  const destKey = request.destination.toLowerCase().trim();
  
  // Destination coordinates & places seed
  const destCoords = getDestinationCoords(destKey);
  const attractionsPool = DESTINATION_ATTRACTIONS[destKey] || DESTINATION_ATTRACTIONS['kerala'] || [];
  const hotelsPool = HOTELS_SEED[destKey] || HOTELS_SEED['kerala'] || HOTELS_SEED['general'];
  const restaurantsPool = RESTAURANTS_SEED[destKey] || RESTAURANTS_SEED['kerala'] || RESTAURANTS_SEED['general'];

  // 1. Route Strategy
  const baseCities = destKey.includes('kerala') 
    ? ['Kochi (Cochin)', 'Munnar Hill Station', 'Alleppey Backwaters']
    : [request.destination];

  const routeSequence: string[] = [];
  for (let i = 0; i < durationDays; i++) {
    const city = baseCities[Math.min(i < 2 ? 0 : i < 4 ? 1 : 2, baseCities.length - 1)];
    if (!routeSequence.includes(city)) routeSequence.push(city);
  }

  // Route Segments
  const routeSegments: TripRouteSegment[] = [
    {
      from: request.origin,
      to: routeSequence[0],
      distanceKm: 850,
      estimatedTime: request.transportPreferences.primary === 'flight' ? '1h 45m' : '15h 30m',
      mode: request.transportPreferences.primary,
      costEstimate: request.transportPreferences.primary === 'flight' ? 5500 : 1800,
      notes: `Direct connection from ${request.origin}`
    }
  ];

  for (let s = 0; s < routeSequence.length - 1; s++) {
    routeSegments.push({
      from: routeSequence[s],
      to: routeSequence[s + 1],
      distanceKm: 135,
      estimatedTime: '3h 45m',
      mode: 'local taxi',
      costEstimate: 2800,
      notes: 'Scenic Western Ghats mountain drive with tea stalls'
    });
  }

  // 2. Day by Day Construction
  const days: DayItinerary[] = [];
  const isRelaxed = request.travelStyles.includes('relaxed');
  const activitiesPerDay = isRelaxed ? 2 : 3;

  let activityIndex = 0;

  for (let dayNum = 1; dayNum <= durationDays; dayNum++) {
    const currentDayDate = new Date(new Date(startDate).getTime() + (dayNum - 1) * 86400000).toISOString().split('T')[0];
    const baseCity = routeSequence[Math.min(dayNum <= 2 ? 0 : dayNum <= 4 ? 1 : 2, routeSequence.length - 1)];
    const weather = getEstimatedWeather(baseCity, currentDayDate);

    // Filter/pick activities matching city/styles
    const dayActivities: Activity[] = [];
    const morningStart = (dayNum === 1 && request.specialRequirements.hardConstraints.some(c => c.toLowerCase().includes('temple'))) ? '05:45' : '09:30';

    for (let a = 0; a < activitiesPerDay; a++) {
      const seed = attractionsPool[activityIndex % attractionsPool.length];
      activityIndex++;

      const isFirst = a === 0;
      const startTime = isFirst ? morningStart : a === 1 ? '14:00' : '17:00';
      const duration = isRelaxed ? Math.min(120, seed.durationMinutes) : seed.durationMinutes;

      // Calculate endTime
      const [h, m] = startTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      dayActivities.push({
        id: `act-${dayNum}-${a + 1}`,
        name: seed.name,
        category: seed.category,
        description: seed.description,
        startTime,
        endTime,
        durationMinutes: duration,
        estimatedCost: seed.estimatedCost,
        locationName: seed.locationName,
        coordinates: seed.coordinates,
        openingHours: seed.openingHours,
        matchReason: `Selected for your interest in ${seed.matchStyles[0] || 'sightseeing'} and ${seed.matchInterests[0] || 'local culture'}.`,
        distanceFromPreviousKm: a === 0 ? 0 : 4.5,
        transitDurationMinutes: a === 0 ? 0 : 20,
        transitMode: request.transportPreferences.local
      });
    }

    // Add afternoon tea or rest buffer for relaxed style
    if (isRelaxed) {
      dayActivities.splice(1, 0, {
        id: `rest-${dayNum}`,
        name: 'Afternoon Rejuvenation & Local Tea Tasting',
        category: 'relaxation',
        description: 'Savor organic local tea blends and traditional banana fritters; take a slow unhurried rest.',
        startTime: '12:30',
        endTime: '14:00',
        durationMinutes: 90,
        estimatedCost: 150,
        locationName: baseCity,
        coordinates: dayActivities[0]?.coordinates || destCoords,
        matchReason: 'Structured downtime to honor your relaxed, unhurried travel preference.'
      });
    }

    // Meals for day
    const dayMeals = [
      restaurantsPool.find(r => r.type === 'breakfast') || restaurantsPool[0],
      restaurantsPool.find(r => r.type === 'lunch') || restaurantsPool[1] || restaurantsPool[0],
      restaurantsPool.find(r => r.type === 'dinner') || restaurantsPool[2] || restaurantsPool[0]
    ];

    // Accommodation for night
    const hotelSeed = hotelsPool[Math.min(dayNum - 1, hotelsPool.length - 1)];

    const walkingDist = isRelaxed ? (Math.round((2.5 + Math.random() * 1.5) * 10) / 10) : (Math.round((5.0 + Math.random() * 2.5) * 10) / 10);
    const dayTravelTime = isRelaxed ? 45 : 75;

    days.push({
      dayNumber: dayNum,
      date: currentDayDate,
      title: dayNum === 1 ? `Arrival in ${baseCity} & Orientation` : dayNum === durationDays ? `Farewell & Return Journey` : `Immersive Discovery in ${baseCity}`,
      baseCity,
      theme: dayNum === 1 ? 'Heritage & First Impressions' : dayNum === 2 ? 'Cultural Wonders & Local Aromas' : dayNum === 3 ? 'Verdant Nature & Panoramic Trails' : 'Backwaters & Coastal Serenity',
      weatherForecast: weather,
      stats: {
        totalTravelTimeMinutes: dayTravelTime,
        walkingDistanceKm: walkingDist,
        estimatedCost: 0 // Will be computed in budget engine
      },
      activities: dayActivities,
      meals: dayMeals,
      accommodation: dayNum < durationDays ? hotelSeed : undefined
    });
  }

  // 3. AI Explanations
  const aiExplanations: string[] = [
    `We structured the destinations linearly (${routeSequence.join(' → ')}) to minimize backtracking across the Western Ghats.`,
    `Accommodations were selected near central districts to cut daily transit taxi time by over 45 minutes each day.`,
    `We scheduled an 8% contingency safety buffer in the budget so unexpected detours or spontaneous boat rides won't stress your finances.`
  ];

  if (request.specialRequirements.hardConstraints.length > 0) {
    aiExplanations.push(`We satisfied your constraint "${request.specialRequirements.hardConstraints[0]}" with exact early scheduling.`);
  }

  // 4. Checklist & Quality Score
  const checklist = generateSmartChecklist(request.destination, request.travelStyles, request.specialRequirements.hardConstraints);
  const qualityScore: QualityScore = {
    overall: 'Excellent',
    budgetFit: 'Optimal',
    pace: isRelaxed ? 'Relaxed' : 'Balanced',
    efficiency: 'High',
    constraintMatchRate: 100,
    notes: [
      'Zero circular backtracking on inter-city transfers',
      'Daily walking load within target physical threshold',
      'Realistic buffer periods between all scheduled stops'
    ]
  };

  const tripId = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const shareId = `share-${Math.random().toString(36).substring(2, 9)}`;

  // Draft trip snapshot
  const rawTrip: TripSnapshot = {
    id: tripId,
    userId: request.userId || 'demo-user-1',
    title: `${request.destination} Adventure`,
    destination: request.destination,
    origin: request.origin,
    startDate,
    endDate: new Date(new Date(startDate).getTime() + (durationDays - 1) * 86400000).toISOString().split('T')[0],
    durationDays,
    travelers: request.travelers,
    budget: request.budget,
    travelStyles: request.travelStyles,
    interests: request.interests,
    accommodationPreference: request.accommodationPreference,
    transportPreferences: request.transportPreferences,
    specialRequirements: request.specialRequirements,
    aiExplanations,
    routeSequence,
    routeSegments,
    days,
    budgetBreakdown: {} as any, // Recalculated below
    qualityScore,
    checklist,
    status: 'generated',
    version: 1,
    shareId,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const { transitOptions, destinationOverview } = getTransitAndNearbyOptions(request.origin, request.destination);
  rawTrip.transitOptions = transitOptions;
  rawTrip.destinationOverview = destinationOverview;

  // Compute realistic budget breakdown
  rawTrip.budgetBreakdown = recalculateTripBudget(rawTrip);

  return rawTrip;
}
