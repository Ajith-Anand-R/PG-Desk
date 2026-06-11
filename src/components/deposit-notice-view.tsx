"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Search, 
  X, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Coins, 
  UserMinus, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  Edit, 
  RotateCcw,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { Tenant } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { calculateNoticeDays } from "@/lib/utils";


interface DepositNoticeViewProps {
  onBack: () => void;
  propertyName: string;
  activePgId: string | undefined;
  tenants: Tenant[];
  onRefresh: () => Promise<void>;
}

export function DepositNoticeView({
  onBack,
  propertyName,
  activePgId,
  tenants,
  onRefresh,
}: DepositNoticeViewProps) {
  const [activeTab, setActiveTab] = useState<"notice" | "deposits">("notice");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal / BottomSheet States
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditDepositOpen, setIsEditDepositOpen] = useState(false);
  const [depositVal, setDepositVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-clear success message
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filters and Computations
  const noticeTenants = useMemo(() => {
    return tenants.filter(t => t.status === "notice" && t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tenants, searchQuery]);

  const depositTenants = useMemo(() => {
    return tenants.filter(t => ["active", "notice", "prebooked"].includes(t.status) && t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tenants, searchQuery]);

  // Notice Tab Stats
  const totalOnNotice = useMemo(() => tenants.filter(t => t.status === "notice").length, [tenants]);
  const refundApprovedCount = useMemo(() => tenants.filter(t => t.status === "notice" && t.refundEligible).length, [tenants]);
  const forfeitedCount = useMemo(() => tenants.filter(t => t.status === "notice" && t.status === "notice" && !t.refundEligible).length, [tenants]);

  // Deposit Tab Stats
  const totalDepositsHeld = useMemo(() => {
    return tenants
      .filter(t => ["active", "notice", "prebooked"].includes(t.status))
      .reduce((sum, t) => sum + (t.deposit || 0), 0);
  }, [tenants]);

  const pendingRefundAmount = useMemo(() => {
    return tenants
      .filter(t => t.status === "notice" && t.refundEligible)
      .reduce((sum, t) => sum + (t.deposit || 0), 0);
  }, [tenants]);

  const forfeitedDepositAmount = useMemo(() => {
    return tenants
      .filter(t => t.status === "notice" && !t.refundEligible)
      .reduce((sum, t) => sum + (t.deposit || 0), 0);
  }, [tenants]);

  // Handlers
  const handleToggleRefundEligibility = async (tenantId: string, currentVal: boolean | null | undefined) => {
    try {
      setIsSubmitting(true);
      const newVal = !currentVal;
      const { error } = await supabase
        .from("tenants")
        .update({ refund_eligible: newVal })
        .eq("id", parseInt(tenantId));

      if (error) throw error;
      
      setSuccessMessage(`Refund eligibility updated.`);
      await onRefresh();
    } catch (err) {
      console.error("Error updating refund eligibility:", err);
      alert("Failed to update refund status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelNotice = async (tenantId: string) => {
    if (!confirm("Are you sure you want to cancel this checkout notice and return this resident to active status?")) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("tenants")
        .update({
          status: "active",
          notice_date: null,
          vacate_date: null,
          refund_eligible: false
        })
        .eq("id", parseInt(tenantId));

      if (error) throw error;

      setSuccessMessage("Notice cancelled successfully.");
      await onRefresh();
    } catch (err) {
      console.error("Error cancelling notice:", err);
      alert("Failed to cancel notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutTenant = async (tenant: Tenant) => {
    const getLocalDateString = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const todayStr = getLocalDateString();
    if (tenant.vacateDate && tenant.vacateDate > todayStr) {
      alert(`Cannot checkout resident yet. The notice period is active until ${new Date(tenant.vacateDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`);
      return;
    }

    const refundStatusText = tenant.refundEligible 
      ? `Eligible for a ₹${tenant.deposit?.toLocaleString()} refund.` 
      : "Security deposit is FORFEITED.";
      
    if (!confirm(`Complete check-out for ${tenant.name}? \n\n${refundStatusText}\n\nThis will mark the tenant as 'left' and release their allocated bed.`)) return;

    try {
      setIsSubmitting(true);

      // 1. Mark tenant as left and record vacate date
      const { error: tenantError } = await supabase
        .from("tenants")
        .update({ 
          status: "left", 
          vacate_date: new Date().toISOString().split("T")[0] 
        })
        .eq("id", parseInt(tenant.id));

      if (tenantError) throw tenantError;

      // 2. Determine and update bed status
      if (tenant.bedId) {
        const bedIdNum = parseInt(tenant.bedId);
        
        // Check if there is a prebooked tenant waiting for this bed
        const { data: prebookedTenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("bed_id", bedIdNum)
          .eq("status", "prebooked")
          .maybeSingle();

        const newBedStatus = prebookedTenant ? "reserved" : "available";

        const { error: bedError } = await supabase
          .from("beds")
          .update({ status: newBedStatus })
          .eq("id", bedIdNum);

        if (bedError) throw bedError;
      }

      setSuccessMessage(`${tenant.name} checked out successfully.`);
      await onRefresh();
    } catch (err) {
      console.error("Error checking out tenant:", err);
      alert("Failed to check out resident.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || isNaN(Number(depositVal))) return;

    try {
      setIsSubmitting(true);
      const amt = parseFloat(depositVal);
      const { error } = await supabase
        .from("tenants")
        .update({ deposit: amt })
        .eq("id", parseInt(selectedTenant.id));

      if (error) throw error;

      setSuccessMessage(`Deposit updated for ${selectedTenant.name}.`);
      setIsEditDepositOpen(false);
      setSelectedTenant(null);
      await onRefresh();
    } catch (err) {
      console.error("Error updating deposit:", err);
      alert("Failed to update deposit amount.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDeposit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDepositVal(tenant.deposit ? String(tenant.deposit) : "0");
    setIsEditDepositOpen(true);
  };

  // Helper: calculate notice duration
  const getNoticeDays = (noticeDate: string | null | undefined, vacateDate: string | null | undefined) => {
    return calculateNoticeDays(noticeDate, vacateDate);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-slate-50 relative">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white rounded-b-[2.5rem] px-5 pt-6 pb-12 shadow-lg relative overflow-hidden shrink-0 select-none">
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-teal-500/10 blur-xl pointer-events-none" />

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
              <p className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase leading-none mb-1">
                {propertyName}
              </p>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">
                Security & Notice Management
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="px-5 -mt-6 z-20 relative select-none">
        <div className="bg-white rounded-2xl p-1.5 border border-slate-100 shadow-xs flex gap-1.5">
          <button
            onClick={() => { setActiveTab("notice"); setSearchQuery(""); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "notice"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Notice Periods ({totalOnNotice})
          </button>
          <button
            onClick={() => { setActiveTab("deposits"); setSearchQuery(""); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "deposits"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Security Deposits
          </button>
        </div>
      </div>

      {/* Dynamic Tab Stat Summaries */}
      <div className="px-5 mt-5">
        <AnimatePresence mode="wait">
          {activeTab === "notice" ? (
            <motion.div
              key="notice-stats"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-3 gap-2.5"
            >
              <div className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-col justify-between h-20">
                <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase truncate">Serving Notice</span>
                <span className="text-lg font-black text-slate-800 leading-none">{totalOnNotice}</span>
              </div>
              <div className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-col justify-between h-20">
                <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase truncate">Refund Approved</span>
                <span className="text-lg font-black text-emerald-600 leading-none">{refundApprovedCount}</span>
              </div>
              <div className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-col justify-between h-20">
                <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase truncate">Forfeited</span>
                <span className="text-lg font-black text-rose-500 leading-none">{forfeitedCount}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="deposit-stats"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-3 gap-2.5"
            >
              <div className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-col justify-between h-20">
                <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase truncate">Deposits Held</span>
                <span className="text-sm font-black text-slate-800 leading-none">₹{totalDepositsHeld.toLocaleString()}</span>
              </div>
              <div className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-col justify-between h-20">
                <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase truncate">Pending Refund</span>
                <span className="text-sm font-black text-emerald-600 leading-none">₹{pendingRefundAmount.toLocaleString()}</span>
              </div>
              <div className="bg-white border border-slate-200/50 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)] flex flex-col justify-between h-20">
                <span className="text-[8.5px] font-extrabold text-slate-400 tracking-wider uppercase truncate">Forfeited Notice</span>
                <span className="text-sm font-black text-rose-500 leading-none">₹{forfeitedDepositAmount.toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Banner Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-bold flex items-center gap-2 select-none"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input Bar */}
      <div className="px-5 mt-4">
        <div className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden flex items-center px-4 h-11.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus-within:shadow-md transition-shadow">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "notice" ? "Search residents on notice..." : "Search resident deposits..."}
            className="w-full h-full bg-transparent border-0 px-3 text-xs font-semibold focus:outline-hidden text-slate-700"
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

      {/* Tab Contents View Lists */}
      <div className="px-5 mt-4 flex-1 pb-12">
        {activeTab === "notice" ? (
          /* NOTICE PERIOD LIST VIEW */
          <div className="flex flex-col gap-4">
            {noticeTenants.length === 0 ? (
              <div className="text-center py-16 px-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
                <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-slate-800 font-bold text-sm">No residents on notice</p>
                <p className="text-slate-400 text-xs mt-1 font-semibold">
                  Residents will appear here once they submit a vacate notice.
                </p>
              </div>
            ) : (
              noticeTenants.map((tenant) => {
                const noticeDays = getNoticeDays(tenant.noticeDate, tenant.vacateDate);
                const isRefundEligible = tenant.refundEligible;

                return (
                  <motion.div
                    key={tenant.id}
                    layoutId={tenant.id}
                    className="bg-white rounded-[1.8rem] p-5 border border-slate-150 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative overflow-hidden"
                  >
                    {/* Header: Name and Room */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-black text-slate-850 truncate">{tenant.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                          Room {tenant.roomName}
                        </span>
                      </div>
                      
                      {/* Refund Eligibility Badge */}
                      <button
                        onClick={() => !isSubmitting && handleToggleRefundEligibility(tenant.id, isRefundEligible)}
                        disabled={isSubmitting}
                        className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isRefundEligible
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100/50"
                            : "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100/50"
                        }`}
                      >
                        {isRefundEligible ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Refund Approved
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            Refund Forfeited
                          </>
                        )}
                      </button>
                    </div>

                    {/* Notice details summary */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] font-bold text-slate-500 select-none">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-400 uppercase tracking-wide">Notice Date</span>
                        <span className="text-slate-800 font-extrabold">
                          {tenant.noticeDate ? new Date(tenant.noticeDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-400 uppercase tracking-wide">Vacate Date</span>
                        <span className="text-slate-800 font-extrabold">
                          {tenant.vacateDate ? new Date(tenant.vacateDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-slate-400 uppercase tracking-wide">Notice Period</span>
                        <span className="text-slate-800 font-extrabold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          {noticeDays} days
                        </span>
                      </div>
                    </div>

                    {/* Actions block */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100/50 mt-1">
                      <button
                        onClick={() => handleCancelNotice(tenant.id)}
                        disabled={isSubmitting}
                        className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Cancel Notice
                      </button>

                      <button
                        onClick={() => handleCheckoutTenant(tenant)}
                        disabled={isSubmitting}
                        className="flex-1 bg-slate-900 hover:bg-slate-850 text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        Complete Checkout
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          /* SECURITY DEPOSITS LIST VIEW */
          <div className="flex flex-col gap-3.5">
            {depositTenants.length === 0 ? (
              <div className="text-center py-16 px-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
                <AlertCircle className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-slate-800 font-bold text-sm">No tenants found</p>
                <p className="text-slate-400 text-xs mt-1 font-semibold">
                  No active or registered residents matched the search query.
                </p>
              </div>
            ) : (
              depositTenants.map((tenant) => {
                const depAmt = tenant.deposit || 0;
                
                return (
                  <motion.div
                    key={tenant.id}
                    layoutId={tenant.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                        <Coins className="w-5 h-5 text-emerald-600" />
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-800 truncate leading-tight">
                          {tenant.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 leading-none">
                          Room {tenant.roomName} • {tenant.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-extrabold text-slate-850 font-mono">
                          ₹{depAmt.toLocaleString()}
                        </span>
                        <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wide leading-none mt-1">
                          Deposit
                        </span>
                      </div>

                      <button
                        onClick={() => openEditDeposit(tenant)}
                        className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer active:scale-95 transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Edit Deposit BottomSheet Panel */}
      <BottomSheet
        isOpen={isEditDepositOpen}
        onClose={() => { setIsEditDepositOpen(false); setSelectedTenant(null); }}
        title={`Update Security Deposit`}
      >
        {selectedTenant && (
          <form onSubmit={handleUpdateDepositSubmit} className="flex flex-col gap-4 text-xs font-semibold">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 select-none flex flex-col gap-1.5">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Resident</span>
              <p className="text-sm font-black text-slate-800 mt-0.5 leading-none">{selectedTenant.name}</p>
              <p className="text-[11px] text-slate-500 font-bold leading-none mt-1">Room {selectedTenant.roomName}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="edit-deposit-amount" className="text-slate-600">Security Deposit Amount (₹)</label>
              <input
                type="number"
                id="edit-deposit-amount"
                required
                value={depositVal}
                onChange={(e) => setDepositVal(e.target.value)}
                placeholder="Enter deposit amount..."
                className="w-full bg-white border border-slate-200/80 rounded-xl px-4.5 h-11 focus:outline-hidden focus:border-slate-800 text-xs font-bold text-slate-850 shadow-xs"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setIsEditDepositOpen(false); setSelectedTenant(null); }}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-3 text-xs font-bold cursor-pointer transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-slate-850 text-white rounded-xl py-3 text-xs font-bold cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Save Amount"}
              </button>
            </div>
          </form>
        )}
      </BottomSheet>

      {/* Brand Footer */}
      <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-2 shrink-0">
        <p className="text-[10px] font-bold text-slate-400">
          Powered by <span className="text-emerald-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
        </p>
      </div>
    </div>
  );
}
