"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  IndianRupee,
  Briefcase,
  AlertCircle,
  Menu,
  Building2,
  QrCode,
  Bell,
  ChevronDown,
  CheckCircle,
  X,
  FileText
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ExpensesViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
  activePgId: string | undefined;
}

const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Water",
  "Maintenance",
  "Food/Kitchen",
  "Salaries",
  "Internet/Wi-Fi",
  "Others"
];

export function ExpensesView({
  onBack,
  propertyName,
  onOpenPropertySelector,
  onMenuClick,
  onNavigateToNotifications,
  activePgId,
}: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchExpenses = async () => {
    if (!activePgId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("pg_id", Number(activePgId))
        .order("date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      console.error("Error fetching expenses:", err);
      setToastMessage("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activePgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePgId || !title.trim() || !amount) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("expenses").insert({
        pg_id: Number(activePgId),
        title: title.trim(),
        amount: Number(amount),
        category,
        date
      });

      if (error) throw error;

      setToastMessage("Expense logged successfully!");
      setTitle("");
      setAmount("");
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().split("T")[0]);
      setIsAdding(false);
      await fetchExpenses();
    } catch (err: any) {
      console.error("Error logging expense:", err);
      setToastMessage("Failed to log expense: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense log?")) return;
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setToastMessage("Expense log deleted.");
      await fetchExpenses();
    } catch (err: any) {
      console.error("Error deleting expense:", err);
      setToastMessage("Delete failed: " + err.message);
    }
  };

  const totalExpenseSum = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

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
            <TrendingDown className="size-6 text-rose-300" />
            Business Expenses
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 mt-6 flex-1 flex flex-col gap-4">
        {/* Summary Card */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-200/40 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Expenses Logged</span>
            <span className="text-2xl font-black text-slate-800 mt-1 flex items-center gap-0.5">
              <IndianRupee className="w-5 h-5 text-slate-600 shrink-0" />
              {totalExpenseSum.toLocaleString("en-IN")}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-emerald-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Log Expense
          </motion.button>
        </div>

        {/* Expenses List */}
        <div className="flex justify-between items-center select-none mt-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Expense Statements</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {expenses.length} Records
          </span>
        </div>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">No Expenses Logged</h4>
              <p className="text-[10.5px] font-semibold text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Log business overheads, water charges, staff salaries, etc., here.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {expenses.map((item) => {
              const dateStr = item.date
                ? new Date(item.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })
                : "N/A";

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/30 shadow-3xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-850 truncate">{item.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5 leading-none shrink-0">
                          {item.category}
                        </span>
                        <span className="text-[9.5px] font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-300" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-slate-800 flex items-center">
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(item.id)}
                      className="p-2 bg-slate-50 border border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100/50 rounded-xl text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Expense Drawer */}
      <AnimatePresence>
        {isAdding && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-lg text-slate-800">Log New Expense</h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Expense Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Electricity Bill - May"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="amount" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Amount (₹)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 4500"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="date" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors mt-2 text-sm tracking-wide"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    "Save Expense Log"
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
