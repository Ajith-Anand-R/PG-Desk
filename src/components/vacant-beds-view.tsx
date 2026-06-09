"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, X, Home, Bed, Layers, AlertCircle, Sparkles } from "lucide-react";
import { Room } from "@/lib/types";

interface VacantBedsViewProps {
  onBack: () => void;
  propertyName: string;
  rooms: Room[];
}

export function VacantBedsView({
  onBack,
  propertyName,
  rooms,
}: VacantBedsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<number | "All">("All");

  // Filter rooms that have at least one available bed
  const vacantRooms = React.useMemo(() => {
    return rooms.filter((room) => {
      const hasVacantBed = room.beds.some((status) => status === "available");
      const matchesFloor = selectedFloor === "All" || room.floor === selectedFloor;
      const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      return hasVacantBed && matchesFloor && matchesSearch;
    });
  }, [rooms, selectedFloor, searchQuery]);

  // Compute stats
  const totalVacantBeds = React.useMemo(() => {
    return rooms.reduce(
      (acc, r) => acc + r.beds.filter((status) => status === "available").length,
      0
    );
  }, [rooms]);

  const totalVacantRoomsCount = React.useMemo(() => {
    return rooms.filter((r) => r.beds.some((status) => status === "available")).length;
  }, [rooms]);

  // Get unique floors of vacant rooms
  const floors = React.useMemo(() => {
    const allFloors = rooms
      .filter((r) => r.beds.some((status) => status === "available"))
      .map((r) => r.floor);
    return Array.from(new Set(allFloors)).sort((a, b) => a - b);
  }, [rooms]);

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-slate-50">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-b from-emerald-800 via-emerald-950 to-slate-900 text-white rounded-b-[2.5rem] px-5 pt-6 pb-10 shadow-lg relative overflow-hidden shrink-0 select-none">
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-teal-500/15 blur-xl pointer-events-none" />

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
              <p className="text-[10px] font-extrabold tracking-widest text-emerald-300/85 uppercase leading-none mb-1">
                {propertyName}
              </p>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">
                Vacant Beds Directory
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Summary Stats */}
      <div className="px-5 -mt-6 z-20 grid grid-cols-2 gap-3.5 relative select-none">
        <div className="bg-white rounded-3xl p-4.5 border border-slate-100/90 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9.5px] font-extrabold text-slate-400 tracking-widest uppercase">
              Vacant Rooms
            </span>
            <span className="text-2xl font-black text-slate-800 font-mono tracking-tight mt-0.5">
              {totalVacantRoomsCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4.5 border border-slate-100/90 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9.5px] font-extrabold text-slate-400 tracking-widest uppercase">
              Vacant Beds
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight mt-0.5">
              {totalVacantBeds}
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Bed className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-5 mt-6 flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden flex items-center px-4 h-11.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus-within:shadow-md transition-shadow">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vacant rooms..."
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

        {/* Floors filters */}
        {floors.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
              Floors
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
              {["All", ...floors].map((f) => {
                const isSelected =
                  f === "All" ? selectedFloor === "All" : selectedFloor === Number(f);
                return (
                  <motion.button
                    key={f}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFloor(f === "All" ? "All" : Number(f))}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50/80"
                    }`}
                  >
                    {f === "All" ? "All Floors" : `Floor ${f}`}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Directory Grid */}
      <div className="px-5 mt-6 flex flex-col gap-4.5 flex-1 pb-10">
        {vacantRooms.length === 0 ? (
          <div className="text-center py-16 px-5 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.015)] select-none">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-slate-800 font-bold text-sm">No vacant beds available</p>
            <p className="text-slate-400 text-xs mt-1 font-semibold">
              All beds are currently occupied or filters don't match.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vacantRooms.map((room) => {
              const availableBedsInRoom = room.beds.filter((status) => status === "available").length;

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-5 border border-slate-200/40 shadow-xs flex flex-col gap-4 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

                  {/* Header */}
                  <div className="flex justify-between items-center select-none">
                    <div className="flex flex-col">
                      <h4 className="text-sm font-black text-slate-850">
                        Room {room.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        Floor {room.floor}
                      </span>
                    </div>
                    
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {availableBedsInRoom}/{room.capacity} Vacant
                    </span>
                  </div>

                  {/* Beds list */}
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100/50">
                    <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest px-0.5">
                      Beds Status
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {room.beds.map((status, idx) => {
                        const bedLetter = String.fromCharCode(65 + idx);
                        const isAvailable = status === "available";

                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border text-[11px] font-bold select-none ${
                              isAvailable
                                ? "bg-emerald-50/15 border-emerald-100 text-emerald-700"
                                : "bg-slate-50/50 border-slate-150 text-slate-400"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Bed className={`w-4 h-4 ${isAvailable ? "text-emerald-600 animate-pulse" : "text-slate-300"}`} />
                              Bed {bedLetter}
                            </span>
                            <span className={`text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm border ${
                              isAvailable
                                ? "bg-emerald-100/30 border-emerald-200/50 text-emerald-600"
                                : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}>
                              {isAvailable ? "Vacant" : "Occupied"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Features / Watermark */}
                  <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-400 pt-1 leading-none select-none">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Ready to occupy
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-2 shrink-0">
        <p className="text-[10px] font-bold text-slate-400">
          Powered by <span className="text-emerald-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
        </p>
      </div>
    </div>
  );
}
