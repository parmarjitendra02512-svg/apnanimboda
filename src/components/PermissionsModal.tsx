"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Camera, Bell, ShieldCheck, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

export default function PermissionsModal() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const checkRealPermissions = async () => {
        if (!user) return;
        if (pathname?.startsWith("/admin")) {
          setShow(false);
          return;
        }
        
        try {
          let locPerm = { state: "prompt" };
          let notifPerm = { state: "prompt" };
          
          if (navigator.permissions && navigator.permissions.query) {
            locPerm = await navigator.permissions.query({ name: "geolocation" }).catch(() => ({ state: "prompt" }));
            notifPerm = await navigator.permissions.query({ name: "notifications" }).catch(() => ({ state: "prompt" }));
          }

          const hasInteracted = localStorage.getItem("nimboda_permissions_interacted");

          if (locPerm.state === "granted" && notifPerm.state === "granted") {
            setShow(false);
            localStorage.setItem("nimboda_permissions_interacted", "true");
            localStorage.setItem("loc_was_granted", "true");
            localStorage.setItem("notif_was_granted", "true");
          } else {
            const locWasGranted = localStorage.getItem("loc_was_granted");
            const notifWasGranted = localStorage.getItem("notif_was_granted");

            if ((locWasGranted && locPerm.state !== "granted") || (notifWasGranted && notifPerm.state !== "granted")) {
              localStorage.removeItem("nimboda_permissions_interacted");
              localStorage.removeItem("loc_was_granted");
              localStorage.removeItem("notif_was_granted");
              setShow(true);
            } else if (!hasInteracted) {
              setShow(true);
            }
          }
        } catch (e) {
          const hasCompletedSetup = localStorage.getItem("nimboda_permissions_interacted");
          if (!hasCompletedSetup) setShow(true);
        }
      };

      const interval = setInterval(checkRealPermissions, 8500);
      const timer = setTimeout(checkRealPermissions, 2500);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [user, pathname]);

  const handleAllowAll = async () => {
    try {
      // 1. Geolocation
      let locationRequested = false;
      if ("geolocation" in navigator) {
        locationRequested = true;
        navigator.geolocation.getCurrentPosition(
          () => {},
          () => {},
        );
      }

      // 2. Notifications
      let notifAllowed = false;
      if ("Notification" in window) {
        try {
          const perm = await Notification.requestPermission();
          notifAllowed = perm === "granted";
        } catch (e) {}
      }

      // Camera & Mic removed from initial permissions
      let mediaAllowed = false;

      // 4. Contacts (if supported) - to register in App Info
      try {
        if ('contacts' in navigator && 'ContactsManager' in window) {
          const props = ['name', 'tel'];
          // This will trigger native prompt
          await (navigator as any).contacts.select(props, { multiple: false });
        }
      } catch (e) {}

      // 5. Update Firebase so Admin can see
      if (user) {
        try {
          await fetch("/api/users/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.uid || user.mobile,
              type: "permissions",
              data: {
                location: locationRequested,
                notifications: notifAllowed,
                media: mediaAllowed,
                updatedAt: Date.now()
              }
            })
          });
        } catch (err) {
          console.error("Failed to update permissions in DB", err);
        }
      }

      localStorage.setItem("nimboda_permissions_interacted", "true");
      localStorage.setItem("nimboda_permissions_allowed", "true");
      setShow(false);
    } catch (e) {
      localStorage.setItem("nimboda_permissions_interacted", "true");
      setShow(false);
    }
  };

  const handleSkip = () => {
    setShow(false);
  };

  if (!show || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md"
          onClick={handleSkip}
        />
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/40 p-6 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] text-white z-10"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-1">
            अपना निम्बोडा (343029)
          </h2>
          <p className="text-slate-300 text-center text-xs mb-5">
            गाँव की सभी सुविधाओं और सूचनाओं को सबसे तेज़ पाने के लिए अनुमतियाँ
            दें:
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3.5 p-3 bg-white/5 rounded-2xl border border-white/10 text-left">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">
                  स्थान (Location)
                </h4>
                <p className="text-xs text-slate-400">
                  गाँव के मौसम व नज़दीकी सदस्यों की जानकारी।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 bg-white/5 rounded-2xl border border-white/10 text-left">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">
                  सूचनाएं (Notifications)
                </h4>
                <p className="text-xs text-slate-400">
                  गाँव के ताज़ा समाचार व ज़रूरी घोषणाएं।
                </p>
              </div>
            </div>

          </div>

          <div className="space-y-3">
            <button
              onClick={handleAllowAll}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/30 text-sm"
            >
              अनुमति दें (Allow & Continue)
            </button>
            <button
              onClick={handleSkip}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              बाद में (Skip for now)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
