"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function AdBanner({ heroAd }: { heroAd: any }) {
  const [isAdDismissed, setIsAdDismissed] = useState(false);

  if (!heroAd || !(heroAd.title || heroAd.imageUrl || heroAd.description) || isAdDismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-8 w-full rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl relative cursor-pointer group"
      onClick={() => window.open(heroAd.link || "#", "_blank")}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsAdDismissed(true);
        }}
        className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
      >
        <X className="w-5 h-5" />
      </button>

      {heroAd.type === "image" && heroAd.imageUrl ? (
        <img
          src={heroAd.imageUrl}
          alt={heroAd.title}
          className="w-full h-auto object-cover max-h-[400px]"
        />
      ) : (
        <div className="p-8 text-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 min-h-[200px] flex flex-col justify-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            {heroAd.title}
          </h3>
          <p className="text-blue-200 text-lg">{heroAd.description}</p>
          {heroAd.link && (
            <span className="text-blue-400 mt-4 underline">
              Learn More
            </span>
          )}
        </div>
      )}

      {heroAd.type === "image" &&
        (heroAd.title || heroAd.description) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20">
            {heroAd.title && (
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 shadow-black drop-shadow-md">
                {heroAd.title}
              </h3>
            )}
            {heroAd.description && (
              <p className="text-slate-200 line-clamp-2 text-sm md:text-base drop-shadow-md">
                {heroAd.description}
              </p>
            )}
          </div>
        )}
    </motion.div>
  );
}
