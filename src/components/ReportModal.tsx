import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedEntityId: string;
  reportedEntityName: string;
  entityType: "user" | "post" | "chat";
}

const REPORT_REASONS = [
  "Spam or Misleading",
  "Harassment or Bullying",
  "Inappropriate Content (Nudity/Violence)",
  "Scam or Fraud",
  "Hate Speech",
  "Other",
];

export default function ReportModal({
  isOpen,
  onClose,
  reportedEntityId,
  reportedEntityName,
  entityType,
}: ReportModalProps) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError("Please select a reason for reporting.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reporterId: user?.uid || "anonymous",
          reporterName: user?.name || user?.mobile || "Anonymous",
          reportedEntityId,
          reportedEntityName,
          entityType,
          reason: selectedReason,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedReason("");
        setDescription("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md glass-panel rounded-2xl overflow-hidden shadow-2xl border border-red-500/20"
        >
          {/* Header */}
          <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex justify-between items-center">
            <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Report{" "}
              {entityType === "user"
                ? "User"
                : entityType === "post"
                  ? "Content"
                  : "Chat"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          <div className="p-6">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Report Submitted
                </h3>
                <p className="text-slate-400 text-sm">
                  Thank you for keeping our community safe. Our admins will
                  review this shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm text-slate-300 mb-3">
                    You are reporting{" "}
                    <span className="font-bold text-white">
                      {reportedEntityName}
                    </span>
                    . This action is strictly confidential.
                  </p>

                  <label className="text-sm font-medium text-slate-400 mb-2 block">
                    Why are you reporting this?
                  </label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedReason === reason ? "bg-red-500/10 border-red-500/50" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="w-4 h-4 text-red-500 bg-black/50 border-white/20 focus:ring-red-500"
                        />
                        <span
                          className={`text-sm ${selectedReason === reason ? "text-red-300 font-medium" : "text-slate-200"}`}
                        >
                          {reason}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-400 mb-2 block">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide any extra context..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-red-500/50 h-24 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedReason}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium flex justify-center items-center gap-2 transition-colors text-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit Report"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
