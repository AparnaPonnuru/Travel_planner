"""
VoyageAI Agent Service — FastAPI Server
Exposes the LangGraph multi-agent pipeline via REST + SSE streaming endpoints.
"""
import os
import json
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from app.agents.supervisor import run_trip_planning_pipeline, compile_trip_result, trip_planning_graph
from app.models.schemas import TripPlanRequest, AgentEvent


import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# ─── Lifespan ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("VoyageAI Agent Service starting...")
    print(f"   Gemini API: {'[OK] configured' if os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY') else '[X] missing'}")
    print(f"   Groq API:   {'[OK] configured' if os.getenv('GROQ_API_KEY') else '[X] missing'}")
    yield
    print("VoyageAI Agent Service shutting down...")


app = FastAPI(
    title="VoyageAI Agent Service",
    description="LangGraph-powered multi-agent trip planning with 7 specialized AI agents",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ───
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "VoyageAI Agent Service",
        "version": "2.0.0",
        "agents": [
            "Trip Supervisor",
            "Research Agent",
            "Transit Agent",
            "Itinerary Planner",
            "Budget Optimizer",
            "Local Guide",
            "Safety Agent",
        ],
        "llm_providers": {
            "gemini": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")),
            "groq": bool(os.getenv("GROQ_API_KEY")),
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# ─── Generate Trip (SSE Streaming) ───
@app.post("/api/agents/plan")
async def plan_trip_stream(request: TripPlanRequest):
    """
    Generate a complete trip plan using the multi-agent pipeline.
    Returns Server-Sent Events (SSE) stream showing real-time agent progress,
    followed by the final trip result.
    """

    async def event_generator():
        try:
            async for event in run_trip_planning_pipeline(
                destination=request.destination,
                origin=request.origin,
                start_date=request.start_date,
                duration_days=request.duration_days,
                travelers=request.travelers.model_dump(),
                budget=request.budget.model_dump(),
                travel_styles=request.travel_styles,
                interests=request.interests,
                hard_constraints=request.hard_constraints,
                soft_preferences=request.soft_preferences,
                accommodation_type=request.accommodation_type,
                transport_primary=request.transport_primary,
                transport_local=request.transport_local,
            ):
                if isinstance(event, AgentEvent):
                    yield f"data: {json.dumps({'type': 'agent_event', 'event': event.model_dump()})}\n\n"
                elif isinstance(event, dict) and event.get("type") == "trip_result":
                    yield f"data: {json.dumps({'type': 'trip_result', 'trip': event['data']})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


# ─── Generate Trip (Synchronous — for simpler clients) ───
@app.post("/api/agents/plan-sync")
async def plan_trip_sync(request: TripPlanRequest):
    """
    Generate a complete trip plan synchronously.
    Runs all agents and returns the compiled result.
    """
    try:
        initial_state = {
            "destination": request.destination,
            "origin": request.origin,
            "start_date": request.start_date or datetime.now().strftime("%Y-%m-%d"),
            "duration_days": request.duration_days,
            "travelers": request.travelers.model_dump(),
            "budget": request.budget.model_dump(),
            "travel_styles": request.travel_styles,
            "interests": request.interests,
            "hard_constraints": request.hard_constraints,
            "soft_preferences": request.soft_preferences,
            "accommodation_type": request.accommodation_type,
            "transport_primary": request.transport_primary,
            "transport_local": request.transport_local,
            "research_data": {},
            "transit_data": {},
            "itinerary_data": {},
            "budget_data": {},
            "local_guide_data": {},
            "safety_data": {},
            "events": [],
            "errors": [],
        }

        final_state = await trip_planning_graph.ainvoke(initial_state)
        compiled = compile_trip_result(final_state)

        return {
            "trip": compiled,
            "agent_events": final_state.get("events", []),
            "errors": final_state.get("errors", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent pipeline failed: {str(e)}")


# ─── Parse Natural Language ───
class NaturalLanguageRequest(BaseModel):
    prompt: str


@app.post("/api/agents/parse")
async def parse_natural_language(request: NaturalLanguageRequest):
    """Parse a natural language trip request into structured parameters."""
    from app.config.llm_provider import get_fast_llm
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = get_fast_llm()

    system_prompt = """You parse natural language trip requests into structured JSON.
Extract: destination, origin, duration_days, travelers (adults, children, party_type), 
budget (total, currency, tier), travel_styles, interests, start_date.
Return ONLY valid JSON, no markdown."""

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Parse this trip request: {request.prompt}")
    ]

    response = await llm.ainvoke(messages)
    content = response.content

    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        parsed = json.loads(content)
        return {"parsedConfig": parsed}
    except Exception:
        return {"parsedConfig": {"destination": "Kerala", "origin": "Hyderabad", "duration_days": 5}}


# ─── Modify Trip via Chat ───
class ModifyRequest(BaseModel):
    trip: dict
    message: str


@app.post("/api/agents/modify")
async def modify_trip(request: ModifyRequest):
    """Use AI to modify an existing trip based on natural language instructions."""
    from app.config.llm_provider import get_reasoning_llm
    from langchain_core.messages import HumanMessage, SystemMessage

    llm = get_reasoning_llm()

    trip_summary = json.dumps(request.trip, indent=2, default=str)[:5000]

    messages = [
        SystemMessage(content="""You are a trip modification expert. Given an existing trip and a user's modification request,
return the modified trip as JSON. Only change what the user asks for. Maintain the same JSON structure.
Also provide a summary of changes made.
Return JSON with keys: "modified_trip" (the full updated trip) and "changes" (summary object with "summary", "added", "removed", "modified" arrays)."""),
        HumanMessage(content=f"Current trip:\n{trip_summary}\n\nUser request: {request.message}\n\nReturn modified trip as JSON.")
    ]

    response = await llm.ainvoke(messages)
    content = response.content

    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        result = json.loads(content)
        return result
    except Exception:
        return {"error": "Could not parse modification", "raw": content[:1000]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
