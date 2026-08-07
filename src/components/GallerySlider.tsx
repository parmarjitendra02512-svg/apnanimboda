"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function GallerySlider({
  requireLogin = false,
}: {
  requireLogin?: boolean;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const settingsRef = ref(db, "admin_settings/gallery");
    const unsub = onValue(settingsRef, (snap) => {
      const data = snap.val();
      if (data) {
        setIsVisible(data.visible ?? true);
        if (data.images && Array.isArray(data.images)) {
          setImages(data.images);
        } else {
          setImages([
            "/gallery/media__1783946648040.jpg",
            "/gallery/media__1783946648049.jpg",
            "/gallery/media__1783946648081.jpg",
            "/gallery/media__1783946648127.jpg",
            "/gallery/media__1783946762374.jpg",
            "/gallery/media__1783946762401.jpg",
            "/gallery/media__1783946762455.jpg",
          ]);
        }
      } else {
        setImages([
          "/gallery/media__1783946648040.jpg",
          "/gallery/media__1783946648049.jpg",
          "/gallery/media__1783946648081.jpg",
          "/gallery/media__1783946648127.jpg",
          "/gallery/media__1783946762374.jpg",
          "/gallery/media__1783946762401.jpg",
          "/gallery/media__1783946762455.jpg",
        ]);
      }
    });
    return () => unsub();
  }, []);

  if (!isVisible || images.length === 0) return null;

  const handleClick = (index: number) => {
    if (requireLogin) {
      router.push("/login");
    }
  };

  return (
    <div className="w-full overflow-hidden py-10 relative z-20">
      <h3 className="text-center text-white/90 font-bold text-3xl mb-8 drop-shadow-lg tracking-wide uppercase">
        Beautiful Nimboda
      </h3>

      {/* CSS Marquee Animation Container */}
      <div className="flex w-[200%] sm:w-[150%] animate-scroll hover:[animation-play-state:paused]">
        {/* We double the images array to create a seamless loop */}
        {[...images, ...images].map((src, i) => (
          <motion.div
            key={i}
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: -5,
              y: -10,
              zIndex: 10,
            }}
            style={{ transformStyle: "preserve-3d" }}
            className="w-72 sm:w-96 h-56 sm:h-72 mx-4 shrink-0 rounded-3xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(255,255,255,0.3)] border-2 border-white/30 hover:border-white/80 relative group transition-colors duration-300"
            onClick={() => handleClick(i % images.length)}
          >
            <motion.img
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.6 }}
              src={src}
              alt={`Nimboda Gallery ${i}`}
              className={`w-full h-full object-cover transition-all duration-700 ${requireLogin ? "blur-[3px] group-hover:blur-sm" : ""}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
