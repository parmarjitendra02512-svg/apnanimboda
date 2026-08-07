"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import InstallPwa from "@/components/InstallPwa";

export default function InstallAppBanner({ 
  showInstallPopup, 
  setShowInstallPopup 
}: { 
  showInstallPopup: boolean; 
  setShowInstallPopup: (val: boolean) => void;
}) {
  return (
    <AnimatePresence>
      {showInstallPopup && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <div className="relative w-full glass-panel bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-4 rounded-3xl border border-purple-500/30 flex items-center justify-between gap-4 shadow-lg shadow-purple-900/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                <Download className="w-6 h-6 text-purple-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Apna Nimboda App
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Fast & easy access!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32">
                <InstallPwa />
              </div>
              <button
                onClick={() => setShowInstallPopup(false)}
                className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
