"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  Building, 
  Building2, 
  MapPin, 
  Home, 
  Info, 
  Map, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calculator, 
  Bed, 
  ArrowLeft, 
  CheckCircle 
} from "lucide-react";

interface CreatePropertyViewProps {
  onBack: () => void;
  userEmail: string;
  userPhone: string;
  onCreateProperty: (name: string) => void;
  onMenuClick: () => void;
}

export function CreatePropertyView({
  onBack,
  userEmail,
  userPhone,
  onCreateProperty,
  onMenuClick,
}: CreatePropertyViewProps) {
  // Form states
  const [propertyName, setPropertyName] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState(userEmail || "salikmohammed101@gmail.com");
  const [phone, setPhone] = useState(userPhone || "6369282278");
  const [whatsapp, setWhatsapp] = useState("");
  const [totalBeds, setTotalBeds] = useState("");

  // Pincode auto-fill lookup simulation
  const handlePincodeChange = (val: string) => {
    // Only allow digits, max 6 characters
    const digits = val.replace(/\D/g, "").slice(0, 6);
    setPincode(digits);

    if (digits.length === 6) {
      if (digits.startsWith("56")) {
        setCity("Bengaluru");
        setState("Karnataka");
      } else if (digits.startsWith("11")) {
        setCity("New Delhi");
        setState("Delhi");
      } else if (digits.startsWith("60")) {
        setCity("Chennai");
        setState("Tamil Nadu");
      } else if (digits.startsWith("40")) {
        setCity("Mumbai");
        setState("Maharashtra");
      } else if (digits.startsWith("50")) {
        setCity("Hyderabad");
        setState("Telangana");
      } else {
        // Fallback default
        setCity("Chennai");
        setState("Tamil Nadu");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim() || !totalBeds) return;

    onCreateProperty(propertyName.trim());
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-10 bg-slate-50 select-none">
      {/* Top Header Navigation (matching PG Desk top bar) */}
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

        {/* Create Property Title Info */}
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
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Create Property</h1>
            <p className="text-xs font-semibold text-white/85 mt-1.5 leading-none">Add your property details</p>
          </div>
        </div>
      </div>

      {/* Form Fields Body (Scrollable Container) */}
      <form onSubmit={handleSubmit} className="px-5 -mt-4 z-20 flex flex-col gap-5 relative flex-1">
        
        {/* Section 1: Property Information */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">Property Information</h2>
          </div>

          {/* Property Name Input */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <Building className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Property Name *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Section 2: Address Details */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">Address Details</h2>
          </div>

          {/* Auto-fill banner alert */}
          <div className="bg-teal-50 border border-teal-100/50 px-4 py-3 rounded-2xl flex items-center gap-2.5 select-none">
            <Info className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <span className="text-[10px] font-bold text-teal-750 leading-tight">
              Enter pincode to auto-fill city & state
            </span>
          </div>

          {/* Pincode Input */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <MapPin className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <input
              type="text"
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              placeholder="Pincode *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Address Line 1 Input */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <Home className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Address Line 1 *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Address Line 2 Input */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <Home className="w-4.5 h-4.5 text-teal-400 shrink-0" />
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Address Line 2 *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* City and State Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* City */}
            <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
              <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City *"
                className="w-full h-full bg-transparent border-0 px-2.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
                required
              />
            </div>

            {/* State */}
            <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
              <Map className="w-4 h-4 text-teal-600 shrink-0" />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State *"
                className="w-full h-full bg-transparent border-0 px-2.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Contact Information */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">Contact Information</h2>
          </div>

          {/* Email Address */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <Mail className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <Phone className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile Number *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>

          {/* WhatsApp Number */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <MessageSquare className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp Number *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Section 4: Capacity */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">Capacity</h2>
          </div>

          {/* Total number of Beds */}
          <div className="relative bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center px-4.5 h-12 transition-all focus-within:bg-white focus-within:border-teal-500/30 focus-within:ring-2 focus-within:ring-teal-500/5">
            <Bed className="w-4.5 h-4.5 text-teal-600 shrink-0" />
            <input
              type="number"
              min="1"
              value={totalBeds}
              onChange={(e) => setTotalBeds(e.target.value)}
              placeholder="Total number of Beds *"
              className="w-full h-full bg-transparent border-0 px-3.5 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
              required
            />
          </div>
        </div>

        {/* Submit Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 px-4.5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 mt-2 flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
        >
          <CheckCircle className="w-4.5 h-4.5 text-white" />
          <span>Create Property</span>
        </motion.button>
      </form>
    </div>
  );
}

