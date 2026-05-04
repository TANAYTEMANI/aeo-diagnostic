// Types mirror the Python Pydantic models (snake_case JSON keys)

export interface ProductMention {
  name: string;
  brand: string;
  rank: number;
  attributes: string[];
  reasoning: string;
}

export interface LLMResponse {
  provider: "openai" | "anthropic" | "gemini";
  raw_response: string;
  products: ProductMention[];
  response_time_ms: number;
}

export interface AmazonProduct {
  title: string;
  brand: string;
  rank: number;
  rating: number;
  review_count: number;
  price: string;
  url: string;
  thumbnail?: string;
}

export interface SimilarityScore {
  llm_product: string;
  amazon_product: string;
  score: number;
}

export interface BrandVisibility {
  brand: string;
  overall_score: number;
  openai_rank: number | null;
  anthropic_rank: number | null;
  gemini_rank: number | null;
  amazon_rank: number | null;
  mention_count: number;
  avg_similarity_to_amazon: number;
  key_attributes: string[];
}

export interface DiagnosticReport {
  query: string;
  timestamp: string;
  llm_responses: LLMResponse[];
  amazon_products: AmazonProduct[];
  brand_visibility: BrandVisibility[];
  similarity_matrix: SimilarityScore[];
  overall_insights: string[];
  recommendations: string[];
}

export interface AnalyzeRequest {
  query: string;
  llms: string[];
}
