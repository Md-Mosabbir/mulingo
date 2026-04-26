import PropertyPreviewCard from "./PropertyPreviewCard";

function MessageBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${isUser ? "max-w-md" : "max-w-2xl"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser ? "bg-[#7b61ff] text-white" : "bg-[#1F2937] text-white"
          }`}
        >
          {message.type === "property" ? (
            <PropertyPreviewCard text={message.text} stats={message.stats} photos={message.photos} />
          ) : (
            message.text
          )}
        </div>
        <p className={`mt-1 text-xs text-[#9ca3af] ${isUser ? "text-right" : "text-left"}`}>
          {message.time}
        </p>
      </div>
    </div>
  );
}

export default MessageBubble;
