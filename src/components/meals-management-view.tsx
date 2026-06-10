"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Coffee,
  Check,
  Save,
  Menu,
  Building2,
  QrCode,
  Bell,
  ChevronDown,
  Info,
  UtensilsCrossed,
  Edit2,
  Flame,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MealsManagementViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
  activePgId: string | undefined;
}

interface MenuItem {
  id?: number;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MealsManagementView({
  onBack,
  propertyName,
  onOpenPropertySelector,
  onMenuClick,
  onNavigateToNotifications,
  activePgId,
}: MealsManagementViewProps) {
  const [weeklyMenu, setWeeklyMenu] = useState<Record<string, MenuItem>>({});
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form Fields
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [breakfastTime, setBreakfastTime] = useState("08:00 AM - 10:00 AM");
  const [lunchTime, setLunchTime] = useState("01:00 PM - 03:00 PM");
  const [dinnerTime, setDinnerTime] = useState("08:00 PM - 10:00 PM");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [dietCounts, setDietCounts] = useState({
    breakfast: { veg: 0, nonVeg: 0, egg: 0 },
    lunch: { veg: 0, nonVeg: 0, egg: 0 },
    dinner: { veg: 0, nonVeg: 0, egg: 0 },
  });

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const getCurrentWeekDates = () => {
    const current = new Date();
    const week = [];
    const day = current.getDay();
    // Adjust so Monday is first day (1), Sunday is last (0 -> -6)
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay.toISOString().split('T')[0]);
    }
    return week;
  };

  const fetchMenuData = async () => {
    if (!activePgId) return;
    setIsLoading(true);
    try {
      const dates = getCurrentWeekDates();
      const { data, error } = await supabase
        .from("menu_days")
        .select("*, menu_items(*)")
        .eq("pg_id", Number(activePgId))
        .in("date", dates);

      if (error) throw error;

      const menuMap: Record<string, MenuItem> = {};
      DAYS_OF_WEEK.forEach((day, index) => {
        menuMap[day] = {
          day,
          breakfast: "Not Scheduled",
          lunch: "Not Scheduled",
          dinner: "Not Scheduled",
          breakfast_time: "08:00 AM - 10:00 AM",
          lunch_time: "01:00 PM - 03:00 PM",
          dinner_time: "08:00 PM - 10:00 PM"
        };
      });

      if (data) {
        data.forEach((dayRecord: any) => {
          // Determine the day of week of this date
          const dateObj = new Date(dayRecord.date);
          let dayIndex = dateObj.getDay() - 1; // 0 is Sunday, so -1
          if (dayIndex < 0) dayIndex = 6; // Sunday is index 6
          const dayName = DAYS_OF_WEEK[dayIndex];
          
          if (menuMap[dayName]) {
            menuMap[dayName].id = dayRecord.id;
            (dayRecord.menu_items || []).forEach((item: any) => {
              if (item.meal_type === 'breakfast') {
                menuMap[dayName].breakfast = item.item_name;
                if (item.serve_time) menuMap[dayName].breakfast_time = item.serve_time;
              } else if (item.meal_type === 'lunch') {
                menuMap[dayName].lunch = item.item_name;
                if (item.serve_time) menuMap[dayName].lunch_time = item.serve_time;
              } else if (item.meal_type === 'dinner') {
                menuMap[dayName].dinner = item.item_name;
                if (item.serve_time) menuMap[dayName].dinner_time = item.serve_time;
              }
            });
          }
        });
      }
      setWeeklyMenu(menuMap);
    } catch (err: any) {
      console.error("Error fetching menu:", err);
      setToastMessage("Error fetching menu: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDietStats = async () => {
    if (!activePgId) return;
    try {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          id,
          status,
          users (
            meal_dietary,
            meal_breakfast,
            meal_lunch,
            meal_dinner
          )
        `)
        .eq("pg_id", Number(activePgId))
        .eq("status", "active");

      if (error) throw error;

      const counts = {
        breakfast: { veg: 0, nonVeg: 0, egg: 0 },
        lunch: { veg: 0, nonVeg: 0, egg: 0 },
        dinner: { veg: 0, nonVeg: 0, egg: 0 }
      };

      if (data) {
        data.forEach((tenant: any) => {
          const rawUser = tenant.users;
          const user = Array.isArray(rawUser) ? rawUser[0] : rawUser;
          if (!user) return;

          const diet = (user.meal_dietary || "Veg").toLowerCase();
          let dietKey: "veg" | "nonVeg" | "egg" = "veg";
          if (diet === "non-veg" || diet === "nonveg") {
            dietKey = "nonVeg";
          } else if (diet === "egg") {
            dietKey = "egg";
          }

          if (user.meal_breakfast) counts.breakfast[dietKey]++;
          if (user.meal_lunch) counts.lunch[dietKey]++;
          if (user.meal_dinner) counts.dinner[dietKey]++;
        });
      }
      setDietCounts(counts);
    } catch (err) {
      console.error("Error fetching diet stats:", err);
    }
  };

  useEffect(() => {
    fetchMenuData();
    fetchDietStats();
  }, [activePgId]);

  // Update form fields when selected day or weeklyMenu changes
  useEffect(() => {
    const activeDayMenu = weeklyMenu[selectedDay];
    if (activeDayMenu) {
      setBreakfast(activeDayMenu.breakfast);
      setLunch(activeDayMenu.lunch);
      setDinner(activeDayMenu.dinner);
      setBreakfastTime(activeDayMenu.breakfast_time);
      setLunchTime(activeDayMenu.lunch_time);
      setDinnerTime(activeDayMenu.dinner_time);
    }
  }, [selectedDay, weeklyMenu]);

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePgId) return;
    setIsSaving(true);
    try {
      const dates = getCurrentWeekDates();
      const dayIndex = DAYS_OF_WEEK.indexOf(selectedDay);
      const dateStr = dates[dayIndex];

      let menuDayId;
      const currentDayMenu = weeklyMenu[selectedDay];
      
      if (currentDayMenu && currentDayMenu.id) {
        menuDayId = currentDayMenu.id;
      } else {
        const { data: existingDay } = await supabase
          .from("menu_days")
          .select("id")
          .eq("pg_id", Number(activePgId))
          .eq("date", dateStr)
          .maybeSingle();
          
        if (existingDay) {
          menuDayId = existingDay.id;
        } else {
          const { data: newDay, error: dayError } = await supabase
            .from("menu_days")
            .insert({
              pg_id: Number(activePgId),
              date: dateStr
            })
            .select("id")
            .single();
          if (dayError) throw dayError;
          menuDayId = newDay.id;
        }
      }

      // Delete existing menu_items for this day
      const { error: deleteError } = await supabase
        .from("menu_items")
        .delete()
        .eq("menu_day_id", menuDayId);
      if (deleteError) throw deleteError;

      // Insert new menu_items
      const itemsToInsert = [
        { menu_day_id: menuDayId, meal_type: "breakfast", item_name: breakfast.trim(), serve_time: breakfastTime.trim() },
        { menu_day_id: menuDayId, meal_type: "lunch", item_name: lunch.trim(), serve_time: lunchTime.trim() },
        { menu_day_id: menuDayId, meal_type: "dinner", item_name: dinner.trim(), serve_time: dinnerTime.trim() }
      ];

      const { error: insertError } = await supabase
        .from("menu_items")
        .insert(itemsToInsert);
      if (insertError) throw insertError;

      setToastMessage(`Saved menu for ${selectedDay}!`);
      setIsEditing(false);
      await fetchMenuData();
    } catch (err: any) {
      console.error("Error saving menu:", err);
      setToastMessage("Error saving menu: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const activeDayMenu = weeklyMenu[selectedDay];

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

          {/* Property Selector */}
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
            <Coffee className="size-6 text-amber-300" />
            Meals & Food Menu
          </h1>
        </div>
      </div>

      {/* Weekday selector tabs */}
      <div className="px-5 mt-6 shrink-0 overflow-x-auto no-scrollbar py-1">
        <div className="flex gap-2 min-w-max">
          {DAYS_OF_WEEK.map((day) => {
            const isActive = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setIsEditing(false);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "bg-white text-slate-500 hover:text-slate-700 border border-slate-200/50 shadow-3xs"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Detail Card */}
      <div className="px-5 mt-6 flex-1 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !isEditing ? (
          /* View Mode */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-grow flex flex-col gap-4"
          >
            <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-xs flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 uppercase tracking-wide">
                  <Calendar className="w-4.5 h-4.5 text-emerald-600" />
                  {selectedDay}day Menu Details
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/50 rounded-xl text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Menu
                </motion.button>
              </div>

              {/* Meals Rows */}
              <div className="flex flex-col gap-4">
                {/* Breakfast */}
                <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Breakfast</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activeDayMenu?.breakfast_time}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 mt-1.5">
                      {activeDayMenu?.breakfast}
                    </p>
                  </div>
                </div>

                {/* Lunch */}
                <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Lunch</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activeDayMenu?.lunch_time}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 mt-1.5">
                      {activeDayMenu?.lunch}
                    </p>
                  </div>
                </div>

                {/* Dinner */}
                <div className="flex gap-4 items-start bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Dinner</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activeDayMenu?.dinner_time}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 mt-1.5">
                      {activeDayMenu?.dinner}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kitchen Meal Preparation Counts Bento Panel */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/40 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                  Kitchen Prep Counts (Active Tenants)
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Breakfast Prep */}
                <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/80 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Breakfast</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Veg</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.breakfast.veg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Non-Veg</span>
                      <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.breakfast.nonVeg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Egg</span>
                      <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.breakfast.egg}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lunch Prep */}
                <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/80 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Lunch</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Veg</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.lunch.veg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Non-Veg</span>
                      <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.lunch.nonVeg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Egg</span>
                      <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.lunch.egg}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dinner Prep */}
                <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/80 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Flame className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Dinner</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Veg</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.dinner.veg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Non-Veg</span>
                      <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.dinner.nonVeg}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Egg</span>
                      <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                        {dietCounts.dinner.egg}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border border-slate-200/50 rounded-2xl p-4 flex gap-3">
              <Info className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-slate-500 leading-normal">
                This menu is broadcasted in real time to the PG Connect tenant app. Tenants will see updates automatically on their dashboard.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Edit Mode Form */
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSaveMenu}
            className="flex-grow flex flex-col gap-5 bg-white rounded-3xl p-5 border border-slate-200/40 shadow-xs"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wide">
                Edit Menu: {selectedDay}day
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            {/* Breakfast Edit Group */}
            <div className="flex flex-col gap-3.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" />
                Breakfast Service
              </span>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  placeholder="e.g. Masala Dosa, Chutney, Tea"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                  required
                />
                <input
                  type="text"
                  value={breakfastTime}
                  onChange={(e) => setBreakfastTime(e.target.value)}
                  placeholder="Time: e.g. 08:00 AM - 10:00 AM"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                  required
                />
              </div>
            </div>

            {/* Lunch Edit Group */}
            <div className="flex flex-col gap-3.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                Lunch Service
              </span>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  placeholder="e.g. Veg Pulao, Paneer Curry, Roti, Curd"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                  required
                />
                <input
                  type="text"
                  value={lunchTime}
                  onChange={(e) => setLunchTime(e.target.value)}
                  placeholder="Time: e.g. 01:00 PM - 03:00 PM"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                  required
                />
              </div>
            </div>

            {/* Dinner Edit Group */}
            <div className="flex flex-col gap-3.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/60">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-indigo-500" />
                Dinner Service
              </span>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  placeholder="e.g. Dal Makhani, Jeera Rice, Tandoori Roti"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                  required
                />
                <input
                  type="text"
                  value={dinnerTime}
                  onChange={(e) => setDinnerTime(e.target.value)}
                  placeholder="Time: e.g. 08:00 PM - 10:00 PM"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs tracking-wider uppercase mt-auto select-none"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Daily Menu</span>
                </>
              )}
            </motion.button>
          </motion.form>
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
