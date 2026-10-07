"""
🛡️ Safety Agent
Provides travel advisories, health tips, scam alerts, and emergency contacts.
"""
from langchain_core.messages import HumanMessage, SystemMessage
from app.config.llm_provider import get_fast_llm
import json
import re


SAFETY_SYSTEM_PROMPT = """You are the Safety Agent for VoyageAI — responsible for ensuring traveler safety and preparedness.

Your role: Provide comprehensive safety guidance for the destination.

Cover:
1. **Safety Score** — overall safety assessment (e.g. "Safe", "Very Safe")
2. **Travel Advisories** — current conditions, areas to avoid, weather warnings
3. **Health Tips** — vaccinations, hydration, sun protection, water safety
4. **Scam Alerts** — common tourist scams and how to avoid them (e.g. fake guides, overpriced gems/transport)
5. **Emergency Contacts** — police, hospitals, tourist helpline
6. **Packing Checklist** — essential items for safety and comfort

Return as JSON:
{
  "safety_score": "Very Safe (Rating: 4.6/5)",
  "advisories": [
    "Carry modest clothing when entering active temples (Virupaksha Temple)",
    "Afternoon heat can exceed 36°C; avoid intense hill climbs between 12 PM - 3 PM"
  ],
  "health_tips": [
    "Drink only bottled or UV-filtered water",
    "Carry ORS / electrolyte packets and sunscreen with SPF 50+"
  ],
  "scam_alerts": [
    "Unauthorized guides near monuments — only hire government-licensed ASI guides carrying ID cards",
    "Overcharging for coracle boat crossings — negotiate or agree on fare before stepping aboard"
  ],
  "emergency_contacts": [
    "National Emergency: 112",
    "Police: 100",
    "Ambulance: 108",
    "Tourist Police Helpline: 1363"
  ],
  "checklist_items": [
    "Broad-brimmed sun hat & UV sunglasses",
    "Breathable cotton attire",
    "Refillable insulated water bottle",
    "First aid kit with band-aids and antiseptic wipes",
    "Universal power bank"
  ]
}

Be honest but practical and actionable."""


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


def _build_fallback_safety(destination: str) -> dict:
    dest = destination.split(",")[0].strip()
    return {
        "safety_score": f"Safe for Travelers in {dest} (Score: 4.7/5)",
        "advisories": [
            f"Dress respectfully when visiting active temples and spiritual sites across {dest}",
            "Stay well-hydrated throughout the day and wear sun protection during midday peak sun",
            "Keep emergency contact numbers and hotel address card handy on your phone"
        ],
        "health_tips": [
            "Drink only bottled, sealed, or purified water",
            "Carry ORS electrolyte sachets, mosquito repellent, and basic pain relief medication",
            "Eat freshly cooked food at popular, well-patronized dining spots"
        ],
        "scam_alerts": [
            "Unofficial touts offering 'VIP darshan' or quick entrance — use official ASI ticket counters",
            "Auto-rickshaws not turning on meters — confirm fixed fare before starting trip",
            "Gem and stone souvenir shops claiming rare antiques — purchase only authenticated crafts"
        ],
        "emergency_contacts": [
            "All-India Emergency Number: 112",
            "Police Control Room: 100",
            "Medical Ambulance: 108",
            "National Tourist Helpline (24/7): 1363",
            "Women Helpline: 1091"
        ],
        "checklist_items": [
            "Government Photo ID (Aadhaar / Passport / Driving License)",
            "Sturdy walking shoes for granite boulders and temple courtyards",
            "Broad-brimmed sun hat, sunglasses & high-SPF sunscreen",
            "Portable high-capacity power bank",
            "Compact first-aid kit with antiseptic lotion and bandages"
        ]
    }


async def run_safety_agent(
    destination: str,
    travel_styles: list[str],
    duration_days: int,
) -> dict:
    """Execute the Safety Agent."""
    llm = get_fast_llm()

    prompt = f"""Provide a comprehensive safety briefing for a {duration_days}-day trip to {destination}:

**Travel Style:** {', '.join(travel_styles)}

Cover: safety assessment score, travel advisories, health precautions, common tourist scams to avoid, 24/7 emergency contacts, and essential safety checklist items.

Return as valid JSON matching the schema."""

    messages = [
        SystemMessage(content=SAFETY_SYSTEM_PROMPT),
        HumanMessage(content=prompt)
    ]

    try:
        response = await llm.ainvoke(messages)
        parsed = _clean_and_parse_json(response.content)
        if isinstance(parsed, dict) and parsed.get("emergency_contacts") and len(parsed["emergency_contacts"]) > 0:
            return parsed
    except Exception as e:
        print(f"Safety LLM parsing fallback triggered: {e}")

    return _build_fallback_safety(destination)
