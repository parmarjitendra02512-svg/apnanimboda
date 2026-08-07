import { Monitor, MessageSquare, X, Bot, Shield } from "lucide-react";

interface MonitorTabProps {
  chats: any[];
  aiChats: any[];
  searchLogs: any[];
  clickLogs: any[];
  handleAdminDeleteMessage: (chatId: string, messageKey: string) => void;
  getUsernameById: (id: string) => string;
}

export default function MonitorTab({
  chats,
  aiChats,
  searchLogs,
  clickLogs,
  handleAdminDeleteMessage,
  getUsernameById,
}: MonitorTabProps) {
  return (
    <div className="grid gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/20 mb-4 bg-gradient-to-r from-purple-500/10 to-transparent">
        <h2 className="text-xl font-bold text-purple-400 mb-2 flex items-center gap-2">
          <Monitor className="w-5 h-5" /> Safety & Chat Monitor
        </h2>
        <p className="text-sm text-slate-400">
          As the Administrator, you can monitor all private messages sent on the
          platform to ensure the safety and security of the community. Users
          agreed to this monitoring when they signed up.
        </p>
      </div>

      {chats
        .filter((c) => c.messages)
        .map((chat) => {
          const uids = chat.id.split("_");
          const user1 = getUsernameById(uids[0]);
          const user2 = getUsernameById(uids[1]);
          const messages = Object.entries(chat.messages)
            .map(([key, val]: any) => ({ key, ...val }))
            .sort((a: any, b: any) => a.timestamp - b.timestamp) as any[];

          return (
            <div
              key={chat.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/5"
            >
              <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  Chat between {user1} & {user2}
                </h3>
                <span className="text-xs text-slate-400">
                  {messages.length} messages
                </span>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {messages.map((msg: any, i: number) => {
                  const senderName = getUsernameById(msg.senderId);
                  return (
                    <div
                      key={i}
                      className="bg-white/5 rounded-xl p-3 inline-block max-w-[80%] relative group"
                    >
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <span className="text-xs font-bold text-purple-400">
                          {senderName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {msg.text && (
                        <p
                          className={`text-sm ${msg.isDeleted ? "text-slate-400 line-through" : "text-slate-200"}`}
                        >
                          {msg.text}
                        </p>
                      )}
                      {msg.isDeleted && (
                        <p className="text-xs text-red-400 font-bold mt-1">
                          (Deleted by {msg.deletedByAdmin ? "Admin" : "user"})
                        </p>
                      )}
                      {msg.photoUrl && (
                        <img
                          src={msg.photoUrl}
                          alt="attachment"
                          className={`h-32 object-contain mt-2 rounded-lg border border-white/10 ${msg.isDeleted ? "opacity-50 grayscale" : ""}`}
                        />
                      )}
                      {!msg.isDeleted && (
                        <button
                          onClick={() =>
                            handleAdminDeleteMessage(chat.id, msg.key)
                          }
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 shadow-lg transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {/* AI Chats Section */}
      {aiChats.length > 0 && (
        <div className="mt-8 mb-4 border-t border-white/10 pt-8">
          <h2 className="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
            <Bot className="w-5 h-5" /> AI Chat Monitoring
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            View what users are chatting about with AINimboda.
          </p>
        </div>
      )}
      {aiChats.map((chat) => {
        const user = getUsernameById(chat.userId);
        const messages = chat.messages || [];

        return (
          <div
            key={chat.id}
            className="glass-card rounded-2xl overflow-hidden border border-cyan-500/20"
          >
            <div className="bg-cyan-500/10 p-4 flex justify-between items-center border-b border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                AINimboda Chat with {user} ({chat.mobile})
              </h3>
              <span className="text-xs text-slate-400">
                {messages.length} messages
              </span>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              {messages.map((msg: any, i: number) => {
                const isMe = msg.role === "user";
                return (
                  <div
                    key={i}
                    className={`bg-white/5 rounded-xl p-3 inline-block max-w-[80%] ${isMe ? "float-right bg-cyan-600/20 text-right" : "float-left bg-purple-600/20 text-left"} clear-both`}
                  >
                    <div className="flex justify-between items-baseline gap-4 mb-1">
                      <span className="text-xs font-bold text-cyan-400">
                        {isMe ? user : "AINimboda"}
                      </span>
                    </div>
                    {msg.content && (
                      <p className="text-sm text-slate-200">{msg.content}</p>
                    )}
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="attachment"
                        className="h-32 object-contain mt-2 rounded-lg border border-white/10"
                      />
                    )}
                  </div>
                );
              })}
              <div className="clear-both"></div>
            </div>
          </div>
        );
      })}

      {/* Web Search & Click Analytics */}
      <div className="mt-8 mb-4 border-t border-white/10 pt-8">
        <h2 className="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Search Engine Analytics
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Monitor what users are searching for and which links/videos they
          click.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Logs */}
        <div className="glass-card rounded-2xl overflow-hidden border border-emerald-500/20">
          <div className="bg-emerald-500/10 p-4 border-b border-emerald-500/20">
            <h3 className="font-bold text-emerald-300">Recent Searches</h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto space-y-3">
            {searchLogs.length === 0 ? (
              <p className="text-slate-500 text-sm">No searches yet.</p>
            ) : (
              searchLogs.map((log: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-400">
                      {log.userName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">
                    Searched:{" "}
                    <span className="font-medium text-white">
                      "{log.query}"
                    </span>{" "}
                    ({log.language})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Click Logs */}
        <div className="glass-card rounded-2xl overflow-hidden border border-amber-500/20">
          <div className="bg-amber-500/10 p-4 border-b border-amber-500/20">
            <h3 className="font-bold text-amber-300">
              Recent Clicks & Video Views
            </h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto space-y-3">
            {clickLogs.length === 0 ? (
              <p className="text-slate-500 text-sm">No clicks yet.</p>
            ) : (
              clickLogs.map((log: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-400">
                      {log.userName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">
                    Clicked{" "}
                    <span className="uppercase text-xs font-bold px-1 rounded bg-white/10">
                      {log.type}
                    </span>
                    :
                  </p>
                  <a
                    href={log.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline text-xs line-clamp-2 mt-1"
                  >
                    {log.title}
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {chats.length === 0 &&
        aiChats.length === 0 &&
        searchLogs.length === 0 &&
        clickLogs.length === 0 && (
          <div className="text-center py-12 text-slate-500 glass-card rounded-2xl">
            No analytics data found on the platform yet.
          </div>
        )}
    </div>
  );
}
