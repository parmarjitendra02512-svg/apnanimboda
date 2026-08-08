"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Phone,
  Users,
  Shield,
  LogOut,
  Loader2,
  MessageSquare,
  Sun,
  Moon,
  Settings,
  Sparkles,
  Bell,
  Calendar,
  CloudSun,
  ShieldAlert,
  FileEdit,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  School,
  ChevronRight,
  User,
  Home,
  ArrowRight,
  ShieldCheck,
  PlayCircle,
  Activity,
  AlertCircle,
  Camera,
  Check,
  X,
  Plus,
  LayoutGrid,
  Heart,
  Send,
  Link as LinkIcon,
  Share2,
  MoreHorizontal,
  MessageCircle,
  MoreVertical,
  ThumbsUp,
  Volume2,
  VolumeX,
  Pause,
  Maximize,
  Download,
  Video,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  ref,
  onValue,
  set,
  push,
  serverTimestamp,
  update,
} from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import InstallPwa from "@/components/InstallPwa";
import { useTheme } from "@/components/ThemeProvider";
import GallerySlider from "@/components/GallerySlider";
import TiltCard from "@/components/TiltCard";
import { useHaptics } from "@/hooks/useHaptics";
import InstagramLoader from "@/components/InstagramLoader";
import TopNavigation from "@/components/dashboard/TopNavigation";
import CategoryGrid, {
  categoriesList,
} from "@/components/dashboard/CategoryGrid";
import UserDirectory from "@/components/dashboard/UserDirectory";
import BottomNavigation from "@/components/dashboard/BottomNavigation";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import ProfileModal from "@/components/dashboard/ProfileModal";
import SubCategorySelector from "@/components/dashboard/SubCategorySelector";
import AdminBroadcastBanner from "@/components/dashboard/AdminBroadcastBanner";
import FeaturedYouTubeCarousel from "@/components/dashboard/FeaturedYouTubeCarousel";
import AdBanner from "@/components/dashboard/AdBanner";
import QuickActions from "@/components/dashboard/QuickActions";
import InstallAppBanner from "@/components/dashboard/InstallAppBanner";

