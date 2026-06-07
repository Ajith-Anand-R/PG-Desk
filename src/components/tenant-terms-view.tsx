"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Menu, 
  Building, 
  ChevronDown, 
  Bell, 
  Check, 
  AlertCircle
} from "lucide-react";

interface TenantTermsViewProps {
  onBack: () => void;
  onMenuClick: () => void;
}

export function TenantTermsView({
  onBack,
  onMenuClick,
}: TenantTermsViewProps) {
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

        {/* Terms Title Row */}
        <div className="flex items-center gap-3.5 z-10 select-none">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-100 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </motion.button>
          <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Terms & Conditions</h1>
        </div>
      </div>

      {/* Main Body Content Cards */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-5 relative flex-1">
        
        {/* Card 1: Rent Payment */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3">
          <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">1. Rent Payment</h2>
          <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-500 leading-relaxed">
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                <span className="text-slate-700 font-bold">The Tenant</span> <span className="text-slate-800 font-black">must pay the monthly rent on or before the 5th</span> day of every month.
              </span>
            </div>
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                <span className="text-slate-700 font-bold">Delays in payment</span> may attract penalties as per the discretion of the Management.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Notice Period */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">2. Notice Period</h2>
          
          <div className="flex flex-col gap-4 text-xs font-semibold text-slate-500 leading-relaxed">
            {/* a */}
            <div className="flex flex-col gap-1">
              <span>
                <span className="text-slate-800 font-black">a. Minimum Notice Requirement:</span> The Tenant is required to provide a <span className="text-slate-800 font-black">minimum of thirty (30) days written notice</span> prior to vacating the premises.
              </span>
            </div>

            {/* b */}
            <div className="flex flex-col gap-2">
              <span>
                <span className="text-slate-800 font-black">b. Notice Given on or Before 5th:</span> The notice period will be calculated from the date of submission. Rent is payable for the entire 30-day period.
              </span>
              
              {/* Green alert example block */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3.5px]" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 leading-tight">
                  Example: If notice is submitted on the 3rd of the current month, it will be valid until the 2nd of the following month.
                </span>
              </div>
            </div>

            {/* c */}
            <div className="flex flex-col gap-2">
              <span>
                <span className="text-slate-800 font-black">c. Notice Given on or After 6th:</span> The Tenant must serve the full 30-day notice period and pay rent on a pro-rata basis for the subsequent month.
              </span>

              {/* Amber alert example block */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[10px] font-bold text-amber-800 leading-tight">
                  Example: If notice is submitted on the 7th, it will be valid until the 6th of the following month. The subsequent month`s rent will be charged on a daily basis until the 6th.
                </span>
              </div>
            </div>

            {/* Non-refundable warning */}
            <p className="text-[10.5px] font-black text-amber-500 select-none mt-1">
              Token advance and rent are non-refundable in case of early cancellation.
            </p>
          </div>
        </div>

        {/* Card 3: Responsibility for Personal Belongings */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3">
          <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">3. Responsibility for Personal Belongings</h2>
          <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-500 leading-relaxed">
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                Management is <span className="text-slate-800 font-black">not liable</span> for loss, theft, or damage to personal belongings, including but not limited to mobile phones, laptops, wallets, and valuables.
              </span>
            </div>
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                The Tenant is <span className="text-slate-800 font-black">solely responsible</span> for safeguarding their personal possessions.
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Maintenance Charges */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3">
          <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">4. Maintenance Charges</h2>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            &bull; Applicable maintenance charges will be charged as per the PG Management`s policy.
          </p>
        </div>

        {/* Card 5: House Rules & Conduct */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">5. House Rules & Conduct</h2>
          
          <div className="flex flex-col gap-3 text-xs font-semibold text-slate-500 leading-relaxed">
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                Visitors are <span className="text-slate-800 font-black">not allowed</span> without prior written permission from the Owner or Management.
              </span>
            </div>
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                Smoking, alcohol consumption, and related substances are <span className="text-slate-800 font-black">strictly prohibited</span> in the rooms.
              </span>
            </div>
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                Use of electric stoves, kettles, irons, and similar high-wattage appliances is <span className="text-slate-800 font-black">not permitted</span>. Penalty for violation: <span className="text-slate-800 font-black">₹1,000</span>.
              </span>
            </div>
            <div className="flex items-start gap-1">
              <span>&bull;</span>
              <span>
                Avoid wastage of food, electricity, and water.
              </span>
            </div>

            {/* Eviction details */}
            <div className="flex flex-col gap-3 mt-2 font-black">
              <p className="text-[10.5px] text-amber-500 select-none">
                Illegal activity or misconduct will result in immediate eviction without any refund.
              </p>
              
              <p className="text-[10.5px] text-amber-500 select-none leading-relaxed">
                The PG Management is <span className="text-slate-800 font-black">not responsible</span> for personal matters, including but not limited to relationship issues, self-harm, or other personal circumstances.
              </p>
            </div>
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
    </div>
  );
}

