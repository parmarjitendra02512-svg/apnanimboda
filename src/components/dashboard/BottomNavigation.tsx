"use client";
import { Home, Search, MessageSquare, Menu, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface BottomNavigationProps {
  onOpenSidebar: () => void;
  onHomeClick?: () => void;
  onSearchClick?: () => void;
  activeTab?: string;
  hasUnreadMessages?: boolean;
}

export default function BottomNavigation({
  onOpenSidebar,
  onHomeClick,
  onSearchClick,
  activeTab = "home",
  hasUnreadMessages = false,
}: BottomNavigationProps) {
  const { isAdmin } = useAuth();
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe md:hidden"
    >
      <div className="flex items-center justify-around p-3 h-16">
        <div
          onClick={() => {
            if (onHomeClick) onHomeClick();
          }}
          className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Home
            className={`w-6 h-6 ${activeTab === "home" ? "text-blue-400" : ""}`}
          />
          <span
            className={`text-[10px] mt-1 ${activeTab === "home" ? "text-blue-400 font-bold" : ""}`}
          >
            Home
          </span>
        </div>

        <div
          onClick={() => {
            if (onSearchClick) onSearchClick();
          }}
          className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <Search
            className={`w-6 h-6 ${activeTab === "search" ? "text-blue-400" : ""}`}
          />
          <span
            className={`text-[10px] mt-1 ${activeTab === "search" ? "text-blue-400 font-bold" : ""}`}
          >
            Search
          </span>
        </div>

        <Link
          href={isAdmin ? "/admin" : "/chat/admin_config_master"}
          className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors relative"
        >
          <MessageSquare
            className={`w-6 h-6 ${activeTab === "support" ? "text-blue-400" : ""}`}
          />
          {hasUnreadMessages && (
            <span className="absolute top-0 right-1/4 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-black"></span>
          )}
          <span
            className={`text-[10px] mt-1 ${activeTab === "support" ? "text-blue-400 font-bold" : ""}`}
          >
            Support
          </span>
        </Link>

        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-colors"
        >
          <div className="w-6 h-6 rounded-full border-2 border-slate-400 flex items-center justify-center overflow-hidden">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </div>
    </motion.nav>
  );
}
