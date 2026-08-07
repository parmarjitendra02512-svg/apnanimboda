"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Video,
  Copy,
  Check,
  Eye,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function YtSeoTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);

  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user && !isAdmin) router.push("/dashboard");
  }, [user, isAdmin, authLoading, router]);

  const extractVideoId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/,
    );
    return match ? match[1] : null;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(url);

    if (!videoId) {
      setError("Invalid YouTube URL");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoData(null);
    setCopiedTags(false);

    try {
      const response = await fetch(`/api/youtube?id=${videoId}`);
      const data = await response.json();

      if (data.status === "ok") {
        setVideoData(data.data);
      } else {
        setError(data.message || "Failed to fetch video details.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  const copyTags = () => {
    if (videoData?.snippet?.tags) {
      navigator.clipboard.writeText(videoData.snippet.tags.join(", "));
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  if (authLoading || !isAdmin)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto flex-1 z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <Video className="text-red-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">
                YouTube SEO Tool
              </h1>
              <p className="text-sm text-slate-400">
                Extract tags, titles, and statistics from any video.
              </p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel rounded-2xl p-6 mb-8 border border-red-500/20"
        >
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Paste YouTube Video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <button
              disabled={loading || !url.trim()}
              type="submit"
              className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Extract SEO"
              )}
            </button>
          </form>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </motion.div>

        {/* Results */}
        {videoData && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">
                  {parseInt(videoData.statistics.viewCount).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Views</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <ThumbsUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">
                  {parseInt(
                    videoData.statistics.likeCount || "0",
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Likes</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center">
                <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">
                  {parseInt(
                    videoData.statistics.commentCount || "0",
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">Comments</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center justify-center">
                <div className="text-sm font-bold text-white mb-1 line-clamp-1">
                  {videoData.snippet.channelTitle}
                </div>
                <div className="text-xs text-slate-400">Channel</div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  Video Title
                </h3>
                <h2 className="text-xl font-bold text-white">
                  {videoData.snippet.title}
                </h2>
              </div>
              <hr className="border-white/10" />
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">
                  Description
                </h3>
                <div className="bg-black/30 p-4 rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
                    {videoData.snippet.description ||
                      "No description provided."}
                  </pre>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-400">
                  Video Tags ({videoData.snippet.tags?.length || 0})
                </h3>
                <button
                  onClick={copyTags}
                  disabled={!videoData.snippet.tags}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 text-sm"
                >
                  {copiedTags ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-400" />
                  )}
                  {copiedTags ? "Copied!" : "Copy All Tags"}
                </button>
              </div>

              {videoData.snippet.tags ? (
                <div className="flex flex-wrap gap-2">
                  {videoData.snippet.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">
                  No tags found for this video.
                </p>
              )}
            </div>

            {/* Thumbnails */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-slate-400 mb-4">
                Thumbnails
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["maxres", "standard", "high", "medium", "default"].map(
                  (quality) => {
                    const thumb = videoData.snippet.thumbnails[quality];
                    if (!thumb) return null;
                    return (
                      <div
                        key={quality}
                        className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/50"
                      >
                        <img
                          src={thumb.url}
                          alt={`${quality} thumbnail`}
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <div className="text-center">
                            <p className="text-white font-bold uppercase mb-2">
                              {quality}
                            </p>
                            <p className="text-slate-300 text-xs mb-4">
                              {thumb.width} x {thumb.height}
                            </p>
                            <a
                              href={thumb.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors inline-block"
                            >
                              View Full Size
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
