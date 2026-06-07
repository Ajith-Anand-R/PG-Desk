"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Menu, 
  Building, 
  ChevronDown, 
  Bell, 
  Coins, 
  UserCheck, 
  UserMinus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Trash2,
  BellRing
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "payment" | "tenant" | "system" | "support";
  title: string;
  description: string;
  time: string;
  dateGroup: "Today" | "Yesterday" | "Earlier";
  isUnread: boolean;
}

interface NotificationsViewProps {
  onBack: () => void;
  onMenuClick: () => void;
}

export function NotificationsView({
  onBack,
  onMenuClick,
}: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      type: "payment",
      title: "Rent Payment Received",
      description: "Aarav Nair (Room 1) paid rent of ₹7,000 for June.",
      time: "10:30 AM",
      dateGroup: "Today",
      isUnread: true
    },
    {
      id: "n2",
      type: "tenant",
      title: "New Tenant Checked In",
      description: "Vihaan Joshi assigned to Room 7 (Floor 2).",
      time: "09:15 AM",
      dateGroup: "Today",
      isUnread: true
    },
    {
      id: "n3",
      type: "system",
      title: "Subscription Renewal Notice",
      description: "Your Yearly Platinum Plan will renew in 15 days.",
      time: "Yesterday, 06:45 PM",
      dateGroup: "Yesterday",
      isUnread: true
    },
    {
      id: "n4",
      type: "support",
      title: "Support Ticket Resolved",
      description: "Complaint regarding Room 3 geyser has been resolved.",
      time: "Yesterday, 02:30 PM",
      dateGroup: "Yesterday",
      isUnread: false
    },
    {
      id: "n5",
      type: "tenant",
      title: "Tenant Checkout Scheduled",
      description: "Rahul Sharma (Room 5) scheduled checkout for Jun 15.",
      time: "Jun 3, 11:00 AM",
      dateGroup: "Earlier",
      isUnread: false
    },
    {
      id: "n6",
      type: "payment",
      title: "Late Fee Warning Sent",
      description: "System sent automated payment reminders to 3 tenants.",
      time: "Jun 1, 09:00 AM",
      dateGroup: "Earlier",
      isUnread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getIconForType = (type: NotificationItem["type"]) => {
    switch (type) {
      case "payment":
        return {
          icon: Coins,
          colors: "bg-emerald-50 border-emerald-100 text-emerald-600"
        };
      case "tenant":
        return {
          icon: UserCheck,
          colors: "bg-cyan-50 border-cyan-100 text-cyan-600"
        };
      case "system":
        return {
          icon: AlertCircle,
          colors: "bg-teal-50 border-teal-100 text-teal-600"
        };
      case "support":
        return {
          icon: Clock,
          colors: "bg-amber-50 border-amber-100 text-amber-500"
        };
    }
  };

  // Group notifications dynamically
  const groups: { [key in "Today" | "Yesterday" | "Earlier"]: NotificationItem[] } = {
    Today: notifications.filter(n => n.dateGroup === "Today"),
    Yesterday: notifications.filter(n => n.dateGroup === "Yesterday"),
    Earlier: notifications.filter(n => n.dateGroup === "Earlier"),
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-8 bg-slate-50 select-none">
      {/* Top Header Navigation */}
      <div className="bg-teal-700 text-white pt-5 pb-6 px-5 rounded-b-[2rem] shadow-md relative overflow-hidden flex flex-col gap-4">
        {/* Background glowing decorations */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

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
              <Bell className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-teal-700 border-2 border-white" />
              )}
            </div>
          </div>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between z-10 select-none">
          <div className="flex items-center gap-3.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-100 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </motion.button>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Notifications</h1>
              <p className="text-xs font-semibold text-white/80 mt-1.5 leading-none">
                {unreadCount > 0 ? `${unreadCount} unread updates` : "All caught up"}
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-[10px] font-black uppercase tracking-wider bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
            >
              Mark read
            </button>
          )}
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-5 relative flex-1">
        
        {/* Render List or Empty State */}
        <AnimatePresence mode="wait">
          {notifications.length === 0 ? (
            /* Illustrated Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-[2rem] p-10 border border-slate-200/40 shadow-xs flex flex-col items-center justify-center text-center gap-4 py-16 mt-8"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 relative mb-2">
                <BellRing className="w-10 h-10 animate-bounce" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/10 animate-ping" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <h3 className="font-extrabold text-slate-800 text-lg">No Notifications</h3>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                  You are all caught up! New alerts and receipts will display here.
                </p>
              </div>
            </motion.div>
          ) : (
            /* Notification list column */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5 mt-8"
            >
              {/* Toolbar Actions */}
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Alert feed</span>
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-black text-rose-500 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Notification Groups */}
              {Object.keys(groups).map((groupKey) => {
                const groupItems = groups[groupKey as keyof typeof groups];
                if (groupItems.length === 0) return null;

                return (
                  <div key={groupKey} className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                      {groupKey}
                    </span>
                    
                    <div className="bg-white rounded-[2rem] border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] overflow-hidden flex flex-col">
                      {groupItems.map((item, idx) => {
                        const styleInfo = getIconForType(item.type);
                        const Icon = styleInfo.icon;
                        
                        return (
                          <motion.div
                            key={item.id}
                            layoutId={item.id}
                            onClick={() => handleMarkAsRead(item.id)}
                            className={`p-4.5 flex items-start gap-4 transition-colors cursor-pointer relative ${
                              item.isUnread 
                                ? "bg-emerald-50/15 hover:bg-emerald-50/25" 
                                : "hover:bg-slate-50"
                            } ${
                              idx !== groupItems.length - 1 ? "border-b border-slate-100" : ""
                            }`}
                          >
                            {/* Unread side glow dot */}
                            {item.isUnread && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                            )}

                            {/* Category Icon pill */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${styleInfo.colors}`}>
                              <Icon className="w-5 h-5 stroke-[2.2px]" />
                            </div>

                            {/* Text details */}
                            <div className="flex-1 flex flex-col min-w-0 gap-1 mt-0.5">
                              <div className="flex justify-between items-start gap-2 select-none">
                                <span className={`text-xs truncate leading-none ${
                                  item.isUnread ? "font-black text-slate-800" : "font-bold text-slate-650"
                                }`}>
                                  {item.title}
                                </span>
                                <span className="text-[9.5px] font-bold text-slate-400 shrink-0 mt-0.5">
                                  {item.time}
                                </span>
                              </div>
                              <p className={`text-[10.5px] leading-relaxed break-words ${
                                item.isUnread ? "font-bold text-slate-600" : "font-medium text-slate-400/90"
                              }`}>
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer branding */}
        <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-8">
          <p className="text-[10px] font-bold text-slate-400">
            Powered by <span className="text-amber-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
          </p>
          <p className="text-[9px] font-bold text-slate-400">
            &copy; 2026 All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
