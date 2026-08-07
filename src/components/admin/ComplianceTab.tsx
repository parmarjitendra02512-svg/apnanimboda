import { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, Trash2, Ban } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";

export default function ComplianceTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsRef = ref(db, "reports");
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a: any, b: any) => b.timestamp - a.timestamp);
        setReports(parsed);
      } else {
        setReports([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolve = async (reportId: string) => {
    try {
      await update(ref(db, `reports/${reportId}`), { status: "resolved" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleIgnore = async (reportId: string) => {
    try {
      await update(ref(db, `reports/${reportId}`), { status: "ignored" });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm("Delete this report record completely?")) {
      await remove(ref(db, `reports/${reportId}`));
    }
  };

  const handleBanUser = async (userId: string, reportId: string) => {
    if (
      confirm(
        `Are you sure you want to BAN user ${userId}? This will block their login.`,
      )
    ) {
      try {
        await update(ref(db, `approved_users/${userId}`), { isBanned: true });
        await handleResolve(reportId);
        alert("User has been banned.");
      } catch (e) {
        console.error(e);
        alert("Failed to ban user.");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">Loading reports...</div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === "pending");
  const pastReports = reports.filter((r) => r.status !== "pending");

  return (
    <div className="grid gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-red-500/20 mb-4 bg-gradient-to-r from-red-500/10 to-transparent">
        <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Government Compliance & Legal Reports
        </h2>
        <p className="text-sm text-slate-400">
          Manage user reports to comply with IT Rules (2021). You must review
          pending reports and take appropriate action against abusive content or
          users.
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-red-500/20">
        <div className="bg-red-500/10 p-4 flex justify-between items-center border-b border-red-500/20">
          <h3 className="font-bold text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Pending Action ({pendingReports.length})
          </h3>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {pendingReports.length === 0 ? (
            <p className="text-center text-slate-500 py-4 text-sm">
              No pending reports. All clear!
            </p>
          ) : (
            pendingReports.map((report) => (
              <div
                key={report.id}
                className="bg-white/5 rounded-xl p-4 border border-red-500/30"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      {report.reason}
                    </span>
                    <p className="text-sm text-slate-200 mt-2">
                      <span className="text-slate-400">Entity:</span>{" "}
                      {report.reportedEntityName}{" "}
                      <span className="text-xs opacity-50">
                        ({report.entityType})
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Reported by:{" "}
                      <span className="font-medium text-slate-300">
                        {report.reporterName}
                      </span>
                    </p>
                    {report.description && (
                      <p className="text-sm text-slate-300 mt-2 p-2 bg-black/20 rounded-lg italic">
                        "{report.description}"
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    {new Date(report.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleBanUser(report.reportedEntityId, report.id)
                    }
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 flex items-center gap-1 transition-colors"
                  >
                    <Ban className="w-3 h-3" /> Ban User
                  </button>
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark Resolved
                  </button>
                  <button
                    onClick={() => handleIgnore(report.id)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 flex items-center gap-1 transition-colors ml-auto"
                  >
                    Ignore (False Report)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10">
          <h3 className="font-bold text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Resolved & Ignored ({pastReports.length})
          </h3>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto opacity-70">
          {pastReports.length === 0 ? (
            <p className="text-center text-slate-500 py-4 text-sm">
              No past reports.
            </p>
          ) : (
            pastReports.map((report) => (
              <div
                key={report.id}
                className="bg-white/5 rounded-xl p-3 border border-white/5 flex justify-between items-center"
              >
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${report.status === "resolved" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-300"}`}
                  >
                    {report.status}
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    <span className="font-medium">{report.reason}</span> against{" "}
                    {report.reportedEntityName}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
