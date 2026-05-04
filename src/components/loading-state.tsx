"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Brain, ShoppingCart, Cpu, BarChart3, Zap, Eye, TrendingUp } from "lucide-react";

const STEPS = [
  { label: "Querying AIs", detail: "GPT-4.1 Mini · Claude Sonnet 4 · Gemini Flash", icon: Brain, duration: 8000, color: "#0866FF" },
  { label: "Amazon Search", detail: "Fetching real Amazon.in listings", icon: ShoppingCart, duration: 6000, color: "#FF6D00" },
  { label: "Embeddings", detail: "Computing semantic similarity", icon: Cpu, duration: 8000, color: "#00C853" },
  { label: "Analysis", detail: "Scoring brands & generating insights", icon: BarChart3, duration: 6000, color: "#AA00FF" },
];

const DID_YOU_KNOW = [
  { icon: Brain, text: "3 AI models are answering your query simultaneously using asyncio.gather" },
  { icon: Eye, text: "Brand visibility is scored 0–100 based on mention breadth, rank, and similarity" },
  { icon: Zap, text: "Embeddings use text-embedding-3-large with Matryoshka dimensionality reduction" },
  { icon: TrendingUp, text: "Cosine similarity compares AI-recommended products against real Amazon listings" },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const factInterval = setInterval(() => setFactIndex((f) => (f + 1) % DID_YOU_KNOW.length), 4000);
    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    let total = 0;
    for (let i = 0; i < STEPS.length; i++) {
      total += STEPS[i].duration;
      if (elapsed < total) {
        setCurrentStep(i);
        return;
      }
    }
    setCurrentStep(STEPS.length - 1);
  }, [elapsed]);

  const totalDuration = STEPS.reduce((s, step) => s + step.duration, 0);
  const progress = Math.min(95, (elapsed / totalDuration) * 90);
  const seconds = Math.floor(elapsed / 1000);
  const currentFact = DID_YOU_KNOW[factIndex];
  const FactIcon = currentFact.icon;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10">
      <div className="text-center space-y-1">
        <h3 className="text-[1.4rem] font-semibold text-[#ECEDEE]" style={{ fontFamily: "var(--font-display)" }}>
          Running AEO Diagnostic
        </h3>
        <p className="text-[0.95rem] text-[#9CA3AF]">
          Analyzing product visibility across AI engines
        </p>
      </div>

      {/* Progress bar with timer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-[0.75rem] tracking-[0.02em]">
          <span className="text-[#9CA3AF]">
            {STEPS[currentStep]?.label}...
          </span>
          <span className="text-[#9CA3AF] tabular-nums">{seconds}s</span>
        </div>
        <div className="h-1.5 bg-[#1E2024] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#B4FF39] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step cards */}
      <div className="grid grid-cols-4 gap-3">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-4 rounded-[14px] border transition-all duration-300 ${
                isActive
                  ? "bg-[#17191C] border-[#B4FF39]/30"
                  : isComplete
                  ? "bg-[#17191C] border-[#2A2D31]"
                  : "bg-[#17191C]/50 border-[#2A2D31]/50 opacity-40"
              }`}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-2"
                style={{
                  backgroundColor: isActive || isComplete ? "#B4FF3914" : "#1E2024",
                }}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-[#B4FF39]" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#B4FF39]" />
                ) : (
                  <Icon className="w-5 h-5 text-[#9CA3AF]" />
                )}
              </div>
              <p className={`text-[0.78rem] font-semibold ${isActive || isComplete ? "text-[#ECEDEE]" : "text-[#9CA3AF]"}`}>
                {step.label}
              </p>
              <p className="font-mono text-[0.7rem] text-[#9CA3AF] mt-0.5 leading-snug">{step.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Rotating facts */}
      <div className="bg-[#17191C] rounded-[14px] border border-[#2A2D31] p-5 text-center">
        <p className="font-mono text-[0.75rem] tracking-[0.02em] text-[#9CA3AF] uppercase mb-3">
          Behind the scenes
        </p>
        <div className="flex items-center justify-center gap-3 min-h-[48px]">
          <div className="w-9 h-9 rounded-[10px] bg-[#B4FF39]/10 flex items-center justify-center shrink-0">
            <FactIcon className="w-4 h-4 text-[#B4FF39]" />
          </div>
          <p className="text-[0.88rem] text-[#ECEDEE] text-left leading-snug max-w-md">
            {currentFact.text}
          </p>
        </div>
      </div>
    </div>
  );
}
