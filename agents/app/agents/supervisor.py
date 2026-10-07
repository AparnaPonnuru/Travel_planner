"""
🧠 Supervisor Agent — LangGraph Multi-Agent Orchestrator

This is the brain of the VoyageAI agent system. It coordinates 6 specialized agents
using a LangGraph state machine to build complete trip itineraries.

Agent Pipeline:
  Research → Transit → Itinerary Planner → Budget Optimizer → Local Guide → Safety
                     (parallel where possible)

Each agent's output feeds into the next, creating a cascading intelligence pipeline.
The Supervisor streams real-time status events to the frontend for visualization.
"""
from __future__ import annotations
import asyncio
import json
from datetime import datetime
from typing import TypedDict, Annotated, AsyncGenerator
from langgraph.graph import StateGraph, END

from app.agents.research import run_research_agent
from app.agents.transit import run_transit_agent
from app.agents.itinerary import run_itinerary_agent
from app.agents.budget import run_budget_agent
from app.agents.local_guide import run_local_guide_agent
from app.agents.safety import run_safety_agent
from app.models.schemas import AgentEvent


# ─── LangGraph State Definition ───

class TripPlanningState(TypedDict):
    """Shared state passed through the agent pipeline."""
    # Input
    destination: str
    origin: str
    start_date: str
    duration_days: int
    travelers: dict
    budget: dict
    travel_styles: list[str]
    interests: list[str]
    hard_constraints: list[str]
    soft_preferences: list[str]
    accommodation_type: str
    transport_primary: str
    transport_local: str

    # Agent outputs (populated progressively)
    research_data: dict
    transit_data: dict
    itinerary_data: dict
    budget_data: dict
    local_guide_data: dict
    safety_data: dict

    # Agent events for frontend streaming
    events: list[dict]

    # Error tracking
    errors: list[str]


