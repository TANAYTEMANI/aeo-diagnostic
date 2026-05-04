import logging

import numpy as np
import openai

from models import LLMResponse, AmazonProduct, SimilarityScore

logger = logging.getLogger(__name__)


async def generate_embeddings(texts: list[str], oai_client: openai.AsyncOpenAI) -> np.ndarray:
    """Batch-embed using text-embedding-3-large with Matryoshka dim reduction to 1024."""
    if not texts:
        return np.array([])

    try:
        response = await oai_client.embeddings.create(
            model="text-embedding-3-large",
            input=texts,
            dimensions=1024,
        )
        return np.array([d.embedding for d in response.data])
    except Exception:
        logger.exception("Embedding generation failed")
        return np.array([])


def cosine_similarity_matrix(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Compute pairwise cosine similarity between two embedding matrices.

    Args:
        a: shape (M, D) — LLM product embeddings
        b: shape (N, D) — Amazon product embeddings

    Returns:
        shape (M, N) similarity matrix with values in [-1, 1]
    """
    if a.size == 0 or b.size == 0:
        return np.array([])

    # Normalise rows to unit vectors (filter zero-norm rows to avoid NaN)
    a_norms = np.linalg.norm(a, axis=1, keepdims=True)
    b_norms = np.linalg.norm(b, axis=1, keepdims=True)
    a_norms = np.where(a_norms == 0, 1.0, a_norms)
    b_norms = np.where(b_norms == 0, 1.0, b_norms)

    a_norm = a / a_norms
    b_norm = b / b_norms

    return np.clip(a_norm @ b_norm.T, -1.0, 1.0)


async def compute_similarity_scores(
    llm_responses: list[LLMResponse],
    amazon_products: list[AmazonProduct],
    oai_client: openai.AsyncOpenAI,
    threshold: float = 0.3,
) -> list[SimilarityScore]:
    """Build the full LLM-vs-Amazon similarity matrix and return above-threshold pairs."""

    # Build text descriptions for each side
    llm_items: list[tuple[str, str]] = []  # (label, text_for_embedding)
    for resp in llm_responses:
        for p in resp.products:
            label = p.name if p.name.lower().startswith(p.brand.lower()) else f"{p.brand} {p.name}"
            text = f"{label} — {', '.join(p.attributes)} — {p.reasoning}"
            llm_items.append((label, text))

    amazon_items: list[tuple[str, str]] = []
    for p in amazon_products:
        label = p.title if p.title.lower().startswith(p.brand.lower()) else f"{p.brand} {p.title}"
        amazon_items.append((label, label))

    if not llm_items or not amazon_items:
        return []

    # Single batch embedding call for efficiency
    all_texts = [t for _, t in llm_items] + [t for _, t in amazon_items]
    all_embeddings = await generate_embeddings(all_texts, oai_client)

    if all_embeddings.size == 0:
        return []

    llm_emb = all_embeddings[: len(llm_items)]
    amz_emb = all_embeddings[len(llm_items) :]

    sim_matrix = cosine_similarity_matrix(llm_emb, amz_emb)

    # Flatten into scored pairs
    scores: list[SimilarityScore] = []
    for i in range(sim_matrix.shape[0]):
        for j in range(sim_matrix.shape[1]):
            score = float(round(sim_matrix[i, j], 4))
            if score >= threshold:
                scores.append(
                    SimilarityScore(
                        llm_product=llm_items[i][0],
                        amazon_product=amazon_items[j][0],
                        score=score,
                    )
                )

    scores.sort(key=lambda s: s.score, reverse=True)
    return scores
