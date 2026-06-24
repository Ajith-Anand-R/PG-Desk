"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  Phone, 
  Shield, 
  Mail, 
  AlertCircle,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  Check
} from "lucide-react";
import { StatCard } from "./ui/stat-card";
import { BedIcon } from "./ui/bed-icon";
import { Room } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getDaysRemaining as utilsGetDaysRemaining } from "@/lib/utils";


interface RoomsViewProps {
  onBack: () => void;
  propertyName: string;
  rooms: Room[];
  onToggleBed: (roomId: string, bedIndex: number) => void;
  onAddRoomClick: () => void;
  onRefresh?: () => void;
}

export function RoomsView({
  onBack,
  propertyName,
  rooms,
  onToggleBed,
  onAddRoomClick,
  onRefresh,
}: RoomsViewProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedBed, setSelectedBed] = useState<{
    roomId: string;
    roomName: string;
    bedIndex: number;
    status: "available" | "occupied" | "reserved" | "notice";
  } | null>(null);

  const [bedDetails, setBedDetails] = useState<{
    tenant?: any;
    dueDate?: string;
    paymentStatus?: "paid" | "pending" | "overdue";
    rentAmount?: number;
  } | null>(null);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);

  const [isEditingRent, setIsEditingRent] = useState(false);
  const [editRentAmount, setEditRentAmount] = useState("");

  const handleSaveRent = async () => {
    if (!selectedBed || !editRentAmount) return;
    try {
      const { error } = await supabase
        .from("rooms")
        .update({ rent: Number(editRentAmount) })
        .eq("id", selectedBed.roomId);

      if (error) {
        alert("Error updating rent: " + error.message);
      } else {
        setBedDetails(prev => prev ? { ...prev, rentAmount: Number(editRentAmount) } : null);
        setIsEditingRent(false);
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      console.error("Error saving rent:", err);
    }
  };

  // Helper to calculate days remaining for notice period
  const getDaysRemaining = (vacateDateStr?: string | null) => {
    return utilsGetDaysRemaining(vacateDateStr);
  };

  // Dynamic calculations
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBedsCount = rooms.reduce(
    (acc, r) => acc + r.beds.filter((status) => status === "occupied" || status === "notice").length,
    0
  );
  const noticeBedsCount = rooms.reduce(
    (acc, r) => acc + r.beds.filter((status) => status === "notice").length,
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

  const handleBedClick = async (room: Room, bedIndex: number, status: "available" | "occupied" | "reserved" | "notice") => {
    setSelectedBed({
      roomId: room.id,
      roomName: room.name,
      bedIndex,
      status,
    });
    setBedDetails(null);
    setLoadingDetails(true);

    try {
      const targetBedId = room.bedIds?.[bedIndex];
      if (!targetBedId) throw new Error("Bed ID not found.");

      // Fetch room rent info
      const { data: roomInfo } = await supabase
        .from("rooms")
        .select("rent")
        .eq("id", room.id)
        .single();

      const rentAmount = roomInfo ? Number(roomInfo.rent) : 0;

      if (status === "occupied" || status === "reserved" || status === "notice") {
        // Fetch active, pending, prebooked, or notice tenant for this bed
        const { data: tenantsForBed } = await supabase
          .from("tenants")
          .select("*, users(*)")
          .eq("bed_id", targetBedId)
          .in("status", ["active", "pending", "prebooked", "notice"]);

        let tenantData = null;
        if (tenantsForBed && tenantsForBed.length > 0) {
          tenantData = tenantsForBed.find((t: any) => t.status === "active" || t.status === "notice")
            || tenantsForBed.find((t: any) => t.status === "prebooked")
            || tenantsForBed[0];
        }

          if (tenantData) {
            // Fetch payments to find due date
            const { data: paymentData } = await supabase
              .from("payments")
              .select("*")
              .eq("tenant_id", tenantData.id)
              .order("due_date", { ascending: false });

            let dueDate = "N/A";
            let paymentStatus: "paid" | "pending" | "overdue" = "paid";

            if (paymentData && paymentData.length > 0) {
              const latestPayment = paymentData[0];
              paymentStatus = latestPayment.status;
              if (latestPayment.due_date) {
                dueDate = new Date(latestPayment.due_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
              }
            }

            setBedDetails({
              tenant: tenantData,
              dueDate,
              paymentStatus,
              rentAmount,
            });
          } else {
            setBedDetails({
              rentAmount,
            });
          }
        } else {
          setBedDetails({
            rentAmount,
          });
        }
    } catch (err) {
      console.error("Error fetching bed details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleBedStatus = async () => {
    if (!selectedBed) return;
    try {
      await onToggleBed(selectedBed.roomId, selectedBed.bedIndex);
      setSelectedBed(null);
      setBedDetails(null);
    } catch (err) {
      console.error("Error toggling bed status:", err);
    }
  };

  const handleDeleteFloor = async (floorNum: number) => {
    const floorRooms = rooms.filter((r) => r.floor === floorNum);
    const hasOccupied = floorRooms.some((r) => r.beds.some((status) => status !== "available"));
    if (hasOccupied) {
      alert("Cannot delete floor with occupied or reserved beds. Please check out all tenants first.");
      return;
    }
    if (!confirm(`Are you sure you want to delete Floor ${floorNum} and all its rooms?`)) {
      return;
    }
    try {
      const roomIds = floorRooms.map(r => Number(r.id));
      if (roomIds.length > 0) {
        // Soft delete beds in rooms on this floor
        const { error: bedsErr } = await supabase
          .from("beds")
          .update({ deleted_at: new Date().toISOString() })
          .in("room_id", roomIds);
        if (bedsErr) throw bedsErr;

        // Soft delete rooms on this floor
        const { error: roomsErr } = await supabase
          .from("rooms")
          .update({ deleted_at: new Date().toISOString() })
          .in("id", roomIds);
        if (roomsErr) throw roomsErr;
      }
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Error deleting floor:", err);
      alert(err.message || "Failed to delete floor.");
    }
  };

  const handleAddBed = async (roomId: string) => {
    try {
      // Get current non-deleted beds count to calculate next bed number
      const { data: bedsList } = await supabase
        .from("beds")
        .select("bed_number")
        .eq("room_id", Number(roomId))
        .is("deleted_at", null);

      const nextBedNum = (bedsList?.length || 0) + 1;

      const { error: bedErr } = await supabase.from("beds").insert({
        room_id: Number(roomId),
        bed_number: `Bed ${nextBedNum}`,
        status: "available"
      });
      if (bedErr) throw bedErr;

      const { data: roomInfo } = await supabase
        .from("rooms")
        .select("capacity")
        .eq("id", Number(roomId))
        .single();
      if (roomInfo) {
        const newCapacity = Number(roomInfo.capacity) + 1;
        await supabase
          .from("rooms")
          .update({ capacity: newCapacity })
          .eq("id", Number(roomId));
      }

      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Error adding bed:", err);
      alert(err.message || "Failed to add bed.");
    }
  };

  const handleDeleteBed = async () => {
    if (!selectedBed) return;
    const isOccupiedOrReserved = selectedBed.status !== "available";
    let confirmMsg = `Are you sure you want to delete Bed ${bedLetter} from Room ${selectedBed.roomName}?`;
    if (isOccupiedOrReserved) {
      const tenantName = bedDetails?.tenant?.name || "a resident";
      confirmMsg = `WARNING: This bed is currently occupied/reserved by ${tenantName}. Deleting the bed will automatically check out the resident. Are you sure you want to proceed?`;
    }
    if (!confirm(confirmMsg)) {
      return;
    }
    try {
      const room = rooms.find((r) => r.id === selectedBed.roomId);
      const targetBedId = room?.bedIds?.[selectedBed.bedIndex];
      if (!targetBedId) throw new Error("Bed ID not found.");

      // 1. If occupied/reserved/notice, mark occupant(s) as left
      if (isOccupiedOrReserved) {
        await supabase
          .from("tenants")
          .update({ status: "left", vacate_date: new Date().toISOString().split("T")[0] })
          .eq("bed_id", targetBedId)
          .in("status", ["active", "notice", "prebooked"]);
      }

      // 2. Soft delete bed
      const { error } = await supabase
        .from("beds")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", targetBedId);

      if (error) throw error;

      // 3. Decrement room capacity
      const { data: roomInfo } = await supabase
        .from("rooms")
        .select("capacity")
        .eq("id", Number(selectedBed.roomId))
        .single();
      if (roomInfo) {
        const newCapacity = Math.max(0, Number(roomInfo.capacity) - 1);
        await supabase
          .from("rooms")
          .update({ capacity: newCapacity })
          .eq("id", Number(selectedBed.roomId));
      }

      setSelectedBed(null);
      setBedDetails(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Error deleting bed:", err);
      alert(err.message || "Failed to delete bed.");
    }
  };

  const formatAadhaar = (num?: string) => {
    if (!num) return "N/A";
    const cleaned = num.replace(/\s+/g, "");
    return cleaned.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number | string | null) => {
    if (amount === undefined || amount === null) return "N/A";
    return "₹" + Number(amount).toLocaleString("en-IN");
  };

  const bedLetter = selectedBed ? String.fromCharCode(65 + selectedBed.bedIndex) : "";

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 bg-slate-50/60 relative">
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
        <StatCard type="notice" value={noticeBedsCount} />
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
              (acc, r) => acc + r.beds.filter((status) => status !== "available").length,
              0
            );

            return (
              <div key={floorNum} className="flex flex-col gap-4 select-none">
                {/* Floor Section Header */}
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-2 mb-1 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="font-extrabold text-slate-800 text-xs tracking-tight">Floor {floorNum}</h2>
                    <button
                      onClick={() => handleDeleteFloor(floorNum)}
                      className="p-1 rounded-md hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"
                      title="Delete Floor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                      onBedClick={handleBedClick}
                      onAddBed={handleAddBed}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bed Details Modal Overlay */}
      <AnimatePresence>
        {selectedBed && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden border border-slate-100 shadow-2xl relative flex flex-col"
            >
              <button
                onClick={() => {
                  setSelectedBed(null);
                  setBedDetails(null);
                  setIsEditingRent(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-emerald-50/50 to-slate-50/30">
                <span className="text-[9.5px] font-extrabold tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase">
                  Bed {bedLetter}
                </span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight mt-2.5">
                  Room {selectedBed.roomName}
                </h3>
                 <div className="flex items-center gap-2 mt-1.5">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedBed.status === "occupied" 
                      ? (bedDetails?.tenant?.status === "notice" ? "bg-amber-500 animate-pulse" : "bg-rose-500 animate-pulse")
                      : (selectedBed.status === "reserved" || selectedBed.status === "notice")
                      ? "bg-amber-500 animate-pulse"
                      : "bg-emerald-500"
                  }`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedBed.status === "occupied" 
                      ? (bedDetails?.tenant?.status === "notice" ? "text-amber-600" : "text-rose-600")
                      : (selectedBed.status === "reserved" || selectedBed.status === "notice")
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}>
                    {selectedBed.status === "occupied" && bedDetails?.tenant?.status === "notice" ? "Occupied (Notice)" : selectedBed.status}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 flex flex-col gap-5">
                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-8 h-8 rounded-full border-3 border-slate-100 border-t-emerald-600 animate-spin" />
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Loading details...</span>
                  </div>
                ) : (
                  <>
                    {/* General Rent details */}
                    <div className="flex items-center justify-between bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-500 shadow-xs border border-slate-200/50">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Bed Rent</span>
                          <span className="text-xs font-black text-slate-700">Monthly Rent</span>
                        </div>
                      </div>
                      
                      {isEditingRent ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editRentAmount}
                            onChange={(e) => setEditRentAmount(e.target.value)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveRent}
                            className="p-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setIsEditingRent(false)}
                            className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-800 font-mono">
                            {formatCurrency(bedDetails?.rentAmount)}
                          </span>
                          <button
                            onClick={() => {
                              setEditRentAmount(String(bedDetails?.rentAmount || ""));
                              setIsEditingRent(true);
                            }}
                            className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {(selectedBed.status === "occupied" || selectedBed.status === "reserved" || selectedBed.status === "notice") ? (
                      bedDetails?.tenant ? (
                        <>
                          {/* Notice Period Banner */}
                          {bedDetails.tenant.status === "notice" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                                <Clock className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
                                Resident serving notice period
                              </div>
                              <div className="text-[11px] text-amber-705 font-semibold leading-relaxed">
                                This bed is scheduled to become vacant on{" "}
                                <span className="font-extrabold text-amber-900">
                                  {formatDate(bedDetails.tenant.vacateDate)}
                                </span>.
                                <div className="mt-2 flex items-center">
                                  <span className="bg-amber-100 border border-amber-200 text-amber-850 px-2.5 py-0.5 rounded-lg font-black text-[9.5px] uppercase tracking-wider">
                                    {(() => {
                                      const daysLeft = getDaysRemaining(bedDetails.tenant.vacateDate);
                                      if (daysLeft === null) return "N/A";
                                      if (daysLeft < 0) return "Overdue";
                                      return `${daysLeft} days left`;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Occupied Tenant Section */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
                              {selectedBed.status === "reserved" ? "Reserved Tenant" : "Occupied Tenant"}
                            </span>
                            <div className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-150 bg-slate-50/30">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-extrabold text-sm shrink-0 overflow-hidden shadow-2xs">
                                  {bedDetails.tenant.users?.photo ? (
                                    <img 
                                      src={bedDetails.tenant.users.photo} 
                                      alt={bedDetails.tenant.name} 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    (bedDetails.tenant.name || "Unknown").substring(0, 2).toUpperCase()
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-slate-850 leading-none">
                                    {bedDetails.tenant.name || "Unknown Tenant"}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-505 mt-1.5 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {bedDetails.tenant.phone || bedDetails.tenant.users?.phone || "No phone"}
                                  </span>
                                </div>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedTenant(bedDetails.tenant)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-2xs shrink-0"
                              >
                                View Details
                              </motion.button>
                            </div>

                            {/* Invite Token Info */}
                            {bedDetails.tenant.user_id === null && (
                              <div className="flex flex-col gap-1.5 mt-1 bg-violet-50/50 border border-violet-100 p-3 rounded-2xl">
                                <span className="text-[9px] font-extrabold text-violet-600 uppercase tracking-wider">Unregistered - Invite Token</span>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-black text-violet-750 bg-violet-100/60 px-2.5 py-0.5 rounded border border-violet-200/50 select-all">
                                    {bedDetails.tenant.invite_token}
                                  </span>
                                  <span className="text-[9px] font-extrabold text-slate-400">
                                    Expires: {formatDate(bedDetails.tenant.invite_expires_at)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Payment status */}
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Payment & Dues</span>
                            <div className="p-4 rounded-2xl border border-slate-150 flex flex-col gap-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-slate-400" />
                                  Next Due Date
                                </span>
                                <span className="font-extrabold text-slate-700">{bedDetails.dueDate}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-100">
                                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                  <AlertCircle className="w-4 h-4 text-slate-400" />
                                  Payment Status
                                </span>
                                <span className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                  bedDetails.paymentStatus === "paid"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                    : bedDetails.paymentStatus === "overdue"
                                    ? "bg-rose-50 border-rose-100 text-rose-600"
                                    : "bg-amber-50 border-amber-100 text-amber-600"
                                }`}>
                                  {bedDetails.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4 text-xs font-semibold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                          No tenant details found in database.
                        </div>
                      )
                    ) : (
                      <div className="text-center py-6 text-xs font-semibold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        This bed is currently empty and available.
                      </div>
                    )}

                    {/* Action toggles */}
                    <div className="flex flex-col gap-2 pt-2">
                      {selectedBed.status === "reserved" && bedDetails?.tenant && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={async () => {
                            if (!confirm(`Confirm physical check-in for ${bedDetails.tenant.name}?`)) return;
                            try {
                              // 1. Update tenant status to active
                              const { error: tErr } = await supabase
                                .from("tenants")
                                .update({ status: "active" })
                                .eq("id", bedDetails.tenant.id);
                              if (tErr) throw tErr;

                              // 2. Update bed status to occupied
                              const room = rooms.find((r) => r.id === selectedBed.roomId);
                              const targetBedId = room?.bedIds?.[selectedBed.bedIndex];
                              if (targetBedId) {
                                const { error: bErr } = await supabase
                                  .from("beds")
                                  .update({ status: "occupied" })
                                  .eq("id", targetBedId);
                                if (bErr) throw bErr;
                              }

                              setSelectedBed(null);
                              setBedDetails(null);
                              // Trigger reload of data
                              onToggleBed(selectedBed.roomId, selectedBed.bedIndex); // notify parent
                            } catch (e) {
                              console.error(e);
                              alert("Check-in failed!");
                            }
                          }}
                          className="w-full font-extrabold py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10.5px] uppercase tracking-wider cursor-pointer text-center shadow-md shadow-emerald-900/10"
                        >
                          Check In Tenant
                        </motion.button>
                      )}

                      {selectedBed.status === "notice" ? (
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            disabled
                            className="w-full font-extrabold py-3.5 rounded-2xl text-[10.5px] uppercase tracking-wider text-center text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed select-none animate-none"
                          >
                            Bed Locked (Notice Period Active)
                          </button>
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={handleDeleteBed}
                            className="w-full font-extrabold py-3.5 rounded-2xl text-[10.5px] uppercase tracking-wider cursor-pointer text-center text-rose-600 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors shadow-2xs"
                          >
                            Delete Bed
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 w-full">
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={handleToggleBedStatus}
                            className={`w-full font-extrabold py-3.5 rounded-2xl text-[10.5px] uppercase tracking-wider cursor-pointer text-center text-white ${
                              selectedBed.status === "occupied"
                                ? "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-900/10"
                                : selectedBed.status === "reserved"
                                ? "bg-slate-500 hover:bg-slate-600 shadow-md shadow-slate-900/10"
                                : "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/10"
                            }`}
                          >
                            {selectedBed.status === "occupied" 
                              ? "Mark Bed Available" 
                              : selectedBed.status === "reserved"
                              ? "Cancel Reservation (Mark Available)"
                              : "Assign / Mark Occupied"}
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={handleDeleteBed}
                            className="w-full font-extrabold py-3.5 rounded-2xl text-[10.5px] uppercase tracking-wider cursor-pointer text-center text-rose-600 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors shadow-2xs"
                          >
                            Delete Bed
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tenant Details Modal Overlay */}
      <AnimatePresence>
        {selectedTenant && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden border border-slate-100 shadow-2xl relative flex flex-col max-h-[85dvh]"
            >
              <button
                onClick={() => setSelectedTenant(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100/70 hover:bg-slate-200/70 text-slate-500 cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Banner Cover */}
              <div className="h-28 bg-gradient-to-r from-emerald-750 from-emerald-700 to-emerald-900 relative shrink-0">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* User Avatar Overlapping */}
              <div className="flex flex-col items-center px-6 -mt-11 relative z-10 pb-4 border-b border-slate-100">
                <div className="w-22 h-22 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center font-extrabold text-3xl text-emerald-800 overflow-hidden shrink-0">
                  {selectedTenant.users?.photo ? (
                    <img 
                      src={selectedTenant.users.photo} 
                      alt={selectedTenant.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    selectedTenant.name?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <h4 className="text-base font-black text-slate-800 tracking-tight mt-2.5">
                  {selectedTenant.name}
                </h4>
                 <div className="flex items-center gap-1.5 mt-1 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-150">
                  <Shield className={`w-3 h-3 ${
                    selectedTenant.status === "active" 
                      ? "text-emerald-600" 
                      : selectedTenant.status === "notice"
                      ? "text-amber-500"
                      : selectedTenant.status === "prebooked"
                      ? "text-blue-500"
                      : "text-amber-500"
                  }`} />
                  <span className="text-[9px] font-black text-slate-550 uppercase tracking-wider">
                    {selectedTenant.status === "active" && "Active Tenant"}
                    {selectedTenant.status === "notice" && "Notice Active"}
                    {selectedTenant.status === "prebooked" && "Prebooked Tenant"}
                    {selectedTenant.status !== "active" && selectedTenant.status !== "notice" && selectedTenant.status !== "prebooked" && "Pending Tenant"}
                  </span>
                </div>
              </div>

              {/* Scrollable Details */}
              <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4.5 no-scrollbar flex-1 bg-slate-50/30">
                
                {/* Aadhaar Info Card */}
                <div className="bg-white rounded-3xl p-4.5 border border-slate-150 flex flex-col gap-3 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-650" />
                    Identity Verification
                  </span>
                  
                  {/* Aadhaar Visual Layout */}
                  <div className="bg-gradient-to-br from-blue-50/70 via-sky-50/50 to-orange-50/70 border border-sky-100/70 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden select-none shadow-2xs min-h-[120px]">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-2 border-b border-sky-100/50">
                      <span className="text-[7px] font-black text-slate-400 tracking-wider uppercase">GOVERNMENT OF INDIA</span>
                      <span className="text-[8px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-sm border border-emerald-100 uppercase tracking-wide">AADHAAR</span>
                    </div>

                    {/* Aadhaar details */}
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="w-11 h-13 bg-slate-200/50 border border-slate-300/30 rounded-xs flex items-center justify-center shrink-0 overflow-hidden">
                        {selectedTenant.users?.photo ? (
                          <img 
                            src={selectedTenant.users.photo} 
                            alt="Aadhaar" 
                            className="w-full h-full object-cover grayscale"
                          />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9.5px] font-black text-slate-750">{selectedTenant.name}</span>
                        <span className="text-[7px] font-bold text-slate-400">DOB: {selectedTenant.dob ? formatDate(selectedTenant.dob) : "N/A"}</span>
                        <span className="text-[7px] font-bold text-slate-400">Gender: {selectedTenant.gender || "N/A"}</span>
                      </div>
                    </div>

                    {/* Large bold number */}
                    <div className="text-center text-xs font-black text-slate-800 tracking-widest font-mono pt-1.5 border-t border-sky-100/50">
                      {formatAadhaar(selectedTenant.aadhaar_number)}
                    </div>
                  </div>
                </div>

                {/* Stay details */}
                <div className="bg-white rounded-3xl p-4.5 border border-slate-150 flex flex-col gap-3.5 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-650" />
                    Stay Details
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-505">Join Date</span>
                    <span className="font-extrabold text-slate-700">{formatDate(selectedTenant.join_date)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Advance Payment</span>
                    <span className="font-black text-emerald-600 font-mono">{formatCurrency(selectedTenant.deposit)}</span>
                  </div>
                  {selectedTenant.vacate_date && (
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-505">Vacate Date</span>
                      <span className="font-extrabold text-amber-600">{formatDate(selectedTenant.vacate_date)}</span>
                    </div>
                  )}
                </div>

                {/* Emergency & parents */}
                <div className="bg-white rounded-3xl p-4.5 border border-slate-150 flex flex-col gap-3.5 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Emergency & Family Contacts
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-505">Emergency Contact</span>
                    <span className="font-extrabold text-slate-700">{selectedTenant.emergency_contact || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Father's Name</span>
                    <span className="font-extrabold text-slate-700">{selectedTenant.father_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Father's Phone</span>
                    <span className="font-extrabold text-slate-700">{selectedTenant.father_phone || "N/A"}</span>
                  </div>
                </div>

                {/* Additional contacts */}
                <div className="bg-white rounded-3xl p-4.5 border border-slate-150 flex flex-col gap-3.5 shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-650" />
                    Other Information
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-505">Email</span>
                    <span className="font-extrabold text-slate-700 truncate max-w-[180px]">{selectedTenant.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                    <span className="font-semibold text-slate-505">Occupation</span>
                    <span className="font-extrabold text-slate-700">{selectedTenant.occupation || "N/A"}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-3 border-t border-slate-100 text-xs">
                    <span className="font-semibold text-slate-505">Permanent Address</span>
                    <span className="font-extrabold text-slate-700 leading-relaxed mt-0.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-150/40">
                      {selectedTenant.permanent_address || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Invite Token Info */}
                {selectedTenant.user_id === null && (
                  <div className="bg-violet-50/50 border border-violet-150 p-4.5 rounded-3xl flex flex-col gap-3 shadow-xs">
                    <span className="text-[10px] font-extrabold text-violet-650 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-violet-650" />
                      Registration Invite Link / Token
                    </span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-550">Invite Token</span>
                      <span className="font-mono font-black text-violet-750 bg-violet-100/60 px-2.5 py-0.5 rounded border border-violet-200/50 select-all">
                        {selectedTenant.invite_token}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-550">Expires At</span>
                      <span className="font-extrabold text-slate-700">{formatDate(selectedTenant.invite_expires_at)}</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Close Button Footer */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedTenant(null)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all font-extrabold text-slate-700 text-xs uppercase tracking-wider cursor-pointer text-center animate-none"
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for individual room card
interface RoomCardProps {
  room: Room;
  onToggleBed: (index: number) => void;
  onBedClick: (room: Room, index: number, status: "available" | "occupied" | "reserved" | "notice") => void;
  onAddBed: (roomId: string) => void;
}

function RoomCard({ room, onToggleBed, onBedClick, onAddBed }: RoomCardProps) {
  const occupiedCount = room.beds.filter((status) => status === "occupied" || status === "reserved" || status === "notice").length;
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
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-slate-800 text-xs tracking-tight">{room.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddBed(room.id);
            }}
            className="px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100/50 transition-colors text-[9px] font-black uppercase tracking-wider cursor-pointer"
            title="Add Bed"
          >
            + Bed
          </button>
        </div>
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
          <BedIcon key={idx} status={status} onClick={() => onBedClick(room, idx, status)} />
        ))}
      </div>
    </motion.div>
  );
}

