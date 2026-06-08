"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Menu,
  Building2,
  QrCode,
  Bell,
  ChevronDown,
  CheckCircle,
  X,
  PlusCircle,
  MinusCircle,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface InventoryViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
  activePgId: string | undefined;
}

export function InventoryView({
  onBack,
  propertyName,
  onOpenPropertySelector,
  onMenuClick,
  onNavigateToNotifications,
  activePgId,
}: InventoryViewProps) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isLoggingTx, setIsLoggingTx] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Item State
  const [newItemName, setNewItemName] = useState("");
  const [initialQty, setInitialQty] = useState("");
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Transaction Form State
  const [txItemId, setTxItemId] = useState("");
  const [txType, setTxType] = useState<"in" | "out">("in");
  const [txQty, setTxQty] = useState("");
  const [txNotes, setTxNotes] = useState("");
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchData = async () => {
    if (!activePgId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Inventory Items
      const { data: invData, error: invError } = await supabase
        .from("inventory")
        .select("*")
        .eq("pg_id", Number(activePgId))
        .order("item_name", { ascending: true });

      if (invError) throw invError;
      setInventory(invData || []);

      // 2. Fetch Transactions
      const { data: txData, error: txError } = await supabase
        .from("inventory_transactions")
        .select("*, inventory(*)")
        .eq("pg_id", Number(activePgId))
        .order("created_at", { ascending: false })
        .limit(30);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (err: any) {
      console.error("Error fetching inventory data:", err);
      setToastMessage("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activePgId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePgId || !newItemName.trim() || !initialQty) return;
    setIsSubmittingItem(true);
    try {
      const qtyNum = Number(initialQty);
      
      // 1. Insert Item
      const { data: item, error: itemError } = await supabase
        .from("inventory")
        .insert({
          pg_id: Number(activePgId),
          item_name: newItemName.trim(),
          quantity: qtyNum
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // 2. If initial quantity > 0, log an initial transaction
      if (qtyNum > 0 && item) {
        await supabase.from("inventory_transactions").insert({
          pg_id: Number(activePgId),
          item_id: item.id,
          transaction_type: "in",
          quantity: qtyNum,
          notes: "Initial stock registration"
        });
      }

      setToastMessage("Item added to inventory!");
      setNewItemName("");
      setInitialQty("");
      setIsAddingItem(false);
      await fetchData();
    } catch (err: any) {
      console.error("Error adding item:", err);
      setToastMessage("Failed: " + err.message);
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleLogTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePgId || !txItemId || !txQty) return;
    setIsSubmittingTx(true);
    try {
      const qtyNum = Number(txQty);

      // Verify stock level before reducing
      if (txType === "out") {
        const item = inventory.find(i => String(i.id) === txItemId);
        if (item && item.quantity < qtyNum) {
          alert(`Insufficient stock! Current quantity is ${item.quantity}.`);
          setIsSubmittingTx(false);
          return;
        }
      }

      const { error } = await supabase.from("inventory_transactions").insert({
        pg_id: Number(activePgId),
        item_id: Number(txItemId),
        transaction_type: txType,
        quantity: qtyNum,
        notes: txNotes.trim() || null
      });

      if (error) throw error;

      setToastMessage("Transaction logged and stock updated!");
      setTxItemId("");
      setTxQty("");
      setTxNotes("");
      setIsLoggingTx(false);
      await fetchData();
    } catch (err: any) {
      console.error("Error logging transaction:", err);
      setToastMessage("Failed: " + err.message);
    } finally {
      setIsSubmittingTx(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-28 bg-slate-50 relative overflow-hidden">
      {/* Toast Notification */}
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
            <Package className="size-6 text-emerald-300" />
            Asset & Inventory
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 mt-6 flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {/* Actions Card */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <button
            onClick={() => setIsAddingItem(true)}
            className="bg-white rounded-2xl p-4 border border-slate-200/40 shadow-3xs flex flex-col items-center gap-2 text-slate-700 cursor-pointer hover:bg-slate-50"
          >
            <PlusCircle className="w-6 h-6 text-emerald-600" />
            <span className="text-xs font-bold">Add Item</span>
          </button>
          <button
            onClick={() => {
              if (inventory.length === 0) {
                alert("Please add some inventory items first.");
                return;
              }
              setIsLoggingTx(true);
            }}
            className="bg-white rounded-2xl p-4 border border-slate-200/40 shadow-3xs flex flex-col items-center gap-2 text-slate-700 cursor-pointer hover:bg-slate-50"
          >
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-bold">Update Stock</span>
          </button>
        </div>

        {/* Inventory Items list */}
        <div className="flex justify-between items-center select-none mt-2 shrink-0">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Asset Catalog</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {inventory.length} Categories
          </span>
        </div>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">Inventory Empty</h4>
              <p className="text-[10.5px] font-semibold text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Add hostelry utilities (blankets, water cans, remote controls, lightbulbs) to manage stock.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {inventory.map((item) => {
              const dateObj = item.updated_at ? new Date(item.updated_at) : new Date();
              const dateStr = dateObj.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short"
              });

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/30 shadow-3xs flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-850 truncate">{item.item_name}</span>
                    <span className="text-[9.5px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-350" />
                      Updated: {dateStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl border ${
                      item.quantity <= 2
                        ? "bg-rose-50 border-rose-100 text-rose-600"
                        : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    }`}>
                      {item.quantity} Qty
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Transactions log list */}
        {transactions.length > 0 && (
          <>
            <div className="flex justify-between items-center select-none mt-4 shrink-0">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Stock Logs</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recent Logs</span>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              {transactions.map((tx) => {
                const isCheckIn = tx.transaction_type === "in";
                const dateStr = tx.created_at
                  ? new Date(tx.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit"
                    })
                  : "";

                return (
                  <div
                    key={tx.id}
                    className="bg-white/80 rounded-xl p-3 border border-slate-200/20 shadow-3xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCheckIn ? (
                        <ArrowDownCircle className="w-5 h-5 text-emerald-650 shrink-0" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-rose-650 shrink-0" />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 truncate">
                          {tx.inventory?.item_name || "Unknown Item"}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 mt-0.5 truncate">
                          {tx.notes || (isCheckIn ? "Refilled stock" : "Discharged / Used")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`font-black ${isCheckIn ? "text-emerald-700" : "text-rose-705"}`}>
                        {isCheckIn ? "+" : "-"}{tx.quantity}
                      </span>
                      <span className="text-[8.5px] font-bold text-slate-400 mt-0.5">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAddingItem && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingItem(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-lg text-slate-800">Add Inventory Item</h3>
                <button
                  onClick={() => setIsAddingItem(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="itemName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item Name
                  </label>
                  <input
                    id="itemName"
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Remote Controls, Water Bottles"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="initialQty" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Initial Stock Count
                  </label>
                  <input
                    id="initialQty"
                    type="number"
                    min="0"
                    value={initialQty}
                    onChange={(e) => setInitialQty(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingItem}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors mt-2 text-sm tracking-wide"
                >
                  {isSubmittingItem ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    "Create Asset Item"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Transaction Modal */}
      <AnimatePresence>
        {isLoggingTx && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoggingTx(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-lg text-slate-800">Update Stock Levels</h3>
                <button
                  onClick={() => setIsLoggingTx(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleLogTransactionSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="txItem" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Inventory Item
                  </label>
                  <select
                    id="txItem"
                    value={txItemId}
                    onChange={(e) => setTxItemId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                  >
                    <option value="">Choose item...</option>
                    {inventory.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.item_name} ({i.quantity} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="txType" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Stock Action
                    </label>
                    <select
                      id="txType"
                      value={txType}
                      onChange={(e) => setTxType(e.target.value as "in" | "out")}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                      required
                    >
                      <option value="in">Refill (+) </option>
                      <option value="out">Discharge (-)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="txQty" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Quantity
                    </label>
                    <input
                      id="txQty"
                      type="number"
                      min="1"
                      value={txQty}
                      onChange={(e) => setTxQty(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="txNotes" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Notes / Reference
                  </label>
                  <input
                    id="txNotes"
                    type="text"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    placeholder="e.g. Bought from market / Given to Room 5"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingTx}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors mt-2 text-sm tracking-wide"
                >
                  {isSubmittingTx ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    "Save Stock Update"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
