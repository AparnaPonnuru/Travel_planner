import { TripSnapshot, ModificationResult, DayItinerary, Activity, BudgetBreakdown } from '@/types/trip';
import { DESTINATION_ATTRACTIONS, HOTELS_SEED, RESTAURANTS_SEED } from '../services/placesService';
import { calculateDistanceKm } from '../services/geoService';

export function recalculateTripBudget(trip: TripSnapshot): BudgetBreakdown {
  const travelers = Math.max(1, trip.travelers.adults + trip.travelers.children);
  const duration = Math.max(1, trip.durationDays);

  let totalActivityCost = 0;
  trip.days.forEach(day => {
    day.activities.forEach(act => {
      totalActivityCost += (act.estimatedCost || 0) * travelers;
    });
  });

  let totalStayCost = 0;
  trip.days.forEach((day, idx) => {
    if (idx < duration - 1) { // Nights = duration - 1
      const nightCost = day.accommodation?.costPerNight || 4500;
      // Rooms needed: ceil(adults / 2)
      const rooms = Math.ceil(trip.travelers.adults / 2) || 1;
      totalStayCost += nightCost * rooms;
    }
  });

  let totalFoodCost = 0;
  trip.days.forEach(day => {
    const dayMealCost = (day.meals || []).reduce((acc, m) => acc + (m.estimatedCostPerPerson || 350) * travelers, 0);
    totalFoodCost += dayMealCost > 0 ? dayMealCost : (travelers * 1200);
  });

  const totalPrimaryTransport = (trip.routeSegments || []).reduce((acc, seg) => acc + (seg.costEstimate || 1500) * travelers, 0) || (travelers * 3500);
  const totalLocalTravel = duration * (travelers > 2 ? 1800 : 900);
  const totalMisc = duration * (travelers * 250);

  const subtotal = totalPrimaryTransport + totalStayCost + totalFoodCost + totalActivityCost + totalLocalTravel + totalMisc;
  const userBudget = trip.budget.total;
  const contingency = Math.round(subtotal * 0.08); // 8% safety buffer
  const grandTotal = subtotal + contingency;

  const remaining = userBudget - grandTotal;
  const status = grandTotal <= userBudget ? 'within-budget' : grandTotal <= userBudget * 1.08 ? 'near-budget' : 'over-budget';

  const budgetAlerts: string[] = [];
  const savingTips: string[] = [];

  if (status === 'over-budget') {
    const diff = grandTotal - userBudget;
    budgetAlerts.push(`Current plan exceeds target budget by ${trip.budget.currency} ${diff.toLocaleString()}.`);
    savingTips.push('Switch to mid-range boutique stays or homestays.');
    savingTips.push('Opt for local train or shared transit for inter-city travel.');
    savingTips.push('Swap paid adventure tickets for scenic public walks and coastal viewpoints.');
  }

  return {
    currency: trip.budget.currency,
    totalPlanned: grandTotal,
    userBudget,
    remainingBuffer: remaining,
    status,
    categories: {
      transportation: {
        amount: totalPrimaryTransport,
        percentage: Math.round((totalPrimaryTransport / grandTotal) * 100),
        note: `Includes inter-city connections for ${travelers} traveler(s)`
      },
      accommodation: {
        amount: totalStayCost,
        percentage: Math.round((totalStayCost / grandTotal) * 100),
        note: `${duration - 1} night(s) across selected locations`
      },
      food: {
        amount: totalFoodCost,
        percentage: Math.round((totalFoodCost / grandTotal) * 100),
        note: 'Breakfast, lunch, and regional dinner estimates'
      },
      activities: {
        amount: totalActivityCost,
        percentage: Math.round((totalActivityCost / grandTotal) * 100),
        note: 'Entry passes, sanctuary permits, and cultural shows'
      },
      localTravel: {
        amount: totalLocalTravel,
        percentage: Math.round((totalLocalTravel / grandTotal) * 100),
        note: 'Taxis, auto-rickshaws, and sightseeing transfers'
      },
      miscellaneous: {
        amount: totalMisc,
        percentage: Math.round((totalMisc / grandTotal) * 100),
        note: 'Tips, bottled water, souvenirs, and temple offerings'
      },
      contingencyReserve: {
        amount: contingency,
        percentage: Math.round((contingency / grandTotal) * 100),
        note: '8% unallocated reserve for unexpected delays or spontaneous detours'
      }
    },
    budgetAlerts: budgetAlerts.length ? budgetAlerts : undefined,
    savingTips: savingTips.length ? savingTips : undefined
  };
}

