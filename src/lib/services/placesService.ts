import { Activity, DayAccommodation, MealRecommendation, TravelStyle } from '@/types/trip';

export interface DestinationAttractionSeed {
  name: string;
  category: Activity['category'];
  description: string;
  durationMinutes: number;
  estimatedCost: number;
  locationName: string;
  coordinates: { lat: number; lng: number };
  openingHours: string;
  matchStyles: TravelStyle[];
  matchInterests: string[];
  weatherSensitive?: boolean;
}

export const DESTINATION_ATTRACTIONS: Record<string, DestinationAttractionSeed[]> = {
  kerala: [
    {
      name: 'Fort Kochi Heritage Walk & Chinese Fishing Nets',
      category: 'culture',
      description: 'Stroll past colonial Portuguese bungalows, David Hall, and witness fishermen lowering the 14th-century cantilevered Chinese fishing nets over the Arabian Sea at sunset.',
      durationMinutes: 120,
      estimatedCost: 100,
      locationName: 'Fort Kochi Beach Promenade',
      coordinates: { lat: 9.9654, lng: 76.2427 },
      openingHours: '06:00 - 19:30',
      matchStyles: ['relaxed', 'cultural', 'photography'],
      matchInterests: ['historical places', 'photography', 'local culture']
    },
    {
      name: 'Mattancherry Palace (Dutch Palace) & Jewish Synagogue',
      category: 'attraction',
      description: 'Explore the 16th-century palace adorned with rare mythological murals and the serene 1568 Paradesi Synagogue in Jew Town with antique Belgian crystal chandeliers.',
      durationMinutes: 90,
      estimatedCost: 150,
      locationName: 'Jew Town, Mattancherry',
      coordinates: { lat: 9.9579, lng: 76.2598 },
      openingHours: '09:00 - 17:00 (Closed Fri)',
      matchStyles: ['cultural', 'balanced'],
      matchInterests: ['history', 'museums', 'architecture']
    },
    {
      name: 'Chottanikkara Bhagavathy Temple',
      category: 'spiritual',
      description: 'One of the most revered ancient Vedic temples in Kerala dedicated to Goddess Rajarajeswari, known for its tranquil morning pooja and traditional temple architecture.',
      durationMinutes: 75,
      estimatedCost: 50,
      locationName: 'Chottanikkara',
      coordinates: { lat: 9.9328, lng: 76.3917 },
      openingHours: '04:00 - 12:00, 16:00 - 20:30',
      matchStyles: ['spiritual', 'cultural', 'family'],
      matchInterests: ['temples', 'spiritual']
    },
    {
      name: 'Munnar Tea Gardens & Lockhart Viewpoint',
      category: 'nature',
      description: 'Panoramic views across emerald rolling tea plantations, mist-covered ravines, and scenic photography spots overlooking the Sahyadri mountains.',
      durationMinutes: 150,
      estimatedCost: 200,
      locationName: 'Lockhart Gap, Munnar',
      coordinates: { lat: 10.0456, lng: 77.0987 },
      openingHours: '07:00 - 18:00',
      matchStyles: ['nature', 'relaxed', 'photography', 'romantic'],
      matchInterests: ['nature', 'mountains', 'photography'],
      weatherSensitive: true
    },
    {
      name: 'Eravikulam National Park (Rajamalai)',
      category: 'nature',
      description: 'Home to the endangered Nilgiri Tahr and the highest peak in South India (Anamudi). Serene hill trails amidst shola grasslands.',
      durationMinutes: 180,
      estimatedCost: 450,
      locationName: 'Eravikulam, Munnar',
      coordinates: { lat: 10.1500, lng: 77.0600 },
      openingHours: '07:30 - 16:00',
      matchStyles: ['nature', 'adventure', 'family'],
      matchInterests: ['wildlife', 'mountains', 'nature']
    },
    {
      name: 'Periyar Wildlife Sanctuary Boat Safari',
      category: 'adventure',
      description: 'A two-hour tranquil lake cruise through the dense evergreen forest of Periyar tiger reserve, with frequent sightings of wild elephants, sambar, and hornbills.',
      durationMinutes: 120,
      estimatedCost: 550,
      locationName: 'Thekkady Lake',
      coordinates: { lat: 9.5800, lng: 77.1700 },
      openingHours: '07:30 - 15:30',
      matchStyles: ['nature', 'adventure', 'family'],
      matchInterests: ['wildlife', 'nature']
    },
    {
      name: 'Alleppey Backwater Shikara / Houseboat Cruise',
      category: 'relaxation',
      description: 'Glide quietly through narrow palm-fringed canals, duck paddocks, and paddy fields on a traditional thatched-roof Kettuvallam vessel.',
      durationMinutes: 180,
      estimatedCost: 1500,
      locationName: 'Punnamada Jetty, Alleppey',
      coordinates: { lat: 9.5085, lng: 76.3533 },
      openingHours: '08:00 - 17:30',
      matchStyles: ['relaxed', 'romantic', 'family', 'wellness'],
      matchInterests: ['beaches', 'nature', 'hidden gems'],
      weatherSensitive: true
    },
    {
      name: 'Marari Beach & Fisherman Village Visit',
      category: 'relaxation',
      description: 'An untouched, serene coconut-lined beach known for golden sands, fresh sea breeze, and peaceful strolls away from tourist crowds.',
      durationMinutes: 90,
      estimatedCost: 0,
      locationName: 'Mararikulam',
      coordinates: { lat: 9.6015, lng: 76.2995 },
      openingHours: 'Open 24 hours',
      matchStyles: ['relaxed', 'romantic', 'nature'],
      matchInterests: ['beaches', 'photography']
    },
    {
      name: 'Traditional Kathakali & Kalaripayattu Martial Arts Show',
      category: 'culture',
      description: 'Watch ancient Kerala classical dance drama with vivid face painting, followed by thrilling Kalari martial arts weapon demonstrations.',
      durationMinutes: 90,
      estimatedCost: 400,
      locationName: 'Kerala Kathakali Centre, Fort Kochi',
      coordinates: { lat: 9.9678, lng: 76.2445 },
      openingHours: '17:00 - 20:00',
      matchStyles: ['cultural', 'family', 'balanced'],
      matchInterests: ['local culture', 'art', 'historical places']
    }
  ],
  goa: [
    {
      name: 'Basilica of Bom Jesus & Se Cathedral',
      category: 'culture',
      description: 'UNESCO World Heritage baroque church containing the sacred relics of St. Francis Xavier, featuring ornate Portuguese gilded woodwork.',
      durationMinutes: 100,
      estimatedCost: 50,
      locationName: 'Old Goa',
      coordinates: { lat: 15.5009, lng: 73.9116 },
      openingHours: '09:00 - 18:30',
      matchStyles: ['cultural', 'spiritual', 'relaxed'],
      matchInterests: ['historical places', 'architecture', 'temples']
    },
    {
      name: 'Palolem Beach & Kayaking to Butterfly Island',
      category: 'adventure',
      description: 'Crescent-shaped white sand bay flanked by palm headlands, calm waters ideal for leisurely swimming and sea kayaking.',
      durationMinutes: 180,
      estimatedCost: 600,
      locationName: 'Canacona, South Goa',
      coordinates: { lat: 15.0100, lng: 74.0231 },
      openingHours: 'Open 24 hours',
      matchStyles: ['relaxed', 'adventure', 'romantic'],
      matchInterests: ['beaches', 'adventure', 'photography']
    },
    {
      name: 'Fontainhas Latin Quarter Walking Tour',
      category: 'culture',
      description: 'Wander pastel-hued Portuguese villas, terracotta roofs, wrought-iron balconies, and artisan bakeries in Asia’s oldest Latin quarter.',
      durationMinutes: 90,
      estimatedCost: 0,
      locationName: 'Panaji',
      coordinates: { lat: 15.4989, lng: 73.8278 },
      openingHours: '08:00 - 20:00',
      matchStyles: ['cultural', 'photography', 'relaxed'],
      matchInterests: ['photography', 'cafes', 'local culture']
    }
  ],
  jaipur: [
    {
      name: 'Amber Fort & Sheesh Mahal (Palace of Mirrors)',
      category: 'attraction',
      description: 'Perched on rugged Amer hills, this majestic 16th-century fortress features the world-renowned mirror hall and Mughal garden terraces.',
      durationMinutes: 180,
      estimatedCost: 500,
      locationName: 'Amer, Jaipur',
      coordinates: { lat: 26.9855, lng: 75.8513 },
      openingHours: '08:00 - 17:30',
      matchStyles: ['cultural', 'photography', 'balanced'],
      matchInterests: ['historical places', 'architecture']
    },
    {
      name: 'Hawa Mahal & Johari Bazaar Gems Walk',
      category: 'attraction',
      description: 'The iconic 5-storey pink sandstone facade with 953 honeycombed jharokhas, followed by authentic gemstone and textile shopping.',
      durationMinutes: 120,
      estimatedCost: 200,
      locationName: 'Badi Choupad, Pink City',
      coordinates: { lat: 26.9239, lng: 75.8267 },
      openingHours: '09:00 - 17:00',
      matchStyles: ['cultural', 'shopping', 'photography'],
      matchInterests: ['historical places', 'shopping', 'photography']
    }
  ],
  tokyo: [
    {
      name: 'Senso-ji Temple & Nakamise Dori in Asakusa',
      category: 'spiritual',
      description: 'Tokyo’s oldest Buddhist temple founded in 628 AD, framed by the Thunder Gate and a lively traditional market lane.',
      durationMinutes: 120,
      estimatedCost: 300,
      locationName: 'Asakusa, Taito City',
      coordinates: { lat: 35.7148, lng: 139.7967 },
      openingHours: '06:00 - 17:00',
      matchStyles: ['spiritual', 'cultural', 'balanced'],
      matchInterests: ['temples', 'historical places', 'local culture']
    },
    {
      name: 'Shinjuku Gyoen National Garden & Omoide Yokocho',
      category: 'nature',
      description: 'Sprawling imperial landscaped gardens blending traditional Japanese, English, and French styles, followed by dinner in historic lantern alleys.',
      durationMinutes: 150,
      estimatedCost: 500,
      locationName: 'Shinjuku',
      coordinates: { lat: 35.6852, lng: 139.7100 },
      openingHours: '09:00 - 16:30',
      matchStyles: ['relaxed', 'nature', 'food-focused'],
      matchInterests: ['nature', 'food', 'photography']
    }
  ]
};

