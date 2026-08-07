"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart } from "lucide-react";

interface VideoPlayerProps {
  isVideo: boolean;
  mediaSrc: string;
  isActive: boolean;
  caption?: string;
  showHeartAnim: boolean;
}

export default function VideoPlayer({
  isVideo,
  mediaSrc,
  isActive,
  caption,
  showHeartAnim,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isActive) {
        videoRef.current
          .play()
          .then(() => setIsVideoPlaying(true))
          .catch(() => setIsVideoPlaying(false));
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  }, [isActive, isVideo]);

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo && videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  return (
    <>
      {isVideo ? (
        <div
          className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
          onClick={toggleVideoPlayback}
        >
          <video
            ref={videoRef}
            src={mediaSrc}
            className="w-full h-full object-cover"
            loop
            playsInline
            onContextMenu={(e) => e.preventDefault()}
          />
          {!isVideoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all">
              <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white shadow-2xl scale-110">
                <Play className="w-8 h-8 ml-1 fill-white" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 overflow-hidden pointer-events-none">
          <img
            src={mediaSrc}
            alt={caption || "Post"}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
          />
        </div>
      )}

      {/* Double Tap Heart Burst Animation */}
      <AnimatePresence>
        {showHeartAnim && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.9] }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.9)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