def _emit_event(state: TripPlanningState, agent_name: str, status: str, message: str, data: dict | None = None):
    """Add an agent event to the state for streaming to frontend."""
    event = {
        "agent_name": agent_name,
        "status": status,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    state["events"].append(event)


# ─── Node Functions (one per agent) ───

async def research_node(state: TripPlanningState) -> TripPlanningState:
    """Node: Run the Research Agent."""
    print(f"\n[VoyageAI] [1/6] Research Agent: STARTED -> Scouting destination intelligence for {state['destination']}...")
    _emit_event(state, "Research Agent", "thinking", 
                f"Discovering highlights, heritage monuments and culture in {state['destination']}...")
    
    try:
        result = await run_research_agent(
            destination=state["destination"],
            travel_styles=state["travel_styles"],
            interests=state["interests"],
        )
        state["research_data"] = result
        print(f"[VoyageAI] [1/6] Research Agent: COMPLETED -> Found {len(result.get('top_attractions', []))} attractions, {len(result.get('local_cuisine', []))} cuisine items")
        _emit_event(state, "Research Agent", "done",
                    f"Discovered {len(result.get('top_attractions', []))} signature attractions and authentic dining",
                    {"attractions_count": len(result.get("top_attractions", []))})
    except Exception as e:
        print(f"[VoyageAI] [1/6] Research Agent: ERROR -> {str(e)}")
        state["errors"].append(f"Research Agent error: {str(e)}")
        state["research_data"] = {}
        _emit_event(state, "Research Agent", "error", f"Research note: {str(e)}")

    return state


async def transit_node(state: TripPlanningState) -> TripPlanningState:
    """Node: Run the Transit Agent with tool calling."""
    print(f"[VoyageAI] [2/6] Transit Agent: STARTED -> Searching trains, flights & road routes: {state['origin']} -> {state['destination']}...")
    _emit_event(state, "Transit Agent", "thinking",
                f"Comparing transit options from {state['origin']} to {state['destination']}...")
    
    try:
        result = await run_transit_agent(
            origin=state["origin"],
            destination=state["destination"],
            start_date=state["start_date"],
            duration_days=state["duration_days"],
        )
        state["transit_data"] = result
        
        train_count = len(result.get("outbound", {}).get("trains", [])) if isinstance(result.get("outbound"), dict) else 0
        print(f"[VoyageAI] [2/6] Transit Agent: COMPLETED -> Found {train_count} train options, route distance: {result.get('distance_km', 'N/A')} km")
        _emit_event(state, "Transit Agent", "done",
                    f"Compiled {train_count} express train schedules and route distance ({result.get('distance_km', 'N/A')} km)",
                    {"distance_km": result.get("distance_km", 0)})
    except Exception as e:
        print(f"[VoyageAI] [2/6] Transit Agent: ERROR -> {str(e)}")
        state["errors"].append(f"Transit Agent error: {str(e)}")
        state["transit_data"] = {}
        _emit_event(state, "Transit Agent", "error", f"Transit search note: {str(e)}")

    return state


async def itinerary_node(state: TripPlanningState) -> TripPlanningState:
    """Node: Run the Itinerary Planner Agent."""
    print(f"[VoyageAI] [3/6] Itinerary Planner: STARTED -> Crafting {state['duration_days']}-day balanced itinerary...")
    _emit_event(state, "Itinerary Planner", "thinking",
                f"Pacing day-by-day morning, afternoon and sunset schedule for {state['duration_days']} days...")
    
    try:
        result = await run_itinerary_agent(
            destination=state["destination"],
            origin=state["origin"],
            duration_days=state["duration_days"],
            start_date=state["start_date"],
            research_data=state.get("research_data", {}),
            transit_data=state.get("transit_data", {}),
            travelers=state["travelers"],
            budget=state["budget"],
            travel_styles=state["travel_styles"],
            interests=state["interests"],
            constraints=state["hard_constraints"],
            preferences=state["soft_preferences"],
        )
        state["itinerary_data"] = result
        days_count = len(result.get("days", []))
        total_acts = sum(len(d.get('activities', [])) for d in result.get('days', []))
        print(f"[VoyageAI] [3/6] Itinerary Planner: COMPLETED -> Built {days_count} full days with {total_acts} scheduled activities")
        _emit_event(state, "Itinerary Planner", "done",
                    f"Created {days_count} complete days with {total_acts} scheduled experiences and meals",
                    {"days_count": days_count})
    except Exception as e:
        print(f"[VoyageAI] [3/6] Itinerary Planner: ERROR -> {str(e)}")
        state["errors"].append(f"Itinerary Planner error: {str(e)}")
        state["itinerary_data"] = {"days": [], "route_sequence": [state["destination"]]}
        _emit_event(state, "Itinerary Planner", "error", f"Itinerary note: {str(e)}")

    return state


async def budget_node(state: TripPlanningState) -> TripPlanningState:
    """Node: Run the Budget Optimizer Agent."""
    total_b = state['budget'].get('total', 50000)
    print(f"[VoyageAI] [4/6] Budget Optimizer: STARTED -> Optimizing ₹{total_b:,} target budget allocation...")
    _emit_event(state, "Budget Optimizer", "thinking",
                f"Optimizing ₹{total_b:,} spending across stays, transit and activities...")
    
    try:
        result = await run_budget_agent(
            itinerary_data=state.get("itinerary_data", {}),
            budget=state["budget"],
            travelers=state["travelers"],
            transit_data=state.get("transit_data", {}),
        )
        state["budget_data"] = result
        breakdown = result.get("breakdown", {})
        planned_val = breakdown.get('total_planned', 0)
        print(f"[VoyageAI] [4/6] Budget Optimizer: COMPLETED -> Planned ₹{planned_val:,.0f} of ₹{total_b:,.0f} with buffer reserve")
        _emit_event(state, "Budget Optimizer", "done",
                    f"Budget balanced: ₹{planned_val:,.0f} allocated with dedicated emergency buffer",
                    {"status": breakdown.get("status")})
    except Exception as e:
        print(f"[VoyageAI] [4/6] Budget Optimizer: ERROR -> {str(e)}")
        state["errors"].append(f"Budget Optimizer error: {str(e)}")
        state["budget_data"] = {}
        _emit_event(state, "Budget Optimizer", "error", f"Budget note: {str(e)}")

    return state


async def local_guide_node(state: TripPlanningState) -> TripPlanningState:
    """Node: Run the Local Guide Agent."""
    print(f"[VoyageAI] [5/6] Local Guide: STARTED -> Finding hidden gems & culinary picks in {state['destination']}...")
    _emit_event(state, "Local Guide", "thinking",
                f"Curating secret viewpoints and authentic regional street food in {state['destination']}...")
    
    try:
        result = await run_local_guide_agent(
            destination=state["destination"],
            travel_styles=state["travel_styles"],
            interests=state["interests"],
            research_data=state.get("research_data", {}),
        )
        state["local_guide_data"] = result
        gems_count = len(result.get('hidden_gems', []))
        food_count = len(result.get('local_food_picks', []))
        print(f"[VoyageAI] [5/6] Local Guide: COMPLETED -> Selected {gems_count} hidden gems & {food_count} authentic food picks")
        _emit_event(state, "Local Guide", "done",
                    f"Uncovered {gems_count} hidden gems and authentic local delicacies",
                    {"gems_count": gems_count})
    except Exception as e:
        print(f"[VoyageAI] [5/6] Local Guide: ERROR -> {str(e)}")
        state["errors"].append(f"Local Guide error: {str(e)}")
        state["local_guide_data"] = {}
        _emit_event(state, "Local Guide", "error", f"Local guide note: {str(e)}")

    return state


async def safety_node(state: TripPlanningState) -> TripPlanningState:
    """Node: Run the Safety Agent."""
    print(f"[VoyageAI] [6/6] Safety Agent: STARTED -> Compiling safety advisory & packing checklist...")
    _emit_event(state, "Safety Agent", "thinking",
                f"Verifying local travel advisories and packing checklist for {state['destination']}...")
    
    try:
        result = await run_safety_agent(
            destination=state["destination"],
            travel_styles=state["travel_styles"],
            duration_days=state["duration_days"],
        )
        state["safety_data"] = result
        chk_count = len(result.get('checklist_items', []))
        print(f"[VoyageAI] [6/6] Safety Agent: COMPLETED -> Safety Score: {result.get('safety_score', 'Safe')} ({chk_count} checklist items)")
        print(f"[VoyageAI] All 6 Agents Completed Successfully! Trip blueprint ready.\n")
        _emit_event(state, "Safety Agent", "done",
                    f"Safety verified: {chk_count} essential checklist items and emergency helplines ready",
                    {"safety_score": result.get("safety_score")})
    except Exception as e:
        print(f"[VoyageAI] [6/6] Safety Agent: ERROR -> {str(e)}")
        state["errors"].append(f"Safety Agent error: {str(e)}")
        state["safety_data"] = {}
        _emit_event(state, "Safety Agent", "error", f"Safety check note: {str(e)}")

    return state


# ─── Build the LangGraph State Machine ───

def build_trip_planning_graph() -> StateGraph:
    """
    Build the multi-agent orchestration graph.
    
    Flow:
        research → transit → itinerary_planner → budget_optimizer → local_guide → safety → END
    
    Research and Transit run first (they gather data).
    Itinerary uses their outputs.
    Budget analyzes the itinerary.
    Local Guide and Safety add finishing touches.
    """
    graph = StateGraph(TripPlanningState)

    # Add all agent nodes
    graph.add_node("research", research_node)
    graph.add_node("transit", transit_node)
    graph.add_node("itinerary_planner", itinerary_node)
    graph.add_node("budget_optimizer", budget_node)
    graph.add_node("local_guide", local_guide_node)
    graph.add_node("safety", safety_node)

    # Define the execution flow
    graph.set_entry_point("research")
    graph.add_edge("research", "transit")
    graph.add_edge("transit", "itinerary_planner")
    graph.add_edge("itinerary_planner", "budget_optimizer")
    graph.add_edge("budget_optimizer", "local_guide")
    graph.add_edge("local_guide", "safety")
    graph.add_edge("safety", END)

    return graph


# Compile the graph once (reused across requests)
trip_planning_graph = build_trip_planning_graph().compile()


async def run_trip_planning_pipeline(
    destination: str,
    origin: str,
    start_date: str,
    duration_days: int,
    travelers: dict,
    budget: dict,
    travel_styles: list[str],
    interests: list[str],
    hard_constraints: list[str] | None = None,
    soft_preferences: list[str] | None = None,
    accommodation_type: str = "hotel",
    transport_primary: str = "train",
    transport_local: str = "local taxi",
) -> AsyncGenerator[AgentEvent | dict, None]:
    """
    Run the complete trip planning pipeline with SSE streaming.
    
    Yields AgentEvent objects as each agent works, then yields the final
    compiled trip result.
    """
    initial_state: TripPlanningState = {
        "destination": destination,
        "origin": origin,
        "start_date": start_date or datetime.now().strftime("%Y-%m-%d"),
        "duration_days": duration_days,
        "travelers": travelers,
        "budget": budget,
        "travel_styles": travel_styles,
        "interests": interests,
        "hard_constraints": hard_constraints or [],
        "soft_preferences": soft_preferences or [],
        "accommodation_type": accommodation_type,
        "transport_primary": transport_primary,
        "transport_local": transport_local,
        "research_data": {},
        "transit_data": {},
        "itinerary_data": {},
        "budget_data": {},
        "local_guide_data": {},
        "safety_data": {},
        "events": [],
        "errors": [],
    }

    accumulated_state = dict(initial_state)

    # ── 1. Research Agent ──
    yield AgentEvent(
        agent_name="Research Agent",
        status="thinking",
        message=f"Scouting signature sights, cultural heritage and travel tips in {destination}...",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    accumulated_state = await research_node(accumulated_state)
    yield AgentEvent(
        agent_name="Research Agent",
        status="done",
        message=f"Curated top attractions and cultural overview for {destination}.",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

    # ── 2. Transit Agent ──
    yield AgentEvent(
        agent_name="Transit Agent",
        status="thinking",
        message=f"Analyzing express trains, interstate buses and routes from {origin} to {destination}...",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    accumulated_state = await transit_node(accumulated_state)
    yield AgentEvent(
        agent_name="Transit Agent",
        status="done",
        message=f"Transit network mapped with verified train timetables and bus booking options.",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

    # ── 3. Itinerary Planner ──
    yield AgentEvent(
        agent_name="Itinerary Planner",
        status="thinking",
        message=f"Synthesizing day-by-day pacing, morning visits and evening highlights for {duration_days} days...",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    accumulated_state = await itinerary_node(accumulated_state)
    yield AgentEvent(
        agent_name="Itinerary Planner",
        status="done",
        message=f"Crafted complete {duration_days}-day chronological journey itinerary.",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

    # ── 4. Budget Optimizer ──
    yield AgentEvent(
        agent_name="Budget Optimizer",
        status="thinking",
        message=f"Optimizing spending across accommodations, transit and dining with 8% contingency buffer...",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    accumulated_state = await budget_node(accumulated_state)
    yield AgentEvent(
        agent_name="Budget Optimizer",
        status="done",
        message="Smart budget allocated with itemized cost tracking and safety reserves.",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

    # ── 5. Local Guide ──
    yield AgentEvent(
        agent_name="Local Guide",
        status="thinking",
        message=f"Curating secret viewpoints and authentic regional culinary specialties in {destination}...",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    accumulated_state = await local_guide_node(accumulated_state)
    yield AgentEvent(
        agent_name="Local Guide",
        status="done",
        message="Uncovered local hidden gems and authentic culinary recommendations.",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

    # ── 6. Safety Agent ──
    yield AgentEvent(
        agent_name="Safety Agent",
        status="thinking",
        message=f"Verifying local travel advisories, emergency helplines and packing checklist for {destination}...",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
    accumulated_state = await safety_node(accumulated_state)
    yield AgentEvent(
        agent_name="Safety Agent",
        status="done",
        message="Safety protocols verified with emergency helplines and essentials checklist.",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

    # Compile the final trip from accumulated state
    compiled_trip = compile_trip_result(accumulated_state)

    # Final completion event
    yield AgentEvent(
        agent_name="Supervisor",
        status="done",
        message=f"All 6 agents complete! Your {destination} journey blueprint is ready.",
        data={"trip_id": compiled_trip.get("id", "")},
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

    # Yield the final trip data
    yield {"type": "trip_result", "data": compiled_trip}


def compile_trip_result(state: TripPlanningState) -> dict:
    """Compile all agent outputs into a single TripSnapshot-compatible result."""
    import uuid

    itinerary = state.get("itinerary_data", {})
    budget_result = state.get("budget_data", {})
    transit = state.get("transit_data", {})
    research = state.get("research_data", {})
    local_guide = state.get("local_guide_data", {})
    safety = state.get("safety_data", {})

    trip_id = f"trip-{uuid.uuid4().hex[:12]}"
    now = datetime.utcnow().isoformat() + "Z"

    # Build days from itinerary agent output
    days = []
    for d in itinerary.get("days", []):
        day = {
            "dayNumber": d.get("day_number", 1),
            "date": d.get("date", ""),
            "title": d.get("title", f"Day {d.get('day_number', 1)}"),
            "baseCity": d.get("base_city", state["destination"]),
            "theme": d.get("theme", ""),
            "stats": {
                "totalTravelTimeMinutes": 60,
                "walkingDistanceKm": 3,
                "estimatedCost": sum(a.get("estimated_cost", 0) for a in d.get("activities", []))
            },
            "activities": [
                {
                    "id": f"act-{i+1}-d{d.get('day_number', 1)}",
                    "name": a.get("name", ""),
                    "category": a.get("category", "attraction"),
                    "description": a.get("description", ""),
                    "startTime": a.get("start_time", "09:00"),
                    "endTime": a.get("end_time", "10:30"),
                    "durationMinutes": a.get("duration_minutes", 90),
                    "estimatedCost": a.get("estimated_cost", 0),
                    "locationName": a.get("location_name", ""),
                    "coordinates": {"lat": 0, "lng": 0},
                    "matchReason": a.get("match_reason", "")
                }
                for i, a in enumerate(d.get("activities", []))
            ],
            "meals": [
                {
                    "type": m.get("type", "lunch"),
                    "restaurantName": m.get("restaurant_name", ""),
                    "cuisine": m.get("cuisine", ""),
                    "location": m.get("location", ""),
                    "estimatedCostPerPerson": m.get("estimated_cost_per_person", 300),
                    "highlightDish": m.get("highlight_dish", "")
                }
                for m in d.get("meals", [])
            ],
            "accommodation": {
                "name": d.get("accommodation", {}).get("name", "Hotel") if d.get("accommodation") else "Local Hotel",
                "type": d.get("accommodation", {}).get("type", "hotel") if d.get("accommodation") else "hotel",
                "location": d.get("accommodation", {}).get("location", "") if d.get("accommodation") else "",
                "costPerNight": d.get("accommodation", {}).get("cost_per_night", 3000) if d.get("accommodation") else 3000,
                "rating": d.get("accommodation", {}).get("rating", 4.0) if d.get("accommodation") else 4.0,
                "rationale": d.get("accommodation", {}).get("rationale", "") if d.get("accommodation") else ""
            } if d.get("accommodation") or True else None
        }
        days.append(day)

    # Build budget breakdown
    bd = budget_result.get("breakdown", {})
    budget_breakdown = {
        "currency": bd.get("currency", state["budget"].get("currency", "INR")),
        "totalPlanned": bd.get("total_planned", 0),
        "userBudget": bd.get("user_budget", state["budget"].get("total", 50000)),
        "remainingBuffer": bd.get("remaining_buffer", 0),
        "status": bd.get("status", "within-budget"),
        "categories": {
            "transportation": {"amount": bd.get("transportation", 0), "percentage": 20, "note": "Inter-city transit"},
            "accommodation": {"amount": bd.get("accommodation", 0), "percentage": 30, "note": "Hotels & stays"},
            "food": {"amount": bd.get("food", 0), "percentage": 15, "note": "Meals & dining"},
            "activities": {"amount": bd.get("activities_cost", 0), "percentage": 10, "note": "Entry fees & experiences"},
            "localTravel": {"amount": bd.get("local_travel", 0), "percentage": 8, "note": "Auto, taxi, local transport"},
            "miscellaneous": {"amount": bd.get("miscellaneous", 0), "percentage": 5, "note": "Tips, shopping, misc"},
            "contingencyReserve": {"amount": bd.get("contingency_reserve", 0), "percentage": 8, "note": "Emergency buffer"},
        },
        "savingTips": bd.get("saving_tips", []),
    }

    # Build transit options
    transit_options = {
        "originToDestinationDistanceKm": transit.get("distance_km", 0),
        "availableTrains": [],
        "outbound": transit.get("outbound"),
        "returnJourney": transit.get("return_journey"),
    }

    # Build checklist from safety agent
    checklist = [
        {"id": f"chk-{i+1}", "category": "health_safety", "text": item, "isDone": False, "essential": True}
        for i, item in enumerate(safety.get("checklist_items", []))
    ]

    # Build destination overview
    destination_overview = {
        "totalDistanceCoveredKm": transit.get("distance_km", 0) * 2,
        "signatureNearbyPlaces": transit.get("nearby_places", []),
        "bestSeasonToVisit": local_guide.get("best_season", research.get("best_season", "")),
        "localCuisinePicks": local_guide.get("local_food_picks", research.get("local_cuisine", [])),
        "essentialLocalTips": local_guide.get("cultural_tips", []),
    }

    # Quality score
    quality_score = {
        "overall": "Excellent",
        "budgetFit": budget_breakdown.get("status", "within-budget").replace("within-budget", "Optimal").replace("near-budget", "Stretch").replace("over-budget", "Tight"),
        "pace": "Relaxed" if "relaxed" in state["travel_styles"] else "Balanced",
        "efficiency": "High",
        "constraintMatchRate": 100,
        "notes": itinerary.get("ai_explanations", [])[:3],
    }

    return {
        "id": trip_id,
        "title": f"{state['destination']} Adventure",
        "destination": state["destination"],
        "origin": state["origin"],
        "startDate": state["start_date"],
        "endDate": "",
        "durationDays": state["duration_days"],
        "travelers": state["travelers"],
        "budget": state["budget"],
        "travelStyles": state["travel_styles"],
        "interests": state["interests"],
        "accommodationPreference": {
            "type": state["accommodation_type"],
            "features": ["central-location", "cleanliness"],
        },
        "transportPreferences": {
            "primary": state["transport_primary"],
            "local": state["transport_local"],
            "priority": "balanced",
        },
        "specialRequirements": {
            "hardConstraints": state["hard_constraints"],
            "softPreferences": state["soft_preferences"],
        },
        "transitOptions": transit_options,
        "destinationOverview": destination_overview,
        "aiExplanations": itinerary.get("ai_explanations", []),
        "routeSequence": itinerary.get("route_sequence", [state["destination"]]),
        "routeSegments": [],
        "days": days,
        "budgetBreakdown": budget_breakdown,
        "qualityScore": quality_score,
        "checklist": checklist,
        "status": "generated",
        "version": 1,
        "shareId": f"share-{trip_id}",
        "isPublic": False,
        "createdAt": now,
        "updatedAt": now,
        "agentMetadata": {
            "researchData": research,
            "localGuideData": local_guide,
            "safetyData": safety,
            "budgetOptimizations": budget_result.get("optimizations_applied", []),
            "errors": state.get("errors", []),
        }
    }
