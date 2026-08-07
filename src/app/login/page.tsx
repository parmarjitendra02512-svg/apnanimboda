"use client";

import { motion } from "framer-motion";
import {
  Lock,
  Phone,
  ArrowRight,
  UserPlus,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSound } from "@/components/SoundContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [fatherName, setFatherName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { login, user } = useAuth();
  const router = useRouter();
  const { playSuccess, playError, playClick } = useSound();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotMsg("");
    setIsLoggingIn(true);
    playClick();
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: email,
          fatherName,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setForgotMsg(
        data.message ||
          "Password reset request submitted successfully. Waiting for admin approval.",
      );
      // Don't auto-redirect, let them read the message
      // clear fields
      setEmail("");
      setFatherName("");
      setPassword("");
      playSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
      playError();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      playError();
      setError(
        "You must accept the Terms of Service & Privacy Policy to login.",
      );
      return;
    }
    setError("");
    setIsLoggingIn(true);
    playClick();
    try {
      await login(email, password);
      playSuccess();
      window.location.replace("/dashboard");
    } catch (err: any) {
      playError();
      const errMsg = err.message || "Failed to login";
      setError(errMsg);
      if (errMsg.includes("not found") || errMsg.includes("register first")) {
        setTimeout(() => window.location.replace("/register"), 2000);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Live Space/Antariksh Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-black overflow-hidden">
        <motion.img
          src="/space.jpg"
          alt="Live Space Theme"
          animate={{
            scale: [1.05, 1.1, 1.05],
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
        {/* 1.5s 3D Color Pulse Overlay */}
        <motion.div
          animate={{
            background: [
              "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6))",
              "linear-gradient(to top, rgba(0,5,15,0.95), rgba(0,0,5,0.7))",
              "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6))",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card p-8 relative overflow-hidden"
      >
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
        <div className="absolute bottom-[-50px] left-[-50px] w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/10">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            Sign In to Apna Nimboda
          </h2>
          <p className="text-slate-400 text-sm mb-8 text-center">
            Sign in to access the ultra-secure Apna Nimboda directory.
          </p>

          <form
            onSubmit={showForgot ? handleReset : handleLogin}
            className="w-full space-y-5"
          >
            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            {forgotMsg && (
              <div className="w-full bg-green-500/10 border border-green-500/50 rounded-xl p-3 text-green-400 text-sm mb-4">
                {forgotMsg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Enter your 10-digit number"
                  required
                />
              </div>
            </div>

            {showForgot ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">
                    Security Question: Father's Name
                  </label>
                  <input
                    type="text"
                    id="fatherName"
                    name="fatherName"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Enter your father's name exactly as registered"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 mt-4 mb-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded bg-white/5 border-white/20 text-blue-500 focus:ring-blue-500/50"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-400 leading-tight"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-blue-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-blue-400 hover:underline"
                >
                  Privacy Policy
                </Link>
                . I understand that the Admin monitors platform activity for
                safety.
              </label>
            </div>

            <motion.button
              disabled={isLoggingIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isLoggingIn
                  ? "bg-blue-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500"
              }`}
            >
              {isLoggingIn ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {showForgot ? "Reset Password" : "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
            {showForgot && (
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="w-full mt-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            )}
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
