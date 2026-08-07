"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  User,
  Loader2,
  ShieldCheck,
  Search,
  HelpCircle,
  MapPin,
  Briefcase,
  Store,
  CheckCircle2,
  Target,
  Info,
  IndianRupee,
  Wheat,
  Landmark,
  MessageCircle,
  Building2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

const BANK_WHATSAPP_NUMBERS = [
  {
    name: "SBI (State Bank of India)",
    number: "+91-9022690226",
    url: "https://wa.me/919022690226?text=Hi",
    color: "from-blue-600 to-blue-400",
  },
  {
    name: "PNB (Punjab National Bank)",
    number: "+91-9264092640",
    url: "https://wa.me/919264092640?text=Hi",
    color: "from-orange-600 to-yellow-500",
  },
  {
    name: "HDFC Bank",
    number: "+91-7070022222",
    url: "https://wa.me/917070022222?text=Hi",
    color: "from-blue-800 to-blue-600",
  },
  {
    name: "ICICI Bank",
    number: "+91-8640086400",
    url: "https://wa.me/918640086400?text=Hi",
    color: "from-orange-700 to-orange-500",
  },
  {
    name: "Bank of Baroda",
    number: "+91-8433888777",
    url: "https://wa.me/918433888777?text=Hi",
    color: "from-orange-500 to-orange-400",
  },
  {
    name: "Axis Bank",
    number: "+91-7036165000",
    url: "https://wa.me/917036165000?text=Hi",
    color: "from-rose-700 to-rose-500",
  },
  {
    name: "Union Bank of India",
    number: "+91-9666606060",
    url: "https://wa.me/919666606060?text=Hi",
    color: "from-red-600 to-red-400",
  },
  {
    name: "Kotak Mahindra Bank",
    number: "+91-2266006022",
    url: "https://wa.me/912266006022?text=Hi",
    color: "from-red-700 to-red-500",
  },
];

