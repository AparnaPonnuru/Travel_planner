export interface DestinationCoord {
  name: string;
  country: string;
  lat: number;
  lng: number;
  currency: string;
  typicalDailyCostMidrange: number;
  bestMonths: string[];
}

export const DESTINATION_COORDINATES: Record<string, DestinationCoord> = {
  // India
  'kerala': { name: 'Kerala', country: 'India', lat: 9.9312, lng: 76.2673, currency: 'INR', typicalDailyCostMidrange: 4500, bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'] },
  'kochi': { name: 'Kochi (Cochin)', country: 'India', lat: 9.9312, lng: 76.2673, currency: 'INR', typicalDailyCostMidrange: 4000, bestMonths: ['October', 'November', 'December', 'January', 'February'] },
  'munnar': { name: 'Munnar', country: 'India', lat: 10.0889, lng: 77.0595, currency: 'INR', typicalDailyCostMidrange: 4200, bestMonths: ['September', 'October', 'November', 'December', 'January', 'February', 'March'] },
  'alleppey': { name: 'Alleppey (Alappuzha)', country: 'India', lat: 9.4981, lng: 76.3388, currency: 'INR', typicalDailyCostMidrange: 5500, bestMonths: ['October', 'November', 'December', 'January', 'February'] },
  'thekkady': { name: 'Thekkady', country: 'India', lat: 9.6031, lng: 77.1615, currency: 'INR', typicalDailyCostMidrange: 4000, bestMonths: ['October', 'November', 'December', 'January', 'February'] },
  'kovalam': { name: 'Kovalam', country: 'India', lat: 8.4004, lng: 76.9787, currency: 'INR', typicalDailyCostMidrange: 4800, bestMonths: ['November', 'December', 'January', 'February'] },
  'goa': { name: 'Goa', country: 'India', lat: 15.2993, lng: 74.1240, currency: 'INR', typicalDailyCostMidrange: 5000, bestMonths: ['November', 'December', 'January', 'February'] },
  'jaipur': { name: 'Jaipur', country: 'India', lat: 26.9124, lng: 75.7873, currency: 'INR', typicalDailyCostMidrange: 4500, bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'] },
  'udaipur': { name: 'Udaipur', country: 'India', lat: 24.5854, lng: 73.7125, currency: 'INR', typicalDailyCostMidrange: 5200, bestMonths: ['October', 'November', 'December', 'January', 'February'] },
  'hyderabad': { name: 'Hyderabad', country: 'India', lat: 17.3850, lng: 78.4867, currency: 'INR', typicalDailyCostMidrange: 3500, bestMonths: ['October', 'November', 'December', 'January', 'February'] },
  'bangalore': { name: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, currency: 'INR', typicalDailyCostMidrange: 4000, bestMonths: ['September', 'October', 'November', 'December', 'January', 'February'] },
  'delhi': { name: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090, currency: 'INR', typicalDailyCostMidrange: 4500, bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'] },
  'mumbai': { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, currency: 'INR', typicalDailyCostMidrange: 5500, bestMonths: ['November', 'December', 'January', 'February'] },
  'varanasi': { name: 'Varanasi', country: 'India', lat: 25.3176, lng: 82.9739, currency: 'INR', typicalDailyCostMidrange: 3200, bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'] },
  'ladakh': { name: 'Ladakh', country: 'India', lat: 34.1526, lng: 77.5771, currency: 'INR', typicalDailyCostMidrange: 5000, bestMonths: ['June', 'July', 'August', 'September'] },

  // International
  'tokyo': { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, currency: 'JPY', typicalDailyCostMidrange: 16000, bestMonths: ['March', 'April', 'May', 'October', 'November'] },
  'japan': { name: 'Japan', country: 'Japan', lat: 35.6762, lng: 139.6503, currency: 'JPY', typicalDailyCostMidrange: 16000, bestMonths: ['March', 'April', 'May', 'October', 'November'] },
  'kyoto': { name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681, currency: 'JPY', typicalDailyCostMidrange: 15000, bestMonths: ['March', 'April', 'October', 'November'] },
  'paris': { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, currency: 'EUR', typicalDailyCostMidrange: 180, bestMonths: ['April', 'May', 'June', 'September', 'October'] },
  'bali': { name: 'Bali', country: 'Indonesia', lat: -8.4095, lng: 115.1889, currency: 'USD', typicalDailyCostMidrange: 85, bestMonths: ['April', 'May', 'June', 'July', 'August', 'September'] },
  'dubai': { name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, currency: 'AED', typicalDailyCostMidrange: 650, bestMonths: ['November', 'December', 'January', 'February', 'March'] },
  'rome': { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, currency: 'EUR', typicalDailyCostMidrange: 160, bestMonths: ['April', 'May', 'September', 'October'] },
  'london': { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, currency: 'GBP', typicalDailyCostMidrange: 160, bestMonths: ['May', 'June', 'July', 'August', 'September'] },
  'swiss alps': { name: 'Swiss Alps (Interlaken)', country: 'Switzerland', lat: 46.6863, lng: 7.8632, currency: 'EUR', typicalDailyCostMidrange: 240, bestMonths: ['December', 'January', 'February', 'June', 'July', 'August'] }
};

export function getDestinationCoords(query: string): { name: string; lat: number; lng: number; country: string } {
  const q = query.toLowerCase().trim();
  for (const [key, value] of Object.entries(DESTINATION_COORDINATES)) {
    if (q.includes(key) || key.includes(q)) {
      return { name: value.name, lat: value.lat, lng: value.lng, country: value.country };
    }
  }
  // Default fallback (Kochi/Kerala coordinates if Indian context or central neutral)
  return { name: query, lat: 9.9312, lng: 76.2673, country: 'India' };
}

// Haversine formula to compute great circle distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Realistic travel time estimator
export function estimateTravelTime(distanceKm: number, mode: string = 'car'): { minutes: number; text: string } {
  let avgSpeedKmh = 45; // default hill/city mix
  if (mode === 'flight') avgSpeedKmh = 500;
  else if (mode === 'train') avgSpeedKmh = 60;
  else if (mode === 'walking') avgSpeedKmh = 4.5;
  else if (mode === 'public transit') avgSpeedKmh = 30;

  const rawMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
  // Add terminal/congestion buffer
  const buffer = mode === 'flight' ? 90 : mode === 'train' ? 30 : 15;
  const totalMinutes = Math.max(10, rawMinutes + (distanceKm > 20 ? buffer : 5));

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const text = hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}`.trim() : `${mins} mins`;

  return { minutes: totalMinutes, text };
}
