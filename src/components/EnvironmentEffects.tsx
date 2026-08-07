"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function EnvironmentEffects() {
  const [elements, setElements] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate fewer fireflies and leaves to prevent mobile lag
    const newElements = Array.from({ length: 8 }).map((_, i) => {
      const isLeaf = Math.random() > 0.5;
      return {
        id: i,
        type: isLeaf ? "leaf" : "firefly",
        x: Math.random() * 100, // percentage
        y: Math.random() * -20, // start above screen for leaves, random for fireflies
        startY: isLeaf ? -20 : Math.random() * 100,
        duration: isLeaf ? 20 + Math.random() * 10 : 8 + Math.random() * 5,
        delay: Math.random() * 5,
        size: isLeaf ? 15 + Math.random() * 10 : 4 + Math.random() * 4,
        opacity: isLeaf ? 0.2 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4,
      };
    });
    setElements(newElements);
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className={`absolute flex items-center justify-center ${el.type === "firefly" ? "rounded-full bg-amber-300 shadow-[0_0_10px_3px_rgba(252,211,77,0.8)]" : ""}`}
          style={{
            width: el.size,
            height: el.size,
            left: `${el.x}%`,
            top: `${el.startY}%`,
            opacity: el.opacity,
          }}
          animate={
            el.type === "leaf"
              ? {
                  y: ["0vh", "120vh"],
                  x: [`${el.x}%`, `${el.x + (Math.random() * 30 - 15)}%`],
                  rotate: [0, 720],
                }
              : {
                  y: [
                    `${el.startY}vh`,
                    `${el.startY + (Math.random() * 20 - 10)}vh`,
                    `${el.startY}vh`,
                  ],
                  x: [
                    `${el.x}%`,
                    `${el.x + (Math.random() * 10 - 5)}%`,
                    `${el.x}%`,
                  ],
                  opacity: [el.opacity, el.opacity * 0.2, el.opacity],
                }
          }
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut",
          }}
        >
          {el.type === "leaf" && (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-emerald-500/40 w-full h-full drop-shadow-lg"
            >
              <path d="M17.38 2.13C17.34 2.1 14.88.5 10 3.19C6 5.37 3.33 9.4 3 14.5c0 0-1.83.6-2.5 1.5-.72.96 0 1.5.5 1.5h1s.29 2 2 2h1.5l1.64-2.86c.15.53.37 1.05.66 1.53 1.94 3.2 5.96 4.3 8.44 2.72 1.63-.98 2.65-2.8 2.76-4.9.11-2.09-.72-4.04-2.22-5.32 1.25-1.46 1.87-3.4 1.72-5.41-.12-2.11-.92-3.34-1.12-3.63z" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