export default function Dashboard() {
  const [isStandalone, setIsStandalone] = useState(true);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("dashboard_loaded");
    }
    return true;
  });

  useEffect(() => {
    // If still loading, set timer
    if (isInitialLoading && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
        sessionStorage.setItem("dashboard_loaded", "true");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkStandalone = () => {
        const standalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone;
        setIsStandalone(!!standalone);
        if (!standalone) {
          setTimeout(() => setShowInstallPopup(true), 1000);
        }
      };
      checkStandalone();
      window
        .matchMedia("(display-mode: standalone)")
        .addEventListener("change", checkStandalone);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("cached_dashboard_users");
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("cached_dashboard_users");
    }
    return true;
  });
  const [features, setFeatures] = useState<Record<string, string>>({
    news: "active",
    weather: "active",
    reels: "active",
    edocs: "active",
    pincode: "active",
    emitra: "active",
    quiz: "active",
    youtube: "active",
  });
  const [maintenanceModal, setMaintenanceModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: "", message: "" });
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [broadcast, setBroadcast] = useState<any>(null);
  const [globalPrivacy, setGlobalPrivacy] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null,
  );
  const [categoriesControl, setCategoriesControl] = useState<any>({});
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [youtubeEmbeds, setYoutubeEmbeds] = useState<string[]>([]);
  const [heroAd, setHeroAd] = useState<any>(null);
  const [showAdminWelcome, setShowAdminWelcome] = useState(false);
  const itemsPerPage = 10;

  const { user, isAdmin, isApproved, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const triggerHaptic = useHaptics();

  useEffect(() => {
    if (!authLoading && !user) window.location.href = "/";
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    // Check if this is the first login to show Admin Welcome
    if (user && isApproved) {
      try {
        if (localStorage.getItem("welcomeAdminShown") !== "true") {
          setShowAdminWelcome(true);
        }
      } catch (e) {}
    }

    const usersRef = ref(db, "approved_users");
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const usersList = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      setUsers(usersList);
      setLoading(false);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "cached_dashboard_users",
            JSON.stringify(usersList),
          );
        } catch (e) {
          console.warn("Could not cache users in sessionStorage", e);
        }
      }
    }, (error) => {
      console.error("Firebase error fetching users:", error);
      setLoading(false);
    });

    // SAFETY TIMEOUT: If Firebase doesn't respond in 10 seconds, stop loading
    const dashboardTimer = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Check for admin broadcast messages
    const userId = user.uid || user.mobile;
    const chatId = ["admin_config_master", userId].sort().join("_");
    const msgsRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribeMsgs = onValue(msgsRef, (snap) => {
      const msgs = snap.val();
      if (msgs) {
        const msgList = Object.values(msgs).sort(
          (a: any, b: any) => b.timestamp - a.timestamp,
        );
        const lastMsg: any = msgList[0];
        // If last message is from admin and is less than 3 days old
        if (
          lastMsg &&
          lastMsg.senderId === "admin_config_master" &&
          Date.now() - lastMsg.timestamp < 3 * 24 * 60 * 60 * 1000
        ) {
          setBroadcast(lastMsg);
        }
      }
    });

    // Check Global Privacy and Features
    const settingsRef = ref(db, "admin_settings");
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.global_privacy !== undefined) {
          setGlobalPrivacy(data.global_privacy === true);
        }
        if (data.features) {
          const normalizeState = (val: any) => {
            if (val === true) return "active";
            if (val === false) return "hidden";
            return val || "active";
          };
          setFeatures({
            news: normalizeState(data.features.news),
            weather: normalizeState(data.features.weather),
            reels: normalizeState(data.features.reels),
            edocs: normalizeState(data.features.edocs),
            pincode: normalizeState(data.features.pincode),
            emitra: normalizeState(data.features.emitra),
            quiz: normalizeState(data.features.quiz),
            youtube: normalizeState(data.features.youtube),
            calling: normalizeState(data.features.calling),
          });
        }
        if (data.youtube_embeds) {
          setYoutubeEmbeds(data.youtube_embeds);
        } else if (data.youtube_embed) {
          // Fallback for single embed (legacy)
          setYoutubeEmbeds([data.youtube_embed]);
        } else {
          setYoutubeEmbeds([]);
        }
        if (data.hero_ad) {
          setHeroAd(data.hero_ad);
        } else {
          setHeroAd(null);
        }
      }
    });

    const catRef = ref(db, "admin_settings/categories");
    const unsubscribeCat = onValue(catRef, (snapshot) => {
      setCategoriesControl(snapshot.val() || {});
    });

    const customCatRef = ref(db, "admin_settings/custom_categories");
    const unsubscribeCustomCat = onValue(customCatRef, (snapshot) => {
      setCustomCategories(snapshot.val() || []);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeMsgs();
      unsubscribeSettings();
      unsubscribeCat();
      unsubscribeCustomCat();
    };
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);



  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(term);
    const locationMatch = u.location?.toLowerCase().includes(term);
    const mobileMatch = u.mobile?.toString().includes(term);
    const professionMatch = u.profession?.toLowerCase().includes(term);

    // If a specific category is selected, filter by that first
    let categoryMatch = true;
    if (selectedCategory && selectedCategory !== "all") {
      const p = (u.profession || "").toLowerCase();
      if (selectedCategory === "doctor")
        categoryMatch = p.includes("doctor") || p.includes("medical");
      else if (selectedCategory === "teacher")
        categoryMatch = p.includes("teacher") || p.includes("education");
      else if (selectedCategory === "business")
        categoryMatch =
          p.includes("shop") ||
          p.includes("business") ||
          p.includes("merchant");
      else if (selectedCategory === "services") {
        if (!selectedSubCategory)
          categoryMatch =
            p.includes("panchayat") ||
            p.includes("govt") ||
            p.includes("service") ||
            p.includes("sarpanch") ||
            p.includes("anganwadi") ||
            p.includes("ward");
        else {
          if (selectedSubCategory === "sarpanch")
            categoryMatch = p.includes("sarpanch") && !p.includes("up");
          else if (selectedSubCategory === "upsarpanch")
            categoryMatch =
              p.includes("upsarpanch") ||
              p.includes("up-sarpanch") ||
              p.includes("up sarpanch");
          else if (selectedSubCategory === "ward")
            categoryMatch = p.includes("ward") || p.includes("panch");
          else if (selectedSubCategory === "anganwadi")
            categoryMatch = p.includes("anganwadi");
          else
            categoryMatch =
              p.includes("panchayat") ||
              p.includes("govt") ||
              p.includes("service");
        }
      } else if (selectedCategory === "student") {
        if (!selectedSubCategory)
          categoryMatch =
            p.includes("student") || p.includes("study") || p.includes("class");
        else {
          if (selectedSubCategory === "school")
            categoryMatch = p.match(/class [1-9]/i) || p.match(/class 10/i);
          else if (selectedSubCategory === "highschool")
            categoryMatch = p.match(/class 11/i) || p.match(/class 12/i);
          else if (selectedSubCategory === "college")
            categoryMatch =
              p.includes("college") ||
              p.includes("bachelor") ||
              p.includes("master");
          else categoryMatch = p.includes("student");
        }
      } else {
        const customCat = customCategories.find(c => c.id === selectedCategory);
        if (customCat) {
          categoryMatch = p.includes(customCat.label.toLowerCase());
        }
      }
    }

    return (
      categoryMatch &&
      (nameMatch || locationMatch || mobileMatch || professionMatch)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <InstagramLoader className="w-12 h-12" />
      </div>
    );

  if (!user) return null;

  if (!isApproved && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center space-y-4 border-l-4 border-l-amber-500/50">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Pending Approval</h2>
          <p className="text-slate-300">
            Your account is waiting for admin approval. Once the admin approves
            your account, you will be able to access the village directory.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 px-6 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
          >
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
            <h2 className="text-white font-bold text-lg animate-pulse">
              Apna Nimboda
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`min-h-screen flex flex-col p-4 md:p-8 relative overflow-x-hidden transition-all duration-1000 ${
          isInitialLoading ? "blur-xl opacity-40 pointer-events-none scale-105" : "blur-0 opacity-100 scale-100"
        }`}
      >
        {/* Live Second Space Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-black">
        <img
          src="/space.jpg"
          alt="Live Space Theme"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1a]/80 via-purple-900/40 to-[#0a0a1a]/90 pointer-events-none -z-10 mix-blend-overlay" />

        {/* Removed heavy 3D Color Pulse Overlay to fix mobile stuttering */}
      </div>
      <TopNavigation
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        theme={theme}
        toggleTheme={toggleTheme}
        isAdmin={isAdmin}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto flex-1 z-10">
        {/* Admin Broadcast Banner */}
        <AdminBroadcastBanner broadcast={broadcast} />

        {/* Featured YouTube Video Carousel */}
        <FeaturedYouTubeCarousel features={features} youtubeEmbeds={youtubeEmbeds} />

        {/* Ad Banner */}
        <AdBanner heroAd={heroAd} />

        {/* Mac-Style App Dock (Quick Actions) */}
        <QuickActions features={features} setMaintenanceModal={setMaintenanceModal} />

        {/* Install App Banner (Near Grid) */}
        <InstallAppBanner showInstallPopup={showInstallPopup} setShowInstallPopup={setShowInstallPopup} />

        {/* Categories Bento Grid (Main View) */}
        {!selectedCategory && (
          <CategoryGrid
            searchTerm={searchTerm}
            categoriesControl={categoriesControl}
            customCategories={customCategories}
            setMaintenanceModal={setMaintenanceModal}
            triggerHaptic={triggerHaptic}
            onCategorySelect={(id) => {
              setSelectedCategory(id);
              setSelectedSubCategory(null);
              setCurrentPage(1);
              setSearchTerm("");
            }}
          />
        )}

        {/* Directory List View (When Category is selected) */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                {categoriesList.find((c) => c.id === selectedCategory)?.icon || <Search className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                  {categoriesList.find((c) => c.id === selectedCategory)?.label || customCategories.find((c) => c.id === selectedCategory)?.label}
                </h2>
              </div>
              <button
                onClick={() => {
                  if (selectedSubCategory) {
                    setSelectedSubCategory(null);
                  } else {
                    setSelectedCategory(null);
                    setSearchTerm("");
                  }
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors text-sm"
              >
                {selectedSubCategory
                  ? "Back to Sub-Categories"
                  : "Back"}
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search inside ${categoriesList.find((c) => c.id === selectedCategory)?.label || customCategories.find((c) => c.id === selectedCategory)?.label}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
              />
            </div>

            <SubCategorySelector
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
            />

            {((selectedCategory !== "services" &&
              selectedCategory !== "student") ||
              selectedSubCategory) && (
              <UserDirectory
                paginatedUsers={paginatedUsers}
                filteredUsersCount={filteredUsers.length}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                isAdmin={isAdmin}
                globalPrivacy={globalPrivacy}
                setSelectedUser={setSelectedUser}
              />
            )}
          </motion.div>
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        features={features}
        user={user}
      />

      {/* Footer Image Gallery */}
      <div className="w-full mt-12 mb-4">
        <GallerySlider requireLogin={false} />
      </div>

      {/* Maintenance Modal */}
      <AnimatePresence>
        {maintenanceModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() =>
                setMaintenanceModal({ show: false, title: "", message: "" })
              }
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-md p-6 relative z-10 border-t border-amber-500/50 shadow-2xl shadow-amber-500/10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {maintenanceModal.title}
              </h3>
              <p className="text-slate-300 mb-6">{maintenanceModal.message}</p>
              <button
                onClick={() =>
                  setMaintenanceModal({ show: false, title: "", message: "" })
                }
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Welcome Broadcast Modal */}
      <AnimatePresence>
        {showAdminWelcome && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setShowAdminWelcome(false);
                try {
                  localStorage.setItem("welcomeAdminShown", "true");
                } catch (e) {}
              }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10 border-t-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <Check className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Admin Broadcast
              </h3>
              <p className="text-slate-200 mb-8 text-lg leading-relaxed">
                Welcome to Apna Nimboda! Your account has been approved by the
                Administrator. If you need any help, you can reply here.
              </p>
              <button
                onClick={() => {
                  setShowAdminWelcome(false);
                  try {
                    localStorage.setItem("welcomeAdminShown", "true");
                  } catch (e) {}
                }}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-lg shadow-emerald-600/30 text-lg"
              >
                Okay, Thanks!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNavigation
        onOpenSidebar={() => setIsSidebarOpen(true)}
        activeTab="home"
        onHomeClick={() => {
          setSelectedCategory(null);
          setSelectedSubCategory(null);
          setSelectedUser(null);
          window.scrollTo(0, 0);
        }}
        onSearchClick={() => {
          setSelectedCategory(null);
          setSelectedSubCategory(null);
          setSelectedUser(null);
          window.scrollTo(0, 0);
          // Small delay to allow category reset to render before focusing
          setTimeout(() => {
            const searchInput = document.querySelector(
              'input[type="text"]',
            ) as HTMLInputElement;
            if (searchInput) searchInput.focus();
          }, 100);
        }}
      />

      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAdmin={isAdmin}
        theme={theme}
        toggleTheme={toggleTheme}
        handleLogout={logout}
        onInstallClick={() => setShowInstallPopup(true)}
      />
    </div>
    </>
  );
}
