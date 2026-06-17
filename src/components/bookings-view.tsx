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
  Bell,
  ChevronDown,
  Info,
  Clock,
  Menu,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Smartphone
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as Sentry from "@sentry/nextjs";


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
  const [activeTenants, setActiveTenants] = useState<any[]>([]);
  const [noticeTenants, setNoticeTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Approval modal state
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [assignedRoomId, setAssignedRoomId] = useState("");
  const [assignedBedId, setAssignedBedId] = useState("");
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinDate, setJoinDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [approvalMode, setApprovalMode] = useState<"active" | "waitlist">("active");
  const [cancellationBooking, setCancellationBooking] = useState<any | null>(null);
  const [refundInitiated, setRefundInitiated] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

      // 2. Fetch rooms with available beds (filtering out soft-deleted rooms)
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*, beds(*)")
        .eq("pg_id", Number(activePgId))
        .is("deleted_at", null);

      if (roomsError) throw roomsError;
      
      // Filter out soft-deleted beds
      const filteredRooms = (roomsData || []).map((r: any) => ({
        ...r,
        beds: (r.beds || []).filter((b: any) => !b.deleted_at)
      }));
      setRooms(filteredRooms);

      // 3. Fetch active/notice/prebooked tenants to prevent double-assigning beds
      const { data: activeTenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("id, bed_id, status, vacate_date, name")
        .eq("pg_id", Number(activePgId))
        .in("status", ["active", "notice", "prebooked"]);

      if (tenantsError) throw tenantsError;
      setActiveTenants(activeTenantsData || []);
      setNoticeTenants((activeTenantsData || []).filter((t: any) => t.status === "notice"));
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
      // Find beds that are occupied by active or prebooked tenants
      const activeBedIds = activeTenants
        .filter((t: any) => t.status === "active" || t.status === "prebooked")
        .map((t: any) => Number(t.bed_id));

      // Beds are available if status is 'available' OR if there is an active tenant in notice period
      // AND the bed is not currently occupied by an active/prebooked tenant
      const freeBeds = room.beds.map((b: any) => {
        const noticeTenant = noticeTenants.find((nt: any) => Number(nt.bed_id) === Number(b.id));
        const isOccupiedByActive = activeBedIds.includes(Number(b.id));

        if (isOccupiedByActive) return null;

        if (b.status === "available") {
          return { ...b, displayName: b.bed_number };
        } else if (noticeTenant) {
          const formattedVacateDate = noticeTenant.vacate_date 
            ? new Date(noticeTenant.vacate_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
            : "soon";
          return { 
            ...b, 
            isNoticePeriod: true, 
            displayName: `${b.bed_number} (Vacating on ${formattedVacateDate})` 
          };
        }
        return null;
      }).filter(Boolean);

      setAvailableBeds(freeBeds);
      if (freeBeds.length > 0) {
        setAssignedBedId(String(freeBeds[0].id));
      } else {
        setAssignedBedId("");
      }
    }
  }, [assignedRoomId, rooms, noticeTenants, activeTenants]);

  // Handle toggling approvalMode
  const handleApprovalModeChange = (mode: "active" | "waitlist") => {
    setApprovalMode(mode);
    if (mode === "active") {
      setJoinDate(new Date().toISOString().split("T")[0]);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setJoinDate(tomorrow.toISOString().split("T")[0]);
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !assignedRoomId || !assignedBedId) return;
    setIsSubmitting(true);
    try {
      const pgIdVal = Number(activePgId);

      // Concurrency/Double-Booking Safety Guard Check
      const { data: alreadyOccupied } = await supabase
        .from("tenants")
        .select("id")
        .eq("bed_id", Number(assignedBedId))
        .in("status", ["active", "notice", "prebooked"])
        .maybeSingle();

      if (alreadyOccupied) {
        alert("This bed has just been booked or occupied by another tenant. Please select a different room/bed.");
        setIsSubmitting(false);
        await fetchData();
        return;
      }

      const inviteToken = "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      const inviteExpiresAt = expiryDate.toISOString();

      // Check if join date is in the future
      const checkInDate = new Date(joinDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isFuture = checkInDate.getTime() > today.getTime();

      const tenantStatus = isFuture ? "prebooked" : "active";
      const bedStatus = isFuture ? "reserved" : "occupied";

      // Check if tenant record already exists (e.g. from signup)
      const { data: existingTenant, error: existingTenantErr } = await supabase
        .from("tenants")
        .select("id")
        .or(`email.eq.${selectedBooking.email.trim()},phone.eq.${selectedBooking.phone.trim()}`)
        .maybeSingle();

      let tenantId: number;

      if (existingTenant) {
        // Update existing tenant
        const { error: updateTenantErr } = await supabase
          .from("tenants")
          .update({
            room_id: Number(assignedRoomId),
            bed_id: Number(assignedBedId),
            status: tenantStatus,
            join_date: joinDate
          })
          .eq("id", existingTenant.id);

        if (updateTenantErr) throw updateTenantErr;
        tenantId = existingTenant.id;
      } else {
        // Create new tenant record with invite token
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
            status: tenantStatus,
            invite_token: inviteToken,
            invite_expires_at: inviteExpiresAt,
            user_id: null,
            join_date: joinDate
          })
          .select()
          .single();

        if (tenantError) throw tenantError;
        tenantId = tenant.id;
      }

      // 2. Mark bed as occupied or reserved (only if it is not currently occupied by someone in notice period)
      const targetBedRecord = availableBeds.find(b => String(b.id) === assignedBedId);
      const isCurrentlyOccupied = targetBedRecord && targetBedRecord.status === "occupied";

      if (!isCurrentlyOccupied) {
        const { error: bedError } = await supabase
          .from("beds")
          .update({ status: bedStatus })
          .eq("id", Number(assignedBedId));

        if (bedError) throw bedError;
      }

      // 2b. Create Security Deposit payment record
      if (existingTenant) {
        // Create a paid Security Deposit payment record of 1000 since they paid upfront during signup
        const { error: depositError } = await supabase.from("payments").insert({
          tenant_id: tenantId,
          pg_id: pgIdVal,
          amount: 1000,
          month: "Security Deposit",
          status: "paid",
          due_date: new Date().toISOString().split("T")[0],
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: "UPI"
        });

        if (depositError) throw depositError;
      } else {
        // Create standard pending Security Deposit payment record of 5000
        const { error: depositError } = await supabase.from("payments").insert({
          tenant_id: tenantId,
          pg_id: pgIdVal,
          amount: 5000,
          month: "Security Deposit",
          status: "pending",
          due_date: joinDate
        });

        if (depositError) throw depositError;
      }

      // 3. Create initial rent payment
      const { error: paymentError } = await supabase.from("payments").insert({
        tenant_id: tenantId,
        pg_id: pgIdVal,
        amount: 6500, // standard rent
        month: new Date(joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        status: "pending",
        due_date: joinDate
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

      if (!existingTenant) {
        alert(`Booking approved! Share this Invite Token with the tenant:\n\nToken: ${inviteToken}\nExpires: 7 days`);
      } else {
        alert(`Booking approved! Tenant already registered and their check-in is set to: ${joinDate}`);
      }

      setToastMessage(`Booking for ${selectedBooking.name} approved!`);
      setSelectedBooking(null);
      setAssignedRoomId("");
      setAssignedBedId("");
      await fetchData();
    } catch (err: any) {
      console.error("Error approving booking:", err);
      Sentry.captureException(err);
      setToastMessage("Approval Failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellationBooking) return;
    setIsCancelling(true);
    try {
      // 1. Update booking status to rejected
      const { error: bookingErr } = await supabase
        .from("bookings")
        .update({ status: "rejected" })
        .eq("id", cancellationBooking.id);

      if (bookingErr) throw bookingErr;

      // 2. Delete tenant record (if any) to clean up
      const { error: tenantErr } = await supabase
        .from("tenants")
        .delete()
        .or(`email.eq.${cancellationBooking.email.trim()},phone.eq.${cancellationBooking.phone.trim()}`);

      if (tenantErr) {
        console.warn("Could not delete matching tenant record:", tenantErr);
      }

      setToastMessage("Booking request cancelled & deposit marked refunded.");
      setCancellationBooking(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error cancelling booking:", err);
      Sentry.captureException(err);
      setToastMessage("Cancellation Failed: " + err.message);
    } finally {
      setIsCancelling(false);
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
                        onClick={() => {
                          setCancellationBooking(booking);
                          setRefundInitiated(false);
                        }}
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

              <form onSubmit={handleApproveSubmit} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-500">
                  <p>Name: <span className="font-bold text-slate-800">{selectedBooking.name}</span></p>
                  <p>Contact: <span className="font-bold text-slate-800">{selectedBooking.phone}</span></p>
                </div>

                {/* Approval Mode Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Approval Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprovalModeChange("active")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        approvalMode === "active"
                          ? "bg-emerald-650 border-emerald-650 text-white shadow-xs"
                          : "border-slate-200 hover:bg-slate-50 text-slate-650"
                      }`}
                    >
                      Active (Immediate Check-in)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprovalModeChange("waitlist")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                        approvalMode === "waitlist"
                          ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                          : "border-slate-200 hover:bg-slate-50 text-slate-650"
                      }`}
                    >
                      Waitlist (Deferred Check-in)
                    </button>
                  </div>
                </div>

                {/* Check-In Date */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="joinDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Check-In Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="joinDate"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    disabled={approvalMode === "active"}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    required
                  />
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
                      const activeBedIds = activeTenants
                        .filter((t: any) => t.status === "active" || t.status === "prebooked")
                        .map((t: any) => Number(t.bed_id));
                      const availCount = r.beds 
                        ? r.beds.filter((b: any) => {
                            const isFree = b.status === "available" && !activeBedIds.includes(Number(b.id));
                            const isNotice = noticeTenants.some((nt: any) => Number(nt.bed_id) === Number(b.id) && !activeBedIds.includes(Number(b.id)));
                            return isFree || isNotice;
                          }).length 
                        : 0;
                      return (
                        <option key={r.id} value={r.id}>
                          Room {r.room_number} (Floor {r.floor}) — {availCount} free/notice
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
                          {b.displayName || b.bed_number}
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

      {/* Cancellation & Refund Warning Modal */}
      <AnimatePresence>
        {cancellationBooking && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellationBooking(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 select-none">
                <h3 className="font-black text-rose-600 text-base flex items-center gap-1.5">
                  <AlertTriangle className="size-5 text-rose-500" />
                  Refund & Cancel
                </h3>
                <button
                  onClick={() => setCancellationBooking(null)}
                  className="p-1 rounded-full hover:bg-slate-50 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs space-y-2.5">
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-905 text-rose-700 dark:text-rose-455 p-3 rounded-xl font-semibold leading-relaxed">
                  <strong>Refund Required:</strong> This prospect paid a ₹1,000 security deposit when creating their resident account. Cancelling this request requires a full refund.
                </div>

                <div className="bg-slate-50 p-3 rounded-xl space-y-2 font-semibold text-slate-650 border border-slate-100">
                  <p>Prospect: <span className="font-bold text-slate-800">{cancellationBooking.name}</span></p>
                  <p>Contact: <span className="font-bold text-slate-800">{cancellationBooking.phone}</span></p>
                  <p>Amount: <span className="font-bold text-rose-600 font-mono text-sm">₹1,000.00</span></p>
                </div>
              </div>

              {/* UPI Refund Link */}
              <div className="flex flex-col gap-3">
                <a
                  href={`upi://pay?pa=${cancellationBooking.phone.replace(/[^0-9]/g, '')}@upi&pn=${encodeURIComponent(cancellationBooking.name)}&am=1000&cu=INR&tn=${encodeURIComponent("Deposit Refund")}`}
                  onClick={() => setRefundInitiated(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs tracking-wider uppercase text-center select-none"
                >
                  <Smartphone className="size-4 shrink-0" />
                  Pay Refund via UPI (₹1,000)
                </a>

                {refundInitiated && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl justify-center leading-none border border-emerald-100">
                    <Check className="size-4" />
                    Refund Initiated
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setCancellationBooking(null)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl active:scale-95 text-xs transition-all cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  disabled={!refundInitiated || isCancelling}
                  className={`flex-1 py-3 text-white font-black rounded-xl active:scale-95 text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    refundInitiated 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent'
                  }`}
                >
                  {isCancelling ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Confirm Cancel"
                  )}
                </button>
              </div>
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
