import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { adminApiCall } from "@/lib/api";

export default function InboxTab({ supportChats }: any) {
  return (
    <div className="w-full max-w-6xl mx-auto z-10 grid gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="text-blue-400 w-6 h-6" /> Live Support
          Inbox
        </h2>
        <button
          onClick={async () => {
            const num = window.prompt(
              "Enter 10-digit mobile number of the user to send a direct message:",
            );
            if (num && num.length === 10) {
              const msg = window.prompt("Enter your message:");
              if (msg) {
                const chatId = `+91${num}`;
                try {
                  await adminApiCall("send_support_chat", {
                    chatId,
                    meta: {
                      unreadByAdmin: false,
                      mobile: num,
                      name: "Direct Message",
                    },
                    message: { text: msg, sender: "admin", timestamp: Date.now() }
                  });
                  alert("Message sent successfully!");
                } catch (e) {
                  console.error(e);
                  alert("Failed to send message");
                }
              }
            } else if (num) {
              alert("Invalid mobile number. Must be 10 digits.");
            }
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
        >
          + New Direct Message
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supportChats
          .sort(
            (a: any, b: any) =>
              (b.meta?.unreadByAdmin ? 1 : 0) -
              (a.meta?.unreadByAdmin ? 1 : 0),
          )
          .map((chat: any, idx: number) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={chat.id}
              className="glass-card p-5 relative border-t-2 border-t-blue-500/50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white">
                    {chat.meta?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-blue-400 font-medium">
                    {chat.meta?.mobile || chat.id}
                  </p>
                </div>
                {chat.meta?.unreadByAdmin && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full border border-red-500/50 animate-pulse">
                    NEW MESSAGE
                  </span>
                )}
              </div>
              <div className="bg-black/30 border border-white/10 rounded-xl p-3 h-56 overflow-y-auto mb-4 flex flex-col gap-2">
                {chat.messages &&
                  Object.values(chat.messages).map((m: any, i: number) => (
                    <div
                      key={i}
                      className={`text-xs p-2.5 rounded-lg max-w-[90%] ${m.sender === "user" ? "bg-white/10 text-slate-200 self-start" : "bg-blue-600/40 text-blue-100 self-end border border-blue-500/30"}`}
                    >
                      {m.text}
                      <div
                        className={`text-[9px] mt-1 opacity-50 ${m.sender === "user" ? "text-left" : "text-right"}`}
                      >
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem(
                    "reply",
                  ) as HTMLInputElement;
                  if (!input.value.trim()) return;
                  try {
                    await adminApiCall("send_support_chat", {
                      chatId: chat.id,
                      meta: { unreadByAdmin: false },
                      message: { text: input.value, sender: "admin", timestamp: Date.now() }
                    });
                    input.value = "";
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="reply"
                  type="text"
                  placeholder="Type a reply..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors"
                >
                  Send
                </button>
              </form>
            </motion.div>
          ))}
        {supportChats.length === 0 && (
          <div className="col-span-full text-center p-12 text-slate-400 glass-card border border-white/5">
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <p>No active support chats at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
