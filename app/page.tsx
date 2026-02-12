"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LandingHero from "@/components/LandingHero";
import CardForm from "@/components/CardForm";
import LoadingScreen from "@/components/LoadingScreen";
import CardDisplay from "@/components/CardDisplay";
import type { CardFormData, GenerateResponse } from "@/lib/types";

type Phase = "landing" | "form" | "loading" | "result";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [formData, setFormData] = useState<CardFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(data: CardFormData) {
    setFormData(data);
    setPhase("loading");
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Generation failed");
      }

      const data2: GenerateResponse = await res.json();
      setResult(data2);
      setPhase("result");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Try again!"
      );
      setPhase("form");
    }
  }

  function handleCreateAnother() {
    setResult(null);
    setFormData(null);
    setError(null);
    setPhase("form");
  }

  return (
    <main className="min-h-screen bg-animated">
      <AnimatePresence mode="wait">
        {phase === "landing" && (
          <LandingHero key="landing" onStart={() => setPhase("form")} />
        )}

        {phase === "form" && (
          <CardForm
            key="form"
            onSubmit={handleGenerate}
            error={error}
            initialData={formData}
          />
        )}

        {phase === "loading" && <LoadingScreen key="loading" />}

        {phase === "result" && result && formData && (
          <CardDisplay
            key="result"
            result={result}
            formData={formData}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
