"use client";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Sun,
  Moon,
  Settings,
  MessageSquare,
  Shield,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import InstallPwa from "@/components/InstallPwa";

interface TopNavigationProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  theme: string;
  toggleTheme: () => void;
  isAdmin: boolean;
  handleLogout: () => void;
}

export default function TopNavigation({
  searchTerm,
  setSearchTerm,
  theme,
  toggleTheme,
  isAdmin,
  handleLogout,
}: TopNavigationProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-6xl mx-auto rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 z-[100] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] sticky top-0 md:top-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Users className="text-blue-400 w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Apna Nimboda
        </h1>
      </div>

      <div className="relative w-full md:w-96 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, number, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <button className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-500/20 shrink-0">
          Search
        </button>
      </div>

      <div className="hidden md:flex flex-wrap justify-center md:justify-end items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
        <InstallPwa />
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-blue-400" />
          )}
        </button>
        <Link href="/settings">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium text-slate-300">
            <Settings className="w-4 h-4 text-blue-400" /> Settings
          </button>
        </Link>
        <Link href="/posts">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium text-slate-300">
            <MessageSquare className="w-4 h-4 text-pink-400" /> Notice Board
          </button>
        </Link>
        {isAdmin && (
          <Link href="/admin">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium text-slate-300">
              <Shield className="w-4 h-4 text-purple-400" /> Admin
            </button>
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="text-red-400 w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
}
