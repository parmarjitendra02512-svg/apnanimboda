import { motion } from "framer-motion";
import { Check, X, Users, Edit2, AlertTriangle, Search } from "lucide-react";

interface DirectoryTabProps {
  requests: any[];
  handleApprove: (req: any) => void;
  handleReject: (req: any) => void;
  pendingEdits: any[];
  pendingResets?: any[];
  pendingMobileUpdates?: any[];
  handleApproveEdit: (edit: any) => void;
  handleRejectEdit: (editId: string) => void;
  handleApproveReset?: (reset: any) => void;
  handleRejectReset?: (reset: any) => void;
  handleApproveMobileUpdate?: (updateReq: any) => void;
  handleRejectMobileUpdate?: (oldMobile: string) => void;
  approvedUsers: any[];
  userSearchTerm: string;
  setUserSearchTerm: (term: string) => void;
  userCurrentPage: number;
  setUserCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setEditingUser: (u: any) => void;
  setBanModalUser: (u: any) => void;
  handleDeleteUser: (u: any) => void;
}

export default function DirectoryTab({
  requests,
  handleApprove,
  handleReject,
  pendingEdits,
  pendingResets = [],
  pendingMobileUpdates = [],
  handleApproveEdit,
  handleRejectEdit,
  handleApproveReset,
  handleRejectReset,
  handleApproveMobileUpdate,
  handleRejectMobileUpdate,
  approvedUsers,
  userSearchTerm,
  setUserSearchTerm,
  userCurrentPage,
  setUserCurrentPage,
  itemsPerPage,
  setEditingUser,
  setBanModalUser,
  handleDeleteUser,
}: DirectoryTabProps) {
  return (
    <div className="grid gap-12">
      {/* Pending New Registrations */}
      {requests.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            New Registrations{" "}
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {requests.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={req.id}
                className="glass-card p-5 flex flex-col gap-4 border-l-4 border-l-amber-500/50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">{req.name}</h3>
                    <p className="text-sm text-slate-400">S/O {req.father}</p>
                    <p className="text-sm font-medium text-blue-400 mt-1">
                      {req.mobile}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleApprove(req)}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium flex items-center justify-center gap-1 hover:bg-emerald-500/30 transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Profile Edits */}
      {pendingEdits.length > 0 && (
        <section className="mt-8 border-t border-white/10 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            Pending Profile Edits{" "}
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {pendingEdits.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingEdits.map((edit, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                key={edit.id}
                className="glass-card p-5 flex flex-col gap-4 border-l-4 border-l-amber-500/50 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">
                      Edit Request
                    </h3>
                    <p className="text-xs text-slate-400">UID: {edit.uid}</p>
                    <div className="mt-3 space-y-1 text-sm bg-black/20 p-3 rounded-xl border border-white/5">
                      <p className="text-slate-200">
                        <span className="text-slate-400">Name:</span>{" "}
                        {edit.name}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">S/O:</span>{" "}
                        {edit.father}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">Profession:</span>{" "}
                        {edit.profession}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">Location:</span>{" "}
                        {edit.location}
                      </p>
                      <p className="text-slate-200">
                        <span className="text-slate-400">Public Profile:</span>{" "}
                        {edit.is_public ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  {edit.photoUrl && (
                    <div className="w-16 h-16 shrink-0 rounded-full bg-white/10 ml-3 overflow-hidden border border-white/20">
                      <img
                        src={edit.photoUrl}
                        alt="New Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleApproveEdit(edit)}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium flex items-center justify-center gap-1 hover:bg-emerald-500/30 transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectEdit(edit.id)}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Mobile Number Updates */}
      {pendingMobileUpdates.length > 0 && (
        <section className="mt-8 border-t border-white/10 pt-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            Pending Mobile Number Updates{" "}
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {pendingMobileUpdates.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingMobileUpdates.map((updateReq, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                key={updateReq.id}
                className="glass-card p-5 flex flex-col gap-4 border-l-4 border-l-blue-500/50"
              >
                <div>
                  <h3 className="text-lg font-bold text-white">{updateReq.name}</h3>
                  <div className="mt-3 bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-400">Current Number:</span><br/>
                      <span className="font-mono text-red-400 line-through">{updateReq.oldMobile}</span>
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-400">New Number:</span><br/>
                      <span className="font-mono text-emerald-400 font-bold">{updateReq.newMobile}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleApproveMobileUpdate && handleApproveMobileUpdate(updateReq)}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium flex items-center justify-center gap-1 hover:bg-emerald-500/30 transition-colors text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectMobileUpdate && handleRejectMobileUpdate(updateReq.oldMobile)}
                    className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Approved Villagers{" "}
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              {approvedUsers.length}
            </span>
          </h2>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={userSearchTerm}
              onChange={(e) => {
                setUserSearchTerm(e.target.value);
                setUserCurrentPage(1);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
              placeholder="Search name or number..."
            />
          </div>
        </div>

        <div className="glass-card rounded-xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">User Details</th>
                  <th className="px-4 py-3">Contact / Pwd</th>
                  <th className="px-4 py-3">Location & GPS</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(() => {
                  const filtered = approvedUsers.filter(
                    (u) =>
                      u.name
                        ?.toLowerCase()
                        .includes(userSearchTerm.toLowerCase()) ||
                      u.mobile?.includes(userSearchTerm),
                  );
                  const displayed = filtered.slice(
                    (userCurrentPage - 1) * itemsPerPage,
                    userCurrentPage * itemsPerPage,
                  );

                  if (displayed.length === 0)
                    return (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-slate-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    );

                  return displayed.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {u.photoUrl ? (
                            <img
                              src={u.photoUrl}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white flex items-center gap-2">
                          {u.name}
                          {u.lastLogin && (
                            <span
                              title="Active Recently"
                              className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"
                            ></span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          S/O {u.father}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-blue-400 font-medium">
                          {u.mobile}
                        </div>
                        {u.password && (
                          <div className="text-xs text-slate-500 font-mono">
                            Pwd: {u.password}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[250px]">
                        {u.liveLocation ? (
                          <div className="mb-2">
                            <a
                              href={`https://maps.google.com/?q=${u.liveLocation.lat},${u.liveLocation.lng}`}
                              target="_blank"
                              className="text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30 inline-block font-medium"
                            >
                              📍 Live GPS Map
                            </a>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {new Date(u.liveLocation.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500 mb-2">{u.location ? String(u.location) : "No Live GPS"}</div>
                        )}
                        
                        {u.permissions && (
                          <div className="flex gap-1 flex-wrap">
                            <span className={`px-1.5 rounded text-[10px] ${u.permissions.location ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>Loc</span>
                            <span className={`px-1.5 rounded text-[10px] ${u.permissions.notifications ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>Notif</span>
                            <span className={`px-1.5 rounded text-[10px] ${u.permissions.media ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>Cam</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/30 transition-colors inline-block"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBanModalUser(u)}
                          className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/30 transition-colors inline-block"
                          title="Ban"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors inline-block"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {(() => {
            const filtered = approvedUsers.filter(
              (u) =>
                u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                u.mobile?.includes(userSearchTerm),
            );
            const total = Math.ceil(filtered.length / itemsPerPage);
            if (total <= 1) return null;
            return (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-black/20">
                <span className="text-xs text-slate-400">
                  Showing page {userCurrentPage} of {total}
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={userCurrentPage === 1}
                    onClick={() =>
                      setUserCurrentPage((p) => Math.max(1, p - 1))
                    }
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded text-sm text-white"
                  >
                    Prev
                  </button>
                  <button
                    disabled={userCurrentPage === total}
                    onClick={() =>
                      setUserCurrentPage((p) => Math.min(total, p + 1))
                    }
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded text-sm text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
