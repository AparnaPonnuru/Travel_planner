"""
🗺️ Local Guide Agent
Recommends hidden gems, local food, cultural experiences, and insider tips.
"""
from langchain_core.messages import HumanMessage, SystemMessage
from app.config.llm_provider import get_llm
import json
import re


LOCAL_GUIDE_SYSTEM_PROMPT = """You are the Local Guide Agent for VoyageAI — a seasoned local expert who has lived in and deeply explored Indian destinations.

Your role: Provide the insider knowledge that transforms a generic tourist trip into an authentic local experience.

You MUST cover:
1. **Hidden Gems** — places most tourists miss but locals love
2. **Local Food Picks** — street food stalls, hole-in-the-wall restaurants, must-try dishes
3. **Cultural Insights** — festivals, customs, dress codes, local etiquette
4. **Transport Tips** — how locals get around (cheaper/better than tourist options)
5. **Best Season** — when to visit for the best experience

Return as JSON:
{
  "hidden_gems": ["Sanapur Lake cliff jumping spot — tranquil waters without tourist crowd"],
  "local_food_picks": ["Jolada Rotti Oota at Gouthami — authentic sorghum rotis and spicy brinjal curry"],
  "cultural_tips": ["Hire local storytellers near monuments for oral folklore not found in guidebooks"],
  "best_season": "November to February — crisp morning air and pleasant afternoons",
  "local_transport_tips": ["Rent a gearless moped for ₹350/day to cross between riverbanks with maximum freedom"]
}

Sound like a passionate local friend, not a guidebook. Return valid JSON inside a ```json ``` block."""


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


def _build_fallback_guide(destination: str) -> dict:
    dest = destination.split(",")[0].strip()
    return {
        "hidden_gems": [
            f"Secluded sunrise boulder overlook near {dest} riverbank — peaceful meditation spot with zero tourist crowd",
            "Ancient carved stone stepwell hidden behind the village palm groves — incredible geometry for photography",
            "Evening tribal artisanal craft cooperative — watch master weavers and sculptors work live"
        ],
        "local_food_picks": [
            f"Signature {dest} Special Meal Thali with unlimited regional curries, rasam, and fresh payasam (₹180)",
            "Crispy hot Mirchi Bajji and herbal ginger tea at the old bus stop corner stall (₹40)",
            "Wood-fired clay oven roasted rotis served with smoky brinjal yennegayi"
        ],
        "cultural_tips": [
            "Early morning (6:30 AM - 8:30 AM) is magical for temple courtyards with priests performing dawn rituals",
            "Keep comfortable slip-on shoes since footwear is checked at multiple shrines",
            "Support local family-run homestays and community rickshaw drivers directly"
        ],
        "best_season": "October to March — crisp cool mornings, clear skies, and comfortable daytime exploration",
        "local_transport_tips": [
            "Rent a bicycle (₹100/day) or scooter (₹350-450/day) for maximum independence between sights",
            "Negotiate full-day auto-rickshaw hire in advance (around ₹800 - ₹1,200 for 8 hours including waiting time)"
        ]
    }


async def run_local_guide_agent(
    destination: str,
    travel_styles: list[str],
    interests: list[str],
    research_data: dict,
) -> dict:
    """Execute the Local Guide Agent."""
    llm = get_llm(temperature=0.4)

    prompt = f"""As a local expert for {destination}, share your insider knowledge:

**Traveler's Interests:** {', '.join(interests)}
**Travel Style:** {', '.join(travel_styles)}

**What the Research Agent found:**
{json.dumps(research_data, indent=2, default=str)[:2000]}

Add YOUR local expertise — hidden gems, street food favorites, cultural etiquette, and money-saving transport hacks.
Return as valid JSON."""

    messages = [
        SystemMessage(content=LOCAL_GUIDE_SYSTEM_PROMPT),
        HumanMessage(content=prompt)
    ]

    try:
        response = await llm.ainvoke(messages)
        parsed = _clean_and_parse_json(response.content)
        if isinstance(parsed, dict) and parsed.get("hidden_gems") and len(parsed["hidden_gems"]) > 0:
            return parsed
    except Exception as e:
        print(f"Local Guide LLM parsing fallback triggered: {e}")

    return _build_fallback_guide(destination)