export const HOTELS_SEED: Record<string, DayAccommodation[]> = {
  kerala: [
    {
      name: 'Brunton Boatyard - CGH Earth',
      type: 'Luxury Heritage Hotel',
      location: 'Fort Kochi Waterfront',
      costPerNight: 12500,
      coordinates: { lat: 9.9680, lng: 76.2410 },
      rating: 4.8,
      rationale: 'Historic harbor views, zero-plastic eco-luxury, walking distance to heritage sites.'
    },
    {
      name: 'Forte Kochi Boutique Hotel',
      type: 'Mid-Range Heritage Boutique',
      location: 'Princess Street, Fort Kochi',
      costPerNight: 5500,
      coordinates: { lat: 9.9660, lng: 76.2435 },
      rating: 4.6,
      rationale: 'Exceptional central location, colonial charm, great value for families and couples.'
    },
    {
      name: 'Tea Valley Resort Munnar',
      type: 'Nature Resort',
      location: 'Pothamedu, Munnar',
      costPerNight: 4200,
      coordinates: { lat: 10.0610, lng: 77.0420 },
      rating: 4.5,
      rationale: 'Overlooks deep tea valley, peaceful environment with mountain trails.'
    },
    {
      name: 'Lake Palace Backwater Resort',
      type: 'Backwater Resort',
      location: 'Chungam, Alleppey',
      costPerNight: 6800,
      coordinates: { lat: 9.5120, lng: 76.3610 },
      rating: 4.7,
      rationale: 'Direct canal access, authentic Kerala Ayurvedic spa, and traditional breakfast.'
    }
  ],
  general: [
    {
      name: 'Grand Central Heritage Hotel',
      type: 'Boutique Hotel',
      location: 'City Center',
      costPerNight: 4500,
      coordinates: { lat: 9.9312, lng: 76.2673 },
      rating: 4.5,
      rationale: 'Central location reduces daily taxi rides, quiet neighborhood with verified high cleanliness.'
    }
  ]
};

