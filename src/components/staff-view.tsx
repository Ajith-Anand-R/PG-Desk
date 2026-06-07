"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  X, 
  Phone, 
  Trash2, 
  Briefcase, 
  ChefHat, 
  Sparkles, 
  Shield, 
  Users,
  UserPlus
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: "Management" | "Kitchen" | "Housekeeping" | "Security";
  photo?: string | null;
  email?: string;
  status?: "ACTIVE" | "INACTIVE";
  joinDate?: string;
  salary?: string;
  aadhaar?: string;
  aadhaarFront?: string | null;
  aadhaarBack?: string | null;
  notes?: string;
}

interface StaffViewProps {
  onBack: () => void;
}

type RoleFilter = "All" | "Management" | "Kitchen" | "Housekeeping" | "Security";

export function StaffView({ onBack }: StaffViewProps) {
  const [staff, setStaff] = useState<StaffMember[]>([
    { 
      id: "s1", 
      name: "Ramesh Kumar", 
      phone: "+91 98765 43210", 
      role: "Management",
      email: "ramesh@example.com",
      status: "ACTIVE",
      joinDate: "2026-01-15",
      salary: "25000",
      aadhaar: "123456789012"
    },
    { 
      id: "s2", 
      name: "Sita Devi", 
      phone: "+91 87654 32109", 
      role: "Kitchen",
      email: "sita@example.com",
      status: "ACTIVE",
      joinDate: "2026-02-10",
      salary: "18000",
      aadhaar: "234567890123"
    },
    { 
      id: "s3", 
      name: "Laxman Singh", 
      phone: "+91 76543 21098", 
      role: "Housekeeping",
      email: "laxman@example.com",
      status: "ACTIVE",
      joinDate: "2026-03-05",
      salary: "15000",
      aadhaar: "345678901234"
    },
    { 
      id: "s4", 
      name: "Vikram Rathore", 
      phone: "+91 65432 10987", 
      role: "Security",
      email: "vikram@example.com",
      status: "ACTIVE",
      joinDate: "2026-04-01",
      salary: "20000",
      aadhaar: "456789012345"
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<RoleFilter>("Management");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<StaffMember["role"]>("Management");
  const [newEmail, setNewEmail] = useState("");
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [newJoinDate, setNewJoinDate] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newAadhaar, setNewAadhaar] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // File states
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newAadhaarFrontName, setNewAadhaarFrontName] = useState<string | null>(null);
  const [newAadhaarBackName, setNewAadhaarBackName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newEmail.trim() || !newJoinDate || !newAadhaar.trim()) {
      alert("Please fill in all required fields marked with *");
      return;
    }

    if (newPhone.trim().replace(/\D/g, "").length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    if (newAadhaar.trim().replace(/\D/g, "").length !== 12) {
      alert("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    const newMember: StaffMember = {
      id: `staff_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      role: newRole,
      photo: newPhoto,
      email: newEmail.trim(),
      status: newStatus,
      joinDate: newJoinDate,
      salary: newSalary.trim() || undefined,
      aadhaar: newAadhaar.trim(),
      aadhaarFront: newAadhaarFrontName,
      aadhaarBack: newAadhaarBackName,
      notes: newNotes.trim() || undefined,
    };

    setStaff((prev) => [...prev, newMember]);
    
    // Reset Form
    setNewName("");
    setNewPhone("");
    setNewRole("Management");
    setNewEmail("");
    setNewStatus("ACTIVE");
    setNewJoinDate("");
    setNewSalary("");
    setNewAadhaar("");
    setNewNotes("");
    setNewPhoto(null);
    setNewAadhaarFrontName(null);
    setNewAadhaarBackName(null);

    setIsAddModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  // Filter staff by category and search query
  const filteredStaff = staff.filter((s) => {
    const matchesCategory = activeCategory === "All" || s.role === activeCategory;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const categories: { 
    label: RoleFilter; 
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    bgClass: string;
  }[] = [
    { label: "All", icon: Users, colorClass: "text-slate-500", bgClass: "bg-slate-50" },
    { label: "Management", icon: Briefcase, colorClass: "text-emerald-600", bgClass: "bg-emerald-50/70" },
    { label: "Kitchen", icon: ChefHat, colorClass: "text-amber-600", bgClass: "bg-amber-50" },
    { label: "Housekeeping", icon: Sparkles, colorClass: "text-teal-600", bgClass: "bg-teal-50" },
    { label: "Security", icon: Shield, colorClass: "text-rose-600", bgClass: "bg-rose-50" },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] pb-8 bg-slate-50 select-none">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-100 pt-5 pb-5 px-5 flex items-center justify-between z-10 shadow-2xs select-none">
        <div className="flex items-center gap-3.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200/60 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </motion.button>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-800 leading-none">
            Staff Management
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsAddModalOpen(true)}
          className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-xs cursor-pointer text-white transition-colors"
        >
          <Plus className="w-5.5 h-5.5" />
        </motion.button>
      </div>

      {/* Main Body Content */}
      <div className="px-5 pt-5 flex flex-col gap-5 relative flex-1">
        {/* Horizontal Category Slider */}
        <div className="flex gap-3 overflow-x-auto pb-2 px-0.5 no-scrollbar select-none snap-x snap-mandatory shrink-0">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border shrink-0 snap-start cursor-pointer w-20 transition-all ${
                  isActive 
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" 
                    : "bg-white border-slate-200/50 text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "bg-white/20 text-white" : `${cat.bgClass} ${cat.colorClass}`
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className={`text-[10px] font-extrabold tracking-tight whitespace-nowrap leading-none ${
                  isActive ? "text-white" : "text-slate-400"
                }`}>
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative bg-white rounded-2xl shadow-xs border border-slate-200/50 overflow-hidden flex items-center px-4 h-12 focus-within:shadow-sm transition-shadow shrink-0">
          <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staffs..."
            className="w-full h-full bg-transparent border-0 px-3 text-xs focus:outline-hidden font-semibold text-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Staff List rendering */}
        <div className="flex-1 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredStaff.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[2rem] p-10 border border-slate-200/40 shadow-xs flex flex-col items-center justify-center text-center gap-4 py-16 mt-2"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-450 mb-1">
                  <UserPlus className="w-8 h-8 text-slate-400/80" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">No staffs found</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed max-w-[240px] mx-auto">
                    Add your first staff by tapping the + button
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredStaff.map((item) => {
                  const roleStyles = {
                    Management: {
                      bg: "bg-emerald-50",
                      border: "border-emerald-100/70",
                      text: "text-emerald-600",
                      line: "bg-emerald-500",
                    },
                    Kitchen: {
                      bg: "bg-amber-50",
                      border: "border-amber-100/70",
                      text: "text-amber-600",
                      line: "bg-amber-500",
                    },
                    Housekeeping: {
                      bg: "bg-teal-50",
                      border: "border-teal-100/70",
                      text: "text-teal-600",
                      line: "bg-teal-500",
                    },
                    Security: {
                      bg: "bg-rose-50",
                      border: "border-rose-100/70",
                      text: "text-rose-600",
                      line: "bg-rose-500",
                    },
                  }[item.role];

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="bg-white rounded-3xl p-4 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex items-center justify-between gap-4 relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${roleStyles.line}`} />
                      
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-full ${roleStyles.bg} border ${roleStyles.border} flex items-center justify-center ${roleStyles.text} shrink-0`}>
                          {item.role === "Management" && <Briefcase className="w-5 h-5" />}
                          {item.role === "Kitchen" && <ChefHat className="w-5 h-5" />}
                          {item.role === "Housekeeping" && <Sparkles className="w-5 h-5" />}
                          {item.role === "Security" && <Shield className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-xs font-black text-slate-850 truncate leading-none">
                            {item.name}
                          </span>
                          <span className={`text-[9.5px] font-black ${roleStyles.text} ${roleStyles.bg} border ${roleStyles.border} px-2 py-0.5 rounded-full w-max leading-none mt-1`}>
                            {item.role}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 truncate leading-none mt-1">
                            {item.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <motion.a
                          whileTap={{ scale: 0.9 }}
                          href={`tel:${item.phone}`}
                          className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shadow-2xs hover:bg-slate-100 cursor-pointer"
                        >
                          <Phone className="w-4 h-4" />
                        </motion.a>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteStaff(item.id)}
                          className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-2xs hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer branding */}
        <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-4 shrink-0">
          <p className="text-[10px] font-bold text-slate-400">
            Powered by <span className="text-emerald-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
          </p>
          <p className="text-[9px] font-bold text-slate-400">
            &copy; 2026 All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Add Staff Overlay Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2.2rem] p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none shrink-0">
                <h3 className="font-black text-slate-850 text-base">Add Staff</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 pr-0.5 pb-2">
                {/* Profile Photo Uploader */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Profile Photo <span className="text-rose-500">*</span>
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewPhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    accept="image/*"
                    capture="user"
                    className="hidden"
                  />
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-5 text-center cursor-pointer transition-all ${
                      newPhoto 
                        ? "border-emerald-500 bg-emerald-50/25" 
                        : "border-pink-300 bg-pink-50/20 hover:bg-pink-50/30"
                    }`}
                  >
                    {newPhoto ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-emerald-200">
                        <img src={newPhoto} alt="Selfie Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-[8px] font-bold text-white uppercase">Change</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-pink-100/80 flex items-center justify-center text-pink-500 mb-1.5">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-black text-pink-500 leading-none">Capture Selfie</span>
                        <span className="text-[9px] font-semibold text-slate-400 mt-1">Take a clear photo for verification</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffName" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="staffName"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffPhone" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="staffPhone"
                    type="text"
                    maxLength={10}
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit phone number"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold font-mono"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffEmail" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="staffEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffRole" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="staffRole"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as StaffMember["role"])}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                  >
                    <option value="Management">Management</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Security">Security</option>
                  </select>
                </div>

                {/* Staff Status */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffStatus" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Staff Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="staffStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                {/* Join Date */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffJoinDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Join Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="staffJoinDate"
                    type="date"
                    value={newJoinDate}
                    onChange={(e) => setNewJoinDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold bg-white"
                    required
                  />
                </div>

                {/* Monthly Salary */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffSalary" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Monthly Salary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="staffSalary"
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="Enter monthly salary (optional)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                  />
                </div>

                {/* Aadhaar Number */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffAadhaar" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Aadhaar Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="staffAadhaar"
                    type="text"
                    maxLength={12}
                    value={newAadhaar}
                    onChange={(e) => setNewAadhaar(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 12-digit Aadhaar Number"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold font-mono"
                    required
                  />
                </div>

                {/* Aadhaar Front & Back Uploads */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Front Upload */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-center">
                      Aadhaar Front <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="file"
                      ref={frontInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setNewAadhaarFrontName(file.name);
                      }}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className={`h-10 rounded-2xl border text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 truncate px-2 ${
                        newAadhaarFrontName 
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600" 
                          : "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {newAadhaarFrontName ? "Uploaded" : "Upload"}
                    </motion.button>
                    {newAadhaarFrontName && (
                      <span className="text-[8.5px] text-slate-400 text-center truncate w-full font-semibold px-1">
                        {newAadhaarFrontName}
                      </span>
                    )}
                  </div>

                  {/* Back Upload */}
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-center">
                      Aadhaar Back <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="file"
                      ref={backInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setNewAadhaarBackName(file.name);
                      }}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className={`h-10 rounded-2xl border text-xs font-black transition-all flex items-center justify-center cursor-pointer shrink-0 truncate px-2 ${
                        newAadhaarBackName 
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600" 
                          : "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {newAadhaarBackName ? "Uploaded" : "Upload"}
                    </motion.button>
                    {newAadhaarBackName && (
                      <span className="text-[8.5px] text-slate-400 text-center truncate w-full font-semibold px-1">
                        {newAadhaarBackName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="staffNotes" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Notes <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="staffNotes"
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Add additional notes (optional)"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold resize-none"
                  />
                </div>

                {/* Add Employee Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs tracking-wider uppercase mt-2 shrink-0 select-none"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Add Employee</span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
