"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Globe,
  ExternalLink,
  MessageSquare,
  ArrowLeft,
  Languages,
  Video,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import SecurityWrapper from "@/components/SecurityWrapper";
import DOMPurify from "dompurify";

export default function SearchEngine() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"hi" | "en">("hi");
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setHasSearched(true);
    setResults([]);

    try {
      // User requested to simulate a server down/maintenance message
      // so users don't see technical API errors.
      throw new Error("Server Maintenance");

      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     query: query.trim(),
      //     language,
      //     userId: user?.uid || 'anonymous',
      //     userName: user?.displayName || 'Unknown'
      //   }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Search failed to respond');
      // }

      // const data = await response.json();
      // setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      if (err.message === "Server Maintenance") {
        setError(
          "Our search servers are currently down for maintenance and upgrades. Please check back later. (सर्वर मेंटनेंस का काम चल रहा है, कृपया बाद में प्रयास करें)",
        );
      } else {
        setError(
          "Something went wrong or the servers are busy. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = async (
    url: string,
    title: string,
    category: string,
  ) => {
    // Log the click
    try {
      await fetch("/api/log-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          type: category || "link",
          userId: user?.uid || "anonymous",
          userName: user?.displayName || "Unknown",
        }),
      });
    } catch (e) {
      // ignore logging errors
    }
    // Open in new tab
    window.open(url, "_blank");
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  const handleAskAI = () => {
    // Redirect to AI chat with the query as a URL parameter to pre-fill (if implemented in /ai)
    router.push(`/ai?q=${encodeURIComponent(query)}`);
  };

  return (
    <SecurityWrapper>
      <div
        className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-[#0a0f1e] text-white" : "bg-slate-50 text-slate-900"} relative overflow-hidden transition-colors duration-300`}
      >
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob z-0" />
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 z-0" />

        <main className="w-full max-w-4xl mx-auto px-4 py-8 relative z-10 flex flex-col flex-1">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 transition-colors shadow-lg shadow-blue-500/5"
              title="Toggle Search Language"
            >
              <Languages className="w-5 h-5" />
              <span className="font-medium">
                {language === "hi" ? "हिंदी (Hindi)" : "English"}
              </span>
            </button>
          </div>

          {/* Search Area */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: hasSearched ? 0 : 150, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-full flex flex-col items-center"
          >
            <div className="mb-8 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
                Nimboda Search
              </h1>
              <p className="mt-3 text-slate-400/80 font-medium text-lg">
                The smartest way to explore the web.
              </p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-400 transition-colors z-10" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search anything in ${language === "hi" ? "Hindi" : "English"}...`}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-full py-5 pl-16 pr-32 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-2xl backdrop-blur-md"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 w-full max-w-2xl">
              <button
                onClick={handleAskAI}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 hover:bg-cyan-500/20 hover:scale-[1.02] transition-all group shadow-xl shadow-cyan-500/10"
              >
                <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/40 transition-colors">
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-cyan-400 text-lg">
                    Ask AINimboda Instead
                  </h3>
                  <p className="text-sm text-cyan-200/60">
                    Let our advanced AI answer your question instantly.
                  </p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Results Area */}
          <AnimatePresence>
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-3xl mx-auto mt-12 space-y-6 pb-20"
              >
                {loading && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="text-lg animate-pulse">
                      Searching the web...
                    </p>
                  </div>
                )}

                {!loading && error && (
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
                    <p className="text-red-400 font-medium text-lg">{error}</p>
                    <button
                      onClick={handleSearch}
                      className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {!loading && !error && results.length === 0 && hasSearched && (
                  <div className="text-center py-20 text-slate-400">
                    <p className="text-xl">No results found for "{query}".</p>
                  </div>
                )}

                {!loading &&
                  results.map((res: any, idx: number) => {
                    const isVideo =
                      res.category === "videos" ||
                      res.url.includes("youtube.com") ||
                      res.url.includes("vimeo.com");
                    const isImage = res.category === "images";

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="group p-6 rounded-2xl glass-card border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all cursor-pointer"
                        onClick={() =>
                          handleResultClick(
                            res.url,
                            res.title,
                            isVideo ? "video" : isImage ? "image" : "link",
                          )
                        }
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl shrink-0 ${isVideo ? "bg-red-500/10 text-red-400" : isImage ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}
                          >
                            {isVideo ? (
                              <Video className="w-6 h-6" />
                            ) : isImage ? (
                              <ImageIcon className="w-6 h-6" />
                            ) : (
                              <FileText className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm text-slate-500 truncate mb-1 flex items-center gap-2">
                              {res.parsed_url
                                ? res.parsed_url[1]
                                : res.url.split("/")[2]}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 group-hover:underline mb-2 line-clamp-2">
                              {res.title}
                            </h3>
                            <p
                              className="text-slate-300 line-clamp-3 text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  res.content || res.snippet || "",
                                ),
                              }}
                            ></p>
                          </div>
                          {res.thumbnail && (
                            <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/10 hidden md:block">
                              <img
                                src={res.thumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </SecurityWrapper>
  );
}
