import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function AdminBroadcastBanner({ broadcast }: { broadcast: any }) {
  if (!broadcast) return null;
  
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-8 p-3 rounded-xl glass-card border border-pink-500/30 flex items-center justify-between gap-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 overflow-hidden"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 border border-pink-500/30">
          <Bell className="w-4 h-4 text-pink-400" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <span className="text-pink-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
            Admin Broadcast:
          </span>
          <p className="text-white text-sm truncate">{broadcast.text}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {broadcast.photoUrl && (
          <img
            src={broadcast.photoUrl}
            alt="Broadcast Attachment"
            className="h-8 w-8 object-cover rounded border border-white/10 hidden md:block"
          />
        )}
        <Link href={`/chat/admin_config_master`}>
          <button className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs rounded-lg font-medium transition-colors whitespace-nowrap">
            Reply
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
