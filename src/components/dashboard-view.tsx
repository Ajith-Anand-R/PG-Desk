import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  PhoneCall,
  Bell,
  ChevronDown,
  Building2,
  UserPlus,
  Home,
  FileText,
  Users,
  UserCheck,
  UserMinus,
  Coins,
  Clock,
  ArrowUpRight,
  TrendingUp,
  X,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Bed, Wrench, CalendarDays, ReceiptText, TrendingDown } from "lucide-react";

interface DashboardViewProps {
  onOpenPropertySelector: () => void;
  onNavigateToRooms: () => void;
  onNavigateToSupport: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToBills: () => void;
  onNavigateToReminders: () => void;
  onNavigateToStaff: () => void;
  onNavigateToReceipts: (tab: "dues" | "receipts") => void;
  onNavigateToVacantBeds: () => void;
  onNavigateToVisitors: () => void;
  onNavigateToPastTenants: () => void;
  onNavigateToDepositNotice: () => void;
  pendingDuesAmount: number;
  pendingDuesCount: number;
  currentProperty: string;
  roomsCount: number;
  availableBeds: number;
  occupiedBeds: number;
  activeTenants: number;
  leftTenants: number;
  collectedAmount: number;
  onAddTenantClick: () => void;
  onAddRoomClick: () => void;
  onMenuClick: () => void;
  payments: any[];
  expenses?: any[];
  hasUnreadNotifications?: boolean;
  noticeTenantsCount?: number;
  prebookCount?: number;
}

