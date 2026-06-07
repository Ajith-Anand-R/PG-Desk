"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Home 
} from "lucide-react";

interface ViewProfileViewProps {
  onBack: () => void;
  userName: string;
  userEmail: string;
  userPhone: string;
  userPhoto: string | null;
  currentProperty: string;
}

export function ViewProfileView({
  onBack,
  userName,
  userEmail,
  userPhone,
  userPhoto,
  currentProperty,
}: ViewProfileViewProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] pb-28 bg-slate-50 select-none">
      {/* Clean Header Card (No top status bars, matching the screenshot) */}
      <div className="bg-teal-700 text-white pt-6 pb-12 px-5 rounded-b-[2rem] shadow-md relative overflow-hidden flex flex-col gap-4">
        {/* Background shapes */}
        <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
        
        {/* Header content */}
        <div className="flex items-center gap-3.5 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-100 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </motion.button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">View Profile</h1>
            <p className="text-xs font-semibold text-white/85 mt-1.5 leading-none">View your information</p>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 -mt-8 z-20 flex flex-col gap-5 relative flex-1">
        
        {/* Profile Avatar Frame (Floating above) */}
        <div className="flex justify-center select-none mb-2">
          <div className="w-22 h-22 rounded-full overflow-hidden border-2 border-blue-400 bg-white shadow-md flex items-center justify-center p-0.5 shrink-0 relative">
            {userPhoto ? (
              <img src={userPhoto} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-10 h-10 text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-extrabold text-slate-850 text-sm tracking-tight">Personal Information</h2>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Full Name *</span>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4.5 h-12 select-text">
              <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span className="px-3.5 text-xs font-semibold text-slate-700 truncate">{userName}</span>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Email *</span>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4.5 h-12 select-text">
              <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span className="px-3.5 text-xs font-semibold text-slate-700 truncate">{userEmail}</span>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Mobile *</span>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4.5 h-12 select-text">
              <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span className="px-3.5 text-xs font-semibold text-slate-700 truncate">{userPhone}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Address Details */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none mb-1">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-extrabold text-slate-850 text-sm tracking-tight">Address Details</h2>
          </div>

          {/* Current Address */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">Current Address</span>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-start px-4.5 py-3.5 select-text min-h-20">
              <Home className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="px-3.5 text-xs font-semibold text-slate-700 leading-relaxed">
                Bangalore , Austin Town, Bengaluru Urban, Bangalore North, Bengaluru, Karnataka, 560047
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-10">
          <p className="text-[10px] font-bold text-slate-400">
            Powered by <span className="text-amber-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
          </p>
          <p className="text-[9px] font-bold text-slate-400">
            &copy; 2026 All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

