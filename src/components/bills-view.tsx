"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, User, FileText, Landmark, X, MessageSquare, Info } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  roomName: string;
  rentAmount: number;
  status: "active" | "left" | "prebooked";
}

interface BillsViewProps {
  tenants: Tenant[];
  onBack: () => void;
  onSendReminder: (tenantName: string) => void;
}

export function BillsView({ tenants, onBack, onSendReminder }: BillsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const activeTenants = tenants.filter((t) => t.status === "active");

  const filteredTenants = activeTenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[100dvh] pb-8 bg-slate-50 select-none">
      {/* Top Header Navigation */}
      <div className="bg-teal-700 text-white pt-5 pb-6 px-5 rounded-b-[2rem] shadow-md relative overflow-hidden flex flex-col gap-4">
        {/* Background glowing decorations */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

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
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Bill Reminders</h1>
            <p className="text-xs font-semibold text-white/80 mt-1.5 leading-none">
              {activeTenants.length} total tenants
            </p>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-5 relative flex-1">
        {/* Search Bar Floating Card */}
        <div className="relative bg-white rounded-2xl shadow-xs border border-slate-200/50 overflow-hidden flex items-center px-4 h-12 focus-within:shadow-sm transition-shadow">
          <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or room..."
            className="w-full h-full bg-transparent border-0 px-3 text-xs focus:outline-hidden font-semibold text-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[10.5px] leading-relaxed font-bold text-emerald-700">
            Tap WhatsApp icon to send bill reminder instantly.
          </p>
        </div>

        {/* Tenants List */}
        <div className="flex-1 flex flex-col gap-3.5">
          <AnimatePresence mode="popLayout">
            {filteredTenants.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2rem] p-10 border border-slate-200/40 shadow-xs flex flex-col items-center justify-center text-center gap-3 py-16"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-1">
                  <FileText className="w-8 h-8 text-slate-400/80" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">No Tenants Found</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
                    {activeTenants.length === 0 ? "No tenants available" : "No results matching search"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredTenants.map((tenant) => (
                  <motion.div
                    key={tenant.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="bg-white rounded-3xl p-4 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex items-center justify-between gap-4 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-black text-slate-800 truncate leading-none">
                          {tenant.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-slate-400 truncate leading-none">
                          Room: {tenant.roomName}
                        </span>
                        <span className="text-[10px] font-black text-emerald-600 mt-0.5 leading-none">
                          Rent: ₹{tenant.rentAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onSendReminder(tenant.name)}
                      className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5.5 h-5.5"
                      >
                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.335 4.963L2 22l5.233-1.371a9.96 9.96 0 004.779 1.21h.005c5.505 0 9.99-4.478 9.99-9.986C22.008 6.478 17.519 2 12.012 2zm4.7 13.999c-.195.552-1.135 1.07-1.583 1.126-.448.056-.875.248-2.874-.543-2.001-.791-3.261-2.837-3.36-2.97-.1-.132-.733-.975-.733-1.87 0-.893.469-1.333.636-1.516.166-.182.365-.228.487-.228.121 0 .243.002.348.006.113.004.264-.043.414.321.155.378.531 1.297.576 1.39.045.09.076.197.015.319-.06.121-.09.197-.181.303-.092.106-.192.236-.274.319-.09.09-.185.19-.08.371.106.182.473.782.986 1.238.66.587 1.213.77 1.382.853.17.083.268.069.368-.047.1-.117.424-.492.537-.662.114-.17.228-.14.382-.084.156.057.989.466 1.159.551.17.085.284.127.327.2.042.071.042.413-.153.965z" />
                      </svg>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer branding */}
        <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-4">
          <p className="text-[10px] font-bold text-slate-400">
            Powered by <span className="text-emerald-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
          </p>
          <p className="text-[9px] font-bold text-slate-400">
            &copy; 2026 All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
