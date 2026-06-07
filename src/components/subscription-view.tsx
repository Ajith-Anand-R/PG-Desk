"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Menu, 
  Building, 
  ChevronDown, 
  Bell, 
  Calendar, 
  Gem, 
  Check, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface SubscriptionViewProps {
  onBack: () => void;
  onMenuClick: () => void;
  onProceedToPayment: (planName: string, price: number) => void;
}

export function SubscriptionView({
  onBack,
  onMenuClick,
  onProceedToPayment,
}: SubscriptionViewProps) {
  // Plan selection state: default is yearly
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "half-yearly" | "monthly">("yearly");

  const plans = [
    {
      id: "yearly" as const,
      name: "Yearly Plan",
      months: 12,
      price: 9999,
      originalPrice: 19998,
      discount: "50% OFF",
      badge: "PLATINUM",
      subBadge: "Best Value"
    },
    {
      id: "half-yearly" as const,
      name: "Half-Year Plan",
      months: 6,
      price: 5499,
      originalPrice: 10998,
      discount: "50% OFF",
      badge: null,
      subBadge: null
    },
    {
      id: "monthly" as const,
      name: "Monthly Plan",
      months: 1,
      price: 999,
      originalPrice: 999,
      discount: null,
      badge: null,
      subBadge: null
    }
  ];

  const benefits = [
    "Bed & Tenant Management",
    "Rent Tracking & Reminders",
    "Reports & Analytics",
    "Mobile App Access"
  ];

  const handleProceed = () => {
    const activePlan = plans.find((p) => p.id === selectedPlan);
    if (!activePlan) return;
    onProceedToPayment(activePlan.name, activePlan.price);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-8 bg-slate-50 select-none">
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
          <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Plans & Pricing</h1>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 mt-6 z-20 flex flex-col gap-5 relative flex-1">

        {/* Header Text */}
        <div className="flex flex-col gap-1 px-1">
          <h2 className="text-xl font-black text-slate-850 tracking-tight leading-none">Choose Your Plan</h2>
          <span className="text-xs font-semibold text-slate-400 mt-1.5 leading-none">Select the best tier for your property</span>
        </div>

        {/* Plan Cards List */}
        <div className="flex flex-col gap-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-3xl p-5 border cursor-pointer flex justify-between items-center transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${
                  isSelected 
                    ? "bg-white border-teal-600 shadow-md shadow-teal-100/20" 
                    : "bg-white border-slate-200/50 hover:bg-slate-50/30"
                }`}
              >
                {/* 50% Off Ribbon Badge */}
                {plan.discount && (
                  <div className="absolute right-0 top-0 overflow-hidden rounded-tr-[1.4rem]">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black tracking-wider px-3.5 py-1 text-center select-none shadow-xs uppercase leading-none rounded-bl-xl">
                      {plan.discount}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-black tracking-tight leading-none ${
                      isSelected ? "text-teal-700" : "text-slate-850"
                    }`}>
                      {plan.name}
                    </span>
                    
                    {/* Platinum Badging */}
                    {plan.badge && (
                      <div className="bg-teal-600 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 select-none leading-none scale-95 origin-left">
                        <Gem className="w-2.5 h-2.5 fill-white/10" />
                        <span>{plan.badge}</span>
                      </div>
                    )}
                  </div>

                  {plan.subBadge && (
                    <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest leading-none">
                      {plan.subBadge}
                    </span>
                  )}

                  {/* Calendar Months Indicator */}
                  <div className="flex items-center gap-1.5 text-slate-400 mt-1 select-none">
                    <Calendar className="w-3.5 h-3.5 text-slate-400/90" />
                    <span className="text-[11px] font-bold leading-none">{plan.months} Months</span>
                  </div>
                  
                  <span className="text-[9.5px] font-bold text-slate-400/80 leading-none">
                    per bed (monthly)
                  </span>
                </div>

                <div className="flex items-center gap-4.5">
                  {/* Pricing info */}
                  <div className="flex flex-col items-end gap-1 select-none">
                    {plan.originalPrice !== plan.price && (
                      <span className="text-[10.5px] font-extrabold text-slate-350 line-through font-mono leading-none">
                        &nbsp;&nbsp;₹ {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-xl font-black text-slate-850 leading-none font-mono">
                      ₹ {plan.price}
                    </span>
                  </div>

                  {/* Custom radio button selector */}
                  <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-teal-600" : "border-slate-200"
                  }`}>
                    {isSelected && (
                      <motion.div 
                        layoutId="activePlanDot"
                        className="w-2.5 h-2.5 rounded-full bg-teal-600" 
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* What's Included benefits card */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight px-0.5">What`s Included</h3>
          
          <div className="flex flex-col gap-3">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-650 leading-none select-none">
                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                  <Check className="w-3 h-3 stroke-[3.5px]" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Offer Terms */}
        <div className="flex flex-col gap-1.5 px-1 font-semibold text-[10.5px] text-slate-400 select-none">
          <span className="font-black text-slate-500 uppercase tracking-wider text-[9px] mb-1">Offer Terms</span>
          <p>&bull; Discount applicable only on Yearly & Half-Yearly plans.</p>
          <p>&bull; Offer valid for new subscriptions.</p>
          <p>&bull; Prices applicable per bed.</p>
        </div>

        {/* Bottom Payment Button */}
        <div className="mt-4 flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleProceed}
            className="w-full h-14 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-teal-200/50 transition-colors"
          >
            <span className="text-xs font-extrabold tracking-wider uppercase">Proceed to Payment</span>
            <ArrowRight className="w-4 h-4 text-white stroke-[3px]" />
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

