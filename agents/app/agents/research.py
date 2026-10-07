"""
🔍 Research Agent
Gathers destination intelligence: culture, weather, best times, key attractions.
"""
from langchain_core.messages import HumanMessage, SystemMessage
from app.config.llm_provider import get_reasoning_llm
import json
import re


RESEARCH_SYSTEM_PROMPT = """You are the Research Agent for VoyageAI, an elite travel planning system.

Your role: Gather comprehensive destination intelligence before the trip planning begins.

For the given destination, you MUST research and provide:
1. **Destination Overview** — geography, climate, culture highlights
2. **Best Time to Visit** — weather patterns, festivals, peak vs off-season
3. **Top Attractions** — categorized (nature, culture, spiritual, adventure, food)
4. **Local Cuisine** — must-try dishes, famous restaurants/street food areas
5. **Cultural Tips** — customs, dress codes, etiquette, language basics
6. **Practical Info** — currency tips, connectivity, typical costs

Format your response as a structured JSON with these exact keys:
{
  "destination_overview": "...",
  "best_season": "October to March",
  "top_attractions": [{"name": "Virupaksha Temple", "category": "culture", "description": "Ancient 7th century shrine", "estimated_time_hours": 2}],
  "local_cuisine": ["Jolada Rotti Oota", "Bisi Bele Bath", "Mango Tree Special Thali"],
  "cultural_tips": ["Remove footwear before entering temple complexes", "Dress conservatively"],
  "practical_info": {"avg_meal_cost": "₹200 - ₹400", "connectivity": "4G/5G available across town", "language": "Kannada, Telugu, Hindi, English"}
}

Be thorough but concise. Return valid JSON inside a ```json ``` block."""


def _clean_and_parse_json(content: str) -> dict:
    text = content.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end+1]
    text = re.sub(r',\s*([\]}])', r'\1', text)
    return json.loads(text)


def _build_fallback_research(destination: str) -> dict:
    dest = destination.split(",")[0].strip()
    return {
        "destination_overview": f"{dest} is one of India's premier travel destinations, renowned for its breathtaking landscapes, timeless heritage monuments, and rich regional culinary traditions.",
        "best_season": "October to March (Pleasant winter climate with cool evenings)",
        "top_attractions": [
            {"name": f"{dest} Historic Temple & Heritage Complex", "category": "Heritage", "description": "Celebrated architectural masterwork and centuries-old spiritual center", "estimated_time_hours": 3},
            {"name": "Scenic River & Sunset Viewpoint", "category": "Nature", "description": "Sweeping natural vantage point overlooking serene water and boulder hills", "estimated_time_hours": 2},
            {"name": "Old Artisan Craft Bazaar", "category": "Culture", "description": "Vibrant market streets with traditional textiles, handicrafts and local delicacies", "estimated_time_hours": 2}
        ],
        "local_cuisine": [
            "Authentic South Indian Regional Thali",
            "Crispy Ghee Roast Dosa with coconut chutney",
            "Local sweet specialties & filter coffee"
        ],
        "cultural_tips": [
            "Remove footwear before stepping onto sanctum sanctorum or temple courtyards",
            "Carry cash or UPI on your phone as small village shops prefer digital UPI or change",
            "Ask politely before photographing local artisans or rituals"
        ],
        "practical_info": {
            "avg_meal_cost": "₹180 – ₹400 per person",
            "connectivity": "Strong 4G/5G mobile data coverage",
            "language": "Telugu, Kannada, Hindi, English widely understood"
        }
    }


async def run_research_agent(destination: str, travel_styles: list[str], interests: list[str]) -> dict:
    """Execute the Research Agent to gather destination intelligence."""
    llm = get_reasoning_llm()

    prompt = f"""Research the following destination for trip planning:

**Destination:** {destination}
**Traveler Interests:** {', '.join(interests)}
**Travel Styles:** {', '.join(travel_styles)}

Provide comprehensive destination intelligence that will help plan the perfect trip.
Return your response as valid JSON matching the schema."""

    messages = [
        SystemMessage(content=RESEARCH_SYSTEM_PROMPT),
        HumanMessage(content=prompt)
    ]

    try:
        response = await llm.ainvoke(messages)
        parsed = _clean_and_parse_json(response.content)
        if isinstance(parsed, dict) and parsed.get("top_attractions") and len(parsed["top_attractions"]) > 0:
            return parsed
    except Exception as e:
        print(f"Research LLM parsing fallback triggered: {e}")

    return _build_fallback_research(destination)
