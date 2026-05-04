import os
import logging
from datetime import datetime, timezone

import openai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import AnalyzeRequest, DiagnosticReport
from llm_clients import query_all_llms
from amazon import fetch_amazon_products
from embeddings import compute_similarity_scores
from analysis import build_brand_visibility, generate_insights

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("anthropic").setLevel(logging.WARNING)
logging.getLogger("google").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
logger = logging.getLogger("aeo")

app = FastAPI(
    title="AEO Diagnostic API",
    description="AI Engine Optimization — multi-LLM product visibility analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_openai_client() -> openai.AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    return openai.AsyncOpenAI(api_key=api_key)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/analyze", response_model=DiagnosticReport)
async def analyze(request: AnalyzeRequest):
    import asyncio
    import time

    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty")

    oai_client = _get_openai_client()
    t0 = time.perf_counter()
    logger.info("── NEW QUERY: \"%s\" ──", query)

    # Step 1 — Fan-out LLMs + Amazon
    selected_llms = request.llms
    logger.info("[1/4] Querying %d LLMs (%s) + Amazon...", len(selected_llms), ", ".join(selected_llms))
    llm_responses, amazon_products = await asyncio.gather(
        query_all_llms(query, oai_client, selected_llms),
        fetch_amazon_products(query),
    )
    for r in llm_responses:
        status = f"{len(r.products)} products" if r.products else "error"
        logger.info("       %-10s → %s  (%dms)", r.provider, status, r.response_time_ms)
    logger.info("       amazon     → %d products", len(amazon_products))

    # Step 2 — Embeddings + similarity
    logger.info("[2/4] Computing embeddings & similarity...")
    similarity_matrix = await compute_similarity_scores(
        llm_responses, amazon_products, oai_client
    )
    logger.info("       %d similarity pairs found", len(similarity_matrix))

    # Step 3 — Brand scoring
    logger.info("[3/4] Scoring brand visibility...")
    brand_visibility = build_brand_visibility(
        llm_responses, amazon_products, similarity_matrix
    )
    logger.info("       %d brands scored", len(brand_visibility))

    # Step 4 — Insights
    logger.info("[4/4] Generating insights...")
    insights, recommendations = await generate_insights(
        query, brand_visibility, amazon_products, oai_client
    )

    elapsed = time.perf_counter() - t0
    logger.info("── DONE in %.1fs — %d brands, %d insights ──\n", elapsed, len(brand_visibility), len(insights))

    return DiagnosticReport(
        query=query,
        timestamp=datetime.now(timezone.utc).isoformat(),
        llm_responses=llm_responses,
        amazon_products=amazon_products,
        brand_visibility=brand_visibility,
        similarity_matrix=similarity_matrix,
        overall_insights=insights,
        recommendations=recommendations,
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
