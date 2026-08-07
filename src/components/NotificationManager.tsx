"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onChildAdded, remove } from "firebase/database";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";

export default function NotificationManager() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Listen to Firebase Notifications Node
    const notifRef = ref(db, `notifications/${user.uid}`);
    const unsubscribe = onChildAdded(notifRef, (snapshot) => {
      const data = snapshot.val();
      const id = snapshot.key;

      if (data) {
        // Show In-App Toast
        setNotifications((prev) => [...prev, { id, ...data }]);

        // Show OS Level Push Notification if allowed and backgrounded
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          if (document.hidden) {
            new Notification(data.title || "New Update", {
              body: data.message,
              icon: "/icon-192.png",
            });
          }
        }

        // Auto remove from Firebase so it doesn't trigger again on reload
        if (id) {
          setTimeout(() => {
            remove(ref(db, `notifications/${user.uid}/${id}`));
          }, 5000); // give it a few seconds before removing
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl p-4 w-80 text-white relative flex items-start gap-3 pointer-events-auto"
          >
            <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                {notif.title || "Notification"}
              </h4>
              <p className="text-sm text-slate-300 mt-1">{notif.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
