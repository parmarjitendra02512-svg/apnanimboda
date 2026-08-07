"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Maximize } from 'lucide-react';

export default function FeaturedYouTubeCarousel({ 
  features, 
  youtubeEmbeds 
}: { 
  features: Record<string, string>; 
  youtubeEmbeds: string[]; 
}) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (youtubeEmbeds.length <= 1 || isHovered || !isMuted) return;
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % youtubeEmbeds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [youtubeEmbeds.length, isHovered, isMuted]);

  const toggleMute = (e: any) => {
    e.stopPropagation();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: isMuted ? "unMute" : "mute",
          args: [],
        }),
        "*"
      );
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = (e: any) => {
    e.stopPropagation();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: isPlaying ? "pauseVideo" : "playVideo",
          args: [],
        }),
        "*"
      );
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = (e: any) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      }
    }
  };

  if (features.youtube === "hidden" || youtubeEmbeds.length === 0) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-8 w-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative aspect-[16/9] md:aspect-[21/9] bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVideoIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${
              youtubeEmbeds[currentVideoIndex].includes("<iframe")
                ? youtubeEmbeds[currentVideoIndex]
                    .match(/src="([^"]+)"/)?.[1]
                    ?.split("embed/")[1]
                    ?.split("?")[0]
                : youtubeEmbeds[currentVideoIndex]
            }?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&enablejsapi=1&playlist=${
              youtubeEmbeds[currentVideoIndex].includes("<iframe")
                ? youtubeEmbeds[currentVideoIndex]
                    .match(/src="([^"]+)"/)?.[1]
                    ?.split("embed/")[1]
                    ?.split("?")[0]
                : youtubeEmbeds[currentVideoIndex]
            }`}
            className="absolute left-0 w-full object-cover border-0 pointer-events-none"
            style={{ top: "-80px", height: "calc(100% + 160px)" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />

          {/* 
            Custom Controls Overlay 
            This blocks all clicks from reaching the iframe, securing it entirely from YouTube.
          */}
          <div className="absolute inset-0 z-10" onClick={togglePlay} />

          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 shadow-xl"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/10 shadow-xl"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Indicators */}
      {youtubeEmbeds.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {youtubeEmbeds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentVideoIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentVideoIndex ? "w-8 bg-red-500" : "w-2 bg-white/50 hover:bg-white/80"}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
