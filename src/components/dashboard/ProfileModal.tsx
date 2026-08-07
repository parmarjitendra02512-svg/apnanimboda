import { motion } from "framer-motion";
import { Users, Phone, MessageSquare, Video } from "lucide-react";
import Link from "next/link";

interface ProfileModalProps {
  selectedUser: any;
  setSelectedUser: (user: any) => void;
  features: Record<string, string>;
  user: any;
}

export default function ProfileModal({
  selectedUser,
  setSelectedUser,
  features,
  user,
}: ProfileModalProps) {
  if (!selectedUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel rounded-2xl overflow-hidden relative"
      >
        <button
          onClick={() => setSelectedUser(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-10 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
          <div className="absolute -bottom-12 left-6 w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center shadow-xl overflow-hidden">
            {selectedUser.displayPhoto ? (
              <img
                src={selectedUser.displayPhoto}
                alt={selectedUser.displayName || selectedUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="w-10 h-10 text-white" />
            )}
          </div>
        </div>

        <div className="pt-16 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedUser.displayName || selectedUser.name}
            </h2>
            <p className="text-slate-400">
              Son of {selectedUser.shouldMask ? "****" : selectedUser.father}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-3 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Mobile Number</div>
              <div className="text-white font-medium">
                {selectedUser.is_private || selectedUser.shouldMask ? (
                  <span className="italic text-slate-500">
                    {selectedUser.shouldMask
                      ? `+91 ${selectedUser.displayMobile}`
                      : "Number Hidden"}
                  </span>
                ) : (
                  <span>+91 {selectedUser.mobile}</span>
                )}
              </div>
            </div>
            <div className="glass-card p-3 rounded-xl border border-white/5">
              <div className="text-xs text-slate-400 mb-1">Profession</div>
              <div className="text-white font-medium">
                {selectedUser.shouldMask
                  ? "Hidden"
                  : selectedUser.profession || "N/A"}
              </div>
            </div>
            <div className="glass-card p-3 rounded-xl border border-white/5 col-span-2">
              <div className="text-xs text-slate-400 mb-1">Location</div>
              <div className="text-white font-medium">
                {selectedUser.displayLocation ||
                  selectedUser.location ||
                  "Apna Nimboda"}
              </div>
            </div>
          </div>

          {(selectedUser.instagram ||
            selectedUser.facebook ||
            selectedUser.twitter) && (
            <div className="flex items-center gap-4 justify-center mt-2 mb-2">
              {selectedUser.instagram && (
                <a
                  href={`https://instagram.com/${selectedUser.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 hover:bg-pink-500/20 transition-transform hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              )}
              {selectedUser.facebook && (
                <a
                  href={
                    selectedUser.facebook.startsWith("http")
                      ? selectedUser.facebook
                      : `https://${selectedUser.facebook}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 transition-transform hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              )}
              {selectedUser.twitter && (
                <a
                  href={`https://twitter.com/${selectedUser.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400 hover:bg-sky-500/20 transition-transform hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              )}
            </div>
          )}

          <Link href={`/chat/${selectedUser.id}`} className="block">
            <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors mb-2">
              Send Private Message
            </button>
          </Link>

          {!selectedUser.is_private && !selectedUser.shouldMask && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <a
                  href={`tel:+91${selectedUser.mobile}`}
                  className="flex-1 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-medium flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
                <a
                  href={`https://wa.me/91${selectedUser.mobile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 font-medium flex items-center justify-center gap-2 hover:bg-green-500/30 transition-colors border border-green-500/30 text-sm"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
              </div>
              {features.calling === "active" &&
                user &&
                selectedUser.id !== (user.uid || user.mobile) && (
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        alert("In-App Audio Calling feature is coming soon!")
                      }
                      className="flex-1 py-3 rounded-xl bg-indigo-500/20 text-indigo-400 font-medium flex items-center justify-center gap-2 hover:bg-indigo-500/30 transition-colors border border-indigo-500/30 text-sm"
                    >
                      <Phone className="w-4 h-4" /> In-App Audio
                    </button>
                    <button
                      onClick={async () => {
                        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                          try {
                            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                            stream.getTracks().forEach(track => track.stop());
                            if (user) {
                              await fetch("/api/users/update", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  userId: user.uid || user.mobile,
                                  type: "permissions",
                                  data: {
                                    media: true,
                                    updatedAt: Date.now()
                                  }
                                })
                              });
                            }
                          } catch (e) {}
                        }
                        alert("In-App Video Calling feature is coming soon!");
                      }}
                      className="flex-1 py-3 rounded-xl bg-pink-500/20 text-pink-400 font-medium flex items-center justify-center gap-2 hover:bg-pink-500/30 transition-colors border border-pink-500/30 text-sm"
                    >
                      <Video className="w-4 h-4" /> In-App Video
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
