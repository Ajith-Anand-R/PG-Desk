"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  Building, 
  ArrowLeft, 
  User, 
  SquarePen, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight 
} from "lucide-react";
interface SettingsViewProps {
  onBack: () => void;
  onNavigateToProfile: () => void;
  onNavigateToViewProfile: () => void;
  onNavigateToSupport: () => void;
  onLogout: () => void;
  onChangePasswordClick: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
}

export function SettingsView({
  onBack,
  onNavigateToProfile,
  onNavigateToViewProfile,
  onNavigateToSupport,
  onLogout,
  onChangePasswordClick,
  onMenuClick,
  onNavigateToNotifications,
}: SettingsViewProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] pb-28 bg-slate-50 select-none">
      {/* Top Header Navigation */}
      <div className="bg-teal-700 text-white pt-5 pb-6 px-5 rounded-b-[2rem] shadow-md relative overflow-hidden flex flex-col gap-4">
        {/* Background glowing decorations */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Top Status Bar Controls */}
        <div className="flex items-center justify-between z-10">
          <button 
            onClick={onMenuClick}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/5 cursor-pointer"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Property Pill Selector */}
          <div className="bg-white/15 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 select-none">
            <Building className="w-4 h-4 text-white" />
            <div className="w-1 h-4 bg-white/20 rounded-full" />
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-emerald-400"
            >
              <path d="M4 4h6v6H4V4zm2 2v2h2V6H6zm8-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6zm10 2v2h2v-2h-2zm2-2h2v-2h-2v2zm0 2h-2v-2h2v2zm-4-4h2v-2h-2v2zm4 0h2v-2h-2v2z" />
            </svg>
            <ChevronDown className="w-3.5 h-3.5 text-white/70" />
          </div>

          <div className="flex items-center gap-2.5">
            {/* WhatsApp Icon Circle */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-200/20 shadow-xs cursor-pointer">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5.5 h-5.5 text-emerald-500"
              >
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.335 4.963L2 22l5.233-1.371a9.96 9.96 0 004.779 1.21h.005c5.505 0 9.99-4.478 9.99-9.986C22.008 6.478 17.519 2 12.012 2zm4.7 13.999c-.195.552-1.135 1.07-1.583 1.126-.448.056-.875.248-2.874-.543-2.001-.791-3.261-2.837-3.36-2.97-.1-.132-.733-.975-.733-1.87 0-.893.469-1.333.636-1.516.166-.182.365-.228.487-.228.121 0 .243.002.348.006.113.004.264-.043.414.321.155.378.531 1.297.576 1.39.045.09.076.197.015.319-.06.121-.09.197-.181.303-.092.106-.192.236-.274.319-.09.09-.185.19-.08.371.106.182.473.782.986 1.238.66.587 1.213.77 1.382.853.17.083.268.069.368-.047.1-.117.424-.492.537-.662.114-.17.228-.14.382-.084.156.057.989.466 1.159.551.17.085.284.127.327.2.042.071.042.413-.153.965z" />
              </svg>
            </div>

            {/* Notification Bell Circle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onNavigateToNotifications}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-200/20 shadow-xs cursor-pointer relative"
            >
              <Bell className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-teal-700 border-2 border-white" />
            </motion.button>
          </div>
        </div>

        {/* Settings Title Info */}
        <div className="flex items-center gap-3.5 z-10 select-none">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-100 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </motion.button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Settings</h1>
            <p className="text-xs font-semibold text-white/85 mt-1.5 leading-none">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Main Settings List */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-5 relative flex-1">
        
        {/* Section 1: Account */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Account</span>
          
          <div className="bg-white rounded-3xl border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col">
            {/* Profile */}
            <button 
              onClick={onNavigateToProfile}
              className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-750">Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* View Profile */}
            <button 
              onClick={onNavigateToViewProfile}
              className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                  <SquarePen className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-750">View Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Change Password */}
            <button 
              onClick={onChangePasswordClick}
              className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-750">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section 2: Support */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Support</span>
          
          <div className="bg-white rounded-3xl border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col">
            {/* Help & Support */}
            <button 
              onClick={onNavigateToSupport}
              className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-bold text-slate-750">Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Section 3: Security / Logout */}
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Security</span>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogout}
            className="w-full h-12 rounded-2xl bg-red-50 hover:bg-red-100/60 border border-red-100/50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 text-red-500" />
            <span className="text-xs font-extrabold text-red-500">Logout</span>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col items-center justify-center text-center gap-1.5 opacity-85 select-none pt-10">
          <span className="text-[9px] font-bold text-slate-400">Version 4.1.1</span>
          
          <p className="text-[10px] font-bold text-slate-400 mt-1">
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

