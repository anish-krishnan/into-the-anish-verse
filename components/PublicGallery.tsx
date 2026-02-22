"use client";

import { useState } from "react";
import NeonButton from "./NeonButton";

interface CardWithUrls {
  id: string;
  title: string;
  compositeImageUrl: string | null;
}

interface PublicGalleryProps {
  cards: CardWithUrls[];
}

async function downloadCard(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export default function PublicGallery({ cards }: PublicGalleryProps) {
  const [selectedCard, setSelectedCard] = useState<CardWithUrls | null>(null);

  const cardsWithImages = cards.filter((c) => c.compositeImageUrl);

  return (
    <div className="min-h-screen bg-navy px-4 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="font-arcade text-lg sm:text-2xl text-neon-cyan neon-text-cyan mb-3">
          ANISH&apos;S TOP PICKS
        </h1>
      </div>

      {/* Grid */}
      {cardsWithImages.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-arcade text-sm text-white/30">NO CARDS YET</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardsWithImages.map((card) => (
            <div
              key={card.id}
              className="relative border border-white/10 rounded-lg overflow-hidden bg-navy-light hover:border-neon-cyan/40 transition-all cursor-pointer group"
              onClick={() => setSelectedCard(card)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.compositeImageUrl!}
                alt={card.title}
                className="w-full h-auto group-hover:scale-[1.02] transition-transform"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedCard.compositeImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedCard.compositeImageUrl}
                alt={selectedCard.title}
                className="w-full h-auto rounded-lg mb-4"
              />
            )}
            <div className="flex gap-4">
              <NeonButton
                onClick={() => {
                  if (selectedCard.compositeImageUrl) {
                    downloadCard(
                      selectedCard.compositeImageUrl,
                      `anish-verse-${selectedCard.title.replace(/[^a-zA-Z0-9]/g, "-")}.png`
                    );
                  }
                }}
                variant="green"
                className="flex-1 text-xs"
              >
                DOWNLOAD
              </NeonButton>
              <NeonButton
                onClick={() => setSelectedCard(null)}
                variant="pink"
                className="flex-1 text-xs"
              >
                CLOSE
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
