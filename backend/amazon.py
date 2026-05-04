import os
import re
import logging

import httpx

from models import AmazonProduct

logger = logging.getLogger(__name__)


def _extract_brand(title: str, brand: str | None = None) -> str:
    if brand:
        return brand
    match = re.match(r"^([A-Z][A-Za-z0-9&'+\-.]+(?:\s[A-Z][A-Za-z0-9&'+\-.]+)?)", title)
    return match.group(1) if match else " ".join(title.split()[:2])


async def fetch_amazon_products(query: str) -> list[AmazonProduct]:
    """Fetch real Amazon search results via SerpAPI, with a Google fallback."""
    api_key = os.getenv("SERPAPI_KEY")

    if not api_key:
        logger.warning("SERPAPI_KEY not set — trying Google fallback")
        return await _google_fallback(query)

    try:
        params = {
            "engine": "amazon",
            "amazon_domain": "amazon.in",
            "k": query,
            "api_key": api_key,
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get("https://serpapi.com/search.json", params=params)
            resp.raise_for_status()

        data = resp.json()
        organic = data.get("organic_results", [])

        return [
            AmazonProduct(
                title=r.get("title", "Unknown"),
                brand=_extract_brand(r.get("title", ""), r.get("brand")),
                rank=r.get("position", i + 1),
                rating=r.get("rating", 0),
                review_count=r.get("reviews_count", 0),
                price=(r.get("price", {}) or {}).get("raw", "N/A") if isinstance(r.get("price"), dict) else str(r.get("price", "N/A")),
                url=r.get("link", ""),
                thumbnail=r.get("thumbnail"),
            )
            for i, r in enumerate(organic[:10])
        ]
    except Exception:
        logger.exception("SerpAPI request failed — trying Google fallback")
        return await _google_fallback(query)


async def _google_fallback(query: str) -> list[AmazonProduct]:
    """Use Google Custom Search JSON API to find Amazon products."""
    api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
    cx = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

    if not api_key or not cx:
        logger.warning("Google Search credentials not set — returning empty Amazon results")
        return []

    try:
        params = {
            "key": api_key,
            "cx": cx,
            "q": f"site:amazon.in {query}",
            "num": "10",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get("https://www.googleapis.com/customsearch/v1", params=params)
            resp.raise_for_status()

        items = resp.json().get("items", [])
        return [
            AmazonProduct(
                title=item.get("title", "Unknown"),
                brand=_extract_brand(item.get("title", "")),
                rank=i + 1,
                rating=0,
                review_count=0,
                price="N/A",
                url=item.get("link", ""),
            )
            for i, item in enumerate(items[:10])
        ]
    except Exception:
        logger.exception("Google fallback also failed")
        return []
