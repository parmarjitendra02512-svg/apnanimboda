"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Loader2,
  Bot,
  PlusCircle,
  Moon,
  Sun,
  Menu,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set, remove } from "firebase/database";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";
import { useSound } from "@/components/SoundContext";

interface Message {
  role: string;
  content: string;
  image?: string;
  timestamp?: number;
}

export default function AINimbodaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { playClick, playSwoosh, playError } = useSound();

  const [chats, setChats] = useState<{
    [key: string]: { messages: Message[]; lastUpdated: number };
  }>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const defaultMessage = {
    role: "assistant",
    content:
      "Namaste! I am AINimboda, your advanced AI assistant created by Nimboda. Send me a message or a photo, and I will help you!",
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Chats
  useEffect(() => {
    if (!user) return;
    const chatsRef = ref(db, `ai_chats_v2/${user.uid}`);
    const unsub = onValue(chatsRef, (snap) => {
      const data = snap.val();
      if (data) {
        setChats(data);
      } else {
        setChats({});
      }
    });
    return () => unsub();
  }, [user]);

  // Sync current chat messages
  useEffect(() => {
    if (currentChatId && chats[currentChatId]) {
      setMessages(chats[currentChatId].messages || [defaultMessage]);
    } else if (!currentChatId) {
      setMessages([defaultMessage]);
    }
  }, [currentChatId, chats]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([defaultMessage]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (window.confirm("Delete this chat?")) {
      await remove(ref(db, `ai_chats_v2/${user.uid}/${chatId}`));
      if (currentChatId === chatId) handleNewChat();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachedImage) return;

    if (user?.planType === "free") {
      const today = new Date().toDateString();
      // Calculate total messages today across all chats
      let userChatsToday = 0;
      Object.values(chats).forEach((chat) => {
        userChatsToday += (chat.messages || []).filter(
          (m) =>
            m.role === "user" &&
            m.timestamp &&
            new Date(m.timestamp).toDateString() === today,
        ).length;
      });
      // Add current unsaved messages
      userChatsToday += messages.filter((m) => !m.timestamp).length; // Rough estimate

      if (userChatsToday >= 5) {
        alert(
          "You have reached your daily limit of 5 AI Chats for the Free plan. Please upgrade to Pro for unlimited access.",
        );
        router.push("/pricing");
        return;
      }
    }

    playClick();
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };
    if (attachedImage) {
      userMessage.image = attachedImage;
    }
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Determine Chat ID
    let activeChatId = currentChatId;
    if (!activeChatId) {
      activeChatId = Date.now().toString();
      setCurrentChatId(activeChatId);
    }

    // Save to DB immediately so Admin can see it live (fire-and-forget to avoid UI hang)
    if (user) {
      set(ref(db, `ai_chats_v2/${user.uid}/${activeChatId}`), {
        messages: newMessages,
        lastUpdated: Date.now(),
      }).catch((err) => console.warn("Could not save to history:", err));
    }

    setInput("");
    setAttachedImage(null);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Network response was not ok");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";

      playSwoosh();
      setIsTyping(false); // Stop typing indicator, start streaming

      // Append empty assistant message to stream into
      const initialAssistantMsg: Message = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      setMessages([...newMessages, initialAssistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedResponse += chunk;

        // Update the last message in state
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: streamedResponse,
          };
          return updated;
        });
      }

      // Save final streamed response to Firebase
      if (user) {
        const finalMessages = [
          ...newMessages,
          {
            role: "assistant",
            content: streamedResponse,
            timestamp: Date.now(),
          },
        ];
        
        // Fire and forget
        set(
          ref(db, `ai_chats_v2/${user.uid}/${activeChatId}/messages`),
          finalMessages,
        ).catch((err) => console.warn("Could not save AI reply to history:", err));
      }
    } catch (err: any) {
      playError();
      setIsTyping(false);
      const errorMessages = [
        ...newMessages,
        { role: "assistant", content: `Error: ${err.message}` },
      ];
      setMessages(errorMessages);
    }
  };

  if (authLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-[#0a0f1e] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-black overflow-hidden">
        <motion.img
          src="/space2.jpg"
          alt="AI Space Theme"
          animate={{ scale: [1.05, 1.1, 1.05], x: [0, -10, 0], y: [0, 10, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/90 via-[#0a0f1e]/70 to-[#0a0f1e]/90 backdrop-blur-sm" />
      </div>

      {/* Sidebar (Mobile Overlay) */}
      <AnimatePresence>
        {(isSidebarOpen ||
          (typeof window !== "undefined" && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={`fixed md:relative z-40 w-72 h-full bg-[#0d142a]/95 backdrop-blur-xl border-r border-white/10 flex flex-col ${!isSidebarOpen ? "hidden md:flex" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-cyan-400" />
              </button>
              <button
                onClick={handleNewChat}
                className="flex-1 ml-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl py-2 px-3 flex items-center justify-center gap-2 font-medium hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20"
              >
                <PlusCircle className="w-4 h-4" /> New Chat
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-white/10 rounded-full ml-2"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
                Recent Chats
              </p>
              {Object.entries(chats)
                .sort(([, a], [, b]) => b.lastUpdated - a.lastUpdated)
                .map(([chatId, chat]) => {
                  // Find first user message for title
                  const firstUserMsg = chat.messages?.find(
                    (m) => m.role === "user",
                  );
                  const title = firstUserMsg
                    ? firstUserMsg.content.substring(0, 30) +
                      (firstUserMsg.content.length > 30 ? "..." : "")
                    : "New Chat";

                  return (
                    <div
                      key={chatId}
                      onClick={() => handleSelectChat(chatId)}
                      className={`group w-full flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${currentChatId === chatId ? "bg-cyan-500/20 border border-cyan-500/30" : "hover:bg-white/5 border border-transparent"}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare
                          className={`w-4 h-4 shrink-0 ${currentChatId === chatId ? "text-cyan-400" : "text-slate-400"}`}
                        />
                        <span
                          className={`text-sm truncate ${currentChatId === chatId ? "text-white font-medium" : "text-slate-300"}`}
                        >
                          {title}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chatId, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-[100dvh] relative">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-[#0d142a]/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                AINimboda
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-cyan-400"
              title="New Chat"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-cyan-400" />
              ) : (
                <Moon className="w-5 h-5 text-cyan-400" />
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide flex flex-col gap-6">
          {messages.map((msg, idx) => {
            const isMe = msg.role === "user";
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[75%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 mt-1">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`px-4 py-3 md:px-5 md:py-4 text-[15px] leading-relaxed flex flex-col gap-2 ${
                    isMe
                      ? "bg-cyan-600 text-white rounded-2xl rounded-tr-sm shadow-lg"
                      : "bg-[#151c33] border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm shadow-md"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Upload"
                      className="max-w-[200px] md:max-w-[300px] rounded-xl border border-white/10 mb-2"
                    />
                  )}
                  {/* Using white-space pre-wrap to support line breaks from streamed response */}
                  <span className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 max-w-[75%] self-start"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-5 py-4 bg-[#151c33] border border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-[#0d142a] via-[#0d142a] to-transparent pt-10 shrink-0">
          <form
            onSubmit={handleSend}
            className="max-w-3xl mx-auto relative flex items-end gap-2 bg-[#151c33] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-colors shrink-0"
              title="Attach Photo"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            <div className="flex-1 flex flex-col">
              {attachedImage && (
                <div className="p-2 relative w-fit">
                  <img
                    src={attachedImage}
                    alt="Preview"
                    className="h-16 rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Ask AINimboda anything..."
                className="w-full max-h-32 min-h-[44px] bg-transparent text-white placeholder-slate-500 resize-none outline-none p-2 py-3 overflow-y-auto scrollbar-hide text-[15px]"
                rows={1}
              />
            </div>

            <button
              type="submit"
              disabled={(!input.trim() && !attachedImage) || isTyping}
              className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0 mb-0.5 mr-0.5 ${
                input.trim() || attachedImage
                  ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-500 mt-3">
            AINimboda can make mistakes. Consider verifying important
            information.
          </p>
        </div>
      </main>
    </div>
  );
}
