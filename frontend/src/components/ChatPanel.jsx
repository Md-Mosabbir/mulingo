import { FileText, Image as ImageIcon, PlayCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";

function ConversationProfileIntro({ conversation, compact = false }) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? "mb-6 mt-1" : "h-full min-h-[260px] justify-center"}`}>
      <div
        className={`flex items-center justify-center rounded-full bg-linear-to-br from-[#7A5CF7] to-[#6648E5] font-semibold text-white shadow-lg ${
          compact ? "h-20 w-20 text-xl" : "h-24 w-24 text-2xl"
        }`}
      >
        {conversation?.avatar ?? "?"}
      </div>
      <p className={`font-semibold text-white ${compact ? "mt-4 text-xl" : "mt-5 text-2xl"}`}>
        {conversation?.displayName ?? conversation?.name ?? "Conversation"}
      </p>
      <p className="mt-2 text-sm text-[#9CA3AF]">
        Sends messages in <span className="font-medium text-[#D1D5DB]">{conversation?.language ?? "English"}</span>
      </p>
    </div>
  );
}

function sharedItemIcon(type) {
  if (type === "image") return ImageIcon;
  if (type === "video") return PlayCircle;
  return FileText;
}

function ChatPanel({ activeConversation, messages, onNicknameChange }) {
  const hasMessages = messages.length > 0;
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const sharedItems = useMemo(() => activeConversation?.sharedItems ?? [], [activeConversation]);

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111926]">
      <ChatHeader
        name={activeConversation?.displayName ?? activeConversation?.name ?? "Conversation"}
        avatar={activeConversation?.avatar}
        onToggleDetails={() => setIsDetailsOpen((prev) => !prev)}
        isDetailsOpen={isDetailsOpen}
      />
      <div className="chat-scrollbar flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {hasMessages ? (
          <>
            <ConversationProfileIntro conversation={activeConversation} compact />
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} conversation={activeConversation} />
            ))}
          </>
        ) : (
          <ConversationProfileIntro conversation={activeConversation} />
        )}
      </div>
      <MessageComposer />
      <div
        className={`absolute inset-0 z-20 bg-[#00000066] transition-opacity duration-300 ${
          isDetailsOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsDetailsOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 z-30 flex h-full w-full max-w-sm flex-col border-l border-[#2A3347] bg-[#0F1729] shadow-2xl transition-transform duration-300 ${
          isDetailsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#1F2937] px-4 py-3">
          <h3 className="text-sm font-semibold tracking-wide text-white">Conversation details</h3>
          <button
            type="button"
            className="rounded-full p-2 text-[#9CA3AF] transition hover:bg-[#1F2937] hover:text-white"
            onClick={() => setIsDetailsOpen(false)}
            aria-label="Close details panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="chat-scrollbar flex-1 overflow-y-auto p-4">
          <div className="rounded-2xl border border-[#273149] bg-[#141F35] p-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-[#8D73FF] to-[#6A4FE5] text-xl font-semibold text-white">
              {activeConversation?.avatar ?? "?"}
            </div>
            <p className="mt-3 text-center text-lg font-semibold text-white">
              {activeConversation?.displayName ?? activeConversation?.name ?? "Conversation"}
            </p>
            <p className="mt-1 text-center text-xs text-[#9CA3AF]">
              Original name: <span className="text-[#D1D5DB]">{activeConversation?.name ?? "Unknown"}</span>
            </p>
            <p className="mt-1 text-center text-xs text-[#9CA3AF]">
              Language: <span className="text-[#D1D5DB]">{activeConversation?.language ?? "English"}</span>
            </p>

            <div className="mt-4">
              <label htmlFor="nickname" className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={activeConversation?.nickname ?? ""}
                onChange={(event) => onNicknameChange?.(activeConversation?.id, event.target.value)}
                placeholder="Set a nickname"
                className="w-full rounded-xl border border-[#34415E] bg-[#0E1628] px-3 py-2 text-sm text-white outline-none transition placeholder:text-[#73809E] focus:border-[#7b61ff]"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#273149] bg-[#141F35] p-4">
            <p className="mb-3 text-sm font-semibold text-white">Shared media, files and videos</p>
            <div className="space-y-2">
              {sharedItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#33405D] bg-[#0E1628] px-3 py-4 text-center text-xs text-[#9CA3AF]">
                  No shared items yet.
                </p>
              ) : (
                sharedItems.map((item) => {
                  const ItemIcon = sharedItemIcon(item.type);
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-[#0E1628] px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <ItemIcon className="h-4 w-4 shrink-0 text-[#B7AAFF]" />
                        <p className="truncate text-sm text-[#E5E7EB]">{item.name}</p>
                      </div>
                      <span className="ml-2 shrink-0 text-xs uppercase tracking-wide text-[#8CA0C2]">{item.type}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default ChatPanel;
