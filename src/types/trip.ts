export type TravelStyle = 
  | 'relaxed' 
  | 'balanced' 
  | 'fast-paced' 
  | 'luxury' 
  | 'budget' 
  | 'backpacking' 
  | 'family' 
  | 'romantic' 
  | 'adventure' 
  | 'spiritual' 
  | 'cultural' 
  | 'food-focused' 
  | 'nature' 
  | 'photography' 
  | 'shopping' 
  | 'nightlife' 
  | 'wellness';

export type PartyType = 'solo' | 'couple' | 'family' | 'friends' | 'group';

export type TransportType = 'flight' | 'train' | 'bus' | 'car' | 'rental car' | 'local taxi' | 'public transit' | 'walking' | 'mixed';

export type AccommodationType = 'hotel' | 'resort' | 'hostel' | 'homestay' | 'apartment' | 'no preference';

export interface TravelerConfig {
  adults: number;
  children: number;
  infants: number;
  childrenAges?: number[];
  partyType: PartyType;
  customNotes?: string;
}

export interface BudgetConfig {
  tier: 'budget' | 'moderate' | 'premium' | 'luxury' | 'custom';
  total: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY';
  includesTravelToOrigin: boolean;
  contingencyPercent: number; // default 8-10%
}

export interface Activity {
  id: string;
  name: string;
  category: 'attraction' | 'culture' | 'nature' | 'food' | 'relaxation' | 'travel' | 'shopping' | 'adventure' | 'spiritual';
  description: string;
  startTime: string; // e.g. "09:30"
  endTime: string;   // e.g. "11:30"
  durationMinutes: number;
  estimatedCost: number;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours?: string;
  matchReason?: string; // Why this fits user's style
  distanceFromPreviousKm?: number;
  transitDurationMinutes?: number;
  transitMode?: string;
  bookingRequired?: boolean;
  weatherSensitive?: boolean;
  isCustomAdded?: boolean;
}

export interface MealRecommendation {
  type: 'breakfast' | 'lunch' | 'dinner' | 'tea/snack';
  restaurantName: string;
  cuisine: string;
  location: string;
  estimatedCostPerPerson: number;
  highlightDish?: string;
  coordinates?: { lat: number; lng: number };
}

export interface DayAccommodation {
  name: string;
  type: string;
  location: string;
  checkInTime?: string;
  checkOutTime?: string;
  costPerNight: number;
  coordinates?: { lat: number; lng: number };
  rating?: number;
  rationale: string;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  title: string;
  baseCity: string;
  theme: string;
  weatherForecast?: {
    tempC: number;
    condition: string;
    icon: string;
    rainProbability: number;
    advice: string;
  };
  stats: {
    totalTravelTimeMinutes: number;
    walkingDistanceKm: number;
    estimatedCost: number;
  };
  activities: Activity[];
  meals: MealRecommendation[];
  accommodation?: DayAccommodation;
}

export interface BudgetBreakdown {
  currency: string;
  totalPlanned: number;
  userBudget: number;
  remainingBuffer: number;
  status: 'within-budget' | 'near-budget' | 'over-budget';
  categories: {
    transportation: { amount: number; percentage: number; note: string };
    accommodation: { amount: number; percentage: number; note: string };
    food: { amount: number; percentage: number; note: string };
    activities: { amount: number; percentage: number; note: string };
    localTravel: { amount: number; percentage: number; note: string };
    miscellaneous: { amount: number; percentage: number; note: string };
    contingencyReserve: { amount: number; percentage: number; note: string };
  };
  budgetAlerts?: string[];
  savingTips?: string[];
}

export interface TripRouteSegment {
  from: string;
  to: string;
  distanceKm: number;
  estimatedTime: string;
  mode: TransportType;
  costEstimate: number;
  notes?: string;
}

export interface QualityScore {
  overall: 'Excellent' | 'Good' | 'Fair';
  budgetFit: 'Optimal' | 'Stretch' | 'Tight';
  pace: 'Relaxed' | 'Balanced' | 'Intense';
  efficiency: 'High' | 'Moderate' | 'Challenging';
  constraintMatchRate: number; // e.g. 100%
  notes: string[];
}

export interface ChecklistItem {
  id: string;
  category: 'before_departure' | 'documents' | 'clothing' | 'gadgets' | 'health_safety' | 'destination_specific';
  text: string;
  isDone: boolean;
  essential: boolean;
}

export interface TrainOption {
  trainNumber: string;
  trainName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  originStation: string;
  destinationStation: string;
  frequency: string;
  classes: string[];
  fareRange: string;
}

export interface FlightOption {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fareRange: string;
}

export interface NearbyPlace {
  name: string;
  category: string;
  distanceFromBaseKm: number;
  driveTime: string;
  highlight: string;
  bestTime: string;
}

export interface TransitLegGuidance {
  whenToStart: string;
  whereToBoard: string;
  arrivalDetails: string;
  checkOutBuffer?: string;
}

export interface TransitLeg {
  direction: 'outbound' | 'return';
  title: string;
  from: string;
  to: string;
  distanceKm: number;
  guidance: TransitLegGuidance;
  trains: TrainOption[];
  flights?: FlightOption[];
  roadDetails?: {
    distanceKm: number;
    estimatedDriveTime: string;
    recommendedHalts: string[];
    tollEstimate?: string;
  };
}

export interface TransitOptions {
  originToDestinationDistanceKm: number;
  availableTrains: TrainOption[]; // Legacy/Direct Outbound
  availableFlights?: FlightOption[];
  roadTravelDetails?: {
    distanceKm: number;
    estimatedDriveTime: string;
    recommendedHalts: string[];
    tollEstimate?: string;
  };
  outbound?: TransitLeg;
  returnJourney?: TransitLeg;
}

export interface DestinationOverview {
  totalDistanceCoveredKm: number;
  signatureNearbyPlaces: NearbyPlace[];
  bestSeasonToVisit: string;
  localCuisinePicks: string[];
  essentialLocalTips: string[];
}

export interface TripSnapshot {
  id: string;
  userId?: string;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  durationDays: number;
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
  transitOptions?: TransitOptions;
  destinationOverview?: DestinationOverview;
  aiExplanations: string[];
  routeSequence: string[];
  routeSegments: TripRouteSegment[];
  days: DayItinerary[];
  budgetBreakdown: BudgetBreakdown;
  qualityScore: QualityScore;
  checklist: ChecklistItem[];
  status: 'draft' | 'generated' | 'modifying' | 'finalized';
  version: number;
  shareId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripVersionItem {
  versionNumber: number;
  timestamp: string;
  changeSummary: string;
  snapshot: TripSnapshot;
}

export interface ModificationResult {
  appliedChanges: {
    summary: string;
    added: string[];
    removed: string[];
    modified: string[];
    budgetBefore: number;
    budgetAfter: number;
    walkingBeforeKm?: number;
    walkingAfterKm?: number;
  };
  explanation: string;
  updatedTrip: TripSnapshot;
}
