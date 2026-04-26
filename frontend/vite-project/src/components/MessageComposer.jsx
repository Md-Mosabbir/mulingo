function MessageComposer() {
  return (
    <footer className="border-t border-[#e5e7eb] p-3 md:p-4">
      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-[#e5e7eb]">
        <button type="button" className="text-[#9ca3af]" aria-label="Attach file">
          ⎘
        </button>
        <input
          type="text"
          placeholder="Write a Message"
          className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
        />
        <button
          type="button"
          className="rounded-full bg-[#111827] px-3 py-2 text-xs font-medium text-white"
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </footer>
  );
}

export default MessageComposer;
