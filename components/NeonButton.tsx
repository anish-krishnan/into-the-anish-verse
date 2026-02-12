"use client";

import { motion } from "framer-motion";

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "cyan" | "pink" | "green";
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  cyan: {
    border: "border-neon-cyan",
    text: "text-neon-cyan",
    shadow: "shadow-[0_0_10px_theme(colors.neon-cyan),0_0_30px_theme(colors.neon-cyan)]",
    shadowHover: "hover:shadow-[0_0_15px_theme(colors.neon-cyan),0_0_40px_theme(colors.neon-cyan),0_0_60px_theme(colors.neon-cyan)]",
    bg: "bg-neon-cyan/10",
  },
  pink: {
    border: "border-neon-pink",
    text: "text-neon-pink",
    shadow: "shadow-[0_0_10px_theme(colors.neon-pink),0_0_30px_theme(colors.neon-pink)]",
    shadowHover: "hover:shadow-[0_0_15px_theme(colors.neon-pink),0_0_40px_theme(colors.neon-pink),0_0_60px_theme(colors.neon-pink)]",
    bg: "bg-neon-pink/10",
  },
  green: {
    border: "border-neon-green",
    text: "text-neon-green",
    shadow: "shadow-[0_0_10px_theme(colors.neon-green),0_0_30px_theme(colors.neon-green)]",
    shadowHover: "hover:shadow-[0_0_15px_theme(colors.neon-green),0_0_40px_theme(colors.neon-green),0_0_60px_theme(colors.neon-green)]",
    bg: "bg-neon-green/10",
  },
};

export default function NeonButton({
  children,
  onClick,
  type = "button",
  variant = "cyan",
  disabled = false,
  className = "",
}: NeonButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`
        font-arcade text-sm px-6 py-4 min-h-[44px]
        border-2 ${styles.border} ${styles.text} ${styles.bg}
        ${styles.shadow} ${styles.shadowHover}
        transition-all duration-300
        disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
