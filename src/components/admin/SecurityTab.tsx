import { ShieldCheck } from "lucide-react";
import { adminApiCall } from "@/lib/api";

export default function SecurityTab({ systemLogs }: any) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-red-400 w-6 h-6" /> Live Security &
          Error Logs
        </h2>
        <button
          onClick={async () => {
            if (window.confirm("Clear all system logs?")) {
              try {
                await adminApiCall("clear_system_logs");
              } catch (e) {
                console.error(e);
              }
            }
          }}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm border border-red-500/30 transition-colors"
        >
          Clear All Logs
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-red-500/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Error Message</th>
                <th className="px-4 py-3 rounded-tr-lg">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {systemLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-slate-500"
                  >
                    No logs captured yet. System is healthy.
                  </td>
                </tr>
              ) : (
                systemLogs.map((log: any) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString("en-IN")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${log.type === "error" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}
                      >
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">
                        {log.userMobile || "Guest"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.userId}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 max-w-xs truncate"
                      title={log.stack || log.message}
                    >
                      {log.message}
                    </td>
                    <td className="px-4 py-3 truncate max-w-[150px] text-blue-400">
                      {log.url}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
