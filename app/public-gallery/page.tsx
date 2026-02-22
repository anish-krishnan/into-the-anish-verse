"use client";

import { useState, useEffect, useCallback } from "react";
import PublicGallery from "@/components/PublicGallery";

interface CardWithUrls {
  id: string;
  title: string;
  compositeImageUrl: string | null;
}

export default function PublicGalleryPage() {
  const [cards, setCards] = useState<CardWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch("/api/public-cards");
      if (!res.ok) throw new Error("Failed to fetch cards");
      const data = await res.json();
      setCards(data);
    } catch {
      setError("Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, []);

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

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-navy">
        <p className="text-neon-pink font-arcade text-sm">{error}</p>
      </div>
    );
  }

  return <PublicGallery cards={cards} />;
}
