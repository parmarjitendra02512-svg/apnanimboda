"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Lock,
  UserPlus,
  ArrowRight,
  Loader2,
  Camera,
  CheckCircle,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSound } from "@/components/SoundContext";
import { sanitizeInput } from "@/utils/sanitize";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [showOtpNotification, setShowOtpNotification] = useState(false);

  const [name, setName] = useState("");
  const [father, setFather] = useState("");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [password, setPassword] = useState("");
  const [pincode, setPincode] = useState("");
  const [gramPanchayat, setGramPanchayat] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playSuccess, playError } = useSound();

  const validateIndianNumber = (num: string) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(num);
  };

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: randomOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      setGeneratedOtp(randomOtp);
      setTimer(60);
      setShowOtpNotification(true);
      setTimeout(() => setShowOtpNotification(false), 5000);
      setStep(2);
    } catch (err: any) {
      playError();
      setError(err.message || "Error sending OTP via email");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (timer === 0) {
      playError();
      setError("OTP has expired. Please request a new one.");
      return;
    }
    if (otp === generatedOtp) {
      setStep(3);
    } else {
      playError();
      setError("Invalid OTP. Please try again.");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(sanitizeInput(mobile), password, {
        name: sanitizeInput(name),
        father: sanitizeInput(father),
        mobile: sanitizeInput(mobile),
        email: sanitizeInput(email),
        location: sanitizeInput(location),
        profession: sanitizeInput(profession),
        pincode: sanitizeInput(pincode),
        gram_panchayat: sanitizeInput(gramPanchayat),
        is_private: isPrivate,
        photoUrl,
      });
      playSuccess();
      setSuccess(true);
      router.replace("/login");
    } catch (err: any) {
      playError();
      const errMsg = err.message || "Registration failed";
      setError(errMsg);
      if (
        errMsg.includes("already exists") ||
        errMsg.includes("already registered")
      ) {
        setTimeout(() => router.replace("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md w-full space-y-4 border-l-4 border-l-emerald-500/50">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Request Sent!</h2>
          <p className="text-slate-300">
            Your registration request has been securely sent to the Admin. You
            will be able to log in once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative">
      <AnimatePresence>
        {showOtpNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-0 left-1/2 z-50 glass-card bg-white/95 dark:bg-[#1a1f3c]/95 px-6 py-4 rounded-2xl flex items-start gap-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-white/20 w-[90%] max-w-sm"
          >
            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Messages
                </p>
                <span className="text-[10px] text-slate-500">now</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight">
                Apna Nimboda verification code is{" "}
                <strong className="text-blue-500">{generatedOtp}</strong>. Valid
                for 1 minute. Do not share this with anyone.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-8 md:p-12 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 transform rotate-12">
            <div className="transform -rotate-12">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Join Apna Nimboda
          </h1>
          <p className="text-slate-400 text-center mb-8 max-w-sm">
            Sign Up to connect securely with your village. Your details are safe
            with us.
          </p>

          {error && (
            <div className="w-full bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm mb-6 text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <form
              onSubmit={handleSendOTP}
              className="w-full max-w-md space-y-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="10-digit Indian Number"
                    required
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-slate-500 ml-1">
                  Your mobile number will serve as your login ID.
                </p>
              </div>
              <motion.button
                disabled={loading || mobile.length !== 10}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send OTP"
                )}
              </motion.button>
              <div className="mt-8 text-center text-sm text-slate-400">
                Have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign In
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={handleVerifyOTP}
              className="w-full max-w-md space-y-5"
            >
              <div className="space-y-2 text-center">
                <label className="text-sm font-medium text-slate-300 flex flex-col gap-1 items-center">
                  <span>Enter OTP sent to +91 {mobile}</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${timer > 0 ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {timer > 0
                      ? `Time remaining: 00:${timer.toString().padStart(2, "0")}`
                      : "Expired"}
                  </span>
                </label>
                <input
                  disabled={timer === 0}
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOtp(val);
                    if (val.length === 4 && timer > 0) {
                      if (val === generatedOtp) {
                        setStep(3);
                      } else {
                        playError();
                        setError("Invalid OTP. Please try again.");
                      }
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-center tracking-[1em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                  placeholder="••••"
                  required
                  maxLength={4}
                />
              </div>
              <motion.button
                disabled={otp.length !== 4 || timer === 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                Verify OTP
              </motion.button>
              <div className="flex justify-between items-center w-full mt-4 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setTimer(0);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={handleSendOTP}
                  className={`font-medium transition-colors ${timer > 0 ? "text-slate-500 cursor-not-allowed" : "text-blue-400 hover:text-blue-300"}`}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form
              onSubmit={handleRegister}
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="md:col-span-2 flex flex-col items-center justify-center mb-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden relative group"
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-slate-400 mb-1 group-hover:text-white transition-colors" />
                      <span className="text-[10px] text-slate-400 group-hover:text-white">
                        Add Photo
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Ramesh Kumar"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Father's Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="father"
                    name="father"
                    value={father}
                    onChange={(e) => setFather(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Suresh Kumar"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Location / Ward
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Village Location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Profession / Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="e-Mitra, Student, Farmer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Gram Panchayat
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="gramPanchayat"
                    name="gramPanchayat"
                    value={gramPanchayat}
                    onChange={(e) => setGramPanchayat(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Panchayat Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Pincode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) =>
                      setPincode(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="e.g. 343030"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Create Password
                </label>
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Create a secure password"
                    required
                    minLength={6}
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

              <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="hideNum"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500/50"
                />
                <label
                  htmlFor="hideNum"
                  className="flex-1 flex flex-col cursor-pointer"
                >
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-slate-400" /> Hide Mobile
                    Number
                  </span>
                  <span className="text-xs text-slate-400">
                    Your number will not be visible to other villagers in the
                    directory.
                  </span>
                </label>
              </div>

              <div className="md:col-span-2 flex items-start gap-3 mt-2 mb-2 p-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 rounded bg-white/5 border-white/20 text-purple-500 focus:ring-purple-500/50 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-slate-400 leading-tight"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-purple-400 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-purple-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . I understand that the Admin monitors platform activity for
                  safety and security purposes.
                </label>
              </div>

              <motion.button
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="md:col-span-2 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg flex justify-center items-center gap-2 mt-4 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign Up <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
