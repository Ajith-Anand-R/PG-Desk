"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, 
  Check, 
  ArrowRight, 
  Smartphone, 
  X, 
  ChevronDown, 
  Users, 
  CreditCard, 
  BedDouble, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  Clock,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";

// Dynamically import the 3D Scene with SSR disabled to prevent pre-rendering failures
const ThreeDScene = dynamic(() => import("@/components/3d/ThreeDScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">BOOTING 3D RENDERING ENGINE...</span>
      </div>
    </div>
  ),
});

export default function LandingPage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [pricingTab, setPricingTab] = useState<"pricing" | "faq">("pricing");
  
  // PWA Install Event State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  useEffect(() => {
    // 0. Redirect immediately if running inside standalone PWA window
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    ) {
      window.location.replace("/app");
      return;
    }

    // 1. Add overflow-hidden to body to block standard scrolling
    document.body.classList.add("overflow-hidden");

    // 2. Capture PWA Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("PWA beforeinstallprompt event captured.");
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      localStorage.setItem("pwaInstalled", "true");
      console.log("PWA was installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const wasInstalled = localStorage.getItem("pwaInstalled") === "true";
    if (window.matchMedia("(display-mode: standalone)").matches || wasInstalled) {
      requestAnimationFrame(() => {
        setIsAppInstalled(true);
      });
    }

    // 3. Slide-based transitions (Wheel listener with cooldown)
    let lastScrollTime = 0;
    const scrollCooldown = 900; // ms

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) return;

      if (e.deltaY > 15) {
        // Scroll Down
        setCurrentSection((prev) => Math.min(prev + 1, 4));
        lastScrollTime = now;
      } else if (e.deltaY < -15) {
        // Scroll Up
        setCurrentSection((prev) => Math.max(prev - 1, 0));
        lastScrollTime = now;
      }
    };

    // 4. Touch swipe listener for mobile support
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;

      if (diffY > 40) {
        // Swipe Up -> Next section
        setCurrentSection((prev) => Math.min(prev + 1, 4));
        lastScrollTime = now;
      } else if (diffY < -40) {
        // Swipe Down -> Prev section
        setCurrentSection((prev) => Math.max(prev - 1, 0));
        lastScrollTime = now;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install prompt result: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleLaunchApp = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    window.location.assign("/app");
  };

  const faqs = [
    {
      q: "Is PG Desk suitable for small PGs?",
      a: "Yes! PG Desk works perfectly for small accommodations with 5-10 beds as well as large co-living chains.",
    },
    {
      q: "Can I manage multiple properties?",
      a: "Absolutely. Switch between properties instantly from your single landlord profile.",
    },
    {
      q: "Is tenant data secure?",
      a: "Yes. All landlord records, tenant information, and agreements are encrypted securely.",
    },
    {
      q: "Can tenants pay rent online?",
      a: "Yes. We support direct UPI, credit/debit cards, and transfers with instant receipts.",
    },
  ];

  // Map section index to normalized scroll progress (0 to 1) for the 3D camera path
  const scrollProgress = currentSection / 4;

  return (
    <div className="bg-transparent text-slate-800 min-h-screen font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden h-screen w-screen flex flex-col justify-between">
      
      {/* 3D WebGL Canvas Layer - Fixed behind overlays, z-index 0 to avoid parent background blocking */}
      <div className="fixed inset-0 z-0 bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 w-full h-full">
        {/* Soft daylight sky glows behind the 3D scene */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />
        <ThreeDScene scrollProgress={scrollProgress} />
      </div>

      {/* Sticky High-Contrast Navbar */}
      <header className="sticky top-4 mx-4 md:mx-auto max-w-5xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-md rounded-2xl z-40 px-6 py-3 flex items-center justify-between mt-4 w-[calc(100%-2rem)]">
        <div className="flex items-center gap-2.5 select-none">
          <img src="/logo.png" alt="PG Desk Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            PG Desk
          </span>
        </div>

        {/* Section Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-wider text-slate-500">
          {[
            { label: "Hero", idx: 0 },
            { label: "Challenges", idx: 1 },
            { label: "Solution", idx: 2 },
            { label: "Features", idx: 3 },
            { label: "Pricing", idx: 4 },
          ].map((item) => (
            <button
              key={item.idx}
              onClick={() => setCurrentSection(item.idx)}
              className={`hover:text-slate-800 transition-colors cursor-pointer ${currentSection === item.idx ? "text-emerald-600" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallApp}
            className="flex items-center gap-1.5 border border-slate-250 hover:border-emerald-600 hover:bg-emerald-50/40 text-slate-650 hover:text-emerald-600 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          
          <button
            onClick={handleLaunchApp}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-sm shadow-emerald-600/25 cursor-pointer"
          >
            Launch App
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Slides Content Container - z-10 overlays WebGL canvas */}
      <div className="fixed inset-0 z-10 flex items-center px-4 md:px-12 pointer-events-none">
        
        {/* Render text slides with Framer Motion AnimatePresence */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
          <AnimatePresence mode="wait">
            
            {/* Slide 0: Hero (Left-aligned) */}
            {currentSection === 0 && (
              <motion.div
                key="hero-slide"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md flex flex-col gap-4 bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 rounded-3xl shadow-xl pointer-events-auto select-none text-left"
              >
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-555" />
                  Smart PG SaaS Platform
                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1] text-slate-900">
                  Manage Your PG Smarter. <br />
                  <span className="text-emerald-600">Increase Occupancy.</span> <br />
                  Reduce Manual Work.
                </h1>

                <p className="text-slate-600 text-[11px] leading-relaxed font-bold">
                  A complete paying guest management platform built for landlords and property managers. Oversee room allocations, automated rent collections, and complaints inside an interactive system.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    onClick={handleLaunchApp}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md shadow-emerald-600/30 hover:scale-[1.02] cursor-pointer"
                  >
                    Start Free Trial
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleInstallApp}
                    className="flex items-center justify-center gap-1.5 border border-slate-250 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-750 font-extrabold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    Download App
                  </button>
                </div>
              </motion.div>
            )}

            {/* Slide 1: Problems (Right-aligned) */}
            {currentSection === 1 && (
              <motion.div
                key="problems-slide"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md flex flex-col gap-4 bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 rounded-3xl shadow-xl ml-auto pointer-events-auto select-none text-left"
              >
                <span className="text-rose-600 font-extrabold text-[9px] uppercase tracking-widest leading-none">Challenges</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Still Managing Your PG Using Excel and WhatsApp?
                </h2>
                <p className="text-slate-600 text-[11px] leading-relaxed font-bold">
                  Chasing payments manually, losing track of empty beds, and failing to respond to tenant complaints lead to lost revenues.
                </p>

                <div className="flex flex-col gap-3 mt-2">
                  {[
                    { t: "Manual Rent Tracking", d: "WhatsApp dunning is tedious and results in delayed cycles.", i: CreditCard },
                    { t: "Empty Beds Reduction", d: "Beds sit vacant due to lack of real-time occupancy logs.", i: BedDouble },
                    { t: "Lost Complaint Logs", d: "Tenant tickets get buried in chat archives.", i: AlertCircle },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                        <item.i className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[11px] font-extrabold text-slate-800">{item.t}</h4>
                        <p className="text-[10px] text-slate-550 font-semibold leading-relaxed mt-0.5">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Slide 2: Solution (Left-aligned) */}
            {currentSection === 2 && (
              <motion.div
                key="solution-slide"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md flex flex-col gap-4 bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 rounded-3xl shadow-xl pointer-events-auto select-none text-left"
              >
                <span className="text-emerald-600 font-extrabold text-[9px] uppercase tracking-widest leading-none">The Platform</span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  One Unified App for Complete PG Control
                </h2>
                <p className="text-slate-600 text-[11px] leading-relaxed font-bold">
                  PG Desk helps landlords automate daily operations, register tenants, allocate beds, collect UPI payments, and generate invoices.
                </p>

                <div className="flex flex-col gap-2.5 mt-2">
                  {[
                    "Room & Bed Allocation",
                    "Online Rent Collection",
                    "Automated Payment Reminders",
                    "Complaint & Maintenance Tracking",
                    "Multi-PG Location Dashboard"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[10px] font-extrabold text-slate-700">
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleLaunchApp}
                  className="mt-3 flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider hover:text-emerald-700 transition-colors w-fit group cursor-pointer"
                >
                  Explore Dashboard
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            )}

            {/* Slide 3: Bento Features (Centered, wide panel) */}
            {currentSection === 3 && (
              <motion.div
                key="features-slide"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-4xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-6 rounded-3xl shadow-xl pointer-events-auto select-none text-left flex flex-col gap-6"
              >
                <div className="text-center max-w-md mx-auto flex flex-col gap-1">
                  <span className="text-emerald-600 font-extrabold text-[9px] uppercase tracking-widest">Capabilities</span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                    Core Dashboard Features
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { t: "Tenant Management", d: "Log tenant details, ID proofs, contact agreements, and dues securely.", icon: Users },
                    { t: "Rent Collection", d: "Log direct payments, generate receipts, and send automated notifications.", icon: CreditCard },
                    { t: "Bed Allocation", d: "Real-time 3D bedroom visualization. Check in and manage roommates instantly.", icon: BedDouble },
                    { t: "Staff Delegation", d: "Manage support staff. Route plumbers and electricians to active logs.", icon: Clock },
                    { t: "Visitor Logs", d: "Digitally secure visitor check-in histories and enhance safety.", icon: ShieldCheck },
                    { t: "Reports & Analytics", d: "Evaluate outstanding dues, room occupancy, and cash flows.", icon: TrendingUp },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50/60 border border-slate-200/50 p-4 rounded-2xl flex flex-col gap-2 hover:border-emerald-500/50 hover:bg-white transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600 shrink-0">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-[11px] leading-none mt-1">{item.t}</h3>
                      <p className="text-slate-500 text-[10px] leading-relaxed font-semibold">{item.d}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Slide 4: Pricing, FAQ & Final CTA (Centered, wide panel) */}
            {currentSection === 4 && (
              <motion.div
                key="pricing-slide"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-6 rounded-3xl shadow-xl pointer-events-auto select-none text-left flex flex-col gap-5 text-slate-800"
              >
                {/* Tab selector */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">PG Desk SaaS</span>
                  </div>
                  <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setPricingTab("pricing")}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${pricingTab === "pricing" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-850"}`}
                    >
                      Pricing Plans
                    </button>
                    <button
                      onClick={() => setPricingTab("faq")}
                      className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${pricingTab === "faq" ? "bg-emerald-600 text-white" : "text-slate-500 hover:text-slate-850"}`}
                    >
                      FAQs
                    </button>
                  </div>
                </div>

                <div className="min-h-[220px] flex items-center justify-center">
                  {pricingTab === "pricing" ? (
                    /* Pricing Grid */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      {/* Starter */}
                      <div className="bg-slate-50/50 border border-slate-200/50 p-4 rounded-xl flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Starter</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-black text-slate-850">₹999</span>
                            <span className="text-[9px] font-bold text-slate-400">/ mo</span>
                          </div>
                          <ul className="flex flex-col gap-1.5 text-[9px] text-slate-655 font-bold mt-1">
                            <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Up to 50 Tenants</li>
                            <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Basic Features</li>
                          </ul>
                        </div>
                        <button onClick={handleLaunchApp} className="w-full bg-slate-800 hover:bg-slate-750 text-white font-extrabold py-2 rounded-lg text-[9px] uppercase tracking-widest text-center transition-all cursor-pointer">
                          Select Plan
                        </button>
                      </div>

                      {/* Professional */}
                      <div className="bg-white border-2 border-emerald-500 p-4 rounded-xl flex flex-col justify-between gap-4 relative shadow-md shadow-emerald-500/5">
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-black text-[7px] uppercase tracking-wider py-0.5 px-2 rounded-full">Popular</span>
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Professional</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-black text-slate-850">₹2,499</span>
                            <span className="text-[9px] font-bold text-slate-400">/ mo</span>
                          </div>
                          <ul className="flex flex-col gap-1.5 text-[9px] text-slate-700 font-bold mt-1">
                            <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Up to 300 Tenants</li>
                            <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> WhatsApp Reminders</li>
                            <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Priority Support</li>
                          </ul>
                        </div>
                        <button onClick={handleLaunchApp} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 rounded-lg text-[9px] uppercase tracking-widest text-center transition-all cursor-pointer">
                          Start Free Trial
                        </button>
                      </div>

                      {/* Enterprise */}
                      <div className="bg-slate-50/50 border border-slate-200/50 p-4 rounded-xl flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enterprise</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xl font-black text-slate-850">Custom</span>
                          </div>
                          <ul className="flex flex-col gap-1.5 text-[9px] text-slate-655 font-bold mt-1">
                            <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Unlimited Properties</li>
                            <li className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> Dedicated Manager</li>
                          </ul>
                        </div>
                        <a href="mailto:support@pgdesk.com?subject=Enterprise Inquiry" className="w-full bg-slate-800 hover:bg-slate-750 text-white font-extrabold py-2 rounded-lg text-[9px] uppercase tracking-widest text-center transition-all cursor-pointer">
                          Contact Sales
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* FAQs Accordion */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200/50 rounded-xl overflow-hidden flex flex-col justify-center">
                          <button
                            onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                            className="w-full py-3 px-4 flex items-center justify-between text-left font-bold text-[10px] text-slate-800 cursor-pointer select-none leading-none border-b border-transparent"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-emerald-600" : ""}`} />
                          </button>
                          
                          {activeFaq === idx && (
                            <div className="px-4 pb-3 pt-1 text-slate-500 text-[9px] leading-relaxed font-semibold border-t border-slate-200/50">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Final CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center border-t border-slate-100 pt-4 items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider sm:mr-3">Ready to digitize operations?</span>
                  <div className="flex gap-2">
                    <button onClick={handleLaunchApp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-emerald-600/25">
                      Start Trial
                    </button>
                    <button onClick={handleInstallApp} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-extrabold px-6 py-2 rounded-xl text-[9px] uppercase tracking-wider transition-all cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> Install App
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Slide Navigation Dots (Right Side indicator) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-35 flex flex-col gap-3.5 select-none pointer-events-auto">
        {[0, 1, 2, 3, 4].map((idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSection(idx)}
            className="group relative flex items-center justify-end cursor-pointer"
          >
            {/* Tooltip */}
            <span className="absolute right-7 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {idx === 0 ? "Hero" : idx === 1 ? "Problems" : idx === 2 ? "Solution" : idx === 3 ? "Features" : "Pricing"}
            </span>
            {/* Dot indicator */}
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-350 ${
                currentSection === idx
                  ? "bg-emerald-600 scale-125 shadow-sm shadow-emerald-600/40"
                  : "bg-slate-350 hover:bg-slate-550"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Screen Slide Indicators (Bottom Left) */}
      <div className="fixed left-6 bottom-6 z-35 font-extrabold text-[10px] tracking-widest text-slate-500 uppercase select-none flex items-center gap-2">
        <span className="text-emerald-600 text-xs font-black">0{currentSection + 1}</span>
        <div className="w-8 h-px bg-slate-250" />
        <span>05</span>
      </div>

      {/* Swipe instructions (Bottom center) */}
      <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-35 text-[9px] font-black tracking-widest text-slate-400 uppercase select-none animate-pulse flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Use Scroll Wheel or Swipe to Navigate
      </div>

      {/* PWA Installation Instructions Modal */}
      <AnimatePresence>
        {showInstallGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallGuide(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl flex flex-col gap-4 text-left text-slate-800"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="PG Desk Logo" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <div className="flex flex-col select-none leading-none">
                    <h3 className="font-extrabold text-slate-900 text-sm">Install PG Desk</h3>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider mt-0.5">PWA Downloader</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="p-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 py-1.5 select-none">
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Install PG Desk directly to your home screen to launch it instantly in fullscreen and access it offline.
                </p>

                <div className="flex flex-col gap-3 font-semibold text-[10px] text-slate-600">
                  {/* Apple / Safari Guide */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col gap-2">
                    <span className="font-black text-emerald-600 uppercase tracking-widest text-[9px] leading-none">For Apple iOS (Safari)</span>
                    <ol className="list-decimal pl-4 leading-relaxed flex flex-col gap-1.5">
                      <li>Tap the <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-850 font-bold">Share</span> button in Safari.</li>
                      <li>Scroll down the options list.</li>
                      <li>Tap <span className="text-emerald-600 font-black">Add to Home Screen</span>.</li>
                    </ol>
                  </div>

                  {/* Android / Chrome Guide */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col gap-2">
                    <span className="font-black text-emerald-600 uppercase tracking-widest text-[9px] leading-none">For Android & Chrome Desktop</span>
                    <ul className="list-disc pl-4 leading-relaxed flex flex-col gap-1.5">
                      <li>Tap the browser options button (three dots).</li>
                      <li>Select <span className="text-emerald-600 font-black">Install App</span> or <span className="text-emerald-600 font-black">Add to Home Screen</span>.</li>
                      <li>Confirm the download to complete shortcut creation.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-1 select-none">
                <button
                  onClick={() => setShowInstallGuide(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider text-center transition-all cursor-pointer"
                >
                  Close
                </button>
                
                <a
                  href="/app"
                  onClick={() => setShowInstallGuide(false)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-wider text-center transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Open App
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA Launch Manager Modal */}
      <AnimatePresence>
        {showLaunchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLaunchModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl flex flex-col gap-4 text-left text-slate-800"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="PG Desk Logo" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <div className="flex flex-col select-none leading-none">
                    <h3 className="font-extrabold text-slate-900 text-sm">Launch PG Desk</h3>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider mt-0.5">App Launcher</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowLaunchModal(false)}
                  className="p-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 py-1.5 select-none">
                {isAppInstalled ? (
                  <>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                      PG Desk App is installed on your device! Open it directly from your device home screen, dock, or apps menu for the premium fullscreen offline experience.
                    </p>
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col gap-2">
                      <span className="font-black text-emerald-600 uppercase tracking-widest text-[9px] leading-none">Why use standalone app?</span>
                      <ul className="list-disc pl-4 leading-relaxed flex flex-col gap-1 text-[10px] text-slate-600 font-semibold">
                        <li>📱 Full-screen experience (no browser bars)</li>
                        <li>⚡ Buttery smooth transitions and faster loading</li>
                        <li>📶 Works offline and in poor connection areas</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                      For the best experience, install PG Desk on your home screen or dock as a standalone application.
                    </p>
                    <div className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl flex flex-col gap-2">
                      <span className="font-black text-emerald-700 uppercase tracking-widest text-[9px] leading-none">Instant App Features</span>
                      <ul className="list-disc pl-4 leading-relaxed flex flex-col gap-1 text-[10px] text-emerald-800 font-semibold">
                        <li>Instant home-screen access</li>
                        <li>Fullscreen native-like UI</li>
                        <li>Automatic updates</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2.5 mt-1 select-none">
                {!isAppInstalled && deferredPrompt && (
                  <button
                    onClick={async () => {
                      setShowLaunchModal(false);
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      console.log(`PWA install prompt result from Launcher: ${outcome}`);
                      setDeferredPrompt(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-md shadow-emerald-600/20 active:scale-98"
                  >
                    Install Standalone App
                  </button>
                )}

                <a
                  href="/app"
                  onClick={() => setShowLaunchModal(false)}
                  className={`w-full font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider text-center transition-all cursor-pointer ${
                    isAppInstalled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-98"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-755 active:scale-98"
                  }`}
                >
                  {isAppInstalled ? "Launch inside Browser anyway" : "Launch in Browser"}
                </a>
                
                <button
                  onClick={() => setShowLaunchModal(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 font-bold py-2 rounded-xl text-xs uppercase tracking-wider text-center transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