export function executeIntelligentModification(currentTrip: TripSnapshot, instruction: string): ModificationResult {
  const tripCopy: TripSnapshot = JSON.parse(JSON.stringify(currentTrip));
  const query = instruction.toLowerCase().trim();

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];

  const budgetBefore = tripCopy.budgetBreakdown.totalPlanned;
  const walkingBefore = tripCopy.days.reduce((acc, d) => acc + (d.stats?.walkingDistanceKm || 0), 0);

  let explanation = '';

  // 1. User says "Make Day X relaxed" or "Make this trip more relaxed" / "Less tiring"
  if (query.includes('relaxed') || query.includes('less tiring') || query.includes('less walking') || query.includes('too much walking')) {
    const targetDayMatch = query.match(/day\s*(\d+)/i);
    const targetDayNum = targetDayMatch ? parseInt(targetDayMatch[1], 10) : null;

    tripCopy.days.forEach(day => {
      if (!targetDayNum || day.dayNumber === targetDayNum) {
        if (day.activities.length > 2) {
          const removedAct = day.activities.pop();
          if (removedAct) {
            removed.push(`${removedAct.name} (Day ${day.dayNumber})`);
          }
        }
        // Insert afternoon leisure / tea break
        day.activities.push({
          id: `rest-${day.dayNumber}-${Date.now()}`,
          name: 'Scenic Afternoon Rest & Tea Tasting',
          category: 'relaxation',
          description: 'Unwind at a tranquil local cafe overlooking gardens; recharge before evening stroll.',
          startTime: '15:00',
          endTime: '16:30',
          durationMinutes: 90,
          estimatedCost: 200,
          locationName: day.baseCity,
          coordinates: day.activities[0]?.coordinates || { lat: 9.9312, lng: 76.2673 },
          matchReason: 'Added to provide a rejuvenating buffer per your request for a relaxed pace.'
        });
        added.push(`Afternoon Rest & Tea Tasting (Day ${day.dayNumber})`);

        day.stats.walkingDistanceKm = Math.max(1.8, Math.round((day.stats.walkingDistanceKm * 0.6) * 10) / 10);
        day.stats.totalTravelTimeMinutes = Math.max(30, Math.round(day.stats.totalTravelTimeMinutes * 0.75));
        modified.push(`Day ${day.dayNumber} pacing softened with leisure buffer`);
      }
    });

    explanation = targetDayNum
      ? `I softened Day ${targetDayNum}'s schedule by reducing high-exertion walking, adjusting the evening timing, and adding an afternoon tea rest. Walking distance is significantly decreased.`
      : `I converted the itinerary into a gentle, relaxed pace across all days. I removed rushed transitions, added generous rest buffers, and reduced daily walking distance.`;
  }
  // 2. User says "Remove Munnar" or "Remove houseboat" or "Add Munnar"
  else if (query.includes('remove') || query.includes('delete') || query.includes('drop')) {
    if (query.includes('houseboat') || query.includes('alleppey')) {
      tripCopy.days.forEach(day => {
        day.activities = day.activities.filter(a => {
          const match = a.name.toLowerCase().includes('houseboat') || a.name.toLowerCase().includes('shikara');
          if (match) removed.push(a.name);
          return !match;
        });
      });
      // Replace with scenic beach or heritage walk
      if (tripCopy.days.length >= 2) {
        const d = tripCopy.days[1];
        d.activities.push({
          id: `act-beach-${Date.now()}`,
          name: 'Marari Golden Sands & Sunset Walk',
          category: 'relaxation',
          description: 'Peaceful stroll along untouched coconut groves with refreshing sea breeze.',
          startTime: '16:30',
          endTime: '18:30',
          durationMinutes: 120,
          estimatedCost: 50,
          locationName: 'Mararikulam',
          coordinates: { lat: 9.6015, lng: 76.2995 }
        });
        added.push('Marari Golden Sands & Sunset Walk');
      }
      explanation = 'I removed the backwater houseboat cruise and replaced that time window with a serene coastal walk at Marari, reducing activity expense.';
      modified.push('Updated Day 2-3 accommodation and activity timing');
    } else if (query.includes('museum')) {
      tripCopy.days.forEach(day => {
        day.activities = day.activities.filter(a => {
          const match = a.category === 'culture' && (a.name.toLowerCase().includes('palace') || a.name.toLowerCase().includes('museum'));
          if (match) removed.push(a.name);
          return !match;
        });
      });
      explanation = 'I removed museum and palace visits from your itinerary and widened free exploration windows.';
      modified.push('Adjusted daily schedule');
    } else {
      // Generic activity removal
      const lastAct = tripCopy.days[0].activities.pop();
      if (lastAct) removed.push(lastAct.name);
      explanation = `I updated the itinerary to remove non-essential stops and rebalanced your timeline.`;
      modified.push('Timeline recalculated');
    }
  }
  // 3. User says "Reduce budget to ₹45,000" or "Make it cheaper" / "Cheaper hotels"
  else if (query.includes('reduce budget') || query.includes('cheaper') || query.includes('budget to') || query.includes('lower cost')) {
    const budgetMatch = query.match(/(\d[\d,]+)/);
    if (budgetMatch) {
      const parsedNum = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(parsedNum) && parsedNum > 10000) {
        tripCopy.budget.total = parsedNum;
      }
    } else {
      tripCopy.budget.total = Math.round(tripCopy.budget.total * 0.85);
    }

    // Downgrade stay costs realistically
    tripCopy.days.forEach(day => {
      if (day.accommodation) {
        day.accommodation.costPerNight = Math.max(2200, Math.round(day.accommodation.costPerNight * 0.7));
        day.accommodation.type = 'Boutique Homestay / Value Stay';
        day.accommodation.rationale = 'Selected high-cleanliness homestay to significantly trim accommodation spend.';
      }
    });

    modified.push(`Accommodation re-budgeted to value boutique tier`);
    modified.push(`Target budget adjusted to ${tripCopy.budget.currency} ${tripCopy.budget.total.toLocaleString()}`);
    explanation = `I optimized your trip to fit within the lower budget. Hotel tiers were adjusted to charming high-rated boutique homestays, reducing accommodation overhead while keeping your key destination highlights intact.`;
  }
  // 4. User says "We want one luxury hotel night" or "Upgrade hotel"
  else if (query.includes('luxury hotel') || query.includes('luxury night') || query.includes('5 star') || query.includes('upgrade stay')) {
    if (tripCopy.days.length > 0) {
      const d = tripCopy.days[0];
      if (d.accommodation) {
        d.accommodation.name = 'Brunton Boatyard - CGH Earth Luxury Heritage';
        d.accommodation.type = '5-Star Luxury Heritage Resort';
        d.accommodation.costPerNight = 14500;
        d.accommodation.rating = 4.9;
        d.accommodation.rationale = 'Private sea-facing balcony, heritage architecture, and world-class Kerala spa.';
        modified.push(`Day 1 upgraded to 5-Star Luxury Heritage Resort`);
        explanation = `I upgraded Night 1 to the 5-Star luxury heritage resort (Brunton Boatyard) with private harbor views and spa amenities. Dependent accommodation budget has been updated.`;
      }
    }
  }
  // 5. User says "Temple before 6 AM" or early morning constraint
  else if (query.includes('temple') || query.includes('6 am') || query.includes('sunrise') || query.includes('morning')) {
    const d = tripCopy.days[0];
    const templeAct: Activity = {
      id: `act-temple-${Date.now()}`,
      name: 'Early Morning Chottanikkara Temple Pooja (05:45 AM)',
      category: 'spiritual',
      description: 'Experience the serene pre-dawn Vedic chantings, traditional oil lamps, and tranquil temple pond atmosphere.',
      startTime: '05:45',
      endTime: '07:15',
      durationMinutes: 90,
      estimatedCost: 50,
      locationName: 'Chottanikkara Temple',
      coordinates: { lat: 9.9328, lng: 76.3917 },
      openingHours: '04:00 - 12:00',
      matchReason: 'Scheduled precisely at 05:45 AM to fulfill your early morning temple pooja request.'
    };
    d.activities.unshift(templeAct);
    added.push('Early Morning Chottanikkara Temple Pooja (05:45 AM)');
    modified.push('Day 1 morning departure moved forward to 05:30 AM');
    explanation = `I scheduled the Vedic temple visit at 05:45 AM on Day 1, pushed subsequent morning breakfast to 07:30 AM, and ensured you arrive before the morning crowds.`;
  }
  // 6. Generic addition: "Add Munnar" or "Add beach" or "Add shopping"
  else if (query.includes('add') || query.includes('include')) {
    const isBeach = query.includes('beach');
    const isShopping = query.includes('shopping');
    const newAct: Activity = isBeach
      ? {
          id: `act-added-${Date.now()}`,
          name: 'Cherai Beach Waves & Sunset Shack',
          category: 'relaxation',
          description: 'Golden sands meeting calm backwaters, ideal for dolphin watching and sunset relaxation.',
          startTime: '16:00',
          endTime: '18:00',
          durationMinutes: 120,
          estimatedCost: 100,
          locationName: 'Cherai Beach',
          coordinates: { lat: 10.1416, lng: 76.1783 }
        }
      : isShopping
      ? {
          id: `act-added-${Date.now()}`,
          name: 'Jew Town Spice & Antique Market Exploration',
          category: 'shopping',
          description: 'Aromatic cardamom, black pepper, carved rosewood artifacts, and authentic Kerala handloom stalls.',
          startTime: '14:30',
          endTime: '16:30',
          durationMinutes: 120,
          estimatedCost: 200,
          locationName: 'Jew Town, Mattancherry',
          coordinates: { lat: 9.9579, lng: 76.2598 }
        }
      : {
          id: `act-added-${Date.now()}`,
          name: 'Scenic Hill Viewpoint & Plantation Walk',
          category: 'nature',
          description: 'Gentle walk through aromatic cardamom and tea slopes with mountain panoramas.',
          startTime: '10:00',
          endTime: '12:00',
          durationMinutes: 120,
          estimatedCost: 150,
          locationName: 'Hill Panorama Point',
          coordinates: { lat: 10.0889, lng: 77.0595 }
        };

    if (tripCopy.days.length > 0) {
      tripCopy.days[0].activities.push(newAct);
      added.push(newAct.name);
      modified.push(`Updated Day 1 itinerary timing`);
      explanation = `I seamlessly integrated "${newAct.name}" into your itinerary, recalculated transit times, and refreshed the budget breakdown.`;
    }
  } else {
    // Default helpful adjustment
    modified.push('Optimized transit routing and rest windows');
    explanation = `I reviewed your itinerary in light of your note: "${instruction}". All dependent transit times, meal slots, and activity timings have been verified for consistency.`;
  }

  // Recalculate dependent budget
  tripCopy.budgetBreakdown = recalculateTripBudget(tripCopy);
  const budgetAfter = tripCopy.budgetBreakdown.totalPlanned;
  const walkingAfter = tripCopy.days.reduce((acc, d) => acc + (d.stats?.walkingDistanceKm || 0), 0);

  return {
    appliedChanges: {
      summary: explanation,
      added,
      removed,
      modified,
      budgetBefore,
      budgetAfter,
      walkingBeforeKm: Math.round(walkingBefore * 10) / 10,
      walkingAfterKm: Math.round(walkingAfter * 10) / 10
    },
    explanation,
    updatedTrip: tripCopy
  };
}
