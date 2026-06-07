"use client";

import React from "react";

interface MobileFrameProps {
  children: React.ReactNode;
  bottomNav?: React.ReactNode;
  drawer?: React.ReactNode;
}

export function MobileFrame({ children, bottomNav, drawer }: MobileFrameProps) {
  return (
    <div className="min-h-[100dvh] bg-slate-100/60 flex items-center justify-center py-0 md:py-6 selection:bg-teal-100 selection:text-teal-900">
      {/* Real-world mobile container emulation on desktop */}
      <div 
        className="w-full max-w-md min-h-[100dvh] md:min-h-[850px] md:max-h-[900px] md:rounded-[2.5rem] md:shadow-2xl md:border-[10px] md:border-slate-900 bg-slate-50 relative flex flex-col overflow-hidden"
        style={{ position: "relative" }}
      >
        {/* Mobile Status Bar Emulation on desktop */}
        <div className="hidden md:flex justify-between items-center px-8 py-3 bg-teal-700 text-white/95 text-xs font-semibold select-none z-10 shrink-0">
          <span>19:39</span>
          <div className="w-20 h-4 bg-slate-950/20 rounded-full flex items-center justify-center text-[10px]">
            PG Desk
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
              <div className="w-3.5 h-full bg-white rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-slate-50">
          {children}
        </div>

        {/* Fixed Bottom Navigation inside mobile viewport */}
        {bottomNav}

        {/* Fixed Overlays (Drawer, Toast) */}
        {drawer}
      </div>
    </div>
  );
}

