"use client";

import { useState } from "react";
import NeonButton from "./NeonButton";

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

interface AdminGalleryProps {
  cards: CardWithUrls[];
}

async function downloadSingleCard(url: string, filename: string) {
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

export default function AdminGallery({ cards }: AdminGalleryProps) {
  const [selectedCard, setSelectedCard] = useState<CardWithUrls | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadAll() {
    setDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const card of cards) {
        if (!card.compositeImageUrl) continue;
        try {
          const response = await fetch(card.compositeImageUrl);
          const blob = await response.blob();
          const filename = `${card.title.replace(/[^a-zA-Z0-9]/g, "-")}-${card.id.slice(0, 8)}.png`;
          zip.file(filename, blob);
        } catch {
          console.error(`Failed to download card ${card.id}`);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "anish-verse-cards.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Bulk download failed:", err);
      alert("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="font-arcade text-lg sm:text-xl text-neon-cyan mb-2">
          ANISH-VERSE ADMIN
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">
            {cards.length} card{cards.length !== 1 ? "s" : ""} generated
          </p>
          {cards.length > 0 && (
            <NeonButton
              onClick={handleDownloadAll}
              variant="green"
              disabled={downloading}
              className="text-xs px-4 py-2"
            >
              {downloading ? "ZIPPING..." : "DOWNLOAD ALL"}
            </NeonButton>
          )}
        </div>
      </div>

      {/* Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-arcade text-sm text-white/30">
            NO CARDS YET
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="border border-white/10 rounded-lg overflow-hidden bg-navy-light hover:border-neon-cyan/30 transition-all cursor-pointer group"
              onClick={() => setSelectedCard(card)}
            >
              {card.compositeImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.compositeImageUrl}
                  alt={card.title}
                  className="w-full h-auto group-hover:scale-[1.02] transition-transform"
                />
              )}
              <div className="p-4">
                <h3 className="font-arcade text-xs text-neon-cyan mb-1">
                  {card.title}
                </h3>
                <p className="text-white/30 text-xs">
                  {new Date(card.created_at).toLocaleString()}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-white/50">
                  <span>
                    {card.stat1_name}: {card.stat1_level}/6
                  </span>
                  <span>
                    {card.stat2_name}: {card.stat2_level}/6
                  </span>
                </div>
              </div>
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
                    downloadSingleCard(
                      selectedCard.compositeImageUrl,
                      `${selectedCard.title}-${selectedCard.id.slice(0, 8)}.png`
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
