"use client";

import { useState, useEffect } from "react";
import {
  Download,
  X,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function InstallPwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone;
      if (isStandalone) {
        setIsInstalled(true);
      }

      const userAgent = window.navigator.userAgent.toLowerCase();
      const iosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(iosDevice);

      // Check if global prompt was already captured
      if ((window as any).__deferredPrompt) {
        setDeferredPrompt((window as any).__deferredPrompt);
      }

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        (window as any).__deferredPrompt = e;
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowModal(false);
        setDeferredPrompt(null);
        (window as any).__deferredPrompt = null;
        
        // Log App Install
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "install" }),
        }).catch(() => {});

        showToast(
          "🎉 बधाई! APNA NIMBODA ऐप सफलतापूर्वक आपके फ़ोन में इंस्टॉल हो गया है!",
        );
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
      window.addEventListener("pwa-prompt-ready", () => {
        if ((window as any).__deferredPrompt) {
          setDeferredPrompt((window as any).__deferredPrompt);
        }
      });

      const handleOpenInstall = () => triggerInstallFlow();
      window.addEventListener("open-install-pwa", handleOpenInstall);

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        );
        window.removeEventListener("appinstalled", handleAppInstalled);
        window.removeEventListener("open-install-pwa", handleOpenInstall);
      };
    }
  }, []);

  const triggerInstallFlow = async () => {
    if (isInstalled) {
      showToast("✅ APNA NIMBODA ऐप पहले से आपके फ़ोन में इंस्टॉल है!");
      return;
    }

    const prompt =
      deferredPrompt ||
      (typeof window !== "undefined" ? (window as any).__deferredPrompt : null);

    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setShowModal(false);
          showToast("🎉 बधाई! APNA NIMBODA ऐप सफलतापूर्वक इंस्टॉल हो गया है!");
        }
        setDeferredPrompt(null);
        (window as any).__deferredPrompt = null;
        return;
      } catch (err) {
        console.error("Direct install prompt error:", err);
      }
    }

    // If prompt is not directly available, show popup
    setShowModal(true);
  };

  const handleInstallClick = () => {
    triggerInstallFlow();
  };

  const handleDirectInstallFromModal = async () => {
    const prompt =
      deferredPrompt ||
      (typeof window !== "undefined" ? (window as any).__deferredPrompt : null);
    if (prompt) {
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setShowModal(false);
          showToast("🎉 बधाई! APNA NIMBODA ऐप सफलतापूर्वक इंस्टॉल हो गया है!");
        }
        setDeferredPrompt(null);
        (window as any).__deferredPrompt = null;
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      const isAndroid =
        typeof navigator !== "undefined" &&
        /android/i.test(navigator.userAgent);
      if (isAndroid) {
        window.location.href = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }
  };

  const modalContent =
    showModal && mounted ? (
      <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4">
        {/* Full Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* High-Contrast Centered Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 25 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.35)] z-10 overflow-hidden text-white"
        >
          {/* Close 'X' Button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 hover:bg-red-500 flex items-center justify-center text-white transition-all shadow-lg z-20 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* App Logo & Title */}
          <div className="flex items-center gap-3.5 mb-5 text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5 shadow-xl shadow-purple-500/40 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/icon-192.jpg"
                alt="APNA NIMBODA"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">
                  APNA NIMBODA
                </h3>
              </div>
              <p className="text-xs text-purple-300 font-medium">
                Smart Digital Village App (343029)
              </p>
            </div>
          </div>

          {/* 1-Click Install Button */}
          <div className="space-y-3.5">
            <button
              onClick={handleDirectInstallFromModal}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold flex items-center justify-center gap-2.5 shadow-xl shadow-purple-600/40 active:scale-95 transition-all text-base border border-white/20"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>📲 1-क्लिक में ऐप इंस्टॉल करें</span>
            </button>

            {/* If In-App browser (WhatsApp etc), open in Chrome */}
            <button
              onClick={() => {
                window.location.href = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold flex items-center justify-center gap-2 text-xs border border-white/10 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Google Chrome में खोलें</span>
            </button>

            {/* Quick Help */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>सीधे मोबाइल में जोड़ने का तरीका:</span>
              </div>

              {isIOS ? (
                <p className="text-xs text-slate-300">
                  Safari में नीचे <strong>Share (शेयर ⬆️)</strong> दबाकर{" "}
                  <strong>"Add to Home Screen"</strong> चुनें।
                </p>
              ) : (
                <p className="text-xs text-slate-300">
                  ऊपर बटन दबाते ही फ़ोन स्क्रीन पर{" "}
                  <strong>"Install / Add"</strong> का विकल्प आएगा, उस पर क्लिक
                  करें।
                </p>
              )}

              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% सुरक्षित • Play Store की आवश्यकता नहीं
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    ) : null;

  return (
    <>
      {/* Global Toast for Install Status */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[999999999] bg-slate-900/95 border-2 border-emerald-500 text-white px-5 py-3 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] backdrop-blur-xl text-sm font-bold flex items-center gap-2 max-w-[90vw] text-center"
              >
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{toastMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <button
        onClick={handleInstallClick}
        title="Install APNA NIMBODA App"
        className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all text-xs font-bold text-white shadow-lg shadow-blue-500/25 active:scale-95"
      >
        <Download className="w-4 h-4 animate-bounce shrink-0" />
        <span>{isInstalled ? "App Installed" : "Install App"}</span>
      </button>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>{modalContent}</AnimatePresence>,
          document.body,
        )}
    </>
  );
}
