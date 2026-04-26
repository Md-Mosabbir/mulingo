function statusAccent(status) {
  if (status === "typing") return "text-[#7C3AED]";
  if (status === "unread") return "text-[#7C3AED]";
  return "text-[#9CA3AF]";
}

function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111926]">
      <div className="border-b border-[#1F2937] p-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-xl border border-[#374151] bg-[#1F2937] px-3 py-2 text-sm text-white outline-none focus:border-[#7b61ff] placeholder:text-[#9CA3AF]"
        />
      </div>
      <div className="border-b border-[#1F2937] px-4 py-3">
        <h2 className="text-lg font-semibold text-white">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={`mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
              activeId === conversation.id ? "bg-[#1F2937]" : "hover:bg-[#1F2937]"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D153D] text-xs text-white">
              {conversation.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-gray-200">{conversation.name}</p>
                <span className="shrink-0 text-xs text-[#9ca3af]">{conversation.time}</span>
              </div>
              <p className={`truncate text-xs ${statusAccent(conversation.status)}`}>
                {conversation.preview}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default ConversationList;
