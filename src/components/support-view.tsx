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
} from "lucide-react";

interface SupportViewProps {
  onBack: () => void;
  propertyName: string;
  onOpenPropertySelector: () => void;
  onMenuClick: () => void;
  onNavigateToNotifications: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export function SupportView({ onBack, propertyName, onOpenPropertySelector, onMenuClick, onNavigateToNotifications }: SupportViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFAQ, setActiveFAQ] = useState<string | null>(null);

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
      <div className="px-5 mt-6 flex flex-col gap-3 flex-1">
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
    </div>
  );
}

