# 🚀 VoyageAI — Multi-Agent Trip Planner

> **AI-powered trip planning with 7 specialized LangGraph agents**

![Architecture](https://img.shields.io/badge/Architecture-MERN%20%2B%20Python%20AI-blue)
![Agents](https://img.shields.io/badge/Agents-LangGraph%20x7-green)
![LLM](https://img.shields.io/badge/LLM-Gemini%20%2B%20Groq-orange)

## 🏗️ Architecture

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌──────────────────────────┐
│   React (Vite) Client   │────▶│  Express.js + MongoDB   │────▶│  Python Agent Service    │
│   Port 5173             │     │  Port 5000              │     │  Port 8000               │
│                         │     │                         │     │                          │
│  • Landing Page         │     │  • REST API             │     │  🧠 Supervisor Agent     │
│  • Agent Visualizer     │     │  • JWT Auth             │     │  🔍 Research Agent       │
│  • Trip Results         │     │  • Trip CRUD            │     │  🚂 Transit Agent        │
│  • SSE Streaming        │     │  • MongoDB Atlas        │     │  📋 Itinerary Planner    │
│                         │     │  • Agent Proxy          │     │  💰 Budget Optimizer     │
└─────────────────────────┘     └─────────────────────────┘     │  🗺️ Local Guide          │
                                                                │  🛡️ Safety Agent         │
                                                                └──────────────────────────┘
```

## 🚀 Quick Start

### 1. Python Agent Service
```bash
cd agents
pip install -r requirements.txt
# Add your API keys to .env (GEMINI_API_KEY and/or GROQ_API_KEY)
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Express Server
```bash
cd server
npm install
# Configure .env with MONGODB_URI
npm run dev
```

### 3. React Client
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** and watch the AI agents build your trip!

## 🤖 Agent Pipeline

| # | Agent | Role | Tools |
|---|-------|------|-------|
| 1 | 🧠 **Supervisor** | Orchestrates all agents via LangGraph state machine | Agent delegation |
| 2 | 🔍 **Research** | Gathers destination intelligence | LLM reasoning |
| 3 | 🚂 **Transit** | Finds trains, flights, routes | Distance calc, train DB, flight search |
| 4 | 📋 **Itinerary Planner** | Builds day-by-day plans | Calendar logic, activity scheduling |
| 5 | 💰 **Budget Optimizer** | Allocates budget, finds savings | Cost analysis, optimization |
| 6 | 🗺️ **Local Guide** | Hidden gems, local food, tips | Local knowledge |
| 7 | 🛡️ **Safety** | Advisories, health tips, scams | Safety database |

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TypeScript + React Router
- **Backend**: Express.js + MongoDB (Mongoose) + JWT
- **AI Agents**: Python + FastAPI + LangGraph + LangChain
- **LLMs**: Google Gemini 2.0 Flash + Groq (llama-3.3-70b) with auto-fallback
- **Streaming**: Server-Sent Events (SSE) for real-time agent visualization
