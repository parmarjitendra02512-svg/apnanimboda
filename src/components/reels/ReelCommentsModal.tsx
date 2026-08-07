import { motion, AnimatePresence } from "framer-motion";
import { X, User, Trash2, MessageCircle, Send } from "lucide-react";

interface ReelCommentsModalProps {
  activeCommentReel: any;
  setActiveCommentReel: (reel: any) => void;
  isAdmin: boolean;
  currentUid: string | null;
  handleDeleteComment: (commentId: string, userId: string) => void;
  user: any;
  commentText: string;
  setCommentText: (text: string) => void;
  handlePostComment: () => void;
}

export default function ReelCommentsModal({
  activeCommentReel,
  setActiveCommentReel,
  isAdmin,
  currentUid,
  handleDeleteComment,
  user,
  commentText,
  setCommentText,
  handlePostComment,
}: ReelCommentsModalProps) {
  if (!activeCommentReel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveCommentReel(null)}
        className="fixed inset-0 bg-black/80 z-[999990] backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 h-[68dvh] bg-zinc-900 rounded-t-3xl z-[999999] flex flex-col border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] md:w-[420px] md:left-auto md:h-[100dvh] md:rounded-l-3xl md:rounded-tr-none md:border-l"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-white font-bold text-lg">कमेंट्स (Comments)</h3>
            <p className="text-zinc-400 text-xs">
              आप अपने कमेंट्स को हटा सकते हैं
            </p>
          </div>
          <button
            onClick={() => setActiveCommentReel(null)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {activeCommentReel.comments &&
          Object.keys(activeCommentReel.comments).length > 0 ? (
            Object.entries(activeCommentReel.comments)
              .filter(([_, comment]: any) => isAdmin || !comment.deleted)
              .sort(
                (a: any, b: any) =>
                  (a[1].timestamp || 0) - (b[1].timestamp || 0)
              )
              .map(([cId, comment]: any) => {
                const isMyComment = currentUid && comment.userId === currentUid;
                const canDelete = isMyComment || isAdmin;

                return (
                  <div
                    key={cId}
                    className={`flex items-start justify-between gap-3 p-2.5 rounded-2xl transition-all ${
                      comment.deleted
                        ? "bg-rose-950/20 border border-rose-500/20 opacity-70"
                        : "bg-white/5 border border-white/5"
                    }`}
                  >
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-white/10 flex items-center justify-center">
                        {comment.userPhoto ? (
                          <img
                            src={comment.userPhoto}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-sm font-bold truncate">
                            {comment.userName || "निम्बोड़ा वासी"}
                          </span>
                          {comment.deleted && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                              हटाया गया
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm mt-1 break-words ${comment.deleted ? "text-slate-500 line-through" : "text-slate-200"}`}
                        >
                          {comment.text}
                        </p>
                      </div>
                    </div>

                    {!comment.deleted && canDelete && (
                      <button
                        onClick={() => handleDeleteComment(cId, comment.userId)}
                        title="कमेंट हटाएं"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
              <MessageCircle className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">पहला कमेंट करें!</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-zinc-900 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-amber-950 shrink-0 border border-amber-500/30 flex items-center justify-center">
              {user?.displayPhoto ? (
                <img
                  src={user.displayPhoto}
                  alt="You"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
              placeholder="कमेंट लिखें (Add a comment)..."
              className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
