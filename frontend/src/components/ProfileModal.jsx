import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { LANGUAGE_OPTIONS } from "../constants/languages";
import { updateMyProfileSelf } from "../api/mulingo";

export default function ProfileModal({ open, onClose, profile, onSaved }) {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [langId, setLangId] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile || !open) return;
    const dn = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || profile.username || "";
    setDisplayName(dn);
    setAvatarUrl(profile.profile_picture || "");
    setLangId(Number(profile.preferred_language_id) || 1);
    setError("");
  }, [profile, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateMyProfileSelf({
        display_name: displayName.trim() || undefined,
        preferred_language_id: langId,
        avatar_url: avatarUrl.trim() || undefined,
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-[#374151] bg-[#111926] shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-[#1F2937] px-4 py-3">
              <h2 className="text-lg font-semibold text-white">Your profile</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <p className="text-xs text-[#9CA3AF]">
                Display name is stored as your profile name. Your preferred language controls how incoming messages are
                translated for you.
              </p>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  Avatar image URL
                </label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  Preferred language
                </label>
                <select
                  value={langId}
                  onChange={(e) => setLangId(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
                >
                  {LANGUAGE_OPTIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label} ({l.code})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#374151] px-4 py-2 text-sm text-[#E5E7EB] hover:bg-[#1F2937] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#7b61ff] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b52e0] disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
