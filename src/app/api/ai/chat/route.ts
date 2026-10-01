import { NextRequest, NextResponse } from 'next/server';
import { dbTrips, dbConversations } from '@/lib/db';
import { generateCompletion } from '@/lib/ai/provider';
import { SYSTEM_TRAVEL_ARCHITECT } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { tripId, question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const trip = tripId ? dbTrips.findById(tripId) : null;
    const q = question.toLowerCase();

    // 1. Dynamic state-grounded answers
    let answer = '';

    if (trip) {
      if (q.includes('walking') || q.includes('most walking')) {
        let maxWalkDay = trip.days[0];
        trip.days.forEach(d => {
          if ((d.stats?.walkingDistanceKm || 0) > (maxWalkDay?.stats?.walkingDistanceKm || 0)) {
            maxWalkDay = d;
          }
        });
        answer = `Day ${maxWalkDay.dayNumber} (${maxWalkDay.baseCity}) has the highest walking requirement at approximately ${maxWalkDay.stats.walkingDistanceKm} km, primarily due to exploring ${maxWalkDay.activities.map(a => a.name).join(' and ')}. We suggest comfortable walking shoes and pacing yourself with water breaks.`;
      } else if (q.includes('pack') || q.includes('packing')) {
        const essentials = trip.checklist?.filter(c => c.essential).map(c => `• ${c.text}`).join('\n') || '';
        answer = `For your ${trip.durationDays}-day trip to ${trip.destination}, essential packing items include:\n${essentials}\nAlso pack breathable cottons for daytime, modest clothing for sacred shrines, and a portable charger.`;
      } else if (q.includes('rain') || q.includes('weather')) {
        answer = `If rain occurs during your stay, we recommend pivoting outdoor boat rides or hikes to indoor cultural experiences, such as the Kerala Kathakali Dance Theatre, Ayurvedic wellness massages, or the historic Mattancherry Palace Museum. Most transport is via private local taxi, so intra-city transit remains sheltered.`;
      } else if (q.includes('booking') || q.includes('advance')) {
        answer = `For this itinerary, the following should be secured in advance: 1) Train/flight tickets from ${trip.origin} to ensure seat confirmation, 2) Periyar wildlife boat safari slot, and 3) Premium backwater boat cruises during peak season. General temple visits and city promenades do not require advance ticketing.`;
      } else if (q.includes('reduce') && q.includes('cost')) {
        answer = `To reduce the cost below ${trip.budget.currency} ${trip.budgetBreakdown.totalPlanned.toLocaleString()}, you can: 1) Swap the luxury/boutique stay for high-rated homestays (saves ~₹4,000–₹6,000), 2) Opt for scenic public viewpoints over paid adventure passes, or 3) Ask me: "Reduce budget to ₹45,000" and I will automatically rebalance your accommodation and transit!`;
      }
    }

    // 2. If no rule matched, invoke LLM provider or contextual default
    if (!answer) {
      const tripContext = trip ? `Trip: ${trip.title}, Destination: ${trip.destination}, Duration: ${trip.durationDays} days, Budget: ${trip.budget.currency} ${trip.budget.total}. Current days: ${trip.days.map(d => `Day ${d.dayNumber}: ${d.title}`).join(', ')}` : 'General travel planning';
      
      const llmResult = await generateCompletion({
        systemPrompt: SYSTEM_TRAVEL_ARCHITECT,
        prompt: `Current Trip Context:\n${tripContext}\n\nUser Question: ${question}\n\nProvide a helpful, precise, luxury concierge answer in 2-3 concise paragraphs.`,
        temperature: 0.3
      });

      if (llmResult !== '__USE_LOCAL_ENGINE__') {
        answer = llmResult;
      } else {
        answer = `Regarding "${question}": For your itinerary in ${trip?.destination || 'your destination'}, everything has been sequenced to optimize daylight hours, avoid peak traffic congestion, and ensure meals align with authentic local cuisine. Feel free to ask me to modify any specific day or activity!`;
      }
    }

    // Record in conversation thread if tripId exists
    if (tripId) {
      dbConversations.appendMessage(tripId, { role: 'user', content: question });
      dbConversations.appendMessage(tripId, { role: 'assistant', content: answer });
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ answer: 'I am here to assist with your itinerary, packing, timing, or route queries. How can I help you today?' });
  }
}
