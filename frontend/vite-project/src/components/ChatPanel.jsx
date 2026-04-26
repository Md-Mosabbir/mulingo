import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";

function ChatPanel({ activeConversation, messages }) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111926]">
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
