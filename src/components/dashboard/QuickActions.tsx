"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Globe,
  CloudSun,
  Sparkles,
  MapPin,
  Bell,
  Calendar,
  Search,
  Loader2
} from 'lucide-react';

export default function QuickActions({
  features,
  setMaintenanceModal
}: {
  features: Record<string, string>;
  setMaintenanceModal: (modal: { show: boolean; title: string; message: string }) => void;
}) {
  const renderFeature = (
    featureKey: string,
    title: string,
    href: string,
    icon: React.ReactNode,
    _bg: string,
    iconColor: string,
    textColor: string,
  ) => {
    const state = features[featureKey] || "active";
    if (state === "hidden") return null;

    // Extract base color from tailwind classes (e.g. from-rose-500 -> rose)
    const colorMatch = iconColor.match(/from-([a-z]+)-/);
    const baseColor = colorMatch ? colorMatch[1] : "white";
    const bgClass = `bg-${baseColor}-500/20`;
    const borderClass = `border-${baseColor}-500/30`;
    const shadowClass = `shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] group-hover:${bgClass.replace("20", "30")}`;

    const content = (
      <motion.button
        whileHover={{ scale: 1.15, y: -10 }}
        className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-[80px] transition-all relative group"
      >
        <div
          className={`w-14 h-14 rounded-2xl ${bgClass} backdrop-blur-md flex items-center justify-center ${textColor} border ${borderClass} ${shadowClass} transition-all z-10 relative overflow-hidden`}
        >
          {state === "pending" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
          <div className="drop-shadow-md">{icon}</div>
        </div>
        <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors text-center leading-tight">
          {title}
        </span>
      </motion.button>
    );

    if (state === "pending") {
      return (
        <div
          key={featureKey}
          className="flex-none snap-center cursor-pointer group"
          onClick={() =>
            setMaintenanceModal({
              show: true,
              title,
              message: `The ${title} server is currently down or undergoing maintenance. Please try again later.`,
            })
          }
        >
          {content}
        </div>
      );
    }
    return (
      <Link
        key={featureKey}
        href={href}
        className="flex-none snap-center group"
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="flex justify-center mb-12">
      <div className="flex gap-2 overflow-x-auto pb-4 pt-4 px-4 md:px-8 snap-x no-scrollbar bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] max-w-full items-start">
        {renderFeature(
          "news",
          "Live News",
          "/news",
          <Globe className="w-6 h-6" />,
          "from-rose-600/20 to-orange-600/20",
          "from-rose-500 to-orange-500",
          "text-rose-400",
        )}
        {renderFeature(
          "weather",
          "Live Weather",
          "/weather",
          <CloudSun className="w-6 h-6" />,
          "from-sky-600/20 to-blue-600/20",
          "from-sky-400 to-blue-500",
          "text-sky-400",
        )}

        <Link href="/ai" className="flex-none snap-center group">
          <motion.button
            whileHover={{ scale: 1.15, y: -10 }}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-[80px] transition-all relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 backdrop-blur-md flex items-center justify-center text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] group-hover:bg-cyan-500/30 transition-all z-10">
              <Sparkles className="w-7 h-7 drop-shadow-md" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors text-center leading-tight">
              AINimboda
            </span>
          </motion.button>
        </Link>

        {renderFeature(
          "reels",
          "Reels",
          "/reels",
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>,
          "from-fuchsia-600/20 to-purple-600/20",
          "from-fuchsia-500 to-purple-600",
          "text-fuchsia-400",
        )}

        {renderFeature(
          "emitra",
          "Village Directory",
          "/emitra",
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>,
          "from-amber-600/20 to-yellow-600/20",
          "from-amber-500 to-yellow-500",
          "text-amber-400",
        )}
        {renderFeature(
          "pincode",
          "Pincode Search",
          "/pincode",
          <MapPin className="w-6 h-6" />,
          "from-emerald-600/20 to-teal-600/20",
          "from-emerald-500 to-teal-500",
          "text-emerald-400",
        )}
        {renderFeature(
          "edocs",
          "e-Documents",
          "/documents",
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>,
          "from-indigo-600/20 to-blue-600/20",
          "from-indigo-500 to-blue-600",
          "text-indigo-400",
        )}
        {renderFeature(
          "quiz",
          "Student Quiz",
          "/quiz",
          <span className="text-2xl">🎓</span>,
          "from-pink-600/20 to-rose-600/20",
          "from-pink-500 to-rose-500",
          "text-pink-400",
        )}

        <Link href="/posts" className="flex-none snap-center group">
          <motion.button
            whileHover={{ scale: 1.15, y: -10 }}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-[80px] transition-all relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 backdrop-blur-md flex items-center justify-center text-orange-300 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] group-hover:bg-orange-500/30 transition-all z-10">
              <Bell className="w-7 h-7 drop-shadow-md" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-orange-300 transition-colors text-center leading-tight">
              Notices
            </span>
          </motion.button>
        </Link>

        <Link href="/posts" className="flex-none snap-center group">
          <motion.button
            whileHover={{ scale: 1.15, y: -10 }}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-[80px] transition-all relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] group-hover:bg-emerald-500/30 transition-all z-10">
              <Calendar className="w-7 h-7 drop-shadow-md" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-emerald-300 transition-colors text-center leading-tight">
              Events
            </span>
          </motion.button>
        </Link>

        <Link href="/search" className="flex-none snap-center group">
          <motion.button
            whileHover={{ scale: 1.15, y: -10 }}
            className="flex flex-col items-center justify-center gap-1.5 p-2 min-w-[80px] transition-all relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-300 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] group-hover:bg-blue-500/30 transition-all z-10">
              <Search className="w-7 h-7 drop-shadow-md" />
            </div>
            <span className="text-[11px] font-semibold text-slate-300 group-hover:text-blue-300 transition-colors text-center leading-tight">
              Web Search
            </span>
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
