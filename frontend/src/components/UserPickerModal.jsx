import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { searchUsersList } from "../api/mulingo";

export default function UserPickerModal({ open, onClose, onSelectUser, title = "Find users" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.trim() || "m";
        const rows = await searchUsersList(query, 20);
        setSearchResults(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error(e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchQuery, open]);

  function handlePick(user) {
    onSelectUser?.(user);
    onClose?.();
    setSearchQuery("");
    setSearchResults([]);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-picker-title"
            className="w-full max-w-md bg-[#111926] rounded-2xl border border-[#374151] shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
              <h3 id="user-picker-title" className="text-lg font-semibold text-white">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-[#9CA3AF] hover:text-white transition-colors p-1 rounded-md hover:bg-[#1F2937]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 border-b border-[#1F2937]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                <input
                  type="text"
                  placeholder="Search by username or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#374151] bg-[#1F2937] pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-[#7b61ff] placeholder:text-[#9CA3AF] transition-colors"
                  autoFocus
                />
              </div>
            </div>

            <div className="chat-scrollbar flex-1 overflow-y-auto max-h-[60vh] p-2 bg-[#0B1120]/50">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 text-[#9CA3AF]">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <p className="text-sm">Searching users...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <button
                      key={user.user_id}
                      type="button"
                      onClick={() => handlePick(user)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#1F2937] transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7b61ff] to-[#4c2af3] text-sm font-semibold text-white shadow-lg overflow-hidden">
                        {user.profile_picture ? (
                          <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (user.username || "?").substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{user.username}</p>
                        <p className="text-xs text-[#9CA3AF] truncate">
                          {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-[#9CA3AF] text-sm">No users found for "{searchQuery}"</div>
              ) : (
                <div className="text-center py-8 text-[#9CA3AF] text-sm">
                  No suggested users found. Start typing to search by username.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
