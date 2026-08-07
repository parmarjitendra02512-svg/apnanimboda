"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

interface SoundContextType {
  playClick: () => void;
  playSwoosh: () => void;
  playSuccess: () => void;
  playError: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType>({
  playClick: () => {},
  playSwoosh: () => {},
  playSuccess: () => {},
  playError: () => {},
  isMuted: false,
  toggleMute: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Audio refs
  const clickAudio = useRef<HTMLAudioElement | null>(null);
  const swooshAudio = useRef<HTMLAudioElement | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    let savedMute = false;
    try {
      savedMute = localStorage.getItem("tanumanu_muted") === "true";
    } catch (e) {}
    setIsMuted(savedMute);

    // Initialize audio using data URIs for instant playback without network requests
    // Short click sound (synthesized low beep)
    clickAudio.current = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
    );
    // Very simple placeholder data URIs to avoid large base64 strings in code.
    // In a real production app, these would be proper small mp3s loaded from /public.
    // We will simulate the audio using Web Audio API for better performance and 0 latency.
  }, []);

  const playSynth = (
    type: "sine" | "square" | "sawtooth" | "triangle",
    freq: number,
    duration: number,
    vol = 0.1,
  ) => {
    if (isMuted || !mounted) return;
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors if browser blocks autoplay
    }
  };

  const playClick = () => playSynth("sine", 600, 0.1, 0.1);
  const playSwoosh = () => playSynth("triangle", 300, 0.2, 0.05);
  const playSuccess = () => {
    playSynth("sine", 400, 0.1, 0.1);
    setTimeout(() => playSynth("sine", 600, 0.2, 0.1), 100);
  };
  const playError = () => playSynth("sawtooth", 150, 0.3, 0.1);

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    try {
      localStorage.setItem("tanumanu_muted", String(newMute));
    } catch (e) {}
  };

  if (!mounted) return <>{children}</>;

  return (
    <SoundContext.Provider
      value={{
        playClick,
        playSwoosh,
        playSuccess,
        playError,
        isMuted,
        toggleMute,
      }}
    >
      {/* Global click listener to attach 'playClick' to all button/a clicks */}
      <div
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest("a")) {
            playClick();
          }
        }}
      >
        {children}
      </div>
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
