"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from "recharts";
import {
  Trophy,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Lightbulb,
  Target,
  BarChart3,
  Zap,
  ShoppingCart,
  Brain,
} from "lucide-react";
import { DiagnosticReport, BrandVisibility, SimilarityScore } from "@/lib/types";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#B4FF39",
  anthropic: "#FBBF24",
  gemini: "#6EE7B7",
};

const PROVIDER_NAMES: Record<string, string> = {
  openai: "GPT-4.1 Mini",
  anthropic: "Claude Sonnet 4",
  gemini: "Gemini 2.0 Flash",
};

const SCORE_COLORS = [
  "#B4FF39",
  "#6EE7B7",
  "#FBBF24",
  "#F472B6",
  "#FF4D4F",
];

function getScoreColor(score: number): string {
  if (score >= 80) return SCORE_COLORS[0];
  if (score >= 60) return SCORE_COLORS[1];
  if (score >= 40) return SCORE_COLORS[2];
  if (score >= 20) return SCORE_COLORS[3];
  return SCORE_COLORS[4];
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Not Visible";
}

interface ReportCardProps {
  report: DiagnosticReport;
}

function OverviewSection({ report }: ReportCardProps) {
  const topBrand = report.brand_visibility[0];
  const avgScore =
    report.brand_visibility.length > 0
      ? Math.round(
          report.brand_visibility.reduce((sum: number, b: BrandVisibility) => sum + b.overall_score, 0) /
            report.brand_visibility.length
        )
      : 0;

  const totalProducts = new Set(
    report.llm_responses.flatMap((r) => r.products.map((p) => p.brand.toLowerCase()))
  ).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border border-[#B4FF39]/20 bg-[#B4FF39]/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-[#B4FF39]/10">
              <Brain className="w-5 h-5 text-[#B4FF39]" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">AIs Queried</p>
              <p className="text-3xl font-bold">{report.llm_responses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-[#FBBF24]/10">
              <ShoppingCart className="w-5 h-5 text-[#FBBF24]" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">Amazon Results</p>
              <p className="text-3xl font-bold">{report.amazon_products.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-[#6EE7B7]/10">
              <Eye className="w-5 h-5 text-[#6EE7B7]" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">Brands Found</p>
              <p className="text-3xl font-bold">{totalProducts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[10px] bg-[#F472B6]/10">
              <Trophy className="w-5 h-5 text-[#F472B6]" />
            </div>
            <div>
              <p className="text-base text-muted-foreground">Top Brand</p>
              <p className="text-xl font-bold truncate">
                {topBrand?.brand || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandRankingsChart({ report }: ReportCardProps) {
  const data = report.brand_visibility.slice(0, 10).map((b: BrandVisibility) => ({
    brand: b.brand.length > 12 ? b.brand.slice(0, 12) + "..." : b.brand,
    score: b.overall_score,
    fullBrand: b.brand,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          AI Visibility Scores
        </CardTitle>
        <CardDescription>
          How visible each brand is across GPT, Claude, and Gemini (0-100)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2A2D31" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
            <YAxis type="category" dataKey="brand" width={110} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#17191C] border border-[#2A2D31] rounded-[10px] p-3 shadow-lg">
                    <p className="font-semibold text-[#ECEDEE]">{d.fullBrand}</p>
                    <p className="text-sm text-[#9CA3AF]">
                      Score: <span className="font-bold text-[#ECEDEE]">{d.score}/100</span>
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {getScoreLabel(d.score)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {data.map((entry: { score: number }, index: number) => (
                <Cell key={index} fill={getScoreColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RadarComparison({ report }: ReportCardProps) {
  const top5 = report.brand_visibility.slice(0, 5);

  const radarData = top5.map((b: BrandVisibility) => ({
    brand: b.brand.length > 10 ? b.brand.slice(0, 10) + "..." : b.brand,
    GPT: b.openai_rank ? Math.max(0, 11 - b.openai_rank) : 0,
    Claude: b.anthropic_rank ? Math.max(0, 11 - b.anthropic_rank) : 0,
    Gemini: b.gemini_rank ? Math.max(0, 11 - b.gemini_rank) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Per-AI Radar Comparison
        </CardTitle>
        <CardDescription>
          Top 5 brands — higher values mean higher ranking (max 10)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2A2D31" />
            <PolarAngleAxis dataKey="brand" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <Radar
              name="GPT-4o"
              dataKey="GPT"
              stroke={PROVIDER_COLORS.openai}
              fill={PROVIDER_COLORS.openai}
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="Claude"
              dataKey="Claude"
              stroke={PROVIDER_COLORS.anthropic}
              fill={PROVIDER_COLORS.anthropic}
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name="Gemini"
              dataKey="Gemini"
              stroke={PROVIDER_COLORS.gemini}
              fill={PROVIDER_COLORS.gemini}
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function BrandTable({ report }: ReportCardProps) {
  const renderRank = (rank: number | null) => {
    if (rank === null) return <span className="text-muted-foreground">—</span>;
    return (
      <Badge
        variant={rank <= 3 ? "default" : "secondary"}
        className={rank <= 3 ? "bg-[#B4FF39] text-[#0E1013]" : ""}
      >
        #{rank}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Brand Visibility Matrix
        </CardTitle>
        <CardDescription>
          Rankings across each AI engine and Amazon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold">Brand</th>
                <th className="text-center py-3 px-2 font-semibold">Score</th>
                <th className="text-center py-3 px-2 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PROVIDER_COLORS.openai }}
                    />
                    GPT-4o
                  </span>
                </th>
                <th className="text-center py-3 px-2 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PROVIDER_COLORS.anthropic }}
                    />
                    Claude
                  </span>
                </th>
                <th className="text-center py-3 px-2 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: PROVIDER_COLORS.gemini }}
                    />
                    Gemini
                  </span>
                </th>
                <th className="text-center py-3 px-2 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3" />
                    Amazon
                  </span>
                </th>
                <th className="text-center py-3 px-2 font-semibold">Similarity</th>
              </tr>
            </thead>
            <tbody>
              {report.brand_visibility.slice(0, 15).map((brand: BrandVisibility, i: number) => (
                <tr key={i} className="border-b hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{brand.brand}</td>
                  <td className="text-center py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <Progress
                        value={brand.overall_score}
                        className="w-16 h-2"
                      />
                      <span
                        className="font-bold text-xs"
                        style={{ color: getScoreColor(brand.overall_score) }}
                      >
                        {brand.overall_score}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2">
                    {renderRank(brand.openai_rank)}
                  </td>
                  <td className="text-center py-3 px-2">
                    {renderRank(brand.anthropic_rank)}
                  </td>
                  <td className="text-center py-3 px-2">
                    {renderRank(brand.gemini_rank)}
                  </td>
                  <td className="text-center py-3 px-2">
                    {renderRank(brand.amazon_rank)}
                  </td>
                  <td className="text-center py-3 px-2">
                    <span className="text-xs">
                      {brand.avg_similarity_to_amazon > 0
                        ? `${Math.round(brand.avg_similarity_to_amazon * 100)}%`
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function SimilarityHeatmap({ report }: ReportCardProps) {
  if (report.similarity_matrix.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI vs Amazon Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-base">
            No Amazon results to compare against. Add a SERPAPI_KEY for full analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by LLM product → keep only the best Amazon match per LLM product
  const bestMatches = new Map<string, SimilarityScore>();
  for (const match of report.similarity_matrix) {
    const existing = bestMatches.get(match.llm_product);
    if (!existing || match.score > existing.score) {
      bestMatches.set(match.llm_product, match);
    }
  }
  const grouped = Array.from(bestMatches.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const avgScore = grouped.length > 0
    ? Math.round(grouped.reduce((s, m) => s + m.score * 100, 0) / grouped.length)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI vs Amazon — Best Matches
          </CardTitle>
          <CardDescription>
            For each AI-recommended product, the closest matching Amazon listing based on semantic similarity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm text-muted-foreground">Average Match Score</p>
              <p className="text-3xl font-bold" style={{ color: getScoreColor(avgScore) }}>
                {avgScore}%
              </p>
            </div>
            <div className="flex-1">
              <Progress value={avgScore} className="h-3" />
            </div>
            <Badge variant="secondary" className="text-sm">
              {getScoreLabel(avgScore)}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_80px_1fr] gap-3 px-3 pb-2 border-b text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><Brain className="w-4 h-4" /> AI Recommended</span>
              <span className="text-center">Match</span>
              <span className="flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> Amazon Listing</span>
            </div>

            {grouped.map((match: SimilarityScore, i: number) => {
              const pct = Math.round(match.score * 100);
              return (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_80px_1fr] gap-3 items-center p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-base font-medium leading-snug">{match.llm_product}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span
                      className="text-lg font-bold"
                      style={{ color: getScoreColor(pct) }}
                    >
                      {pct}%
                    </span>
                    <div className="w-full mt-1">
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-base text-muted-foreground leading-snug">
                      {match.amazon_product.length > 80
                        ? match.amazon_product.slice(0, 80) + "…"
                        : match.amazon_product}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LLMResponseTimes({ report }: ReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Response Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {report.llm_responses.map((response) => (
            <div key={response.provider} className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: PROVIDER_COLORS[response.provider] }}
              />
              <span className="font-medium w-24 text-base">
                {PROVIDER_NAMES[response.provider]}
              </span>
              <Progress
                value={Math.min(
                  100,
                  (response.response_time_ms / 15000) * 100
                )}
                className="flex-1 h-2"
              />
              <span className="text-sm text-muted-foreground w-16 text-right">
                {(response.response_time_ms / 1000).toFixed(1)}s
              </span>
              <Badge variant="secondary" className="w-20 justify-center">
                {response.products.length} products
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightsSection({ report }: ReportCardProps) {
  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#B4FF39]/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#B4FF39]" />
            </div>
            <div>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>What the data tells us about this market</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.overall_insights.map((insight: string, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-[10px] bg-[#1E2024]">
                <span className="w-7 h-7 rounded-full bg-[#B4FF39] text-[#0E1013] font-mono text-[0.75rem] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-[0.92rem] text-[#ECEDEE] leading-[1.55]">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#6EE7B7]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#6EE7B7]" />
            </div>
            <div>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>What brands should do to improve AI visibility</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-[10px] border border-[#2A2D31]">
                <div className="w-7 h-7 rounded-full bg-[#6EE7B7]/10 flex items-center justify-center shrink-0">
                  <Target className="w-3.5 h-3.5 text-[#6EE7B7]" />
                </div>
                <p className="text-[0.92rem] text-[#ECEDEE] leading-[1.55]">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[#ECEDEE]" style={{ fontFamily: "var(--font-display)" }}>
          AEO Diagnostic Report
        </h2>
        <p className="text-[#9CA3AF]">
          Query: <span className="font-medium text-[#ECEDEE]">&ldquo;{report.query}&rdquo;</span>
        </p>
        <p className="font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF]">
          Generated {new Date(report.timestamp).toLocaleString()}
        </p>
      </div>

      <OverviewSection report={report} />

      <Tabs defaultValue="visibility" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="comparison">AI Comparison</TabsTrigger>
          <TabsTrigger value="similarity">Similarity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="raw">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="visibility" className="space-y-6 mt-6">
          <BrandRankingsChart report={report} />
          <BrandTable report={report} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6 mt-6">
          <RadarComparison report={report} />
          <LLMResponseTimes report={report} />
        </TabsContent>

        <TabsContent value="similarity" className="space-y-6 mt-6">
          <SimilarityHeatmap report={report} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-6">
          <InsightsSection report={report} />
        </TabsContent>

        <TabsContent value="raw" className="space-y-6 mt-6">
          {report.llm_responses.map((response) => (
            <Card key={response.provider}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PROVIDER_COLORS[response.provider] }}
                  />
                  {PROVIDER_NAMES[response.provider]} Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-base bg-muted p-4 rounded-lg overflow-auto max-h-96">
                  {response.raw_response}
                </pre>
              </CardContent>
            </Card>
          ))}

          {report.amazon_products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Amazon Search Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.amazon_products.map((product, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Badge variant="outline" className="flex-shrink-0">
                        #{product.rank}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.brand} · {product.price} ·{" "}
                          {product.rating > 0
                            ? `${product.rating}★ (${product.review_count})`
                            : "No rating"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
