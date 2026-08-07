import { Bot } from "lucide-react";
import CategoryEditor from "./CategoryEditor";

export default function CategoriesTab({
  coreCategories,
  categoriesControl,
  handleUpdateCategoryState,
  handleUpdateCategoryMessage,
}: any) {
  return (
    <div className="grid gap-6">
      <CategoryEditor />
      
      <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-400" /> Core Category Manager
          (3-State)
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Manage visibility of categories on the dashboard. You can set
          them to Active, Pending (shows maintenance message), or Hidden.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreCategories.map((cat: any) => {
            const catData = categoriesControl[cat.id] || {
              state: "active",
              lockMessage: "Pending",
            };
            if (!catData.state && catData.isLocked !== undefined) {
              catData.state = catData.isLocked ? "pending" : "active";
            }

            return (
              <div
                key={cat.id}
                className={`glass-card p-5 rounded-xl border ${catData.state !== "active" ? "border-red-500/30 bg-red-500/5" : "border-white/10"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">{cat.label}</h3>
                  <select
                    value={catData.state || "active"}
                    onChange={(e) =>
                      handleUpdateCategoryState(cat.id, e.target.value)
                    }
                    className="bg-black/50 border border-white/20 text-white text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1 outline-none"
                  >
                    <option value="active">🟢 Active</option>
                    <option value="pending">🟡 Pending</option>
                    <option value="hidden">🔴 Hidden</option>
                  </select>
                </div>

                {catData.state === "pending" && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                    <label className="text-xs text-slate-400">
                      Lock Message to Show Users
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={catData.lockMessage || "Pending"}
                        onBlur={(e) =>
                          handleUpdateCategoryMessage(
                            cat.id,
                            e.target.value,
                          )
                        }
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousElementSibling as HTMLInputElement;
                          handleUpdateCategoryMessage(
                            cat.id,
                            input.value,
                          );
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
