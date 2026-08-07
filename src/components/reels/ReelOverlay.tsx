"use client";

import { Heart, MessageCircle, Share2, Disc, User, Music, Volume2, VolumeX } from "lucide-react";

interface ReelOverlayProps {
  reel: any;
  isLiked: boolean;
  onLike: (id: string) => void;
  onCommentClick: (reel: any) => void;
  handleShare: () => void;
  isAudioPlaying: boolean;
  isActive: boolean;
  onToggleAudio: (e?: React.MouseEvent) => void;
  songTitle: string;
  artistTitle: string;
}

export default function ReelOverlay({
  reel,
  isLiked,
  onLike,
  onCommentClick,
  handleShare,
  isAudioPlaying,
  isActive,
  onToggleAudio,
  songTitle,
  artistTitle,
}: ReelOverlayProps) {
  return (
    <>
      {/* Right Action Bar */}
      <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-5 z-20">
        {/* Profile Pic with golden border */}
        <div className="relative group cursor-pointer mb-1">
          <div className="w-11 h-11 rounded-full border-2 border-amber-400 overflow-hidden bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg">
            {reel.authorPhoto ? (
              <img
                src={reel.authorPhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border border-black text-[9px] font-bold text-black">
            ✓
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(reel.id);
          }}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <Heart
            className={`w-7 h-7 transition-transform drop-shadow-md ${isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-white hover:scale-110"}`}
          />
          <span className="text-white text-xs font-bold drop-shadow-md">
            {reel.likes ? Object.keys(reel.likes).length : 0}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick(reel);
          }}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <MessageCircle className="w-7 h-7 text-white drop-shadow-md hover:scale-110 transition-transform" />
          <span className="text-white text-xs font-bold drop-shadow-md">
            {reel.comments
              ? Object.values(reel.comments).filter((c: any) => !c.deleted)
                  .length
              : 0}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
        >
          <Share2 className="w-7 h-7 text-white drop-shadow-md hover:scale-110 transition-transform" />
          <span className="text-white text-xs font-bold drop-shadow-md">
            शेयर
          </span>
        </button>

        {/* Instagram Spinning Vinyl Disc */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleAudio(e);
          }}
          title={isAudioPlaying ? "म्यूट करें" : "संगीत चलाएं"}
          className="relative w-10 h-10 mt-1 cursor-pointer group active:scale-90 transition-transform"
        >
          <div
            className={`w-10 h-10 rounded-full bg-zinc-950 border-2 border-amber-400/80 flex items-center justify-center shadow-xl overflow-hidden ${isAudioPlaying && isActive ? "animate-[spin_4s_linear_infinite]" : ""}`}
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 border border-black flex items-center justify-center">
              <Disc className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          {isAudioPlaying && isActive && (
            <span className="absolute -top-2 -right-1 text-[10px] animate-bounce">
              🎵
            </span>
          )}
        </button>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-white font-bold text-base drop-shadow-lg flex items-center gap-1.5">
            {reel.authorName || "Admin"}
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-black text-[9px] font-bold flex items-center justify-center inline-flex">
              ✓
            </span>
          </span>
          <span className="text-white/80 font-medium text-xs drop-shadow-lg">
            @{reel.authorHandle || "nimboda_official"}
          </span>
        </div>

        <p className="text-white text-xs w-[78%] drop-shadow-md line-clamp-3 mb-2.5 leading-relaxed whitespace-pre-line font-medium">
          {reel.caption}
        </p>

        {/* Instagram Moving Music Ticker */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleAudio(e);
          }}
          className="pointer-events-auto flex items-center gap-2 text-white/95 text-xs font-semibold bg-black/60 border border-white/20 w-max max-w-[78%] px-3 py-1.5 rounded-full backdrop-blur-md cursor-pointer hover:bg-black/80 transition-colors shadow-lg"
        >
          <Music
            className={`w-3.5 h-3.5 text-amber-300 shrink-0 ${isAudioPlaying && isActive ? "animate-[spin_3s_linear_infinite]" : ""}`}
          />
          <div className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[190px]">
            <span>
              {songTitle} • {artistTitle}
            </span>
          </div>
          {isAudioPlaying ? (
            <Volume2 className="w-3 h-3 text-emerald-400 shrink-0 ml-1 animate-pulse" />
          ) : (
            <VolumeX className="w-3 h-3 text-rose-400 shrink-0 ml-1" />
          )}
        </div>
      </div>
    </>
  );
}
