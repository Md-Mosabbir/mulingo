import { CirclePlus, House, LogOut, MessageCircleMore, Ticket } from "lucide-react";

const actions = [
  { id: "home", icon: House },
  { id: "add", icon: CirclePlus },
  { id: "messages", icon: MessageCircleMore, active: true },
  { id: "ticket", icon: Ticket },
];

function TopOptionBar() {
  return (
    <header className="flex items-center justify-between py-2 px-1 bg-[#111827] ">
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7b61ff] text-lg text-white"
        aria-label="Mulingo"
      >
        <img src="/favicon.svg" alt="Mulingo logo" className="h-7 w-7 object-contain" />
      </button>

      <nav className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition ${
              action.active
                ? "bg-[#7b61ff] text-white"
                : "bg-[#1D153D] text-[#D1D5DB] hover:bg-[#2a1f57]"
            }`}
            aria-label={action.id}
          >
            <action.icon size={18} strokeWidth={2.2} />
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3a2f70] bg-[#1D153D] text-[#FCA5A5]"
        aria-label="Logout"
      >
        <LogOut size={18} strokeWidth={2.2} />
      </button>
    </header>
  );
}

export default TopOptionBar;
