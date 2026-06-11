"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Phone, Camera, Building, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as Sentry from "@sentry/nextjs";


interface RegisterViewProps {
  onLoginClick: () => void;
  onRegisterSuccess: (userData: { name: string; email: string; phone: string; photo: string | null }) => void;
}

export function RegisterView({ onLoginClick, onRegisterSuccess }: RegisterViewProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Camera capture states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-hide toast messages
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
            role: "Owner",
            phone: phone.trim(),
            photo: photo,
          },
        },
      });

      setIsLoading(false);
      if (error) {
        Sentry.captureException(new Error(`Registration failed: ${error.message}`));
        setToastMessage(error.message);
      } else {
        setToastMessage("Account created successfully!");
        setTimeout(() => {
          onRegisterSuccess({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            photo,
          });
        }, 1000);
      }
    } catch (err) {
      setIsLoading(false);
      Sentry.captureException(err);
      setToastMessage(err instanceof Error ? err.message : "An error occurred during registration");
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please upload a photo instead.");
      setToastMessage("Camera blocked or unavailable");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Capture Photo from video stream
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Set canvas dimensions to match video stream
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas image to base64 data URL
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhoto(dataUrl);
        setToastMessage("Photo captured successfully!");
      }
    }
    stopCamera();
  };

  // Handle file input upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        setToastMessage("Photo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10 bg-slate-50 min-h-[100dvh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm mx-auto flex flex-col gap-6"
      >
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md rotate-3 overflow-hidden">
            <img src="/logo.png" alt="PG Desk Logo" className="w-8 h-8 rounded-xl object-cover -rotate-3" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight mt-2">Create Account</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Join PG Desk today
          </p>
        </div>

        {/* Profile Picture Uploader */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="w-24 h-24 rounded-full bg-slate-200 border-2 border-emerald-100 relative shadow-sm cursor-pointer overflow-hidden flex items-center justify-center group hover:border-emerald-500 transition-colors"
          >
            {photo ? (
              <img src={photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
            {/* Badge */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs">
              <Camera className="w-4.5 h-4.5" />
            </div>
          </button>

          {/* Fallback File Upload Selector Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer mt-1"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload photo instead
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="regName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="regName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-11 border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold text-slate-800"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="regEmail" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="regEmail"
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

          {/* Mobile Number */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="regPhone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="regPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-11 border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-semibold text-slate-800"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="regPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                id="regPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
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

          {/* Register Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-70 mt-2 text-sm tracking-wide"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Register"
            )}
          </motion.button>
        </form>

        {/* Already have an account link */}
        <div className="text-center mt-2">
          <span className="text-slate-400 text-xs font-semibold">Already have an account? </span>
          <button
            type="button"
            onClick={onLoginClick}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
          >
            Sign In
          </button>
        </div>
      </motion.div>

      {/* Hidden Canvas for Video Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Interactive Camera Modal Overlay */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={stopCamera}
              className="absolute inset-0 bg-slate-950"
            />

            {/* Camera Frame Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              {/* Camera Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <span className="text-slate-800 font-bold text-sm">Take Profile Photo</span>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>

              {/* Camera Feed Area */}
              <div className="flex-1 min-h-[300px] bg-slate-900 relative flex items-center justify-center">
                {cameraError ? (
                  <div className="flex flex-col items-center gap-2 p-6 text-center text-white">
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                    <span className="text-xs font-semibold">{cameraError}</span>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        fileInputRef.current?.click();
                      }}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Choose File
                    </button>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover absolute inset-0"
                  />
                )}
              </div>

              {/* Controls */}
              {!cameraError && (
                <div className="p-4 bg-slate-50 flex items-center justify-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl text-xs cursor-pointer active:scale-97 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer active:scale-97 transition-transform flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-100"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Photo
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-55 bg-slate-900/95 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 border border-slate-850"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

