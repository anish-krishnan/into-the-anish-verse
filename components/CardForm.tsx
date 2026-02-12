"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NeonButton from "./NeonButton";
import StatBar from "./StatBar";
import { PRESETS } from "@/lib/presets";
import type { CardFormData } from "@/lib/types";

interface CardFormProps {
  onSubmit: (data: CardFormData) => void;
  error: string | null;
  initialData: CardFormData | null;
}

const DEFAULT_DATA: CardFormData = {
  title: "GYM BRO",
  description:
    "Tank top, protein shaker in hand, mid-flex, intense gym selfie energy, headband on",
  stat1Name: "STR",
  stat1Level: 5,
  stat2Name: "SPD",
  stat2Level: 3,
};

export default function CardForm({
  onSubmit,
  error,
  initialData,
}: CardFormProps) {
  const [formData, setFormData] = useState<CardFormData>(
    initialData || DEFAULT_DATA
  );
  const [isRandomizing, setIsRandomizing] = useState(false);

  function handleRandomize() {
    setIsRandomizing(true);
    const preset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setFormData(preset);
    setTimeout(() => setIsRandomizing(false), 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  function updateField<K extends keyof CardFormData>(
    key: K,
    value: CardFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col items-center justify-start px-4 py-8 sm:py-16"
    >
      <motion.h2
        className="font-arcade text-lg sm:text-xl text-neon-cyan neon-text-cyan mb-2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        CREATE YOUR CARD
      </motion.h2>
      <p className="font-arcade text-[10px] text-white/40 mb-8 text-center">
        Fill in the details or hit randomize
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[500px] mb-6 p-4 border border-neon-pink/50 bg-neon-pink/10 text-neon-pink text-sm rounded"
        >
          {error}
        </motion.div>
      )}

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[500px] space-y-6"
      >
        {/* Card Title */}
        <div>
          <label className="block font-arcade text-[10px] text-neon-cyan mb-2">
            CARD TITLE
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            maxLength={30}
            placeholder="What's your favorite Anish?"
            required
            className="w-full px-4 py-3 bg-navy-light border border-white/10 rounded text-white font-arcade text-xs placeholder:text-white/20 placeholder:font-arcade placeholder:text-[10px] focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_theme(colors.neon-cyan/30)] transition-all"
          />
          <p className="text-white/20 text-xs mt-1">
            {formData.title.length}/30
          </p>
        </div>

        {/* Character Description */}
        <div>
          <label className="block font-arcade text-[10px] text-neon-cyan mb-2">
            CHARACTER DESCRIPTION
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Describe your version of Anish..."
            required
            className="w-full px-4 py-3 bg-navy-light border border-white/10 rounded text-white font-arcade text-xs leading-relaxed placeholder:text-white/20 placeholder:font-arcade placeholder:text-[10px] focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_theme(colors.neon-cyan/30)] transition-all resize-none"
          />
          <p className="text-white/20 text-xs mt-1">
            {formData.description.length}/300
          </p>
        </div>

        {/* Stat 1 */}
        <div className="space-y-2">
          <label className="block font-arcade text-[10px] text-neon-cyan">
            STAT 1
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={formData.stat1Name}
              onChange={(e) =>
                updateField("stat1Name", e.target.value.toUpperCase())
              }
              maxLength={12}
              placeholder="SPD"
              required
              className="w-24 px-3 py-2 bg-navy-light border border-white/10 rounded text-white text-center font-arcade text-xs focus:border-neon-cyan focus:outline-none transition-all"
            />
            <input
              type="range"
              min={1}
              max={6}
              value={formData.stat1Level}
              onChange={(e) =>
                updateField("stat1Level", parseInt(e.target.value))
              }
              className="flex-1"
            />
          </div>
          <StatBar
            name={formData.stat1Name || "???"}
            level={formData.stat1Level}
            color="cyan"
          />
        </div>

        {/* Stat 2 */}
        <div className="space-y-2">
          <label className="block font-arcade text-[10px] text-neon-pink">
            STAT 2
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={formData.stat2Name}
              onChange={(e) =>
                updateField("stat2Name", e.target.value.toUpperCase())
              }
              maxLength={12}
              placeholder="STR"
              required
              className="w-24 px-3 py-2 bg-navy-light border border-white/10 rounded text-white text-center font-arcade text-xs focus:border-neon-pink focus:outline-none transition-all"
            />
            <input
              type="range"
              min={1}
              max={6}
              value={formData.stat2Level}
              onChange={(e) =>
                updateField("stat2Level", parseInt(e.target.value))
              }
              className="flex-1"
            />
          </div>
          <StatBar
            name={formData.stat2Name || "???"}
            level={formData.stat2Level}
            color="pink"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <motion.button
            type="button"
            onClick={handleRandomize}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex-1 font-arcade text-xs px-4 py-4 min-h-[44px] border border-neon-pink/50 text-neon-pink bg-neon-pink/5 hover:bg-neon-pink/10 transition-all cursor-pointer ${isRandomizing ? "animate-pulse" : ""}`}
          >
            RANDOMIZE
          </motion.button>
          <NeonButton
            type="submit"
            variant="cyan"
            className="flex-1"
          >
            GENERATE
          </NeonButton>
        </div>
      </form>
    </motion.div>
  );
}
