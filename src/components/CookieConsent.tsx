"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const interval = setInterval(() => {
      const consent = localStorage.getItem("nimboda_cookie_consent");
      if (consent !== "accepted") {
        setShow(true);
      }
    }, 8500);

    const timer = setTimeout(() => {
      const consent = localStorage.getItem("nimboda_cookie_consent");
      if (consent !== "accepted") {
        setShow(true);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem("nimboda_cookie_consent", "accepted");
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("nimboda_cookie_consent", "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 flex justify-center pointer-events-none"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl max-w-4xl w-full p-6 flex flex-col md:flex-row items-center gap-6 pointer-events-auto relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-50"></div>

            <div className="flex-shrink-0 bg-slate-800/80 p-3 rounded-full border border-slate-700/50">
              <Cookie className="w-8 h-8 text-amber-400" />
            </div>

            <div className="flex-grow text-center md:text-left z-10">
              <h3 className="text-white font-semibold text-lg mb-1">
                Cookie Preferences
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                This website uses cookies to enhance your experience and allow
                you to communicate with us through live chat. You can accept all
                cookies or reject non-essential cookies.{" "}
                <Link
                  href="/privacy-policy"
                  className="text-purple-400 hover:text-purple-300 underline underline-offset-2 font-medium whitespace-nowrap"
                >
                  Read our cookie policy here.
                </Link>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto z-10 flex-shrink-0">
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 rounded-xl text-slate-300 font-medium hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
