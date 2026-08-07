"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  Shield,
  LogOut,
  Sun,
  Moon,
  Info,
  Download,
  Share2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import LiveChatWidget from "@/components/LiveChatWidget";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  theme: string;
  toggleTheme: () => void;
  handleLogout: () => void;
  onInstallClick?: () => void;
}

export default function SidebarMenu({
  isOpen,
  onClose,
  isAdmin,
  theme,
  toggleTheme,
  handleLogout,
  onInstallClick,
}: SidebarMenuProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Nimboda (343029) Digital Village Network!",
          text: "The most advanced digital directory for our village.",
          url: "https://nimboda.in",
        });
      } else {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent("Join Nimboda (343029) Digital Village Network! https://nimboda.in")}`,
          "_blank",
        );
      }
    } catch (err) {
      console.log("Share failed", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
          />

          {/* Sidebar Panel (Now a Bottom Sheet) */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 w-full max-h-[85vh] bg-slate-900 border-t border-white/10 z-[101] flex flex-col md:hidden overflow-hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Drag Handle indicator */}
            <div className="w-full flex justify-center pt-3 pb-1 bg-white/5">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
            
            <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Menu
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-1.5 overflow-y-auto pb-4">
              <Link href="/settings" onClick={onClose}>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">Settings</span>
                </div>
              </Link>

              {/* Advanced Settings */}
              <div className="group">
                <button
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-white/5 text-slate-300 font-medium"
                  onClick={(e) => {
                    const content = e.currentTarget.nextElementSibling;
                    if (content) {
                      content.classList.toggle("hidden");
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-amber-500/80" />
                    <span className="text-sm">Advanced Settings</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="hidden mt-1 p-2 rounded-lg bg-black/20 border border-white/5 space-y-1.5">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        if ('serviceWorker' in navigator) {
                          navigator.serviceWorker.getRegistrations().then(function(registrations) {
                            for(let registration of registrations) {
                              registration.unregister();
                            }
                          });
                        }
                        if ('caches' in window) {
                          caches.keys().then((names) => {
                            for (let name of names) caches.delete(name);
                          });
                        }
                        alert("Updating App... Please wait.");
                        setTimeout(() => window.location.reload(), 1000);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20 text-blue-400 font-bold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    Check for Updates
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to logout?")) {
                        handleLogout();
                        onClose();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20 text-red-400 font-bold text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>

              {isAdmin && (
                <Link href="/admin" onClick={onClose}>
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">
                      Admin Panel
                    </span>
                  </div>
                </Link>
              )}

              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-left"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-400" />
                )}
                <span className="text-sm font-medium text-slate-200">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              </button>

              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-install-pwa"));
                  }
                  if (onInstallClick) onInstallClick();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 transition-colors border border-green-500/20 text-left"
              >
                <Download className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Install App</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20 text-left"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Share App</span>
              </button>

              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors border border-pink-500/20 text-left"
              >
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-medium text-pink-300">Live Support</span>
              </button>

              {/* About */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-not-allowed opacity-50">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">
                  About Apna Nimboda
                </span>
              </div>
            </div>

            <LiveChatWidget
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
