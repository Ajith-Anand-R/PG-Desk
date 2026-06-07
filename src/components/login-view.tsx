"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Building } from "lucide-react";

interface LoginViewProps {
  onLogin: () => void;
  onRegisterClick: () => void;
}

export function LoginView({ onLogin, onRegisterClick }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast messages
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setLoginMethod("email");

    // Simulating authenticating delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setLoginMethod("google");

    // Simulating authenticating delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-slate-50 min-h-[100dvh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm mx-auto flex flex-col gap-8"
      >
        {/* Logo and Header Text */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-150 rotate-3">
            <Building className="w-8 h-8 -rotate-3" />
          </div>
          <div className="flex flex-col gap-1 mt-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">PG Desk</h1>
            <p className="text-xs text-slate-400 font-bold tracking-wide uppercase">
              Property Management Made Easy
            </p>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="flex flex-col gap-6">
          {/* Google Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full h-12 border border-slate-200 rounded-xl bg-white shadow-xs flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 active:bg-slate-100/80 transition-colors disabled:opacity-50"
          >
            {isLoading && loginMethod === "google" ? (
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.91 3.41-8.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.54c-.24-.72-.38-1.5-.38-2.3a7.84 7.84 0 01.38-2.3L1.39 6.95C.5 8.76 0 10.79 0 12.92c0 2.13.5 4.16 1.39 5.97l3.85-2.99-.01-.36z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-4.26 1.1-3.34 0-5.86-2.22-6.76-5.06L1.39 16.2C3.37 20.12 7.35 22.82 12 23z"
                />
              </svg>
            )}
            <span className="text-slate-700 text-sm font-bold tracking-tight">
              Continue with Google
            </span>
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider select-none">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loginEmail" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold text-slate-800"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="loginPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setToastMessage("Password reset instructions sent!")}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  tabIndex={-1}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 border border-slate-200 rounded-xl pl-10 pr-10 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold text-slate-800"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-5 h-5 absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-center"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded-sm focus:ring-emerald-500"
                  disabled={isLoading}
                />
                <span className="text-xs font-bold text-slate-500">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-2 text-sm tracking-wide"
            >
              {isLoading && loginMethod === "email" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Don't have an account link */}
          <div className="text-center mt-2">
            <span className="text-slate-400 text-xs font-semibold">Don't have an account? </span>
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
            >
              Sign Up
            </button>
          </div>
        </div>
      </motion.div>

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
    </div>
  );
}

