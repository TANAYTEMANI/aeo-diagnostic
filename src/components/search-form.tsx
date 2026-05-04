"use client";

import { useState } from "react";
import { Search, Loader2, ArrowUp, Sparkles } from "lucide-react";

const EXAMPLE_QUERIES = [
  "best wireless earbuds under ₹5000",
  "organic ghee for cooking",
  "best protein powder for gym",
  "air purifier for Delhi pollution",
];

const LLM_OPTIONS = [
  { id: "openai", label: "GPT-4.1 Mini", icon: "✦" },
  { id: "anthropic", label: "Claude Sonnet 4", icon: "✧" },
  { id: "gemini", label: "Gemini Flash", icon: "◈" },
];

interface SearchFormProps {
  onSearch: (query: string, llms: string[]) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [selectedLLMs, setSelectedLLMs] = useState<string[]>(["openai", "anthropic", "gemini"]);

  const toggleLLM = (id: string) => {
    setSelectedLLMs((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((l) => l !== id);
      }
      return [...prev, id];
    });
  };

  const handleSubmit = () => {
    if (query.trim() && !isLoading && selectedLLMs.length > 0) {
      onSearch(query.trim(), selectedLLMs);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight" style={{ color: "#ffffff" }}>
          How visible is your product{" "}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            across AI engines?
          </span>
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          See how AI recommends products for any query — and compare against real Amazon.in results.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#111827] shadow-lg shadow-black/20">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Enter a product query..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              disabled={isLoading}
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-600 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading || selectedLLMs.length === 0}
              className="w-8 h-8 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 inline-flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/[0.06]">
          {LLM_OPTIONS.map((llm) => {
            const isSelected = selectedLLMs.includes(llm.id);
            return (
              <button
                key={llm.id}
                type="button"
                onClick={() => toggleLLM(llm.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-500/15 text-teal-400 border border-teal-500/25"
                    : "text-slate-500 border border-transparent hover:text-slate-400"
                }`}
              >
                <span>{llm.icon}</span>
                {llm.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example}
            onClick={() => {
              setQuery(example);
              if (!isLoading) onSearch(example, selectedLLMs);
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all disabled:opacity-50 text-slate-400 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
