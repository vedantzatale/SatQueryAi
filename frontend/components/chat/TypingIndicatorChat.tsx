"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingIndicatorChatProps {
  type?: "bounce" | "pulse" | "wave";
  label?: string;
  className?: string;
  align?: "left" | "right" | "center";
  color?: string;
}

export const TypingIndicatorChat: React.FC<TypingIndicatorChatProps> = ({
  type = "bounce",
  label,
  className,
  align = "left",
  color = "white",
}) => {
  const renderBounce = () => (
    <div className="flex gap-1.5 items-center">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );

  const renderPulse = () => (
    <div className="flex gap-2 items-center">
      {label && <span className="text-xs text-neutral-400">{label}</span>}
      <div className="flex gap-1 items-center">
        <motion.div
          animate={{ height: [4, 12, 4], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
        />
        <motion.div
          animate={{ height: [4, 12, 4], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
        />
        <motion.div
          animate={{ height: [4, 12, 4], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );

  const renderWave = () => (
    <motion.div
      className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white bg-[length:200%_auto] text-sm font-bold"
      animate={{ backgroundPosition: ["0% center", "200% center"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{
        backgroundImage: `linear-gradient(to right, ${color}00, ${color}, ${color}00)`,
      }}
    >
      {label || "AI is generating..."}
    </motion.div>
  );

  const getAlignmentClass = () => {
    switch (align) {
      case "right":
        return "self-end";
      case "center":
        return "self-center";
      default:
        return "self-start";
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-xs", className)}>
      {type === "bounce" && (
        <div
          className={cn(
            "bg-neutral-800 p-4 rounded-2xl rounded-tl-none border border-[#2a2a2a]",
            getAlignmentClass()
          )}
        >
          {renderBounce()}
        </div>
      )}

      {type === "pulse" && (
        <div
          className={cn(
            "bg-neutral-800 p-4 rounded-2xl rounded-tr-none border border-[#2a2a2a]",
            getAlignmentClass()
          )}
        >
          {renderPulse()}
        </div>
      )}

      {type === "wave" && (
        <div
          className={cn(
            "bg-gradient-to-r from-indigo-900 to-purple-900 p-4 rounded-2xl self-center border border-indigo-500/30",
            getAlignmentClass()
          )}
        >
          {renderWave()}
        </div>
      )}
    </div>
  );
};

export default TypingIndicatorChat;
