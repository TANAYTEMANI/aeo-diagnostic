"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1
          className="text-[2.25rem] font-semibold tracking-[-0.03em] leading-tight text-[#ECEDEE]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          How visible is your product across AI engines?
        </h1>
        <p className="text-[0.95rem] text-[#9CA3AF] max-w-lg mx-auto leading-[1.55]">
          See how GPT, Claude, and Gemini recommend products — and compare against real Amazon.in results.
        </p>
      </div>

      <div className="rounded-[14px] border border-[#2A2D31] bg-[#17191C]">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            <input
              type="text"
              placeholder="Enter a product query..."
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              disabled={isLoading}
              className="w-full bg-transparent text-[#ECEDEE] text-[0.95rem] outline-none placeholder:text-[#9CA3AF]/40 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading || selectedLLMs.length === 0}
              className="px-5 py-2 rounded-[10px] bg-[#B4FF39] hover:bg-[#c5ff66] text-[#0E1013] text-[0.75rem] font-semibold tracking-[0.02em] inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Diagnose"
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-5 py-3 border-t border-[#2A2D31]">
          <span className="font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF] mr-2">Models</span>
          {LLM_OPTIONS.map((llm) => {
            const isSelected = selectedLLMs.includes(llm.id);
            return (
              <button
                key={llm.id}
                type="button"
                onClick={() => toggleLLM(llm.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] font-mono text-[0.75rem] tracking-[0.02em] transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#B4FF39]/10 text-[#B4FF39]"
                    : "text-[#9CA3AF] hover:bg-[#1E2024]"
                }`}
              >
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
            className="px-3.5 py-1.5 font-mono text-[0.75rem] tracking-[0.02em] rounded-[6px] border border-[#2A2D31] bg-[#17191C] hover:bg-[#1E2024] transition-colors disabled:opacity-50 text-[#9CA3AF] cursor-pointer"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
