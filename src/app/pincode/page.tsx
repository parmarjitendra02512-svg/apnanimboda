"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Search,
  Loader2,
  Building,
  AlertCircle,
  Map,
  User,
  ShieldCheck,
  Briefcase,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

export default function PincodePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postalResults, setPostalResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [globalPrivacy, setGlobalPrivacy] = useState(false);
  const { user: currentUser, isAdmin } = useAuth();

  useEffect(() => {
    // Check Global Privacy
    const privacyRef = ref(db, "admin_settings/global_privacy");
    const unsubscribePrivacy = onValue(privacyRef, (snapshot) => {
      setGlobalPrivacy(snapshot.val() === true);
    });

    // Fetch all users for directory search
    const usersRef = ref(db, "users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setAllUsers(usersArray);
      }
    });

    return () => {
      unsubscribePrivacy();
      unsubscribeUsers();
    };
  }, []);

  const formatPrivateText = (text: string) => {
    if (!text || text.length < 2) return text;
    return (
      text.charAt(0) +
      "*".repeat(text.length - 2) +
      text.charAt(text.length - 1)
    );
  };

  const formatPrivateNumber = (num: string) => {
    if (!num || num.length < 4) return num;
    return (
      num.substring(0, 2) +
      "*".repeat(num.length - 4) +
      num.substring(num.length - 2)
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setPostalResults([]);
    setUserResults([]);

    const term = searchTerm.toLowerCase().trim();

    // 1. Search Users (Name, Panchayat, Pincode)
    const matchedUsers = allUsers.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(term) ||
        (u.location || "").toLowerCase().includes(term) ||
        (u.gram_panchayat || "").toLowerCase().includes(term) ||
        (u.pincode || "").includes(term),
    );
    setUserResults(matchedUsers);

    // 2. If it's a 6 digit number, also search Postal API
    if (/^\d{6}$/.test(term)) {
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${term}`,
        );
        const data = await response.json();

        if (
          data &&
          data[0] &&
          data[0].Status === "Success" &&
          data[0].PostOffice
        ) {
          setPostalResults(data[0].PostOffice);
        }
      } catch (err) {
        console.error(err);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000')] bg-cover bg-center bg-fixed relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl glass-panel rounded-2xl p-4 md:p-6 flex items-center justify-between z-10 sticky top-4 mb-8 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" replace>
            <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                Village & Pincode Directory
              </h1>
              <p className="text-xs text-emerald-200">
                Search by Name, Panchayat, or Pincode
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="w-full max-w-4xl z-10 flex-1 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden mb-8 max-w-2xl"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none"></div>

          <form
            onSubmit={handleSearch}
            className="relative z-10 flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(e);
                }}
                placeholder="Name, Panchayat, or 6-digit Pincode..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg tracking-wide"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="py-4 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-8"
            >
              {/* User Directory Results */}
              {userResults.length > 0 && (
                <div>
                  <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <User className="text-emerald-400 w-6 h-6" /> Found{" "}
                    {userResults.length} People
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userResults.map((person, index) => {
                      const shouldMask =
                        globalPrivacy || person.force_mask || person.is_private;
                      const canView =
                        isAdmin ||
                        (currentUser && person.id === currentUser.uid);
                      const isMasked = shouldMask && !canView;

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={person.id}
                          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-400/30" />
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                              {person.photoUrl && !isMasked ? (
                                <img
                                  src={person.photoUrl}
                                  alt="Profile"
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
                                {isMasked
                                  ? formatPrivateText(person.name || "User")
                                  : person.name || "User"}
                                {person.profession && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />{" "}
                                    {person.profession}
                                  </span>
                                )}
                              </h3>
                              <p className="text-emerald-200/70 text-sm mt-0.5">
                                s/o {isMasked ? "****" : person.father || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2 bg-black/20 rounded-xl p-3 border border-white/5">
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="w-4 h-4 text-emerald-400/50 shrink-0" />
                              <span className="text-white/90 font-mono tracking-wider">
                                {isMasked
                                  ? formatPrivateNumber(
                                      person.mobile?.toString(),
                                    )
                                  : person.mobile}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <MapPin className="w-4 h-4 text-emerald-400/50 shrink-0" />
                              <span className="text-white/70">
                                {isMasked
                                  ? "Location Hidden"
                                  : [
                                      person.location,
                                      person.gram_panchayat,
                                      person.pincode,
                                    ]
                                      .filter(Boolean)
                                      .join(", ") || "No address"}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Postal Results */}
              {postalResults.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <Building className="text-emerald-400 w-6 h-6" /> Found{" "}
                    {postalResults.length} Post Offices
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {postalResults.map((office, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i}
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Building className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg leading-tight">
                              {office.Name}
                            </h3>
                            <p className="text-emerald-300 text-xs mt-1">
                              {office.BranchType}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-white/60">
                          <p>
                            <span className="text-white/40">Block:</span>{" "}
                            {office.Block}
                          </p>
                          <p>
                            <span className="text-white/40">Dist:</span>{" "}
                            {office.District}
                          </p>
                          <p>
                            <span className="text-white/40">State:</span>{" "}
                            {office.State}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!loading &&
                userResults.length === 0 &&
                postalResults.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/10"
                  >
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No results found for "{searchTerm}".</p>
                    <p className="text-sm mt-2 opacity-60">
                      Try searching by Name, Panchayat, or a 6-digit Pincode.
                    </p>
                  </motion.div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
