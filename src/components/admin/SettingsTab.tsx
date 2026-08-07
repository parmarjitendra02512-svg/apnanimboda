import { Shield, Monitor, Image as ImageIcon } from "lucide-react";

interface SettingsTabProps {
  youtubeApiKey: string;
  setYoutubeApiKey: (key: string) => void;
  savingYoutubeKey: boolean;
  handleSaveYoutubeApiKey: (e: React.FormEvent) => void;
  globalPrivacy: boolean;
  handleToggleGlobalPrivacy: () => void;
  features: Record<string, string>;
  handleChangeFeatureState: (key: string, state: string) => void;
  adType: string;
  setAdType: (type: string) => void;
  adTitle: string;
  setAdTitle: (title: string) => void;
  adDesc: string;
  setAdDesc: (desc: string) => void;
  adImageUrl: string;
  setAdImageUrl: (url: string) => void;
  adLink: string;
  setAdLink: (link: string) => void;
  savingAd: boolean;
  handleSaveAd: (e: React.FormEvent) => void;
  youtubeEmbed: string;
  setYoutubeEmbed: (url: string) => void;
  savingYoutube: boolean;
  handleSaveYoutube: (e: React.FormEvent) => void;
  handleBackup: () => void;
}

export default function SettingsTab({
  youtubeApiKey,
  setYoutubeApiKey,
  savingYoutubeKey,
  handleSaveYoutubeApiKey,
  globalPrivacy,
  handleToggleGlobalPrivacy,
  features,
  handleChangeFeatureState,
  adType,
  setAdType,
  adTitle,
  setAdTitle,
  adDesc,
  setAdDesc,
  adImageUrl,
  setAdImageUrl,
  adLink,
  setAdLink,
  savingAd,
  handleSaveAd,
  youtubeEmbed,
  setYoutubeEmbed,
  savingYoutube,
  handleSaveYoutube,
  handleBackup,
}: SettingsTabProps) {
  return (
    <div className="grid gap-6">
      <section className="glass-panel p-6 rounded-2xl border border-blue-500/20">
        <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> AI Settings (AINimboda) & Live News API
        </h2>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <h3 className="text-green-400 font-semibold text-sm">
              Secured by System Administrator
            </h3>
            <p className="text-slate-300 text-xs mt-1">
              API keys for AINimboda and News are now securely managed via
              Environment Variables. You no longer need to paste them here.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 rounded-2xl border border-sky-500/20">
        <h2 className="text-xl font-bold text-sky-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Live Weather & External APIs
        </h2>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <h3 className="text-green-400 font-semibold text-sm">
              Secured by System Administrator
            </h3>
            <p className="text-slate-300 text-xs mt-1">
              API keys for Weather, YouTube, and e-Documents (DigiLocker) are
              now securely managed via Environment Variables. You no longer need
              to paste them here.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6 rounded-2xl border border-red-500/20">
        <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> YouTube API Security Vault
        </h2>
        <form onSubmit={handleSaveYoutubeApiKey}>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm text-slate-400 mb-1 block">
                YouTube Data API v3 Key
              </label>
              <input
                type="password"
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value)}
                placeholder="Enter YouTube API Key..."
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <button
              disabled={savingYoutubeKey}
              type="submit"
              className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors disabled:opacity-50 shrink-0"
            >
              {savingYoutubeKey ? "Saving..." : "Save API Key"}
            </button>
          </div>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          Secured in backend vault. Used for the Admin SEO Tool.
        </p>
      </section>

      <section className="glass-panel p-6 rounded-2xl border border-orange-500/20">
        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Global Privacy Masking
        </h2>
        <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
          <div>
            <h3 className="text-white font-medium">Mask All User Data</h3>
            <p className="text-xs text-slate-400">
              If enabled, all user numbers and names will be displayed as `A***
              K***` for normal users.
            </p>
          </div>
          <button
            onClick={handleToggleGlobalPrivacy}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${globalPrivacy ? "bg-orange-500" : "bg-slate-600"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${globalPrivacy ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </section>

      <section className="glass-panel p-6 rounded-2xl border border-pink-500/20">
        <h2 className="text-xl font-bold text-pink-400 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Dashboard Feature Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "news", label: "Live News Button" },
            { key: "weather", label: "Live Weather Button" },
            { key: "reels", label: "Nimboda Reels Button" },
            { key: "edocs", label: "e-Documents Button" },
            { key: "pincode", label: "Pincode Search Button" },
            { key: "emitra", label: "e-Mitra Directory Button" },
            { key: "quiz", label: "Student Quiz Button" },
            { key: "youtube", label: "Public YouTube Box" },
            { key: "calling", label: "In-App Audio/Video Calling" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              <span className="font-medium text-white">{item.label}</span>
              <select
                value={features[item.key] || "active"}
                onChange={(e) =>
                  handleChangeFeatureState(item.key, e.target.value)
                }
                className="bg-black/50 border border-white/20 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2 outline-none"
              >
                <option value="active">🟢 Active (On)</option>
                <option value="pending">🟡 Pending (Maintenance)</option>
                <option value="hidden">🔴 Hidden (Off)</option>
              </select>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Toggle these switches to instantly hide or show buttons on the user
          dashboard.
        </p>
      </section>

      <section className="glass-panel p-6 rounded-2xl border border-pink-500/20">
        <h2 className="text-xl font-bold text-pink-400 mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" /> Landing Page Ad Banner
        </h2>
        <form onSubmit={handleSaveAd} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Ad Type</label>
            <select
              value={adType}
              onChange={(e) => setAdType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-4"
            >
              <option value="image">Image Only</option>
              <option value="video">Video (MP4 / YouTube URL)</option>
              <option value="text">Rich Text</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Title (Optional)
            </label>
            <input
              type="text"
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
              placeholder="Main Heading"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 mb-4"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Description (Optional)
            </label>
            <textarea
              value={adDesc}
              onChange={(e) => setAdDesc(e.target.value)}
              placeholder="Subtext or message"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 h-24 mb-4"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Media URL (Image / Video URL)
            </label>
            <input
              type="text"
              value={adImageUrl}
              onChange={(e) => setAdImageUrl(e.target.value)}
              placeholder="https://example.com/media.jpg"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 mb-4"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Click Link (Optional)
            </label>
            <input
              type="text"
              value={adLink}
              onChange={(e) => setAdLink(e.target.value)}
              placeholder="https://google.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 mb-4"
            />
          </div>
          <button
            disabled={savingAd}
            type="submit"
            className="px-6 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-500 transition-colors disabled:opacity-50 w-full sm:w-auto mt-2"
          >
            {savingAd ? "Saving..." : "Save Ad Settings"}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          Leave these empty to show the default beautiful village animations.
        </p>
      </section>

      <section className="glass-panel p-6 rounded-2xl border border-red-500/20">
        <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5" /> Featured YouTube Video
        </h2>
        <form onSubmit={handleSaveYoutube} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              YouTube URLs (Up to 10)
            </label>
            <textarea
              value={youtubeEmbed}
              onChange={(e) => setYoutubeEmbed(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 h-32 mb-4 font-mono text-sm"
            />
          </div>
          <button
            disabled={savingYoutube}
            type="submit"
            className="px-6 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {savingYoutube ? "Saving..." : "Save Videos"}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          Paste YouTube Video Links or Iframe codes (one per line). We will
          automatically extract the video IDs and create a Netflix-style
          carousel on the Dashboard!
        </p>
      </section>

      {/* Privacy & Cookie Management */}
      <section className="glass-panel p-6 rounded-2xl border border-orange-500/20">
        <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Privacy & Cookie Management
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
            <div>
              <h3 className="text-white font-medium">Require Cookie Consent</h3>
              <p className="text-sm text-slate-400">
                Ask users to accept cookies before tracking analytics.
              </p>
            </div>
            <div className="w-12 h-6 bg-orange-500 rounded-full flex items-center p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
            <div>
              <h3 className="text-white font-medium">Enforce GPS Tracking</h3>
              <p className="text-sm text-slate-400">
                Force users to allow location permissions for Village Network
                features.
              </p>
            </div>
            <div className="w-12 h-6 bg-orange-500 rounded-full flex items-center p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
            <div>
              <h3 className="text-white font-medium">
                Google Analytics Tracking
              </h3>
              <p className="text-sm text-slate-400">
                Enable or disable Google Analytics across the platform.
              </p>
            </div>
            <div className="w-12 h-6 bg-orange-500 rounded-full flex items-center p-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          These privacy settings immediately take effect for all new users to
          comply with global privacy laws.
        </p>
      </section>

      <section className="glass-panel p-6 rounded-2xl border border-purple-500/20">
        <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Data Backup & Security
        </h2>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">
              Download a secure copy of the entire database.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Passwords are automatically removed from the backup for security
              compliance.
            </p>
          </div>
          <button
            onClick={handleBackup}
            className="px-6 py-3 rounded-xl bg-purple-500/20 text-purple-400 font-medium hover:bg-purple-500/30 transition-colors whitespace-nowrap"
          >
            Download JSON Backup
          </button>
        </div>
      </section>
    </div>
  );
}
