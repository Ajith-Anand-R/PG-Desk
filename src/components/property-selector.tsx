"use client";

import React, { useState } from "react";
import { Check, Plus, Building2 } from "lucide-react";
import { BottomSheet } from "./ui/bottom-sheet";
import { motion } from "framer-motion";

export interface Property {
  name: string;
  code: string;
}

interface PropertySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty: string;
  onSelectProperty: (name: string) => void;
  properties: Property[];
  onAddProperty: (name: string) => void;
}

export function PropertySelector({
  isOpen,
  onClose,
  selectedProperty,
  onSelectProperty,
  properties,
  onAddProperty,
}: PropertySelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newPropName, setNewPropName] = useState("");

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) return;

    onAddProperty(newPropName.trim());
    setNewPropName("");
    setIsAdding(false);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Select Property">
      <div className="flex flex-col gap-4">
        {/* List of properties */}
        <div className="flex flex-col gap-3">
          {properties.map((prop) => {
            const isSelected = prop.name === selectedProperty;
            return (
              <motion.button
                key={prop.code}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectProperty(prop.name);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-teal-50 border-teal-300 text-teal-950 shadow-xs"
                    : "bg-white border-slate-100 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm tracking-tight">{prop.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                      Code: {prop.code}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Add New Property form or toggle button */}
        {isAdding ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddProperty}
            className="flex flex-col gap-2.5 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 mt-2"
          >
            <label htmlFor="newPropName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Property Name
            </label>
            <input
              id="newPropName"
              type="text"
              value={newPropName}
              onChange={(e) => setNewPropName(e.target.value)}
              placeholder="Enter property name..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Create
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-teal-300 bg-teal-50/20 text-teal-700 hover:bg-teal-50/40 font-bold text-sm tracking-tight transition-all mt-2 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add New Property</span>
          </motion.button>
        )}
      </div>
    </BottomSheet>
  );
}

