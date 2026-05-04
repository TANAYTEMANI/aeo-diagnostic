import json
import logging

import openai

from models import (
    LLMResponse,
    AmazonProduct,
    BrandVisibility,
    SimilarityScore,
)

logger = logging.getLogger(__name__)


def _collect_brands(
    llm_responses: list[LLMResponse],
    amazon_products: list[AmazonProduct],
) -> list[str]:
    """Gather the de-duplicated set of brand names (lowercased)."""
    brands: set[str] = set()
    for resp in llm_responses:
        for p in resp.products:
            brands.add(p.brand.lower())
    for p in amazon_products:
        brands.add(p.brand.lower())
    return list(brands)


def _rank_for_brand(resp: LLMResponse, brand: str) -> int | None:
    for p in resp.products:
        if p.brand.lower() == brand:
            return p.rank
    return None


def _amazon_rank(products: list[AmazonProduct], brand: str) -> int | None:
    for p in products:
        if p.brand.lower() == brand:
            return p.rank
    return None


def _attributes_for_brand(responses: list[LLMResponse], brand: str) -> list[str]:
    attrs: set[str] = set()
    for resp in responses:
        for p in resp.products:
            if p.brand.lower() == brand:
                attrs.update(p.attributes)
    return list(attrs)


def _visibility_score(
    brand: str,
    llm_responses: list[LLMResponse],
    amazon_products: list[AmazonProduct],
    similarity_matrix: list[SimilarityScore],
) -> int:
    score = 0.0

    # Factor 1 — mention breadth across LLMs (0-30 pts)
    mentions = sum(
        1 for r in llm_responses
        if any(p.brand.lower() == brand for p in r.products)
    )
    score += (mentions / max(len(llm_responses), 1)) * 30

    # Factor 2 — average rank across LLMs (0-30 pts)
    ranks = [
        r for resp in llm_responses
        if (r := _rank_for_brand(resp, brand)) is not None
    ]
    if ranks:
        avg_rank = sum(ranks) / len(ranks)
        score += max(0, 30 - (avg_rank - 1) * 3)

    # Factor 3 — Amazon presence (0-20 pts)
    amz = _amazon_rank(amazon_products, brand)
    if amz is not None:
        score += max(0, 20 - (amz - 1) * 2)

    # Factor 4 — embedding similarity to Amazon (0-20 pts)
    brand_sims = [s.score for s in similarity_matrix if brand in s.llm_product.lower()]
    if brand_sims:
        score += max(brand_sims) * 20

    return min(100, round(score))


def _avg_similarity(brand: str, matrix: list[SimilarityScore]) -> float:
    relevant = [s.score for s in matrix if brand in s.llm_product.lower()]
    if not relevant:
        return 0.0
    return round(sum(relevant) / len(relevant), 4)


def build_brand_visibility(
    llm_responses: list[LLMResponse],
    amazon_products: list[AmazonProduct],
    similarity_matrix: list[SimilarityScore],
) -> list[BrandVisibility]:
    """Rank brands by composite AI-visibility score."""
    brands = _collect_brands(llm_responses, amazon_products)

    oai = next((r for r in llm_responses if r.provider == "openai"), None)
    ant = next((r for r in llm_responses if r.provider == "anthropic"), None)
    gem = next((r for r in llm_responses if r.provider == "gemini"), None)

    results = []
    for brand in brands:
        mention_count = sum(
            1 for r in llm_responses
            if any(p.brand.lower() == brand for p in r.products)
        )
        results.append(
            BrandVisibility(
                brand=brand.title(),
                overall_score=_visibility_score(brand, llm_responses, amazon_products, similarity_matrix),
                openai_rank=_rank_for_brand(oai, brand) if oai else None,
                anthropic_rank=_rank_for_brand(ant, brand) if ant else None,
                gemini_rank=_rank_for_brand(gem, brand) if gem else None,
                amazon_rank=_amazon_rank(amazon_products, brand),
                mention_count=mention_count,
                avg_similarity_to_amazon=_avg_similarity(brand, similarity_matrix),
                key_attributes=_attributes_for_brand(llm_responses, brand),
            )
        )

    results.sort(key=lambda b: b.overall_score, reverse=True)
    return results


async def generate_insights(
    query: str,
    brand_visibility: list[BrandVisibility],
    amazon_products: list[AmazonProduct],
    oai_client: openai.AsyncOpenAI,
) -> tuple[list[str], list[str]]:
    """Use GPT-4.1-mini to produce human-readable insights and recommendations."""
    top = brand_visibility[:5]
    prompt = (
        f'Analyze this AEO (AI Engine Optimization) diagnostic data.\n\n'
        f'Query: "{query}"\n\n'
        f'Top brands by AI visibility:\n'
        + "\n".join(
            f"- {b.brand}: Score {b.overall_score}/100, mentioned by {b.mention_count}/3 AIs, "
            f"Amazon rank: {b.amazon_rank or 'not found'}"
            for b in top
        )
        + f'\n\nAmazon top results: {", ".join(p.brand for p in amazon_products[:5])}\n\n'
        "Provide:\n"
        "1. 3-4 key insights about the AI search landscape for this query\n"
        "2. 3-4 actionable recommendations for a brand wanting to improve AI visibility\n\n"
        'Return JSON: {"insights": ["..."], "recommendations": ["..."]}'
    )

    try:
        resp = await oai_client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            response_format={"type": "json_object"},
        )
        data = json.loads(resp.choices[0].message.content or "{}")
        return data.get("insights", []), data.get("recommendations", [])
    except Exception:
        logger.exception("Insight generation failed")
        return ["Analysis could not be generated."], ["Please try again."]
