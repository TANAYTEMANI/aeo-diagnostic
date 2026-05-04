"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Brain, ShoppingCart, Cpu, BarChart3 } from "lucide-react";

const STEPS = [
  { label: "Querying AIs", detail: "GPT-4.1 · Claude · Gemini", icon: Brain, duration: 8000 },
  { label: "Amazon Search", detail: "Fetching Amazon.in listings", icon: ShoppingCart, duration: 6000 },
  { label: "Embeddings", detail: "Semantic similarity", icon: Cpu, duration: 8000 },
  { label: "Analysis", detail: "Scoring & insights", icon: BarChart3, duration: 6000 },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 100), 100);
    return () => clearInterval(interval);
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Running AEO Diagnostic</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Analyzing product visibility across AI engines...
        </p>
      </div>

      <div className="relative">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={index}
              className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? "bg-teal-500/10 border-teal-500/30 shadow-sm shadow-teal-500/5 scale-[1.02]"
                  : isComplete
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-white/[0.02] border-white/5 opacity-50"
              }`}
            >
              <div className={`mb-2 ${isActive ? "text-teal-400" : isComplete ? "text-emerald-400" : "text-slate-500"}`}>
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isActive ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <p className={`text-sm font-medium ${isActive ? "text-teal-300" : isComplete ? "text-emerald-300" : "text-slate-400"}`}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground animate-pulse">
        This usually takes 30–60 seconds
      </p>
    </div>
  );
}
