import { motion } from "framer-motion";

export default function InstagramLoader({
  className = "w-10 h-10",
}: {
  className?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className={`relative flex items-center justify-center ${className}`}>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
            padding: "3px",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
        />
        <img
          src="/icon.jpg"
          alt="Logo"
          className="w-1/2 h-1/2 rounded-full object-cover"
        />
      </div>
      <p className="text-white/60 text-sm font-medium mt-4 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
