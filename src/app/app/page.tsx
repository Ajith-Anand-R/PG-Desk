"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Bed, 
  HelpCircle, 
  X, 
  User, 
  Building, 
  Building2, 
  Landmark, 
  Settings, 
  Wallet, 
  Gift, 
  FileText, 
  Crown, 
  LogOut, 
  Home as HomeIcon, 
  QrCode 
} from "lucide-react";
import { MobileFrame } from "@/components/ui/mobile-frame";
import { DashboardView } from "@/components/dashboard-view";
import { LoginView } from "@/components/login-view";
import { RegisterView } from "@/components/register-view";
import { RoomsView } from "@/components/rooms-view";
import { SupportView } from "@/components/support-view";
import { PropertySelector, Property } from "@/components/property-selector";
import { CreatePropertyView } from "@/components/create-property-view";
import { ProfileView } from "@/components/profile-view";
import { SettingsView } from "@/components/settings-view";
import { ViewProfileView } from "@/components/view-profile-view";
import { BankDetailsView, BankDetails } from "@/components/bank-details-view";
import { WalletView, Transaction } from "@/components/wallet-view";
import { ReferralView } from "@/components/referral-view";
import { TenantTermsView } from "@/components/tenant-terms-view";
import { SubscriptionView } from "@/components/subscription-view";
import { ChangePasswordView } from "@/components/change-password-view";
import { PropertyQrModal } from "@/components/property-qr-modal";
import { NotificationsView } from "@/components/notifications-view";
import { RemindersView } from "@/components/reminders-view";
import { BillsView } from "@/components/bills-view";
import { StaffView } from "@/components/staff-view";
import { ReceiptsView, DueItem, ReceiptItem } from "@/components/receipts-view";
import { Room, Tenant } from "@/lib/types";
import { supabase } from "@/lib/supabase";

