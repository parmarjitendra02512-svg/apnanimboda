import { motion } from "framer-motion";
import { X } from "lucide-react";

interface BanUserModalProps {
  banModalUser: any;
  setBanModalUser: (user: any) => void;
  banDuration: string;
  setBanDuration: (duration: string) => void;
  handleBanSubmit: (e: React.FormEvent) => void;
}

export default function BanUserModal({
  banModalUser,
  setBanModalUser,
  banDuration,
  setBanDuration,
  handleBanSubmit,
}: BanUserModalProps) {
  if (!banModalUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm glass-panel border border-orange-500/30 rounded-2xl p-6 relative"
      >
        <button
          onClick={() => setBanModalUser(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-orange-400 mb-2">
          Ban {banModalUser.name}?
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          Select duration. Banned users cannot login or register with this
          number.
        </p>

        <form onSubmit={handleBanSubmit} className="space-y-4">
          <select
            value={banDuration}
            onChange={(e) => setBanDuration(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
          >
            <option value="permanent">Permanent Ban</option>
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
          </select>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-orange-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-orange-500"
          >
            Confirm Ban
          </button>
        </form>
      </motion.div>
    </div>
  );
}
