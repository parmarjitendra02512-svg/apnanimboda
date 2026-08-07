"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Check,
  X,
  Users,
  Edit2,
  Loader2,
  Save,
  MessageSquare,
  Monitor,
  Image as ImageIcon,
  Activity,
  Bot,
  Video,
  Search,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import UserEditModal from "@/components/admin/UserEditModal";
import BanUserModal from "@/components/admin/BanUserModal";
import AdminHeader from "@/components/admin/AdminHeader";
import DirectoryTab from "@/components/admin/DirectoryTab";
import SettingsTab from "@/components/admin/SettingsTab";
import ComplianceTab from "@/components/admin/ComplianceTab";
import BulkUploader from "@/components/admin/BulkUploader";
import EditProfileModal from "@/components/admin/EditProfileModal";
import CategoryEditor from "@/components/admin/CategoryEditor";
import KundliTab from "@/components/admin/KundliTab";
import LocationTab from "@/components/admin/LocationTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import NoticeBoardTab from "@/components/admin/NoticeBoardTab";
import InboxTab from "@/components/admin/InboxTab";
import SecurityTab from "@/components/admin/SecurityTab";
import ArchivedTab from "@/components/admin/ArchivedTab";
import BroadcastModal from "@/components/admin/BroadcastModal";

import { db } from "@/lib/firebase";
import { adminApiCall } from "@/lib/api";
import { ref, onValue, set, remove, update } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("directory"); // directory, monitor, settings
  const [requests, setRequests] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [aiChats, setAiChats] = useState<any[]>([]);
  const [banModalUser, setBanModalUser] = useState<any>(null);
  const [banDuration, setBanDuration] = useState("permanent");
  const [pendingEdits, setPendingEdits] = useState<any[]>([]);
  const [pendingResets, setPendingResets] = useState<any[]>([]);
  const [pendingMobileUpdates, setPendingMobileUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [categoriesControl, setCategoriesControl] = useState<any>({});
  const [archivedUsers, setArchivedUsers] = useState<any[]>([]);
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [searchLogs, setSearchLogs] = useState<any[]>([]);
  const [clickLogs, setClickLogs] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState(0);
  const [appInstalls, setAppInstalls] = useState(0);
  const [kundliActiveTab, setKundliActiveTab] = useState("overview");
  const [posts, setPosts] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);

  // Settings State
  const [openAiKey, setOpenAiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [newsApiKey, setNewsApiKey] = useState("");
  const [savingNewsKey, setSavingNewsKey] = useState(false);
  const [weatherApiKey, setWeatherApiKey] = useState("");
  const [savingWeatherKey, setSavingWeatherKey] = useState(false);
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [savingYoutubeKey, setSavingYoutubeKey] = useState(false);
  const [digilockerApiKey, setDigilockerApiKey] = useState("");
  const [digilockerClientId, setDigilockerClientId] = useState("");
  const [digilockerApiUrl, setDigilockerApiUrl] = useState("");
  const [savingDigilocker, setSavingDigilocker] = useState(false);
  const [globalPrivacy, setGlobalPrivacy] = useState(false);
  const [features, setFeatures] = useState<Record<string, string>>({
    news: "active",
    weather: "active",
    reels: "active",
    edocs: "active",
    pincode: "active",
    emitra: "active",
    quiz: "active",
    youtube: "active",
    calling: "active",
  });
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [adType, setAdType] = useState("image");
  const [adTitle, setAdTitle] = useState("");
  const [adDesc, setAdDesc] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adLink, setAdLink] = useState("");
  const [savingAd, setSavingAd] = useState(false);
  const [youtubeEmbed, setYoutubeEmbed] = useState("");
  const [savingYoutube, setSavingYoutube] = useState(false);

  // User Management State
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Kundli Search State
  const [kundliSearchQuery, setKundliSearchQuery] = useState("");
  const [kundliResult, setKundliResult] = useState<any>(null);

  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) window.location.href = "/";
    if (!authLoading && user && !isAdmin) router.push("/dashboard");
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const requestsRef = ref(db, "pending_requests");
    const approvedRef = ref(db, "approved_users");
    const editsRef = ref(db, "pending_edits");
    const resetsRef = ref(db, "pending_resets");
    const mobileUpdatesRef = ref(db, "pending_mobile_updates");
    const bannedRef = ref(db, "banned_users");
    const settingsRef = ref(db, "admin_settings");
    const chatsRef = ref(db, "chats");
    const catRef = ref(db, "admin_settings/categories");
    const searchLogsRef = ref(db, "search_logs");
    const clickLogsRef = ref(db, "click_logs");
    const archivedRef = ref(db, "archived_users");
    const supportChatsRef = ref(db, "support_chats");
    const systemLogsRef = ref(db, "system_logs");
    const postsRef = ref(db, "posts");

    const unsubscribeReq = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      setRequests(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [],
      );
    });

    const unsubscribeAppr = onValue(approvedRef, (snapshot) => {
      const data = snapshot.val();
      setApprovedUsers(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [],
      );
      setLoading(false);
    });

    const unsubscribeEdits = onValue(editsRef, (snapshot) => {
      const data = snapshot.val();
      setPendingEdits(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [],
      );
    });

    const unsubscribeResets = onValue(resetsRef, (snapshot) => {
      const data = snapshot.val();
      setPendingResets(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [],
      );
    });

    const unsubscribeMobileUpdates = onValue(mobileUpdatesRef, (snapshot) => {
      const data = snapshot.val();
      setPendingMobileUpdates(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [],
      );
    });

    const unsubscribeBanned = onValue(bannedRef, (snapshot) => {
      const data = snapshot.val();
      setBannedUsers(
        data
          ? Object.keys(data).map((key) => ({ mobile: key, ...data[key] }))
          : [],
      );
    });

    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.openai_key) setOpenAiKey(data.openai_key);
        if (data.news_api_key) setNewsApiKey(data.news_api_key);
        if (data.weather_api_key) setWeatherApiKey(data.weather_api_key);
        if (data.api_keys?.youtube) setYoutubeApiKey(data.api_keys.youtube);
        if (data.digilocker_api_key)
          setDigilockerApiKey(data.digilocker_api_key);
        if (data.digilocker_client_id)
          setDigilockerClientId(data.digilocker_client_id);
        if (data.digilocker_api_url)
          setDigilockerApiUrl(data.digilocker_api_url);
        if (data.global_privacy !== undefined)
          setGlobalPrivacy(data.global_privacy);
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
          });
        }
        if (data.hero_ad) {
          setAdType(data.hero_ad.type || "image");
          setAdTitle(data.hero_ad.title || "");
          setAdDesc(data.hero_ad.description || "");
          setAdImageUrl(data.hero_ad.imageUrl || "");
          setAdLink(data.hero_ad.link || "");
        }
        if (data.youtube_embed_raw !== undefined) {
          setYoutubeEmbed(data.youtube_embed_raw);
        } else if (data.youtube_embed !== undefined) {
          setYoutubeEmbed(data.youtube_embed);
        }
      }
    });

    const unsubscribeChats = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      setChats(
        data
          ? Object.entries(data).map(([id, val]) => ({ id, ...(val as any) }))
          : [],
      );
    });

    const aiChatsRef = ref(db, "ai_chats_v2");
    
    const unsubscribeAiChats = onValue(aiChatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedChats: any[] = [];
        Object.entries(data).forEach(([userId, userChats]: any) => {
          Object.entries(userChats).forEach(([chatId, chatData]: any) => {
            formattedChats.push({
              id: `${userId}_${chatId}`,
              userId,
              mobile: userId,
              ...(chatData as any),
            });
          });
        });
        setAiChats(formattedChats.sort((a, b) => b.lastUpdated - a.lastUpdated));
      } else {
        setAiChats([]);
      }
    });

    const unsubscribeCat = onValue(catRef, (snapshot) => {
      setCategoriesControl(snapshot.val() || {});
    });

    const unsubscribeSearchLogs = onValue(searchLogsRef, (snapshot) => {
      const data = snapshot.val();
      setSearchLogs(
        data
          ? Object.values(data).sort(
              (a: any, b: any) => b.timestamp - a.timestamp,
            )
          : [],
      );
    });

    const unsubscribeClickLogs = onValue(clickLogsRef, (snapshot) => {
      const data = snapshot.val();
      setClickLogs(
        data
          ? Object.values(data).sort(
              (a: any, b: any) => b.timestamp - a.timestamp,
            )
          : [],
      );
    });

    const unsubscribeArchived = onValue(archivedRef, (snapshot) => {
      const data = snapshot.val();
      setArchivedUsers(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [],
      );
    });

    const analyticsRef = ref(db, "analytics");
    const unsubscribeAnalytics = onValue(analyticsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPageViews(data.pageViews || 0);
        setAppInstalls(data.appInstalls || 0);
      }
    });

    const unsubscribeSupport = onValue(supportChatsRef, (snapshot) => {
      const data = snapshot.val();
      setSupportChats(
        data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [],
      );
    });

    const unsubscribeSystemLogs = onValue(systemLogsRef, (snapshot) => {
      const data = snapshot.val();
      setSystemLogs(
        data
          ? Object.entries(data)
              .map(([id, val]) => ({ id, ...(val as any) }))
              .sort((a: any, b: any) => b.timestamp - a.timestamp)
          : [],
      );
    });

    const unsubscribePosts = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      setPosts(
        data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []
      );
    });

    return () => {
      unsubscribeReq();
      unsubscribeAppr();
      unsubscribeEdits();
      unsubscribeResets();
      unsubscribeMobileUpdates();
      unsubscribeBanned();
      unsubscribeSettings();
      unsubscribeChats();
      unsubscribeAiChats();
      unsubscribeCat();
      unsubscribeSearchLogs();
      unsubscribeClickLogs();
      unsubscribeArchived();
      unsubscribeSupport();
      unsubscribeSystemLogs();
      unsubscribePosts();
    };
  }, [user, isAdmin, router, authLoading]);

  const handleLogout = async () => {
    if (logout) {
      await logout();
      window.location.href = "/";
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      await adminApiCall("save_admin_setting", { path: "openai_key", value: openAiKey });
      alert("API Key saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save API Key");
    } finally {
      setSavingKey(false);
    }
  };

  const handleSaveNewsApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNewsKey(true);
    try {
      await adminApiCall("save_admin_setting", { path: "news_api_key", value: newsApiKey });
      alert("News API Key saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save News API Key");
    } finally {
      setSavingNewsKey(false);
    }
  };

  const handleSaveWeatherApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWeatherKey(true);
    try {
      await adminApiCall("save_admin_setting", { path: "weather_api_key", value: weatherApiKey });
      alert("Weather API Key saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save Weather API Key");
    } finally {
      setSavingWeatherKey(false);
    }
  };

  const handleSaveYoutubeApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingYoutubeKey(true);
    try {
      await adminApiCall("save_admin_setting", { path: "api_keys/youtube", value: youtubeApiKey });
      alert("YouTube API Key saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save YouTube API Key");
    } finally {
      setSavingYoutubeKey(false);
    }
  };

  const handleSaveDigilockerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDigilocker(true);
    try {
      await adminApiCall("save_admin_setting", { path: "digilocker_api_key", value: digilockerApiKey });
      await adminApiCall("save_admin_setting", { path: "digilocker_client_id", value: digilockerClientId });
      await adminApiCall("save_admin_setting", { path: "digilocker_api_url", value: digilockerApiUrl });
      alert("e-Documents Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save e-Documents Settings");
    } finally {
      setSavingDigilocker(false);
    }
  };

  const handleToggleGlobalPrivacy = async () => {
    try {
      await adminApiCall("save_admin_setting", { path: "global_privacy", value: !globalPrivacy });
      setGlobalPrivacy(!globalPrivacy);
    } catch (err) {
      console.error(err);
      alert("Failed to update privacy settings");
    }
  };

  const handleChangeFeatureState = async (
    featureKey: string,
    newState: string,
  ) => {
    try {
      await adminApiCall("save_admin_setting", { path: `features/${featureKey}`, value: newState });
      setFeatures((prev) => ({ ...prev, [featureKey]: newState }));
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${featureKey}`);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error("Backup failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nimboda_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(err.message || "Error downloading backup");
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAd(true);
    try {
      await adminApiCall("save_admin_setting", {
        path: "hero_ad",
        value: {
          type: adType,
          title: adTitle,
          description: adDesc,
          imageUrl: adImageUrl,
          link: adLink,
        }
      });
      alert("Ad Banner saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save Ad Banner");
    } finally {
      setSavingAd(false);
    }
  };

  const handleSaveYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingYoutube(true);
    try {
      const regex =
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/g;
      const videoIds = [];
      let match;
      while ((match = regex.exec(youtubeEmbed)) !== null) {
        videoIds.push(match[1]);
      }

      // Limit to 10
      const finalIds = videoIds.slice(0, 10);

      await adminApiCall("save_admin_setting", { path: "youtube_embeds", value: finalIds });
      await adminApiCall("save_admin_setting", { path: "youtube_embed_raw", value: youtubeEmbed });
      await adminApiCall("save_admin_setting", { path: "youtube_embed", value: null });

      alert(`Saved ${finalIds.length} YouTube videos successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to save YouTube Embeds");
    } finally {
      setSavingYoutube(false);
    }
  };

  const handleApprove = async (req: any) => {
    try {
      await adminApiCall("approve_user", { req });
    } catch (error) {
      console.error("Failed to approve", error);
      alert("Approve Failed: " + error);
    }
  };

  const handleReject = async (req: any) => {
    const reason = window.prompt(
      "Are you sure you want to reject this request? Provide a reason (user will see this):",
    );
    if (reason !== null) {
      try {
        await adminApiCall("reject_user", { req, reason: reason || "Violation of terms" });
      } catch (error) {
        console.error("Failed to reject", error);
        alert("Reject Failed: " + error);
      }
    }
  };

  const handleApproveEdit = async (edit: any) => {
    try {
      await adminApiCall("approve_edit", { edit });
    } catch (error) {
      console.error("Failed to approve edit", error);
    }
  };

  const handleRejectEdit = async (editId: string) => {
    if (window.confirm("Reject these profile changes?")) {
      try {
        await adminApiCall("reject_edit", { editId });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleApproveReset = async (reset: any) => {
    try {
      await adminApiCall("approve_reset", { mobile: reset.mobile, newPasswordHash: reset.requestedPasswordHash });
    } catch (error) {
      console.error("Failed to approve reset", error);
    }
  };

  const handleRejectReset = async (reset: any) => {
    if (window.confirm("Reject this password reset request?")) {
      try {
        await adminApiCall("reject_reset", { mobile: reset.mobile });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleApproveMobileUpdate = async (updateReq: any) => {
    if (window.confirm(`Approve mobile number change from ${updateReq.oldMobile} to ${updateReq.newMobile}?`)) {
      try {
        await adminApiCall("approve_mobile_update", {
          oldMobile: updateReq.oldMobile,
          newMobile: updateReq.newMobile
        });
      } catch (error) {
        console.error(error);
        alert("Failed to approve mobile update");
      }
    }
  };

  const handleRejectMobileUpdate = async (oldMobile: string) => {
    if (window.confirm("Reject this mobile number update?")) {
      try {
        await adminApiCall("reject_mobile_update", { oldMobile });
      } catch (error) {
        console.error(error);
        alert("Failed to reject mobile update");
      }
    }
  };

  const handleDeleteUser = async (u: any) => {
    const reason = window.prompt(
      `Are you sure you want to permanently delete ${u.name}? Provide a reason (they will see this):`,
    );
    if (reason !== null) {
      try {
        await adminApiCall("archive_user", { user: { ...u, deleteReason: reason || "Violation of platform rules" } });
      } catch (error: any) {
        console.error(error);
        alert("Failed to delete user: " + (error.message || "Unknown error"));
      }
    }
  };

  const handlePermanentDeleteUser = async (u: any) => {
    const reason = window.prompt(
      `CRITICAL: Are you sure you want to PERMANENTLY delete ${u.name}? This cannot be undone. Type 'DELETE' to confirm:`,
    );
    if (reason === "DELETE") {
      try {
        await adminApiCall("delete_user", { mobile: u.mobile, id: u.id });
        setKundliResult(null);
        alert("User permanently deleted.");
      } catch (error: any) {
        console.error(error);
        alert("Failed to delete user: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleBanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banModalUser) return;
    try {
      let bannedUntil = null;
      if (banDuration !== "permanent") {
        const days = parseInt(banDuration);
        bannedUntil = Date.now() + days * 24 * 60 * 60 * 1000;
      }
      await adminApiCall("ban_user", { banModalUser, bannedUntil });
      setBanModalUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnban = async (mobile: string) => {
    try {
      await adminApiCall("unban_user", { mobile });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDirectEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApiCall("direct_edit_user", { editingUser });
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to save edit", error);
    }
  };

  const handleUpdateCategoryState = async (
    categoryId: string,
    newState: string,
  ) => {
    try {
      // We will use save_admin_setting to update the specific state path
      await adminApiCall("save_admin_setting", { path: `categories/${categoryId}/state`, value: newState });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategoryMessage = async (
    categoryId: string,
    message: string,
  ) => {
    try {
      await adminApiCall("save_admin_setting", { path: `categories/${categoryId}/lockMessage`, value: message });
      alert("Message updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const coreCategories = [
    { id: "doctor", label: "Doctors & Medical" },
    { id: "teacher", label: "Teachers & Education" },
    { id: "business", label: "Shops & Businesses" },
    { id: "services", label: "Gram Panchayat" },
    { id: "student", label: "Students" },
  ];

  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastPhotoUrl, setBroadcastPhotoUrl] = useState("");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText && !broadcastPhotoUrl) return;
    setBroadcastLoading(true);
    try {
      let finalMessage = broadcastText;
      if (broadcastPhotoUrl) {
        finalMessage += `\n\n![Image](${broadcastPhotoUrl})`;
      }
      await adminApiCall("send_broadcast", { message: finalMessage, approvedUsers });
      setBroadcastText("");
      setBroadcastPhotoUrl("");
      setShowBroadcastModal(false);
      alert("Announcement sent to all verified users!");
    } catch (error) {
      console.error(error);
      alert("Failed to send broadcast");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleAdminDeleteMessage = async (chatId: string, msgKey: string) => {
    if (
      confirm(
        "Delete this message? It will be hidden from users but kept in logs for you.",
      )
    ) {
      try {
        await adminApiCall("delete_chat_message", { chatId, msgKey });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleBroadcastPhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBroadcastPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for Monitor tab
  const getUsernameById = (id: string) => {
    if (id === "admin_config_master") return "Admin (You)";
    const user = approvedUsers.find((u) => u.id === id);
    return user ? user.name : "Unknown User";
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <AdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowBroadcastModal={setShowBroadcastModal}
        handleLogout={handleLogout}
        pageViews={pageViews}
        appInstalls={appInstalls}
      />

      <main className="w-full max-w-6xl mx-auto flex-1 z-10">
        {/* DIRECTORY TAB */}
        {activeTab === "directory" && (
          <DirectoryTab
            requests={requests}
            handleApprove={handleApprove}
            handleReject={handleReject}
            pendingEdits={pendingEdits}
            pendingResets={pendingResets}
            pendingMobileUpdates={pendingMobileUpdates}
            handleApproveEdit={handleApproveEdit}
            handleRejectEdit={handleRejectEdit}
            handleApproveReset={handleApproveReset}
            handleRejectReset={handleRejectReset}
            handleApproveMobileUpdate={handleApproveMobileUpdate}
            handleRejectMobileUpdate={handleRejectMobileUpdate}
            approvedUsers={approvedUsers}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            userCurrentPage={userCurrentPage}
            setUserCurrentPage={setUserCurrentPage}
            itemsPerPage={itemsPerPage}
            setEditingUser={setEditingUser}
            setBanModalUser={setBanModalUser}
            handleDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === "bulk_upload" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Bulk Uploader</h2>
              <p className="text-slate-400">Upload multiple users via CSV (Excel) file</p>
            </div>
            <BulkUploader onSuccess={() => setActiveTab("directory")} />
          </motion.div>
        )}

        {/* KUNDLI TAB */}
        {activeTab === "kundli" && (
          <KundliTab
            kundliSearchQuery={kundliSearchQuery}
            setKundliSearchQuery={setKundliSearchQuery}
            kundliResult={kundliResult}
            setKundliResult={setKundliResult}
            kundliActiveTab={kundliActiveTab}
            setKundliActiveTab={setKundliActiveTab}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            approvedUsers={approvedUsers}
            bannedUsers={bannedUsers}
            archivedUsers={archivedUsers}
            aiChats={aiChats}
            supportChats={supportChats}
            chats={chats}
            searchLogs={searchLogs}
            clickLogs={clickLogs}
            handlePermanentDeleteUser={handlePermanentDeleteUser}
            getUsernameById={getUsernameById}
          />
        )}

        {/* LOCATION TAB */}
        {activeTab === "location" && (
          <LocationTab approvedUsers={approvedUsers} />
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <CategoriesTab
            coreCategories={coreCategories}
            categoriesControl={categoriesControl}
            handleUpdateCategoryState={handleUpdateCategoryState}
            handleUpdateCategoryMessage={handleUpdateCategoryMessage}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <SettingsTab
            youtubeApiKey={youtubeApiKey}
            setYoutubeApiKey={setYoutubeApiKey}
            savingYoutubeKey={savingYoutubeKey}
            handleSaveYoutubeApiKey={handleSaveYoutubeApiKey}
            globalPrivacy={globalPrivacy}
            handleToggleGlobalPrivacy={handleToggleGlobalPrivacy}
            features={features}
            handleChangeFeatureState={handleChangeFeatureState}
            adType={adType}
            setAdType={setAdType}
            adTitle={adTitle}
            setAdTitle={setAdTitle}
            adDesc={adDesc}
            setAdDesc={setAdDesc}
            adImageUrl={adImageUrl}
            setAdImageUrl={setAdImageUrl}
            adLink={adLink}
            setAdLink={setAdLink}
            savingAd={savingAd}
            handleSaveAd={handleSaveAd}
            youtubeEmbed={youtubeEmbed}
            setYoutubeEmbed={setYoutubeEmbed}
            savingYoutube={savingYoutube}
            handleSaveYoutube={handleSaveYoutube}
            handleBackup={handleBackup}
          />
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === "compliance" && <ComplianceTab />}
      </main>

      {/* Admin Direct Edit Modal */}
      <UserEditModal
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        handleDirectEditSave={handleDirectEditSave}
      />

      {/* NOTICE BOARD TAB */}
      {activeTab === "notice_board" && (
        <NoticeBoardTab posts={posts} />
      )}

      {/* INBOX TAB */}
      {activeTab === "inbox" && (
        <InboxTab supportChats={supportChats} />
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <SecurityTab systemLogs={systemLogs} />
      )}

      {/* ARCHIVED TAB */}
      {activeTab === "archived" && (
        <ArchivedTab archivedUsers={archivedUsers} />
      )}

      {/* Ban User Modal */}
      <BanUserModal
        banModalUser={banModalUser}
        setBanModalUser={setBanModalUser}
        banDuration={banDuration}
        setBanDuration={setBanDuration}
        handleBanSubmit={handleBanSubmit}
      />

      {/* Broadcast Modal */}
      <BroadcastModal
        showBroadcastModal={showBroadcastModal}
        setShowBroadcastModal={setShowBroadcastModal}
        broadcastText={broadcastText}
        setBroadcastText={setBroadcastText}
        broadcastPhotoUrl={broadcastPhotoUrl}
        handleBroadcastPhotoUpload={handleBroadcastPhotoUpload}
        handleBroadcastSubmit={handleBroadcastSubmit}
        broadcastLoading={broadcastLoading}
      />
    </div>
  );
}

