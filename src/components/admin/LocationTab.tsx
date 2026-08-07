import { Activity } from "lucide-react";

export default function LocationTab({ approvedUsers }: any) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-400 w-6 h-6" /> Live GPS Tracking
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Monitor real-time locations of users who have GPS enabled.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">GPS Coordinates</th>
              <th className="px-4 py-3">Last Synced</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {approvedUsers
              .filter(
                (u: any) =>
                  u.location &&
                  typeof u.location === "object" &&
                  u.location.lat,
              )
              .map((u: any) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-xs text-blue-400">{u.mobile}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {(u.location as any).lat.toFixed(6)},{" "}
                    {(u.location as any).lng.toFixed(6)}
                  </td>
                  <td className="px-4 py-3">
                    {(u.location as any).updatedAt
                      ? new Date((u.location as any).updatedAt).toLocaleString()
                      : "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${(u.location as any).lat},${(u.location as any).lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/40 transition-colors inline-block text-xs font-medium border border-emerald-500/30"
                    >
                      View Map
                    </a>
                  </td>
                </tr>
              ))}
            {approvedUsers.filter(
              (u: any) =>
                u.location &&
                typeof u.location === "object" &&
                u.location.lat,
            ).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No users currently have real-time GPS tracking enabled.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