type ViewType = "dashboard" | "rooms" | "support" | "create-property" | "profile" | "settings" | "view-profile" | "bank-details" | "wallet" | "referral" | "tenant-terms" | "subscription" | "change-password" | "notifications" | "reminders" | "bills" | "staff" | "receipts";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isPropertySelectorOpen, setIsPropertySelectorOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState("Loading...");
  const [showSplash, setShowSplash] = useState(true);
  const [receiptsInitialTab, setReceiptsInitialTab] = useState<"dues" | "receipts">("receipts");

  // Shared properties database state
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  // Modal display toggles
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
    phone: "",
    photo: null as string | null
  });

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    upiName: "",
    upiNumber: "",
    upiRegisteredName: "",
    upiId: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    branchName: ""
  });

  const [walletPoints, setWalletPoints] = useState(1250);
  const [walletRedeemed, setWalletRedeemed] = useState(350);
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>([
    { id: "tx_1", title: "Referral Bonus", date: "Jun 5, 2026", points: 500, type: "earn" },
    { id: "tx_2", title: "Rent Payment Cashback", date: "Jun 1, 2026", points: 150, type: "earn" },
    { id: "tx_3", title: "Early Bird Discount", date: "May 28, 2026", points: 100, type: "earn" },
    { id: "tx_4", title: "Redeemed Rent Discount", date: "May 15, 2026", points: 350, type: "redeem" }
  ]);

  // Auto-hide toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // New Tenant form state
  const [tenantName, setTenantName] = useState("");
  const [tenantRoomId, setTenantRoomId] = useState("");
  const [tenantRent, setTenantRent] = useState("");

  // New Room form state
  const [roomName, setRoomName] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("3");

  // Load session and user data from Supabase
  const fetchPgData = async (pgId: number | string) => {
    // 1. Fetch Rooms & Beds
    const { data: roomsList } = await supabase
      .from("rooms")
      .select("*, beds(*)")
      .eq("pg_id", pgId);

    if (roomsList) {
      const formattedRooms = roomsList.map((r: any) => ({
        id: String(r.id),
        name: r.room_number,
        floor: r.floor,
        capacity: r.capacity,
        beds: (r.beds || [])
          .sort((a: any, b: any) => a.bed_number.localeCompare(b.bed_number))
          .map((b: any) => b.status as "available" | "occupied")
      }));
      setRooms(formattedRooms);
    }

    // 2. Fetch Tenants
    const { data: tenantsList } = await supabase
      .from("tenants")
      .select("*, users(*), rooms(*)")
      .eq("pg_id", pgId)
      .eq("status", "active");

    if (tenantsList) {
      const formattedTenants = tenantsList.map((t: any) => ({
        id: String(t.id),
        name: t.users?.name || "Unknown Tenant",
        roomName: t.rooms?.room_number || "Unassigned",
        rentAmount: Number(t.rooms?.rent || 0),
        status: t.status as "active" | "left"
      }));
      setTenants(formattedTenants);
    }

    // 3. Fetch PG details & bank details
    const { data: pgDetails } = await supabase
      .from("pgs")
      .select("*")
      .eq("id", pgId)
      .single();

    if (pgDetails) {
      setBankDetails({
        upiName: pgDetails.upi_name || "",
        upiNumber: pgDetails.upi_number || "",
        upiRegisteredName: pgDetails.upi_registered_name || "",
        upiId: pgDetails.upi_id || "",
        accountHolderName: pgDetails.account_holder_name || "",
        accountNumber: pgDetails.account_number || "",
        ifscCode: pgDetails.ifsc_code || "",
        branchName: pgDetails.branch_name || ""
      });
    }

    // 4. Fetch Payments Dues & Receipts
    const { data: paymentsList } = await supabase
      .from("payments")
      .select("*, tenants(*, users(*), rooms(*))")
      .eq("pg_id", pgId);

    if (paymentsList) {
      setPayments(paymentsList);
    } else {
      setPayments([]);
    }

    // 5. Fetch Complaints
    const { data: complaintsList } = await supabase
      .from("complaints")
      .select("*, tenants(*, users(*), rooms(*))")
      .eq("pg_id", pgId)
      .order("created_at", { ascending: false });

    if (complaintsList) {
      setComplaints(complaintsList);
    } else {
      setComplaints([]);
    }

    // 6. Fetch Notices
    const { data: noticesList } = await supabase
      .from("notices")
      .select("*")
      .eq("pg_id", pgId)
      .order("created_at", { ascending: false });

    if (noticesList) {
      setNotices(noticesList);
    } else {
      setNotices([]);
    }
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLoggedIn(true);
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUser({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || "",
          photo: profile.photo || null
        });

        // Fetch properties list for this Owner
        const { data: pgsList } = await supabase
          .from("pgs")
          .select("*")
          .eq("owner_id", session.user.id);

        if (pgsList && pgsList.length > 0) {
          setProperties(pgsList.map(p => ({ name: p.name, code: String(p.id) })));
          
          let activePg = pgsList.find(p => p.id === profile.pg_id);
          if (!activePg) {
            activePg = pgsList[0];
            await supabase
              .from("users")
              .update({ pg_id: activePg.id })
              .eq("id", session.user.id);
          }
          setCurrentProperty(activePg.name);
          await fetchPgData(activePg.id);
        } else {
          setProperties([]);
          setCurrentProperty("");
          setRooms([]);
          setTenants([]);
          setPayments([]);
          setCurrentView("create-property");
        }
      }
    } else {
      setIsLoggedIn(false);
    }
    setShowSplash(false);
  };

  useEffect(() => {
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setUser({
            name: profile.name,
            email: profile.email,
            phone: profile.phone || "",
            photo: profile.photo || null
          });
          const { data: pgsList } = await supabase
            .from("pgs")
            .select("*")
            .eq("owner_id", session.user.id);
          if (pgsList && pgsList.length > 0) {
            setProperties(pgsList.map(p => ({ name: p.name, code: String(p.id) })));
            const activePg = pgsList.find(p => p.id === profile.pg_id) || pgsList[0];
            setCurrentProperty(activePg.name);
            await fetchPgData(activePg.id);
          }
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSelectProperty = async (name: string) => {
    setCurrentProperty(name);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    const { data: pgsList } = await supabase
      .from("pgs")
      .select("*")
      .eq("owner_id", session.user.id);
      
    if (pgsList) {
      const selectedPg = pgsList.find(p => p.name === name);
      if (selectedPg) {
        await supabase
          .from("users")
          .update({ pg_id: selectedPg.id })
          .eq("id", session.user.id);
        
        await fetchPgData(selectedPg.id);
        setToastMessage(`Switched to property "${name}"`);
      }
    }
  };

  const handleAddProperty = async (name: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // 1. Insert PG
    const { data: newPg, error: pgError } = await supabase
      .from("pgs")
      .insert({
        name,
        address: "Address",
        owner_id: session.user.id,
        phone: user.phone || "+91 99887 76655",
        subscription_plan: "free"
      })
      .select()
      .single();

    if (pgError) {
      setToastMessage(pgError.message);
      return;
    }

    // 2. Set active pg_id
    await supabase
      .from("users")
      .update({ pg_id: newPg.id })
      .eq("id", session.user.id);

    // 3. Reload properties
    const { data: pgsList } = await supabase
      .from("pgs")
      .select("*")
      .eq("owner_id", session.user.id);

    if (pgsList) {
      setProperties(pgsList.map(p => ({ name: p.name, code: String(p.id) })));
      setCurrentProperty(newPg.name);
      await fetchPgData(newPg.id);
      setToastMessage(`Property "${name}" created successfully!`);
    }
  };

  const handleCreateProperty = (name: string) => {
    handleAddProperty(name);
    setCurrentView("dashboard");
  };

  // Shared state dynamic computations
  const activePgId = properties.find((p) => p.name === currentProperty)?.code;
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBedsCount = rooms.reduce(
    (acc, r) => acc + r.beds.filter((status) => status === "occupied").length,
    0
  );
  const availableBedsCount = totalBeds - occupiedBedsCount;

  const activeTenantsCount = tenants.filter((t) => t.status === "active").length;
  const leftTenantsCount = tenants.filter((t) => t.status === "left").length;

  const collectedAmountSum = payments
    .filter((p) => p.status === "paid")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const pendingDuesAmount = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const pendingDuesCount = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .length;

  const duesList: DueItem[] = payments
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .map((p) => ({
      id: String(p.id),
      tenantName: p.tenants?.users?.name || "Unknown",
      roomName: p.tenants?.rooms?.room_number || "Unassigned",
      amount: Number(p.amount),
      dueDate: p.due_date ? new Date(p.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "N/A",
      status: p.status as "pending" | "overdue"
    }));

  const receiptsList: ReceiptItem[] = payments
    .filter((p) => p.status === "paid")
    .map((p) => ({
      id: String(p.id),
      tenantName: p.tenants?.users?.name || "Unknown",
      roomName: p.tenants?.rooms?.room_number || "Unassigned",
      amount: Number(p.amount),
      date: p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "N/A",
      refCode: p.reference_code || "UPI Payment",
      paymentMethod: p.payment_method || "UPI"
    }));

  // Bed status toggling callback
  const handleToggleBed = async (roomId: string, bedIndex: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("pg_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.pg_id) return;

    const { data: bedsList } = await supabase
      .from("beds")
      .select("*")
      .eq("room_id", roomId)
      .order("bed_number", { ascending: true });

    if (bedsList && bedsList[bedIndex]) {
      const targetBed = bedsList[bedIndex];
      const newStatus = targetBed.status === "available" ? "occupied" : "available";
      
      await supabase
        .from("beds")
        .update({ status: newStatus })
        .eq("id", targetBed.id);

      await fetchPgData(profile.pg_id);
    }
  };

  // Add a tenant submission handler
  const handleAddTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !tenantRoomId || !tenantRent) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("pg_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.pg_id) {
      setToastMessage("Please select or create a property first.");
      return;
    }

    const pgId = profile.pg_id;

    // Fetch the room details
    const { data: roomDetails } = await supabase
      .from("rooms")
      .select("*, beds(*)")
      .eq("id", tenantRoomId)
      .single();

    if (!roomDetails) return;

    const availableBed = (roomDetails.beds || []).find((b: any) => b.status === "available");
    if (!availableBed) {
      alert("This room is already at full capacity!");
      return;
    }

    // 1. Create a dummy tenant user profile
    const tenantUserId = crypto.randomUUID();
    const { error: userError } = await supabase.from("users").insert({
      id: tenantUserId,
      name: tenantName.trim(),
      email: `${tenantName.toLowerCase().replace(/\s+/g, "")}@placeholder.com`,
      role: "Tenant",
      pg_id: pgId
    });

    if (userError) {
      setToastMessage(userError.message);
      return;
    }

    // 2. Create tenant record
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        pg_id: pgId,
        user_id: tenantUserId,
        room_id: tenantRoomId,
        bed_id: availableBed.id,
        deposit: Number(tenantRent),
        status: "active"
      })
      .select()
      .single();

    if (tenantError) {
      setToastMessage(tenantError.message);
      return;
    }

    // 3. Mark the bed as occupied
    await supabase
      .from("beds")
      .update({ status: "occupied" })
      .eq("id", availableBed.id);

    // 4. Create an initial pending payment due
    await supabase.from("payments").insert({
      tenant_id: tenant.id,
      pg_id: pgId,
      amount: Number(tenantRent),
      month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      status: "pending",
      due_date: new Date().toISOString().split("T")[0]
    });

    await fetchPgData(pgId);

    // Reset Form & Close
    setTenantName("");
    setTenantRoomId("");
    setTenantRent("");
    setIsAddTenantOpen(false);
    setToastMessage(`Tenant "${tenantName}" boarded successfully!`);
  };

  // Add a room submission handler
  const handleAddRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !roomFloor || !roomCapacity) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("pg_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.pg_id) {
      setToastMessage("Please select or create a property first.");
      return;
    }

    const pgId = profile.pg_id;
    const capacity = Number(roomCapacity);
    // Hardcode basic rent for V1, or we can prompt for it
    const rent = 7000;

    // 1. Insert room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        pg_id: pgId,
        room_number: roomName.trim(),
        floor: Number(roomFloor),
        capacity,
        rent,
        status: "available"
      })
      .select()
      .single();

    if (roomError) {
      setToastMessage(roomError.message);
      return;
    }

    // 2. Insert beds
    for (let i = 1; i <= capacity; i++) {
      await supabase.from("beds").insert({
        room_id: room.id,
        bed_number: `Bed ${i}`,
        status: "available"
      });
    }

    await fetchPgData(pgId);

    // Reset Form & Close
    setRoomName("");
    setRoomFloor("");
    setRoomCapacity("3");
    setIsAddRoomOpen(false);
    setToastMessage(`Room "${roomName}" added successfully!`);
  };

  const handleCollectRent = async (dueId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("pg_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.pg_id) return;

    const { error } = await supabase
      .from("payments")
      .update({
        status: "paid",
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "UPI",
        reference_code: `TXN-${crypto.randomUUID().substring(0, 8).toUpperCase()}`
      })
      .eq("id", dueId);

    if (error) {
      setToastMessage(error.message);
    } else {
      setToastMessage("Rent collected successfully!");
      await fetchPgData(profile.pg_id);
    }
  };

  const handleUpdateComplaintStatus = async (complaintId: string, newStatus: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("pg_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.pg_id) return;

    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", Number(complaintId));

    if (error) {
      setToastMessage(error.message);
    } else {
      setToastMessage("Complaint status updated successfully!");
      await fetchPgData(profile.pg_id);
    }
  };

  const handleCreateNotice = async (title: string, message: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("pg_id")
      .eq("id", session.user.id)
      .single();

    if (!profile?.pg_id) return;

    const { error } = await supabase
      .from("notices")
      .insert({
        pg_id: profile.pg_id,
        title: title.trim(),
        message: message.trim()
      });

    if (error) {
      setToastMessage(error.message);
    } else {
      setToastMessage("Notice posted successfully!");
      await fetchPgData(profile.pg_id);
    }
  };

  // List of rooms that have at least one empty bed
  const availableRooms = rooms.filter((r) => r.beds.includes("available"));

  return (
    <MobileFrame
      bottomNav={
        !showSplash && isLoggedIn && ["dashboard", "rooms", "support", "profile"].includes(currentView) && (
          <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-100/80 px-6 py-4 flex items-center justify-around z-30 shadow-lg shadow-slate-200/40">
            <TabButton
              active={currentView === "dashboard"}
              label="Dashboard"
              icon={LayoutDashboard}
              onClick={() => setCurrentView("dashboard")}
            />
            <TabButton
              active={currentView === "rooms"}
              label="Rooms"
              icon={Bed}
              onClick={() => setCurrentView("rooms")}
            />
            <TabButton
              active={currentView === "support"}
              label="Support"
              icon={HelpCircle}
              onClick={() => setCurrentView("support")}
            />
          </div>
        )
      }
      drawer={
        <>
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 border border-slate-850"
              >
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Side Drawer Portal/Overlay */}
          <AnimatePresence>
            {isDrawerOpen && (
              <div className="absolute inset-0 z-50 flex overflow-hidden">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsDrawerOpen(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs z-10"
                />

                {/* Slide-out Drawer Panel */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute left-0 top-0 bottom-0 w-[290px] bg-white z-20 shadow-2xl flex flex-col h-full overflow-hidden border-r border-slate-100"
                >
                  {/* Header Box */}
                  <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-800 font-bold text-base truncate">{currentProperty}</span>
                        <span className="text-slate-400 font-semibold text-[10px] tracking-tight truncate">Code: BVBQEEXU</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { 
                        setIsDrawerOpen(false); 
                        setIsQrModalOpen(true); 
                      }} 
                      className="w-10 h-10 border border-slate-200/80 rounded-xl flex items-center justify-center bg-white shadow-xs shrink-0 cursor-pointer hover:bg-slate-50 active:scale-95 transition-transform"
                    >
                      <QrCode className="w-5 h-5 text-emerald-600" />
                    </button>
                  </div>

                  {/* Drawer Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 no-scrollbar">
                    {/* DASHBOARD Section */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] font-bold tracking-wider px-3 uppercase">Dashboard</span>
                      <DrawerItem 
                        label="Dashboard" 
                        icon={HomeIcon} 
                        active={currentView === "dashboard"} 
                        onClick={() => {
                          setCurrentView("dashboard");
                          setIsDrawerOpen(false);
                        }} 
                      />
                      <DrawerItem 
                        label="Create Property" 
                        icon={Building} 
                        onClick={() => {
                          setCurrentView("create-property");
                          setIsDrawerOpen(false);
                        }} 
                      />
                    </div>

                    {/* ACCOUNT Section */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] font-bold tracking-wider px-3 uppercase">Account</span>
                      <DrawerItem 
                        label="Profile" 
                        icon={User} 
                        onClick={() => {
                          setCurrentView("profile");
                          setIsDrawerOpen(false);
                        }} 
                      />
                      <DrawerItem 
                        label="Property Details" 
                        icon={Building2} 
                        onClick={() => {
                          setIsDrawerOpen(false);
                          setToastMessage("Property details opened!");
                        }} 
                      />
                      <DrawerItem 
                        label="Bank Details" 
                        icon={Landmark} 
                        onClick={() => {
                          setCurrentView("bank-details");
                          setIsDrawerOpen(false);
                        }} 
                      />
                      <DrawerItem 
                        label="Settings" 
                        icon={Settings} 
                        onClick={() => {
                          setCurrentView("settings");
                          setIsDrawerOpen(false);
                        }} 
                      />
                      <DrawerItem 
                        label="Wallet" 
                        icon={Wallet} 
                        onClick={() => {
                          setCurrentView("wallet");
                          setIsDrawerOpen(false);
                        }} 
                      />
                      <DrawerItem 
                        label="Referrals" 
                        icon={Gift} 
                        onClick={() => {
                          setCurrentView("referral");
                          setIsDrawerOpen(false);
                        }} 
                      />
                      <DrawerItem 
                        label="Tenant Terms" 
                        icon={FileText} 
                        onClick={() => {
                          setCurrentView("tenant-terms");
                          setIsDrawerOpen(false);
                        }} 
                      />
                    </div>

                    {/* UPGRADE PLAN Section */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] font-bold tracking-wider px-3 uppercase">Upgrade Plan</span>
                      <DrawerItem 
                        label="Subscription" 
                        icon={Crown} 
                        variant="orange"
                        active={currentView === "subscription"}
                        onClick={() => {
                          setCurrentView("subscription");
                          setIsDrawerOpen(false);
                        }} 
                      />
                    </div>

                    {/* HELP & SUPPORT Section */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] font-bold tracking-wider px-3 uppercase">Help & Support</span>
                      <DrawerItem 
                        label="Support" 
                        icon={HelpCircle} 
                        active={currentView === "support"} 
                        onClick={() => {
                          setCurrentView("support");
                          setIsDrawerOpen(false);
                        }} 
                      />
                    </div>

                    {/* USER PROFILE Info Card */}
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl mt-auto shrink-0 select-none">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-emerald-100 flex items-center justify-center relative">
                        {user.photo ? (
                          <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{user.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400 truncate">{user.phone}</span>
                      </div>
                    </div>

                    {/* OTHER Section */}
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                      <span className="text-slate-400 text-[10px] font-bold tracking-wider px-3 uppercase">Other</span>
                      <DrawerItem 
                        label="Logout" 
                        icon={LogOut} 
                        variant="red"
                        onClick={async () => {
                          setIsDrawerOpen(false);
                          setToastMessage("Logging out...");
                          await supabase.auth.signOut();
                          setIsLoggedIn(false);
                        }} 
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      }
    >
      <AnimatePresence mode="wait">
        {showSplash ? (
          /* Splash Screen Branding */
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-radial from-slate-900 to-slate-950 flex flex-col items-center justify-center text-white z-50 px-6"
          >
            {/* Logo Graphic */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="relative w-32 h-32 mb-6"
            >
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="100" cy="100" r="80" fill="url(#logoGrad)" className="drop-shadow-lg" />
                <path
                  d="M100 45 L50 85 V140 H150 V85 Z"
                  stroke="#ffffff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M90 140 V105 H110 V140"
                  stroke="#38bdf8"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M100 110 H130 M130 110 V120 M124 110 V120 M85 110 C85 101.7 91.7 95 100 95 C108.3 95 115 101.7 115 110 C115 118.3 108.3 125 100 125"
                  stroke="#fbbf24"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M50 145 C65 145 75 140 85 125 L125 70"
                  stroke="#34d399"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M110 70 H125 V85"
                  stroke="#34d399"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="logoGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f46e5" />
                    <stop offset="1" stopColor="#0f172a" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            <motion.h2
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
              className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 font-sans"
            >
              PG Desk
            </motion.h2>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
              className="text-[10px] text-slate-400/90 font-bold uppercase tracking-widest mt-2"
            >
              Accommodation Management
            </motion.p>
          </motion.div>
        ) : !isLoggedIn ? (
          /* Authentication Screens (Login / Register) */
          authMode === "login" ? (
            <LoginView 
              onLogin={() => setIsLoggedIn(true)} 
              onRegisterClick={() => setAuthMode("register")}
            />
          ) : (
            <RegisterView
              onLoginClick={() => setAuthMode("login")}
              onRegisterSuccess={(userData) => {
                setUser({
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  photo: userData.photo,
                });
                setIsLoggedIn(true);
              }}
            />
          )
        ) : (
          /* Main Screen Views */
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            {currentView === "dashboard" && (
              <DashboardView
                onOpenPropertySelector={() => setIsPropertySelectorOpen(true)}
                onNavigateToRooms={() => setCurrentView("rooms")}
                onNavigateToSupport={() => setCurrentView("support")}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                onNavigateToBills={() => setCurrentView("bills")}
                onNavigateToReminders={() => setCurrentView("reminders")}
                onNavigateToStaff={() => setCurrentView("staff")}
                onNavigateToReceipts={(tab) => {
                  setReceiptsInitialTab(tab);
                  setCurrentView("receipts");
                }}
                pendingDuesAmount={pendingDuesAmount}
                pendingDuesCount={pendingDuesCount}
                onMenuClick={() => setIsDrawerOpen(true)}
                currentProperty={currentProperty}
                roomsCount={rooms.length}
                availableBeds={availableBedsCount}
                occupiedBeds={occupiedBedsCount}
                activeTenants={activeTenantsCount}
                leftTenants={leftTenantsCount}
                collectedAmount={collectedAmountSum}
                onAddTenantClick={() => setIsAddTenantOpen(true)}
                onAddRoomClick={() => setIsAddRoomOpen(true)}
                payments={payments}
              />
            )}

            {currentView === "rooms" && (
              <RoomsView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                rooms={rooms}
                onToggleBed={handleToggleBed}
                onAddRoomClick={() => setIsAddRoomOpen(true)}
              />
            )}

            {currentView === "support" && (
              <SupportView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                onOpenPropertySelector={() => setIsPropertySelectorOpen(true)}
                onMenuClick={() => setIsDrawerOpen(true)}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                complaints={complaints}
                notices={notices}
                onUpdateComplaintStatus={handleUpdateComplaintStatus}
                onCreateNotice={handleCreateNotice}
              />
            )}

            {currentView === "create-property" && (
              <CreatePropertyView
                onBack={() => setCurrentView("dashboard")}
                userEmail={user.email}
                userPhone={user.phone}
                onCreateProperty={handleCreateProperty}
                onMenuClick={() => setIsDrawerOpen(true)}
              />
            )}

            {currentView === "profile" && (
              <ProfileView
                onBack={() => setCurrentView("dashboard")}
                onNavigateToSupport={() => setCurrentView("support")}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                userName={user.name}
                userEmail={user.email}
                userPhone={user.phone}
                userPhoto={user.photo}
                currentProperty={currentProperty}
                propertiesCount={properties.length}
                tenantsCount={activeTenantsCount}
                roomsCount={rooms.length}
                onOpenSettings={() => setCurrentView("settings")}
                onViewProfileDetails={() => setCurrentView("view-profile")}
                onMenuClick={() => setIsDrawerOpen(true)}
                onLogout={() => {
                  setIsLoggedIn(false);
                  setCurrentView("dashboard");
                }}
              />
            )}

            {currentView === "settings" && (
              <SettingsView
                onBack={() => setCurrentView("profile")}
                onNavigateToProfile={() => setCurrentView("profile")}
                onNavigateToViewProfile={() => setCurrentView("view-profile")}
                onNavigateToSupport={() => setCurrentView("support")}
                onLogout={() => {
                  setIsLoggedIn(false);
                  setCurrentView("dashboard");
                }}
                onChangePasswordClick={() => setCurrentView("change-password")}
                onMenuClick={() => setIsDrawerOpen(true)}
                onNavigateToNotifications={() => setCurrentView("notifications")}
              />
            )}

            {currentView === "view-profile" && (
              <ViewProfileView
                onBack={() => setCurrentView("profile")}
                userName={user.name}
                userEmail={user.email}
                userPhone={user.phone}
                userPhoto={user.photo}
                currentProperty={currentProperty}
              />
            )}

            {currentView === "change-password" && (
              <ChangePasswordView
                userEmail={user.email}
                onBack={() => setCurrentView("settings")}
                onPasswordChanged={() => {
                  setCurrentView("profile");
                  setToastMessage("Password updated successfully!");
                }}
              />
            )}

            {currentView === "bank-details" && (
              <BankDetailsView
                onBack={() => setCurrentView("dashboard")}
                currentProperty={currentProperty}
                initialDetails={bankDetails}
                onSave={async (updatedDetails) => {
                  if (activePgId) {
                    const { error } = await supabase
                      .from("pgs")
                      .update({
                        upi_name: updatedDetails.upiName,
                        upi_number: updatedDetails.upiNumber,
                        upi_registered_name: updatedDetails.upiRegisteredName,
                        upi_id: updatedDetails.upiId,
                        account_holder_name: updatedDetails.accountHolderName,
                        account_number: updatedDetails.accountNumber,
                        ifsc_code: updatedDetails.ifscCode,
                        branch_name: updatedDetails.branchName
                      })
                      .eq("id", activePgId);

                    if (error) {
                      setToastMessage("Error saving details: " + error.message);
                      return;
                    }
                  }
                  setBankDetails(updatedDetails);
                  setCurrentView("dashboard");
                  setToastMessage("Payment details saved successfully!");
                }}
                onMenuClick={() => setIsDrawerOpen(true)}
              />
            )}

            {currentView === "wallet" && (
              <WalletView
                onBack={() => setCurrentView("dashboard")}
                currentProperty={currentProperty}
                initialPoints={walletPoints}
                initialRedeemed={walletRedeemed}
                initialTransactions={walletTransactions}
                onMenuClick={() => setIsDrawerOpen(true)}
                onRedeemPoints={(pts, msg) => {
                  setWalletPoints((prev) => prev - pts);
                  setWalletRedeemed((prev) => prev + pts);
                  // Add transaction
                  const newTx: Transaction = {
                    id: `tx_${Date.now()}`,
                    title: `Redeemed ${msg.replace("Successfully redeemed ", "")}`,
                    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    points: pts,
                    type: "redeem"
                  };
                  setWalletTransactions((prev) => [newTx, ...prev]);
                  setToastMessage(msg);
                }}
              />
            )}

            {currentView === "referral" && (
              <ReferralView
                onBack={() => setCurrentView("dashboard")}
                onNavigateToSupport={() => setCurrentView("support")}
                currentProperty={currentProperty}
                onMenuClick={() => setIsDrawerOpen(true)}
              />
            )}

            {currentView === "tenant-terms" && (
              <TenantTermsView
                onBack={() => setCurrentView("dashboard")}
                onMenuClick={() => setIsDrawerOpen(true)}
              />
            )}

            {currentView === "subscription" && (
              <SubscriptionView
                onBack={() => setCurrentView("dashboard")}
                onMenuClick={() => setIsDrawerOpen(true)}
                onProceedToPayment={(planName, price) => {
                  setCurrentView("dashboard");
                  setToastMessage(`Payment of ₹${price} for ${planName} processed successfully!`);
                }}
              />
            )}

            {currentView === "notifications" && (
              <NotificationsView
                onBack={() => setCurrentView("dashboard")}
                onMenuClick={() => setIsDrawerOpen(true)}
              />
            )}

            {currentView === "reminders" && (
              <RemindersView
                onBack={() => setCurrentView("dashboard")}
              />
            )}

            {currentView === "bills" && (
              <BillsView
                tenants={tenants}
                onBack={() => setCurrentView("dashboard")}
                onSendReminder={(name) => setToastMessage(`Bill reminder sent to ${name} via WhatsApp!`)}
              />
            )}

            {currentView === "staff" && (
              <StaffView
                onBack={() => setCurrentView("dashboard")}
                activePgId={activePgId}
              />
            )}

            {currentView === "receipts" && (
              <ReceiptsView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                initialTab={receiptsInitialTab}
                dues={duesList}
                receipts={receiptsList}
                onCollectRent={handleCollectRent}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Property QR Code Modal */}
      <PropertyQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        propertyName={currentProperty}
      />

      {/* Property Selector Bottom Sheet */}
      <PropertySelector
        isOpen={isPropertySelectorOpen}
        onClose={() => setIsPropertySelectorOpen(false)}
        selectedProperty={currentProperty}
        onSelectProperty={handleSelectProperty}
        properties={properties}
        onAddProperty={handleAddProperty}
      />

      {/* Interactive Overlay Modal: Add Tenant */}
      <AnimatePresence>
        {isAddTenantOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddTenantOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-lg text-slate-800">Add Tenant</h3>
                <button
                  onClick={() => setIsAddTenantOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTenantSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tenantName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="tenantName"
                    type="text"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tenantRoom" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assign Room
                  </label>
                  <select
                    id="tenantRoom"
                    value={tenantRoomId}
                    onChange={(e) => setTenantRoomId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                  >
                    <option value="">Select an available room</option>
                    {availableRooms.map((r) => {
                      const availCount = r.beds.filter((s) => s === "available").length;
                      return (
                        <option key={r.id} value={r.id}>
                          {r.name} (Floor {r.floor}) — {availCount} beds free
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tenantRent" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Monthly Rent (₹)
                  </label>
                  <input
                    id="tenantRent"
                    type="number"
                    value={tenantRent}
                    onChange={(e) => setTenantRent(e.target.value)}
                    placeholder="e.g. 7000"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors mt-2 text-sm tracking-wide"
                >
                  Confirm & Check In
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Overlay Modal: Add Room */}
      <AnimatePresence>
        {isAddRoomOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddRoomOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-lg text-slate-800">Add New Room</h3>
                <button
                  onClick={() => setIsAddRoomOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRoomSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="roomNameInput" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Room Name / Number
                  </label>
                  <input
                    id="roomNameInput"
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Room 10"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="roomFloorInput" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Floor Number
                    </label>
                    <input
                      id="roomFloorInput"
                      type="number"
                      min="1"
                      max="10"
                      value={roomFloor}
                      onChange={(e) => setRoomFloor(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="roomCapInput" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Bed Capacity
                    </label>
                    <input
                      id="roomCapInput"
                      type="number"
                      min="1"
                      max="12"
                      value={roomCapacity}
                      onChange={(e) => setRoomCapacity(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-colors mt-2 text-sm tracking-wide"
                >
                  Create Room
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </MobileFrame>
  );
}

// Nav Bar Tab Button Helper Component
interface TabButtonProps {
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

function TabButton({ active, label, icon: Icon, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 relative py-1 cursor-pointer group"
    >
      <div
        className={`w-12 h-8 rounded-full flex items-center justify-center relative transition-colors ${
          active ? "text-emerald-600 bg-emerald-50/70" : "text-slate-400 group-hover:text-slate-600"
        }`}
      >
        {active && (
          <motion.div
            layoutId="activeTabPill"
            className="absolute inset-0 bg-emerald-100/50 rounded-full -z-10"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <Icon className="w-5 h-5" />
      </div>
      <span
        className={`text-[10px] font-bold tracking-tight select-none ${
          active ? "text-emerald-700" : "text-slate-400/90 font-semibold"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// Side Drawer Item Component
interface DrawerItemProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick: () => void;
  variant?: "default" | "orange" | "red";
}

function DrawerItem({ label, icon: Icon, active, onClick, variant = "default" }: DrawerItemProps) {
  let itemClass = "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all select-none text-left ";
  
  if (active) {
    itemClass += "bg-emerald-600 text-white shadow-sm shadow-emerald-200/50";
  } else {
    if (variant === "orange") {
      itemClass += "text-amber-700 hover:bg-amber-50/60";
    } else if (variant === "red") {
      itemClass += "text-rose-600 hover:bg-rose-50/60";
    } else {
        itemClass += "text-slate-600 hover:bg-slate-50/70 hover:text-slate-800";
    }
  }

  return (
    <button onClick={onClick} className={itemClass}>
      <Icon className={`w-4 h-4 shrink-0 ${
        active 
          ? "text-white" 
          : variant === "orange" 
            ? "text-amber-500" 
            : variant === "red" 
              ? "text-rose-500" 
              : "text-slate-400"
      }`} />
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}
