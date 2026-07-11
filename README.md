# NEXUS Review
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-cyan)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![LangGraph](https://img.shields.io/badge/AI-LangGraph%20%7C%20OpenAI%20%7C%20Gemini-orange)
![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-green)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black)

Nexus Review is an enterprise-grade, automated code review platform. Simply paste a GitHub Pull Request URL, and our LangGraph-powered AI agent analyzes the raw diff to detect critical vulnerabilities, stylistic inconsistencies, and logic bugs instantly.

## ✨ Features
- **LangGraph Multi-Agent Architecture**: Built on a highly modular node-based state machine, featuring web scraping, automated code analysis, and a self-healing JSON validation loop.
- **Human-in-the-Loop (HITL) Checkpoints**: Powered by LangGraph's Supabase Postgres Checkpointer. The AI pauses execution mid-analysis to allow developers to review, edit, and curate the findings on a stunning UI board before synthesizing the final report.
- **High-Speed Parallel Batching**: Time complexity is slashed from O(N) to O(1) by executing file chunk analyses concurrently across multiple threads via LangChain Batching.
- **Deep GitHub Context Extraction**: Automatically fetches not just the raw diff, but the PR Title, Description, and the full text of any linked GitHub Issues (e.g., "Fixes #123") to give the LLM perfect context.
- **Multi-Model Support**: Seamlessly swap between OpenAI (`gpt-4o`) and Google (`gemini-2.5-flash`) architectures via the frontend UI.
- **Interactive AI Chat Assistant**: Includes a built-in context-aware AI chat drawer to discuss your PR findings in real-time, ask for code explanations, or get customized refactoring suggestions.
- **Real-Time Streaming Terminal UI**: Instead of static loading screens, the backend uses Server-Sent Events (SSE) to stream live terminal logs directly to an interactive React terminal window.
- **Premium UI/UX**: High-performance React frontend featuring a stunning interactive `DotField` particle background, glassmorphism, dynamic cursor-tracking radial gradients, and fluid CSS animations.
- **Zero-Config Deployment**: A native `vercel.json` is included, instantly transforming the FastAPI backend into Vercel Serverless Functions and hosting the React frontend on the same domain without CORS issues.

## 🏗 System Architecture

```mermaid
graph TD;
    A[React Dashboard] -->|Server-Sent Events| B(FastAPI Server)
    A -->|OAuth Login| S[Supabase Auth]
    B --> C{Github Client Service}
    C -->|Fetch PR Context| D[GitHub API]
    B --> E{LangGraph Orchestrator}
    
    E --> N1[Node 1: Web Scraper]
    N1 --> N2[Node 2: Parallel Code Analyzer]
    
    N2 -->|LangGraph Checkpoint| HITL[Human-in-the-Loop Pause]
    HITL -->|User Curates Findings| N3[Node 3: Review Synthesizer]
    
    N3 --> N4[Node 4: Pydantic Validator]
    
    N4 -->|Validation Failed| N5[Node 5: LLM Auto-Fix]
    N5 --> N4
    
    N4 -->|Validation Passed| END[Stream to Frontend]
```

## 🚀 Directory Structure
```text
Nexus-Review/
├── backend/                  # Production-ready FastAPI Application
│   ├── api/routes.py         # REST SSE Streaming Endpoints
│   ├── nodes/                # Modular LangGraph Agent Nodes
│   ├── schemas/              # Pydantic Validation & Graph State Models
│   ├── services/agent.py     # LangGraph Factory & Orchestrator
│   └── main.py               # Uvicorn Entrypoint
├── frontend/                 # Vite + React Dashboard
│   ├── src/components/       # Modular UI (Terminal UI, HITL Board, DotField)
│   ├── src/contexts/         # React Context Providers (AuthContext)
│   ├── src/pages/            # Next-gen UI Pages (Dashboard, AuthPage)
│   └── src/services/         # API & SSE Stream Handlers
├── vercel.json               # Serverless Configuration for Vercel
├── .env                      # Local Environment Variables
└── requirements.txt          # Python Dependencies (Includes psycopg-binary)
```

## 🛠 Setup & Installation

### 1. Environment Configuration
Create a `.env` file in the **root** directory. 
```env
# Backend Keys
GITHUB_TOKEN=your_personal_access_token
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_gemini_api_key

GITLAB_TOKEN=your_gitlab_personal_access_token

# Supabase Postgres Checkpointer (Must be Transaction Pooler port 6543)
SUPABASE_DB_URL=postgresql://postgres.xxx:PASSWORD@aws-0-pooler.supabase.com:6543/postgres

# Frontend Supabase Auth Keys (Must start with VITE_)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Backend Setup (Local Development)
Navigate to the root directory and activate your virtual environment:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

Run the backend server from the `backend/` module:
```bash
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend Setup (Local Development)
Open a new terminal, navigate to the `frontend/` directory and install dependencies:
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173`. 

### 4. Deploying to Vercel (Production)
1. Push this repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Do **not** change the default build commands (Vercel reads `vercel.json` automatically).
4. Add all your `.env` keys into the Vercel Environment Variables dashboard.
5. Click **Deploy**. Both the Vite frontend and FastAPI Serverless backend will deploy instantly!