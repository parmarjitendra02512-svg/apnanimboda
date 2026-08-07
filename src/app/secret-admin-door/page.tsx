// TODO: Rename this admin door URL to something more secure. Middleware will provide extra protection.
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Key, ArrowRight, Eye, EyeOff } from "lucide-react";


export default function SecretAdminDoor() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password, isSecretDoor: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }
      if (data.success) {
        if (data.user) {
          try {
            localStorage.setItem("tanumanu_user", JSON.stringify(data.user));
          } catch (e) {}
        }
        window.location.href = "/admin";
        return;
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Deep Web / Secret styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md w-full p-8 rounded-3xl border border-red-500/20 relative z-10 shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)]"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Restricted Access
        </h1>
        <p className="text-center text-slate-400 text-sm mb-8">
          Authorized Personnel Only
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">
              Admin ID (Mobile)
            </label>
            <div className="relative">
              <input
                type="text"
                id="mobile"
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit ID"
                maxLength={10}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-400 mb-2 block">
              Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 mt-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-[0_0_20px_-5px_rgba(220,38,38,0.5)]"
          >
            {isLoading ? "VERIFYING..." : "INITIALIZE SYSTEM"}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
