"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";

const EXAMPLE_QUERIES = [
  "best wireless earbuds under ₹5000",
  "organic ghee for cooking",
  "best protein powder for gym",
  "air purifier for Delhi pollution",
  "ergonomic office chair under ₹15000",
];

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-base text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5" />
          AI Engine Optimization Diagnostic
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          How visible is your product
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            across AI engines?
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enter a shopper&apos;s query to see how GPT, Claude, and Gemini recommend
          products — and how those compare to real Amazon results.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder='Try "best wireless earbuds under ₹5000"'
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full pl-12 h-16 text-lg rounded-xl border-2 border-input bg-transparent px-2.5 py-1 outline-none focus:border-violet-500 transition-colors placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            onClick={() => { if (query.trim() && !isLoading) onSearch(query.trim()); }}
            className="h-16 px-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-lg font-medium inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Diagnose"
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <p className="text-base text-muted-foreground text-center">
          Try an example query:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              onClick={() => {
                setQuery(example);
                if (!isLoading) onSearch(example);
              }}
              disabled={isLoading}
              className="px-4 py-2 text-base rounded-lg border bg-card hover:bg-accent transition-colors disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
