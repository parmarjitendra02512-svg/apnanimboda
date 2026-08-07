import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, X, Edit2, ShieldAlert } from "lucide-react";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";

export interface CustomCategory {
  id: string;
  label: string;
  iconName: string;
  colorClass: string;
  bgClass: string;
}

export default function CategoryEditor() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CustomCategory>({
    id: "",
    label: "",
    iconName: "Briefcase", // Default icon
    colorClass: "text-blue-400",
    bgClass: "from-blue-500/20 to-blue-600/20",
  });

  useEffect(() => {
    const catRef = ref(db, "admin_settings/custom_categories");
    const unsub = onValue(catRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(data);
      } else {
        setCategories([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.label.trim()) return;

    try {
      const newId = editForm.id || "cat_" + Date.now();
      const updatedCategory = { ...editForm, id: newId };
      
      let newCategories = [...categories];
      const existingIndex = newCategories.findIndex(c => c.id === newId);
      if (existingIndex >= 0) {
        newCategories[existingIndex] = updatedCategory;
      } else {
        newCategories.push(updatedCategory);
      }

      await set(ref(db, "admin_settings/custom_categories"), newCategories);
      
      setIsEditing(false);
      setEditForm({ id: "", label: "", iconName: "Briefcase", colorClass: "text-blue-400", bgClass: "from-blue-500/20 to-blue-600/20" });
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this custom category?")) return;
    try {
      const newCategories = categories.filter(c => c.id !== id);
      await set(ref(db, "admin_settings/custom_categories"), newCategories);
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const startEdit = (cat: CustomCategory) => {
    setEditForm(cat);
    setIsEditing(true);
  };

  const iconOptions = ["Briefcase", "Car", "Tool", "Hammer", "Stethoscope", "Cpu", "Store", "ShoppingBag"];
  const colorOptions = [
    { label: "Blue", text: "text-blue-400", bg: "from-blue-500/20 to-blue-600/20" },
    { label: "Emerald", text: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/20" },
    { label: "Rose", text: "text-rose-400", bg: "from-rose-500/20 to-rose-600/20" },
    { label: "Amber", text: "text-amber-400", bg: "from-amber-500/20 to-amber-600/20" },
    { label: "Purple", text: "text-purple-400", bg: "from-purple-500/20 to-purple-600/20" },
    { label: "Cyan", text: "text-cyan-400", bg: "from-cyan-500/20 to-cyan-600/20" },
  ];

  if (loading) return <div className="text-slate-400">Loading custom categories...</div>;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Plus className="w-6 h-6 text-indigo-400" /> Custom Category Editor
          </h2>
          <p className="text-slate-400 text-sm">Create specific categories (like Driver, Plumber, etc.) for users to filter the directory.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setEditForm({ id: "", label: "", iconName: "Briefcase", colorClass: "text-blue-400", bgClass: "from-blue-500/20 to-blue-600/20" });
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {isEditing && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 border border-white/10 rounded-xl bg-white/5">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Category Name</label>
              <input
                type="text"
                value={editForm.label}
                onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                placeholder="e.g. Plumber, Driver, Electrician"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Select Icon</label>
                <select
                  value={editForm.iconName}
                  onChange={(e) => setEditForm({...editForm, iconName: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                >
                  {iconOptions.map(ico => <option key={ico} value={ico}>{ico}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-1">Select Color Theme</label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setEditForm({...editForm, colorClass: c.text, bgClass: c.bg})}
                      className={`w-8 h-8 rounded-full border-2 ${editForm.colorClass === c.text ? "border-white" : "border-transparent"} bg-gradient-to-br ${c.bg}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-500">
                <Save className="w-4 h-4" /> Save Category
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="glass-card p-4 rounded-xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.bgClass} flex items-center justify-center border border-white/10`}>
                  {/* We just use a placeholder text or simplified icon for preview */}
                  <span className={cat.colorClass}>❖</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{cat.label}</h3>
                  <p className="text-xs text-slate-400">ID: {cat.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(cat)} className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/5">
          No custom categories added yet.
        </div>
      )}
    </div>
  );
}
