import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { adminApiCall } from "@/lib/api";

export default function ArchivedTab({ archivedUsers }: any) {
  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Users className="text-orange-400 w-6 h-6" /> Archived Users (Soft Deleted)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archivedUsers.map((user: any, idx: number) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={user.id}
            className="glass-card p-5 border-l-4 border-l-orange-500/50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-white">{user.name}</h3>
                <p className="text-sm text-blue-400">{user.mobile}</p>
              </div>
            </div>
            <p className="text-xs text-orange-400 bg-orange-500/10 p-2 rounded border border-orange-500/20 mb-4">
              Reason: {user.deleteReason}
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone!")) {
                    try {
                      await adminApiCall("delete_user", { id: user.id, mobile: user.mobile });
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
                className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
              >
                Delete
              </button>
              <button
                onClick={async () => {
                  if (window.confirm("Restore this user back to approved directory?")) {
                    try {
                      await adminApiCall("unarchive_user", { user });
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors border border-white/10"
              >
                Restore
              </button>
            </div>
          </motion.div>
        ))}
        {archivedUsers.length === 0 && (
          <div className="col-span-full text-center p-12 text-slate-400 glass-card">
            No archived users found.
          </div>
        )}
      </div>
    </div>
  );
}
