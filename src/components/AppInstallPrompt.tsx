"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download } from "lucide-react";

export default function AppInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      interval = setInterval(() => {
        const dismissed = localStorage.getItem("nimboda_app_install_dismissed");
        if (dismissed !== "true") {
          setShow(true);
        }
      }, 8500);

      timer = setTimeout(() => {
        const dismissed = localStorage.getItem("nimboda_app_install_dismissed");
        if (dismissed !== "true") {
          setShow(true);
        }
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
        // Track the install in GA
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag('event', 'app_installed', {
            event_category: 'PWA',
            event_label: 'Installed'
          });
        }
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("nimboda_app_install_dismissed", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="fixed top-0 left-0 right-0 z-[99999] p-4 md:p-6 flex justify-center pointer-events-none"
        >
          <div className="bg-emerald-900/95 backdrop-blur-xl border border-emerald-800 shadow-2xl rounded-2xl max-w-2xl w-full p-4 flex flex-col md:flex-row items-center gap-4 pointer-events-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-50"></div>

            <div className="flex-shrink-0 bg-emerald-800/80 p-3 rounded-full border border-emerald-700/50">
              <Download className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="flex-grow text-center md:text-left z-10">
              <h3 className="text-white font-semibold text-base mb-1">
                Install Apna Nimboda App
              </h3>
              <p className="text-emerald-100/80 text-xs md:text-sm">
                Add to your home screen for a faster, full-screen village experience!
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto z-10 flex-shrink-0 mt-3 md:mt-0">
              <button
                onClick={handleDismiss}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl text-emerald-300 font-medium hover:text-white hover:bg-emerald-800 transition-colors border border-emerald-700/50 text-sm"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] text-sm"
              >
                Install Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
