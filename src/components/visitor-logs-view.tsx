"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Search,
  Check,
  Clock,
  UserCheck,
  Building2,
  QrCode,
  Bell,
  ChevronDown,
  Menu,
  CheckCircle,
  X,
  LogOut,
  Calendar,
  Phone,
  UserPlus
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VisitorLogsViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
  activePgId: string | undefined;
}

export function VisitorLogsView({
  onBack,
  propertyName,
  onOpenPropertySelector,
  onMenuClick,
  onNavigateToNotifications,
  activePgId,
}: VisitorLogsViewProps) {
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchLogs = async () => {
    if (!activePgId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("visitor_logs")
        .select("*, tenants(*, users(*), rooms(*))")
        .eq("pg_id", Number(activePgId))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVisitorLogs(data || []);
    } catch (err: any) {
      console.error("Error fetching visitor logs:", err);
      setToastMessage("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activePgId]);

  const handleCheckIn = async (logId: number) => {
    const timeNow = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    try {
      const { error } = await supabase
        .from("visitor_logs")
        .update({
          entry_time: timeNow,
          status: "used"
        })
        .eq("id", logId);

      if (error) throw error;

      setToastMessage("Visitor Checked-In successfully!");
      await fetchLogs();
    } catch (err: any) {
      console.error("Error recording check-in:", err);
      setToastMessage("Check-in failed: " + err.message);
    }
  };

  const handleCheckOut = async (logId: number) => {
    const timeNow = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    try {
      const { error } = await supabase
        .from("visitor_logs")
        .update({
          exit_time: timeNow
        })
        .eq("id", logId);

      if (error) throw error;

      setToastMessage("Visitor Checked-Out successfully!");
      await fetchLogs();
    } catch (err: any) {
      console.error("Error recording check-out:", err);
      setToastMessage("Check-out failed: " + err.message);
    }
  };

  const filteredLogs = visitorLogs.filter((log) => {
    const tenantName = log.tenants?.users?.name || "";
    return (
      log.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.qr_code_token.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col min-h-[100dvh] pb-28 bg-slate-50 relative overflow-hidden">
      {/* Toast message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md border border-slate-800"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner */}
      <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 text-white rounded-b-[2rem] px-5 pt-6 pb-6 shadow-md relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-5 relative z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuClick}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10"
          >
            <Menu className="w-5 h-5 text-white" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenPropertySelector}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-slate-800 shadow-sm border border-slate-100 text-sm font-semibold max-w-[200px]"
          >
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{propertyName}</span>
            <div className="h-4 w-px bg-slate-200" />
            <QrCode className="w-4 h-4 text-slate-400 shrink-0" />
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onNavigateToNotifications}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 relative"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-800" />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-3.5 relative z-10 mt-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="size-6 text-amber-300" />
            Visitor Logs & Pass
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 -mt-5 z-20 relative">
        <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex items-center px-4 h-12 focus-within:shadow-md transition-shadow">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by visitor or resident..."
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
      </div>

      {/* Logs Content */}
      <div className="px-5 mt-6 flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center px-0.5 select-none">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Entries today</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {filteredLogs.length} Total Logs
          </span>
        </div>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">No Visitors Logged</h4>
              <p className="text-[10.5px] font-semibold text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Pre-approved tenant guest passes will show up here for check-in.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredLogs.map((log) => {
              const residentName = log.tenants?.users?.name || "Unknown Resident";
              const roomNo = log.tenants?.rooms?.room_number ? `Room ${log.tenants.rooms.room_number}` : "Unassigned";

              const hasCheckedIn = log.status === "used" || log.entry_time !== "Pending" && log.entry_time !== "";
              const hasCheckedOut = log.exit_time !== "Pending" && log.exit_time !== "";

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-2xs flex flex-col gap-3.5 relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    hasCheckedOut
                      ? "bg-slate-300"
                      : hasCheckedIn
                      ? "bg-blue-500 animate-pulse"
                      : "bg-emerald-500"
                  }`} />

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800 leading-none truncate">
                          {log.visitor_name}
                        </span>
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none ${
                          hasCheckedOut
                            ? "bg-slate-100 border-slate-200 text-slate-500"
                            : hasCheckedIn
                            ? "bg-blue-50 border-blue-100 text-blue-600"
                            : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}>
                          {hasCheckedOut ? "checked out" : hasCheckedIn ? "active visit" : "approved"}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-400 mt-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Date: {log.date}
                      </span>
                    </div>
                  </div>

                  {/* Pass details */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/60 text-xs font-semibold text-slate-650">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Host Resident</span>
                      <span className="text-slate-800 font-bold truncate mt-0.5">{residentName}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{roomNo}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Relationship / Phone</span>
                      <span className="text-slate-800 font-bold mt-0.5 truncate">{log.relationship}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 truncate">{log.phone}</span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      In: <span className="text-slate-700 font-black">{log.entry_time || "Pending"}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Out: <span className="text-slate-700 font-black">{log.exit_time || "Pending"}</span>
                    </span>
                  </div>

                  {/* Control buttons */}
                  <div className="flex gap-2 justify-end pt-1 select-none">
                    {!hasCheckedIn && (
                      <button
                        onClick={() => handleCheckIn(log.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        Check-In Guest
                      </button>
                    )}
                    {hasCheckedIn && !hasCheckedOut && (
                      <button
                        onClick={() => handleCheckOut(log.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        Check-Out Guest
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-auto text-center text-[10px] text-slate-400 font-bold select-none border-t border-slate-100 pt-6">
        <p>
          Powered by <span className="text-blue-600">PG</span> <span className="text-emerald-600 font-extrabold">Desk</span>
        </p>
        <p className="mt-1 font-semibold text-slate-400/80">© 2026 All Rights Reserved.</p>
      </div>
    </div>
  );
}
