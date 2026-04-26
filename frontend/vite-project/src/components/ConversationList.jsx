function statusAccent(status) {
  if (status === "typing") return "text-[#7C3AED]";
  if (status === "unread") return "text-[#7C3AED]";
  return "text-[#9CA3AF]";
}

function ConversationList({ conversations, activeId, onSelect }) {
  return (
    <section className="flex min-h-[36rem] flex-col rounded-2xl border border-[#d5dde7] bg-white">
      <div className="border-b border-[#eef2f7] p-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]"
        />
      </div>
      <div className="border-b border-[#eef2f7] px-4 py-3">
        <h2 className="text-lg font-semibold text-[#111827]">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={`mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
              activeId === conversation.id ? "bg-[#f5f3ff]" : "hover:bg-[#f8fafc]"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D153D] text-xs text-white">
              {conversation.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-[#111827]">{conversation.name}</p>
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
