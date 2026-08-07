import { motion } from "framer-motion";
import {
  Loader2,
  Users,
  Stethoscope,
  BookOpen,
  Store,
  Landmark,
  GraduationCap,
  Briefcase,
  Car,
  PenTool as Tool,
  Hammer,
  Cpu,
  ShoppingBag,
} from "lucide-react";
import TiltCard from "@/components/TiltCard";

export const categoriesList = [
  {
    id: "all",
    label: "All Villagers",
    span: "col-span-2 md:col-span-2 lg:col-span-2 row-span-2",
    icon: (
      <Users className="w-16 h-16 text-blue-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-2" />
    ),
    color:
      "bg-gradient-to-br from-blue-600/40 via-blue-800/30 to-blue-900/40 border-blue-500/30 hover:border-blue-400/70 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]",
  },
  {
    id: "doctor",
    label: "Doctors",
    span: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    icon: (
      <Stethoscope className="w-10 h-10 text-red-300 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
    ),
    color:
      "bg-gradient-to-br from-red-600/30 via-red-800/20 to-red-900/30 border-red-500/20 hover:border-red-400/60 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]",
  },
  {
    id: "teacher",
    label: "Teachers",
    span: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    icon: (
      <BookOpen className="w-10 h-10 text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
    ),
    color:
      "bg-gradient-to-br from-amber-500/30 via-orange-700/20 to-orange-800/30 border-amber-500/20 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]",
  },
  {
    id: "business",
    label: "Shops & Business",
    span: "col-span-2 md:col-span-2 lg:col-span-2 row-span-1",
    icon: (
      <Store className="w-12 h-12 text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] mr-2" />
    ),
    color:
      "bg-gradient-to-br from-emerald-600/30 via-green-800/20 to-emerald-900/30 border-emerald-500/20 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]",
    rowLayout: true,
  },
  {
    id: "services",
    label: "Panchayat",
    span: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    icon: (
      <Landmark className="w-10 h-10 text-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
    ),
    color:
      "bg-gradient-to-br from-purple-600/30 via-fuchsia-800/20 to-fuchsia-900/30 border-purple-500/20 hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]",
  },
  {
    id: "student",
    label: "Students",
    span: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    icon: (
      <GraduationCap className="w-10 h-10 text-pink-300 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
    ),
    color:
      "bg-gradient-to-br from-pink-600/30 via-rose-800/20 to-rose-900/30 border-pink-500/20 hover:border-pink-400/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]",
  },
];

interface CategoryGridProps {
  searchTerm: string;
  categoriesControl: any;
  setMaintenanceModal: (modal: {
    show: boolean;
    title: string;
    message: string;
  }) => void;
  onCategorySelect: (id: string) => void;
  triggerHaptic: (
    intensity?: "light" | "medium" | "heavy" | "success" | "error",
  ) => void;
  customCategories?: any[];
}

export default function CategoryGrid({
  searchTerm,
  categoriesControl,
  setMaintenanceModal,
  onCategorySelect,
  triggerHaptic,
  customCategories,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[120px] md:auto-rows-[140px]">
      {categoriesList
        .filter(
          (cat) =>
            !searchTerm ||
            cat.label.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((cat, idx) => {
          const catData = categoriesControl[cat.id] || {
            state: "active",
            lockMessage: "Pending",
          };
          const catState =
            catData.state || (catData.isLocked ? "pending" : "active");

          if (catState === "hidden") return null;

          return (
            <TiltCard key={cat.id} className={cat.span}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                onClick={() => {
                  triggerHaptic("medium");
                  if (catState === "pending") {
                    setMaintenanceModal({
                      show: true,
                      title: cat.label,
                      message:
                        catData.lockMessage ||
                        "This category is currently under maintenance.",
                    });
                    return;
                  }
                  onCategorySelect(cat.id);
                }}
                className={`w-full h-full flex ${cat.rowLayout ? "flex-row" : "flex-col"} items-center justify-center p-4 md:p-6 rounded-[2rem] border ultra-glass ${cat.color} hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}
              >
                {catState === "pending" && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 backdrop-blur-md">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div
                  className={`rounded-3xl bg-white/10 flex items-center justify-center mb-1 shadow-inner border border-white/20 z-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500 ${cat.rowLayout ? "w-20 h-20" : "w-16 h-16 md:w-20 md:h-20"}`}
                >
                  {cat.icon}
                </div>
                <span
                  className={`text-white font-bold text-center tracking-wide group-hover:text-white transition-colors z-10 drop-shadow-md ${cat.rowLayout ? "text-xl md:text-3xl" : "text-sm md:text-lg mt-2"}`}
                >
                  {cat.label}
                </span>
              </motion.div>
            </TiltCard>
          );
        })}

      {customCategories &&
        customCategories
          .filter(
            (cat) =>
              !searchTerm ||
              cat.label.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((cat, idx) => {
            let IconComp = Briefcase;
            if (cat.iconName === "Car") IconComp = Car;
            else if (cat.iconName === "Tool") IconComp = Tool;
            else if (cat.iconName === "Hammer") IconComp = Hammer;
            else if (cat.iconName === "Stethoscope") IconComp = Stethoscope;
            else if (cat.iconName === "Cpu") IconComp = Cpu;
            else if (cat.iconName === "Store") IconComp = Store;
            else if (cat.iconName === "ShoppingBag") IconComp = ShoppingBag;

            return (
              <TiltCard key={cat.id} className="col-span-1 md:col-span-1 lg:col-span-1 row-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (categoriesList.length + idx) * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  onClick={() => {
                    triggerHaptic("medium");
                    onCategorySelect(cat.id);
                  }}
                  className={`w-full h-full flex flex-col items-center justify-center p-4 md:p-6 rounded-[2rem] border ultra-glass bg-gradient-to-br ${cat.bgClass} hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className="rounded-3xl bg-white/10 flex items-center justify-center mb-1 shadow-inner border border-white/20 z-10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500 w-16 h-16 md:w-20 md:h-20">
                    <IconComp className={`w-10 h-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] ${cat.colorClass}`} />
                  </div>
                  <span className="text-white font-bold text-center tracking-wide group-hover:text-white transition-colors z-10 drop-shadow-md text-sm md:text-lg mt-2">
                    {cat.label}
                  </span>
                </motion.div>
              </TiltCard>
            );
          })}
    </div>
  );
}
