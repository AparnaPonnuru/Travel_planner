import { buildCompleteItinerary } from '../ai/engine';
import { dbTrips } from './index';

export function seedInitialDataIfNeeded() {
  const existing = dbTrips.listAll();
  if (existing.length === 0) {
    const keralaTrip = buildCompleteItinerary({
      userId: 'demo-user-1',
      destination: 'Kerala',
      origin: 'Hyderabad',
      startDate: '2026-12-12',
      durationDays: 5,
      travelers: {
        adults: 3,
        children: 0,
        infants: 0,
        partyType: 'friends'
      },
      budget: {
        tier: 'moderate',
        total: 60000,
        currency: 'INR',
        includesTravelToOrigin: true,
        contingencyPercent: 8
      },
      travelStyles: ['relaxed', 'nature', 'spiritual', 'food-focused'],
      interests: ['beaches', 'nature', 'temples', 'food'],
      accommodationPreference: {
        type: 'hotel',
        features: ['central-location', 'cleanliness']
      },
      transportPreferences: {
        primary: 'train',
        local: 'local taxi',
        priority: 'balanced'
      },
      specialRequirements: {
        hardConstraints: ['Pre-dawn temple visit before 6 AM'],
        softPreferences: ['Sea view or green view if feasible', 'Authentic regional Kerala dining', 'No hectic schedule']
      }
    });

    // Custom flagship attributes
    keralaTrip.id = 'trip-kerala-flagship';
    keralaTrip.shareId = 'share-kerala-flagship';
    keralaTrip.title = 'Kerala Highlights & Serene Backwaters';
    dbTrips.create(keralaTrip);
  }
}
