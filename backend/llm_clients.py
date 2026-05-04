import asyncio
import json
import time
import os
import logging

import openai
import anthropic
import google.generativeai as genai

from models import LLMResponse, ProductMention

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are a knowledgeable shopping assistant. When asked about product "
    "recommendations, provide a ranked list of specific products with brand names. "
    "For each product, include:\n"
    "1. The exact product name and brand\n"
    "2. Key attributes/features that make it stand out\n"
    "3. Why you recommend it\n\n"
    "Format your response as a numbered list. Be specific with brand and product names."
)

EXTRACTION_PROMPT = (
    "Extract product mentions from the following AI response. Return ONLY valid JSON — "
    "an object with a single key \"products\" whose value is an array of objects with fields:\n"
    "- name (str): exact product name\n"
    "- brand (str): brand name\n"
    "- rank (int): position in the list (1 = top)\n"
    "- attributes (list[str]): key features mentioned\n"
    "- reasoning (str): brief reason for recommending\n\n"
    "AI Response:\n"
)


def _build_user_prompt(query: str) -> str:
    return (
        f'A shopper asks: "{query}"\n\n'
        "Please recommend the top 8-10 specific products (with brand names) that best "
        "answer this query. Rank them from most recommended to least. For each product "
        "include the brand name, product name, key attributes, and a brief reason."
    )


async def _extract_products(raw_response: str, oai_client: openai.AsyncOpenAI) -> list[ProductMention]:
    """Use GPT-4.1-nano to extract structured product data — nano excels at schema extraction."""
    try:
        extraction = await oai_client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[{"role": "user", "content": EXTRACTION_PROMPT + raw_response}],
            temperature=0,
            response_format={"type": "json_object"},
        )
        content = extraction.choices[0].message.content or "{}"
        parsed = json.loads(content)
        products_raw = parsed.get("products", parsed if isinstance(parsed, list) else [])
        if not isinstance(products_raw, list):
            products_raw = []

        return [
            ProductMention(
                name=p.get("name", "Unknown"),
                brand=p.get("brand", "Unknown"),
                rank=p.get("rank", i + 1),
                attributes=p.get("attributes", []),
                reasoning=p.get("reasoning", ""),
            )
            for i, p in enumerate(products_raw)
        ]
    except Exception:
        logger.exception("Product extraction failed")
        return []


# ---------------------------------------------------------------------------
# Individual LLM query functions
# ---------------------------------------------------------------------------

async def query_openai(query: str, oai_client: openai.AsyncOpenAI) -> LLMResponse:
    start = time.perf_counter()
    try:
        response = await oai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(query)},
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        raw = response.choices[0].message.content or ""
        products = await _extract_products(raw, oai_client)
        return LLMResponse(
            provider="openai",
            raw_response=raw,
            products=products,
            response_time_ms=int((time.perf_counter() - start) * 1000),
        )
    except Exception as e:
        logger.exception("OpenAI query failed")
        return LLMResponse(
            provider="openai",
            raw_response=f"Error: {e}",
            products=[],
            response_time_ms=int((time.perf_counter() - start) * 1000),
        )


async def query_anthropic(query: str, oai_client: openai.AsyncOpenAI) -> LLMResponse:
    start = time.perf_counter()
    try:
        client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": _build_user_prompt(query)}],
        )
        raw = response.content[0].text if response.content else ""
        products = await _extract_products(raw, oai_client)
        return LLMResponse(
            provider="anthropic",
            raw_response=raw,
            products=products,
            response_time_ms=int((time.perf_counter() - start) * 1000),
        )
    except Exception as e:
        logger.exception("Anthropic query failed")
        return LLMResponse(
            provider="anthropic",
            raw_response=f"Error: {e}",
            products=[],
            response_time_ms=int((time.perf_counter() - start) * 1000),
        )


async def query_gemini(query: str, oai_client: openai.AsyncOpenAI) -> LLMResponse:
    start = time.perf_counter()
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")

        # google-generativeai is sync — run in executor
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: model.generate_content(
                f"{SYSTEM_PROMPT}\n\n{_build_user_prompt(query)}",
                generation_config=genai.GenerationConfig(
                    temperature=0.3, max_output_tokens=2000
                ),
            ),
        )
        raw = result.text
        products = await _extract_products(raw, oai_client)
        return LLMResponse(
            provider="gemini",
            raw_response=raw,
            products=products,
            response_time_ms=int((time.perf_counter() - start) * 1000),
        )
    except Exception as e:
        logger.exception("Gemini query failed")
        return LLMResponse(
            provider="gemini",
            raw_response=f"Error: {e}",
            products=[],
            response_time_ms=int((time.perf_counter() - start) * 1000),
        )


async def query_all_llms(query: str, oai_client: openai.AsyncOpenAI) -> list[LLMResponse]:
    """Fan-out queries to all three LLMs concurrently."""
    results = await asyncio.gather(
        query_openai(query, oai_client),
        query_anthropic(query, oai_client),
        query_gemini(query, oai_client),
    )
    return list(results)
