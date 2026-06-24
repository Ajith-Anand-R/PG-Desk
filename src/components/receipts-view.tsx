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

export interface ReceiptItem {
  id: string;
  tenantName: string;
  roomName: string;
  amount: number;
  date: string;
  refCode: string;
  paymentMethod: string;
  photo?: string | null;
  tenantPhone?: string;
}

export interface DueItem {
  id: string;
  tenantName: string;
  roomName: string;
  amount: number;
  dueDate: string;
  status: "pending" | "overdue";
  tenantPhone?: string;
}

interface ReceiptsViewProps {
  onBack: () => void;
  propertyName: string;
  initialTab?: "dues" | "receipts";
  dues?: DueItem[];
  receipts?: ReceiptItem[];
  onCollectRent?: (dueId: string, paymentMethod: string) => void;
}

export function ReceiptsView({
  onBack,
  propertyName,
  initialTab = "receipts",
  dues: duesProp,
  receipts: receiptsProp,
  onCollectRent,
}: ReceiptsViewProps) {
  const [activeTab, setActiveTab] = useState<"dues" | "receipts">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDueId, setSelectedDueId] = useState<string | null>(null);

  // Mock Receipts Database Fallback
  const defaultReceipts: ReceiptItem[] = [
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
  ];

  // Mock Dues Database Fallback
  const defaultDues: DueItem[] = [
    { id: "due_1", tenantName: "Rahul Sharma", roomName: "Room 105", amount: 6500.00, dueDate: "10 Jun 26", status: "pending" },
    { id: "due_2", tenantName: "Priya Patel", roomName: "Room 108", amount: 7200.00, dueDate: "05 Jun 26", status: "overdue" }
  ];

  const receipts = receiptsProp || defaultReceipts;
  const dues = duesProp || defaultDues;

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

  // Combine dues and receipts into a unified rent collection list
  const rentCollectionList = React.useMemo(() => {
    const list: any[] = [];
    
    dues.forEach((d) => {
      list.push({
        id: d.id,
        tenantName: d.tenantName,
        roomName: d.roomName,
        amount: d.amount,
        dueDate: d.dueDate,
        status: d.status,
        phone: d.tenantPhone || ""
      });
    });

    receipts.forEach((r) => {
      list.push({
        id: r.id,
        tenantName: r.tenantName,
        roomName: r.roomName,
        amount: r.amount,
        dueDate: r.date,
        status: "paid",
        phone: r.tenantPhone || ""
      });
    });

    // Sort: Pending/Overdue first, then Paid
    return list.sort((a, b) => {
      if (a.status === "paid" && b.status !== "paid") return 1;
      if (a.status !== "paid" && b.status === "paid") return -1;
      return 0;
    });
  }, [dues, receipts]);

  const filteredRentCollection = rentCollectionList.filter((item) => {
    return item.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.roomName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendReminder = (tenantName: string, phone: string, amount: number, dueDate: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const text = `Hi ${tenantName}, this is a friendly reminder that your rent payment of ₹${amount} is pending. The due date was ${dueDate}. Please pay as soon as possible. Thank you!`;
    if (cleanPhone) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      alert(`Reminder notification generated for ${tenantName}! (No phone number registered)`);
    }
  };

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
              <span>Rent Collection</span>
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
              /* Rent Collection Tab (includes both Paid and Pending/Overdue records) */
              filteredRentCollection.length === 0 ? (
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
                    <h4 className="font-extrabold text-slate-800 text-base">No records found</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed max-w-[240px] mx-auto">
                      Rent records will be listed here.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Rent Collection Header Row */}
                  <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none shrink-0">
                    <span className="w-2/5">Tenant</span>
                    <span className="w-1/4 text-center">Due Date</span>
                    <span className="w-1/4 text-right">Status / Action</span>
                  </div>

                  {filteredRentCollection.map((item) => {
                    const isPaid = item.status === "paid";
                    const isOverdue = item.status === "overdue";
                    
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white rounded-3xl p-4 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3 relative overflow-hidden"
                      >
                        {/* Accent Status Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          isPaid ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-amber-500"
                        }`} />
                        
                        <div className="flex items-center justify-between gap-4">
                          {/* Tenant Info column */}
                          <div className="flex items-center gap-3 min-w-0 w-2/5">
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 text-xs font-extrabold select-none ${
                              isPaid 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                                : isOverdue 
                                ? "bg-rose-50 border-rose-100 text-rose-600" 
                                : "bg-amber-50 border-amber-100 text-amber-600"
                            }`}>
                              {item.tenantName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-black text-slate-850 truncate leading-none">
                                {item.tenantName}
                              </span>
                              <span className="text-[8.5px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm shrink-0 leading-none w-max mt-1">
                                {item.roomName}
                              </span>
                            </div>
                          </div>

                          {/* Due Date column */}
                          <div className="w-1/4 text-center select-none text-[10.5px] font-bold text-slate-500">
                            {item.dueDate}
                          </div>

                          {/* Status Badge */}
                          <div className="w-1/4 flex flex-col items-end gap-1.5 shrink-0 select-none">
                            <span className={`text-[12px] font-black font-mono leading-none ${
                              isPaid ? "text-emerald-600" : isOverdue ? "text-rose-600" : "text-amber-650"
                            }`}>
                              ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md leading-none border uppercase tracking-wider ${
                              isPaid 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : isOverdue 
                                ? "bg-rose-50/70 text-rose-600 border-rose-100/50" 
                                : "bg-amber-50/70 text-amber-600 border-amber-100/50"
                            }`}>
                              {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons (only for unpaid) */}
                        {!isPaid && (
                          <div className="flex gap-2.5 pt-2 border-t border-slate-100/60 select-none">
                            {onCollectRent && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDueId(item.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-xs text-center"
                              >
                                Mark Paid
                              </motion.button>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSendReminder(item.tenantName, item.phone, item.amount, item.dueDate)}
                              className="flex-1 bg-white border border-emerald-600/30 hover:border-emerald-600 text-emerald-600 font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                            >
                              Send Reminder
                            </motion.button>
                          </div>
                        )}
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

      {/* Payment Method Selector Modal */}
      <AnimatePresence>
        {selectedDueId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDueId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-lg text-slate-800">Select Payment Method</h3>
                <button
                  onClick={() => setSelectedDueId(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 font-sans">
                <p className="text-xs text-slate-500 font-semibold mb-2">
                  Please choose how the tenant paid this outstanding balance:
                </p>
                
                <button
                  onClick={() => {
                    if (onCollectRent && selectedDueId) {
                      onCollectRent(selectedDueId, "UPI");
                    }
                    setSelectedDueId(null);
                  }}
                  className="w-full flex items-center justify-between bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/50 text-emerald-800 font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer text-sm shadow-2xs"
                >
                  <span>Pay via UPI / Online</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">Recommended</span>
                </button>

                <button
                  onClick={() => {
                    if (onCollectRent && selectedDueId) {
                      onCollectRent(selectedDueId, "Cash");
                    }
                    setSelectedDueId(null);
                  }}
                  className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-800 font-bold py-3.5 px-5 rounded-2xl transition-all cursor-pointer text-sm"
                >
                  <span>Pay via Cash</span>
                  <span className="text-[10px] bg-slate-500 text-white px-2 py-0.5 rounded-full font-extrabold uppercase">Cash</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
