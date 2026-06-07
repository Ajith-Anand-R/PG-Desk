"use client";

import React from "react";
import { CheckCircle2, User, AlertCircle } from "lucide-react";

interface StatCardProps {
  type: "available" | "occupied" | "notice";
  value: number;
}

export function StatCard({ type, value }: StatCardProps) {
  // Configure colors based on type
  const config = {
    available: {
      label: "Available",
      textColor: "text-red-500",
      bgColor: "bg-red-50/50",
      lineColor: "bg-red-500",
      badgeBorderColor: "border-red-100",
      Icon: CheckCircle2,
    },
    occupied: {
      label: "Occupied",
      textColor: "text-emerald-500",
      bgColor: "bg-emerald-50/50",
      lineColor: "bg-emerald-500",
      badgeBorderColor: "border-emerald-100",
      Icon: User,
    },
    notice: {
      label: "Notice",
      textColor: "text-amber-500",
      bgColor: "bg-amber-50/50",
      lineColor: "bg-amber-500",
      badgeBorderColor: "border-amber-100",
      Icon: AlertCircle,
    },
  }[type];

  const { label, textColor, bgColor, lineColor, badgeBorderColor, Icon } = config;

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] border border-slate-100/70 flex flex-col items-center justify-between p-3 h-28 overflow-hidden relative select-none transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
      {/* Top colored accent stripe */}
      <div className={`absolute top-0 inset-x-0 h-1.5 ${lineColor}`} />

      {/* Icon Badge */}
      <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 ${bgColor} ${textColor} border ${badgeBorderColor} mt-1`}>
        <Icon className="w-4.5 h-4.5" />
      </div>

      {/* Value */}
      <span className={`text-xl font-black tracking-tight mt-1 ${textColor} leading-none`}>
        {value}
      </span>

      {/* Label */}
      <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase text-center w-full truncate mb-0.5">
        {label}
      </span>
    </div>
  );
}
