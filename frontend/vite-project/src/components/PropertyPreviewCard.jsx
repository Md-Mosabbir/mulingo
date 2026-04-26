function PropertyPreviewCard({ text, stats, photos }) {
  return (
    <article className="mt-2 w-full max-w-xl rounded-2xl bg-[#111827] p-3 text-white">
      <p className="text-sm text-[#f3f4f6]">{text}</p>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white/95 p-3 text-[#111827]">
            <p className="text-xs text-[#6b7280]">{stat.label}</p>
            <p className="text-xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div
            key={photo}
            className={`flex h-16 items-center justify-center rounded-xl text-xs ${
              index === 0 ? "bg-[#7C3AED]/60" : index === 1 ? "bg-[#4b5563]" : "bg-[#9ca3af]"
            }`}
          >
            {photo}
          </div>
        ))}
      </div>
    </article>
  );
}

export default PropertyPreviewCard;
