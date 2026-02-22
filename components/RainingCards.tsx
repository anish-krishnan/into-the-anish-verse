"use client";

import { useState, useEffect, useMemo } from "react";

interface CardWithUrls {
  id: string;
  title: string;
  compositeImageUrl: string | null;
}

interface RainingCardsProps {
  cards: CardWithUrls[];
}

const NEON_COLORS = [
  { border: "rgba(0,240,255,0.4)", shadow: "0 0 8px rgba(0,240,255,0.3), 0 0 20px rgba(0,240,255,0.15)" },
  { border: "rgba(255,0,170,0.4)", shadow: "0 0 8px rgba(255,0,170,0.3), 0 0 20px rgba(255,0,170,0.15)" },
  { border: "rgba(0,255,136,0.4)", shadow: "0 0 8px rgba(0,255,136,0.3), 0 0 20px rgba(0,255,136,0.15)" },
  { border: "rgba(255,136,0,0.4)", shadow: "0 0 8px rgba(255,136,0,0.3), 0 0 20px rgba(255,136,0,0.15)" },
  { border: "rgba(170,0,255,0.4)", shadow: "0 0 8px rgba(170,0,255,0.3), 0 0 20px rgba(170,0,255,0.15)" },
  { border: "rgba(255,204,0,0.4)", shadow: "0 0 8px rgba(255,204,0,0.3), 0 0 20px rgba(255,204,0,0.15)" },
];

const NUM_COLUMNS = 5;
const MAX_PER_COLUMN = 2;
const MIN_CARDS = 100;

interface FallingCardData {
  key: string;
  url: string;
  title: string;
  column: number;
  duration: number;
  delay: number;
  rotation: number;
  scale: number;
  color: typeof NEON_COLORS[number];
}

function generateFallingCards(cards: CardWithUrls[]): FallingCardData[] {
  // Duplicate cards if needed to fill the screen
  let pool = [...cards];
  while (pool.length < MIN_CARDS) {
    pool = [...pool, ...cards];
  }

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Distribute into columns
  const columnBuckets: CardWithUrls[][] = Array.from({ length: NUM_COLUMNS }, () => []);
  pool.forEach((card, i) => {
    columnBuckets[i % NUM_COLUMNS].push(card);
  });

  // Pick a random duration per column, then evenly stagger delays
  // so cards in the same column never overlap.
  // Limit to MAX_PER_COLUMN cards per column to guarantee spacing.
  const result: FallingCardData[] = [];
  columnBuckets.forEach((colCards, colIdx) => {
    const limited = colCards;
    const duration = 20 + Math.random() * 10; // 20-30s, same for all cards in this column
    const n = limited.length;

    limited.forEach((card, i) => {
      result.push({
        key: `${card.id}-${colIdx}-${i}`,
        url: card.compositeImageUrl!,
        title: card.title,
        column: colIdx,
        duration,
        delay: -(i * duration / n), // evenly spaced within the animation cycle
        rotation: -2 + Math.random() * 4, // ±2 deg (tighter to stay in column)
        scale: 1,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      });
    });
  });

  return result;
}

function preloadImages(urls: string[]): Promise<void> {
  const unique = [...new Set(urls)];
  return new Promise((resolve) => {
    let loaded = 0;
    const total = unique.length;
    if (total === 0) { resolve(); return; }

    unique.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded >= total) resolve();
      };
      img.src = url;
    });

    // Safety timeout — don't wait forever
    setTimeout(resolve, 10000);
  });
}

export default function RainingCards({ cards }: RainingCardsProps) {
  const [ready, setReady] = useState(false);

  const fallingCards = useMemo(() => generateFallingCards(cards), [cards]);

  useEffect(() => {
    const urls = cards
      .map((c) => c.compositeImageUrl)
      .filter((u): u is string => !!u);
    preloadImages(urls).then(() => setReady(true));
  }, [cards]);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-navy">
        <p className="font-arcade text-sm text-neon-cyan animate-pulse">
          LOADING CARDS...
        </p>
      </div>
    );
  }

  // Group cards by column
  const columns: FallingCardData[][] = Array.from({ length: NUM_COLUMNS }, () => []);
  for (const card of fallingCards) {
    columns[card.column].push(card);
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-animated relative">
      {columns.map((colCards, colIdx) => {
        // Each column: center the card within the column slot
        const colWidth = 100 / NUM_COLUMNS;
        const cardWidth = colWidth - 2; // 2% gap
        const leftPercent = colIdx * colWidth + (colWidth - cardWidth) / 2;

        return colCards.map((card) => (
          <div
            key={card.key}
            className="falling-card"
            style={{
              "--duration": `${card.duration}s`,
              "--delay": `${card.delay}s`,
              "--rotation": `${card.rotation}deg`,
              "--card-scale": card.scale,
              left: `${leftPercent}%`,
              width: `${cardWidth}%`,
              overflow: "hidden",
            } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.url}
              alt={card.title}
              className="w-full h-auto block"
              loading="eager"
              draggable={false}
            />
          </div>
        ));
      })}
    </div>
  );
}
