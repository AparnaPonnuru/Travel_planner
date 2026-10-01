import { NextRequest, NextResponse } from 'next/server';

interface RecommendRequest {
  budget: number;
  currency: string;
  seasonOrMonth: string;
  travelStyle: string[];
  partyType: string;
  startingLocation: string;
}

export async function POST(req: NextRequest) {
  try {
    const { budget, currency, seasonOrMonth, travelStyle, partyType, startingLocation }: RecommendRequest = await req.json();

    const styles = travelStyle || ['nature', 'relaxed'];
    const recommendations = [];

    // Kerala recommendation
    if (styles.includes('nature') || styles.includes('relaxed') || styles.includes('spiritual') || styles.includes('wellness')) {
      recommendations.push({
        id: 'kerala',
        name: 'Kerala, India',
        tagline: "God's Own Country: Backwaters, Mist-clad Tea Valleys & Ancient Temples",
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
        estimatedCost: `${currency || 'INR'} 45,000 - 65,000`,
        bestSeason: 'October to March (Pleasant dry breeze)',
        whyRecommended: `Matches your desire for ${styles.join(', ')}. Direct convenient transit from ${startingLocation || 'Hyderabad/Bangalore'}, tranquil backwater canals, and world-renowned spice plantations.`
      });
    }

    // Goa recommendation
    if (styles.includes('beach') || styles.includes('relaxed') || styles.includes('food-focused') || styles.includes('romantic')) {
      recommendations.push({
        id: 'goa',
        name: 'South Goa, India',
        tagline: 'Portuguese Heritage Villas, Pristine Uncrowded Sands & Coastal Seafood',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
        estimatedCost: `${currency || 'INR'} 40,000 - 60,000`,
        bestSeason: 'November to February (Sun & gentle surf)',
        whyRecommended: 'Ideal for peaceful beach strolls, sunset kayaking at Palolem, and pastel Latin-quarter cafes without chaotic nightlife.'
      });
    }

    // Rajasthan / Jaipur recommendation
    if (styles.includes('cultural') || styles.includes('photography') || styles.includes('family') || styles.includes('luxury')) {
      recommendations.push({
        id: 'jaipur',
        name: 'Jaipur & Udaipur, Rajasthan',
        tagline: 'Royal Fortresses, Lake Palaces & Vibrant Artisanal Bazaars',
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
        estimatedCost: `${currency || 'INR'} 50,000 - 75,000`,
        bestSeason: 'October to March (Crisp royal winter)',
        whyRecommended: 'World-heritage fortresses, lakeside heritage boutique hotels, and authentic Rajasthani culinary banquets.'
      });
    }

    // International fallback (Tokyo / Bali)
    if (budget > 120000 || currency === 'USD' || currency === 'EUR') {
      recommendations.push({
        id: 'tokyo',
        name: 'Tokyo & Kyoto, Japan',
        tagline: 'Ancient Shrines, Bullet Trains & Culinary Perfection',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        estimatedCost: `${currency || 'USD'} 1,800 - 2,500`,
        bestSeason: 'Spring (Cherry Blossoms) & Autumn (Foliage)',
        whyRecommended: 'Unrivaled public transit efficiency, safe pedestrian avenues, and profound cultural immersion.'
      });
    }

    return NextResponse.json({ recommendations: recommendations.slice(0, 3) });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to recommend destinations' }, { status: 500 });
  }
}
