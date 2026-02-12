"use client";

interface StatBarProps {
  name: string;
  level: number;
  color?: "cyan" | "pink";
}

const colorMap = {
  cyan: {
    filled: "bg-neon-cyan shadow-[0_0_8px_theme(colors.neon-cyan)]",
    text: "text-neon-cyan",
  },
  pink: {
    filled: "bg-neon-pink shadow-[0_0_8px_theme(colors.neon-pink)]",
    text: "text-neon-pink",
  },
};

export default function StatBar({
  name,
  level,
  color = "cyan",
}: StatBarProps) {
  const styles = colorMap[color];

  return (
    <div className="flex items-center gap-3">
      <span
        className={`font-arcade text-xs w-16 text-right uppercase ${styles.text}`}
      >
        {name.slice(0, 4)}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-5 rounded-sm transition-all duration-300 ${
              i < level
                ? styles.filled
                : "bg-white/5 border border-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
