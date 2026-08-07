import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

interface ReelUploadModalProps {
  showUpload: boolean;
  setShowUpload: (show: boolean) => void;
  isAdmin: boolean;
  uploadFile: File | null;
  setUploadFile: (file: File | null) => void;
  songName: string;
  setSongName: (name: string) => void;
  caption: string;
  setCaption: (caption: string) => void;
  handleUpload: () => void;
  uploading: boolean;
  uploadProgress: number;
}

export default function ReelUploadModal({
  showUpload,
  setShowUpload,
  isAdmin,
  uploadFile,
  setUploadFile,
  songName,
  setSongName,
  caption,
  setCaption,
  handleUpload,
  uploading,
  uploadProgress,
}: ReelUploadModalProps) {
  if (!showUpload || !isAdmin) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
          <button
            onClick={() => setShowUpload(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📸 पोस्ट या 🎬 वीडियो रील अपलोड करें
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                फोटो या वीडियो चुनें (JPG, PNG, MP4, WEBM)
              </label>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 bg-black/50 border border-white/10 rounded-xl p-2 text-xs"
              />
              {uploadFile && (
                <p className="text-[11px] text-amber-300 mt-1">
                  चयनित प्रकार:{" "}
                  {uploadFile.type.startsWith("image/")
                    ? "🖼️ फोटो (Photo Reel)"
                    : "🎬 वीडियो (Video Reel)"}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                गाना / ऑडियो शीर्षक (Music Title)
              </label>
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="उदा. Kesariya Balam / Marwadi Folk..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                कैप्शन / विवरण (Caption)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="पोस्ट का विवरण व हैशटैग लिखें..."
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !uploadFile}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {`अपलोडिंग ${Math.round(uploadProgress)}%`}
                </>
              ) : (
                "रील पोस्ट करें"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