export default function VillageDirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [globalPrivacy, setGlobalPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<"emitra" | "banks">("emitra");
  const { user: currentUser, isAdmin } = useAuth();

  useEffect(() => {
    // Check Global Privacy
    const privacyRef = ref(db, "admin_settings/global_privacy");
    const unsubscribePrivacy = onValue(privacyRef, (snapshot) => {
      setGlobalPrivacy(snapshot.val() === true);
    });

    // Fetch users who are in 'e-Mitra' category or role
    const usersRef = ref(db, "users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Filter only emitra users
        const emitraUsers = usersArray.filter((u) => {
          const p = (u.profession || "").toLowerCase();
          return (
            p.includes("emitra") ||
            p.includes("e-mitra") ||
            p.includes("csc") ||
            p.includes("computer")
          );
        });

        setUsers(emitraUsers);
      } else {
        setUsers([]);
      }
      setLoading(false);
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

  const filteredUsers = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.gram_panchayat || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (u.pincode || "").includes(searchTerm) ||
      (u.profession || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredBanks = BANK_WHATSAPP_NUMBERS.filter((b) =>
    b.name.toLowerCase().includes(bankSearchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[url('https://images.unsplash.com/photo-1590845947698-8924d7409b56?q=80&w=2000')] bg-cover bg-center bg-fixed relative">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                e-Mitra & Bank Help
              </h1>
              <p className="text-xs text-amber-200">
                Official portals and WhatsApp support
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="w-full max-w-4xl z-10 flex-1 flex flex-col items-center">
        {/* Tabs for Navigation */}
        <div className="w-full max-w-md flex bg-white/10 p-1 rounded-xl mb-8 border border-white/10">
          <button
            onClick={() => setActiveTab("emitra")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === "emitra" ? "bg-amber-500 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >
            e-Mitra Services
          </button>
          <button
            onClick={() => setActiveTab("banks")}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === "banks" ? "bg-blue-500 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >
            Bank WhatsApp
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "emitra" && (
            <motion.div
              key="emitra"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              {/* Direct WhatsApp Service Banner */}
              <div className="w-full max-w-3xl bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 shadow-2xl mb-8 text-white relative overflow-hidden border border-green-400/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black mb-1">
                      डायरेक्ट ई-मित्र WhatsApp सेवा
                    </h3>
                    <p className="text-green-100 font-medium">
                      घर बैठे किसी भी ई-मित्र सेवा का लाभ लें। बस एक मैसेज
                      भेजें!
                    </p>
                  </div>
                  <a
                    href="https://wa.me/919461062705?text=Hello"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-green-600 px-6 py-3 rounded-xl font-extrabold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-xl w-full md:w-auto justify-center"
                  >
                    <MessageCircle className="w-6 h-6 fill-current" />
                    +91-9461062705
                  </a>
                </div>
              </div>

              {/* Rajasthan Gov Portal Card */}
              <div className="w-full max-w-3xl bg-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden mb-10 text-center border border-white/80">
                {/* Decorative Corner Element */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full"></div>

                <div className="bg-gradient-to-br from-[#fff3cd] to-[#ffe0b2] text-[#e65100] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
                  <Store className="w-10 h-10" />
                </div>

                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold mb-5 tracking-wide">
                  <CheckCircle2 className="w-4 h-4" /> राजस्थान सरकार पोर्टल
                </div>

                <h2 className="text-[#2c3e50] text-2xl md:text-3xl font-extrabold mb-3">
                  ई-मित्र सेवा केंद्र खोजें
                </h2>
                <p className="text-[#7f8c8d] text-base leading-relaxed mb-8 max-w-lg mx-auto">
                  अपने ब्लॉक, तहसील या ग्राम पंचायत के सक्रिय (Active) ई-मित्र
                  कियोस्क, संचालक का नाम और उनका मोबाइल नंबर तुरंत देखें।
                </p>

                <a
                  href="https://emitra.rajasthan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#ff9800] to-[#e65100] text-white px-8 py-4 rounded-full font-bold text-lg shadow-[0_6px_20px_rgba(245,124,0,0.4)] hover:shadow-[0_10px_25px_rgba(245,124,0,0.5)] hover:-translate-y-1 transition-all w-[85%] md:w-auto"
                >
                  <Target className="w-5 h-5" /> लाइव केंद्र ढूंढें
                </a>

                <div className="mt-8 flex items-center justify-center gap-3 text-xs text-gray-400 font-semibold uppercase tracking-widest">
                  <div className="h-px w-10 bg-gray-300"></div>
                  अन्य महत्वपूर्ण सेवाएं
                  <div className="h-px w-10 bg-gray-300"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 max-w-2xl mx-auto w-full px-4">
                  <a
                    href="https://jansoochna.rajasthan.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-[#2c3e50] px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
                  >
                    <Info className="w-4 h-4 text-[#00bcd4]" /> जन सूचना पोर्टल
                  </a>
                  <a
                    href="https://www.pmindia.gov.in/hi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-[#2c3e50] px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
                  >
                    <Landmark className="w-4 h-4 text-[#ff9800]" /> PMO इंडिया
                  </a>
                  <a
                    href="https://mandibhavindia.com/rajasthan-mandi-bhav"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 text-[#2c3e50] px-4 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
                  >
                    <Wheat className="w-4 h-4 text-[#4caf50]" /> अनाज मंडी भाव
                  </a>
                </div>

                <span className="block text-[11px] text-gray-400 mt-6">
                  * यह बॉक्स आपको सीधे राजस्थान सरकार की आधिकारिक वेबसाइटों से
                  जोड़ता है।
                </span>
              </div>

              <div className="w-full max-w-3xl mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by Shop Name or Location..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg backdrop-blur-xl"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 w-full">
                  <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
                  <p className="text-amber-200/50">
                    Loading e-Mitra directory...
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((person, index) => {
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
                            <ShieldCheck className="w-5 h-5 text-amber-400/30" />
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
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
                              <h3 className="text-lg font-bold text-white leading-tight">
                                {isMasked
                                  ? formatPrivateText(person.name || "User")
                                  : person.name || "User"}
                              </h3>
                              {person.profession && (
                                <div className="inline-flex items-center gap-1 mt-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px]">
                                  <Briefcase className="w-3 h-3" />
                                  {person.profession}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 space-y-2 bg-black/20 rounded-xl p-3 border border-white/5">
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="w-4 h-4 text-amber-400/50 shrink-0" />
                              <span className="text-white/90 font-mono tracking-wider">
                                {isMasked
                                  ? formatPrivateNumber(
                                      person.mobile?.toString(),
                                    )
                                  : person.mobile}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <MapPin className="w-4 h-4 text-amber-400/50 shrink-0" />
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
                    })
                  ) : (
                    <div className="col-span-2 text-center py-12 text-white/50">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No e-Mitra professionals found.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "banks" && (
            <motion.div
              key="banks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full max-w-4xl bg-blue-900/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30 mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <MessageCircle className="text-blue-400" /> Bank WhatsApp
                  Services
                </h2>
                <p className="text-blue-200/80 mb-6">
                  Connect with your bank's official WhatsApp bot to check
                  balance, mini statements, and other services instantly.
                </p>

                <div className="relative max-w-md">
                  <Filter className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                  <input
                    type="text"
                    value={bankSearchTerm}
                    onChange={(e) => setBankSearchTerm(e.target.value)}
                    placeholder="Filter by Bank Name (e.g. SBI, PNB)..."
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredBanks.map((bank, i) => (
                  <a
                    href={bank.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={i}
                    className={`bg-gradient-to-r ${bank.color} rounded-2xl p-5 flex items-center justify-between group hover:scale-[1.02] transition-transform shadow-lg cursor-pointer`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                        <Building2 className="w-6 h-6 text-slate-800" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {bank.name}
                        </h3>
                        <p className="text-white/80 font-mono text-sm">
                          {bank.number}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-green-600 transition-colors text-white">
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </div>
                  </a>
                ))}

                {filteredBanks.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-white/50 bg-black/20 rounded-2xl">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No banks found matching "{bankSearchTerm}".</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
