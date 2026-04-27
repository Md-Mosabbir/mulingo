import { FileText, Search, Star } from "lucide-react";

function ChatHeader({ name }) {
  return (
    <header className="flex items-center justify-between border-b border-[#1F2937] px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7b61ff] text-sm text-white">
          AJ
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{name}</h3>
          <p className="text-xs text-[#10b981]">Online</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[#9CA3AF]">
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2937] text-white hover:bg-[#374151]">
          <Star className="h-5 w-5" />
        </button>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2937] text-white hover:bg-[#374151]">
          <Search className="h-5 w-5" />
        </button>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2937] text-white hover:bg-[#374151]">
          <FileText className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
