interface SubCategorySelectorProps {
  selectedCategory: string | null;
  selectedSubCategory: string | null;
  setSelectedSubCategory: (sub: string | null) => void;
}

export default function SubCategorySelector({
  selectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
}: SubCategorySelectorProps) {
  if (selectedSubCategory) return null;

  if (selectedCategory === "services") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {[
          { id: "sarpanch", label: "Sarpanch", icon: "👑" },
          { id: "upsarpanch", label: "Up-Sarpanch", icon: "⭐" },
          { id: "ward", label: "Ward Panch", icon: "📝" },
          { id: "anganwadi", label: "Anganwadi", icon: "👶" },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubCategory(sub.id)}
            className="glass-card p-4 flex flex-col items-center justify-center gap-3 rounded-2xl hover:bg-white/10 transition-colors border border-purple-500/30"
          >
            <span className="text-3xl">{sub.icon}</span>
            <span className="font-bold text-white text-sm">{sub.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (selectedCategory === "student") {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { id: "school", label: "School (1-10)", icon: "🎒" },
          { id: "highschool", label: "High School (11-12)", icon: "📝" },
          { id: "college", label: "College / Univ", icon: "🏛️" },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubCategory(sub.id)}
            className="glass-card p-4 flex flex-col items-center justify-center gap-3 rounded-2xl hover:bg-white/10 transition-colors border border-pink-500/30"
          >
            <span className="text-3xl">{sub.icon}</span>
            <span className="font-bold text-white text-sm">{sub.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return null;
}
