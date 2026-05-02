import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import GroupManagePanel from "./GroupManagePanel";
import { languageLabelById } from "../constants/languages";

function ConversationProfileIntro({ conversation, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center text-center ${compact ? "mb-6 mt-1" : "h-full min-h-[260px] justify-center"}`}
    >
      <div
        className={`flex items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#7A5CF7] to-[#6648E5] font-semibold text-white shadow-lg ${
          compact ? "h-20 w-20 text-xl" : "h-24 w-24 text-2xl"
        }`}
      >
        {conversation?.avatarUrl ? (
          <img src={conversation.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          conversation?.avatar ?? "?"
        )}
      </div>
      <p className={`font-semibold text-white ${compact ? "mt-4 text-xl" : "mt-5 text-2xl"}`}>
        {conversation?.displayName ?? conversation?.name ?? "Conversation"}
      </p>
      <p className="mt-2 text-sm text-[#9CA3AF]">
        {conversation?.kind === "group" ? (
          <>
            Group chat ·{" "}
            <span className="font-medium text-[#D1D5DB]">{conversation?.language ?? "Multiple languages"}</span>
          </>
        ) : (
          <>
            Sends in{" "}
            <span className="font-medium text-[#D1D5DB]">{conversation?.language ?? "their language"}</span>
          </>
        )}
      </p>
    </div>
  );
}

export default function ChatPanel({
  activeConversation,
  activeKind,
  messages,
  allMessagesCount,
  messagesLoading,
  loadingOlder,
  hasMoreMessages,
  onLoadOlder,
  currentUserId,
  chatMeta,
  subtitle,
  isLive,
  sendError,
  onDismissError,
  onNicknameChange,
  onSend,
  onTyping,
  composerDisabled,
  composerLangId,
  onComposerLangChange,
  messageSearch,
  onMessageSearchChange,
  isFavorite,
  onToggleFavorite,
  onRefreshGroupDetail,
  isMuted,
  isMobile,
  onMobileBack,
}) {
  const hasMessages = messages.length > 0;
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const scrollRef = useRef(null);
  const pendingScrollRestore = useRef(null);
  const wasLoadingOlder = useRef(false);
  const shouldStickToBottom = useRef(true);
  const prevMsgCount = useRef(0);

  useEffect(() => {
    if (!activeConversation?.chatId) setIsDetailsOpen(false);
  }, [activeConversation?.chatId]);

  /** Scroll to bottom when switching chats or first load */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messagesLoading) return;
    el.scrollTop = el.scrollHeight;
    shouldStickToBottom.current = true;
    prevMsgCount.current = messages.length;
  }, [activeConversation?.chatId, messagesLoading, messages.length]);

  function handleScroll(e) {
    const el = e.target;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    shouldStickToBottom.current = distanceFromBottom < 120;
    if (el.scrollTop < 70 && hasMoreMessages && !loadingOlder && !messagesLoading) {
      pendingScrollRestore.current = { prevHeight: el.scrollHeight, prevTop: el.scrollTop };
      onLoadOlder?.();
    }
  }

  useEffect(() => {
    const el = scrollRef.current;
    const snap = pendingScrollRestore.current;
    if (wasLoadingOlder.current && !loadingOlder && el && snap) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - snap.prevHeight + snap.prevTop;
        pendingScrollRestore.current = null;
      });
    }
    wasLoadingOlder.current = loadingOlder;
  }, [messages, loadingOlder]);

  // Auto-scroll when new messages arrive, but only if user is already near the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messagesLoading || loadingOlder) {
      prevMsgCount.current = messages.length;
      return;
    }

    const nextCount = messages.length;
    const grew = nextCount > prevMsgCount.current;
    prevMsgCount.current = nextCount;

    if (!grew) return;
    if (!shouldStickToBottom.current) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, messagesLoading, loadingOlder]);

  const dmParticipants = useMemo(() => {
    if (chatMeta?.kind !== "dm") return [];
    return chatMeta.participants || [];
  }, [chatMeta]);

  const memberLookupName = useMemo(() => {
    const map = new Map();
    if (chatMeta?.kind === "group") {
      (chatMeta.members || []).forEach((m) => map.set(m.user_id, m.username));
    }
    if (chatMeta?.kind === "dm") {
      (chatMeta.participants || []).forEach((p) => map.set(p.user_id, p.username));
    }
    return map;
  }, [chatMeta]);

  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111926]">
      <ChatHeader
        name={activeConversation?.displayName ?? activeConversation?.name ?? "Conversation"}
        avatar={activeConversation?.avatarUrl ? null : activeConversation?.avatar}
        avatarUrl={activeConversation?.avatarUrl}
        subtitle={subtitle}
        isLive={isLive}
        messageSearch={messageSearch}
        onMessageSearchChange={onMessageSearchChange}
        starred={isFavorite}
        onToggleStar={onToggleFavorite}
        showMobileBack={Boolean(isMobile && onMobileBack && activeConversation?.chatId)}
        onMobileBack={onMobileBack}
        onToggleDetails={() => setIsDetailsOpen((prev) => !prev)}
        isDetailsOpen={isDetailsOpen}
      />

      {sendError && (
        <div className="flex items-center justify-between gap-2 border-b border-[#7f1d1d]/40 bg-[#450a0a]/80 px-4 py-2 text-xs text-red-100">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-300" />
            <span className="truncate">{sendError}</span>
          </div>
          <button type="button" onClick={onDismissError} className="shrink-0 text-red-200 hover:text-white underline">
            Dismiss
          </button>
        </div>
      )}

      {isMuted && (
        <div className="border-b border-amber-900/40 bg-amber-950/40 px-4 py-2 text-xs text-amber-100">
          You are muted in this chat and cannot send messages.
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="chat-scrollbar flex-1 overflow-y-auto px-4 py-4 md:px-6"
      >
        {loadingOlder && (
          <div className="mb-3 text-center text-[11px] text-[#9CA3AF] animate-pulse">Loading older messages…</div>
        )}
        {messagesLoading ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 text-[#9CA3AF] text-sm">
            <div className="h-8 w-8 rounded-full border-2 border-[#7b61ff] border-t-transparent animate-spin" />
            Loading messages…
          </div>
        ) : hasMessages ? (
          <>
            <ConversationProfileIntro conversation={activeConversation} compact />
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                  <MessageBubble
                    message={message}
                    conversation={activeConversation}
                    isGroup={activeKind === "group"}
                    senderDisplayName={
                      message.sender === "other"
                        ? memberLookupName.get(message.sender_id) || message.senderUsername || "Member"
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        ) : (
          <ConversationProfileIntro conversation={activeConversation} />
        )}

        {!messagesLoading && !hasMessages && (
          <p className="mt-6 text-center text-xs text-[#6B7280]">
            Say hello — your text is stored once and friends read it in their preferred language.
          </p>
        )}
      </div>

      <MessageComposer
        onSend={onSend}
        onTyping={onTyping}
        disabled={composerDisabled}
        sendLangId={composerLangId}
        onSendLangChange={onComposerLangChange}
      />

      <div
        className={`absolute inset-0 z-20 bg-[#00000066] transition-opacity duration-300 ${
          isDetailsOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsDetailsOpen(false)}
      />
      <aside
        className={`absolute right-0 top-0 z-30 flex h-full w-full max-w-sm flex-col border-l border-[#2A3347] bg-[#0F1729] shadow-2xl transition-transform duration-300 ease-out ${
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
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-[#8D73FF] to-[#6A4FE5] text-xl font-semibold text-white">
              {activeConversation?.avatarUrl ? (
                <img src={activeConversation.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                activeConversation?.avatar ?? "?"
              )}
            </div>
            <p className="mt-3 text-center text-lg font-semibold text-white">
              {activeConversation?.displayName ?? activeConversation?.name ?? "Conversation"}
            </p>
            <p className="mt-1 text-center text-xs text-[#9CA3AF]">
              Original title: <span className="text-[#D1D5DB]">{activeConversation?.name ?? "Unknown"}</span>
            </p>

            <div className="mt-4">
              <label htmlFor="nickname" className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                Nickname (local)
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

          {activeKind === "dm" && dmParticipants.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[#273149] bg-[#141F35] p-4">
              <p className="mb-3 text-sm font-semibold text-white">Participants</p>
              <ul className="space-y-2">
                {dmParticipants.map((p) => (
                  <li key={p.user_id} className="flex justify-between gap-2 text-xs text-[#E5E7EB]">
                    <span className="truncate font-medium">{p.username}</span>
                    <span className="shrink-0 text-[#9CA3AF]">
                      Prefers {languageLabelById(p.preferred_language_id)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeKind === "group" && activeConversation?.chatId && chatMeta?.kind === "group" && (
            <div className="mt-5">
              <GroupManagePanel
                groupId={activeConversation.chatId}
                groupName={chatMeta.title || activeConversation.name}
                groupImage={chatMeta.image}
                members={chatMeta.members || []}
                currentUserId={currentUserId}
                myRole={chatMeta.myRole}
                onRefresh={onRefreshGroupDetail}
              />
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-[#273149] bg-[#141F35] p-4">
            <p className="mb-1 text-sm font-semibold text-white">About translations</p>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Messages are saved once with a source language. Everyone sees them translated into their preferred
              language. Toggle “See original” on incoming bubbles when a translation differs from the source.
            </p>
            {Boolean(messageSearch?.trim()) && (
              <p className="mt-3 text-[11px] text-[#93C5FD]">
                Filtering {messages.length} of {allMessagesCount} loaded messages.
              </p>
            )}
          </div>
        </div>
      </aside>
    </section>
  );
}
