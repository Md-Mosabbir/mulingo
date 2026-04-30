import { Search, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

function statusAccent(status) {
  if (status === "typing") return "text-[#7C3AED]";
  if (status === "unread") return "text-[#7C3AED]";
  return "text-[#9CA3AF]";
}

function ConversationList({ conversations, activeId, onSelect, onStartConversation }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const token = localStorage.getItem("token");

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/search?username=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search error", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    if (onStartConversation) {
      onStartConversation(user);
    }
  };

  return (
    <>
      <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111926]">
        <div className="border-b border-[#1F2937] p-4">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff] placeholder:text-[#9CA3AF]"
          />
        </div>
        <div className="border-b border-[#1F2937] px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white transition-colors"
              aria-label="Search users"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="chat-scrollbar flex-1 overflow-y-auto p-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={`mb-2 flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition ${activeId === conversation.id ? "bg-[#1F2937]" : "hover:bg-[#1F2937]"
                }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1D153D] text-sm font-medium text-white shadow-sm">
                {conversation.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="truncate text-[15px] font-semibold text-gray-200">
                    {conversation.displayName ?? conversation.name}
                  </p>
                  <span className="shrink-0 text-xs font-medium text-[#9ca3af]">{conversation.time}</span>
                </div>
                <p className={`truncate text-[13px] ${statusAccent(conversation.status)}`}>
                  {conversation.preview}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111926] rounded-2xl border border-[#374151] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
              <h3 className="text-lg font-semibold text-white">Find Users</h3>
              <button
                onClick={() => setIsSearchOpen(false)}
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
                  placeholder="Type a username..."
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
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#1F2937] transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7b61ff] to-[#4c2af3] text-sm font-semibold text-white shadow-lg">
                        {user.username ? user.username.substring(0, 2).toUpperCase() : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {user.username}
                        </p>
                        {user.email && (
                          <p className="text-xs text-[#9CA3AF] truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-[#9CA3AF] text-sm">
                  No users found matching "{searchQuery}"
                </div>
              ) : (
                <div className="text-center py-8 text-[#9CA3AF] text-sm">
                  Start typing to find other users to chat with.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConversationList;
