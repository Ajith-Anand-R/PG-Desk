"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Menu, 
  Building, 
  ChevronDown, 
  Bell, 
  Coins, 
  ArrowDownLeft, 
  Gift, 
  PlusCircle, 
  ChevronRight, 
  HelpCircle,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Wifi,
  Sparkle
} from "lucide-react";

export interface Transaction {
  id: string;
  title: string;
  date: string;
  points: number;
  type: "earn" | "redeem";
}

interface WalletViewProps {
  onBack: () => void;
  currentProperty: string;
  initialPoints: number;
  initialRedeemed: number;
  initialTransactions: Transaction[];
  onMenuClick: () => void;
  onRedeemPoints: (points: number, message: string) => void;
}

export function WalletView({
  onBack,
  currentProperty,
  initialPoints,
  initialRedeemed,
  initialTransactions,
  onMenuClick,
  onRedeemPoints,
}: WalletViewProps) {
  // Local states for interactivity
  const [points, setPoints] = useState(initialPoints);
  const [redeemed, setRedeemed] = useState(initialRedeemed);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Redeem success modal state
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    pointsUsed: number;
  } | null>(null);

  const faqs = [
    {
      q: "How do I earn reward points?",
      a: "You earn points automatically by paying your rent on time, referring new tenants using your referral code, or participating in PG Desk promotional events."
    },
    {
      q: "How can I redeem my points?",
      a: "You can redeem points directly from the 'Redeem Perks' section below. The discount code or service will be activated instantly and applied to your next rent billing cycle."
    },
    {
      q: "Do my reward points expire?",
      a: "Yes, reward points are valid for 12 months from the credit date. You will receive email notifications and app reminders 30 days before any points expire."
    }
  ];

  const perks = [
    { id: "p1", title: "₹500 Rent Discount", points: 500, icon: Gift, color: "text-teal-600 bg-teal-50 border-teal-100" },
    { id: "p2", title: "₹200 Rent Discount", points: 200, icon: Gift, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { id: "p3", title: "Free Room Deep Clean", points: 150, icon: Sparkles, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { id: "p4", title: "High-Speed Wi-Fi Boost", points: 100, icon: Wifi, color: "text-sky-600 bg-sky-50 border-sky-100" }
  ];

  const handleRedeemClick = (perkTitle: string, perkPoints: number) => {
    if (points < perkPoints) {
      alert("Insufficient points! Keep paying rent on time to earn more points.");
      return;
    }

    // Deduct points locally
    const newPoints = points - perkPoints;
    const newRedeemed = redeemed + perkPoints;
    
    // Add transaction locally
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      title: `Redeemed ${perkTitle}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      points: perkPoints,
      type: "redeem"
    };

    setPoints(newPoints);
    setRedeemed(newRedeemed);
    setTransactions([newTx, ...transactions]);

    // Open success modal
    setSuccessModal({
      isOpen: true,
      title: perkTitle,
      pointsUsed: perkPoints
    });

    // Notify parent to trigger toast
    onRedeemPoints(perkPoints, `Successfully redeemed ${perkTitle}!`);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-20 bg-slate-50 select-none">
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
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Reward Wallet</h1>
            <p className="text-xs font-semibold text-white/85 mt-1.5 leading-none">{currentProperty}</p>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-6 relative flex-1">
        
        {/* Obsidian Premium Credit Card Design */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-[2rem] p-6 border border-emerald-900/30 shadow-2xl relative overflow-hidden h-52 flex flex-col justify-between select-none">
          {/* Card background glowing overlay shapes */}
          <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-start z-10">
            <div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                PREMIUM WALLET
              </span>
              
              {/* Rewards Pill */}
              <div className="flex items-center gap-2 mt-4 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-fit">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-extrabold text-slate-300">REWARDS</span>
              </div>
            </div>
            
            {/* Hologram card chip design */}
            <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 p-0.5 border border-amber-200 shadow-md relative overflow-hidden flex flex-col justify-between">
              {/* Chip grid lines */}
              <div className="h-full w-full border-r border-b border-amber-600/20 flex flex-col justify-around">
                <div className="w-full border-b border-amber-600/20 h-px" />
                <div className="w-full border-b border-amber-600/20 h-px" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end z-10">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400/90 leading-none">Total Reward Points</span>
              <span className="text-4xl font-black text-white leading-none font-mono tracking-tight">
                {points.toLocaleString()}
              </span>
            </div>
            
            <Coins className="w-10 h-10 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
          </div>
        </div>

        {/* Two-Column Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Available Points */}
          <div className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3">
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <ArrowDownLeft className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10.5px] font-bold text-slate-400 leading-none">Available Points</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800 leading-none font-mono">
              {points.toLocaleString()}
            </span>
          </div>

          {/* Total Redeemed */}
          <div className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3">
            <div className="flex items-center gap-2.5 select-none">
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Gift className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10.5px] font-bold text-slate-400 leading-none">Total Redeemed</span>
            </div>
            <span className="text-xl font-extrabold text-slate-800 leading-none font-mono">
              {redeemed.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Redeem Perks Panel */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkle className="w-4 h-4 text-teal-600 fill-teal-200" />
            <span className="text-xs font-extrabold text-slate-800 tracking-tight">Redeem Perks</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {perks.map((perk) => {
              const isAvailable = points >= perk.points;
              return (
                <motion.button
                  key={perk.id}
                  whileTap={isAvailable ? { scale: 0.96 } : {}}
                  onClick={() => handleRedeemClick(perk.title, perk.points)}
                  disabled={!isAvailable}
                  className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 text-left transition-all h-32 relative overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                    isAvailable 
                      ? "bg-white border-slate-200/50 hover:shadow-xs cursor-pointer" 
                      : "bg-slate-100/50 border-slate-200/30 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center ${perk.color} shrink-0`}>
                      <perk.icon className="w-4.5 h-4.5" />
                    </div>
                    
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full select-none">
                      {perk.points} pts
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11.5px] font-extrabold text-slate-800 leading-tight">
                      {perk.title}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400/90 mt-1 leading-none">
                      {isAvailable ? "Tap to Redeem" : "Locked"}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-extrabold text-slate-800 tracking-tight">Recent Transactions</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col">
            {transactions.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3 select-none">
                <Coins className="w-10 h-10 text-slate-300" />
                <span className="text-xs font-semibold text-slate-400">No transactions yet</span>
              </div>
            ) : (
              transactions.map((tx, idx) => (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors ${
                    idx !== transactions.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.type === "earn" 
                        ? "bg-emerald-50 border border-emerald-100 text-emerald-600" 
                        : "bg-teal-50 border border-teal-100 text-teal-600"
                    }`}>
                      {tx.type === "earn" ? <PlusCircle className="w-4.5 h-4.5" /> : <Gift className="w-4.5 h-4.5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-750 truncate leading-tight">{tx.title}</span>
                      <span className="text-[9.5px] font-bold text-slate-400 mt-1 leading-none">{tx.date}</span>
                    </div>
                  </div>
                  
                  <span className={`text-xs font-extrabold font-mono shrink-0 ${
                    tx.type === "earn" ? "text-emerald-600" : "text-teal-600"
                  }`}>
                    {tx.type === "earn" ? "+" : "-"}{tx.points} pts
                  </span>
                </div>
              ))
            )}
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

      {/* Success Animation Modal Portal Overlay */}
      <AnimatePresence>
        {successModal?.isOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center gap-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 relative">
                <CheckCircle className="w-10 h-10" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full border-4 border-emerald-400/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-extrabold text-lg text-slate-800">Redemption Successful!</h3>
                <p className="text-xs font-semibold text-slate-400">
                  Perk: <span className="text-emerald-600 font-bold">{successModal.title}</span>
                </p>
                <p className="text-[10.5px] font-bold text-slate-500 mt-2">
                  Deducted <span className="text-teal-600 font-extrabold">{successModal.pointsUsed} Points</span> from your wallet.
                </p>
              </div>

              <button
                onClick={() => setSuccessModal(null)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-xs transition-colors text-xs tracking-wider uppercase cursor-pointer"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

