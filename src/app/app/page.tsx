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
  FileText,
  LogOut,
  Home as HomeIcon,
  Coffee,
  CalendarRange,
  Users2,
  TrendingDown,
  Package,
  Shield,
  Briefcase
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
import { TenantTermsView } from "@/components/tenant-terms-view";

import { ChangePasswordView } from "@/components/change-password-view";

import { NotificationsView, NotificationItem } from "@/components/notifications-view";
import { RemindersView } from "@/components/reminders-view";
import { BillsView } from "@/components/bills-view";
import { StaffView } from "@/components/staff-view";
import { ReceiptsView, DueItem, ReceiptItem } from "@/components/receipts-view";
import { MealsManagementView } from "@/components/meals-management-view";
import { BookingsView } from "@/components/bookings-view";
import { VisitorLogsView } from "@/components/visitor-logs-view";
import { ExpensesView } from "@/components/expenses-view";
import { InventoryView } from "@/components/inventory-view";
import { VacantBedsView } from "@/components/vacant-beds-view";
import { DepositNoticeView } from "@/components/deposit-notice-view";
import { PastTenantsView } from "@/components/past-tenants-view";
// Removed SuperAdminView import
import { Room, Tenant } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import * as Sentry from "@sentry/nextjs";


type ViewType = "dashboard" | "rooms" | "support" | "create-property" | "profile" | "settings" | "view-profile" | "bank-details" | "tenant-terms" | "change-password" | "notifications" | "reminders" | "bills" | "staff" | "receipts" | "meals" | "bookings" | "visitors" | "expenses" | "inventory" | "vacant-beds" | "deposit-notice" | "past-tenants";

