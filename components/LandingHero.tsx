"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import NeonButton from "./NeonButton";

interface LandingHeroProps {
  onStart: () => void;
}

export default function LandingHero({ onStart }: LandingHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
    >
      {/* Floating particles background — positions seeded by index to avoid hydration mismatch */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          const xPos = ((i * 37 + 13) % 100);
          const yPos = ((i * 53 + 7) % 100);
          const drift = -10 - ((i * 17) % 30);
          const duration = 5 + ((i * 11) % 5);
          const delay = (i * 7) % 5;

          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-neon-cyan/30 rounded-full"
              style={{ left: `${xPos}vw`, top: `${yPos}vh` }}
              animate={{
                y: [0, `${drift}vh`, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
              }}
            />
          );
        })}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="relative z-10"
      >
        <motion.p
          className="font-arcade text-xs sm:text-sm text-neon-pink mb-4 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          WELCOME TO
        </motion.p>

        <motion.h1
          className="font-arcade text-2xl sm:text-4xl md:text-5xl neon-text-cyan mb-2 leading-relaxed"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
        >
          THE ANISH
        </motion.h1>
        <motion.h1
          className="font-arcade text-3xl sm:text-5xl md:text-6xl neon-text-pink mb-8 leading-relaxed"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
        >
          VERSE
        </motion.h1>

        {/* Partiful cover image */}
        <motion.div
          className="mb-8 w-full max-w-sm mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, type: "spring", stiffness: 80 }}
        >
          <div className="relative rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <Image
              src="/partiful-cover.png"
              alt="Select Your Anish — character select screen"
              width={600}
              height={600}
              className="w-full h-auto"
              priority
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <NeonButton onClick={onStart} variant="cyan" className="text-base px-8 py-5">
            INSERT COIN
          </NeonButton>
        </motion.div>

        <motion.p
          className="font-arcade text-[10px] text-white/20 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0.1, 0.3] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
        >
          PRESS START
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
