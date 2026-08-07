"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Play a premium futuristic chime sound using Web Audio API
    const playSound = () => {
      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();

        // Base oscillator
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Shimmer oscillator
        const osc2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();

        osc.type = "sine";
        osc2.type = "triangle";

        // Frequency sweep for a futuristic "power up" feel
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);

        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(
          1760,
          ctx.currentTime + 0.4,
        );

        // Volume envelope (fade in and out smoothly)
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

        gainNode2.gain.setValueAtTime(0, ctx.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gainNode2.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 1.0,
        );

        osc.connect(gainNode);
        osc2.connect(gainNode2);

        gainNode.connect(ctx.destination);
        gainNode2.connect(ctx.destination);

        osc.start();
        osc2.start();

        osc.stop(ctx.currentTime + 1.5);
        osc2.stop(ctx.currentTime + 1.5);
      } catch (e) {
        console.error("Audio play failed", e);
      }
    };

    playSound();

    // Hide splash screen after exactly 3 seconds
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050510] overflow-hidden"
        >
          {/* Background Animated Gemini-like Gradient Blobs */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center opacity-30"
          >
            <div className="absolute w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
            <div className="absolute w-[400px] h-[400px] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 ml-20" />
            <div className="absolute w-[400px] h-[400px] bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 mt-20" />
          </motion.div>

          {/* Glowing Gemini Style Star / AN Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 15,
              delay: 0.2,
            }}
            className="relative z-10 flex items-center justify-center"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
              {/* Glowing Aura behind text */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50"
              />

              {/* Text A N */}
              <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-purple-200 to-blue-200 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20">
                <span className="text-pink-300">A</span>N
              </h1>
            </div>
          </motion.div>

          {/* Brand Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 flex flex-col items-center z-10"
          >
            {/* Small Website Logo placeholder (Apna Nimboda original logo text) */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="text-white font-bold text-xl">AN</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-widest">
              APNA NIMBODA
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-3 text-xs text-purple-300/80 font-medium tracking-[0.3em] uppercase"
            >
              The Smart Village Network
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
