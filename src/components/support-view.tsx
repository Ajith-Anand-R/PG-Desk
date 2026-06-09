"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  User,
  CreditCard,
  Settings,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  ChevronDown,
  Building2,
  QrCode,
  Bell,
  Menu,
  PhoneCall,
  X,
  Plus,
  AlertCircle,
  Megaphone,
  CheckCircle,
} from "lucide-react";

interface SupportViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
  complaints: any[];
  notices: any[];
  onUpdateComplaintStatus: (id: string, status: string) => Promise<void>;
  onCreateNotice: (title: string, message: string) => Promise<void>;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export function SupportView({
  onBack,
  propertyName,
  onOpenPropertySelector,
  onMenuClick,
  onNavigateToNotifications,
  complaints = [],
  notices = [],
  onUpdateComplaintStatus,
  onCreateNotice,
}: SupportViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"faqs" | "complaints" | "notices">("faqs");
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  // Mock FAQ data
  const faqs: FAQItem[] = [
    {
      id: "pwd",
      question: "How to reset your password?",
      answer:
        "To reset your password, go to the Account section, tap on 'Security', and select 'Change Password'. We will send a verification code to your registered mobile number or email address.",
    },
    {
      id: "details",
      question: "Updating account details",
      answer:
        "You can update your name, email, phone number, and address by tapping on 'Account' category above, selecting 'Profile details' and clicking 'Edit Profile'. Save changes once done.",
    },
    {
      id: "sub",
      question: "Managing your subscription",
      answer:
        "To upgrade, downgrade, or cancel your PG Owner subscription, click on the 'Billing' card. You can view invoices, update credit cards, and manage your billing cycle.",
    },
  ];

  // Contact options
  const contacts = [
    { label: "What's App", icon: MessageCircle, value: "https://wa.me/911234567890" },
    { label: "Email", icon: Mail, value: "mailto:support@pgowner.com" },
    { label: "Call", icon: Phone, value: "tel:+911234567890" },
  ];

  // Categories list
  const categories = [
    { label: "Account", icon: User },
    { label: "Billing", icon: CreditCard },
    { label: "Technical Support", icon: Settings },
    { label: "Community", icon: MessageCircle },
  ];

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[100dvh] pb-28 bg-slate-50">
      {/* Top Banner (emerald Gradient Header Bar) */}
      <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 text-white rounded-b-[2rem] px-5 pt-6 pb-6 shadow-md relative overflow-hidden">
        {/* Top bar icons */}
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
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10"
            >
              <PhoneCall className="w-5 h-5 text-white" />
            </motion.button>
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

        {/* Back and Title section */}
        <div className="flex items-center gap-3.5 relative z-10 mt-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-2xl font-bold tracking-tight text-white">Help & Support</h1>
        </div>
      </div>

      {/* Search Bar Floating Overlay */}
      <div className="px-5 -mt-5 z-20 relative">
        <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex items-center px-4 h-12 focus-within:shadow-md transition-shadow">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles..."
            className="w-full h-full bg-transparent border-0 px-3 text-sm focus:outline-hidden font-semibold text-slate-700"
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
      </div>

      {/* Navigation Tabs */}
      <div className="px-5 mt-6 shrink-0 select-none">
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200/50 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("faqs")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
              activeTab === "faqs"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            FAQs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("complaints")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
              activeTab === "complaints"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Complaints ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notices")}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
              activeTab === "notices"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Notices ({notices.length})
          </button>
        </div>
      </div>

      {activeTab === "faqs" && (
        <>
          {/* Categories Grid (2x2) */}
          <div className="px-5 mt-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-0.5">Categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.97 }}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3 text-left w-full cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 leading-tight truncate">{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Contact Us Row */}
          <div className="px-5 mt-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-0.5">Contact Us</h3>
            <div className="grid grid-cols-3 gap-3">
              {contacts.map((contact, idx) => {
                const Icon = contact.icon;
                return (
                  <motion.a
                    key={idx}
                    href={contact.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.95 }}
                    className="bg-white border border-slate-200/90 rounded-2xl py-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs transition-shadow text-center cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 tracking-tight leading-none">
                      {contact.label}
                    </span>
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Helpful Articles Accordions */}
          <div className="px-5 mt-6 flex flex-col gap-3 flex-1 pb-10">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-0.5">Helpful Articles</h3>

            <div className="flex flex-col gap-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 bg-white border border-slate-100 rounded-2xl">
                  <p className="text-slate-400 font-semibold text-sm">No articles match your search</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = activeFAQ === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xs"
                    >
                      <button
                        onClick={() => setActiveFAQ(isOpen ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 font-bold text-slate-700 text-sm tracking-tight text-left hover:bg-slate-50/50 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden bg-slate-50/20 border-t border-slate-100"
                          >
                            <p className="p-4 text-xs font-medium leading-relaxed text-slate-500">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "complaints" && (
        <div className="px-5 mt-6 flex flex-col gap-4 flex-1 pb-10">
          <div className="flex justify-between items-center px-0.5 select-none">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tenant Complaints</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{complaints.length} Total</span>
          </div>

          <div className="flex flex-col gap-3">
            {complaints.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">No Active Complaints</h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Everything looks good! Tenants have not logged any complaints.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Table Header Row */}
                <div className="bg-slate-100 rounded-xl px-4 py-2 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none shrink-0">
                  <span className="w-2/5">Complaint</span>
                  <span className="w-1/5 text-center">Room</span>
                  <span className="w-2/5 text-right">Status</span>
                </div>

                {complaints.map((c) => {
                  const tenantName = c.tenants?.users?.name || "Unknown Tenant";
                  const roomNumber = c.tenants?.rooms?.room_number || "N/A";
                  const isOpen = c.status !== "resolved";
                  const dateStr = c.created_at
                    ? new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                      })
                    : "N/A";

                  return (
                    <div
                      key={c.id}
                      className="bg-white rounded-3xl p-4 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3.5 relative overflow-hidden"
                    >
                      {/* Status Accent Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        isOpen ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      
                      <div className="flex items-center justify-between gap-4">
                        {/* Complaint Column */}
                        <div className="flex flex-col min-w-0 w-2/5">
                          <span className="text-xs font-black text-slate-850 truncate leading-none">
                            {c.title}
                          </span>
                          <span className="text-[8.5px] font-bold text-slate-400 leading-none mt-1.5 truncate">
                            By {tenantName} • {dateStr}
                          </span>
                        </div>

                        {/* Room Column */}
                        <div className="w-1/5 text-center select-none text-[11.5px] font-black text-slate-705">
                          {roomNumber}
                        </div>

                        {/* Status Badge Column */}
                        <div className="w-2/5 flex flex-col items-end gap-1.5 shrink-0 select-none">
                          <span className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-md leading-none border uppercase tracking-wider ${
                            isOpen 
                              ? "bg-amber-50 text-amber-600 border-amber-100" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}>
                            {isOpen ? "Open" : "Resolved"}
                          </span>
                        </div>
                      </div>

                      {c.description && (
                        <p className="text-[10px] font-semibold text-slate-500 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-150/40 break-all">
                          {c.description}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-100/60 select-none">
                        {isOpen ? (
                          <>
                            {c.status === "pending" && (
                              <button
                                onClick={() => onUpdateComplaintStatus(c.id, "in-progress")}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100/40 text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                              >
                                Work On
                              </button>
                            )}
                            <button
                              onClick={() => onUpdateComplaintStatus(c.id, "resolved")}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 shadow-xs"
                            >
                              Resolve
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onUpdateComplaintStatus(c.id, "pending")}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100/40 text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "notices" && (
        <div className="px-5 mt-6 flex flex-col gap-4 flex-1 pb-10">
          <div className="flex justify-between items-center px-0.5 select-none">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Property Notices</h3>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Notice</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {notices.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/40 shadow-xs rounded-[2rem] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">No Notices Posted</h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Broadcast announcements to all tenants by posting a notice.
                  </p>
                </div>
              </div>
            ) : (
              notices.map((n) => {
                const dateStr = n.created_at
                  ? new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })
                  : "N/A";

                return (
                  <div
                    key={n.id}
                    className="bg-white rounded-3xl p-4.5 border border-slate-200/40 shadow-2xs flex flex-col gap-2.5 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                    
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-black text-slate-800 leading-tight">
                        {n.title}
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 shrink-0">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-550 leading-relaxed break-words bg-slate-50/40 p-3 rounded-xl border border-slate-100/60">
                      {n.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-8 text-center text-[10px] text-slate-400 font-bold select-none border-t border-slate-100 pt-6">
        <p>
          Powered by <span className="text-blue-600">PG</span> <span className="text-emerald-600 font-extrabold">Desk</span>
        </p>
        <p className="mt-1 font-semibold text-slate-400/80">© 2026 All Rights Reserved.</p>
      </div>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-300/50 cursor-pointer z-40 border border-emerald-500/20"
      >
        <Globe className="w-6 h-6 animate-pulse" />
      </motion.button>

      {/* Notice Posting Modal overlay */}
      <AnimatePresence>
        {isNoticeModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNoticeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 bg-white w-full max-w-sm rounded-[2.2rem] p-6 shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none shrink-0">
                <h3 className="font-black text-slate-850 text-base">Post Notice</h3>
                <button
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-50 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!noticeTitle.trim() || !noticeMessage.trim()) return;

                  setIsSubmittingNotice(true);
                  try {
                    await onCreateNotice(noticeTitle, noticeMessage);
                    setNoticeTitle("");
                    setNoticeMessage("");
                    setIsNoticeModalOpen(false);
                  } catch (err) {
                    console.error("Error creating notice", err);
                  } finally {
                    setIsSubmittingNotice(false);
                  }
                }}
                className="flex flex-col gap-4"
              >
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="noticeTitle" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Notice Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="noticeTitle"
                    type="text"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Water Maintenance / Rent Due Alert"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold"
                    required
                    disabled={isSubmittingNotice}
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="noticeMessage" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Announcement Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="noticeMessage"
                    rows={4}
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    placeholder="Write details for all tenants to see..."
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold resize-none"
                    required
                    disabled={isSubmittingNotice}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmittingNotice}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs tracking-wider uppercase mt-2 select-none"
                >
                  {isSubmittingNotice ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4.5 h-4.5" />
                      <span>Post Announcement</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

