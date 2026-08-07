"use client";

import { motion } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Lock,
  Save,
  ArrowLeft,
  Loader2,
  Camera,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, set, update } from "firebase/database";

export default function SettingsPage() {
  const { user, isApproved, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [father, setFather] = useState("");
  const [location, setLocation] = useState("");
  const [profession, setProfession] = useState("");
  const [password, setPassword] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
    if (!authLoading && user && !isApproved && !isAdmin)
      router.push("/dashboard");
  }, [user, isApproved, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      const userRef = ref(db, `approved_users/${user.uid}`);
      const snap = await get(userRef);
      if (snap.exists()) {
        const data = snap.val();
        setName(data.name || "");
        setFather(data.father || "");
        setLocation(data.location || "");
        setProfession(data.profession || "");
        // Do NOT fetch and pre-fill password for security reasons
        setIsPrivate(data.is_private || false);
        setIsPublic(data.is_public || false);
        setPhotoUrl(data.photoUrl || "");
        setInstagram(data.instagram || "");
        setFacebook(data.facebook || "");
        setTwitter(data.twitter || "");
      } else if (isAdmin) {
        // Admin default state logic if needed
        setName(user.name || "");
      }
    };
    fetchUserData();
  }, [user, isAdmin]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const editData: any = {
        name,
        father,
        location,
        profession,
        is_private: isPrivate,
        is_public: isPublic,
        photoUrl,
        instagram,
        facebook,
        twitter,
      };

      if (password.trim() !== "") {
        editData.password = password;
      }

      const res = await fetch("/api/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit changes");
    } finally {
      setLoading(false);
    }
  };

  const handleMobileRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/users/request-mobile-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMobile }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to request mobile number change");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !loading))
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md w-full space-y-4 border-l-4 border-l-emerald-500/50">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Changes Submitted!</h2>
          <p className="text-slate-300">
            Your profile updates have been securely sent to the Admin for
            approval. They will be visible once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-12">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-4 flex items-center gap-4 mb-8 z-10"
      >
        <Link href="/dashboard" replace>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft className="text-slate-300 w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-white">Settings & Privacy</h1>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden shadow-2xl relative p-8 md:p-12"
      >
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Edit Your Profile
        </h2>
        <p className="text-slate-400 text-center mb-8">
          Make changes to your profile. All changes require Admin approval.
        </p>

        <form
          onSubmit={handleSave}
          className="w-full grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {error && (
            <div className="md:col-span-2 w-full bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm mb-2 text-center">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex flex-col items-center justify-center mb-4">
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
                    Change
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-2 mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-bold mb-1">App Version & Updates</h3>
              <p className="text-slate-400 text-xs">
                Check if there is a newer version of the app available.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistration().then(reg => {
                    if (reg) {
                      reg.update().then(() => {
                        alert("Checked for updates! If a new update is found, you will see a popup shortly. If not, you are already on the latest version.");
                      });
                    } else {
                      alert("Service worker not found. Try reloading the page.");
                    }
                  });
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shrink-0 whitespace-nowrap"
            >
              Check for Updates
            </button>
          </div>

          <div className="md:col-span-2 mb-6">
            <label className="text-sm font-medium text-slate-300 ml-1 mb-2 block">
              Privacy Settings
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors mb-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </div>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                Private Mode (Hide completely from searches)
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  Make My Profile Public
                </span>
                <span className="text-xs text-slate-400">
                  By default, your mobile number and details are hidden. Turn
                  this on to allow other users to see them and call you.
                </span>
              </div>
            </label>
          </div>

          {/* Request Mobile Number Change Section */}
          <div className="md:col-span-2 mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-400" />
              Change Mobile Number
            </h3>
            <p className="text-slate-400 text-xs mb-4">
              Your current mobile number is your login ID. If you change it, you will need admin approval before it takes effect.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Enter new 10-digit mobile number"
                  maxLength={10}
                />
              </div>
              <button
                type="button"
                disabled={loading || newMobile.length !== 10}
                onClick={handleMobileRequest}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
              >
                Request Change
              </button>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                value={father}
                onChange={(e) => setFather(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Profession
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Instagram Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </div>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="@username"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Facebook Profile Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </div>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-300 ml-1">
              Twitter / X Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </div>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="relative">
              <label className="text-sm font-medium text-slate-300 ml-1 mb-1 block">
                New Password (leave blank to keep current)
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 pt-6 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                minLength={6}
                placeholder="Enter new password to change..."
              />
            </div>
          </div>

          <motion.button
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full md:col-span-2 py-3 rounded-xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Save & Request Approval <Save className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
