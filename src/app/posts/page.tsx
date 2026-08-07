"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Send, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { ref, onValue, push, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function NoticeBoard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const { user, isApproved, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
    if (!authLoading && user && !isApproved && !isAdmin)
      router.push("/dashboard");
  }, [user, isApproved, isAdmin, authLoading, router]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || (!isApproved && !isAdmin)) {
      setLoading(false);
      return;
    }

    const postsRef = ref(db, "posts");
    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const postList = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .sort((a: any, b: any) => b.timestamp - a.timestamp);
          setPosts(postList);
        } else {
          setPosts([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Firebase error fetching posts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isApproved, isAdmin, authLoading]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    if (user.planType === "free" && !isAdmin) {
      alert("Free plan users cannot post notices. Please upgrade to Pro.");
      router.push("/pricing");
      return;
    }

    setIsPosting(true);

    try {
      const authorId = user.uid || user.id || user.mobile || "anonymous";
      await push(ref(db, "posts"), {
        content: newPost,
        authorId: authorId,
        authorName: user.name || "Village Member",
        authorEmail: user.email || user.mobile || "",
        timestamp: serverTimestamp(),
      });
      setNewPost("");
    } catch (error: any) {
      console.error("Failed to post:", error);
      alert("Failed to post: " + (error.message || "Unknown error"));
    } finally {
      setIsPosting(false);
    }
  };

  const getMaskedMobile = (email: string) => {
    if (!email) return "";
    const mobile = email.replace("@apnanimboda.com", "");
    if (isAdmin) return mobile; // Admin sees full number
    if (mobile.length === 10) {
      return mobile.substring(0, 5) + "*****";
    }
    return "Hidden";
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  if (!user || (!isApproved && !isAdmin)) return null;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mx-auto glass-panel rounded-2xl p-4 flex items-center gap-4 mb-8 z-10"
      >
        <Link href="/dashboard" replace>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft className="text-slate-300 w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <MessageSquare className="text-purple-400 w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Village Notice Board
          </h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="w-full max-w-4xl mx-auto flex-1 z-10 grid gap-8">
        {/* Create Post */}
        <section className="glass-card p-4 md:p-6 rounded-2xl">
          <form onSubmit={handlePost} className="flex flex-col gap-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              disabled={user?.planType === "free" && !isAdmin}
              placeholder={
                user?.planType === "free" && !isAdmin
                  ? "Upgrade to Pro to post notices..."
                  : "Write a message, notice or issue for the village..."
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none h-28 disabled:opacity-50"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPosting || !newPost.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPosting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Post <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Feed */}
        <section className="space-y-4">
          {posts.map((post, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={post.id}
              className="glass-card p-5 rounded-2xl flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {post.authorName ? post.authorName[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm flex items-center gap-2">
                      {post.authorName || "Village Member"}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {getMaskedMobile(post.authorEmail)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {post.timestamp
                        ? new Date(post.timestamp).toLocaleString()
                        : "Just now"}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-slate-200 mt-2 whitespace-pre-wrap">
                {post.content}
              </p>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <div className="py-12 text-center text-slate-500 glass-card rounded-2xl">
              No notices or posts yet. Be the first to post!
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
