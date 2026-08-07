import { motion } from "framer-motion";
import { X, Save } from "lucide-react";

interface UserEditModalProps {
  editingUser: any;
  setEditingUser: (user: any) => void;
  handleDirectEditSave: (e: React.FormEvent) => void;
}

export default function UserEditModal({
  editingUser,
  setEditingUser,
  handleDirectEditSave,
}: UserEditModalProps) {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel rounded-2xl p-6 relative my-auto"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setEditingUser(null)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
          >
            <X className="text-slate-300 w-5 h-5" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Edit User: {editingUser.name}
          </h2>
        </div>

        <form onSubmit={handleDirectEditSave} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              value={editingUser.name || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Father's Name
            </label>
            <input
              type="text"
              value={editingUser.father || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, father: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Location / Ward
            </label>
            <input
              type="text"
              value={editingUser.location || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, location: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Gram Panchayat
              </label>
              <input
                type="text"
                value={editingUser.gram_panchayat || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    gram_panchayat: e.target.value,
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                placeholder="Panchayat Name"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                value={editingUser.pincode || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    pincode: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                placeholder="343030"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Category / Profession
            </label>
            <input
              type="text"
              value={editingUser.profession || ""}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  profession: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
              placeholder="e-Mitra, Student"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Platform Role
            </label>
            <select
              value={editingUser.role || "user"}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
            >
              <option value="user">Normal User</option>
              <option value="head">Head (Teacher / Moderator)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Password
            </label>
            <input
              type="text"
              value={editingUser.password || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, password: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
            />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 mt-2">
            <input
              type="checkbox"
              id="forceMask"
              checked={editingUser.force_mask || false}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  force_mask: e.target.checked,
                })
              }
              className="w-5 h-5 rounded"
            />
            <label htmlFor="forceMask" className="text-sm text-slate-300">
              Force Mask (Hide Details for Normal Users)
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium flex items-center justify-center gap-2 mt-4 hover:bg-blue-500"
          >
            <Save className="w-4 h-4" /> Save Changes Immediately
          </button>
        </form>
      </motion.div>
    </div>
  );
}
