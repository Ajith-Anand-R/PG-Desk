"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Calendar, Clock, BellRing } from "lucide-react";

interface ReminderItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface RemindersViewProps {
  onBack: () => void;
}

export function RemindersView({ onBack }: RemindersViewProps) {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !description.trim()) return;

    const newReminder: ReminderItem = {
      id: `rem_${Date.now()}`,
      title: title.trim(),
      date,
      description: description.trim(),
    };

    setReminders((prev) => [newReminder, ...prev]);
    setTitle("");
    setDate("");
    setDescription("");
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

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
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none flex items-center gap-2">
              Reminders <span className="text-lg">🕒</span>
            </h1>
            <p className="text-xs font-semibold text-white/80 mt-1.5 leading-none">
              {reminders.length > 0 ? `${reminders.length} scheduled reminders` : "Never forget a task"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-6 relative flex-1">
        {/* Add Reminder Card */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200/40 shadow-xs flex flex-col gap-4">
          <h3 className="font-extrabold text-slate-800 text-base mb-1">Add New Reminder</h3>
          
          <form onSubmit={handleAddReminder} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reminderTitle" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="reminderTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reminderDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Select Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="reminderDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reminderDesc" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="reminderDesc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold resize-none"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs tracking-wider uppercase mt-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Reminder</span>
            </motion.button>
          </form>
        </div>

        {/* Reminders List Section */}
        <div className="flex flex-col gap-3">
          <h3 className="font-extrabold text-slate-800 text-base px-1">Upcoming Reminders</h3>

          <AnimatePresence mode="popLayout">
            {reminders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2rem] p-8 border border-slate-200/40 shadow-xs flex flex-col items-center justify-center text-center gap-3 py-12"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 relative mb-1">
                  <BellRing className="w-6 h-6 text-emerald-600/70" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-sm">No reminders.</h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 mt-1">
                    Your scheduled reminders will be listed here.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                {reminders.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex items-start gap-4 relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                    
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-black text-slate-800 truncate leading-none mt-1">
                          {item.title}
                        </span>
                        <span className="text-[9.5px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.date}</span>
                        </span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed font-bold text-slate-500 break-words pr-2">
                        {item.description}
                      </p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteReminder(item.id)}
                      className="p-2 border border-slate-100 hover:border-rose-100 rounded-xl bg-slate-50/50 hover:bg-rose-50 text-slate-450 hover:text-rose-550 transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
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
