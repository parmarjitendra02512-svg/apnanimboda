"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Rocket, X } from "lucide-react";

export default function AppUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [worker, setWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setWorker(e.detail);
      setUpdateAvailable(true);
    };

    window.addEventListener("sw-update-available", handleUpdate);
    return () => window.removeEventListener("sw-update-available", handleUpdate);
  }, []);

  const handleUpdate = () => {
    if (worker) {
      worker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 z-[999999] md:w-96"
        >
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Rocket className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="pt-1">
                <h3 className="text-white font-bold mb-1">New Update Available!</h3>
                <p className="text-slate-300 text-xs mb-3">
                  A faster and better version of Apna Nimboda is ready. Update now to get the latest features.
                </p>
                <button
                  onClick={handleUpdate}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold py-2 px-4 rounded-xl transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Update Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