export function DashboardView({
  onOpenPropertySelector,
  onNavigateToRooms,
  onNavigateToSupport,
  onNavigateToNotifications,
  onNavigateToBills,
  onNavigateToReminders,
  onNavigateToStaff,
  onNavigateToReceipts,
  onNavigateToVacantBeds,
  onNavigateToVisitors,
  onNavigateToPastTenants,
  onNavigateToDepositNotice,
  pendingDuesAmount,
  pendingDuesCount,
  currentProperty,
  roomsCount,
  availableBeds,
  occupiedBeds,
  activeTenants,
  leftTenants,
  collectedAmount,
  onAddTenantClick,
  onAddRoomClick,
  onMenuClick,
  payments = [],
  expenses = [],
  hasUnreadNotifications = false,
  noticeTenantsCount = 0,
  prebookCount = 0,
}: DashboardViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Get last 6 months dynamically based on local time
  const last6Months = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const shortName = d.toLocaleString("en-US", { month: "short" });
      const fullName = d.toLocaleString("en-US", { month: "long" });
      const year = d.getFullYear();
      list.push({
        short: shortName,
        full: `${fullName} ${year}`,
        key: `${fullName} ${year}`,
      });
    }
    return list;
  }, []);

  const monthDetails = React.useMemo(() => {
    const getMonthKey = (dateStr: string | null | undefined): string | null => {
      if (!dateStr) return null;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        const fullName = d.toLocaleString("en-US", { month: "long" });
        const year = d.getFullYear();
        return `${fullName} ${year}`;
      } catch {
        return null;
      }
    };

    const details: Record<string, {
      title: string;
      paymentsCount: number;
      totalRevenue: number;
      rentCollected: number;
      rentPending: number;
      depositCollected: number;
      salaries: number;
      repairs: number;
      billing: number;
      otherExpenses: number;
      totalExpenses: number;
      profit: number;
      payments: {
        tenantName: string;
        room: string;
        date: string;
        txn: string;
        amount: number;
      }[];
      expensesList: any[];
    }> = {};

    last6Months.forEach(m => {
      details[m.short] = {
        title: m.full,
        paymentsCount: 0,
        totalRevenue: 0,
        rentCollected: 0,
        rentPending: 0,
        depositCollected: 0,
        salaries: 0,
        repairs: 0,
        billing: 0,
        otherExpenses: 0,
        totalExpenses: 0,
        profit: 0,
        payments: [],
        expensesList: []
      };
    });

    if (payments && Array.isArray(payments)) {
      payments.forEach(p => {
        const amount = Number(p.amount || 0);
        
        if (p.month === "Security Deposit") {
          const paymentMonthKey = getMonthKey(p.payment_date || p.due_date || p.created_at);
          const matchedMonth = last6Months.find(m => m.key === paymentMonthKey);
          if (matchedMonth) {
            const shortName = matchedMonth.short;
            if (p.status === "paid") {
              details[shortName].depositCollected += amount;
              details[shortName].totalRevenue += amount;
            }
          }
        } else {
          const matchedMonth = last6Months.find(m => m.key === p.month);
          if (matchedMonth) {
            const shortName = matchedMonth.short;
            const tenantName = p.tenants?.users?.name || p.tenants?.name || "Unknown Tenant";
            const room = p.tenants?.rooms?.room_number ? `Room ${p.tenants.rooms.room_number}` : "Unassigned";
            const date = p.payment_date 
              ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "N/A";
            const txn = p.reference_code ? `Txn: ${p.reference_code}` : "UPI Payment";

            if (p.status === "paid") {
              details[shortName].paymentsCount += 1;
              details[shortName].rentCollected += amount;
              details[shortName].totalRevenue += amount;
              details[shortName].payments.push({
                tenantName,
                room,
                date,
                txn,
                amount
              });
            } else {
              details[shortName].rentPending += amount;
            }
          }
        }
      });
    }

    if (expenses && Array.isArray(expenses)) {
      expenses.forEach(item => {
        const amount = Number(item.amount || 0);
        const expenseMonthKey = getMonthKey(item.date);
        const matchedMonth = last6Months.find(m => m.key === expenseMonthKey);
        
        if (matchedMonth) {
          const shortName = matchedMonth.short;
          
          if (item.category === "Salaries") {
            details[shortName].salaries += amount;
          } else if (item.category === "Maintenance") {
            details[shortName].repairs += amount;
          } else if (["Electricity", "Water", "Internet/Wi-Fi"].includes(item.category)) {
            details[shortName].billing += amount;
          } else {
            details[shortName].otherExpenses += amount;
          }
          details[shortName].totalExpenses += amount;
          details[shortName].expensesList.push(item);
        }
      });
    }

    // Compute Net Profit
    last6Months.forEach(m => {
      const shortName = m.short;
      const d = details[shortName];
      d.profit = (d.rentCollected + d.depositCollected) - d.totalExpenses;
    });

    return details;
  }, [payments, expenses, last6Months]);

  const selectedMonthData = React.useMemo(() => {
    if (!selectedMonth) return null;
    return monthDetails[selectedMonth] || {
      title: `${selectedMonth} 2026`,
      paymentsCount: 0,
      rentCollected: 0,
      rentPending: 0,
      depositCollected: 0,
      salaries: 0,
      repairs: 0,
      billing: 0,
      otherExpenses: 0,
      totalExpenses: 0,
      profit: 0,
      payments: [],
      expensesList: []
    };
  }, [selectedMonth, monthDetails]);

  const maxRevenue = React.useMemo(() => {
    const revenues = Object.values(monthDetails).map(d => d.totalRevenue);
    return Math.max(...revenues, 1000);
  }, [monthDetails]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
  } as const;

  const quickActions = [
    { label: "Add Tenant", icon: UserPlus, color: "bg-emerald-50/50 text-emerald-600 border-emerald-100/70 hover:bg-emerald-100/60", onClick: onAddTenantClick },
    { label: "Add Room", icon: Home, color: "bg-teal-50/50 text-teal-600 border-teal-100/70 hover:bg-teal-100/60", onClick: onAddRoomClick },
    { label: "Bills", icon: FileText, color: "bg-amber-50/50 text-amber-600 border-amber-100/70 hover:bg-amber-100/60", onClick: onNavigateToBills },
    { label: "Remind", icon: Bell, color: "bg-rose-50/50 text-rose-600 border-rose-100/70 hover:bg-rose-100/60", onClick: onNavigateToReminders },
    { label: "Gate Logs", icon: UserCheck, color: "bg-indigo-50/50 text-indigo-650 border-indigo-100/70 hover:bg-indigo-100/60", onClick: onNavigateToVisitors },
    { label: "Staff", icon: Users, color: "bg-sky-50/50 text-sky-600 border-sky-100/70 hover:bg-sky-100/60", onClick: onNavigateToStaff },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 pb-28"
    >
      {/* Top Banner (emerald/teal Gradient Header) */}
      <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 text-white rounded-b-[2rem] px-5 pt-6 pb-8 shadow-md relative overflow-hidden">
        {/* Decorative subtle background circle */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-500/35 blur-xl pointer-events-none" />

        {/* Top bar icons */}
        <div className="flex items-center justify-between mb-6 z-10 relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuClick}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10"
          >
            <Menu className="w-5 h-5 text-white" />
          </motion.button>

          {/* Property Selector */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenPropertySelector}
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-slate-800 shadow-sm border border-slate-100 text-sm font-semibold max-w-[200px]"
          >
            <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{currentProperty}</span>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onNavigateToSupport}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10"
            >
              <PhoneCall className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onNavigateToNotifications}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 relative"
            >
              <Bell className="w-5 h-5 text-white" />
              {hasUnreadNotifications && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-800" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Welcome Text and Badge */}
        <div className="flex items-center justify-between mb-2 z-10 relative">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Welcome</p>
            <h1 className="text-3xl font-bold tracking-tight mt-0.5">{currentProperty}</h1>
          </div>
          {/* Total Rooms circular badge button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onNavigateToRooms}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center text-center select-none shadow-inner shrink-0 cursor-pointer hover:bg-white/15 transition-colors"
          >
            <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold leading-none">Total Rooms</span>
            <span className="text-2xl font-bold font-mono tracking-tight mt-0.5">{roomsCount}</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 flex flex-col gap-6 -mt-10 z-20 relative">
        {/* Beds Overview Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 cursor-pointer" onClick={onNavigateToRooms}>
            <Bed className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700">Beds Overview</h3>
          </div>

          <div className="grid grid-cols-4 divide-x divide-slate-100 text-center">
            {/* Available */}
            <button
              onClick={onNavigateToVacantBeds}
              className="flex flex-col items-center justify-center px-1 hover:bg-slate-50 rounded-xl transition-all cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-1 border border-emerald-100/50">
                <Bed className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-bold text-emerald-600 font-mono tracking-tight">{availableBeds}</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Available</span>
            </button>

            {/* Occupied */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-1">
                <Bed className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-bold text-emerald-500 font-mono tracking-tight">{occupiedBeds}</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Occupied</span>
            </div>

            {/* Notice */}
            <button
              onClick={onNavigateToDepositNotice}
              className="flex flex-col items-center justify-center px-1 hover:bg-slate-50 rounded-xl transition-all cursor-pointer select-none focus:outline-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-1 border border-amber-100/50">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-bold text-amber-500 font-mono tracking-tight">{noticeTenantsCount}</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Notice</span>
            </button>

            {/* Prebook */}
            <div className="flex flex-col items-center justify-center px-1">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-1">
                <CalendarDays className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-bold text-blue-500 font-mono tracking-tight">{prebookCount}</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Prebook</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Management Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3.5">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 px-0.5 select-none">
            <span>⚡</span> Quick Management
          </h3>

          <div className="flex justify-between items-start gap-1 px-1.5 py-0.5 select-none w-full">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-2 cursor-pointer w-14 min-w-0"
                >
                  <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border shadow-xs transition-all ${action.color}`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-700 tracking-tight leading-tight text-center break-words w-full select-none">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Statistics Section (2x2 Grid) */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 px-0.5">
            <span>📊</span> Statistics
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Active Tenants */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100/80 p-4 flex items-center justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              <div>
                <span className="text-xl font-bold text-slate-800 font-mono tracking-tight">{activeTenants}</span>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Active Tenants</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Left Tenants */}
            <div 
              onClick={onNavigateToPastTenants}
              className="bg-white rounded-2xl shadow-xs border border-slate-100/80 p-4 flex items-center justify-between relative overflow-hidden group hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400" />
              <div>
                <span className="text-xl font-bold text-slate-800 font-mono tracking-tight">{leftTenants}</span>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Left Tenants</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                <UserMinus className="w-5 h-5" />
              </div>
            </div>

            {/* Collected Amount */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100/80 p-4 flex items-center justify-between relative overflow-hidden group hover:shadow-sm transition-shadow">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              <div>
                <span className="text-base font-bold text-slate-800 font-mono tracking-tight">
                  ₹ {collectedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Collected</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            {/* Pending Dues */}
            <div 
              onClick={() => onNavigateToReceipts("dues")}
              className="bg-white rounded-2xl shadow-xs border border-slate-100/80 p-4 flex items-center justify-between relative overflow-hidden group hover:shadow-sm transition-shadow cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div>
                <span className="text-base font-bold text-slate-800 font-mono tracking-tight">
                  ₹ {pendingDuesAmount.toLocaleString("en-IN")}
                </span>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Pending Dues</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Finance Hub */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 px-0.5">
            <span>💸</span> Finance Hub
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Dues Report */}
            <div 
              onClick={() => onNavigateToReceipts("dues")}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between relative shadow-xs group cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-400" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 tracking-tight">Dues Report</h4>
                  <p className="text-lg font-bold text-slate-800 mt-1 font-mono">
                    ₹ {pendingDuesAmount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{pendingDuesCount} tenants</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="flex justify-end mt-2">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Receipts */}
            <div 
              onClick={() => onNavigateToReceipts("receipts")}
              className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between relative shadow-xs group cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 tracking-tight">Receipts</h4>
                  <p className="text-lg font-bold text-emerald-600 mt-1">History</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">View payments</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="flex justify-end mt-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <ReceiptText className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analytics Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 px-0.5">
            <span>📈</span> Analytics
          </h3>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Revenue Overview</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Last 6 months</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>₹{(collectedAmount / 1000).toFixed(1)}K</span>
              </div>
            </div>

            {/* SVG Animated Bar Chart */}
            <div className="h-44 flex items-end justify-between px-2 pt-2 relative">
              <div className="absolute inset-x-0 top-0 h-px border-t border-slate-100" />
              <div className="absolute inset-x-0 top-1/3 h-px border-t border-slate-100/60" />
              <div className="absolute inset-x-0 top-2/3 h-px border-t border-slate-100/60" />

              {last6Months.map((mInfo, idx) => {
                const month = mInfo.short;
                const details = monthDetails[month] || { totalRevenue: 0 };
                const revenue = details.totalRevenue;
                const hasData = revenue > 0;
                const labelColor = hasData ? "text-emerald-600 font-bold" : "text-slate-400 font-semibold";
                const isMax = revenue > 0 && revenue === maxRevenue;
                
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMonth(month)}
                    className="flex flex-col items-center gap-2 w-10 z-10 cursor-pointer focus:outline-hidden"
                  >
                    <div className="relative w-full flex justify-center">
                      {revenue > 0 && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          className={`absolute -top-7 ${isMax ? "bg-emerald-600" : "bg-emerald-500"} text-white text-[9px] font-bold py-0.5 px-1.5 rounded-sm font-mono shadow-xs shrink-0 whitespace-nowrap`}
                        >
                          {revenue >= 1000 ? `${(revenue / 1000).toFixed(1)}K` : `₹${revenue}`}
                        </motion.span>
                      )}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: revenue > 0 ? 20 + (revenue / maxRevenue) * 108 : 20 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.05 }}
                        className={`w-7 rounded-lg relative flex items-end justify-center transition-all ${
                          isMax
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-xs shadow-emerald-250/20"
                            : revenue > 0
                              ? "bg-emerald-500/70 border border-emerald-200/20"
                              : "bg-emerald-100/40 hover:bg-emerald-100/60 border border-emerald-50/10"
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] select-none uppercase tracking-wider ${labelColor}`}>
                      {month}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Month Details Bottom Sheet */}
      <AnimatePresence>
        {selectedMonth && selectedMonthData && (
          <div className="absolute inset-0 z-50 flex items-end justify-center select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMonth(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative z-10 bg-white w-full max-w-md rounded-t-[2.2rem] p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[82vh] overflow-hidden"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none shrink-0">
                <div className="flex flex-col">
                  <h3 className="font-black text-slate-850 text-base leading-none">
                    {selectedMonthData.title} Financial Dashboard
                  </h3>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1.5 leading-none">
                    Monthly Cashflow Overview
                  </span>
                </div>
                
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-455 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet Content Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-5 pb-6">
                {/* 1. Net Profit Card */}
                {(() => {
                  const profitVal = selectedMonthData.profit;
                  const isPositive = profitVal >= 0;
                  return (
                    <div className={`rounded-3xl p-5 text-white flex flex-col gap-1 relative overflow-hidden shadow-md ${
                      isPositive 
                        ? "bg-gradient-to-br from-emerald-600 to-emerald-800" 
                        : "bg-gradient-to-br from-rose-600 to-rose-800"
                    }`}>
                      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                        {isPositive ? <TrendingUp className="w-28 h-28" /> : <TrendingDown className="w-28 h-28" />}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/70 leading-none">
                        Net Monthly Profit
                      </span>
                      <div className="flex items-baseline justify-between mt-2.5">
                        <span className="text-2xl font-black font-mono tracking-tight leading-none">
                          ₹{profitVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 leading-none">
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? "SURPLUS" : "DEFICIT"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Key Inflow/Outflow Grid */}
                {(() => {
                  const rent = selectedMonthData.rentCollected;
                  const deposit = selectedMonthData.depositCollected;
                  const expensesSum = selectedMonthData.totalExpenses;
                  const totalInflow = rent + deposit;
                  const expenseRatio = totalInflow > 0 ? Math.min(100, Math.round((expensesSum / totalInflow) * 100)) : 100;
                  return (
                    <div className="flex flex-col gap-4">
                      {/* Grid */}
                      <div className="grid grid-cols-2 gap-3.5 shrink-0">
                        <div className="bg-emerald-50/40 border border-emerald-100/40 rounded-2xl p-4 flex flex-col gap-1">
                          <span className="text-[9.5px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                            Total Inflow
                          </span>
                          <span className="text-base font-black text-emerald-700 font-mono mt-1.5 leading-none">
                            ₹{totalInflow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="bg-rose-50/40 border border-rose-100/40 rounded-2xl p-4 flex flex-col gap-1">
                          <span className="text-[9.5px] font-black text-rose-600 uppercase tracking-widest leading-none">
                            Total Outflow
                          </span>
                          <span className="text-base font-black text-rose-700 font-mono mt-1.5 leading-none">
                            ₹{expensesSum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar ratio */}
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col gap-2 shrink-0">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-slate-400">
                          <span>Expenses to Income Ratio</span>
                          <span className="font-extrabold">{expenseRatio}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              expenseRatio > 85 ? "bg-rose-500" : expenseRatio > 50 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${expenseRatio}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Detailed breakdown group */}
                <div className="flex flex-col gap-3.5 shrink-0">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-0.5">
                    Inflow Breakdown
                  </h4>
                  <div className="flex flex-col gap-2 bg-slate-50/40 border border-slate-200/20 rounded-2xl p-2.5">
                    {/* Rent Collected */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Coins className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Rent Collected</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 font-mono">
                        ₹{selectedMonthData.rentCollected.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Deposit Available */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <ReceiptText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Security Deposit</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 font-mono">
                        ₹{selectedMonthData.depositCollected.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Pending Rent Dues */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Pending Dues</span>
                      </div>
                      <span className="text-xs font-black text-amber-600 font-mono">
                        ₹{selectedMonthData.rentPending.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Outflow category breakdown */}
                <div className="flex flex-col gap-3.5 shrink-0">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-0.5">
                    Outflow Breakdown
                  </h4>
                  <div className="flex flex-col gap-2 bg-slate-50/40 border border-slate-200/20 rounded-2xl p-2.5">
                    {/* Salaries */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Salaries</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 font-mono">
                        ₹{selectedMonthData.salaries.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Billing */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <Home className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Utility Billing</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 font-mono">
                        ₹{selectedMonthData.billing.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Repairs */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Repairs & Maintenance</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 font-mono">
                        ₹{selectedMonthData.repairs.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Others */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/20 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Food & Other Expenses</span>
                      </div>
                      <span className="text-xs font-black text-slate-800 font-mono">
                        ₹{selectedMonthData.otherExpenses.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
