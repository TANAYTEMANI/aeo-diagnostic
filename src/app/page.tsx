"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form";
import { ReportCard } from "@/components/report-card";
import { LoadingState } from "@/components/loading-state";
import { DiagnosticReport } from "@/lib/types";
import {
  ArrowLeft,
  Brain,
  ShoppingCart,
  Cpu,
  BarChart3,
  TrendingUp,
  Zap,
  Eye,
} from "lucide-react";

const STEPS = [
  {
    icon: Brain,
    title: "Query AI Engines",
    desc: "GPT-4.1 Mini, Claude Sonnet 4, and Gemini Flash answer your product query in parallel.",
    color: "#0866FF",
  },
  {
    icon: ShoppingCart,
    title: "Fetch Amazon.in",
    desc: "Real-time product listings pulled via SerpAPI to ground AI answers in market reality.",
    color: "#FF6D00",
  },
  {
    icon: Cpu,
    title: "Compute Similarity",
    desc: "OpenAI embeddings with cosine similarity reveal how well AI picks match real products.",
    color: "#00C853",
  },
  {
    icon: BarChart3,
    title: "Score & Report",
    desc: "Brand visibility scores, similarity matrices, and actionable insights — all in one view.",
    color: "#AA00FF",
  },
];

const FEATURES = [
  {
    icon: Eye,
    title: "Brand Visibility Scoring",
    desc: "See which brands dominate AI recommendations with a 0–100 composite score across all engines.",
  },
  {
    icon: Zap,
    title: "AI vs Amazon Match",
    desc: "Embedding-based semantic similarity shows how closely AI recommendations align with real listings.",
  },
  {
    icon: TrendingUp,
    title: "Actionable Insights",
    desc: "GPT-generated analysis of gaps, opportunities, and what brands need to do to improve visibility.",
  },
];

export default function Home() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string, llms: string[] = ["openai", "anthropic", "gemini"]) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, llms }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data: DiagnosticReport = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="border-b border-[#2A2D31] bg-[#17191C] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#B4FF39] flex items-center justify-center">
              <span className="text-[#0E1013] font-bold text-xs">AEO</span>
            </div>
            <span className="font-semibold text-[1.05rem] text-[#ECEDEE]">Diagnostic</span>
          </div>
          {!report && !isLoading && (
            <a
              href="https://github.com/TANAYTEMANI/aeo-diagnostic"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF] hover:text-[#ECEDEE] transition-colors"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </header>

      {isLoading ? (
        <main className="flex-1 px-6 py-16">
          <LoadingState />
        </main>
      ) : report ? (
        <main className="flex-1 px-6 py-8">
          <div className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => {
                  setReport(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF] hover:bg-[#1E2024] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                New Search
              </button>
            </div>
            <ReportCard report={report} />
          </div>
        </main>
      ) : (
        <>
          {/* Hero */}
          <section className="px-6 pt-20 pb-16">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            {error && (
              <div className="max-w-2xl mx-auto mt-4">
                <div className="bg-[#FF4D4F]/10 border border-[#FF4D4F]/20 rounded-[10px] p-4 text-[#FF4D4F] text-[0.95rem]">
                  <p className="font-semibold">Analysis failed</p>
                  <p className="text-[#9CA3AF]">{error}</p>
                </div>
              </div>
            )}
          </section>

          {/* How It Works */}
          <section className="px-6 py-20 bg-[#17191C]">
            <div className="max-w-4xl mx-auto">
              <p className="font-mono text-[0.75rem] tracking-[0.02em] text-[#B4FF39] text-center mb-3 uppercase">
                Pipeline
              </p>
              <h2 className="text-[2.25rem] font-semibold tracking-[-0.03em] text-[#ECEDEE] text-center mb-2" style={{ fontFamily: "var(--font-display)" }}>
                How it works
              </h2>
              <p className="text-[0.95rem] text-[#9CA3AF] text-center mb-12 leading-[1.55]">
                From query to report in under 60 seconds
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="text-center">
                      <div className="w-12 h-12 rounded-[14px] mx-auto mb-4 flex items-center justify-center bg-[#1E2024] border border-[#2A2D31]">
                        <Icon className="w-5 h-5 text-[#B4FF39]" />
                      </div>
                      <p className="font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF] mb-1">
                        0{i + 1}
                      </p>
                      <p className="text-[0.95rem] font-semibold text-[#ECEDEE] mb-1">
                        {step.title}
                      </p>
                      <p className="text-[0.82rem] text-[#9CA3AF] leading-[1.55]">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="px-6 py-20">
            <div className="max-w-4xl mx-auto">
              <p className="font-mono text-[0.75rem] tracking-[0.02em] text-[#B4FF39] text-center mb-3 uppercase">
                Output
              </p>
              <h2 className="text-[2.25rem] font-semibold tracking-[-0.03em] text-[#ECEDEE] text-center mb-2" style={{ fontFamily: "var(--font-display)" }}>
                What you get
              </h2>
              <p className="text-[0.95rem] text-[#9CA3AF] text-center mb-12 leading-[1.55]">
                A comprehensive diagnostic report across five dimensions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {FEATURES.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      className="bg-[#17191C] rounded-[14px] border border-[#2A2D31] p-6"
                    >
                      <div className="w-10 h-10 rounded-[10px] bg-[#B4FF39]/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-[#B4FF39]" />
                      </div>
                      <p className="text-[0.95rem] font-semibold text-[#ECEDEE] mb-1">
                        {f.title}
                      </p>
                      <p className="text-[0.82rem] text-[#9CA3AF] leading-[1.55]">
                        {f.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Powered By */}
          <section className="px-6 py-12 bg-[#17191C] border-t border-[#2A2D31]">
            <div className="max-w-4xl mx-auto text-center">
              <p className="font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF] mb-5 uppercase">
                Powered by
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {[
                  "GPT-4.1 Mini",
                  "Claude Sonnet 4",
                  "Gemini 2.0 Flash",
                  "OpenAI Embeddings",
                  "SerpAPI",
                  "Amazon.in",
                ].map((name) => (
                  <span
                    key={name}
                    className="text-[0.88rem] font-medium text-[#ECEDEE]/40"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="px-6 py-6 border-t border-[#2A2D31] text-center">
            <p className="font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF]">
              Built by Tanay Temani
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
