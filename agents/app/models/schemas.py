"""
Pydantic schemas for the trip planning agent system.
Mirrors the TypeScript types from the original Next.js app.
"""
from __future__ import annotations
from typing import Optional, Literal
from pydantic import BaseModel, Field


class TravelerConfig(BaseModel):
    adults: int = 2
    children: int = 0
    infants: int = 0
    children_ages: list[int] = Field(default_factory=list)
    party_type: Literal["solo", "couple", "family", "friends", "group"] = "couple"


class BudgetConfig(BaseModel):
    tier: Literal["budget", "moderate", "premium", "luxury", "custom"] = "moderate"
    total: float = 50000
    currency: Literal["INR", "USD", "EUR", "GBP"] = "INR"
    includes_travel_to_origin: bool = True
    contingency_percent: float = 8.0


class TripPlanRequest(BaseModel):
    """Input from the user/frontend"""
    destination: str
    origin: str = "Hyderabad"
    start_date: str = ""
    duration_days: int = 5
    travelers: TravelerConfig = Field(default_factory=TravelerConfig)
    budget: BudgetConfig = Field(default_factory=BudgetConfig)
    travel_styles: list[str] = Field(default_factory=lambda: ["relaxed"])
    interests: list[str] = Field(default_factory=lambda: ["nature"])
    accommodation_type: str = "hotel"
    transport_primary: str = "train"
    transport_local: str = "local taxi"
    hard_constraints: list[str] = Field(default_factory=list)
    soft_preferences: list[str] = Field(default_factory=list)
    natural_prompt: str = ""


# ─── Agent Output Schemas ───

class TrainOption(BaseModel):
    train_number: str
    train_name: str
    departure_time: str
    arrival_time: str
    duration: str
    origin_station: str
    destination_station: str
    frequency: str = "Daily"
    classes: list[str] = Field(default_factory=lambda: ["SL", "3A", "2A"])
    fare_range: str = ""


class FlightOption(BaseModel):
    airline: str
    flight_number: str
    departure_time: str
    arrival_time: str
    duration: str
    fare_range: str = ""


class TransitLegGuidance(BaseModel):
    when_to_start: str = ""
    where_to_board: str = ""
    arrival_details: str = ""
    check_out_buffer: str = ""


class TransitLeg(BaseModel):
    direction: Literal["outbound", "return"]
    title: str
    from_city: str = Field(alias="from")
    to_city: str = Field(alias="to")
    distance_km: float
    guidance: TransitLegGuidance = Field(default_factory=TransitLegGuidance)
    trains: list[TrainOption] = Field(default_factory=list)
    flights: list[FlightOption] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class NearbyPlace(BaseModel):
    name: str
    category: str
    distance_from_base_km: float
    drive_time: str
    highlight: str
    best_time: str


class TransitResearchResult(BaseModel):
    """Output from the Transit Agent"""
    origin_to_destination_distance_km: float = 0
    outbound: Optional[TransitLeg] = None
    return_journey: Optional[TransitLeg] = None
    nearby_places: list[NearbyPlace] = Field(default_factory=list)


class Activity(BaseModel):
    id: str = ""
    name: str
    category: str = "attraction"
    description: str = ""
    start_time: str = "09:00"
    end_time: str = "10:30"
    duration_minutes: int = 90
    estimated_cost: float = 0
    location_name: str = ""
    match_reason: str = ""


class MealRecommendation(BaseModel):
    type: Literal["breakfast", "lunch", "dinner", "tea/snack"] = "lunch"
    restaurant_name: str
    cuisine: str
    location: str
    estimated_cost_per_person: float = 0
    highlight_dish: str = ""


class Accommodation(BaseModel):
    name: str
    type: str = "hotel"
    location: str = ""
    cost_per_night: float = 0
    rating: float = 4.0
    rationale: str = ""


class DayPlan(BaseModel):
    day_number: int
    date: str = ""
    title: str
    base_city: str
    theme: str = ""
    activities: list[Activity] = Field(default_factory=list)
    meals: list[MealRecommendation] = Field(default_factory=list)
    accommodation: Optional[Accommodation] = None


class ItineraryResult(BaseModel):
    """Output from the Itinerary Planner Agent"""
    days: list[DayPlan] = Field(default_factory=list)
    route_sequence: list[str] = Field(default_factory=list)
    ai_explanations: list[str] = Field(default_factory=list)


class BudgetBreakdown(BaseModel):
    currency: str = "INR"
    total_planned: float = 0
    user_budget: float = 0
    remaining_buffer: float = 0
    status: Literal["within-budget", "near-budget", "over-budget"] = "within-budget"
    transportation: float = 0
    accommodation: float = 0
    food: float = 0
    activities_cost: float = 0
    local_travel: float = 0
    miscellaneous: float = 0
    contingency_reserve: float = 0
    saving_tips: list[str] = Field(default_factory=list)


class BudgetResult(BaseModel):
    """Output from the Budget Optimizer Agent"""
    breakdown: BudgetBreakdown = Field(default_factory=BudgetBreakdown)
    optimizations_applied: list[str] = Field(default_factory=list)


class LocalGuideResult(BaseModel):
    """Output from the Local Guide Agent"""
    hidden_gems: list[str] = Field(default_factory=list)
    local_food_picks: list[str] = Field(default_factory=list)
    cultural_tips: list[str] = Field(default_factory=list)
    best_season: str = ""
    local_transport_tips: list[str] = Field(default_factory=list)


class SafetyResult(BaseModel):
    """Output from the Safety Agent"""
    safety_score: Literal["Safe", "Moderate Caution", "Exercise Caution"] = "Safe"
    advisories: list[str] = Field(default_factory=list)
    health_tips: list[str] = Field(default_factory=list)
    scam_alerts: list[str] = Field(default_factory=list)
    emergency_contacts: list[str] = Field(default_factory=list)
    checklist_items: list[str] = Field(default_factory=list)


class QualityScore(BaseModel):
    overall: Literal["Excellent", "Good", "Fair"] = "Excellent"
    budget_fit: Literal["Optimal", "Stretch", "Tight"] = "Optimal"
    pace: Literal["Relaxed", "Balanced", "Intense"] = "Relaxed"
    efficiency: Literal["High", "Moderate", "Challenging"] = "High"
    constraint_match_rate: int = 100
    notes: list[str] = Field(default_factory=list)


# ─── Agent Event Streaming ───

class AgentEvent(BaseModel):
    """Streamed event to the frontend showing agent activity"""
    agent_name: str
    status: Literal["thinking", "working", "done", "error", "handoff"]
    message: str
    data: Optional[dict] = None
    timestamp: str = ""
