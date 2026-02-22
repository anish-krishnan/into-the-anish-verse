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
const MIN_CARDS = 100;
const CARD_GAP_VH = 30; // vertical gap between cards in vh units
const SECONDS_PER_CARD = 4.5; // how many seconds each card takes to scroll past

interface ColumnCardData {
  key: string;
  url: string;
  title: string;
  rotation: number;
  color: typeof NEON_COLORS[number];
}

interface ColumnData {
  cards: ColumnCardData[];
  duration: number; // total scroll duration for this column
}

function generateColumns(cards: CardWithUrls[]): ColumnData[] {
  // Duplicate cards if needed to fill the display
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

  return columnBuckets.map((colCards, colIdx) => ({
    cards: colCards.map((card, i) => ({
      key: `${card.id}-${colIdx}-${i}`,
      url: card.compositeImageUrl!,
      title: card.title,
      rotation: -2 + Math.random() * 4,
      color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
    })),
    // Slight speed variation per column so they don't move in lockstep
    duration: SECONDS_PER_CARD * colCards.length + Math.random() * 10,
  }));
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

  const columns = useMemo(() => generateColumns(cards), [cards]);

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

  return (
    <div className="h-screen w-screen overflow-hidden bg-animated relative">
      {columns.map((col, colIdx) => {
        const colWidth = 100 / NUM_COLUMNS;
        const cardWidth = colWidth - 2;
        const leftPercent = colIdx * colWidth + (colWidth - cardWidth) / 2;

        // Render cards twice for seamless looping
        const allCards = [...col.cards, ...col.cards];

        return (
          <div
            key={colIdx}
            className="scroll-column"
            style={{
              position: "absolute",
              left: `${leftPercent}%`,
              width: `${cardWidth}%`,
              height: "100vh",
              overflow: "hidden",
              // Fade edges so cards appear/disappear smoothly
              maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <div
              className="scroll-strip"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: `${CARD_GAP_VH}vh`,
                animation: `scrollDown ${col.duration}s linear infinite`,
              }}
            >
              {allCards.map((card, i) => (
                <div
                  key={`${card.key}-${i}`}
                  style={{
                    transform: `rotate(${card.rotation}deg)`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: `2px solid ${card.color.border}`,
                    boxShadow: card.color.shadow,
                  }}
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
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
