"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  X,
  ChevronRight,
  MapPin,
  Landmark,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import GallerySlider from "@/components/GallerySlider";
import LiveChatWidget from "@/components/LiveChatWidget";
import { MessageSquare } from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [adData, setAdData] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Default beautiful village/kisan images for the slider if no ad is set by admin
  const defaultImages = [
    "https://images.unsplash.com/photo-1592982537447-6f29dfcb69b3?q=80&w=1000&auto=format&fit=crop", // Indian farmer
    "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1000&auto=format&fit=crop", // Village sunrise
    "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=1000&auto=format&fit=crop", // Agriculture
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Redirect logic: if user is logged in, skip landing page and go to dashboard
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("tanumanu_user");
      if (userStr) {
        window.location.replace("/dashboard");
      }
    }
  }, []);

  const handleCloseAd = () => {
    setShowAd(false);
    try {
      localStorage.setItem("heroAdClosed", "true");
    } catch (e) {}
  };

  useEffect(() => {
    // Show ad after 1.5 seconds if never closed before
    const adTimer = setTimeout(() => {
      if (
        (function () {
          try {
            return localStorage.getItem("heroAdClosed") !== "true";
          } catch (e) {
            return true;
          }
        })()
      ) {
        setShowAd(true);
        // Auto close after 3 seconds of showing
        setTimeout(() => {
          handleCloseAd();
        }, 3000);
      }
    }, 1500);

    // Fetch custom ad from DB if any
    const adRef = ref(db, "admin_settings/hero_ad");
    const unsub = onValue(adRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        if (data.imageUrl || data.type === "text") {
          setAdData(data);
        }
      }
    });

    return () => {
      clearTimeout(adTimer);
      unsub();
    };
  }, []);

  useEffect(() => {
    // Cycle default images every 3 seconds if no custom ad
    if (showAd && !adData) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % defaultImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showAd, adData, defaultImages.length]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Optimized Background */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-black overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.1)_0%,transparent_70%)]" />
        <div className="absolute top-[10%] right-[-20%] w-[45rem] h-[45rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-20%] left-[10%] w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]" />
      </div>

      {/* Ad/Animation Banner Popup */}
      <AnimatePresence>
        {showAd && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-2xl bg-black/50 border border-white/20 rounded-2xl overflow-hidden shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)]">
              <button
                onClick={handleCloseAd}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              {adData ? (
                <div className="relative w-full min-h-[300px] flex flex-col items-center justify-center bg-black">
                  {adData.type === "video" ? (
                    <div className="w-full relative pt-[56.25%] bg-black">
                      <iframe
                        src={adData.imageUrl?.replace("watch?v=", "embed/")}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : adData.type === "text" ? (
                    <div className="p-12 text-center space-y-4">
                      <h2 className="text-3xl font-bold text-white">
                        {adData.title}
                      </h2>
                      <p className="text-slate-300 text-lg leading-relaxed">
                        {adData.description}
                      </p>
                      {adData.link && (
                        <a
                          href={adData.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                        >
                          Learn More
                        </a>
                      )}
                    </div>
                  ) : (
                    <a
                      href={adData.link || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block relative w-full h-[500px]"
                    >
                      <Image
                        src={adData.imageUrl}
                        alt="Advertisement"
                        fill
                        className="object-cover"
                        priority
                      />
                    </a>
                  )}
                  {(adData.type === "image" || adData.type === "video") &&
                    (adData.title || adData.description) && (
                      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
                        {adData.title && (
                          <h3 className="text-2xl font-bold text-white">
                            {adData.title}
                          </h3>
                        )}
                        {adData.description && (
                          <p className="text-slate-300 mt-1">
                            {adData.description}
                          </p>
                        )}
                      </div>
                    )}
                </div>
              ) : (
                <div className="relative w-full h-[400px]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={defaultImages[currentImageIndex]}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Village Life"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Connecting Our Roots
                    </h2>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-4xl text-center space-y-8 mt-12"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium text-sm mb-4 backdrop-blur-md"
        >
          v3.0 Ultra-Advanced Edition
        </motion.div>

        <motion.h1
          animate={{
            scale: [1, 1.05, 1],
            rotateX: [0, 10, 0],
            rotateY: [0, -10, 0],
            textShadow: [
              "0px 0px 0px rgba(255,255,255,0)",
              "0px 0px 30px rgba(255,255,255,0.8)",
              "0px 0px 0px rgba(255,255,255,0)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl"
        >
          Nimboda
        </motion.h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          The most secure, lightning-fast, and beautiful community platform ever
          built. Experience the future of connectivity.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center pt-8">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-white/5 border border-white/20 text-white font-semibold text-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 backdrop-blur-md"
              >
                View Pricing
              </motion.button>
            </Link>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-xl shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2"
              >
                Get Started <ChevronRight className="w-6 h-6" />
              </motion.button>
            </Link>
            <motion.button
              onClick={() => setIsChatOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-6 h-6" /> Help
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, staggerChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mt-24 z-10 relative px-4"
      >
        <FeatureCard
          icon={<Shield className="w-8 h-8 text-emerald-400" />}
          title="Bank-Level Security"
          description="Military-grade encryption for all your messages and contacts. Your data is strictly yours."
        />
        <FeatureCard
          icon={<Zap className="w-8 h-8 text-amber-400" />}
          title="Lightning Fast"
          description="Powered by Next.js & Edge computing. Loads instantly, everywhere."
        />
        <FeatureCard
          icon={<Users className="w-8 h-8 text-blue-400" />}
          title="Infinite Scale"
          description="Connect 100,000+ villagers seamlessly without a single drop in performance."
        />
        <FeatureCard
          icon={<MapPin className="w-8 h-8 text-rose-400" />}
          title="Live Smart Directory"
          description="Find doctors, shops, mechanics, and local services in Nimboda with just one click."
        />
        <FeatureCard
          icon={<Landmark className="w-8 h-8 text-purple-400" />}
          title="Digital Panchayat"
          description="Access E-Mitra documents, village news, and official announcements in real-time."
        />
        <FeatureCard
          icon={<Sparkles className="w-8 h-8 text-cyan-400" />}
          title="AI Village Assistant"
          description="Get instant, intelligent answers to your questions about the village 24/7."
        />
      </motion.div>

      {/* Dynamic Nimboda Gallery Slider */}
      <div className="w-full mt-24 mb-10 z-10 relative">
        <GallerySlider requireLogin={true} />
      </div>

      {/* Admin Chat */}
      <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5, y: -5 }}
      style={{ transformStyle: "preserve-3d" }}
      className="p-8 flex flex-col gap-5 text-left rounded-[2rem] ultra-glass border border-white/10 hover:border-blue-400/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center shadow-inner border border-white/10 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 relative z-10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white relative z-10">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm relative z-10">
        {description}
      </p>
    </motion.div>
  );
}
