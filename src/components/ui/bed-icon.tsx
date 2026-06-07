"use client";

import React from "react";
import { motion } from "framer-motion";

interface BedIconProps {
  status: "available" | "occupied";
  onClick?: () => void;
}

export function BedIcon({ status, onClick }: BedIconProps) {
  const isAvailable = status === "available";

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`w-9 h-9 rounded-xl flex items-center justify-center focus:outline-hidden transition-all duration-300 cursor-pointer ${
        isAvailable
          ? "bg-emerald-500 text-white shadow-[0_3px_8px_rgba(16,185,129,0.22)]"
          : "bg-slate-100 text-slate-400 border border-slate-200/50"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4.5 h-4.5"
      >
        <path d="M5.25 5.25a.75.75 0 0 1 .75.75v3.75h12V6a.75.75 0 0 1 1.5 0v12a.75.75 0 0 1-1.5 0v-2.25H6V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" />
        <path d="M6 11.25h12v3H6v-3Z" />
        <circle cx="8.25" cy="8.25" r="1.5" />
      </svg>
    </motion.button>
  );
}