function getNotificationTimeAndGroup(date: Date): { time: string; dateGroup: "Today" | "Yesterday" | "Earlier"; timestamp: number } {
  const now = new Date();
  const timestamp = date.getTime();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  if (eventDate.getTime() === today.getTime()) {
    return {
      time: timeStr,
      dateGroup: "Today",
      timestamp
    };
  } else if (eventDate.getTime() === yesterday.getTime()) {
    return {
      time: `Yesterday, ${timeStr}`,
      dateGroup: "Yesterday",
      timestamp
    };
  } else {
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      time: `${dateStr}, ${timeStr}`,
      dateGroup: "Earlier",
      timestamp
    };
  }
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isPropertySelectorOpen, setIsPropertySelectorOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState("Loading...");
  const [showSplash, setShowSplash] = useState(true);
  const [receiptsInitialTab, setReceiptsInitialTab] = useState<"dues" | "receipts">("receipts");

  // Shared properties database state
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [noticeTenantsCount, setNoticeTenantsCount] = useState(0);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [clearedBefore, setClearedBefore] = useState<number>(0);

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
    photo: null as string | null,
    role: "Tenant"
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
  const [tenantDeposit, setTenantDeposit] = useState("");
  const [tenantJoinDate, setTenantJoinDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [tenantAadhaar, setTenantAadhaar] = useState("");
  const [tenantEmergencyContact, setTenantEmergencyContact] = useState("");
  const [tenantAddress, setTenantAddress] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");

  // New Room form state
  const [roomName, setRoomName] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("3");

  // Load session and user data from Supabase
  const fetchPgData = async (pgId: number | string) => {
    try {
      // 0. Auto-checkout tenants whose notice period has ended
      const getLocalDateString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const todayStr = getLocalDateString();
      const { data: expiredNotices } = await supabase
        .from("tenants")
        .select("id, bed_id")
        .eq("pg_id", pgId)
        .eq("status", "notice")
        .lte("vacate_date", todayStr);

      if (expiredNotices && expiredNotices.length > 0) {
        for (const tenant of expiredNotices) {
          // Mark tenant as left
          await supabase
            .from("tenants")
            .update({ status: "left" })
            .eq("id", tenant.id);

          // Update bed status to available (or reserved if prebooked is waiting)
          if (tenant.bed_id) {
            const { data: prebooked } = await supabase
              .from("tenants")
              .select("id")
              .eq("bed_id", tenant.bed_id)
              .eq("status", "prebooked")
              .maybeSingle();

            const newStatus = prebooked ? "reserved" : "available";
            await supabase
              .from("beds")
              .update({ status: newStatus })
              .eq("id", tenant.bed_id);
          }
        }
      }

      // 1. Fetch Tenants first to use for room formatting
      const { data: tenantsList } = await supabase
        .from("tenants")
        .select("*, users(*), rooms(*)")
        .eq("pg_id", pgId)
        .in("status", ["active", "notice", "prebooked", "left"]);

      // 2. Fetch Rooms & Beds
      const { data: roomsList } = await supabase
        .from("rooms")
        .select("*, beds(*)")
        .eq("pg_id", pgId)
        .is("deleted_at", null);

      if (roomsList) {
        const formattedRooms = roomsList.map((r: any) => ({
          id: String(r.id),
          name: r.room_number,
          floor: r.floor,
          capacity: (r.beds || []).filter((b: any) => !b.deleted_at).length,
          beds: (r.beds || [])
            .filter((b: any) => !b.deleted_at)
            .sort((a: any, b: any) => a.bed_number.localeCompare(b.bed_number))
            .map((b: any) => {
              // Check if there is an active tenant on notice on this bed
              const tenantOnNotice = tenantsList?.find(
                (t: any) => Number(t.bed_id) === Number(b.id) && t.status === "notice"
              );
              if (tenantOnNotice) {
                return "notice" as const;
              }
              // Check if there is an active tenant on this bed
              const activeTenant = tenantsList?.find(
                (t: any) => Number(t.bed_id) === Number(b.id) && t.status === "active"
              );
              if (activeTenant) {
                return "occupied" as const;
              }
              // Check if there is a prebooked tenant on this bed
              const prebookedTenant = tenantsList?.find(
                (t: any) => Number(t.bed_id) === Number(b.id) && t.status === "prebooked"
              );
              if (prebookedTenant) {
                return "reserved" as const;
              }
              return b.status as "available" | "occupied" | "reserved" | "notice";
            }),
          bedIds: (r.beds || [])
            .filter((b: any) => !b.deleted_at)
            .sort((a: any, b: any) => a.bed_number.localeCompare(b.bed_number))
            .map((b: any) => String(b.id))
        }));
        setRooms(formattedRooms);
      }

      if (tenantsList) {
        const formattedTenants = tenantsList.map((t: any) => ({
          id: String(t.id),
          name: t.users?.name || t.name || "Unknown Tenant",
          roomName: t.rooms?.room_number || "Unassigned",
          rentAmount: Number(t.rooms?.rent || 0),
          status: t.status as "active" | "left" | "prebooked" | "notice",
          joinDate: t.join_date || null,
          noticeDate: t.notice_date || null,
          vacateDate: t.vacate_date || null,
          roomId: t.room_id ? String(t.room_id) : null,
          bedId: t.bed_id ? String(t.bed_id) : null,
          deposit: t.deposit ? Number(t.deposit) : 0,
          aadhaarNumber: t.aadhaar_number || null,
          emergencyContact: t.emergency_contact || null,
          email: t.email || null,
          phone: t.users?.phone || t.phone || null,
          refundEligible: t.refund_eligible ?? false
        }));
        setTenants(formattedTenants);
        setNoticeTenantsCount(tenantsList.filter((t: any) => t.status === "notice").length);
      } else {
        setNoticeTenantsCount(0);
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

      // 7. Fetch Bookings
      const { data: bookingsList } = await supabase
        .from("bookings")
        .select("*")
        .eq("pg_id", pgId)
        .order("created_at", { ascending: false });

      if (bookingsList) {
        setBookings(bookingsList);
      } else {
        setBookings([]);
      }

      // 8. Fetch Visitor Logs
      const { data: visitorLogsList } = await supabase
        .from("visitor_logs")
        .select("*, tenants(*, rooms(*))")
        .eq("pg_id", pgId)
        .order("created_at", { ascending: false });

      if (visitorLogsList) {
        setVisitorLogs(visitorLogsList);
      } else {
        setVisitorLogs([]);
      }

      // 9. Fetch Expenses
      const { data: expensesList } = await supabase
        .from("expenses")
        .select("*")
        .eq("pg_id", pgId)
        .order("date", { ascending: false });

      if (expensesList) {
        setExpenses(expensesList);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error fetching PG data:", error);
    }
  };


  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        let { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!profile) {
          // Re-create user profile if it's missing (e.g. truncated public.users)
          const metadata = session.user.user_metadata || {};
          const { data: newProfile } = await supabase
            .from("users")
            .insert({
              id: session.user.id,
              name: metadata.name || metadata.full_name || session.user.email?.split("@")[0] || "Owner",
              email: session.user.email || "",
              phone: metadata.phone || "",
              role: metadata.role || "Owner",
              photo: metadata.avatar_url || null
            })
            .select()
            .maybeSingle();
          if (newProfile) {
            profile = newProfile;
          }
        }

        if (profile) {
          setUser({
            name: profile.name,
            email: profile.email,
            phone: profile.phone || "",
            photo: profile.photo || null,
            role: profile.role
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
    } catch (error) {
      console.error("Error checking user session:", error);
      setIsLoggedIn(false);
    } finally {
      setShowSplash(false);
    }
  };

  useEffect(() => {
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        let { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (!profile) {
          const metadata = session.user.user_metadata || {};
          const { data: newProfile } = await supabase
            .from("users")
            .insert({
              id: session.user.id,
              name: metadata.name || metadata.full_name || session.user.email?.split("@")[0] || "Owner",
              email: session.user.email || "",
              phone: metadata.phone || "",
              role: metadata.role || "Owner",
              photo: metadata.avatar_url || null
            })
            .select()
            .maybeSingle();
          if (newProfile) {
            profile = newProfile;
          }
        }

        if (profile) {
          setUser({
            name: profile.name,
            email: profile.email,
            phone: profile.phone || "",
            photo: profile.photo || null,
            role: profile.role
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
    (acc, r) => acc + r.beds.filter((status) => status === "occupied" || status === "notice").length,
    0
  );
  const availableBedsCount = totalBeds - occupiedBedsCount;

  const activeTenantsCount = tenants.filter((t) => t.status === "active" || t.status === "notice").length;
  const leftTenantsCount = tenants.filter((t) => {
    if (t.status !== "left") return false;
    const getLocalDateString = () => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayStr = getLocalDateString();
    if (t.vacateDate && t.vacateDate > todayStr) {
      return false;
    }
    return true;
  }).length;

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
      tenantName: p.tenants?.users?.name || p.tenants?.name || "Unknown",
      roomName: p.tenants?.rooms?.room_number || "Unassigned",
      amount: Number(p.amount),
      dueDate: p.due_date ? new Date(p.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "N/A",
      status: p.status as "pending" | "overdue",
      tenantPhone: p.tenants?.phone || p.tenants?.users?.phone || ""
    }));

  const receiptsList: ReceiptItem[] = payments
    .filter((p) => p.status === "paid")
    .map((p) => ({
      id: String(p.id),
      tenantName: p.tenants?.users?.name || p.tenants?.name || "Unknown",
      roomName: p.tenants?.rooms?.room_number || "Unassigned",
      amount: Number(p.amount),
      date: p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "N/A",
      refCode: p.reference_code || "UPI Payment",
      paymentMethod: p.payment_method || "UPI",
      tenantPhone: p.tenants?.phone || p.tenants?.users?.phone || ""
    }));

  // Load read notifications and cleared timestamp from localStorage
  useEffect(() => {
    if (activePgId) {
      const storedRead = localStorage.getItem(`read_notifs_${activePgId}`);
      setReadNotifications(storedRead ? JSON.parse(storedRead) : []);
      const storedCleared = localStorage.getItem(`cleared_notifs_${activePgId}`);
      setClearedBefore(storedCleared ? Number(storedCleared) : 0);
    }
  }, [activePgId]);

  // Actions for notifications
  const handleMarkAsRead = (id: string) => {
    if (!activePgId) return;
    const updated = [...readNotifications, id];
    setReadNotifications(updated);
    localStorage.setItem(`read_notifs_${activePgId}`, JSON.stringify(updated));
  };

  const handleMarkAllAsRead = () => {
    if (!activePgId) return;
    const allIds = notificationsList.map(n => n.id);
    const updated = Array.from(new Set([...readNotifications, ...allIds]));
    setReadNotifications(updated);
    localStorage.setItem(`read_notifs_${activePgId}`, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (!activePgId) return;
    const nowTimestamp = Date.now();
    setClearedBefore(nowTimestamp);
    localStorage.setItem(`cleared_notifs_${activePgId}`, String(nowTimestamp));
  };

  // Construct dynamic notifications list from database states
  const notificationsList = React.useMemo(() => {
    const list: any[] = [];

    // 1. Payments -> Rent Payments Received & Rent Payments Due
    payments.forEach((p) => {
      if (p.status === "paid") {
        const date = p.payment_date ? new Date(p.payment_date) : new Date(p.created_at || p.due_date || Date.now());
        if (p.payment_date && !p.payment_date.includes("T")) {
          date.setHours(10, 30, 0, 0);
        }
        const formatted = getNotificationTimeAndGroup(date);

        list.push({
          id: `pay-paid-${p.id}`,
          type: "payment",
          title: "Rent Payment Received",
          description: `${p.tenants?.users?.name || p.tenants?.name || "A tenant"} (Room ${p.tenants?.rooms?.room_number || "?"}) paid rent of ₹${Number(p.amount).toLocaleString("en-IN")} for ${p.month}.`,
          ...formatted
        });
      } else if (p.status === "pending" || p.status === "overdue") {
        const date = p.due_date ? new Date(p.due_date) : new Date(p.created_at || Date.now());
        if (p.due_date && !p.due_date.includes("T")) {
          date.setHours(9, 0, 0, 0);
        }
        const formatted = getNotificationTimeAndGroup(date);

        list.push({
          id: `pay-due-${p.id}`,
          type: "payment",
          title: p.status === "overdue" ? "Late Fee Warning Sent" : "Rent Payment Due",
          description: p.status === "overdue"
            ? `System sent automated payment reminder to ${p.tenants?.users?.name || p.tenants?.name || "tenant"} (Room ${p.tenants?.rooms?.room_number || "?"}) for ₹${Number(p.amount).toLocaleString("en-IN")}.`
            : `Rent of ₹${Number(p.amount).toLocaleString("en-IN")} for ${p.month} is due for ${p.tenants?.users?.name || p.tenants?.name || "tenant"} (Room ${p.tenants?.rooms?.room_number || "?"}).`,
          ...formatted
        });
      }
    });

    // 2. Tenants -> Check-ins
    tenants.forEach((t) => {
      if (t.status === "active") {
        const date = t.joinDate ? new Date(t.joinDate) : new Date(Date.now());
        if (t.joinDate && !t.joinDate.includes("T")) {
          date.setHours(9, 15, 0, 0);
        }
        const formatted = getNotificationTimeAndGroup(date);
        list.push({
          id: `ten-in-${t.id}`,
          type: "tenant",
          title: "New Tenant Checked In",
          description: `${t.name} assigned to Room ${t.roomName || "?"}.`,
          ...formatted
        });
      }
    });

    // 3. Complaints -> Support Tickets
    complaints.forEach((c) => {
      const date = new Date(c.created_at || Date.now());
      const formatted = getNotificationTimeAndGroup(date);

      if (c.status === "resolved") {
        list.push({
          id: `comp-res-${c.id}`,
          type: "support",
          title: "Support Ticket Resolved",
          description: `Complaint regarding Room ${c.tenants?.rooms?.room_number || "?"} ("${c.title}") has been resolved.`,
          ...formatted
        });
      } else {
        list.push({
          id: `comp-open-${c.id}`,
          type: "support",
          title: "New Support Ticket",
          description: `Complaint regarding Room ${c.tenants?.rooms?.room_number || "?"} ("${c.title}") is pending.`,
          ...formatted
        });
      }
    });

    // 4. Bookings
    bookings.forEach((b) => {
      if (b.status === "pending") {
        const date = new Date(b.created_at || Date.now());
        const formatted = getNotificationTimeAndGroup(date);
        list.push({
          id: `book-${b.id}`,
          type: "tenant",
          title: "New Booking Request",
          description: `Booking request received from ${b.name} (${b.phone}).`,
          ...formatted
        });
      }
    });

    // 5. Visitor Logs
    visitorLogs.forEach((v) => {
      if (v.check_in_time) {
        const date = new Date(v.check_in_time);
        const formatted = getNotificationTimeAndGroup(date);
        list.push({
          id: `vis-${v.id}`,
          type: "system",
          title: "Visitor Checked In",
          description: `${v.visitor_name} checked in to visit Room ${v.tenants?.rooms?.room_number || "?"}.`,
          ...formatted
        });
      }
    });

    // Sort all notifications by timestamp descending
    const sortedList = list.sort((a, b) => b.timestamp - a.timestamp);

    // Map unread and filter out cleared
    return sortedList
      .filter((n) => n.timestamp > clearedBefore)
      .map((n) => ({
        ...n,
        isUnread: !readNotifications.includes(n.id),
      }));
  }, [payments, tenants, complaints, bookings, visitorLogs, readNotifications, clearedBefore]);

  const hasUnreadNotifications = React.useMemo(() => {
    return notificationsList.some((n) => n.isUnread);
  }, [notificationsList]);

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

    // Verify room belongs to the active PG to prevent cross-tenant bed toggling
    const { data: roomDetails } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", roomId)
      .eq("pg_id", profile.pg_id)
      .single();

    if (!roomDetails) return;

    const { data: bedsList } = await supabase
      .from("beds")
      .select("*")
      .eq("room_id", roomId)
      .is("deleted_at", null)
      .order("bed_number", { ascending: true });

    if (bedsList && bedsList[bedIndex]) {
      const targetBed = bedsList[bedIndex];
      let newStatus = targetBed.status === "available" ? "occupied" : "available";

      if (targetBed.status === "occupied" || targetBed.status === "reserved") {
        // Mark old occupant(s) as left
        await supabase
          .from("tenants")
          .update({ status: "left", vacate_date: new Date().toISOString().split("T")[0] })
          .eq("bed_id", targetBed.id)
          .in("status", ["active", "notice"]);

        // Check if there is a prebooked tenant for this bed
        const { data: prebookedTenant } = await supabase
          .from("tenants")
          .select("id")
          .eq("bed_id", targetBed.id)
          .eq("status", "prebooked")
          .maybeSingle();

        if (prebookedTenant) {
          newStatus = "reserved";
        } else {
          newStatus = "available";
        }
      }

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
    if (!tenantName.trim() || !tenantRoomId || !tenantRent || !tenantDeposit) return;

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

    // Fetch the room details and verify it belongs to the active PG
    const { data: roomDetails } = await supabase
      .from("rooms")
      .select("*, beds(*)")
      .eq("id", tenantRoomId)
      .eq("pg_id", pgId)
      .is("deleted_at", null)
      .single();

    if (!roomDetails) return;

    // Fetch active/prebooked tenants in this room to prevent double-assigning beds
    const { data: activeTenants } = await supabase
      .from("tenants")
      .select("bed_id")
      .eq("room_id", tenantRoomId)
      .in("status", ["active", "notice", "prebooked"]);

    const activeBedIds = (activeTenants || []).map((t: any) => Number(t.bed_id));

    const availableBed = (roomDetails.beds || [])
      .filter((b: any) => !b.deleted_at)
      .find((b: any) => b.status === "available" && !activeBedIds.includes(Number(b.id)));
    if (!availableBed) {
      alert("This room is already at full capacity!");
      return;
    }

    const inviteToken = "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    const inviteExpiresAt = expiryDate.toISOString();

    // 1. Create tenant record with invite token
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        pg_id: pgId,
        name: tenantName.trim(),
        email: `${tenantName.toLowerCase().replace(/\s+/g, "")}@placeholder.com`,
        room_id: tenantRoomId,
        bed_id: availableBed.id,
        deposit: Number(tenantDeposit),
        status: "active",
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt,
        user_id: null,
        join_date: tenantJoinDate || null,
        phone: tenantPhone.trim() || null,
        aadhaar_number: tenantAadhaar.trim() || null,
        emergency_contact: tenantEmergencyContact.trim() || null,
        permanent_address: tenantAddress.trim() || null
      })
      .select()
      .single();

    if (tenantError) {
      setToastMessage(tenantError.message);
      return;
    }

    // 2. Mark the bed as occupied
    await supabase
      .from("beds")
      .update({ status: "occupied" })
      .eq("id", availableBed.id);

    // 4. Create an initial pending payment due (Rent)
    await supabase.from("payments").insert({
      tenant_id: tenant.id,
      pg_id: pgId,
      amount: Number(tenantRent),
      month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      status: "pending",
      due_date: new Date().toISOString().split("T")[0]
    });

    // 4b. Create initial pending payment for Security Deposit
    if (Number(tenantDeposit) > 0) {
      await supabase.from("payments").insert({
        tenant_id: tenant.id,
        pg_id: pgId,
        amount: Number(tenantDeposit),
        month: "Security Deposit",
        status: "pending",
        due_date: new Date().toISOString().split("T")[0]
      });
    }

    await fetchPgData(pgId);

    // Reset Form & Close
    setTenantName("");
    setTenantRoomId("");
    setTenantRent("");
    setTenantDeposit("");
    setTenantJoinDate(() => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    });
    setTenantPhone("");
    setTenantAadhaar("");
    setTenantEmergencyContact("");
    setTenantAddress("");
    setIsAddTenantOpen(false);
    alert(`Tenant boarded successfully! Share this Invite Token with them:\n\nToken: ${inviteToken}\nExpires: 7 days`);
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

    // Check for duplicate room name/number
    if (rooms.some(r => r.name.trim().toLowerCase() === roomName.trim().toLowerCase())) {
      alert(`Room "${roomName.trim()}" already exists in this property!`);
      return;
    }

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
    try {
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
        .eq("id", dueId)
        .eq("pg_id", profile.pg_id);

      if (error) {
        Sentry.captureException(new Error(`Collect rent error: ${error.message}`));
        setToastMessage(error.message);
      } else {
        setToastMessage("Rent collected successfully!");
        await fetchPgData(profile.pg_id);
      }
    } catch (err) {
      Sentry.captureException(err);
      setToastMessage(err instanceof Error ? err.message : "Error collecting rent");
    }
  };

  const handleUpdateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
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
        .eq("id", Number(complaintId))
        .eq("pg_id", profile.pg_id);

      if (error) {
        Sentry.captureException(new Error(`Update complaint status error: ${error.message}`));
        setToastMessage(error.message);
      } else {
        setToastMessage("Complaint status updated successfully!");
        await fetchPgData(profile.pg_id);
      }
    } catch (err) {
      Sentry.captureException(err);
      setToastMessage(err instanceof Error ? err.message : "Error updating complaint status");
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
                      <img src="/logo.png" alt="PG Desk Logo" className="w-11 h-11 rounded-xl object-cover shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-800 font-bold text-base truncate">{currentProperty}</span>
                        <span className="text-slate-400 font-semibold text-[10px] tracking-tight truncate">Code: {activePgId || "Loading..."}</span>
                      </div>
                    </div>
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

                    {/* SERVICES Section */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400 text-[10px] font-bold tracking-wider px-3 uppercase">Services</span>
                      <DrawerItem
                        label="Meals Menu"
                        icon={Coffee}
                        active={currentView === "meals"}
                        onClick={() => {
                          setCurrentView("meals");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerItem
                        label="Booking Requests"
                        icon={CalendarRange}
                        active={currentView === "bookings"}
                        onClick={() => {
                          setCurrentView("bookings");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerItem
                        label="Visitor Logs"
                        icon={Users2}
                        active={currentView === "visitors"}
                        onClick={() => {
                          setCurrentView("visitors");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerItem
                        label="Staff Registry"
                        icon={Briefcase}
                        active={currentView === "staff"}
                        onClick={() => {
                          setCurrentView("staff");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerItem
                        label="Expenses Tracker"
                        icon={TrendingDown}
                        active={currentView === "expenses"}
                        onClick={() => {
                          setCurrentView("expenses");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerItem
                        label="Inventory & Assets"
                        icon={Package}
                        active={currentView === "inventory"}
                        onClick={() => {
                          setCurrentView("inventory");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerItem
                        label="Vacant Beds"
                        icon={Bed}
                        active={currentView === "vacant-beds"}
                        onClick={() => {
                          setCurrentView("vacant-beds");
                          setIsDrawerOpen(false);
                        }}
                      />
                      <DrawerItem
                        label="Security & Deposits"
                        icon={Shield}
                        active={currentView === "deposit-notice"}
                        onClick={() => {
                          setCurrentView("deposit-notice");
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
                        label="Tenant Terms"
                        icon={FileText}
                        onClick={() => {
                          setCurrentView("tenant-terms");
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

                    {/* ADMIN Section Removed */}

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
              <img src="/logo.png" alt="PG Desk Logo" className="w-full h-full object-cover rounded-3xl shadow-lg" />
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
                  role: "Owner",
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
                onNavigateToVacantBeds={() => setCurrentView("vacant-beds")}
                onNavigateToVisitors={() => setCurrentView("visitors")}
                onNavigateToPastTenants={() => setCurrentView("past-tenants")}
                onNavigateToDepositNotice={() => setCurrentView("deposit-notice")}
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
                expenses={expenses}
                hasUnreadNotifications={hasUnreadNotifications}
                noticeTenantsCount={noticeTenantsCount}
                prebookCount={bookings.filter(b => b.status === "pending").length}
              />
            )}

            {currentView === "rooms" && (
              <RoomsView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                rooms={rooms}
                onToggleBed={handleToggleBed}
                onAddRoomClick={() => setIsAddRoomOpen(true)}
                onRefresh={() => activePgId && fetchPgData(activePgId)}
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
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

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
                      .eq("id", activePgId)
                      .eq("owner_id", session.user.id);

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



            {currentView === "tenant-terms" && (
              <TenantTermsView
                onBack={() => setCurrentView("dashboard")}
                onMenuClick={() => setIsDrawerOpen(true)}
              />
            )}



            {currentView === "notifications" && (
              <NotificationsView
                onBack={() => setCurrentView("dashboard")}
                onMenuClick={() => setIsDrawerOpen(true)}
                notifications={notificationsList}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
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

            {currentView === "meals" && (
              <MealsManagementView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                onOpenPropertySelector={() => setIsPropertySelectorOpen(true)}
                onMenuClick={() => setIsDrawerOpen(true)}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                activePgId={activePgId}
              />
            )}

            {currentView === "bookings" && (
              <BookingsView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                onOpenPropertySelector={() => setIsPropertySelectorOpen(true)}
                onMenuClick={() => setIsDrawerOpen(true)}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                activePgId={activePgId}
              />
            )}

            {currentView === "visitors" && (
              <VisitorLogsView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                onOpenPropertySelector={() => setIsPropertySelectorOpen(true)}
                onMenuClick={() => setIsDrawerOpen(true)}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                activePgId={activePgId}
              />
            )}

            {currentView === "expenses" && (
              <ExpensesView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                onOpenPropertySelector={() => setIsPropertySelectorOpen(true)}
                onMenuClick={() => setIsDrawerOpen(true)}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                activePgId={activePgId}
              />
            )}

            {currentView === "inventory" && (
              <InventoryView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                onOpenPropertySelector={() => setIsPropertySelectorOpen(true)}
                onMenuClick={() => setIsDrawerOpen(true)}
                onNavigateToNotifications={() => setCurrentView("notifications")}
                activePgId={activePgId}
              />
            )}

            {currentView === "vacant-beds" && (
              <VacantBedsView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                rooms={rooms}
              />
            )}

            {currentView === "deposit-notice" && (
              <DepositNoticeView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                activePgId={activePgId}
                tenants={tenants}
                onRefresh={async () => {
                  if (activePgId) {
                    await fetchPgData(activePgId);
                  }
                }}
              />
            )}

            {currentView === "past-tenants" && (
              <PastTenantsView
                onBack={() => setCurrentView("dashboard")}
                propertyName={currentProperty}
                tenants={tenants}
              />
            )}

            {/* Super Admin view removed */}
          </motion.div>
        )}
      </AnimatePresence>



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

              <form onSubmit={handleAddTenantSubmit} className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
                <div className="flex flex-col gap-1.5 font-sans">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tenantPhone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Contact No.
                    </label>
                    <input
                      id="tenantPhone"
                      type="tel"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tenantAadhaar" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Aadhaar No.
                    </label>
                    <input
                      id="tenantAadhaar"
                      type="text"
                      maxLength={12}
                      value={tenantAadhaar}
                      onChange={(e) => setTenantAadhaar(e.target.value.replace(/\D/g, ""))}
                      placeholder="12-digit number"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tenantEmergencyContact" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Emergency Contact No.
                  </label>
                  <input
                    id="tenantEmergencyContact"
                    type="tel"
                    value={tenantEmergencyContact}
                    onChange={(e) => setTenantEmergencyContact(e.target.value)}
                    placeholder="e.g. 9876543211"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tenantAddress" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Permanent Address
                  </label>
                  <input
                    id="tenantAddress"
                    type="text"
                    value={tenantAddress}
                    onChange={(e) => setTenantAddress(e.target.value)}
                    placeholder="e.g. Street, City, State"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tenantDeposit" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Security Deposit (₹)
                    </label>
                    <input
                      id="tenantDeposit"
                      type="number"
                      value={tenantDeposit}
                      onChange={(e) => setTenantDeposit(e.target.value)}
                      placeholder="e.g. 10000"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="tenantJoinDate" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Joining Date
                    </label>
                    <input
                      id="tenantJoinDate"
                      type="date"
                      value={tenantJoinDate}
                      onChange={(e) => setTenantJoinDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white text-slate-800"
                      required
                    />
                  </div>
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
        className={`w-12 h-8 rounded-full flex items-center justify-center relative transition-colors ${active ? "text-emerald-600 bg-emerald-50/70" : "text-slate-400 group-hover:text-slate-600"
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
        className={`text-[10px] font-bold tracking-tight select-none ${active ? "text-emerald-700" : "text-slate-400/90 font-semibold"
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
      <Icon className={`w-4 h-4 shrink-0 ${active
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
