"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form";
import { ReportCard } from "@/components/report-card";
import { LoadingState } from "@/components/loading-state";
import { DiagnosticReport } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-xl">AEO Diagnostic</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        {isLoading ? (
          <LoadingState />
        ) : report ? (
          <div className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <button
                onClick={() => {
                  setReport(null);
                  setError(null);
                }}
                className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                New Search
              </button>
            </div>
            <ReportCard report={report} />
          </div>
        ) : (
          <div className="space-y-6">
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />
            {error && (
              <div className="max-w-lg mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  <p className="font-medium">Analysis failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
