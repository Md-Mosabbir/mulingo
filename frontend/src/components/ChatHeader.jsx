import { ArrowLeft, Menu, Search, Star } from "lucide-react";

export default function ChatHeader({
  name,
  avatar,
  avatarUrl,
  subtitle,
  isLive,
  messageSearch,
  onMessageSearchChange,
  starred,
  onToggleStar,
  showMobileBack,
  onMobileBack,
  onToggleDetails,
  isDetailsOpen,
}) {
  const liveParts =
    isLive && typeof subtitle === "string" && subtitle.startsWith("Live · ")
      ? { left: "Live", right: subtitle.replace(/^Live ·\s*/, "· ") }
      : null;

  return (
    <header className="flex flex-col gap-3 border-b border-[#1F2937] px-4 py-3 md:px-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {showMobileBack && (
          <button
            type="button"
            onClick={onMobileBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2937] text-white hover:bg-[#374151] transition-colors md:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#7b61ff] text-sm text-white">
          {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : avatar ?? "?"}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{name}</h3>
          <p className="truncate text-xs">
            {liveParts ? (
              <>
                <span className="text-emerald-400 font-semibold">{liveParts.left}</span>
                <span className="text-[#9CA3AF]">{` ${liveParts.right}`}</span>
              </>
            ) : (
              <span className="text-[#9CA3AF]">{subtitle || "—"}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <div className="relative w-full md:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={messageSearch}
            onChange={(e) => onMessageSearchChange?.(e.target.value)}
            placeholder="Search in loaded messages…"
            className="w-full rounded-xl border border-[#374151] bg-[#1F2937] py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-[#7b61ff] placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 text-[#9CA3AF]">
          <button
            type="button"
            onClick={onToggleStar}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              starred ? "bg-[#7b61ff] text-white" : "bg-[#1F2937] text-white hover:bg-[#374151]"
            }`}
            aria-label={starred ? "Unstar conversation" : "Star conversation"}
            title="Star locally for sorting"
          >
            <Star className={`h-5 w-5 ${starred ? "fill-current" : ""}`} />
          </button>

          <button
            type="button"
            onClick={onToggleDetails}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors ${
              isDetailsOpen ? "bg-[#7b61ff] hover:bg-[#6b52e0]" : "bg-[#1F2937] hover:bg-[#374151]"
            }`}
            aria-label="Open conversation details"
            aria-expanded={isDetailsOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
