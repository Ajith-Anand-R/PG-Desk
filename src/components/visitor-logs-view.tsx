"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Search,
  Check,
  Clock,
  UserCheck,
  Building2,
  QrCode,
  Bell,
  ChevronDown,
  Menu,
  CheckCircle,
  X,
  LogOut,
  Calendar,
  Phone,
  UserPlus,
  Camera,
  Package,
  KeyRound,
  Users2,
  Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface VisitorLogsViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
  activePgId: string | undefined;
}

export function VisitorLogsView({
  onBack,
  propertyName,
  onOpenPropertySelector,
  onMenuClick,
  onNavigateToNotifications,
  activePgId,
}: VisitorLogsViewProps) {
  // Tabs: 'logs' | 'walkin' | 'delivery' | 'parcels' | 'staff'
  const [activeTab, setActiveTab] = useState<'logs' | 'walkin' | 'delivery' | 'parcels' | 'staff'>('logs');
  
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [parcels, setParcels] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Walk-in Form State
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinPurpose, setWalkinPurpose] = useState("Personal");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [walkinPhoto, setWalkinPhoto] = useState<string | null>(null);
  const [vehicleNo, setVehicleNo] = useState("");
  const [isAwaitingApproval, setIsAwaitingApproval] = useState(false);
  const [pendingLogId, setPendingLogId] = useState<number | null>(null);

  // Delivery Form State
  const [deliveryCompany, setDeliveryCompany] = useState("Zomato");
  const [delSelectedTenantId, setDelSelectedTenantId] = useState<string>("");
  const [isAwaitingDeliveryApproval, setIsAwaitingDeliveryApproval] = useState(false);
  const [pendingDelLogId, setPendingDelLogId] = useState<number | null>(null);
  
  // Parcel Logging State (Tenant chose Leave at Gate)
  const [showParcelLog, setShowParcelLog] = useState(false);
  const [parcelPhoto, setParcelPhoto] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Parcel Handover State
  const [selectedParcelForHandover, setSelectedParcelForHandover] = useState<any | null>(null);
  const [inputOtp, setInputOtp] = useState("");

  // Webcam Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

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
      // 1. Fetch Logs
      const { data: logs, error: logsError } = await supabase
        .from("visitor_logs")
        .select("*, tenants(*, users(*), rooms(*))")
        .eq("pg_id", Number(activePgId))
        .order("created_at", { ascending: false });
      if (logsError) throw logsError;
      setVisitorLogs(logs || []);

      // 2. Fetch Tenants
      const { data: residents } = await supabase
        .from("tenants")
        .select("*, users(*), rooms(*)")
        .eq("pg_id", Number(activePgId))
        .in("status", ["active", "notice"]);
      setTenants(residents || []);

      // 3. Fetch Parcels at Gate
      const { data: packages } = await supabase
        .from("parcels")
        .select("*, tenants(*, rooms(*))")
        .eq("pg_id", Number(activePgId))
        .order("id", { ascending: false });
      setParcels(packages || []);

      // 4. Fetch Staff
      const { data: workers } = await supabase
        .from("staff")
        .select("*")
        .eq("pg_id", Number(activePgId));
      setStaffList(workers || []);

    } catch (err: any) {
      console.error("Error fetching gate data:", err);
      setToastMessage("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activePgId]);

  // Handle pre-approved check-in
  const handleCheckIn = async (logId: number) => {
    const timeNow = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    try {
      const { error } = await supabase
        .from("visitor_logs")
        .update({
          entry_time: timeNow,
          status: "used",
          check_in_time: new Date().toISOString()
        })
        .eq("id", logId);

      if (error) throw error;
      setToastMessage("Visitor Checked-In successfully!");
      await fetchData();
    } catch (err: any) {
      setToastMessage("Check-in failed: " + err.message);
    }
  };

  // Handle check-out
  const handleCheckOut = async (logId: number) => {
    const timeNow = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    try {
      const { error } = await supabase
        .from("visitor_logs")
        .update({
          exit_time: timeNow,
          check_out_time: new Date().toISOString()
        })
        .eq("id", logId);

      if (error) throw error;
      setToastMessage("Visitor Checked-Out successfully!");
      await fetchData();
    } catch (err: any) {
      setToastMessage("Check-out failed: " + err.message);
    }
  };

  // Start Camera
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setToastMessage("Webcam not available");
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, 320, 240);
        const base64Photo = canvas.toDataURL("image/jpeg");
        setWalkinPhoto(base64Photo);
        setParcelPhoto(base64Photo);
        stopCamera();
      }
    }
  };

  // Setup Subscription for real-time approval check
  const subscribeToApproval = (logId: number, isDel: boolean = false) => {
    const channel = supabase
      .channel(`desk-approval-${logId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'visitor_logs',
          filter: `id=eq.${logId}`
        },
        async (payload) => {
          const updatedLog = payload.new;
          if (updatedLog.approval_status === 'approved') {
            setToastMessage("Resident Approved Entry!");
            // Auto check-in
            await handleCheckIn(logId);
            setIsAwaitingApproval(false);
            setIsAwaitingDeliveryApproval(false);
            channel.unsubscribe();
          } else if (updatedLog.approval_status === 'rejected') {
            setToastMessage("Resident Denied Access.");
            setIsAwaitingApproval(false);
            setIsAwaitingDeliveryApproval(false);
            channel.unsubscribe();
            await fetchData();
          } else if (updatedLog.approval_status === 'leave_at_gate') {
            setToastMessage("Resident requested: Leave at Gate.");
            setIsAwaitingDeliveryApproval(false);
            setShowParcelLog(true);
            channel.unsubscribe();
          }
        }
      )
      .subscribe();

    // Timeout fallback after 60 seconds
    setTimeout(async () => {
      channel.unsubscribe();
      setIsAwaitingApproval(false);
      setIsAwaitingDeliveryApproval(false);
    }, 60000);
  };

  // Submit Walk-in Guest Request
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !selectedTenantId || !activePgId) return;

    try {
      const token = `WALK-${walkinName.slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase
        .from("visitor_logs")
        .insert({
          pg_id: Number(activePgId),
          tenant_id: Number(selectedTenantId),
          visitor_name: walkinName,
          relationship: walkinPurpose,
          phone: walkinPhone,
          date: new Date().toISOString().split("T")[0],
          entry_time: "",
          exit_time: "",
          status: "approved",
          visitor_type: "guest",
          approval_status: "pending",
          photo_url: walkinPhoto,
          vehicle_number: vehicleNo,
          purpose: walkinPurpose
        })
        .select()
        .single();

      if (error) throw error;
      setPendingLogId(data.id);
      setIsAwaitingApproval(true);
      subscribeToApproval(data.id);

      // Reset fields
      setWalkinName("");
      setWalkinPhone("");
      setVehicleNo("");
      setWalkinPhoto(null);
    } catch (err: any) {
      setToastMessage("Walk-in registration failed: " + err.message);
    }
  };

  // Submit Delivery Request
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delSelectedTenantId || !activePgId) return;

    try {
      const token = `DEL-${deliveryCompany.slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data, error } = await supabase
        .from("visitor_logs")
        .insert({
          pg_id: Number(activePgId),
          tenant_id: Number(delSelectedTenantId),
          visitor_name: `${deliveryCompany} Delivery Agent`,
          relationship: "Delivery",
          phone: "",
          date: new Date().toISOString().split("T")[0],
          entry_time: "",
          exit_time: "",
          status: "approved",
          visitor_type: "delivery",
          approval_status: "pending",
          delivery_company: deliveryCompany,
          purpose: "Delivery"
        })
        .select()
        .single();

      if (error) throw error;
      setPendingDelLogId(data.id);
      setIsAwaitingDeliveryApproval(true);
      subscribeToApproval(data.id, true);
    } catch (err: any) {
      setToastMessage("Delivery registration failed: " + err.message);
    }
  };

  // Save Parcel left at gate
  const handleSaveParcel = async () => {
    if (!activePgId || !pendingDelLogId) return;
    try {
      // Fetch the log to get tenant details
      const { data: logData } = await supabase
        .from("visitor_logs")
        .select("tenant_id")
        .eq("id", pendingDelLogId)
        .single();

      if (!logData) return;

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const { error } = await supabase
        .from("parcels")
        .insert({
          pg_id: Number(activePgId),
          tenant_id: logData.tenant_id,
          delivery_company: deliveryCompany,
          parcel_photo_url: parcelPhoto,
          status: "at_gate",
          verification_otp: otp
        });

      if (error) throw error;
      setToastMessage(`Parcel Logged! Collection OTP sent to resident.`);
      setShowParcelLog(false);
      setParcelPhoto(null);
      setGeneratedOtp(null);
      setPendingDelLogId(null);
      setActiveTab('parcels');
      await fetchData();
    } catch (err: any) {
      setToastMessage("Parcel logging failed: " + err.message);
    }
  };

  // Handover parcel verification
  const handleParcelHandover = async () => {
    if (!selectedParcelForHandover) return;
    if (inputOtp.trim() !== selectedParcelForHandover.verification_otp) {
      setToastMessage("Invalid OTP! Handover denied.");
      return;
    }

    try {
      const { error } = await supabase
        .from("parcels")
        .update({
          status: "collected",
          collected_at: new Date().toISOString()
        })
        .eq("id", selectedParcelForHandover.id);

      if (error) throw error;
      setToastMessage("Parcel handed over successfully!");
      setSelectedParcelForHandover(null);
      setInputOtp("");
      await fetchData();
    } catch (err: any) {
      setToastMessage("Handover failed: " + err.message);
    }
  };

  // Clock in staff
  const handleStaffClockIn = async (staff: any) => {
    const timeNow = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    try {
      const { error: logError } = await supabase
        .from("visitor_logs")
        .insert({
          pg_id: Number(activePgId),
          visitor_name: staff.name,
          relationship: staff.role,
          phone: staff.phone,
          date: new Date().toISOString().split("T")[0],
          entry_time: timeNow,
          exit_time: "",
          status: "used",
          visitor_type: "daily_help",
          approval_status: "approved",
          qr_code_token: `STAFF-${staff.id}`
        });
      if (logError) throw logError;

      const { error: updateError } = await supabase
        .from("staff")
        .update({ status: "active" })
        .eq("id", staff.id);
      if (updateError) throw updateError;

      setToastMessage(`${staff.name} Clocked In!`);
      await fetchData();
    } catch (err: any) {
      setToastMessage("Clock In failed: " + err.message);
    }
  };

  // Clock out staff
  const handleStaffClockOut = async (staff: any) => {
    const timeNow = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
    try {
      // Find the active log entry
      const { data: activeLogs } = await supabase
        .from("visitor_logs")
        .select("id")
        .eq("pg_id", Number(activePgId))
        .eq("visitor_type", "daily_help")
        .eq("qr_code_token", `STAFF-${staff.id}`)
        .eq("exit_time", "")
        .order("id", { ascending: false });

      if (activeLogs && activeLogs.length > 0) {
        const { error: logError } = await supabase
          .from("visitor_logs")
          .update({ exit_time: timeNow })
          .eq("id", activeLogs[0].id);
        if (logError) throw logError;
      }

      const { error: updateError } = await supabase
        .from("staff")
        .update({ status: "inactive" })
        .eq("id", staff.id);
      if (updateError) throw updateError;

      setToastMessage(`${staff.name} Clocked Out!`);
      await fetchData();
    } catch (err: any) {
      setToastMessage("Clock Out failed: " + err.message);
    }
  };

  // Filtering lists
  const filteredLogs = visitorLogs.filter((log) => {
    const tenantName = log.tenants?.users?.name || log.tenants?.name || "";
    return (
      log.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.qr_code_token && log.qr_code_token.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="flex flex-col min-h-[100dvh] pb-28 bg-slate-50 relative overflow-hidden">
      {/* Toast notifications */}
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
            <Users className="size-6 text-amber-300" />
            Gate Control Desk
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 gap-2 mt-4 overflow-x-auto select-none no-scrollbar shrink-0">
        {[
          { id: 'logs', label: 'Check-Ins' },
          { id: 'walkin', label: 'Walk-In' },
          { id: 'delivery', label: 'Delivery' },
          { id: 'parcels', label: 'Parcels' },
          { id: 'staff', label: 'Daily Help' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border transition-all shrink-0 cursor-pointer ${
              activeTab === t.id
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-slate-200/60 text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Tab Area */}
      <div className="px-5 mt-4 flex-1 flex flex-col gap-4">
        
        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative bg-white rounded-2xl border border-slate-200/50 overflow-hidden flex items-center px-4 h-12 shrink-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search visitor, resident, or pass..."
                className="w-full h-full bg-transparent border-0 px-3 text-xs focus:outline-hidden font-semibold text-slate-700"
              />
            </div>

            {isLoading ? (
              <div className="flex-grow flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">No Active Entries</h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 mt-1">
                    Pre-approved passes or logs will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredLogs.map((log) => {
                  const residentName = log.tenants?.users?.name || log.tenants?.name || "Shared PG Help";
                  const roomNo = log.tenants?.rooms?.room_number ? `Room ${log.tenants.rooms.room_number}` : "";

                  const hasCheckedIn = log.entry_time !== "Pending" && log.entry_time !== "";
                  const hasCheckedOut = log.exit_time !== "Pending" && log.exit_time !== "";

                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-2xs flex flex-col gap-3 relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        hasCheckedOut ? "bg-slate-300" : hasCheckedIn ? "bg-blue-500" : "bg-emerald-500"
                      }`} />

                      <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-800 leading-none">
                              {log.visitor_name}
                            </span>
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border leading-none ${
                              hasCheckedOut
                                ? "bg-slate-100 border-slate-200 text-slate-500"
                                : hasCheckedIn
                                ? "bg-blue-50 border-blue-100 text-blue-600"
                                : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            }`}>
                              {hasCheckedOut ? "Checked Out" : hasCheckedIn ? "Checked In" : "Pending Check-In"}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold mt-1">Date: {log.date}</span>
                        </div>
                        {log.photo_url && (
                          <img
                            src={log.photo_url}
                            alt="Visitor"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-650">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase">Host / Room</span>
                          <div className="text-slate-800 truncate mt-0.5">{residentName}</div>
                          {roomNo && <div className="text-[9px] text-slate-500 mt-0.5">{roomNo}</div>}
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase">Details</span>
                          <div className="text-slate-800 truncate mt-0.5">{log.relationship}</div>
                          {log.phone && <div className="text-[9px] text-slate-500 mt-0.5">{log.phone}</div>}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 pt-1">
                        <span>In: <strong className="text-slate-755">{log.entry_time || "Pending"}</strong></span>
                        <span>Out: <strong className="text-slate-755">{log.exit_time || "Pending"}</strong></span>
                      </div>

                      <div className="flex gap-2 justify-end pt-1 select-none">
                        {!hasCheckedIn && (
                          <button
                            onClick={() => handleCheckIn(log.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Check-In Guest
                          </button>
                        )}
                        {hasCheckedIn && !hasCheckedOut && (
                          <button
                            onClick={() => handleCheckOut(log.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Check-Out Guest
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WALK-IN TAB */}
        {activeTab === 'walkin' && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/50 shadow-2xs select-none">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4">Register Unexpected Visitor</h3>
            <form onSubmit={handleWalkinSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Phone Number</label>
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="9988776655"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="KA-03-MX-1234"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Purpose of Visit</label>
                <select
                  value={walkinPurpose}
                  onChange={(e) => setWalkinPurpose(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold bg-transparent focus:outline-emerald-500"
                >
                  <option value="Personal">Personal Visit</option>
                  <option value="Maintenance">Room Repair / Maintenance</option>
                  <option value="Delivery">Delivery Delivery</option>
                  <option value="Inspection">PG Inspection</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Target Host Resident</label>
                <select
                  required
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold bg-transparent focus:outline-emerald-500"
                >
                  <option value="">-- Choose Host Resident --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.users?.name || t.name} ({t.rooms?.room_number ? `Room ${t.rooms.room_number}` : "Unassigned"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Camera Capture Section */}
              <div className="flex flex-col gap-2 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verify Photo Capture</span>
                {isCameraActive ? (
                  <div className="w-full flex flex-col gap-2 items-center">
                    <video ref={videoRef} autoPlay playsInline className="w-48 h-36 rounded-xl object-cover bg-slate-900 border border-slate-350" />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="size-3.5" /> Capture Snapshot
                    </button>
                  </div>
                ) : walkinPhoto ? (
                  <div className="flex flex-col gap-2 items-center">
                    <img src={walkinPhoto} alt="Captured" className="w-48 h-36 rounded-xl object-cover border border-slate-300" />
                    <button
                      type="button"
                      onClick={() => setWalkinPhoto(null)}
                      className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold cursor-pointer"
                    >
                      Retake Snapshot
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="size-3.5" /> Initialize Gate Camera
                  </button>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer mt-2"
              >
                Send Approval Request to Resident
              </button>
            </form>
          </div>
        )}

        {/* DELIVERY TAB */}
        {activeTab === 'delivery' && (
          <div className="flex flex-col gap-4 select-none">
            {/* Resident approval dialog overlay */}
            <AnimatePresence>
              {isAwaitingDeliveryApproval && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin flex items-center justify-center" />
                    <h4 className="font-extrabold text-slate-900 text-sm">Awaiting Resident Approval...</h4>
                    <p className="text-[10px] text-slate-500 max-w-[200px]">
                      We pinged the resident inside PG Connect. You will be notified instantly when they respond.
                    </p>
                    <button
                      onClick={() => setIsAwaitingDeliveryApproval(false)}
                      className="mt-2 text-rose-500 font-bold text-[10px] uppercase hover:underline"
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* Leave at Gate logging step */}
            <AnimatePresence>
              {showParcelLog && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-slate-100 flex flex-col gap-4 text-slate-800 text-left">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-extrabold text-slate-950 text-sm">Resident Requested: Leave at Gate</h4>
                      <X className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setShowParcelLog(false)} />
                    </div>
                    <p className="text-xs text-slate-500">
                      The resident cannot pick up the delivery now. Take a photo of the package to log it into the gate inventory.
                    </p>

                    {/* Camera */}
                    <div className="flex flex-col gap-2 items-center bg-slate-50 p-4 rounded-xl border">
                      {isCameraActive ? (
                        <>
                          <video ref={videoRef} autoPlay playsInline className="w-48 h-36 rounded-xl object-cover bg-slate-900" />
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Camera className="size-3.5" /> Capture Package
                          </button>
                        </>
                      ) : parcelPhoto ? (
                        <>
                          <img src={parcelPhoto} alt="Parcel" className="w-48 h-36 rounded-xl object-cover" />
                          <button
                            type="button"
                            onClick={() => setParcelPhoto(null)}
                            className="px-4 py-2 bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold cursor-pointer"
                          >
                            Retake Photo
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="size-3.5" /> Start Parcel Camera
                        </button>
                      )}
                    </div>

                    <button
                      onClick={handleSaveParcel}
                      disabled={!parcelPhoto}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Store Parcel in Gate Inventory
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl p-5 border border-slate-205/50 shadow-2xs">
              <h3 className="font-extrabold text-slate-800 text-sm mb-4">Delivery Quick Register</h3>
              <form onSubmit={handleDeliverySubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">Select Delivery Partner</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Zomato', 'Swiggy', 'Amazon', 'Flipkart', 'Dunzo', 'BlueDart'].map(comp => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => setDeliveryCompany(comp)}
                        className={`py-3.5 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                          deliveryCompany === comp
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-350 text-slate-700'
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Target Host Resident</label>
                  <select
                    required
                    value={delSelectedTenantId}
                    onChange={(e) => setDelSelectedTenantId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-semibold bg-transparent focus:outline-emerald-500"
                  >
                    <option value="">-- Choose Host Resident --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.users?.name || t.name} ({t.rooms?.room_number ? `Room ${t.rooms.room_number}` : "Unassigned"})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer mt-2"
                >
                  Send Delivery Ping to Resident
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PARCELS TAB */}
        {activeTab === 'parcels' && (
          <div className="flex-1 flex flex-col gap-4 select-none">
            {/* OTP Verify Modal */}
            <AnimatePresence>
              {selectedParcelForHandover && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-slate-100 flex flex-col gap-4 text-left text-slate-800">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-extrabold text-slate-950 text-sm">Verify Handover OTP</h4>
                      <X className="w-5 h-5 text-slate-400 cursor-pointer" onClick={() => setSelectedParcelForHandover(null)} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Enter the 4-digit verification code provided by the resident in their PG Connect app.
                    </p>
                    <input
                      type="text"
                      maxLength={4}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      placeholder="e.g. 4820"
                      className="w-full text-center border-2 border-slate-200 rounded-xl p-3 text-lg font-black tracking-widest focus:outline-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      onClick={handleParcelHandover}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Verify Code & Hand Over
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center select-none px-0.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gate Parcels Inventory</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {parcels.filter(p => p.status === 'at_gate').length} Active Parcels
              </span>
            </div>

            {parcels.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Inventory Empty</h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 mt-1">
                    No delivery packages are stored at the gate.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {parcels.map((p) => {
                  const hostName = p.tenants?.users?.name || p.tenants?.name || "Shared PG";
                  const room = p.tenants?.rooms?.room_number ? `Room ${p.tenants.rooms.room_number}` : "";
                  const isPendingHandover = p.status === 'at_gate';

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-2xs flex flex-col gap-3.5 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 leading-none">{p.delivery_company} Package</h4>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1.5 inline-block ${
                            p.status === 'collected'
                              ? 'bg-slate-100 border-slate-200 text-slate-500'
                              : 'bg-amber-50 border-amber-100 text-amber-600'
                          }`}>
                            {p.status === 'collected' ? 'Collected' : 'At Gate'}
                          </span>
                        </div>
                        {p.parcel_photo_url && (
                          <img src={p.parcel_photo_url} alt="Package" className="w-14 h-14 rounded-lg object-cover border shrink-0" />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-600">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase">Resident Host</span>
                          <div className="text-slate-850 mt-0.5 truncate">{hostName}</div>
                          {room && <div className="text-[9px] text-slate-500 mt-0.5">{room}</div>}
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase">Received At</span>
                          <div className="text-slate-850 mt-0.5">{new Date(p.received_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{new Date(p.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>

                      {isPendingHandover ? (
                        <button
                          onClick={() => {
                            setSelectedParcelForHandover(p);
                            setInputOtp("");
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Verify Handover OTP
                        </button>
                      ) : (
                        <div className="text-right text-[10px] text-emerald-600 font-extrabold flex items-center justify-end gap-1 select-none">
                          <CheckCircle className="size-4 shrink-0" /> Handed Over
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STAFF / DAILY HELP TAB */}
        {activeTab === 'staff' && (
          <div className="flex-grow flex flex-col gap-4 select-none">
            <div className="flex justify-between items-center select-none px-0.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Daily Helper Clock</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {staffList.filter(s => s.status === 'active').length} Clocked In
              </span>
            </div>

            {staffList.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <Users2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">No Staff Registered</h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 mt-1">
                    Manage property helpers in staff configuration first.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {staffList.map((staff) => {
                  const isClockedIn = staff.status === 'active';
                  return (
                    <div
                      key={staff.id}
                      className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-2xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {staff.photo ? (
                          <img src={staff.photo} alt={staff.name} className="w-10 h-10 rounded-full object-cover shrink-0 border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border">
                            <Users2 className="size-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-850 truncate">{staff.name}</h4>
                          <span className="text-[9px] text-slate-500 font-bold block">{staff.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`${
                          isClockedIn ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        } border-transparent text-[8.5px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded-full`}>
                          {isClockedIn ? 'Inside' : 'Out'}
                        </span>

                        {isClockedIn ? (
                          <button
                            onClick={() => handleStaffClockOut(staff)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Clock Out
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStaffClockIn(staff)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Clock In
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Awaiting resident walkin modal */}
      <AnimatePresence>
        {isAwaitingApproval && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-3xl max-w-sm w-full border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin flex items-center justify-center" />
              <h4 className="font-extrabold text-slate-900 text-sm">Awaiting Resident Approval...</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                A real-time prompt has been sent to the resident's device inside PG Connect. Access updates will show immediately.
              </p>
              <button
                onClick={() => setIsAwaitingApproval(false)}
                className="mt-2 text-rose-500 font-bold text-[10px] uppercase hover:underline"
              >
                Cancel Request
              </button>
            </div>
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
