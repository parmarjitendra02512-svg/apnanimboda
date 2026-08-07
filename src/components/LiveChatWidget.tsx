"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, push, onValue, set, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

export default function LiveChatWidget({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  // For non-logged in users
  const [guestName, setGuestName] = useState("");
  const [guestMobile, setGuestMobile] = useState("");
  const [isGuestReady, setIsGuestReady] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  const chatId = user?.mobile || (isGuestReady ? guestMobile : null);
  const chatName = user?.name || (isGuestReady ? guestName : null);

  useEffect(() => {
    if (!chatId || !isOpen) return;

    // Notify Admin of a new chat session
    set(ref(db, `support_chats/${chatId}/meta`), {
      name: chatName,
      mobile: chatId,
      lastActive: Date.now(),
      unreadByAdmin: true,
    });

    const msgsRef = ref(db, `support_chats/${chatId}/messages`);
    const unsub = onValue(msgsRef, (snap) => {
      const data = snap.val();
      if (data) {
        setMessages(
          Object.values(data).sort(
            (a: any, b: any) => a.timestamp - b.timestamp,
          ),
        );
      } else {
        setMessages([]);
      }
      setTimeout(
        () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    });

    return () => unsub();
  }, [chatId, isOpen, chatName]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !chatId) return;

    const msg = {
      text,
      sender: "user",
      timestamp: Date.now(),
    };

    setText("");
    await push(ref(db, `support_chats/${chatId}/messages`), msg);

    // Update meta for admin
    await set(ref(db, `support_chats/${chatId}/meta`), {
      name: chatName,
      mobile: chatId,
      lastActive: Date.now(),
      unreadByAdmin: true,
    });

    // Push notification to Admin
    await set(ref(db, `notifications/admin_config_master/${Date.now()}`), {
      title: "New Support Message",
      message: `${chatName} sent a message: ${msg.text.substring(0, 30)}...`,
      timestamp: Date.now(),
    });
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim() && guestMobile.trim().length === 10) {
      setIsGuestReady(true);
    } else {
      alert("Please enter a valid Name and 10-digit Mobile Number.");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-x-4 bottom-24 md:inset-auto md:bottom-24 md:right-6 z-[110] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "500px", maxHeight: "70vh" }}
          >
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold">24/7 Live Support</h3>
                <p className="text-blue-100 text-xs">
                  We typically reply in minutes
                </p>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-blue-700 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user && !isGuestReady ? (
              <form
                onSubmit={handleGuestSubmit}
                className="flex-1 p-6 flex flex-col justify-center gap-4"
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-white">
                    Welcome to Support
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Please enter your details to start chatting with the Admin.
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Your 10-digit Mobile"
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  pattern="[0-9]{10}"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors mt-2"
                >
                  Start Chat
                </button>
              </form>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50 dark:bg-slate-950">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-500 dark:text-slate-400 text-sm my-auto">
                      Send a message to start the conversation!
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.sender === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm"}`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <form
                  onSubmit={handleSend}
                  className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
