"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { StatCard } from "./ui/stat-card";
import { BedIcon } from "./ui/bed-icon";
import { Room } from "@/lib/types";

interface RoomsViewProps {
  onBack: () => void;
  propertyName: string;
  rooms: Room[];
  onToggleBed: (roomId: string, bedIndex: number) => void;
  onAddRoomClick: () => void;
}

export function RoomsView({
  onBack,
  propertyName,
  rooms,
  onToggleBed,
  onAddRoomClick,
}: RoomsViewProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic calculations
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBedsCount = rooms.reduce(
    (acc, r) => acc + r.beds.filter((status) => status === "occupied").length,
    0
  );
  const availableBedsCount = totalBeds - occupiedBedsCount;

  // Filter rooms by search and floor
  const filteredRooms = rooms.filter((room) => {
    const matchesFloor = selectedFloor === "All" || room.floor === selectedFloor;
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFloor && matchesSearch;
  });

  // Unique sorted floors list
  const floors = Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a - b);

  // Group rooms by floor dynamically
  const targetFloors = selectedFloor === "All" ? floors : [selectedFloor];

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-slate-50/60">
      {/* Header Banner (Royal emerald Gradient with glowing backdrop) */}
      <div className="bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-b-[2.5rem] px-5 pt-6 pb-10 shadow-lg relative overflow-hidden">
        <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-teal-500/15 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 cursor-pointer transition-colors hover:bg-white/15"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-emerald-300/80 uppercase leading-none mb-1">{propertyName}</p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white leading-none">Rooms Directory</h1>
                <span className="bg-emerald-500/30 border border-emerald-400/20 text-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 leading-none">
                  {rooms.length} Rooms
                </span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onAddRoomClick}
            className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center border border-emerald-500/30 cursor-pointer shadow-md shadow-emerald-900/40 transition-colors hover:bg-emerald-550"
          >
            <Plus className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Floating Stat Cards Area */}
      <div className="px-5 -mt-6 z-20 grid grid-cols-3 gap-2.5 relative">
        <StatCard type="available" value={availableBedsCount} />
        <StatCard type="occupied" value={occupiedBedsCount} />
        <StatCard type="notice" value={0} />
      </div>

      {/* Controls: Search and Filters */}
      <div className="px-5 mt-6 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden flex items-center px-4 h-11.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus-within:shadow-md focus-within:border-emerald-500/20 transition-all duration-300">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms by number..."
            className="w-full h-full bg-transparent border-0 px-3 text-xs font-semibold focus:outline-hidden text-slate-700 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Floor Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Floors</span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
            {["All", ...floors].map((f) => {
              const isSelected =
                f === "All" ? selectedFloor === "All" : selectedFloor === Number(f);
              return (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFloor(f === "All" ? "All" : Number(f))}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                      : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50/80"
                  }`}
                >
                  {f === "All" ? "All Floors" : `Floor ${f}`}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rooms Directory Grid */}
      <div className="px-5 mt-6 flex flex-col gap-5 flex-1 pb-10">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 px-5 bg-white rounded-3xl border border-slate-100/80 shadow-[0_4px_16px_rgba(0,0,0,0.015)] select-none">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-slate-800 font-bold text-sm">No rooms found</p>
            <p className="text-slate-400 text-xs mt-1 font-semibold">Try adjusting your search query or floor filters</p>
          </div>
        ) : (
          targetFloors.map((floorNum) => {
            const floorRooms = filteredRooms.filter((r) => r.floor === floorNum);
            if (floorRooms.length === 0) return null;

            const totalBedsOnFloor = floorRooms.reduce((acc, r) => acc + r.capacity, 0);
            const occupiedBedsOnFloor = floorRooms.reduce(
              (acc, r) => acc + r.beds.filter((status) => status === "occupied").length,
              0
            );

            return (
              <div key={floorNum} className="flex flex-col gap-4 select-none">
                {/* Floor Section Header */}
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-1 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="font-extrabold text-slate-800 text-xs tracking-tight">Floor {floorNum}</h2>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100/80 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {occupiedBedsOnFloor}/{totalBedsOnFloor} Beds Taken
                  </span>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  {floorRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onToggleBed={(bedIdx) => onToggleBed(room.id, bedIdx)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Sub-component for individual room card
interface RoomCardProps {
  room: Room;
  onToggleBed: (index: number) => void;
}

function RoomCard({ room, onToggleBed }: RoomCardProps) {
  const occupiedCount = room.beds.filter((status) => status === "occupied").length;
  const isFull = occupiedCount === room.capacity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-3.5 flex flex-col justify-between gap-3.5 transition-all duration-300 ${
        isFull
          ? "bg-slate-50/50 border border-slate-200/40 shadow-[0_2px_8px_rgba(0,0,0,0.01)] opacity-80"
          : "bg-white border border-emerald-500/10 shadow-[0_4px_14px_rgba(99,102,241,0.025)] hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center select-none">
        <span className="font-extrabold text-slate-800 text-xs tracking-tight">{room.name}</span>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
          isFull
            ? "bg-slate-100 text-slate-500 border-slate-200/50"
            : "bg-emerald-50 text-emerald-600 border-emerald-100"
        }`}>
          {occupiedCount}/{room.capacity}
        </span>
      </div>

      {/* Bed icons grid */}
      <div className="flex flex-wrap gap-2">
        {room.beds.map((status, idx) => (
          <BedIcon key={idx} status={status} onClick={() => onToggleBed(idx)} />
        ))}
      </div>
    </motion.div>
  );
}

