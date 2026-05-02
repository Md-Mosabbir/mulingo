import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import UserPickerModal from "./UserPickerModal";

function statusAccent(status) {
  if (status === "typing") return "text-[#7C3AED]";
  if (status === "unread") return "text-[#7C3AED]";
  return "text-[#9CA3AF]";
}

export default function ConversationList({
  conversations,
  activeKind,
  activeChatId,
  onSelect,
  onStartDm,
  loading,
}) {
  const [filterTab, setFilterTab] = useState("all"); // all | dm | group
  const [listQuery, setListQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filterTab === "dm" && c.kind !== "dm") return false;
      if (filterTab === "group" && c.kind !== "group") return false;
      if (!q) return true;
      const hay = `${c.displayName ?? ""} ${c.preview ?? ""} ${c.title ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, filterTab, listQuery]);

  const isActive = (c) => c.kind === activeKind && c.chatId === activeChatId;

  return (
    <>
      <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111926]">
        <div className="border-b border-[#1F2937] p-4 space-y-3">
          <input
            type="text"
            value={listQuery}
            onChange={(e) => setListQuery(e.target.value)}
            placeholder="Filter conversations..."
            className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff] placeholder:text-[#9CA3AF]"
          />
          <div className="flex rounded-xl bg-[#0B1120] p-1 border border-[#1F2937]">
            {[
              { id: "all", label: "All" },
              { id: "dm", label: "Direct" },
              { id: "group", label: "Groups" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                  filterTab === tab.id ? "bg-[#7b61ff] text-white shadow" : "text-[#9CA3AF] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-[#1F2937] px-4 py-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#1D153D] px-3 text-xs font-semibold text-white border border-[#3a2f70] hover:bg-[#251b52] transition-colors"
              title="Start direct message"
            >
              <MessageSquarePlus size={16} />
              <span className="hidden sm:inline">New DM</span>
            </button>
          </div>
        </div>

        <div className="chat-scrollbar flex-1 overflow-y-auto p-2">
          {loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#9CA3AF] text-sm gap-2">
              <div className="h-8 w-8 rounded-full border-2 border-[#7b61ff] border-t-transparent animate-spin" />
              Loading conversations…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-[#9CA3AF] text-sm gap-3">
              <Users className="h-10 w-10 opacity-40" />
              <p>No conversations match your filters.</p>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="rounded-full bg-[#7b61ff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6b52e0]"
              >
                Start a DM
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((conversation, index) => (
                <motion.div
                  key={conversation.key}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.22 }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.kind, conversation.chatId)}
                    className={`mb-2 flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition ${
                      isActive(conversation) ? "bg-[#1F2937] ring-1 ring-[#7b61ff]/40" : "hover:bg-[#1F2937]"
                    }`}
                  >
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1D153D] text-sm font-medium text-white shadow-sm">
                      {conversation.avatarUrl ? (
                        <img src={conversation.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        conversation.avatar
                      )}
                      {conversation.kind === "group" && (
                        <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#7b61ff] text-[9px] leading-4 text-center font-bold border border-[#111926]">
                          G
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="truncate text-[15px] font-semibold text-gray-200">
                          {conversation.displayName ?? conversation.title}
                        </p>
                        <span className="shrink-0 text-xs font-medium text-[#9ca3af]">{conversation.timeLabel}</span>
                      </div>
                      <p className={`truncate text-[13px] ${statusAccent(conversation.status)}`}>{conversation.preview}</p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      <UserPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelectUser={(u) => onStartDm?.(u)}
        title="Start a direct message"
      />
    </>
  );
}
