function ChatHeader({ name }) {
  return (
    <header className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D153D] text-sm text-white">
          AJ
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#111827]">{name}</h3>
          <p className="text-xs text-[#10b981]">Online</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[#6b7280]">
        <button type="button" className="rounded-full bg-[#f3f4f6] px-2 py-1 text-xs">
          ☆
        </button>
        <button type="button" className="rounded-full bg-[#f3f4f6] px-2 py-1 text-xs">
          ⌕
        </button>
        <button type="button" className="rounded-full bg-[#f3f4f6] px-2 py-1 text-xs">
          📄
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
