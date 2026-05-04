from pydantic import BaseModel


class ProductMention(BaseModel):
    name: str
    brand: str
    rank: int
    attributes: list[str]
    reasoning: str


class LLMResponse(BaseModel):
    provider: str  # "openai" | "anthropic" | "gemini"
    raw_response: str
    products: list[ProductMention]
    response_time_ms: int


class AmazonProduct(BaseModel):
    title: str
    brand: str
    rank: int
    rating: float
    review_count: int
    price: str
    url: str
    thumbnail: str | None = None


class SimilarityScore(BaseModel):
    llm_product: str
    amazon_product: str
    score: float


class BrandVisibility(BaseModel):
    brand: str
    overall_score: int
    openai_rank: int | None
    anthropic_rank: int | None
    gemini_rank: int | None
    amazon_rank: int | None
    mention_count: int
    avg_similarity_to_amazon: float
    key_attributes: list[str]


class DiagnosticReport(BaseModel):
    query: str
    timestamp: str
    llm_responses: list[LLMResponse]
    amazon_products: list[AmazonProduct]
    brand_visibility: list[BrandVisibility]
    similarity_matrix: list[SimilarityScore]
    overall_insights: list[str]
    recommendations: list[str]


class AnalyzeRequest(BaseModel):
    query: str
