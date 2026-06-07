"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CheckCircle2, 
  Share2, 
  Info, 
  Smartphone,
  Check
} from "lucide-react";

interface PropertyQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
}

export function PropertyQrModal({
  isOpen,
  onClose,
  propertyName
}: PropertyQrModalProps) {
  const [activeTab, setActiveTab] = useState<"android" | "ios">("android");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const appUrl = activeTab === "android" 
      ? "https://play.google.com/store/apps/details?id=com.pgdesk" 
      : "https://apps.apple.com/app/pg-desk";
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
              Property QR Code
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-150 flex items-center justify-center text-slate-400 shrink-0 cursor-pointer active:scale-90 transition-transform"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Property Name Check Header */}
          <div className="flex flex-col items-center gap-1.5 text-center mt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full w-fit">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
              <span className="text-xs font-extrabold text-emerald-800 tracking-tight">
                {propertyName || "Uday Pg"}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 mt-1">
              Scan this QR code to access property
            </span>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab("android")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-black tracking-wide transition-all ${
                activeTab === "android"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path d="M17.523 15.3l1.807 3.13a.986.986 0 0 1-.36 1.348.972.972 0 0 1-1.334-.36l-1.833-3.177A10.875 10.875 0 0 1 12 17c-1.49 0-2.905-.3-4.195-.837l-1.833 3.177a.972.972 0 0 1-1.334.36.986.986 0 0 1-.36-1.348l1.808-3.13A10.957 10.957 0 0 1 2 7.636h20a10.957 10.957 0 0 1-4.477 7.664zM7 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 2a.965.965 0 0 1 .966.966v1.353A10.932 10.932 0 0 1 18.256 6H5.744A10.932 10.932 0 0 1 11.034 4.32V2.966A.965.965 0 0 1 12 2z" />
              </svg>
              <span>Android App</span>
            </button>
            
            <button
              onClick={() => setActiveTab("ios")}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-black tracking-wide transition-all ${
                activeTab === "ios"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>iOS App</span>
            </button>
          </div>

          {/* QR Card Container */}
          <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-200/40 shadow-xs flex flex-col items-center gap-4 relative overflow-hidden">
            {/* Share button in upper right */}
            <div className="flex justify-between items-center w-full select-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                {activeTab === "android" ? "Android App" : "iOS App"}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className={`w-9.5 h-9.5 rounded-full flex items-center justify-center shadow-xs cursor-pointer border transition-colors ${
                  copied 
                    ? "bg-emerald-500 border-emerald-500 text-white" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
                }`}
              >
                {copied ? <Check className="w-4.5 h-4.5" /> : <Share2 className="w-4.5 h-4.5" />}
              </motion.button>
            </div>

            {/* High-Fidelity SVG QR Code */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/50 shadow-xs flex items-center justify-center">
              <svg 
                viewBox="0 0 100 100" 
                className="w-36 h-36 text-slate-800"
                fill="currentColor"
              >
                {/* Top Left Finder pattern */}
                <path d="M0 0h30v30H0V0zm5 5v20h20V5H5zm5 5h10v10H10V10z" />
                {/* Top Right Finder pattern */}
                <path d="M70 0h30v30H70V0zm5 5v20h20V5H75zm5 5h10v10H80V10z" />
                {/* Bottom Left Finder pattern */}
                <path d="M0 70h30v30H0V70zm5 5v20h20V75H5zm5 5h10v10H10V80z" />
                
                {/* Alignment / Timing marks */}
                <path d="M35 10h5v5h-5zm0 15h5v5h-5zm15-20H45v5h5zm10 0h-5v5h5zm0 15h-5v5h5z" />
                <path d="M10 35v5h5v-5zm0 15v5h5v-5zm15-20v5h5v-5z" />
                <path d="M75 35h5v5h-5zm15 0h-5v5h5zm-15 15h5v5h-5zm15 0h-5v5h5z" />

                {/* Random Data Squares (grid aesthetic representation) */}
                <path d="M35 35h5v5h-5zm5 5h5v5h-5zm5-5h5v5h-5zm10 5h5v5h-5zm0-10h5v5h-5z" />
                <path d="M35 50h5v5h-5zm5 10h5v5h-5zm15-5h5v5h-5zm10 10h5v5h-5zm-15-20h5v5h-5zm10 5h5v5h-5z" />
                <path d="M50 35h5v5h-5zm5 15h5v5h-5zm5 5h5v5h-5zm5-15h5v5h-5zm15 15h5v5h-5z" />
                <path d="M35 70h5v5h-5zm10 5h5v5h-5zm0 10h5v5h-5zm15-5h5v5h-5zm0-10h5v5h-5zm10 15h5v5h-5z" />
                <path d="M70 75h5v5h-5zm5 10h5v5h-5zm10-5h5v5h-5zm0 10h5v5h-5zm10-15h5v5h-5z" />
                <path d="M35 85h5v5h-5zm5 5h5v5h-5zm10-5h5v5h-5zm10-10h5v5h-5z" />
                <path d="M45 45h5v5h-5zm5 5h5v5h-5zm10-5h5v5h-5zm5 5h5v5h-5zm10 10h5v5h-5zm-15-20h5v5h-5zm10 5h5v5h-5z" />
                
                {/* Center logo indicator (PG Desk) */}
                <rect x="42" y="42" width="16" height="16" rx="4" fill="white" />
                <text 
                  x="50" 
                  y="52" 
                  fontSize="7" 
                  fontWeight="black" 
                  textAnchor="middle" 
                  fill="#059669"
                >
                  PG
                </text>
              </svg>
            </div>

            <span className="text-[10px] font-black text-slate-500 select-none">
              Scan for {activeTab === "android" ? "Android" : "iOS"}
            </span>

            {/* Dot sliders */}
            <div className="flex gap-1.5 justify-center mt-1">
              <span className={`w-3.5 h-1.5 rounded-full transition-all ${activeTab === "android" ? "bg-emerald-600" : "bg-slate-200"}`} />
              <span className={`w-3.5 h-1.5 rounded-full transition-all ${activeTab === "ios" ? "bg-emerald-600" : "bg-slate-200"}`} />
            </div>
          </div>

          {/* Info Banner alert */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 select-none">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Info className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-emerald-800 leading-relaxed">
              Share this QR code with tenants to quickly access property information
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-extrabold text-xs tracking-wider uppercase cursor-pointer shadow-md shadow-emerald-100/50 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
