import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { createGroup } from "../api/mulingo";

export default function CreateGroupModal({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const data = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      });
      onCreated?.(data);
      setName("");
      setImageUrl("");
      setDescription("");
      onClose?.();
    } catch (err) {
      setError(err.message || "Could not create group");
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
              <h2 className="text-lg font-semibold text-white">New group</h2>
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
                Create a multilingual group chat. You can add members and manage roles from the conversation details
                panel.
              </p>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
                  placeholder="e.g. Study group"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  Group image URL (optional)
                </label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                  Description (optional, not persisted by current DB)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff]"
                  placeholder="Shown only in the UI for demo / screenshots"
                />
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
                  {saving ? "Creating…" : "Create group"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