export const RESTAURANTS_SEED: Record<string, MealRecommendation[]> = {
  kerala: [
    {
      type: 'breakfast',
      restaurantName: 'Kashi Art Cafe',
      cuisine: 'Continental & Kerala Fusion',
      location: 'Burgher Street, Fort Kochi',
      estimatedCostPerPerson: 350,
      highlightDish: 'Appam with Coconut Stew & Fresh Roast Coffee'
    },
    {
      type: 'lunch',
      restaurantName: 'Grand Pavilion (Traditional Sadya)',
      cuisine: 'Authentic Kerala Traditional',
      location: 'MG Road, Ernakulam',
      estimatedCostPerPerson: 400,
      highlightDish: 'Banana Leaf Vegetarian Sadya with Payasam'
    },
    {
      type: 'dinner',
      restaurantName: 'Seagull Fort Kochi Deck',
      cuisine: 'Coastal Kerala & Grills',
      location: 'Calvathy Road, Fort Kochi',
      estimatedCostPerPerson: 650,
      highlightDish: 'Karimeen Pollichathu & Malabar Parotta'
    },
    {
      type: 'lunch',
      restaurantName: 'Rapsy Restaurant Munnar',
      cuisine: 'Local Hill Cuisine',
      location: 'Main Bazaar, Munnar',
      estimatedCostPerPerson: 250,
      highlightDish: 'Kerala Biryani & Cardamom Tea'
    }
  ],
  general: [
    {
      type: 'breakfast',
      restaurantName: 'The Morning Table',
      cuisine: 'Fresh Local Breakfast',
      location: 'Central Promenade',
      estimatedCostPerPerson: 300,
      highlightDish: 'Chef Fresh Special'
    },
    {
      type: 'lunch',
      restaurantName: 'Bistro Verde',
      cuisine: 'Regional Cuisine & Farm-to-Table',
      location: 'Market District',
      estimatedCostPerPerson: 450,
      highlightDish: 'Daily Seasonal Thali / Platter'
    },
    {
      type: 'dinner',
      restaurantName: 'The Lantern Courtyard',
      cuisine: 'Fine Regional Dining',
      location: 'Old Town Heritage Lane',
      estimatedCostPerPerson: 750,
      highlightDish: 'Signature Chef Tasting Plate'
    }
  ]
};
