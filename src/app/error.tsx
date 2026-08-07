"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Route Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 z-[999999] relative">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">ओह! कुछ गड़बड़ हो गई</h2>
          <p className="text-zinc-400 text-sm">
            माफ़ करें, इस पेज पर एक तकनीकी समस्या आ गई है (App Crashed). कृपया पेज को रीफ्रेश करें.
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                 window.location.href = '/dashboard';
              }
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            होम पर लौटें (Go to Home)
          </button>
          
          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/10 transition-colors"
          >
            पुनः प्रयास करें (Try Again)
          </button>
        </div>
      </div>
    </div>
  );
}
