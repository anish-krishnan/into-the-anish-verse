"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FLAVOR_TEXTS = [
  "Scanning the Anish-Verse...",
  "Calibrating neon levels...",
  "Loading character assets...",
  "Generating your variant...",
  "Rendering pixel art...",
  "Applying arcade filters...",
  "Almost there...",
];

export default function LoadingScreen() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % FLAVOR_TEXTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
    >
      {/* Pulsing arcade cabinet frame */}
      <motion.div
        className="border-2 border-neon-cyan/50 p-8 sm:p-12 max-w-sm w-full text-center"
        animate={{
          boxShadow: [
            "0 0 10px #00f0ff40, inset 0 0 10px #00f0ff20",
            "0 0 30px #00f0ff60, inset 0 0 20px #00f0ff30",
            "0 0 10px #00f0ff40, inset 0 0 10px #00f0ff20",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.h2
          className="font-arcade text-lg sm:text-xl text-neon-cyan mb-8"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          NOW LOADING
        </motion.h2>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-neon-pink rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Flavor text */}
        <motion.p
          key={textIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-arcade text-[10px] sm:text-xs text-white/50"
        >
          {FLAVOR_TEXTS[textIndex]}
        </motion.p>

        {/* Fake progress bar */}
        <div className="mt-8 h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink"
            initial={{ width: "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 15, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
