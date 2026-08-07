import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Search,
  Activity,
  Monitor,
  MessageSquare,
  Bot,
  ShieldCheck,
  Video,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowBroadcastModal: (show: boolean) => void;
  handleLogout: () => void;
  pageViews?: number;
  appInstalls?: number;
}

export default function AdminHeader({
  activeTab,
  setActiveTab,
  setShowBroadcastModal,
  handleLogout,
  pageViews = 0,
  appInstalls = 0,
}: AdminHeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-6xl mx-auto glass-panel rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center mb-8 z-10 gap-4"
    >
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <div className="flex items-center gap-3 justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Shield className="text-blue-400 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Admin Panel
            </h1>
          </div>
        </div>
        
        {/* Analytics Badges */}
        <div className="flex items-center gap-2 mt-2">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">
              <span className="text-white">{pageViews}</span> Visits
            </span>
          </div>
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">
              <span className="text-emerald-100">{appInstalls}</span> Installs
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 w-full md:w-auto overflow-x-auto">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "directory" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <Users className="w-4 h-4" /> Directory
        </button>
        <button
          onClick={() => setActiveTab("bulk_upload")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "bulk_upload" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-white"}`}
        >
          <Users className="w-4 h-4" /> Bulk Upload
        </button>
        <button
          onClick={() => setActiveTab("kundli")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "kundli" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-slate-400 hover:text-white"}`}
        >
          <Search className="w-4 h-4" /> Kundli Search
        </button>
        <button
          onClick={() => setActiveTab("location")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "location" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-white"}`}
        >
          <Activity className="w-4 h-4" /> Locations
        </button>
        <button
          onClick={() => setActiveTab("monitor")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "monitor" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <Monitor className="w-4 h-4" /> Monitor
        </button>
        <button
          onClick={() => setActiveTab("inbox")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "inbox" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <MessageSquare className="w-4 h-4" /> Inbox
        </button>
        <button
          onClick={() => setActiveTab("notice_board")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "notice_board" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <MessageSquare className="w-4 h-4" /> Notice Board
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "archived" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <Users className="w-4 h-4" /> Archived
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "categories" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <Bot className="w-4 h-4" /> Categories
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "settings" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
        >
          <Shield className="w-4 h-4" /> Settings
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "security" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-400 hover:text-white"}`}
        >
          <ShieldCheck className="w-4 h-4" /> Security
        </button>
        <button
          onClick={() => setActiveTab("compliance")}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "compliance" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-400 hover:text-white"}`}
        >
          <AlertTriangle className="w-4 h-4" /> Compliance
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end mt-4 md:mt-0">
        <button
          onClick={() => setShowBroadcastModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 transition-colors text-sm font-medium text-pink-400"
        >
          <MessageSquare className="w-4 h-4" /> Broadcast
        </button>
        <Link href="/admin/yt-seo">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors text-sm font-medium text-red-400">
            <Video className="w-4 h-4" /> SEO Tool
          </button>
        </Link>
        <Link href="/dashboard" replace>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-colors text-sm font-medium text-blue-400">
            App
          </button>
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-400 text-sm font-medium"
        >
          Log Out
        </button>
      </div>
    </motion.header>
  );
}
