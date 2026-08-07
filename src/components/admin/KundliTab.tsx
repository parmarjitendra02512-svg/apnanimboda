import { Search, AlertTriangle, Users, Bot } from "lucide-react";
import EditProfileModal from "@/components/admin/EditProfileModal";

export default function KundliTab({
  kundliSearchQuery,
  setKundliSearchQuery,
  kundliResult,
  setKundliResult,
  kundliActiveTab,
  setKundliActiveTab,
  showEditModal,
  setShowEditModal,
  approvedUsers,
  bannedUsers,
  archivedUsers,
  aiChats,
  supportChats,
  chats,
  searchLogs,
  clickLogs,
  handlePermanentDeleteUser,
  getUsernameById
}: any) {
  return (
    <div className="grid gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-transparent">
        <h2 className="text-xl font-bold text-indigo-400 mb-2 flex items-center gap-2">
          <Search className="w-5 h-5" /> User Kundli Search
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Enter a 10-digit mobile number to pull a complete history and
          profile of a user (including GPS and Activity).
        </p>

        <div className="flex gap-3 max-w-md">
          <input
            type="tel"
            value={kundliSearchQuery}
            onChange={(e) => setKundliSearchQuery(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            placeholder="Enter Mobile Number..."
            maxLength={10}
          />
          <button
            onClick={() => {
              const allUsers = [
                ...approvedUsers,
                ...bannedUsers,
                ...archivedUsers,
              ];
              const query = kundliSearchQuery.toLowerCase();
              const found = allUsers.find(
                (u) =>
                  u.mobile === kundliSearchQuery ||
                  u.mobile === `+91${kundliSearchQuery}` ||
                  u.id.toLowerCase() === query ||
                  (u.name && u.name.toLowerCase().includes(query))
              );
              setKundliResult(found || "not_found");
              setKundliActiveTab("overview");
            }}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {kundliResult === "not_found" && (
        <div className="glass-card p-12 text-center rounded-2xl border-dashed border border-white/20 text-slate-400">
          <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p>
            No user found with this mobile number across any database.
          </p>
        </div>
      )}

      {kundliResult && kundliResult !== "not_found" && (
        <div className="glass-panel p-8 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${approvedUsers.find((u: any) => u.id === kundliResult.id) ? "bg-emerald-500/20 text-emerald-400" : bannedUsers.find((u: any) => u.id === kundliResult.id) ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}
            >
              {approvedUsers.find((u: any) => u.id === kundliResult.id)
                ? "APPROVED"
                : bannedUsers.find((u: any) => u.id === kundliResult.id)
                  ? "BANNED"
                  : "ARCHIVED"}
            </span>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 overflow-hidden shrink-0 border-2 border-white/20">
              {kundliResult.photoUrl ? (
                <img
                  src={kundliResult.photoUrl}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-12 h-12 text-slate-400 m-6" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {kundliResult.name}
              </h2>
              <p className="text-slate-400">
                Son of {kundliResult.father}
              </p>
              <div className="flex gap-4 mt-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-slate-500">Mobile</p>
                  <p className="text-white font-medium">
                    {kundliResult.mobile}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-slate-500">Password</p>
                  <p className="text-blue-400 font-mono">
                    {kundliResult.password || "N/A"}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-xs text-slate-500">Last Login</p>
                  <p className="text-emerald-400 font-medium">
                    {kundliResult.lastLogin
                      ? new Date(kundliResult.lastLogin).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex border-b border-white/10 gap-6 mb-6 overflow-x-auto hide-scrollbar">
              <button onClick={() => setKundliActiveTab("overview")} className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${kundliActiveTab === "overview" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-white"}`}>Overview</button>
              <button onClick={() => setKundliActiveTab("ledger")} className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${kundliActiveTab === "ledger" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-white"}`}>Wallet & Ledger</button>
              <button onClick={() => setKundliActiveTab("aichats")} className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${kundliActiveTab === "aichats" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-white"}`}>AI Chat History</button>
              <button onClick={() => setKundliActiveTab("supportchats")} className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${kundliActiveTab === "supportchats" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-white"}`}>Live Support Chats</button>
              <button onClick={() => setKundliActiveTab("privatechats")} className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${kundliActiveTab === "privatechats" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-white"}`}>Private Messages</button>
              <button onClick={() => setKundliActiveTab("activity")} className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap ${kundliActiveTab === "activity" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-white"}`}>Activity Logs</button>
            </div>

            {kundliActiveTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <h3 className="text-sm font-bold text-slate-300 mb-2 border-b border-white/10 pb-2 flex justify-between items-center">
                    Location & Profession
                    <button onClick={() => setShowEditModal(true)} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors">
                      Edit Profile
                    </button>
                  </h3>
                  <p className="text-sm text-slate-400">
                    <strong className="text-white">Profession:</strong>{" "}
                    {kundliResult.profession || "N/A"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong className="text-white">Location/Ward:</strong>{" "}
                    {kundliResult.location || "N/A"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong className="text-white">Panchayat:</strong>{" "}
                    {kundliResult.gram_panchayat || "N/A"} -{" "}
                    {kundliResult.pincode}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong className="text-white">Privacy Mode:</strong>{" "}
                    {kundliResult.is_private ? "Enabled" : "Disabled"}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <h3 className="text-sm font-bold text-slate-300 mb-2 border-b border-white/10 pb-2">
                    Profile Details
                  </h3>
                  <p className="text-sm text-slate-400">
                    <strong className="text-white">Registration Date:</strong>{" "}
                    {kundliResult.createdAt ? new Date(kundliResult.createdAt).toLocaleString() : "Unknown"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong className="text-white">Age:</strong>{" "}
                    {kundliResult.age || "N/A"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong className="text-white">Gender:</strong>{" "}
                    {kundliResult.gender || "N/A"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    <strong className="text-white">Device Info:</strong>{" "}
                    {kundliResult.deviceInfo || "Unknown"}
                  </p>
                </div>

                <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 md:col-span-2">
                  <h3 className="text-sm font-bold text-emerald-400 mb-2 border-b border-emerald-500/10 pb-2">
                    GPS Tracking
                  </h3>
                  {kundliResult.location &&
                  typeof kundliResult.location === "object" &&
                  kundliResult.location.lat ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-300">
                          <strong className="text-white">Latitude:</strong>{" "}
                          {kundliResult.location.lat}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          <strong className="text-white">Longitude:</strong>{" "}
                          {kundliResult.location.lng}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          <strong className="text-white">Last Sync:</strong>{" "}
                          {kundliResult.location.updatedAt
                            ? new Date(
                                kundliResult.location.updatedAt,
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${kundliResult.location.lat},${kundliResult.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Open in Maps
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      No real-time GPS data available for this user.
                    </p>
                  )}
                </div>
                
                <div className="glass-card p-6 rounded-xl border border-red-500/30 bg-red-500/5 md:col-span-2 mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-red-500 mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h3>
                    <p className="text-sm text-red-400/80">
                      Permanently delete this user from the system. This action is irreversible and removes all their data.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePermanentDeleteUser(kundliResult)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-500/20"
                  >
                    Delete User
                  </button>
                </div>

              </div>
            )}

            {showEditModal && kundliResult && (
              <EditProfileModal
                user={kundliResult}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                  setShowEditModal(false);
                  alert("Profile updated successfully!");
                }}
              />
            )}

            {kundliActiveTab === "ledger" && (
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col items-center justify-center">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
                    <h3 className="text-4xl font-bold text-emerald-400">₹0.00</h3>
                  </div>
                  <div className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-500/10 flex flex-col items-center justify-center">
                    <p className="text-slate-400 text-sm font-medium mb-1">Money Spent</p>
                    <h3 className="text-4xl font-bold text-red-400">₹0.00</h3>
                  </div>
                </div>
                <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <h3 className="font-bold text-white">Transaction History</h3>
                  </div>
                  <div className="p-8 text-center text-slate-400">
                    <p>No transactions found for this user.</p>
                  </div>
                </div>
              </div>
            )}

            {kundliActiveTab === "aichats" && (
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden max-h-[600px] flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h3 className="font-bold text-white">AI Chat History</h3>
                </div>
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
                  {aiChats.filter((c: any) => c.userId === kundliResult.id || c.userId === kundliResult.uid || c.userId === kundliResult.mobile).length === 0 ? (
                    <div className="text-center py-10 bg-black/50 rounded-2xl border border-white/5">
                      <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No AI conversations found.</p>
                    </div>
                  ) : (
                    aiChats.filter((c: any) => c.userId === kundliResult.id || c.userId === kundliResult.uid || c.userId === kundliResult.mobile).map((chat: any) => (
                      <div key={chat.id} className="bg-black/30 border border-white/5 rounded-xl p-4">
                        <h4 className="text-xs text-slate-400 font-bold mb-3 border-b border-white/5 pb-2">
                          Chat Session: {new Date(chat.createdAt || chat.lastUpdated).toLocaleString()}
                        </h4>
                        <div className="flex flex-col gap-3">
                          {chat.messages && Object.values(chat.messages).map((m: any, i: number) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`text-sm p-3 rounded-2xl max-w-[85%] ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white/10 text-slate-200 border border-white/5 rounded-tl-sm"}`}>
                                {m.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {kundliActiveTab === "supportchats" && (
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden max-h-[600px] flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h3 className="font-bold text-white">Live Support History</h3>
                </div>
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
                  {(() => {
                    const userSupportChat = supportChats.find((c: any) => c.id === kundliResult.id || c.meta?.mobile === kundliResult.mobile);
                    if (!userSupportChat || !userSupportChat.messages) {
                      return <p className="text-center text-slate-400 p-8">No support chat history found.</p>;
                    }
                    return (
                      <div className="flex flex-col gap-3">
                        {Object.values(userSupportChat.messages).map((m: any, i: number) => (
                          <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`text-sm p-3 rounded-2xl max-w-[85%] ${m.sender === "user" ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-blue-600/50 text-blue-100 border border-blue-500/30 rounded-tl-sm"}`}>
                              {m.photoUrl && <img src={m.photoUrl} className="max-w-xs rounded-lg mb-2" alt="attachment" />}
                              {m.text}
                              <div className={`text-[10px] mt-1 opacity-60 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                                {new Date(m.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {kundliActiveTab === "privatechats" && (
              <div className="space-y-4">
                {chats.filter((c: any) => c.id.includes(kundliResult.uid || kundliResult.mobile)).length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No private messages found for this user.</p>
                ) : (
                  chats.filter((c: any) => c.id.includes(kundliResult.uid || kundliResult.mobile)).map((chat: any) => {
                    const messages = chat.messages ? Object.entries(chat.messages).map(([k, v]: any) => ({ key: k, ...v })) : [];
                    return (
                      <div key={chat.id} className="glass-card p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-slate-300 mb-2">Chat ID: {chat.id}</h4>
                        <div className="space-y-2">
                          {messages.map((msg: any, i: number) => (
                            <div key={i} className="bg-white/5 p-3 rounded-lg text-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-indigo-400">{getUsernameById(msg.senderId)}</span>
                                <span className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-slate-300">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {kundliActiveTab === "activity" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <h4 className="font-bold text-slate-300 mb-4">Search History</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {searchLogs.filter((l: any) => l.userId === (kundliResult.uid || kundliResult.mobile)).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No searches recorded.</p>
                    ) : (
                      searchLogs.filter((l: any) => l.userId === (kundliResult.uid || kundliResult.mobile)).map((log: any, i: number) => (
                        <div key={i} className="bg-white/5 p-3 rounded-lg text-sm flex justify-between">
                          <span className="text-slate-300">Searched for: <strong className="text-white">{log.query}</strong></span>
                          <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <h4 className="font-bold text-slate-300 mb-4">Click History</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {clickLogs.filter((l: any) => l.userId === (kundliResult.uid || kundliResult.mobile)).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No clicks recorded.</p>
                    ) : (
                      clickLogs.filter((l: any) => l.userId === (kundliResult.uid || kundliResult.mobile)).map((log: any, i: number) => (
                        <div key={i} className="bg-white/5 p-3 rounded-lg text-sm flex justify-between">
                          <span className="text-slate-300">Clicked: <strong className="text-white">{log.targetId}</strong> ({log.targetType})</span>
                          <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
