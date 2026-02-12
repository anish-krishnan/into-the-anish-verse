"use client";

import { motion } from "framer-motion";
import NeonButton from "./NeonButton";
import type { CardFormData, GenerateResponse } from "@/lib/types";

interface CardDisplayProps {
  result: GenerateResponse;
  formData: CardFormData;
  onCreateAnother: () => void;
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

export default function CardDisplay({
  result,
  formData,
  onCreateAnother,
}: CardDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-start px-4 py-8 sm:py-16"
    >
      <motion.h2
        className="font-arcade text-sm sm:text-lg text-neon-green neon-text-green mb-6 text-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        CARD GENERATED!
      </motion.h2>

      {/* Card Image */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="w-full max-w-[400px] sm:max-w-[500px] mb-8"
      >
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute inset-0 bg-neon-cyan/10 blur-3xl rounded-3xl" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.compositeImageUrl}
            alt={`${formData.title} trading card`}
            className="relative w-full h-auto rounded-lg shadow-2xl"
          />
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px]"
      >
        <NeonButton
          onClick={() =>
            downloadCard(
              result.compositeImageUrl,
              `anish-verse-${formData.title.toLowerCase().replace(/\s+/g, "-")}.png`
            )
          }
          variant="green"
          className="flex-1"
        >
          DOWNLOAD
        </NeonButton>
        <NeonButton
          onClick={onCreateAnother}
          variant="pink"
          className="flex-1"
        >
          CREATE ANOTHER
        </NeonButton>
      </motion.div>
    </motion.div>
  );
}
