import { MessageSquare, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BroadcastModal({
  showBroadcastModal,
  setShowBroadcastModal,
  broadcastText,
  setBroadcastText,
  broadcastPhotoUrl,
  handleBroadcastPhotoUpload,
  handleBroadcastSubmit,
  broadcastLoading,
}: any) {
  if (!showBroadcastModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel rounded-2xl p-6 relative border border-pink-500/30"
      >
        <button
          onClick={() => setShowBroadcastModal(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-pink-400 mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Broadcast to All
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          Send a message to all approved users instantly.
        </p>

        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div>
            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-32 resize-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Attach Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBroadcastPhotoUpload}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-500/20 file:text-pink-400 hover:file:bg-pink-500/30 cursor-pointer"
            />
            {broadcastPhotoUrl && (
              <img
                src={broadcastPhotoUrl}
                className="h-32 object-contain mt-2 rounded-lg"
                alt="broadcast attachment"
              />
            )}
          </div>
          <button
            disabled={broadcastLoading}
            type="submit"
            className="w-full py-3 rounded-xl bg-pink-600 text-white font-medium flex items-center justify-center gap-2 mt-4 hover:bg-pink-500 disabled:opacity-50"
          >
            {broadcastLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Send Broadcast"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
