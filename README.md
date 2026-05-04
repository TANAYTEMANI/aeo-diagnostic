# AEO Diagnostic — AI Engine Optimization

**How visible is your product across AI search engines?**

AEO Diagnostic queries GPT-4.1 Mini, Claude Sonnet 4, and Gemini 2.0 Flash with a shopper's product query, fetches real Amazon.in results, computes embedding-based semantic similarity, and produces a comprehensive visibility report card.

## Live Demo

- **Frontend**: [https://aeo-diagnostic.vercel.app](https://aeo-diagnostic.vercel.app)
- **Backend API**: [https://aeo-diagnostic-api.onrender.com/docs](https://aeo-diagnostic-api.onrender.com/docs)

> Note: The first request may take ~30s if the Render backend is cold-starting (free tier).

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│   Next.js Frontend (Vercel)     │────▶│   Python FastAPI Backend (Render)│
│   - Search form                 │     │   - Multi-LLM orchestration      │
│   - Report card / charts        │     │   - Amazon.in product search     │
│   - Tabs: visibility, radar,    │     │   - OpenAI embeddings            │
│     similarity, insights, raw   │     │   - Cosine similarity matrix     │
│                                 │     │   - Brand visibility scoring     │
│                                 │     │   - Insight generation           │
└─────────────────────────────────┘     └──────────────────────────────────┘
```

## Tech Stack

| Layer    | Technology                                             |
|----------|--------------------------------------------------------|
| Backend  | Python 3.13, FastAPI, Pydantic, NumPy                  |
| AI/ML    | OpenAI (GPT-4.1-mini + GPT-4.1-nano + text-embedding-3-large), Anthropic Claude Sonnet 4, Google Gemini 2.0 Flash |
| Data     | SerpAPI (Amazon.in search), httpx                      |
| Frontend | Next.js 15, React, TailwindCSS, shadcn/ui, Recharts   |
| Deploy   | Vercel (frontend), Render (backend)                    |

## APIs / Tools Used

1. **OpenAI API** — GPT-4.1-mini for product recommendations + insight generation; GPT-4.1-nano for structured JSON extraction; text-embedding-3-large (dims=1024) for semantic embeddings via Matryoshka representation
2. **Anthropic API** — Claude Sonnet 4 for product recommendation querying
3. **Google Gemini API** — Gemini 2.0 Flash for product recommendation querying
4. **SerpAPI** — Real-time Amazon.in search results
5. **NumPy** — Vectorized cosine similarity matrix computation on embeddings

## Model Selection Rationale

| Task | Model | Why |
|------|-------|-----|
| Product recommendations (OpenAI) | `gpt-4.1-mini` | Better instruction following than 4o-mini (higher IFEval), optimized for structured output |
| Product recommendations (Anthropic) | `claude-sonnet-4-20250514` | Latest Claude with strong product knowledge and structured output |
| Product recommendations (Google) | `gemini-2.0-flash` | Speed-optimized for parallel fan-out pattern |
| JSON extraction | `gpt-4.1-nano` | Pure schema extraction task — nano excels here at lowest cost |
| Insight generation | `gpt-4.1-mini` | Analytical synthesis needs mini-tier intelligence |
| Embeddings | `text-embedding-3-large` (1024d) | Better semantic quality than small model; Matryoshka dim reduction to 1024 gives smaller vectors than small@1536 |

## Pipeline (what happens on each query)

1. **Fan-out** — Query GPT-4.1 Mini, Claude Sonnet 4, Gemini Flash + SerpAPI Amazon.in search concurrently (`asyncio.gather`)
2. **Structured extraction** — GPT-4.1-nano extracts brand, product, attributes, reasoning as JSON from each raw LLM response
3. **Embedding generation** — All product descriptions (LLM + Amazon) embedded in a single batch via `text-embedding-3-large` with Matryoshka dimensionality reduction to 1024
4. **Similarity matrix** — NumPy computes pairwise cosine similarity between LLM-recommended and Amazon products
5. **Scoring** — Composite visibility score (0-100) per brand based on: mention breadth, average rank, Amazon alignment, semantic similarity
6. **Insights** — GPT-4.1-mini generates human-readable insights and actionable recommendations from the analysis

## Getting Started (Local Dev)

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys for OpenAI, Anthropic, Google Gemini, and SerpAPI

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Edit .env and add your API keys

python main.py                   # Runs on http://localhost:8000
```

### 2. Frontend Setup

```bash
# From project root
npm install
npm run dev                      # Runs on http://localhost:3000
```

### 3. Open the app

Visit [http://localhost:3000](http://localhost:3000) and enter a query like *"best wireless earbuds under ₹5000"*.

## Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set **Root Directory** to `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `SERPAPI_KEY`
6. Deploy — note the URL (e.g., `https://aeo-diagnostic-api.onrender.com`)

### Frontend → Vercel

1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Add environment variable: `BACKEND_URL` = your Render backend URL
3. Deploy

## Project Structure

```
backend/
├── main.py              # FastAPI app — orchestrates the full pipeline
├── llm_clients.py       # Async LLM query functions (OpenAI, Anthropic, Gemini)
├── amazon.py            # SerpAPI Amazon.in search with Google fallback
├── embeddings.py        # OpenAI embeddings + NumPy cosine similarity
├── analysis.py          # Brand visibility scoring + insight generation
├── models.py            # Pydantic data models
└── requirements.txt

src/                     # Next.js frontend (UI only)
├── app/
│   ├── page.tsx         # Main page — search + results
│   └── api/analyze/     # Thin proxy to Python backend
├── components/
│   ├── search-form.tsx  # Search input + example queries
│   ├── report-card.tsx  # Full report with charts + tables
│   └── loading-state.tsx
└── lib/
    └── types.ts         # TypeScript types matching Pydantic models
```

## If I Had More Time

- **Streaming responses** — show LLM results as they arrive instead of waiting for all 3
- **Historical tracking** — run the same query weekly to see how brand visibility changes over time
- **Category benchmarking** — compare visibility across related queries (e.g., "earbuds" vs "headphones")
- **Flipkart integration** — compare Amazon.in vs Flipkart for India-specific insights
- **Perplexity + Bing Copilot** — add more AI engines for broader coverage
