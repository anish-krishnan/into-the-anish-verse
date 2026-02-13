"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RainingCards from "@/components/RainingCards";

interface CardWithUrls {
  id: string;
  title: string;
  description: string;
  stat1_name: string;
  stat1_level: number;
  stat2_name: string;
  stat2_level: number;
  compositeImageUrl: string | null;
  rawImageUrl: string | null;
  created_at: string;
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  const [cards, setCards] = useState<CardWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (!key) {
      setError("unauthorized");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/cards?key=${encodeURIComponent(key)}`);
      if (res.status === 401) {
        setError("unauthorized");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch cards");

      const data = await res.json();
      setCards(data);
    } catch {
      setError("Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-navy">
        <p className="font-arcade text-sm text-neon-cyan animate-pulse">
          LOADING...
        </p>
      </div>
    );
  }

  if (error === "unauthorized") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-navy">
        <p className="font-arcade text-sm text-neon-pink neon-text-pink">
          ACCESS DENIED
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-navy">
        <p className="text-neon-pink">{error}</p>
      </div>
    );
  }

  // Filter to only cards with images
  const cardsWithImages = cards.filter((c) => c.compositeImageUrl);

  if (cardsWithImages.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-navy">
        <p className="font-arcade text-sm text-white/30">NO CARDS YET</p>
      </div>
    );
  }

  return <RainingCards cards={cardsWithImages} />;
}

export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-navy">
          <p className="font-arcade text-sm text-neon-cyan animate-pulse">
            LOADING...
          </p>
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}
