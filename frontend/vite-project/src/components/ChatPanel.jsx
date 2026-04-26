import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";

function ChatPanel({ activeConversation, messages }) {
  return (
    <section className="flex min-h-[36rem] flex-col rounded-2xl border border-[#d5dde7] bg-[#f3f6f4]">
      <ChatHeader name={activeConversation?.name ?? "Conversation"} />
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      <MessageComposer />
    </section>
  );
}

export default ChatPanel;
