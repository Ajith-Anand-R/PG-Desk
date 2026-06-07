"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Menu, 
  Building, 
  ChevronDown, 
  Bell, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Trophy, 
  Building2, 
  Store, 
  ChevronRight, 
  HelpCircle,
  Clock,
  CheckCircle2,
  PhoneCall
} from "lucide-react";

interface ReferralViewProps {
  onBack: () => void;
  onNavigateToSupport: () => void;
  currentProperty: string;
  onMenuClick: () => void;
}

export function ReferralView({
  onBack,
  onNavigateToSupport,
  currentProperty,
  onMenuClick,
}: ReferralViewProps) {
  const referralCode = "BVBQEEXU";
  
  // Local states
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const mockReferrals = [
    { id: "r1", name: "Rajiv Mehta", property: "Royal PG", status: "active", points: 500, date: "Jun 3, 2026" },
    { id: "r2", name: "Sandeep Kumar", property: "Classic PG", status: "pending", points: 0, date: "May 29, 2026" },
    { id: "r3", name: "Preeti Singh", property: "Oasis PG", status: "active", points: 500, date: "May 14, 2026" },
  ];

  const faqs = [
    {
      q: "How do I refer another PG Owner?",
      a: "Simply copy your unique referral code or share the link with another PG Owner. Once they sign up and activate their subscription, both of you will receive 500 reward points!"
    },
    {
      q: "When will I receive reward points?",
      a: "Your points will be credited to your Reward Wallet instantly as soon as your referred PG Owner completes their first subscription payment."
    },
    {
      q: "Is there any limit to referrals?",
      a: "No! There is absolutely no limit to how many PG Owners you can refer. You earn 500 points for every successful referral."
    },
    {
      q: "How do I redeem my referral rewards?",
      a: "Referral points are credited directly as Reward Wallet points. You can use them to redeem rent discounts, deep cleanings, or premium booster packs."
    },
    {
      q: "Can I track my referrals?",
      a: "Yes! You can track the status of all your referrals (Active vs. Pending) in real-time in the 'Referred PG Owners' log section below."
    }
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-slate-50 select-none">
      {/* Top Header Navigation */}
      <div className="bg-teal-700 text-white pt-5 pb-6 px-5 rounded-b-[2rem] shadow-md relative overflow-hidden flex flex-col gap-4">
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
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-200/20 shadow-xs cursor-pointer relative">
              <Bell className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-teal-700 border-2 border-white" />
            </div>
          </div>
        </div>

        {/* Title row */}
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
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Referral</h1>
            <p className="text-xs font-semibold text-white/85 mt-1.5 leading-none">{currentProperty}</p>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-6 relative flex-1">
        
        {/* Uniquely Redesigned Hero Card */}
        <div className="bg-gradient-to-tr from-emerald-600 via-teal-600 to-pink-500 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5 select-none">
          {/* Card background glowing circular details */}
          <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4.5 z-10">
            {/* Levitating Gift Icon Card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
            >
              <Gift className="w-7 h-7" />
            </motion.div>
            
            <div className="flex flex-col">
              <h2 className="text-base font-black text-white leading-tight">
                Earn Rewards by Referring
              </h2>
              <span className="text-[10.5px] font-bold text-white/80 mt-1 leading-tight">
                Share & Earn unlimited referral rewards
              </span>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="flex flex-col gap-2 z-10">
            <span className="text-[9.5px] font-extrabold text-white/75 uppercase tracking-wider px-1">
              Your Referral Code
            </span>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl flex items-center justify-between p-1.5 pl-4 h-14 shadow-inner">
              <span className="text-lg font-black text-white tracking-widest font-mono">
                {referralCode}
              </span>
              
              {/* Copy Code Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyCode}
                className={`h-11 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-extrabold text-[11px] shadow-sm transition-all duration-300 ${
                  copied 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Share Link Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 bg-white rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-teal-950/20 text-xs font-black text-teal-700 tracking-wider transition-all hover:bg-slate-50 z-10"
          >
            <Share2 className="w-4 h-4 text-teal-700" />
            <span>Share Referral Link</span>
          </motion.button>
        </div>

        {/* Stats Column Box */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Referred */}
          <div className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3">
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10.5px] font-bold text-slate-400 leading-none">Total Referred</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800 leading-none font-mono">
              2
            </span>
          </div>

          {/* Points Earned */}
          <div className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3">
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Trophy className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10.5px] font-bold text-slate-400 leading-none">Points Earned</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800 leading-none font-mono">
              1,000
            </span>
          </div>
        </div>

        {/* Referred PG Owners Status Tracker */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-extrabold text-slate-800 tracking-tight">Referred PG Owners</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col">
            {mockReferrals.map((ref, idx) => (
              <div 
                key={ref.id} 
                className={`flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors ${
                  idx !== mockReferrals.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9.5 h-9.5 rounded-full flex items-center justify-center shrink-0 border ${
                    ref.status === "active" 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                      : "bg-amber-50 border-amber-100 text-amber-500"
                  }`}>
                    {ref.status === "active" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-750 truncate leading-tight">{ref.name}</span>
                    <span className="text-[9.5px] font-bold text-slate-400 mt-1 leading-none">{ref.property} &bull; {ref.date}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ref.status === "active" 
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-100" 
                      : "text-amber-700 bg-amber-50 border border-amber-100"
                  }`}>
                    {ref.status}
                  </span>
                  
                  {ref.points > 0 && (
                    <span className="text-[10px] font-extrabold font-mono text-emerald-600 mt-1 leading-none">
                      +{ref.points} pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Accordions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-extrabold text-slate-800 tracking-tight">Frequently Asked Questions</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${index !== faqs.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50 text-left cursor-pointer transition-colors"
                >
                  <span className="text-xs font-bold text-slate-750">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: activeFaq === index ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-slate-400 shrink-0 ml-4"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden bg-slate-50/50"
                    >
                      <div className="px-4.5 pb-4.5 text-[11px] font-semibold text-slate-500 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Support Sticky Button */}
        <div className="mt-4 flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToSupport}
            className="w-full h-14 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-200/50 transition-colors"
          >
            <PhoneCall className="w-4.5 h-4.5 text-white" />
            <span className="text-xs font-extrabold tracking-wider uppercase">Need Help? Contact Support</span>
          </motion.button>

          {/* Footer branding */}
          <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-8">
            <p className="text-[10px] font-bold text-slate-400">
              Powered by <span className="text-amber-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
            </p>
            <p className="text-[9px] font-bold text-slate-400">
              &copy; 2026 All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

