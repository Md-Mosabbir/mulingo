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
        {conversation?.name ?? "Conversation"}
      </p>
      <p className="mt-2 text-sm text-[#9CA3AF]">
        Sends messages in <span className="font-medium text-[#D1D5DB]">{conversation?.language ?? "English"}</span>
      </p>
    </div>
  );
}

function ChatPanel({ activeConversation, messages }) {
  const hasMessages = messages.length > 0;

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111926]">
      <ChatHeader name={activeConversation?.name ?? "Conversation"} />
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
    </section>
  );
}

export default ChatPanel;
