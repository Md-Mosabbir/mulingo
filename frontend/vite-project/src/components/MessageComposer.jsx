function MessageComposer() {
  return (
    <footer className="border-t border-[#1F2937] p-3 md:p-4">
      <div className="flex items-center gap-2 rounded-xl bg-[#1F2937] px-3 py-2 shadow-sm ring-1 ring-[#374151]">
        <button type="button" className="text-[#9ca3af] hover:text-white" aria-label="Attach file">
          ⎘
        </button>
        <input
          type="text"
          placeholder="Write a Message"
          className="flex-1 border-none bg-transparent text-sm text-white outline-none placeholder:text-[#9ca3af]"
        />
        <button
          type="button"
          className="rounded-full bg-[#7b61ff] px-3 py-2 text-xs font-medium text-white hover:bg-[#6b52e0]"
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </footer>
  );
}

export default MessageComposer;
