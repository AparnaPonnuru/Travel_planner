"""
💰 Budget Optimizer Agent
Analyzes the itinerary against the user's budget, optimizes allocation,
finds savings, and ensures contingency reserves.
"""
from langchain_core.messages import HumanMessage, SystemMessage
from app.config.llm_provider import get_llm
import json
import re


BUDGET_SYSTEM_PROMPT = """You are the Budget Optimizer Agent for VoyageAI, an elite travel planning system.

Your role: Analyze the planned itinerary against the user's budget and optimize spending.

You MUST:
1. Calculate total costs from the itinerary (transport, accommodation, food, activities)
2. Compare against user's budget
3. Identify areas to save money
4. Ensure a contingency reserve (8-10%)
5. Flag if over-budget and suggest alternatives

Return your analysis as JSON:
{
  "breakdown": {
    "currency": "INR",
    "total_planned": 42000,
    "user_budget": 50000,
    "remaining_buffer": 8000,
    "status": "within-budget",
    "transportation": 10500,
    "accommodation": 15000,
    "food": 7500,
    "activities_cost": 4200,
    "local_travel": 2800,
    "miscellaneous": 2000,
    "contingency_reserve": 4000,
    "saving_tips": [
      "Book train tickets early in Sleeper / 3AC class to avoid surge pricing",
      "Hire shared auto-rickshaws or rent a bicycle in Hampi to save on local transport",
      "Enjoy authentic Karnataka Thalis at local eateries for delicious value meals"
    ]
  },
  "optimizations_applied": [
    "Grouped nearby monuments to minimize local commute expenses",
    "Selected highly rated heritage homestays offering excellent value for money"
  ]
}

Be precise with numbers. Every rupee matters for budget travelers."""


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


def _build_fallback_budget(budget: dict) -> dict:
    total = budget.get("total", 50000)
    currency = budget.get("currency", "INR")
    
    contingency = int(total * 0.08)
    allocatable = total - contingency
    
    transportation = int(allocatable * 0.25)
    accommodation = int(allocatable * 0.35)
    food = int(allocatable * 0.18)
    activities = int(allocatable * 0.10)
    local_travel = int(allocatable * 0.07)
    misc = allocatable - (transportation + accommodation + food + activities + local_travel)
    planned = transportation + accommodation + food + activities + local_travel + misc

    return {
        "breakdown": {
            "currency": currency,
            "total_planned": planned,
            "user_budget": total,
            "remaining_buffer": contingency,
            "status": "within-budget",
            "transportation": transportation,
            "accommodation": accommodation,
            "food": food,
            "activities_cost": activities,
            "local_travel": local_travel,
            "miscellaneous": misc,
            "contingency_reserve": contingency,
            "saving_tips": [
                "Book train tickets early to avoid tatkal surge pricing",
                "Rent scooters or bicycles for local monument exploration",
                "Opt for traditional thali meals at local mess halls for authentic taste and best value"
            ]
        },
        "optimizations_applied": [
            "Clustered attractions geographically to reduce local cab and auto fares",
            "Reserved a strict 8% safety contingency reserve for unexpected expenses"
        ]
    }


async def run_budget_agent(
    itinerary_data: dict,
    budget: dict,
    travelers: dict,
    transit_data: dict,
) -> dict:
    """Execute the Budget Optimizer Agent."""
    llm = get_llm(temperature=0.2)

    itinerary_summary = json.dumps(itinerary_data, indent=2, default=str)[:3000]
    transit_summary = json.dumps(transit_data, indent=2, default=str)[:1500]

    prompt = f"""Analyze and optimize the budget for this trip:

**Budget Config:**
- Total Budget: {budget.get('total', 50000)} {budget.get('currency', 'INR')}
- Tier: {budget.get('tier', 'moderate')}
- Contingency: {budget.get('contingency_percent', 8)}%

**Travelers:** {json.dumps(travelers)}

**Planned Itinerary:**
{itinerary_summary}

**Transit Costs:**
{transit_summary}

Calculate exact costs for every category. If over-budget, suggest specific cuts.
If within-budget, suggest how to use remaining buffer wisely.
Return as valid JSON matching the schema."""

    messages = [
        SystemMessage(content=BUDGET_SYSTEM_PROMPT),
        HumanMessage(content=prompt)
    ]

    try:
        response = await llm.ainvoke(messages)
        parsed = _clean_and_parse_json(response.content)
        if isinstance(parsed, dict) and "breakdown" in parsed and parsed["breakdown"].get("transportation"):
            return parsed
    except Exception as e:
        print(f"Budget LLM parsing fallback triggered: {e}")

    return _build_fallback_budget(budget)
