"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import ReportModal from "@/components/ReportModal";
import { db } from "@/lib/firebase";
import {
  ref,
  onValue,
  push,
  serverTimestamp,
  get,
  update,
} from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: receiverId } = use(params);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [receiver, setReceiver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !receiverId) return;

    // Fetch receiver info
    const fetchReceiver = async () => {
      if (receiverId === "admin_config_master") {
        setReceiver({ name: "Apna Nimboda Support", location: "Online" });
        return;
      }
      const snapshot = await get(ref(db, `approved_users/${receiverId}`));
      if (snapshot.exists()) {
        setReceiver(snapshot.val());
      }
    };
    fetchReceiver();

    const isSupport = receiverId === "admin_config_master";
    const userId = user.uid || user.id || user.mobile;
    const chatId = isSupport 
      ? userId 
      : (userId > receiverId ? `${userId}_${receiverId}` : `${receiverId}_${userId}`);

    const messagesRef = isSupport
      ? ref(db, `support_chats/${chatId}/messages`)
      : ref(db, `chats/${chatId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a: any, b: any) => a.timestamp - b.timestamp);
        setMessages(msgList);
      } else {
        setMessages([]);
      }
      setLoading(false);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }, (error) => {
      console.error("Firebase error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, receiverId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !photoUrl) || !user || !receiverId) return;

    const isSupport = receiverId === "admin_config_master";
    const userId = user.uid || user.id || user.mobile;
    const chatId = isSupport 
      ? userId 
      : (userId > receiverId ? `${userId}_${receiverId}` : `${receiverId}_${userId}`);

    try {
      if (isSupport) {
        await update(ref(db, `support_chats/${chatId}`), {
          "meta/unreadByAdmin": true,
          "meta/name": user.name || "Village Member",
          "meta/mobile": user.mobile || userId,
          [`messages/${Date.now()}`]: {
            text: newMessage,
            photoUrl: photoUrl || null,
            sender: "user",
            senderId: userId,
            timestamp: serverTimestamp(),
          }
        });
      } else {
        const messagesRef = ref(db, `chats/${chatId}/messages`);
        await push(messagesRef, {
          text: newMessage,
          photoUrl: photoUrl,
          senderId: userId,
          timestamp: serverTimestamp(),
        });
      }
      setNewMessage("");
      setPhotoUrl("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleUnsend = async (msgId: string) => {
    if (!user || !receiverId) return;
    const isSupport = receiverId === "admin_config_master";
    const userId = user.uid || user.id || user.mobile;
    const chatId = isSupport 
      ? userId 
      : (userId > receiverId ? `${userId}_${receiverId}` : `${receiverId}_${userId}`);
    const msgRef = isSupport
      ? ref(db, `support_chats/${chatId}/messages/${msgId}`)
      : ref(db, `chats/${chatId}/messages/${msgId}`);
    try {
      if (confirm("Are you sure you want to unsend this message?")) {
        await update(msgRef, { isDeleted: true });
      }
    } catch (e) {
      console.error("Failed to unsend message", e);
    }
  };

  if (authLoading || loading || !receiverId)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col p-4 md:p-8 relative">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl mx-auto glass-panel rounded-2xl p-4 flex items-center gap-4 mb-4 z-10"
      >
        <Link href="/dashboard" replace>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
            <ArrowLeft className="text-slate-300 w-5 h-5" />
          </button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 overflow-hidden">
            {receiver?.photoUrl ? (
              <img
                src={receiver.photoUrl}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-blue-400 w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white leading-tight">
              {receiver?.name || "Unknown User"}
            </h2>
            <p className="text-xs text-slate-400">
              {receiver?.location || "Offline"}
            </p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors ml-auto"
            title="Report Chat"
          >
            <AlertTriangle className="text-red-400 w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* Chat Area */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col z-10 overflow-hidden relative">
        <div className="flex-1 glass-card p-4 md:p-6 mb-4 overflow-y-auto rounded-2xl flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              No messages yet. Say hi!
            </div>
          ) : (
            messages.map((msg) => {
              const msgSenderId = msg.senderId || (msg.sender === "user" ? user.uid : "admin_config_master");
              const isMe = msgSenderId === user.uid;

              if (msg.isDeleted && !isAdmin) {
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm italic opacity-50 ${isMe ? "bg-blue-600/30 text-white rounded-br-sm" : "bg-white/5 text-slate-400 border border-white/5 rounded-bl-sm"}`}
                    >
                      This message was unsent.
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                >
                  <div
                    className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-white/10 text-slate-200 border border-white/5 rounded-bl-sm"} ${msg.isDeleted ? "opacity-70 border border-red-500/50" : ""}`}
                  >
                    {msg.isDeleted && isAdmin && (
                      <div className="text-red-400 text-xs font-bold mb-1 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> (Unsent by user)
                      </div>
                    )}
                    {msg.photoUrl && (
                      <img
                        src={msg.photoUrl}
                        className="max-w-full rounded-xl mb-2 max-h-48 object-cover"
                        alt="attachment"
                      />
                    )}
                    {msg.text && <div className="break-words">{msg.text}</div>}
                    <div
                      className={`text-[10px] mt-1 opacity-60 flex items-center gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sending..."}
                      {isMe && !msg.isDeleted && (
                        <button
                          onClick={() => handleUnsend(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-100"
                          title="Unsend"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {photoUrl && (
          <div className="absolute bottom-20 left-0 right-0 p-4 bg-black/50 backdrop-blur-md rounded-t-xl z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={photoUrl} className="w-12 h-12 rounded object-cover" />
              <span className="text-xs text-slate-300">Photo attached</span>
            </div>
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className="text-red-400 text-xs bg-red-500/20 px-3 py-1 rounded-full"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="glass-panel p-2 rounded-2xl flex items-center gap-2"
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 px-4 py-2"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={!newMessage.trim() && !photoUrl}
            className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>
      </main>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedEntityId={
          user.uid > receiverId
            ? `${user.uid}_${receiverId}`
            : `${receiverId}_${user.uid}`
        }
        reportedEntityName={`Chat with ${receiver?.name || "Unknown"}`}
        entityType="chat"
      />
    </div>
  );
}
