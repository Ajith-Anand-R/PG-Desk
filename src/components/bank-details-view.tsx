"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Menu, 
  Building, 
  ChevronDown, 
  Bell, 
  User, 
  Info, 
  Phone, 
  CreditCard, 
  Smartphone, 
  AtSign, 
  Landmark, 
  ArrowLeftRight, 
  MapPin,
  Check
} from "lucide-react";

export interface BankDetails {
  upiName: string;
  upiNumber: string;
  upiRegisteredName: string;
  upiId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

interface BankDetailsViewProps {
  onBack: () => void;
  currentProperty: string;
  initialDetails: BankDetails;
  onSave: (details: BankDetails) => void;
  onMenuClick: () => void;
}

export function BankDetailsView({
  onBack,
  currentProperty,
  initialDetails,
  onSave,
  onMenuClick,
}: BankDetailsViewProps) {
  // Form field states
  const [upiName, setUpiName] = useState(initialDetails.upiName || "");
  const [upiNumber, setUpiNumber] = useState(initialDetails.upiNumber || "");
  const [upiRegisteredName, setUpiRegisteredName] = useState(initialDetails.upiRegisteredName || "");
  const [upiId, setUpiId] = useState(initialDetails.upiId || "");
  const [accountHolderName, setAccountHolderName] = useState(initialDetails.accountHolderName || "");
  const [accountNumber, setAccountNumber] = useState(initialDetails.accountNumber || "");
  const [ifscCode, setIfscCode] = useState(initialDetails.ifscCode || "");
  const [branchName, setBranchName] = useState(initialDetails.branchName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      upiName,
      upiNumber,
      upiRegisteredName,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
      branchName,
    });
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-28 bg-slate-50 select-none">
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

        {/* Bank Details Title Row */}
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
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Bank Details</h1>
            <p className="text-xs font-semibold text-white/85 mt-1.5 leading-none">{currentProperty}</p>
          </div>
        </div>
      </div>

      {/* Main Body Content Form */}
      <form onSubmit={handleSubmit} className="px-5 -mt-4 z-20 flex flex-col gap-5 relative flex-1">
        
        {/* Section 1: UPI Information */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
              <User className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-extrabold text-slate-850 text-sm tracking-tight">UPI Information</h2>
          </div>

          {/* Info pill */}
          <div className="bg-teal-50/70 border border-teal-100/50 rounded-xl p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span className="text-[10px] font-bold text-teal-700 leading-tight">
              For receiving UPI Name & Number
            </span>
          </div>

          {/* UPI Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="upiName" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              UPI Name <span className="text-red-500">*</span>
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="upiName"
                type="text"
                value={upiName}
                onChange={(e) => setUpiName(e.target.value)}
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 focus:ring-0"
                required
              />
            </div>
          </div>

          {/* UPI Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="upiNumber" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              UPI Number <span className="text-red-500">*</span>
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="upiNumber"
                type="text"
                value={upiNumber}
                onChange={(e) => setUpiNumber(e.target.value)}
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 focus:ring-0"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: UPI Details */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none mb-1">
            <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-extrabold text-slate-850 text-sm tracking-tight">UPI Details</h2>
          </div>

          {/* Info pill */}
          <div className="bg-teal-50/70 border border-teal-100/50 rounded-xl p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span className="text-[10px] font-bold text-teal-700 leading-tight">
              Optional: For receiving payments via UPI
            </span>
          </div>

          {/* UPI Registered Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="upiRegisteredName" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              UPI Registered Name
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="upiRegisteredName"
                type="text"
                value={upiRegisteredName}
                onChange={(e) => setUpiRegisteredName(e.target.value)}
                placeholder="durga"
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 focus:ring-0"
              />
            </div>
          </div>

          {/* UPI ID */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="upiId" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              UPI ID
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <AtSign className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="upiId"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="ahmedp7@ybl"
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bank Account Details */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none mb-1">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <h2 className="font-extrabold text-slate-850 text-sm tracking-tight">Bank Account Details</h2>
          </div>

          {/* Info pill */}
          <div className="bg-teal-50/70 border border-teal-100/50 rounded-xl p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span className="text-[10px] font-bold text-teal-700 leading-tight">
              Optional: For bank transfers
            </span>
          </div>

          {/* Account Holder Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="accountHolderName" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Account Holder Name
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="accountHolderName"
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Name as per bank account"
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {/* Account Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="accountNumber" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Account Number
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <CreditCard className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter bank account number"
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {/* IFSC Code */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ifscCode" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              IFSC Code
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <ArrowLeftRight className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="ifscCode"
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g., SBIN0001234"
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {/* Branch Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="branchName" className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
              Branch Name
            </label>
            <div className="relative bg-slate-50 border border-slate-150 rounded-2xl flex items-center px-4 h-12 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600 transition-shadow">
              <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                id="branchName"
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Enter bank branch name"
                className="w-full bg-transparent border-0 outline-hidden px-3.5 text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Save Payment Details Sticky Button */}
        <div className="mt-4 flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full h-14 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center gap-3.5 shadow-md shadow-teal-200/50 cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
              <Check className="w-4.5 h-4.5 text-teal-700 stroke-[3.5px]" />
            </div>
            <span className="text-sm font-extrabold tracking-wide">Save Payment Details</span>
          </motion.button>

          {/* Footer branding */}
          <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4">
            <p className="text-[10px] font-bold text-slate-400">
              Powered by <span className="text-amber-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
            </p>
            <p className="text-[9px] font-bold text-slate-400">
              &copy; 2026 All Rights Reserved.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

