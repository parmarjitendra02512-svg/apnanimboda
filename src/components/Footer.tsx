"use client";

import Link from "next/link";
import { Shield, Lock } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const hiddenPaths = [
    "/ai",
    "/reels",
    "/dashboard",
    "/documents",
    "/news",
    "/weather",
    "/chat",
    "/settings",
    "/emitra",
    "/search",
    "/pincode",
  ];

  if (hiddenPaths.some((path) => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <footer className="w-full mt-auto py-8 border-t border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link
            href="/login"
            className="hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <Lock className="w-4 h-4" /> Sign In
          </Link>
          <Link
            href="/register"
            className="hover:text-purple-400 transition-colors flex items-center gap-1"
          >
            <Shield className="w-4 h-4" /> Sign Up
          </Link>
        </div>
        <div className="text-center">
          <p className="text-slate-500 text-xs mt-2">
            Designed & Developed by{" "}
            <strong className="text-slate-400">****</strong>
          </p>
          <p className="text-slate-600 text-[10px] mt-1">
            © {new Date().getFullYear()} Apna Nimboda. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
