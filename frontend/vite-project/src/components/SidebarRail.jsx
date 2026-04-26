const railItems = ["⌂", "⊕", "☰", "✉"];

function SidebarRail() {
  return (
    <aside className="hidden w-20 flex-col items-center rounded-2xl border border-[#d5dde7] bg-white p-3 lg:flex">
      <button
        type="button"
        className="mb-7 h-12 w-12 rounded-xl bg-[#111827] text-white"
        aria-label="brand"
      >
        ●●
      </button>

      <div className="flex flex-1 flex-col items-center gap-3">
        {railItems.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`h-10 w-10 rounded-full ${
              index === 3 ? "bg-[#111827] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
            }`}
            aria-label="rail action"
          >
            {item}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="h-10 w-10 rounded-full bg-[#111827] text-white"
        aria-label="exit"
      >
        ⤴
      </button>
    </aside>
  );
}

export default SidebarRail;
