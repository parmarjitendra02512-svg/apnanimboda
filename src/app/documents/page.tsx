"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileBadge,
  Loader2,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    idType: "AADHAAR",
    idNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.idNumber) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessData(null);

    // Mock Payload based on user's structure
    const payload = {
      txnId: crypto.randomUUID(),
      format: "pdf",
      certificateParameters: {
        FullName: formData.fullName,
      },
      consentArtifact: {
        consent: {
          consentId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          dataConsumer: { id: "Nimboda-app" },
          dataProvider: { id: "digilocker" },
          purpose: { description: "Download official certificate" },
          user: {
            idType: formData.idType,
            idNumber: formData.idNumber,
            mobile: "",
            email: "",
          },
          permission: {
            access: "VIEW_DOWNLOAD",
            dateRange: {
              from: new Date().toISOString(),
              to: new Date().toISOString(),
            },
          },
        },
        signature: { signature: "system-generated-signature" },
      },
    };

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "ok") {
        setSuccessData(data.data);
      } else {
        setError(data.message || "Server error. Please try again later.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        "An error occurred while connecting to the server. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[url('https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2000')] bg-cover bg-center bg-fixed relative">
      <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl glass-panel rounded-2xl p-4 md:p-6 flex items-center justify-between z-10 sticky top-4 mb-8 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" replace>
            <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <FileBadge className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                e-Documents
              </h1>
              <p className="text-xs text-indigo-200">
                Govt. Certificates & Records
              </p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span className="text-xs font-semibold text-green-300">
            Secure 256-bit
          </span>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="w-full max-w-xl z-10 flex-1 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Fetch Certificate
            </h2>
            <p className="text-indigo-200 text-sm">
              Enter details exactly as printed on your official document.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label className="text-sm font-medium text-indigo-200 block mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="e.g. Sunil Kumar"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-indigo-200 block mb-2">
                Document Type
              </label>
              <select
                value={formData.idType}
                onChange={(e) =>
                  setFormData({ ...formData, idType: e.target.value })
                }
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="TENTH_MARKSHEET">10th Marksheet</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-indigo-200 block mb-2">
                Document ID Number
              </label>
              <input
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
                placeholder="Enter ID number..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3 mt-4">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Fetching Securely...
                </>
              ) : (
                "Get Document"
              )}
            </button>
          </form>

          {/* Success State */}
          <AnimatePresence>
            {successData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-8 pt-8 border-t border-white/10"
              >
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Document Found!
                  </h3>
                  <p className="text-sm text-green-200 mb-6">
                    Your certificate has been securely fetched from the central
                    database.
                  </p>

                  <div className="w-full flex flex-col gap-3">
                    {/* If API returns a direct PDF download link */}
                    {successData.pdfUrl ? (
                      <a
                        href={successData.pdfUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                      >
                        <Download className="w-5 h-5" /> Download PDF
                      </a>
                    ) : (
                      <button className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                        <Download className="w-5 h-5" /> Save to Device (Demo)
                      </button>
                    )}
                    <button
                      onClick={() => setSuccessData(null)}
                      className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Fetch Another
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Notes */}
        <div className="mt-8 text-center flex flex-col items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400/50" />
          <p className="text-xs text-indigo-200/50 max-w-sm">
            Powered by e-Documents API. All transactions are securely encrypted
            and authenticated via UIDAI/DigiLocker standards.
          </p>
        </div>
      </main>
    </div>
  );
}
