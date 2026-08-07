import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Phone,
  MessageSquare,
  Settings,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import ReportModal from "@/components/ReportModal";

interface UserDirectoryProps {
  paginatedUsers: any[];
  filteredUsersCount: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  itemsPerPage: number;
  isAdmin: boolean;
  globalPrivacy: boolean;
  setSelectedUser: (user: any) => void;
}

export default function UserDirectory({
  paginatedUsers,
  filteredUsersCount,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  isAdmin,
  globalPrivacy,
  setSelectedUser,
}: UserDirectoryProps) {
  const [reportEntity, setReportEntity] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedUsers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 glass-card">
            No people found in this category matching your search.
          </div>
        ) : (
          paginatedUsers.map((u, index) => {
            const shouldMask =
              !isAdmin && (globalPrivacy || u.force_mask || !u.is_public);
            const displayName = shouldMask
              ? u.name
                ? u.name.charAt(0) + "****" + u.name.charAt(u.name.length - 1)
                : ""
              : u.name;
            const displayMobile = shouldMask
              ? u.mobile
                ? u.mobile.toString().substring(0, 2) +
                  "******" +
                  u.mobile.toString().substring(8)
                : ""
              : u.mobile;
            const displayLocation = shouldMask ? "Location Hidden" : u.location;
            const displayPhoto = shouldMask ? "" : u.photoUrl;

            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, rotateX: 3, rotateY: -3, y: -5 }}
                style={{ transformStyle: "preserve-3d" }}
                transition={{ delay: index * 0.05 }}
                className="ultra-glass p-5 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all group relative overflow-hidden flex flex-col h-full"
              >
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20 shadow-lg">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="text-white w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      {displayName}
                      {u.planType && u.planType !== "free" && (
                        <div
                          className="text-blue-400 ml-1"
                          title="Premium Verified"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                          </svg>
                        </div>
                      )}
                    </h3>
                    <p className="text-sm text-slate-300 font-medium">
                      s/o {shouldMask ? "****" : u.father}
                    </p>
                  </div>
                </div>

                {/* Action Buttons (Call / WA) */}
                {!shouldMask && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <a
                      href={`tel:+91${u.mobile}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/20 text-blue-300 font-medium hover:bg-blue-500/30 transition-colors border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                    <a
                      href={`https://wa.me/91${u.mobile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-medium hover:bg-green-500/30 transition-colors border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                    >
                      <MessageSquare className="w-4 h-4" /> Chat
                    </a>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                  <button
                    onClick={() =>
                      setSelectedUser({
                        ...u,
                        displayName,
                        displayMobile,
                        displayLocation,
                        displayPhoto,
                        shouldMask,
                      })
                    }
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-colors border border-white/10 text-center"
                  >
                    View Details
                  </button>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() =>
                        setReportEntity({
                          id: u.id,
                          name: displayName || "Unknown",
                        })
                      }
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                      title="Report User"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        className="p-2 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors border border-purple-500/30"
                        title="Admin Options"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="mt-12 mb-4 flex flex-wrap items-center justify-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 h-12 flex flex-col items-center justify-center rounded-xl border transition-colors ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <span className="text-sm font-bold">Box {page}</span>
            <span className="text-[10px] opacity-70">
              {(page - 1) * itemsPerPage + 1}-
              {Math.min(page * itemsPerPage, filteredUsersCount)}
            </span>
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
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
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <ReportModal
        isOpen={!!reportEntity}
        onClose={() => setReportEntity(null)}
        reportedEntityId={reportEntity?.id || ""}
        reportedEntityName={reportEntity?.name || ""}
        entityType="user"
      />
    </>
  );
}
