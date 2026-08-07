"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import {
  ArrowLeft,
  Search,
  Loader2,
  Globe,
  Calendar,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    fetchNews("");
  }, []);

  const fetchNews = async (query: string) => {
    setIsSearching(true);
    setError(null);
    try {
      const url = `/api/news?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "ok" || data.articles) {
        // NewsAPI might return articles array directly or wrapped in status ok depending on our route config
        const articles = data.articles || data.data || [];
        // Filter out removed articles
        const validArticles = articles.filter(
          (a: any) => a.title !== "[Removed]" && a.urlToImage,
        );
        setNews(validArticles);
      } else {
        setError(
          data.message ||
            "Server is undergoing maintenance. Please try again later.",
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "An error occurred while connecting to the server. Please try again later.",
      );
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNews(searchTerm);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-6xl glass-panel rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 z-10 sticky top-4 mb-8"
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/dashboard" replace>
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400">
                Live News
              </h1>
              <p className="text-xs text-slate-400">Global & Local Updates</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics (e.g., Technology, Cricket)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />
          <button type="submit" className="hidden" />
        </form>
      </motion.header>

      {/* Content */}
      <main className="w-full max-w-6xl z-10 flex-1">
        {loading || isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
            <p className="text-lg">Fetching latest news...</p>
          </div>
        ) : error ? (
          <div className="glass-card border border-red-500/30 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Notice</h2>
            <p className="text-slate-400 max-w-md">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-slate-400 glass-card rounded-3xl">
            <p className="text-lg">
              No news articles found for "{searchTerm}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {news.map((article, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 shadow-xl border border-white/10 flex flex-col"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-white/5">
                    {article.urlToImage ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Globe className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 shadow-lg">
                        {article.source?.name || "News"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-rose-400 transition-colors leading-tight">
                      {article.title}
                    </h3>

                    <p className="text-sm text-slate-400 mb-6 line-clamp-3 flex-1">
                      {article.description}
                    </p>

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-white font-medium transition-all group/btn"
                    >
                      Read Full Article
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover/btn:text-rose-400 transition-colors" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
