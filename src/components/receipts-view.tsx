"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  X, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Calendar,
  Receipt,
  User,
  AlertTriangle
} from "lucide-react";

interface ReceiptItem {
  id: string;
  tenantName: string;
  roomName: string;
  amount: number;
  date: string;
  refCode: string;
  paymentMethod: string;
  photo?: string | null;
}

interface DueItem {
  id: string;
  tenantName: string;
  roomName: string;
  amount: number;
  dueDate: string;
  status: "pending" | "overdue";
}

interface ReceiptsViewProps {
  onBack: () => void;
  propertyName: string;
  initialTab?: "dues" | "receipts";
}

export function ReceiptsView({ onBack, propertyName, initialTab = "receipts" }: ReceiptsViewProps) {
  const [activeTab, setActiveTab] = useState<"dues" | "receipts">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock Receipts Database
  const [receipts] = useState<ReceiptItem[]>([
    { 
      id: "rc_1", 
      tenantName: "Sam", 
      roomName: "Room 101", 
      amount: 7600.10, 
      date: "6 Jun 26", 
      refCode: "TXN-55c53986-0adf-42aa-af0d-a3825bc18499-1780720297392",
      paymentMethod: "UPI"
    },
    { 
      id: "rc_2", 
      tenantName: "Sab", 
      roomName: "Room 102", 
      amount: 7100.05, 
      date: "6 Jun 26", 
      refCode: "UPI payment submitted by tenant",
      paymentMethod: "UPI"
    },
    { 
      id: "rc_3", 
      tenantName: "Vihaan Joshi", 
      roomName: "Room 107", 
      amount: 7700.15, 
      date: "4 Jun 26", 
      refCode: "TXN-88a24190-2adf-43aa-bf0d-b19375bc1929-1893710298371",
      paymentMethod: "NetBanking"
    },
    { 
      id: "rc_4", 
      tenantName: "Aarav Nair", 
      roomName: "Room 101", 
      amount: 7000.00, 
      date: "1 Jun 26", 
      refCode: "TXN-11b23902-1cdf-32aa-cf0d-c93845bc1029-1928371029381",
      paymentMethod: "UPI"
    }
  ]);

  // Mock Dues Database (initially set to some pending items)
  const [dues, setDues] = useState<DueItem[]>([
    { id: "due_1", tenantName: "Rahul Sharma", roomName: "Room 105", amount: 6500.00, dueDate: "10 Jun 26", status: "pending" },
    { id: "due_2", tenantName: "Priya Patel", roomName: "Room 108", amount: 7200.00, dueDate: "05 Jun 26", status: "overdue" }
  ]);

  // Compute total outstanding dues
  const totalOutstanding = dues.reduce((acc, item) => acc + item.amount, 0);

  // Filter handlers
  const filteredReceipts = receipts.filter((rc) => {
    return rc.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           rc.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           rc.refCode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredDues = dues.filter((due) => {
    return due.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           due.roomName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-slate-50 select-none">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 text-white rounded-b-[2rem] px-5 pt-6 pb-12 shadow-md relative overflow-hidden shrink-0 select-none">
        {/* Decorative subtle background elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-500/35 blur-xl pointer-events-none" />
        
        {/* Back and Notification Navigation */}
        <div className="flex items-center justify-between mb-4 z-10 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xs cursor-pointer text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex flex-col items-center text-center">
            <h1 className="text-lg font-black tracking-tight leading-none text-white">Receipts</h1>
            <span className="text-[10px] font-bold text-emerald-250 mt-1 uppercase tracking-wider">{propertyName}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-xs cursor-pointer text-white"
          >
            <Bell className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main Body Column */}
      <div className="px-5 flex flex-col gap-6 -mt-6 z-10 relative flex-1">
        {/* Total Outstanding Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-5 shadow-xs border border-slate-100 flex items-center justify-between"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[9.5px] font-extrabold text-slate-400 tracking-widest uppercase">
              Total Outstanding
            </span>
            <span className="text-2xl font-black text-slate-800 font-mono tracking-tight mt-0.5">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </span>
          </div>

          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            totalOutstanding > 0 ? "bg-amber-50 text-amber-600 border border-amber-100/50" : "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
          }`}>
            {totalOutstanding > 0 ? <TrendingDown className="w-5.5 h-5.5" /> : <TrendingUp className="w-5.5 h-5.5" />}
          </div>
        </motion.div>

        {/* Dynamic Tab Switcher */}
        <div className="bg-slate-100/80 border border-slate-200/20 p-1.5 rounded-2xl flex w-full max-w-sm mx-auto shadow-inner select-none shrink-0 relative">
          <div className="grid grid-cols-2 w-full relative z-10">
            <button
              onClick={() => setActiveTab("dues")}
              className={`py-2 text-[11px] font-extrabold rounded-xl text-center cursor-pointer transition-colors relative flex items-center justify-center gap-1.5 select-none ${
                activeTab === "dues" ? "text-slate-800 font-black" : "text-slate-450 hover:text-slate-650"
              }`}
            >
              {activeTab === "dues" && (
                <motion.div
                  layoutId="activeReceiptTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-2xs -z-10 border border-slate-200/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pending Dues</span>
            </button>

            <button
              onClick={() => setActiveTab("receipts")}
              className={`py-2 text-[11px] font-extrabold rounded-xl text-center cursor-pointer transition-colors relative flex items-center justify-center gap-1.5 select-none ${
                activeTab === "receipts" ? "text-slate-800 font-black" : "text-slate-450 hover:text-slate-650"
              }`}
            >
              {activeTab === "receipts" && (
                <motion.div
                  layoutId="activeReceiptTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-2xs -z-10 border border-slate-200/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Receipt className="w-3.5 h-3.5" />
              <span>Recent Receipts</span>
            </button>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative bg-white rounded-2xl shadow-xs border border-slate-200/55 overflow-hidden flex items-center px-4 h-12 focus-within:shadow-sm transition-shadow shrink-0">
          <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "receipts" ? "Search by name or room..." : "Search pending dues..."}
            className="w-full h-full bg-transparent border-0 px-3 text-xs focus:outline-hidden font-semibold text-slate-700 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 flex flex-col gap-3.5">
          <AnimatePresence mode="popLayout">
            {activeTab === "receipts" ? (
              /* Recent Receipts Tab */
              filteredReceipts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-[2rem] p-10 border border-slate-200/40 shadow-xs flex flex-col items-center justify-center text-center gap-4 py-16 mt-2"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-1">
                    <Receipt className="w-8 h-8 text-slate-400/80" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base">No receipts found</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed max-w-[240px] mx-auto">
                      Transactions will appear here once rent payments are received.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredReceipts.map((rc) => (
                    <motion.div
                      key={rc.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="bg-white rounded-3xl p-4 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex items-center justify-between gap-4 relative overflow-hidden"
                    >
                      {/* Accent Green Line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 text-xs font-extrabold select-none">
                          {rc.tenantName.substring(0, 2).toUpperCase()}
                        </div>
                        
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-850 truncate leading-none">
                              {rc.tenantName}
                            </span>
                            <span className="text-[8.5px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm shrink-0 leading-none">
                              {rc.roomName}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400 truncate leading-relaxed mt-0.5 max-w-[200px] break-all">
                            Ref: {rc.refCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                        <span className="text-[12px] font-black text-emerald-600 font-mono leading-none">
                          + ₹{rc.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[8.5px] font-bold text-slate-400/90 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm leading-none">
                          {rc.date}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              /* Pending Dues Tab */
              filteredDues.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white rounded-[2rem] p-10 border border-slate-200/40 shadow-xs flex flex-col items-center justify-center text-center gap-4 py-16 mt-2"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-500 mb-1">
                    <TrendingUp className="w-8 h-8 text-emerald-600/80" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-base">All cleared!</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed max-w-[240px] mx-auto">
                      Excellent, there are no outstanding dues for this property.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredDues.map((due) => {
                    const isOverdue = due.status === "overdue";
                    return (
                      <motion.div
                        key={due.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white rounded-3xl p-4 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex items-center justify-between gap-4 relative overflow-hidden"
                      >
                        {/* Accent Red/Amber Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? "bg-rose-500" : "bg-amber-500"}`} />
                        
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 text-xs font-extrabold select-none ${
                            isOverdue 
                              ? "bg-rose-50 border-rose-100 text-rose-600" 
                              : "bg-amber-50 border-amber-100 text-amber-600"
                          }`}>
                            {due.tenantName.substring(0, 2).toUpperCase()}
                          </div>
                          
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-850 truncate leading-none">
                                {due.tenantName}
                              </span>
                              <span className="text-[8.5px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm shrink-0 leading-none">
                                {due.roomName}
                              </span>
                            </div>
                            <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md leading-none w-max mt-1 border ${
                              isOverdue 
                                ? "bg-rose-50/70 text-rose-600 border-rose-100/50" 
                                : "bg-amber-50/70 text-amber-600 border-amber-100/50"
                            }`}>
                              {isOverdue ? "Overdue" : "Pending"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                          <span className={`text-[12px] font-black font-mono leading-none ${
                            isOverdue ? "text-rose-600" : "text-amber-650"
                          }`}>
                            ₹{due.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[8.5px] font-bold text-slate-400/90 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm leading-none flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Due: {due.dueDate}</span>
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* Footer branding */}
        <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-2 shrink-0">
          <p className="text-[10px] font-bold text-slate-400">
            Powered by <span className="text-emerald-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
          </p>
        </div>
      </div>

      {/* Premium Bottom Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 h-14 flex items-center select-none shadow-lg z-20">
        {/* Filter on left */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex-1 h-full flex items-center justify-center gap-2 text-xs font-bold text-slate-650 hover:bg-slate-50/50 transition-colors border-r border-slate-100 shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span>Filter</span>
        </motion.button>

        {/* View All History on right */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex-2 h-full flex items-center justify-center gap-2 text-xs font-black text-emerald-600 hover:bg-emerald-50/10 transition-colors shrink-0 cursor-pointer"
        >
          <span>View All History</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
