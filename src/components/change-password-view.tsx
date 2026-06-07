"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  Mail, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface ChangePasswordViewProps {
  userEmail: string;
  onBack: () => void;
  onPasswordChanged: () => void;
}

export function ChangePasswordView({
  userEmail,
  onBack,
  onPasswordChanged
}: ChangePasswordViewProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Validation states (derived dynamically during render)
  const hasEightChars = newPassword.length >= 8;
  const hasSpecialOrNumber = /[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword !== "" && newPassword === confirmPassword;

  const isValid = hasEightChars && hasSpecialOrNumber && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsUpdating(true);
    // Mock network call
    setTimeout(() => {
      setIsUpdating(false);
      onPasswordChanged();
    }, 1800);
  };

  // Compute password strength rating
  const getStrengthScore = () => {
    let score = 0;
    if (newPassword.length > 0) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score; // Max 4
  };

  const strengthScore = getStrengthScore();
  const strengthText = 
    strengthScore === 0 ? "Empty" :
    strengthScore <= 2 ? "Weak" :
    strengthScore === 3 ? "Medium" : "Strong";
    
  const strengthColor = 
    strengthScore === 0 ? "bg-slate-200" :
    strengthScore <= 2 ? "bg-rose-500" :
    strengthScore === 3 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex flex-col min-h-[100dvh] pb-8 bg-slate-50 select-none">
      {/* Premium Gradient Curved Header */}
      <div className="bg-teal-700 text-white pt-5 pb-6 px-5 rounded-b-[2rem] shadow-md relative overflow-hidden flex flex-col gap-4">
        {/* Background glowing decorations */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10 select-none">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-teal-100 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </motion.button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Account Security</h1>
            <p className="text-xs font-semibold text-white/80 mt-1.5 leading-none">Set a strong password to protect your data</p>
          </div>
        </div>
      </div>

      {/* Main Body Content */}
      <div className="px-5 -mt-4 z-20 flex flex-col gap-5 relative flex-1">
        
        {/* Premium Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-5 border border-slate-200/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col gap-5">
          {/* Prefilled Email (Read Only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              Email or Phone
            </label>
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 select-none text-slate-400">
              <Mail className="w-5 h-5 text-slate-400/80 shrink-0" />
              <span className="text-sm font-semibold select-all truncate">
                {userEmail || "alikmohammed101@gmail.com"}
              </span>
            </div>
          </div>

          {/* New Password Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="newPassword" className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              New Password
            </label>
            <div className="w-full bg-slate-50 border border-slate-200/80 focus-within:border-teal-650 focus-within:bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all">
              <Lock className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-none outline-hidden text-sm font-bold text-slate-800 placeholder-slate-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
              >
                {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div className="flex flex-col gap-1.5 px-1 mt-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400">Password Strength</span>
                  <span className={strengthScore <= 2 ? "text-rose-500" : strengthScore === 3 ? "text-amber-500" : "text-emerald-500"}>
                    {strengthText}
                  </span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${(strengthScore / 4) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">
              Confirm Password
            </label>
            <div className="w-full bg-slate-50 border border-slate-200/80 focus-within:border-teal-650 focus-within:bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all">
              <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-none outline-hidden text-sm font-bold text-slate-800 placeholder-slate-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
              >
                {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={isValid ? { scale: 1.01 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            disabled={!isValid || isUpdating}
            type="submit"
            className={`w-full h-14 rounded-2xl text-white flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer font-extrabold text-xs tracking-wider uppercase ${
              isValid
                ? "bg-teal-700 hover:bg-teal-800 shadow-teal-200/50"
                : "bg-slate-300/80 cursor-not-allowed shadow-none"
            }`}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Security Checklist Card */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-200/40 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-4 select-none">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight px-0.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Security Checklist</span>
          </h3>

          <div className="flex flex-col gap-3.5">
            {/* Requirement 1 */}
            <ChecklistItem 
              isChecked={hasEightChars} 
              label="8+ Characters" 
              active={newPassword.length > 0}
            />

            {/* Requirement 2 */}
            <ChecklistItem 
              isChecked={hasSpecialOrNumber} 
              label="Numbers or Special Characters" 
              active={newPassword.length > 0}
            />

            {/* Requirement 3 */}
            <ChecklistItem 
              isChecked={passwordsMatch} 
              label="Passwords must match" 
              active={confirmPassword.length > 0}
            />
          </div>
        </div>

        {/* Footer branding */}
        <div className="flex flex-col items-center justify-center text-center gap-1 opacity-85 select-none pt-4 pb-8">
          <p className="text-[10px] font-bold text-slate-400">
            Powered by <span className="text-amber-500 font-extrabold">PG</span> <span className="text-slate-800 font-black">Desk</span>
          </p>
          <p className="text-[9px] font-bold text-slate-400">
            &copy; 2026 All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}

// Checklist Item Helper Component
interface ChecklistItemProps {
  isChecked: boolean;
  label: string;
  active: boolean;
}

function ChecklistItem({ isChecked, label, active }: ChecklistItemProps) {
  const dotColor = isChecked 
    ? "bg-emerald-50 border-emerald-100 text-emerald-500" 
    : active 
      ? "bg-rose-50 border-rose-100 text-rose-500"
      : "bg-slate-50 border-slate-200 text-slate-300";

  return (
    <div className="flex items-center gap-3 text-xs font-bold transition-all select-none">
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200 ${dotColor}`}>
        {isChecked ? (
          <Check className="w-3 h-3 stroke-[3.5px]" />
        ) : active ? (
          <X className="w-3 h-3 stroke-[3.5px]" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        )}
      </div>
      <span className={isChecked ? "text-slate-800 font-semibold" : active ? "text-rose-500 font-semibold" : "text-slate-400/90 font-medium"}>
        {label}
      </span>
    </div>
  );
}

