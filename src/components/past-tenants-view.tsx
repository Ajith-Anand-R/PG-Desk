"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  Phone, 
  Shield, 
  Mail, 
  AlertCircle,
  Clock,
  Home
} from "lucide-react";
import { Tenant } from "@/lib/types";

interface PastTenantsViewProps {
  onBack: () => void;
  propertyName: string;
  tenants: Tenant[];
}

export function PastTenantsView({
  onBack,
  propertyName,
  tenants,
}: PastTenantsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Dynamic Stay Calculator (in Days)
  const getDaysStayed = (joinDateStr?: string | null, vacateDateStr?: string | null) => {
    if (!joinDateStr || !vacateDateStr) return null;
    const join = new Date(joinDateStr);
    join.setHours(0, 0, 0, 0);
    const vacate = new Date(vacateDateStr);
    vacate.setHours(0, 0, 0, 0);
    const diffTime = vacate.getTime() - join.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Filter past tenants (status = "left")
  const pastTenantsList = tenants.filter(t => {
    if (t.status !== "left") return false;
    const getLocalDateString = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayStr = getLocalDateString();
    if (t.vacateDate && t.vacateDate > todayStr) {
      return false;
    }
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.phone && t.phone.includes(searchQuery));
    return matchesSearch;
  });

  const formatAadhaar = (num?: string | null) => {
    if (!num) return "N/A";
    const cleaned = num.replace(/\s+/g, "");
    return cleaned.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number | string | null) => {
    if (amount === undefined || amount === null) return "N/A";
    return "₹" + Number(amount).toLocaleString("en-IN");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
  } as const;

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-slate-50/60 relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white rounded-b-[2.5rem] px-5 pt-6 pb-10 shadow-lg relative overflow-hidden select-none shrink-0">
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-slate-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-slate-500/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 cursor-pointer text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-slate-450 uppercase leading-none mb-1">
                {propertyName}
              </p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white leading-none">
                  Past Tenants Directory
                </h1>
                <span className="bg-white/10 border border-white/10 text-slate-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 leading-none">
                  {pastTenantsList.length} Left
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 mt-6 shrink-0">
        <div className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden flex items-center px-4 h-11.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus-within:shadow-md transition-shadow">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past tenants by name or phone..."
            className="w-full h-full bg-transparent border-0 px-3 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-450"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tenants History List */}
      <div className="px-5 mt-6 flex-1 flex flex-col gap-4 pb-10">
        {pastTenantsList.length === 0 ? (
          <div className="text-center py-16 px-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)] select-none">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-3 border border-slate-100/55">
              <User className="w-5 h-5" />
            </div>
            <p className="text-slate-800 font-bold text-sm">No past tenants found</p>
            <p className="text-slate-400 text-xs mt-1 font-semibold">
              Residents will appear here once checked out or notice period expires.
            </p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-3.5"
          >
            {pastTenantsList.map((tenant) => {
              const daysStayed = getDaysStayed(tenant.joinDate, tenant.vacateDate);
              return (
                <motion.div
                  key={tenant.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedTenant(tenant)}
                  className="bg-white rounded-2xl p-4.5 border border-slate-150/80 hover:border-slate-300 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-sm flex items-center justify-between cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* User Avatar Circle */}
                    <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-3xs overflow-hidden">
                      {tenant.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black text-slate-850 truncate leading-tight">
                        {tenant.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-455 mt-1.5 flex items-center gap-1 leading-none">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {tenant.phone || "No phone"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span className="text-[9.5px] font-black text-slate-550 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Room {tenant.roomName || "N/A"}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      {daysStayed !== null ? `${daysStayed} days stayed` : "N/A"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Tenant Details Modal Overlay */}
      <AnimatePresence>
        {selectedTenant && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden border border-slate-100 shadow-2xl relative flex flex-col max-h-[85dvh]"
            >
              <button
                onClick={() => setSelectedTenant(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100/70 hover:bg-slate-200/70 text-slate-500 cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Cover Banner */}
              <div className="h-24 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 relative shrink-0">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* Header Title Overlap */}
              <div className="flex flex-col items-center px-6 -mt-10 relative z-10 pb-4 border-b border-slate-100 shrink-0 bg-white">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center font-extrabold text-2xl text-slate-800 overflow-hidden shrink-0">
                  {selectedTenant.name?.substring(0, 2).toUpperCase()}
                </div>
                <h4 className="text-base font-black text-slate-850 tracking-tight mt-2">
                  {selectedTenant.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <Shield className="w-3 h-3 text-slate-500" />
                  <span className="text-[9px] font-black text-slate-550 uppercase tracking-wider">
                    Past Resident (History)
                  </span>
                </div>
              </div>

              {/* Scrollable Details */}
              <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4.5 no-scrollbar flex-1 bg-slate-50/30">
                {/* Stay details */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-150 flex flex-col gap-3 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Stay Details
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-505">Room Assignment</span>
                    <span className="font-extrabold text-slate-800">Room {selectedTenant.roomName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Join Date</span>
                    <span className="font-extrabold text-slate-700">{formatDate(selectedTenant.joinDate)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Vacate Date</span>
                    <span className="font-extrabold text-slate-700">{formatDate(selectedTenant.vacateDate)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-550">Total Stay Duration</span>
                    <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {(() => {
                        const days = getDaysStayed(selectedTenant.joinDate, selectedTenant.vacateDate);
                        return days !== null ? `${days} days` : "N/A";
                      })()}
                    </span>
                  </div>
                </div>

                {/* Aadhaar Info Card */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-150 flex flex-col gap-3 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-550" />
                    Identity Verification
                  </span>
                  
                  {/* Aadhaar Visual Layout */}
                  <div className="bg-gradient-to-br from-blue-50/70 via-sky-50/50 to-orange-50/70 border border-sky-100/70 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none shadow-2xs min-h-[120px]">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-sky-100/50">
                      <span className="text-[7px] font-black text-slate-400 tracking-wider uppercase">GOVERNMENT OF INDIA</span>
                      <span className="text-[8px] font-black text-slate-700 bg-slate-100 px-1 py-0.2 rounded-sm border border-slate-200 uppercase tracking-wide">AADHAAR</span>
                    </div>

                    {/* Aadhaar details */}
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="w-10 h-12 bg-slate-200/50 border border-slate-350/30 rounded-xs flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9.5px] font-black text-slate-750">{selectedTenant.name}</span>
                        <span className="text-[7.5px] font-bold text-slate-400">ID Proof: Aadhaar Card</span>
                      </div>
                    </div>

                    {/* Large bold number */}
                    <div className="text-center text-xs font-black text-slate-800 tracking-widest font-mono pt-1.5 border-t border-sky-100/50">
                      {formatAadhaar(selectedTenant.aadhaarNumber)}
                    </div>
                  </div>
                </div>

                {/* Financial details */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-150 flex flex-col gap-3.5 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    Financial Record
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-505">Room Rent (Rate)</span>
                    <span className="font-extrabold text-slate-850">{formatCurrency(selectedTenant.rentAmount)}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Security Deposit Paid</span>
                    <span className="font-black text-slate-800">{formatCurrency(selectedTenant.deposit)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Deposit Refunded?</span>
                    <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      selectedTenant.refundEligible
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-rose-50 border-rose-100 text-rose-600"
                    }`}>
                      {selectedTenant.refundEligible ? "Refunded" : "Forfeited"}
                    </span>
                  </div>
                </div>

                {/* Emergency contact */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-150 flex flex-col gap-3 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    Emergency Contact
                  </span>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-semibold text-slate-505">Contact Number</span>
                    <span className="font-extrabold text-slate-700">{selectedTenant.emergencyContact || "N/A"}</span>
                  </div>
                </div>

                {/* Other contact info */}
                <div className="bg-white rounded-2xl p-4.5 border border-slate-150 flex flex-col gap-3.5 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-550" />
                    Contact details
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-505">Email Address</span>
                    <span className="font-extrabold text-slate-700 truncate max-w-[180px]">{selectedTenant.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Phone Number</span>
                    <span className="font-extrabold text-slate-700">{selectedTenant.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTenant(null)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all font-extrabold text-slate-700 text-xs uppercase tracking-wider cursor-pointer text-center"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
