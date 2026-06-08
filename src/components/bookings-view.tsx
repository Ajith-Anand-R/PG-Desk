"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Check,
  X,
  Building2,
  QrCode,
  Bell,
  ChevronDown,
  Info,
  Clock,
  Menu,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BookingsViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
  activePgId: string | undefined;
}

export function BookingsView({
  onBack,
  propertyName,
  onOpenPropertySelector,
  onMenuClick,
  onNavigateToNotifications,
  activePgId,
}: BookingsViewProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Approval modal state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [assignedRoomId, setAssignedRoomId] = useState("");
  const [assignedBedId, setAssignedBedId] = useState("");
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // 1. Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*, rooms(*)")
        .eq("pg_id", Number(activePgId))
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // 2. Fetch rooms with available beds
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*, beds(*)")
        .eq("pg_id", Number(activePgId));

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);
    } catch (err: any) {
      console.error("Error fetching bookings data:", err);
      setToastMessage("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activePgId]);

  // Load beds when assignedRoomId changes
  useEffect(() => {
    if (!assignedRoomId) {
      setAvailableBeds([]);
      setAssignedBedId("");
      return;
    }
    const room = rooms.find(r => String(r.id) === assignedRoomId);
    if (room && room.beds) {
      const freeBeds = room.beds.filter((b: any) => b.status === "available");
      setAvailableBeds(freeBeds);
      if (freeBeds.length > 0) {
        setAssignedBedId(String(freeBeds[0].id));
      } else {
        setAssignedBedId("");
      }
    }
  }, [assignedRoomId, rooms]);

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !assignedRoomId || !assignedBedId) return;
    setIsSubmitting(true);
    try {
      const pgIdVal = Number(activePgId);

      const inviteToken = "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      const inviteExpiresAt = expiryDate.toISOString();

      // 1. Create tenant record with invite token
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          pg_id: pgIdVal,
          name: selectedBooking.name.trim(),
          email: selectedBooking.email.trim(),
          phone: selectedBooking.phone.trim(),
          room_id: Number(assignedRoomId),
          bed_id: Number(assignedBedId),
          deposit: 5000, // standard deposit
          status: "active",
          invite_token: inviteToken,
          invite_expires_at: inviteExpiresAt,
          user_id: null
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 2. Mark bed as occupied
      const { error: bedError } = await supabase
        .from("beds")
        .update({ status: "occupied" })
        .eq("id", Number(assignedBedId));

      if (bedError) throw bedError;

      // 3. Create initial rent payment
      const { error: paymentError } = await supabase.from("payments").insert({
        tenant_id: tenant.id,
        pg_id: pgIdVal,
        amount: 6500, // standard rent
        month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        status: "pending",
        due_date: new Date().toISOString().split("T")[0]
      });

      if (paymentError) throw paymentError;

      // 4. Update booking status to approved
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          status: "approved",
          room_id: Number(assignedRoomId),
          bed_id: Number(assignedBedId)
        })
        .eq("id", selectedBooking.id);

      if (bookingError) throw bookingError;

      alert(`Booking approved! Share this Invite Token with the tenant:\n\nToken: ${inviteToken}\nExpires: 7 days`);

      setToastMessage(`Booking for ${selectedBooking.name} approved!`);
      setSelectedBooking(null);
      setAssignedRoomId("");
      setAssignedBedId("");
      await fetchData();
    } catch (err: any) {
      console.error("Error approving booking:", err);
      setToastMessage("Approval Failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to reject this booking?")) return;
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", bookingId);

      if (error) throw error;

      setToastMessage("Booking request rejected.");
      await fetchData();
    } catch (err: any) {
      console.error("Error rejecting booking:", err);
      setToastMessage("Error: " + err.message);
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
            <Calendar className="size-6 text-amber-300" />
            Booking Requests
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-5 mt-6 flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center select-none">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Prospect Enquiries</h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {bookings.filter(b => b.status === "pending").length} Pending
          </span>
        </div>

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">No Bookings Found</h4>
              <p className="text-[10.5px] font-semibold text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                There are no tenant booking requests registered for this property currently.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => {
              const dateStr = booking.created_at
                ? new Date(booking.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })
                : "N/A";

              const isPending = booking.status === "pending";

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-2xs flex flex-col gap-4 relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    booking.status === "approved"
                      ? "bg-emerald-500"
                      : booking.status === "rejected"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`} />

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800 leading-none truncate">
                          {booking.name}
                        </span>
                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none ${
                          booking.status === "approved"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                            : booking.status === "rejected"
                            ? "bg-rose-50 border-rose-100 text-rose-600"
                            : "bg-amber-50 border-amber-100 text-amber-600"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 leading-none mt-1">
                        Applied: {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="flex flex-col gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/60 text-xs font-semibold text-slate-650">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.phone}</span>
                    </div>
                    {booking.rooms && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assigned Room: {booking.rooms.room_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  {isPending && (
                    <div className="flex gap-2 justify-end select-none">
                      <button
                        onClick={() => handleRejectBooking(booking.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/40 text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        Approve & Assign
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approval & Room Assign Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none shrink-0">
                <h3 className="font-black text-slate-850 text-base">Assign Room & Bed</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded-full hover:bg-slate-50 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApproveSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-500">
                  <p>Name: <span className="font-bold text-slate-800">{selectedBooking.name}</span></p>
                  <p>Contact: <span className="font-bold text-slate-800">{selectedBooking.phone}</span></p>
                </div>

                {/* Assign Room */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="assignRoom" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Select Room <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="assignRoom"
                    value={assignedRoomId}
                    onChange={(e) => setAssignedRoomId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                  >
                    <option value="">Select a room</option>
                    {rooms.map((r) => {
                      const availCount = r.beds ? r.beds.filter((s: any) => s.status === "available").length : 0;
                      return (
                        <option key={r.id} value={r.id}>
                          Room {r.room_number} (Floor {r.floor}) — {availCount} free
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Assign Bed */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="assignBed" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Select Bed <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="assignBed"
                    value={assignedBedId}
                    onChange={(e) => setAssignedBedId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                    disabled={!assignedRoomId || availableBeds.length === 0}
                  >
                    {availableBeds.length === 0 ? (
                      <option value="">No free beds in this room</option>
                    ) : (
                      availableBeds.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bed_number}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || !assignedBedId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs tracking-wider uppercase mt-2 select-none"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4.5 h-4.5" />
                      <span>Approve Stay</span>
                    </>
                  )}
                </motion.button>
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
